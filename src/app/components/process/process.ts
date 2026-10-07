import {
  Component,
  OnDestroy,
  afterNextRender,
  computed,
  inject,
  signal,
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

@Component({
  selector: 'app-process',
  imports: [RevealDirective],
  templateUrl: './process.html',
  styleUrl: './process.css',
  host: { '(keydown)': 'onKeydown($event)' },
})
export class Process implements OnDestroy {
  protected readonly i18n = inject(TranslationService);

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

  /** How far along the track the fill reaches, as a percentage. */
  protected readonly progress = computed(
    () => (this.active() / (this.steps.length - 1)) * 100,
  );

  private timer?: ReturnType<typeof setInterval>;

  constructor() {
    afterNextRender(() => {
      // The track walks itself so the sequence reads as a sequence without
      // anyone touching it. It stops for good at the first interaction: once a
      // visitor is choosing steps, moving the panel under them is a nuisance.
      const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!still) {
        this.timer = setInterval(
          () => this.active.update((i) => (i + 1) % this.steps.length),
          DWELL,
        );
      }
    });
  }

  ngOnDestroy(): void {
    this.stopAdvancing();
  }

  protected select(index: number): void {
    this.stopAdvancing();
    this.active.set(index);
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

  private stopAdvancing(): void {
    clearInterval(this.timer);
    this.timer = undefined;
  }
}
