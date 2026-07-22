import { Component } from '@angular/core';

interface Service {
  index: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-services',
  imports: [],
  templateUrl: './services.html',
  styleUrl: './services.css',
})
export class Services {
  protected readonly services: Service[] = [
    {
      index: '01',
      title: 'Creative Conception',
      description: 'Design and creative direction for packaging and product identity, from concept to prototype.',
    },
    {
      index: '02',
      title: 'Manufacturing',
      description: 'End-to-end production of boxes, trays and bags in a full range of sizes and finishes.',
    },
    {
      index: '03',
      title: 'Industrial Plastics',
      description: 'Technical plastics manufacturing built on decades of process expertise.',
    },
    {
      index: '04',
      title: 'Logistics & Transfer',
      description: 'Reliable delivery and logistics for clients locally and abroad.',
    },
  ];
}
