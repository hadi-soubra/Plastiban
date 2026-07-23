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
            const delay = this.delay();
            if (delay > 0) {
              this.timer = setTimeout(() => this.el.classList.add('reveal-in'), delay);
            } else {
              this.el.classList.add('reveal-in');
            }
          }
        },
        // Trigger a little before the element is fully on screen so the motion
        // reads as "already happening" rather than starting late.
        { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
      );
      this.observer.observe(this.el);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
}
