import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Hero } from '../../components/hero/hero';
import { Products } from '../../components/products/products';
import { Process } from '../../components/process/process';
import { TranslationService } from '../../i18n/translation.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [Hero, Products, Process, RouterLink],
  templateUrl: './home.html',
})
export class Home {
  protected readonly i18n = inject(TranslationService);
}
