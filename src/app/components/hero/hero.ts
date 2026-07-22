import { Component } from '@angular/core';

interface Stat {
  value: string;
  label: string;
}

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {
  protected readonly stats: Stat[] = [
    { value: '35+', label: 'Years of craft' },
    { value: '2', label: 'Countries served' },
    { value: '2', label: 'Production sites' },
    { value: '100%', label: 'In-house control' },
  ];
}
