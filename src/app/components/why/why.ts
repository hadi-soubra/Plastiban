import { Component, inject } from '@angular/core';
import { RevealDirective } from '../../directives/reveal.directive';
import { TranslationService } from '../../i18n/translation.service';

interface Strength {
  titleKey: string;
  descriptionKey: string;
}

@Component({
  selector: 'app-why',
  imports: [RevealDirective],
  templateUrl: './why.html',
  styleUrl: './why.css',
})
export class Why {
  protected readonly i18n = inject(TranslationService);

  /**
   * What the company offers, said once. The brief made this case three times
   * over - as "Why Plastiban", "What Defines Us" and three manufacturing
   * pillars - and most of the thirteen entries were the same few claims in
   * different words: precision, craftsmanship and attention to detail are one
   * point, flexibility and made-to-measure another, experience and "since
   * 1989" a third. Partnership is the one claim that is about the relationship
   * rather than the work, so it leads the section instead of sitting in a card.
   */
  protected readonly strengths: Strength[] = [
    { titleKey: 'why.since.title', descriptionKey: 'why.since.description' },
    { titleKey: 'why.inHouse.title', descriptionKey: 'why.inHouse.description' },
    { titleKey: 'why.measure.title', descriptionKey: 'why.measure.description' },
    { titleKey: 'why.reach.title', descriptionKey: 'why.reach.description' },
    { titleKey: 'why.consistency.title', descriptionKey: 'why.consistency.description' },
    { titleKey: 'why.detail.title', descriptionKey: 'why.detail.description' },
  ];
}
