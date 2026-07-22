import { Component, signal } from '@angular/core';

interface NavLink {
  label: string;
  href: string;
}

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  protected readonly menuOpen = signal(false);

  protected readonly links: NavLink[] = [
    { label: 'About', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'Products', href: '#products' },
    { label: 'Contact', href: '#contact' },
  ];

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  navigateTo(event: Event, href: string): void {
    event.preventDefault();
    this.closeMenu();
    const target = document.getElementById(href.replace('#', ''));
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
