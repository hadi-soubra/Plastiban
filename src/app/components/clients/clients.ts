import { Component, inject } from '@angular/core';
import { CLIENTS } from '../../config/site';
import { TranslationService } from '../../i18n/translation.service';

/**
 * Seconds of travel each logo is given. The lap time is derived from this rather
 * than fixed, so adding clients lengthens the strip *and* the animation by the
 * same factor and the drift stays at the same speed either way.
 */
const SECONDS_PER_LOGO = 9;

@Component({
  selector: 'app-clients',
  imports: [],
  templateUrl: './clients.html',
  styleUrl: './clients.css',
})
export class Clients {
  protected readonly i18n = inject(TranslationService);

  protected readonly clients = CLIENTS;

  /** One lap covers a single copy of the list — see the note in clients.css. */
  protected readonly lapDuration = `${CLIENTS.length * SECONDS_PER_LOGO}s`;
}
