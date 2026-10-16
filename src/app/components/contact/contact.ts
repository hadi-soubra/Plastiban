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
import { FormsModule, NgForm } from '@angular/forms';
import type * as Leaflet from 'leaflet';
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

/** Street level: close enough to pick out the building and the roads to it. */
const FOCUS_ZOOM = 16;

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
      email: 'info@plastiban.com',
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
      phones: ['+971 56 201 1416', '+971 6 678 7441'],
      email: 'info@plastiban.com',
      mapUrl: 'https://maps.app.goo.gl/dqy3dFuh3swR2pY17',
      lat: 25.5378941,
      lng: 55.7026024,
    },
  ];

  private readonly mapContainer = viewChild<ElementRef<HTMLDivElement>>('map');
  private map?: Leaflet.Map;
  private destroyed = false;
  private resizeObserver?: ResizeObserver;
  private markers: Array<{ marker: Leaflet.Marker; office: OfficeLocation }> = [];
  private resetButton?: HTMLButtonElement;
  private fitView?: () => void;

  /** The office the map has zoomed in on, if any; it shows the Google Maps button. */
  protected readonly focusedOffice = signal<OfficeLocation | null>(null);

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
      // Label widths differ per language, so the default view is refitted too -
      // unless an office is zoomed in on, which the labels do not affect.
      if (!this.focusedOffice()) {
        this.fitView?.();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.resizeObserver?.disconnect();
    this.map?.remove();
  }

  /**
   * Leaflet is fetched here rather than imported up front: the map sits at the
   * very end of the page, and leaving it out of the initial bundle gets the hero
   * on screen sooner. The library is CommonJS, so the namespace arrives as the
   * module's default export.
   */
  private async initMap(): Promise<void> {
    const el = this.mapContainer()?.nativeElement;
    if (!el) {
      return;
    }
    const module = await import('leaflet');
    const L = (module as { default?: typeof Leaflet }).default ?? module;
    if (this.destroyed) {
      return;
    }

    const map = L.map(el, {
      scrollWheelZoom: true,
      zoomControl: false,
      attributionControl: false,
      // Fractional zoom lets the default view hug both offices and their labels
      // instead of snapping out a whole level.
      zoomSnap: 0.25,
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

      // The pin and its label both zoom in on the office. Opening Google Maps
      // is then a deliberate second step, through the button that appears,
      // rather than a tap that throws the visitor out of the site.
      const focus = (): void => this.focusOffice(office);
      marker.on('click', focus);

      const tooltipEl = marker.getTooltip()?.getElement();
      if (tooltipEl) {
        tooltipEl.style.cursor = 'pointer';
        L.DomEvent.disableClickPropagation(tooltipEl);
        L.DomEvent.on(tooltipEl, 'click', focus);
      }

      return marker;
    });

    this.markers = markers.map((marker, index) => ({ marker, office: this.offices[index] }));

    // Show both offices at once — a wide regional view of Lebanon and the U.A.E.
    // Labels hang off the right of each pin, so pad that side by the widest
    // label (measured live, since it changes with the language) to keep every
    // pin and label fully on screen.
    const bounds = L.featureGroup(markers).getBounds();
    const fit = (): Leaflet.Map => {
      const labelWidth = Math.max(
        0,
        ...markers.map((m) => m.getTooltip()?.getElement()?.offsetWidth ?? 0),
      );
      return map.fitBounds(bounds, {
        paddingTopLeft: [32, 40],
        paddingBottomRight: [labelWidth + 40, 56],
      });
    };
    fit();
    this.fitView = fit;

    // A tap on open map is a way back out to the overview. The labels are
    // interactive tooltips, and Leaflet passes their clicks on to the map as
    // well, so those are told apart by where they landed - otherwise tapping a
    // label would zoom in and straight back out again.
    map.on('click', (event: Leaflet.LeafletMouseEvent) => {
      const target = event.originalEvent.target as Element | null;
      if (this.focusedOffice() && !target?.closest('.leaflet-tooltip, .leaflet-marker-icon')) {
        this.resetMapView();
      }
    });

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
        L.DomEvent.on(button, 'click', () => this.resetMapView());
        this.resetButton = button;
        return container;
      },
    });
    new ResetViewControl({ position: 'bottomright' }).addTo(map);

    // The map sits in a flex container whose height tracks the viewport on
    // desktop; keep Leaflet's canvas sized correctly as that height changes.
    this.resizeObserver = new ResizeObserver(() => {
      map.invalidateSize({ animate: false });
      const office = this.focusedOffice();
      if (office) {
        map.setView([office.lat, office.lng], FOCUS_ZOOM, { animate: false });
      } else {
        fit();
      }
    });
    this.resizeObserver.observe(el);
  }

  /** Flies the map in on one office and offers the Google Maps link for it. */
  private focusOffice(office: OfficeLocation): void {
    this.focusedOffice.set(office);
    this.map?.flyTo([office.lat, office.lng], FOCUS_ZOOM, { duration: 1.2 });
  }

  /**
   * Back to the overview of both offices, from wherever the map is - zoomed in
   * on an office or panned and zoomed by hand.
   */
  private resetMapView(): void {
    this.focusedOffice.set(null);
    this.fitView?.();
  }

  /** Phone numbers are displayed spaced but must dial unspaced. */
  protected telHref(phone: string): string {
    return `tel:${phone.replace(/\s+/g, '')}`;
  }

  /** At least one contact method — email or phone — must be provided. */
  protected hasContactMethod(): boolean {
    return !!(this.model.email.trim() || this.model.phone.trim());
  }

  async onSubmit(form: NgForm): Promise<void> {
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
    //
    // resetForm rather than blanking the model by hand: it also clears the
    // submitted and touched flags. Emptying the values alone leaves those set,
    // so the "enter a phone or an email" error immediately fires against the
    // freshly cleared fields — an error sitting directly under the success
    // message.
    this.state.set('sent');
    form.resetForm({
      name: '',
      email: '',
      phone: '',
      message: '',
      office: DEFAULT_OFFICE,
      company: '',
    });
  }
}
