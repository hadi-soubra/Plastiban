import {
  Component,
  ElementRef,
  OnDestroy,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RevealDirective } from '../../directives/reveal.directive';
import { TranslationService } from '../../i18n/translation.service';

interface Step {
  index: string;
  titleKey: string;
  descriptionKey: string;
  /**
   * Decoration, not information: the step is named in text beside it, so the
   * icon is hidden from assistive technology rather than given an alt that
   * would read the title twice. The artwork carries no words, which is what
   * lets one set serve both languages.
   */
  icon: string;
}

/** How long each step holds before the track moves on, in milliseconds. */
const DWELL = 4200;

/**
 * How long the track waits after someone picks a step before it starts walking
 * itself again. Long enough to read the step that was chosen, short enough that
 * the page does not feel like it has died. Every further click restarts it.
 */
const RESUME_AFTER = 500;

@Component({
  selector: 'app-process',
  imports: [RevealDirective],
  templateUrl: './process.html',
  styleUrl: './process.css',
  host: { '(keydown)': 'onKeydown($event)' },
})
export class Process implements OnDestroy {
  protected readonly i18n = inject(TranslationService);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly fillEl = viewChild<ElementRef<HTMLElement>>('railFill');

  /**
   * One run from brief to delivery. The brief described this twice, as a
   * four-step summary and a five-step detail; they are the same sequence, so it
   * is told once here, merging both: the five-step spine, with finishing kept
   * as its own step the way the four-step version had it.
   */
  protected readonly steps: Step[] = [
    { index: '01', titleKey: 'process.understand.title', descriptionKey: 'process.understand.description', icon: '/process/01.png' },
    { index: '02', titleKey: 'process.develop.title', descriptionKey: 'process.develop.description', icon: '/process/02.png' },
    { index: '03', titleKey: 'process.prototype.title', descriptionKey: 'process.prototype.description', icon: '/process/03.png' },
    { index: '04', titleKey: 'process.manufacture.title', descriptionKey: 'process.manufacture.description', icon: '/process/04.png' },
    { index: '05', titleKey: 'process.finishing.title', descriptionKey: 'process.finishing.description', icon: '/process/05.png' },
    { index: '06', titleKey: 'process.deliver.title', descriptionKey: 'process.deliver.description', icon: '/process/06.png' },
  ];

  protected readonly active = signal(0);
  protected readonly activeStep = computed(() => this.steps[this.active()]);

  /**
   * The rail fill is driven directly rather than derived from the active step,
   * because it has to do two different jobs. While the track is walking itself
   * the fill creeps from the current stop to the next one across the whole
   * dwell, so it reads as a countdown and the change of step never arrives
   * unannounced. Once a visitor takes over it simply eases to whatever they
   * picked.
   */
  protected readonly fill = signal(0);
  protected readonly fillMs = signal(0);
  protected readonly fillEase = signal('linear');

  /**
   * How a stop should read. Two states, not three: a stop is either reached or
   * it is not, which is what makes the row a progress bar rather than a row of
   * six buttons with one of them lit. Steps already passed look identical to
   * the one being shown, so the filled run reads as ground covered.
   *
   * Which step is open is carried by the panel beneath and by `aria-selected`,
   * not by the stop's appearance.
   */
  protected reached(index: number): boolean {
    return index <= this.active();
  }

  /** Where a stop sits along the rail, as a percentage of its length. */
  private stopAt(index: number): number {
    return (index / (this.steps.length - 1)) * 100;
  }

  private timer?: ReturnType<typeof setInterval>;
  private resumeTimer?: ReturnType<typeof setTimeout>;
  private observer?: IntersectionObserver;
  /** Whether the track is currently walking itself, as opposed to being driven. */
  private walking = false;
  /** Set once, if the visitor has asked for less movement. */
  private still = false;
  /** Whether the section is on screen. The track only walks while it is. */
  private onScreen = false;
  /** Whether a step was picked recently enough to still be holding the track. */
  private picked = false;

  constructor() {
    afterNextRender(() => {
      // The track walks itself so the sequence reads as a sequence without
      // anyone touching it. Picking a step only pauses that: holding the panel
      // still while someone reads is the point, abandoning the animation for
      // the rest of the visit is not.
      this.still = matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.fill.set(this.stopAt(0));
      if (this.still) {
        return;
      }

      // And it only walks while it can be seen. Running from page load means
      // the sequence has usually played itself out before a visitor scrolls
      // this far, so they arrive at a track already full and never see it
      // move. Leaving the section parks it until they come back.
      this.observer = new IntersectionObserver(
        ([entry]) => {
          this.onScreen = entry.isIntersecting;
          if (this.onScreen) {
            this.wake();
          } else {
            this.pauseWalking();
            clearTimeout(this.resumeTimer);
          }
        },
        // A third of the section showing is enough to call it seen, and is
        // reached well before the track itself scrolls into view.
        { threshold: 0.33 },
      );
      this.observer.observe(this.host.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.pauseWalking();
    clearTimeout(this.resumeTimer);
    this.observer?.disconnect();
  }

  protected select(index: number): void {
    this.pauseWalking();
    this.active.set(index);
    // A deliberate choice should land, not crawl.
    this.fillEase.set('cubic-bezier(0.22, 1, 0.36, 1)');
    this.fillMs.set(450);
    this.fill.set(this.stopAt(index));

    // Hand the track back after a pause, measured from this click: a second
    // click restarts the wait rather than stacking another resume on top.
    this.picked = true;
    this.armResume();
  }

  /**
   * Start walking again when nothing is holding the track back. Both brakes are
   * checked here rather than at each call site, so scrolling away mid-pause and
   * coming back cannot start two tracks at once.
   */
  private wake(): void {
    if (this.still || !this.onScreen || this.walking) {
      return;
    }
    if (this.picked) {
      this.armResume();
      return;
    }
    this.startWalking();
  }

  private armResume(): void {
    clearTimeout(this.resumeTimer);
    if (this.still || !this.onScreen) {
      return;                           // re-armed by the observer on return
    }
    this.resumeTimer = setTimeout(() => {
      this.picked = false;
      this.wake();
    }, RESUME_AFTER);
  }

  private startWalking(): void {
    this.pauseWalking();
    this.walking = true;
    this.creepToNext();
    this.timer = setInterval(() => {
      this.active.update((i) => (i + 1) % this.steps.length);
      this.creepToNext();
    }, DWELL);
  }

  private pauseWalking(): void {
    this.walking = false;
    clearInterval(this.timer);
    this.timer = undefined;
    this.freezeFill();
  }

  /**
   * Pin the fill where it has actually been painted. Clearing the interval only
   * stops the next step from being scheduled; the width transition already in
   * flight carries on to its target regardless, so without this the bar keeps
   * creeping after the track has supposedly stopped - including while the
   * section is off screen.
   */
  private freezeFill(): void {
    const el = this.fillEl()?.nativeElement;
    const rail = el?.parentElement;
    if (!el || !rail) {
      return;
    }
    const width = el.getBoundingClientRect().width;
    const total = rail.getBoundingClientRect().width;
    if (total > 0) {
      this.fillMs.set(0);
      this.fill.set((width / total) * 100);
    }
  }

  /**
   * Snap the fill onto the current stop, then start it travelling toward the
   * one after. The snap has to be painted before the crawl is asked for, or the
   * browser coalesces both into a single transition from the old position and
   * the bar appears to jump. Two frames is what it takes for the zero-duration
   * width to be committed first.
   */
  private creepToNext(): void {
    const index = this.active();
    this.fillEase.set('linear');
    this.fillMs.set(0);
    this.fill.set(this.stopAt(index));
    const last = index === this.steps.length - 1;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (!this.walking) {
          return;                       // a click landed in between; leave it be
        }
        // On the last stop the bar is already full: hold it there and let the
        // wrap reset it, rather than draining backwards to the start.
        this.fillMs.set(last ? 0 : DWELL);
        this.fill.set(this.stopAt(last ? index : index + 1));
      }),
    );
  }

  /** Arrow keys walk the track, the way a tablist is expected to behave. */
  protected onKeydown(event: KeyboardEvent): void {
    const back = this.i18n.isRtl() ? 'ArrowRight' : 'ArrowLeft';
    const forward = this.i18n.isRtl() ? 'ArrowLeft' : 'ArrowRight';
    if (event.key !== back && event.key !== forward) {
      return;
    }
    const target = event.target as HTMLElement | null;
    if (!target?.closest('[role="tablist"]')) {
      return;
    }
    event.preventDefault();
    const step = event.key === forward ? 1 : -1;
    const next = (this.active() + step + this.steps.length) % this.steps.length;
    this.select(next);
    (document.getElementById(`process-tab-${next}`) as HTMLElement | null)?.focus();
  }

}
