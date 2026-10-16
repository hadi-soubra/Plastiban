import { Component, inject, signal } from '@angular/core';
import { RevealDirective } from '../../directives/reveal.directive';
import { TranslationService } from '../../i18n/translation.service';

interface Milestone {
  yearKey: string;
  titleKey: string;
  descriptionKey: string;
}

@Component({
  selector: 'app-about',
  imports: [RevealDirective],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {
  protected readonly i18n = inject(TranslationService);

  /**
   * The company's history, which used to be a standing 1989 and a row of
   * counters. Those said the same thing twice over - founded 1989, 35+ years,
   * 2 countries - and the dates carry it better on their own.
   */
  protected readonly milestones: Milestone[] = [
    {
      yearKey: 'about.timeline.founded.year',
      titleKey: 'about.timeline.founded.title',
      descriptionKey: 'about.timeline.founded.description',
    },
    {
      yearKey: 'about.timeline.production.year',
      titleKey: 'about.timeline.production.title',
      descriptionKey: 'about.timeline.production.description',
    },
    {
      yearKey: 'about.timeline.expansion.year',
      titleKey: 'about.timeline.expansion.title',
      descriptionKey: 'about.timeline.expansion.description',
    },
    {
      yearKey: 'about.timeline.luxury.year',
      titleKey: 'about.timeline.luxury.title',
      descriptionKey: 'about.timeline.luxury.description',
    },
    {
      yearKey: 'about.timeline.today.year',
      titleKey: 'about.timeline.today.title',
      descriptionKey: 'about.timeline.today.description',
    },
  ];

  /** Which milestones have their description open, by year key. */
  protected readonly open = signal<ReadonlySet<string>>(new Set());

  protected toggle(yearKey: string): void {
    this.open.update((current) => {
      const next = new Set(current);
      if (!next.delete(yearKey)) next.add(yearKey);
      return next;
    });
  }
}
