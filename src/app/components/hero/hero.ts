import { Component, inject } from '@angular/core';
import { Clients } from '../clients/clients';
import { TranslationService } from '../../i18n/translation.service';

@Component({
  selector: 'app-hero',
  imports: [Clients],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {
  protected readonly i18n = inject(TranslationService);
}
