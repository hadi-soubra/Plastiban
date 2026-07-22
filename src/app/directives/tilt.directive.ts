import { Directive, ElementRef, NgZone, OnDestroy, OnInit, inject } from '@angular/core';

@Directive({
  selector: '[appTilt]',
})
export class TiltDirective implements OnInit, OnDestroy {
  private readonly el: HTMLElement = inject(ElementRef).nativeElement;
  private readonly zone = inject(NgZone);

  private readonly maxTiltDeg = 10;
  private readonly hoverScale = 1.04;

  private touchActive = false;
  private touchScrolling = false;
  private touchStartX = 0;
  private touchStartY = 0;

  private applyTilt(clientX: number, clientY: number): void {
    const rect = this.el.getBoundingClientRect();
    const px = (clientX - rect.left) / rect.width;
    const py = (clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * this.maxTiltDeg * 2;
    const rotateX = (0.5 - py) * this.maxTiltDeg * 2;
    this.el.style.transition = 'transform 0.06s linear';
    this.el.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${this.hoverScale})`;
  }

  private reset(): void {
    this.el.style.transition = 'transform 0.4s ease';
    this.el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
  }

  private readonly onPointerMove = (event: PointerEvent): void => {
    if (event.pointerType === 'mouse') {
      this.applyTilt(event.clientX, event.clientY);
      return;
    }
    if (!this.touchActive || this.touchScrolling) {
      return;
    }
    // Once the finger has travelled far enough to be a swipe, stop tilting and
    // hand the gesture back to the carousel so the two never fight.
    const dx = event.clientX - this.touchStartX;
    const dy = event.clientY - this.touchStartY;
    if (Math.hypot(dx, dy) > 10) {
      this.touchScrolling = true;
      this.reset();
      return;
    }
    this.applyTilt(event.clientX, event.clientY);
  };

  private readonly onPointerDown = (event: PointerEvent): void => {
    if (event.pointerType === 'mouse') {
      return;
    }
    // Touch has no hover, so press-to-tilt is the mobile equivalent.
    this.touchActive = true;
    this.touchScrolling = false;
    this.touchStartX = event.clientX;
    this.touchStartY = event.clientY;
    this.applyTilt(event.clientX, event.clientY);
  };

  private readonly onPointerEnd = (): void => {
    if (!this.touchActive) {
      return;
    }
    this.touchActive = false;
    this.reset();
  };

  private readonly onPointerLeave = (): void => {
    this.reset();
  };

  ngOnInit(): void {
    this.el.style.willChange = 'transform';
    this.zone.runOutsideAngular(() => {
      this.el.addEventListener('pointermove', this.onPointerMove);
      this.el.addEventListener('pointerleave', this.onPointerLeave);
      this.el.addEventListener('pointerdown', this.onPointerDown);
      this.el.addEventListener('pointerup', this.onPointerEnd);
      this.el.addEventListener('pointercancel', this.onPointerEnd);
    });
  }

  ngOnDestroy(): void {
    this.el.removeEventListener('pointermove', this.onPointerMove);
    this.el.removeEventListener('pointerleave', this.onPointerLeave);
    this.el.removeEventListener('pointerdown', this.onPointerDown);
    this.el.removeEventListener('pointerup', this.onPointerEnd);
    this.el.removeEventListener('pointercancel', this.onPointerEnd);
  }
}
