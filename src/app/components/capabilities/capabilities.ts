import { Component, ElementRef, NgZone, OnDestroy, afterNextRender, inject, viewChild } from '@angular/core';
import { RevealDirective } from '../../directives/reveal.directive';
import { TranslationService } from '../../i18n/translation.service';

interface Capability {
  /** Names its icon: public/capabilities/<index>.png. */
  index: string;
  /** Translation-key stem: `<stem>.title` and `<stem>.description`. */
  key: string;
}

/** How long each item holds the centre before the row glides on, in ms. */
const DWELL = 3200;

/**
 * How long the row stays still once the visitor has finished with it - counted
 * from their last touch or scroll, so a swipe still coasting keeps it held.
 */
const RESUME_AFTER = 2000;

/** How long the row's own glide takes to settle; its scroll events are ignored. */
const OWN_SCROLL = 900;

/** How often the row checks whether it is time to move. */
const TICK = 200;

@Component({
  selector: 'app-capabilities',
  imports: [RevealDirective],
  templateUrl: './capabilities.html',
  styleUrl: './capabilities.css',
})
export class Capabilities implements OnDestroy {
  protected readonly i18n = inject(TranslationService);
  private readonly zone = inject(NgZone);
  private readonly row = viewChild<ElementRef<HTMLUListElement>>('row');

  private timer?: ReturnType<typeof setInterval>;
  private observer?: IntersectionObserver;
  private inView = false;
  /** When the row next glides on, pushed back by every touch or scroll. */
  private nextAt = 0;
  /** Until when scroll events are the row's own glide rather than the visitor. */
  private ownScrollUntil = 0;

  /**
   * What the factories do in-house. Each entry is named in its own heading and
   * stays visible rather than tucked into a dropdown: these are the terms people
   * search for, so they are written into the page as text, never into artwork.
   */
  protected readonly capabilities: Capability[] = [
    { index: '01', key: 'capabilities.offset' },
    { index: '02', key: 'capabilities.digital' },
    { index: '03', key: 'capabilities.dieCutting' },
    { index: '04', key: 'capabilities.router' },
    { index: '05', key: 'capabilities.lamination' },
    { index: '06', key: 'capabilities.finishing' },
  ];

  constructor() {
    afterNextRender(() => this.startAutoAdvance());
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
    this.observer?.disconnect();
    const el = this.row()?.nativeElement;
    for (const type of ['pointerdown', 'touchstart', 'touchend', 'wheel', 'scroll']) {
      el?.removeEventListener(type, this.onVisitor);
    }
  }

  /**
   * On a phone the row walks itself: every few seconds it glides the next item
   * to the centre, and after the last it returns to the first. Only while it is
   * on screen, only below sm (from sm up it is a grid with nothing to scroll),
   * and never for visitors who ask for reduced motion. A touch or a swipe hands
   * it over to the visitor; two seconds after the row has come to rest it takes
   * over again.
   */
  private startAutoAdvance(): void {
    const el = this.row()?.nativeElement;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    this.zone.runOutsideAngular(() => {
      for (const type of ['pointerdown', 'touchstart', 'touchend', 'wheel', 'scroll']) {
        el.addEventListener(type, this.onVisitor, { passive: true });
      }
      this.observer = new IntersectionObserver(([entry]) => (this.inView = entry.isIntersecting), {
        threshold: 0.6,
      });
      this.observer.observe(el);
      this.nextAt = Date.now() + DWELL;
      this.timer = setInterval(() => {
        if (Date.now() >= this.nextAt) {
          this.advance(el);
        }
      }, TICK);
    });
  }

  /** Anything the visitor does to the row pushes the next glide back. */
  private readonly onVisitor = (event: Event): void => {
    if (event.type === 'scroll' && Date.now() < this.ownScrollUntil) {
      return;
    }
    this.nextAt = Date.now() + RESUME_AFTER;
  };

  /**
   * Centres the item after the one nearest the middle. Measured from the
   * rendered boxes rather than scrollLeft, whose sign flips under RTL, so the
   * same arithmetic works in both languages.
   */
  private advance(el: HTMLUListElement): void {
    const scrollable = el.scrollWidth > el.clientWidth + 1;
    if (!scrollable || !this.inView || document.hidden) {
      return;
    }
    this.nextAt = Date.now() + DWELL;
    this.ownScrollUntil = Date.now() + OWN_SCROLL;
    const items = Array.from(el.children) as HTMLElement[];
    const box = el.getBoundingClientRect();
    const middle = box.left + box.width / 2;
    const centreOf = (item: HTMLElement) => {
      const r = item.getBoundingClientRect();
      return r.left + r.width / 2;
    };
    let current = 0;
    items.forEach((item, i) => {
      if (Math.abs(centreOf(item) - middle) < Math.abs(centreOf(items[current]) - middle)) {
        current = i;
      }
    });
    const next = items[(current + 1) % items.length];
    el.scrollBy({ left: centreOf(next) - middle, behavior: 'smooth' });
  }
}
