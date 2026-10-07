import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';
import { SeoService } from './seo/seo.service';

@Component({
  selector: 'app-root',
  imports: [Navbar, RouterOutlet, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // Instantiating the service starts the effects that keep the title, the meta
  // tags and the canonical URL in step with the route and the language.
  private readonly seo = inject(SeoService);
}
