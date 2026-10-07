import { Component } from '@angular/core';
import { About } from '../../components/about/about';
import { Vision } from '../../components/vision/vision';
import { Why } from '../../components/why/why';

@Component({
  selector: 'app-about-page',
  imports: [About, Vision, Why],
  template: `
    <app-about />
    <app-vision />
    <app-why />
  `,
})
export class AboutPage {}
