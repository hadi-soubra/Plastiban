import { Component, NgZone, OnDestroy, afterNextRender, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { TranslationService } from '../../i18n/translation.service';

interface NavLink {
  labelKey: string;
  /** Route path. The site is three pages now, not one long scroll. */
  path: string;
}

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnDestroy {
  protected readonly i18n = inject(TranslationService);
  private readonly zone = inject(NgZone);
  private readonly router = inject(Router);

  protected readonly menuOpen = signal(false);
  /** Path of the page being shown, which is what the underline follows now. */
  protected readonly activePath = signal('/');
  /** True once the page has scrolled off the very top — drives the header shadow. */
  protected readonly scrolled = signal(false);

  protected readonly links: NavLink[] = [
    { labelKey: 'nav.about', path: '/about' },
    { labelKey: 'nav.contact', path: '/contact' },
  ];

  private routeSub?: Subscription;

  constructor() {
    // The underline used to follow whichever section filled the viewport. With
    // three pages there is nothing to spy on: the current page is simply the
    // current URL.
    this.routeSub = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.activePath.set(event.urlAfterRedirects.split('?')[0]));

    afterNextRender(() => this.watchScroll());
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    window.removeEventListener('scroll', this.onScroll);
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  toggleLang(): void {
    this.i18n.toggle();
  }

  protected isActive(path: string): boolean {
    return this.activePath() === path;
  }

  private watchScroll(): void {
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.onScroll, { passive: true });
    });
    this.onScroll();
  }

  private readonly onScroll = (): void => {
    const next = window.scrollY > 8;
    if (next !== this.scrolled()) {
      this.zone.run(() => this.scrolled.set(next));
    }
  };
}
