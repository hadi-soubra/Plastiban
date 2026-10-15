import { Component } from '@angular/core';
import { About } from '../../components/about/about';
import { Vision } from '../../components/vision/vision';

@Component({
  selector: 'app-about-page',
  imports: [About, Vision],
  template: `
    <app-about />
    <app-vision />
  `,
})
export class AboutPage {}
