import {
  Component,
  ElementRef,
  OnDestroy,
  afterNextRender,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';

interface ContactModel {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface OfficeLocation {
  name: string;
  address: string;
  phones: string[];
  email: string;
  label: string;
  mapUrl: string;
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-contact',
  imports: [FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact implements OnDestroy {
  protected readonly model: ContactModel = { name: '', email: '', phone: '', message: '' };
  protected readonly submitted = signal(false);

  protected readonly offices: OfficeLocation[] = [
    {
      name: 'Plastiban Technical Industry S.A.R.L',
      address: 'Ain al Tineh - Sakiat al Janzir, Beirut, Lebanon',
      phones: ['+961 3 227 144', '+961 1 810 454'],
      email: 'info@plastiban.me',
      label: 'Ain al Tineh, Beirut',
      mapUrl: 'https://maps.app.goo.gl/7RyMES2T4T7TeLbi7',
      lat: 33.887421,
      lng: 35.47873,
    },
    {
      name: 'Plastiban Packaging Factory L.L.C',
      address: 'New Industrial Area - Umm Al Quwain, United Arab Emirates',
      phones: ['+971 56 201 1416'],
      email: 'uae@plastiban.me',
      label: 'Umm Al Quwain, U.A.E.',
      mapUrl: 'https://maps.app.goo.gl/dqy3dFuh3swR2pY17',
      lat: 25.5378941,
      lng: 55.7026024,
    },
  ];

  private readonly mapContainer = viewChild<ElementRef<HTMLDivElement>>('map');
  private map?: L.Map;
  private resizeObserver?: ResizeObserver;

  constructor() {
    afterNextRender(() => this.initMap());
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
        '<span style="display:block;width:20px;height:20px;border-radius:9999px;' +
        'background:#e8734a;border:3px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,.5);cursor:pointer"></span>',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    const markers = this.offices.map((office) => {
      const marker = L.marker([office.lat, office.lng], { icon, title: office.label }).addTo(map);
      marker.bindTooltip(office.label, {
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

    // Show both offices at once — a wide regional view of Lebanon and the U.A.E.
    const bounds = L.featureGroup(markers).getBounds();
    const fit = (): L.Map => map.fitBounds(bounds, { padding: [40, 40] });
    fit();

    const ResetViewControl = L.Control.extend({
      onAdd: (): HTMLElement => {
        const container = L.DomUtil.create('div', 'leaflet-bar plastiban-reset-control');
        const button = L.DomUtil.create('button', '', container);
        button.type = 'button';
        button.title = 'Reset view';
        button.setAttribute('aria-label', 'Reset map view');
        button.innerHTML =
          '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M9 3H3v6M15 3h6v6M21 15v6h-6M3 15v6h6" />' +
          '</svg>';
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.on(button, 'click', () => fit());
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

  /** At least one contact method — email or phone — must be provided. */
  protected hasContactMethod(): boolean {
    return !!(this.model.email.trim() || this.model.phone.trim());
  }

  onSubmit(): void {
    this.submitted.set(true);
    this.model.name = '';
    this.model.email = '';
    this.model.phone = '';
    this.model.message = '';
  }
}
