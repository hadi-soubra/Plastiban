import { Component, NgZone, OnDestroy, afterNextRender, computed, inject, signal } from '@angular/core';
import { TranslationService } from '../../i18n/translation.service';

interface NavSection {
  labelKey: string;
  /** Id of the section element it jumps to. */
  id: string;
}

interface NavLink extends NavSection {
  /**
   * The sections the link stands for, in page order. It is underlined while any
   * of them is the one being read, and the mobile menu lists them under it.
   */
  sections: NavSection[];
}

/** The hero. Home is the top of the page, so its link clears the hash. */
const HOME_ID = 'top';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnDestroy {
  protected readonly i18n = inject(TranslationService);
  private readonly zone = inject(NgZone);

  protected readonly homeId = HOME_ID;

  protected readonly menuOpen = signal(false);
  /** Id of the section currently being read. */
  protected readonly activeSection = signal(HOME_ID);
  /** True once the page has scrolled off the very top — drives the header shadow. */
  protected readonly scrolled = signal(false);

  protected readonly links: NavLink[] = [
    {
      labelKey: 'nav.about',
      id: 'about',
      sections: [
        { labelKey: 'nav.whoWeAre', id: 'about' },
        { labelKey: 'nav.vision', id: 'vision' },
      ],
    },
    {
      labelKey: 'nav.products',
      id: 'products',
      sections: [
        { labelKey: 'nav.portfolio', id: 'products' },
        { labelKey: 'nav.capabilities', id: 'capabilities' },
        { labelKey: 'nav.howWeWork', id: 'process' },
      ],
    },
    { labelKey: 'nav.contact', id: 'contact', sections: [{ labelKey: 'nav.contact', id: 'contact' }] },
  ];

  /** Every section the menu knows about, in page order. */
  private readonly sectionIds = [HOME_ID, ...this.links.flatMap((link) => link.sections.map((section) => section.id))];

  /** Id of the top-level link whose group is being read. */
  protected readonly activeLink = computed(() => {
    const section = this.activeSection();
    return this.links.find((link) => link.sections.some((s) => s.id === section))?.id ?? HOME_ID;
  });

  constructor() {
    afterNextRender(() => this.watchScroll());
  }

  ngOnDestroy(): void {
    // Also runs when the page is prerendered at build time, where there is no window.
    if (typeof window === 'undefined') {
      return;
    }
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onScroll);
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

  /**
   * Scrolls to a section and puts it in the address bar, so the link can be
   * shared. replaceState rather than pushState: a row of menu taps should not
   * become a row of back-button presses. A modified click (new tab, new window)
   * is left to the browser, which opens the real href.
   */
  navigateTo(event: MouseEvent, id: string): void {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) {
      return;
    }
    event.preventDefault();
    this.closeMenu();
    history.replaceState(null, '', id === HOME_ID ? '/' : `#${id}`);
    // Phones jump straight to the section. A smooth scroll there means a long
    // travel through several full-height sections on a small screen, which
    // reads as a delay rather than as motion. `instant` is required over
    // `auto` — `auto` defers to the `scroll-behavior: smooth` set on <html>.
    const behavior: ScrollBehavior = this.prefersInstantJump() ? 'instant' : 'smooth';
    document.getElementById(id)?.scrollIntoView({ behavior, block: 'start' });
  }

  protected href(id: string): string {
    return id === HOME_ID ? '/' : `#${id}`;
  }

  /** Mirrors the desktop-only breakpoint that gates section snapping. */
  private prefersInstantJump(): boolean {
    return !window.matchMedia('(min-width: 1024px)').matches;
  }

  private watchScroll(): void {
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onScroll, { passive: true });
    });
    this.onScroll();
  }

  private readonly onScroll = (): void => {
    const scrolled = window.scrollY > 8;
    const section = this.currentSection();
    if (scrolled !== this.scrolled() || section !== this.activeSection()) {
      this.zone.run(() => {
        this.scrolled.set(scrolled);
        this.activeSection.set(section);
      });
    }
  };

  /**
   * The section being read: the last one whose top has passed a line a third of
   * the way down the screen. The sections are not all a screen tall - the vision
   * band is half that - so this beats asking which one covers the most of the
   * viewport. At the very bottom the last section wins, since a short final
   * section may never reach the line at all.
   */
  private currentSection(): string {
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (atBottom) {
      return this.sectionIds[this.sectionIds.length - 1];
    }
    const line = window.innerHeight / 3;
    let current = HOME_ID;
    for (const id of this.sectionIds) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= line) {
        current = id;
      }
    }
    return current;
  }
}
