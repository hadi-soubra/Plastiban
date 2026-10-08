import {
  Directive,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  inject,
  input,
  numberAttribute,
} from '@angular/core';

/**
 * Fades and lifts an element into view the first time it enters the viewport.
 *
 * Usage: `<div appReveal>` or `<div appReveal="120">` for a stagger delay in ms.
 * Honours prefers-reduced-motion by revealing immediately with no transition,
 * and reveals immediately when IntersectionObserver is unavailable so content
 * can never end up permanently invisible.
 */
@Directive({
  selector: '[appReveal]',
})
export class RevealDirective implements OnInit, OnDestroy {
  readonly delay = input(0, { alias: 'appReveal', transform: numberAttribute });

  private readonly el: HTMLElement = inject(ElementRef).nativeElement;
  private readonly zone = inject(NgZone);
  private observer?: IntersectionObserver;
  private timer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    const reducedMotion =
      typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion || typeof IntersectionObserver === 'undefined') {
      return;
    }

    this.el.classList.add('reveal');

    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) {
              continue;
            }
            this.observer?.disconnect();
            const delay = this.scaledDelay();
            if (delay > 0) {
              this.timer = setTimeout(() => this.el.classList.add('reveal-in'), delay);
            } else {
              this.el.classList.add('reveal-in');
            }
          }
        },
        // Fire on the first pixel: no margin, no threshold. The element starts
        // moving exactly as its top edge crosses the bottom of the screen, so
        // the motion is seen rather than inferred.
        //
        // Both ways of missing that are easy. The previous value, -12% on the
        // bottom, shrank the root: the element had to be an eighth of a screen
        // past the edge before it counted, which on a phone - where a section
        // is taller than the viewport - landed after the reader had scrolled
        // by. A positive margin overshoots the other way and plays the reveal
        // off screen, so it is over before it is visible.
        { rootMargin: '0px', threshold: 0 },
      );
      this.observer.observe(this.el);
    });
  }

  /**
   * The stagger exists to let a row of cards arrive one after another, which
   * works on a wide screen where the whole row is visible at once. On a phone
   * the same elements are stacked, so the later delays simply postpone things
   * the reader is already looking at. They are halved and capped there.
   */
  private scaledDelay(): number {
    const delay = this.delay();
    if (delay <= 0 || typeof matchMedia === 'undefined') {
      return delay;
    }
    return matchMedia('(min-width: 640px)').matches ? delay : Math.min(delay / 2, 180);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
}
