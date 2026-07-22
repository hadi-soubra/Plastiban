import { Component } from '@angular/core';

interface SideStat {
  value: string;
  label: string;
}

interface Feature {
  title: string;
  description: string;
}

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {
  protected readonly sideStats: SideStat[] = [
    { value: '1989', label: 'Founded' },
    { value: '35+', label: 'Years operating' },
    { value: '2', label: 'Countries' },
    { value: '∞', label: 'Refinements' },
  ];

  protected readonly features: Feature[] = [
    { title: 'Faithful team', description: 'Professionals invested in every project.' },
    { title: 'Continuous innovation', description: 'Always improving techniques & methods.' },
    { title: 'Design to delivery', description: 'One partner across the whole journey.' },
    { title: 'Local & global', description: 'Serving Lebanon and the U.A.E.' },
  ];
}
