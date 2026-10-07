import { Component, inject } from '@angular/core';
import { SITE } from '../../config/site';
import { TranslationService } from '../../i18n/translation.service';

type SocialIcon = 'instagram' | 'facebook' | 'whatsapp';

interface SocialLink {
  icon: SocialIcon;
  labelKey: string;
  href: string;
  /** Which country or countries the account covers, rendered beside the icon.
   *  Every platform has one account per branch, so each needs telling apart. */
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
    {
      icon: 'facebook',
      labelKey: 'social.facebook.lb',
      countryKey: 'social.country.lb',
      href: SITE.facebookLb,
    },
    {
      icon: 'facebook',
      labelKey: 'social.facebook.ae',
      countryKey: 'social.country.ae',
      href: SITE.facebookAe,
    },
  ];
}
