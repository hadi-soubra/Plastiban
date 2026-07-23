import { Component, inject } from '@angular/core';
import { RevealDirective } from '../../directives/reveal.directive';
import { TranslationService } from '../../i18n/translation.service';

interface Service {
  index: string;
  titleKey: string;
  descriptionKey: string;
}

@Component({
  selector: 'app-services',
  imports: [RevealDirective],
  templateUrl: './services.html',
  styleUrl: './services.css',
})
export class Services {
  protected readonly i18n = inject(TranslationService);

  protected readonly services: Service[] = [
    {
      index: '01',
      titleKey: 'services.creative.title',
      descriptionKey: 'services.creative.description',
    },
    {
      index: '02',
      titleKey: 'services.manufacturing.title',
      descriptionKey: 'services.manufacturing.description',
    },
    {
      index: '03',
      titleKey: 'services.plastics.title',
      descriptionKey: 'services.plastics.description',
    },
    {
      index: '04',
      titleKey: 'services.logistics.title',
      descriptionKey: 'services.logistics.description',
    },
  ];
}
