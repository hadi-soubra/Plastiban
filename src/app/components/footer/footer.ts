import { Component, inject } from '@angular/core';
import { SITE } from '../../config/site';
import { TranslationService } from '../../i18n/translation.service';

type SocialIcon = 'instagram' | 'facebook' | 'whatsapp';

interface SocialLink {
  icon: SocialIcon;
  labelKey: string;
  href: string;
  /** Set only where one platform has several accounts: rendered beside the icon
   *  so a visitor can tell the two Instagram accounts apart at a glance. */
  countryKey?: string;
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
    {
      icon: 'instagram',
      labelKey: 'social.instagram.lb',
      countryKey: 'social.country.lb',
      href: SITE.instagramLb,
    },
    {
      icon: 'instagram',
      labelKey: 'social.instagram.ae',
      countryKey: 'social.country.ae',
      href: SITE.instagramAe,
    },
    { icon: 'facebook', labelKey: 'social.facebook', href: SITE.facebook },
  ];
}
