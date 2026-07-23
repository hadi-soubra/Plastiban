import { Component, inject } from '@angular/core';
import { RevealDirective } from '../../directives/reveal.directive';
import { TranslationService } from '../../i18n/translation.service';

interface SideStat {
  value: string;
  labelKey: string;
}

interface Feature {
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

  protected readonly sideStats: SideStat[] = [
    { value: '1989', labelKey: 'about.stat.founded' },
    { value: '35+', labelKey: 'about.stat.years' },
    { value: '2', labelKey: 'about.stat.countries' },
    { value: '∞', labelKey: 'about.stat.refinements' },
  ];

  protected readonly features: Feature[] = [
    { titleKey: 'about.feature.team.title', descriptionKey: 'about.feature.team.description' },
    {
      titleKey: 'about.feature.innovation.title',
      descriptionKey: 'about.feature.innovation.description',
    },
    {
      titleKey: 'about.feature.endToEnd.title',
      descriptionKey: 'about.feature.endToEnd.description',
    },
    { titleKey: 'about.feature.reach.title', descriptionKey: 'about.feature.reach.description' },
  ];
}
