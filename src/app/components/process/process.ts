import { Component, inject } from '@angular/core';
import { RevealDirective } from '../../directives/reveal.directive';
import { TranslationService } from '../../i18n/translation.service';

interface Step {
  index: string;
  titleKey: string;
  descriptionKey: string;
}

@Component({
  selector: 'app-process',
  imports: [RevealDirective],
  templateUrl: './process.html',
  styleUrl: './process.css',
})
export class Process {
  protected readonly i18n = inject(TranslationService);

  /**
   * One run from brief to delivery. The brief described this twice, as a
   * four-step summary and a five-step detail; they are the same sequence, so it
   * is told once here, merging both: the five-step spine, with finishing kept
   * as its own step the way the four-step version had it.
   */
  protected readonly steps: Step[] = [
    { index: '01', titleKey: 'process.understand.title', descriptionKey: 'process.understand.description' },
    { index: '02', titleKey: 'process.develop.title', descriptionKey: 'process.develop.description' },
    { index: '03', titleKey: 'process.prototype.title', descriptionKey: 'process.prototype.description' },
    { index: '04', titleKey: 'process.manufacture.title', descriptionKey: 'process.manufacture.description' },
    { index: '05', titleKey: 'process.finishing.title', descriptionKey: 'process.finishing.description' },
    { index: '06', titleKey: 'process.deliver.title', descriptionKey: 'process.deliver.description' },
  ];
}
