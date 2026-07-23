import { Component, NgZone, OnDestroy, afterNextRender, inject, signal } from '@angular/core';
import { TranslationService } from '../../i18n/translation.service';

interface NavLink {
  labelKey: string;
  href: string;
  id: string;
}

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnDestroy {
  protected readonly i18n = inject(TranslationService);
  private readonly zone = inject(NgZone);

  protected readonly menuOpen = signal(false);
  /** Id of the section currently filling most of the viewport. */
  protected readonly activeSection = signal('top');
  /** True once the page has scrolled off the very top — drives the header shadow. */
  protected readonly scrolled = signal(false);

  protected readonly links: NavLink[] = [
    { labelKey: 'nav.about', href: '#about', id: 'about' },
    { labelKey: 'nav.services', href: '#services', id: 'services' },
    { labelKey: 'nav.products', href: '#products', id: 'products' },
    { labelKey: 'nav.contact', href: '#contact', id: 'contact' },
  ];

  private observer?: IntersectionObserver;
  private readonly ratios = new Map<string, number>();

  constructor() {
    afterNextRender(() => {
      this.observeSections();
      this.watchScroll();
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    window.removeEventListener('scroll', this.onScroll);
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  toggleLang(): void {
    this.i18n.toggle();
  }

  navigateTo(event: Event, href: string): void {
    event.preventDefault();
    this.closeMenu();
    const target = document.getElementById(href.replace('#', ''));
    // Phones jump straight to the section. A smooth scroll there means a long
    // travel through several full-height sections on a small screen, which
    // reads as a delay rather than as motion. `instant` is required over
    // `auto` — `auto` defers to the `scroll-behavior: smooth` set on <html>.
    const behavior: ScrollBehavior = this.prefersInstantJump() ? 'instant' : 'smooth';
    target?.scrollIntoView({ behavior, block: 'start' });
  }

  /** Mirrors the desktop-only breakpoint that gates section snapping. */
  private prefersInstantJump(): boolean {
    return typeof window !== 'undefined' && !window.matchMedia('(min-width: 1024px)').matches;
  }

  protected isActive(id: string): boolean {
    return this.activeSection() === id;
  }

  private observeSections(): void {
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }
    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            this.ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
          }
          // Sections are full-height, so at most two overlap at once; whichever
          // covers more of the viewport is the one the visitor is reading.
          let best = 'top';
          let bestRatio = 0;
          for (const [id, ratio] of this.ratios) {
            if (ratio > bestRatio) {
              best = id;
              bestRatio = ratio;
            }
          }
          this.zone.run(() => this.activeSection.set(best));
        },
        { threshold: [0, 0.25, 0.5, 0.75, 1] },
      );
      for (const id of ['top', ...this.links.map((link) => link.id)]) {
        const el = document.getElementById(id);
        if (el) {
          this.observer!.observe(el);
        }
      }
    });
  }

  private watchScroll(): void {
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.onScroll, { passive: true });
    });
    this.onScroll();
  }

  private readonly onScroll = (): void => {
    const next = window.scrollY > 8;
    if (next !== this.scrolled()) {
      this.zone.run(() => this.scrolled.set(next));
    }
  };
}
