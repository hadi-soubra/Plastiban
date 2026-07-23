import { Component, inject } from '@angular/core';
import { Navbar } from './components/navbar/navbar';
import { Hero } from './components/hero/hero';
import { About } from './components/about/about';
import { Services } from './components/services/services';
import { Products } from './components/products/products';
import { Contact } from './components/contact/contact';
import { Footer } from './components/footer/footer';
import { SeoService } from './seo/seo.service';

@Component({
  selector: 'app-root',
  imports: [Navbar, Hero, About, Services, Products, Contact, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // Instantiating the service starts the effect that keeps title and meta tags
  // in sync with the active language.
  private readonly seo = inject(SeoService);
}
