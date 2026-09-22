import {
  Component,
  ElementRef,
  OnDestroy,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { RevealDirective } from '../../directives/reveal.directive';
import { TranslationService } from '../../i18n/translation.service';
import { ContactService, SubmitFailure } from './contact.service';

type OfficeId = 'lb' | 'ae';

/** Lebanon is the head office, so an untouched form is addressed there. */
const DEFAULT_OFFICE: OfficeId = 'lb';

interface ContactModel {
  name: string;
  email: string;
  phone: string;
  message: string;
  /** Which of the two offices the message is addressed to. */
  office: OfficeId;
  /** Honeypot — hidden from people, irresistible to form-filling bots. */
  company: string;
}

/** Where the form is in the send cycle; drives the button and the status line. */
type SubmitState = 'idle' | 'sending' | 'sent' | 'error';

interface OfficeLocation {
  id: OfficeId;
  nameKey: string;
  addressKey: string;
  labelKey: string;
  /** Short country name — the office card carries the full legal entity. */
  pickerKey: string;
  phones: string[];
  email: string;
  mapUrl: string;
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-contact',
  imports: [FormsModule, RevealDirective],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact implements OnDestroy {
  protected readonly i18n = inject(TranslationService);
  private readonly contact = inject(ContactService);

  protected readonly model: ContactModel = {
    name: '',
    email: '',
    phone: '',
    message: '',
    office: DEFAULT_OFFICE,
    company: '',
  };
  protected readonly state = signal<SubmitState>('idle');
  /** Which failure message to show; only meaningful while state is 'error'. */
  private readonly failure = signal<SubmitFailure>('failed');

  protected readonly errorKey = computed(() =>
    this.failure() === 'rate_limited' ? 'contact.form.errorRateLimited' : 'contact.form.error',
  );

  protected readonly offices: OfficeLocation[] = [
    {
      id: 'lb',
      nameKey: 'contact.office.lb.name',
      addressKey: 'contact.office.lb.address',
      labelKey: 'contact.office.lb.label',
      pickerKey: 'contact.form.office.lb',
      phones: ['+961 3 227 144', '+961 1 810 454'],
      email: 'info@plastiban.me',
      mapUrl: 'https://maps.app.goo.gl/7RyMES2T4T7TeLbi7',
      lat: 33.887421,
      lng: 35.47873,
    },
    {
      id: 'ae',
      nameKey: 'contact.office.ae.name',
      addressKey: 'contact.office.ae.address',
      labelKey: 'contact.office.ae.label',
      pickerKey: 'contact.form.office.ae',
      phones: ['+971 56 201 1416'],
      email: 'uae@plastiban.me',
      mapUrl: 'https://maps.app.goo.gl/dqy3dFuh3swR2pY17',
      lat: 25.5378941,
      lng: 55.7026024,
    },
  ];

  private readonly mapContainer = viewChild<ElementRef<HTMLDivElement>>('map');
  private map?: L.Map;
  private resizeObserver?: ResizeObserver;
  private markers: Array<{ marker: L.Marker; office: OfficeLocation }> = [];
  private resetButton?: HTMLButtonElement;

  constructor() {
    afterNextRender(() => this.initMap());

    // Map chrome lives outside Angular's template, so it is re-labelled by hand
    // whenever the language changes.
    effect(() => {
      this.i18n.lang(); // dependency: re-label on every language change
      for (const { marker, office } of this.markers) {
        marker.setTooltipContent(this.i18n.t(office.labelKey));
        marker.options.title = this.i18n.t(office.labelKey);
      }
      if (this.resetButton) {
        const label = this.i18n.t('contact.map.reset');
        this.resetButton.title = label;
        this.resetButton.setAttribute('aria-label', label);
      }
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.map?.remove();
  }

  private initMap(): void {
    const el = this.mapContainer()?.nativeElement;
    if (!el) {
      return;
    }

    const map = L.map(el, {
      scrollWheelZoom: true,
      zoomControl: false,
      attributionControl: false,
    });
    this.map = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    const icon = L.divIcon({
      className: '',
      html:
        // Deep royal (--color-royal-600). Hardcoded because Leaflet builds this
        // marker as a raw HTML string outside Angular/Tailwind, so it can't read
        // the theme token — keep this in sync if the accent changes.
        '<span style="display:block;width:20px;height:20px;border-radius:9999px;' +
        'background:#3055c8;border:3px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,.5);cursor:pointer"></span>',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    const markers = this.offices.map((office) => {
      const label = this.i18n.t(office.labelKey);
      const marker = L.marker([office.lat, office.lng], { icon, title: label }).addTo(map);
      marker.bindTooltip(label, {
        permanent: true,
        direction: 'right',
        offset: [12, 0],
        className: 'plastiban-map-tooltip',
        interactive: true,
      });

      // Clicking the pin or its label both open that exact location in Google Maps.
      const openInMaps = (): void => {
        window.open(office.mapUrl, '_blank', 'noopener');
      };
      marker.on('click', openInMaps);

      const tooltipEl = marker.getTooltip()?.getElement();
      if (tooltipEl) {
        tooltipEl.style.cursor = 'pointer';
        L.DomEvent.disableClickPropagation(tooltipEl);
        L.DomEvent.on(tooltipEl, 'click', openInMaps);
      }

      return marker;
    });

    this.markers = markers.map((marker, index) => ({ marker, office: this.offices[index] }));

    // Show both offices at once — a wide regional view of Lebanon and the U.A.E.
    const bounds = L.featureGroup(markers).getBounds();
    const fit = (): L.Map => map.fitBounds(bounds, { padding: [40, 40] });
    fit();

    const label = this.i18n.t('contact.map.reset');
    const ResetViewControl = L.Control.extend({
      onAdd: (): HTMLElement => {
        const container = L.DomUtil.create('div', 'leaflet-bar plastiban-reset-control');
        const button = L.DomUtil.create('button', '', container);
        button.type = 'button';
        button.title = label;
        button.setAttribute('aria-label', label);
        button.innerHTML =
          '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M9 3H3v6M15 3h6v6M21 15v6h-6M3 15v6h6" />' +
          '</svg>';
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.on(button, 'click', () => fit());
        this.resetButton = button;
        return container;
      },
    });
    new ResetViewControl({ position: 'bottomright' }).addTo(map);

    // The map sits in a flex container whose height tracks the viewport on
    // desktop; keep Leaflet's canvas sized correctly as that height changes.
    this.resizeObserver = new ResizeObserver(() => {
      map.invalidateSize({ animate: false });
      fit();
    });
    this.resizeObserver.observe(el);
  }

  /** Phone numbers are displayed spaced but must dial unspaced. */
  protected telHref(phone: string): string {
    return `tel:${phone.replace(/\s+/g, '')}`;
  }

  /** At least one contact method — email or phone — must be provided. */
  protected hasContactMethod(): boolean {
    return !!(this.model.email.trim() || this.model.phone.trim());
  }

  async onSubmit(): Promise<void> {
    if (this.state() === 'sending') {
      return;
    }
    this.state.set('sending');

    try {
      await this.contact.send({ ...this.model });
    } catch (failure) {
      this.failure.set(failure as SubmitFailure);
      this.state.set('error');
      return;
    }

    // Nothing is stored anywhere but the email that was just sent, so the form
    // is only cleared once the send is known to have succeeded — a failure
    // leaves everything typed in place to retry.
    this.state.set('sent');
    this.model.name = '';
    this.model.email = '';
    this.model.phone = '';
    this.model.message = '';
    this.model.office = DEFAULT_OFFICE;
  }
}
