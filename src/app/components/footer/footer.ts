import { Component, inject } from '@angular/core';
import { SITE } from '../../config/site';
import { TranslationService } from '../../i18n/translation.service';

type SocialIcon = 'instagram' | 'facebook' | 'whatsapp';

interface SocialLink {
  icon: SocialIcon;
  labelKey: string;
  href: string;
}

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  protected readonly i18n = inject(TranslationService);
  protected readonly year = new Date().getFullYear();

  protected readonly socials: SocialLink[] = [
    { icon: 'instagram', labelKey: 'social.instagram', href: SITE.instagram },
    { icon: 'facebook', labelKey: 'social.facebook', href: SITE.facebook },
  ];
}
