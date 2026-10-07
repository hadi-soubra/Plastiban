import { Component, inject } from '@angular/core';
import { RevealDirective } from '../../directives/reveal.directive';
import { TranslationService } from '../../i18n/translation.service';

@Component({
  selector: 'app-vision',
  imports: [RevealDirective],
  templateUrl: './vision.html',
  styleUrl: './vision.css',
})
export class Vision {
  protected readonly i18n = inject(TranslationService);
}
