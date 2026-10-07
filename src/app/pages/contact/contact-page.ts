import { Component } from '@angular/core';
import { Contact } from '../../components/contact/contact';

@Component({
  selector: 'app-contact-page',
  imports: [Contact],
  template: `<app-contact />`,
})
export class ContactPage {}
