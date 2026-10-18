import { Component, afterNextRender, inject } from '@angular/core';
import { Navbar } from './components/navbar/navbar';
import { Hero } from './components/hero/hero';
import { About } from './components/about/about';
import { Vision } from './components/vision/vision';
import { Products } from './components/products/products';
import { Process } from './components/process/process';
import { Capabilities } from './components/capabilities/capabilities';
import { Contact } from './components/contact/contact';
import { Footer } from './components/footer/footer';
import { SeoService } from './seo/seo.service';

/**
 * The paths the site answered on while it was three pages. The server 301s them
 * (public/_redirects), so this only catches the dev server and anything the
 * redirect misses.
 */
const LEGACY_PATHS: Record<string, string> = {
  '/about': 'about',
  '/contact': 'contact',
};

@Component({
  selector: 'app-root',
  imports: [Navbar, Hero, About, Vision, Products, Capabilities, Process, Contact, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // Instantiating the service starts the effect that keeps the title and the
  // meta tags in step with the language.
  private readonly seo = inject(SeoService);

  constructor() {
    afterNextRender(() => this.openLinkedSection());
  }

  /**
   * One page, so any path other than "/" is folded back onto it, landing on
   * the section an old page path or a shared "#section" link pointed at. The
   * browser's own jump to the hash fires before the sections exist, so it is
   * done here once they have rendered.
   */
  private openLinkedSection(): void {
    const path = location.pathname.replace(/\/+$/, '') || '/';
    const id = LEGACY_PATHS[path] ?? location.hash.slice(1);
    if (path !== '/') {
      history.replaceState(null, '', id ? `/#${id}` : '/');
    }
    const target = id ? document.getElementById(id) : null;
    if (!target) {
      return;
    }
    const jump = () => target.scrollIntoView({ behavior: 'instant', block: 'start' });
    jump();
    // The web fonts land after this first jump and reflow everything above the
    // target, which leaves it tucked under the header. Jump again once they
    // have, unless the visitor has already started scrolling on their own.
    const landedAt = window.scrollY;
    document.fonts.ready.then(() => {
      if (window.scrollY === landedAt) {
        jump();
      }
    });
  }
}
