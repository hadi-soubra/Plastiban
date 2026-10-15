import { Component, inject, signal } from '@angular/core';
import { RevealDirective } from '../../directives/reveal.directive';
import { TranslationService } from '../../i18n/translation.service';

interface Value {
  titleKey: string;
  descriptionKey: string;
}

interface Statement {
  id: string;
  labelKey: string;
  headingKey: string;
  bodyKey?: string;
  values?: Value[];
}

@Component({
  selector: 'app-vision',
  imports: [RevealDirective],
  templateUrl: './vision.html',
  styleUrl: './vision.css',
})
export class Vision {
  protected readonly i18n = inject(TranslationService);

  /**
   * Vision, mission, sustainability and values. The values were the "Why
   * Plastiban" section, which repeated much of what this band already says;
   * its three claims about the work itself live here now, and the rest was
   * covered by the about timeline.
   */
  protected readonly statements: Statement[] = [
    { id: 'vision', labelKey: 'vision.eyebrow', headingKey: 'vision.heading', bodyKey: 'vision.body' },
    {
      id: 'mission',
      labelKey: 'vision.missionLabel',
      headingKey: 'vision.missionHeading',
      bodyKey: 'vision.missionBody',
    },
    {
      id: 'sustainability',
      labelKey: 'vision.sustainabilityLabel',
      headingKey: 'vision.sustainabilityHeading',
      bodyKey: 'vision.sustainabilityBody',
    },
    {
      id: 'values',
      labelKey: 'vision.valuesLabel',
      headingKey: 'vision.valuesHeading',
      values: [
        { titleKey: 'vision.values.measure.title', descriptionKey: 'vision.values.measure.description' },
        { titleKey: 'vision.values.consistency.title', descriptionKey: 'vision.values.consistency.description' },
        { titleKey: 'vision.values.detail.title', descriptionKey: 'vision.values.detail.description' },
      ],
    },
  ];

  /** Which statements are expanded. */
  protected readonly open = signal<ReadonlySet<string>>(new Set());

  protected toggle(id: string): void {
    this.open.update((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }
}
