import { Component, inject } from '@angular/core';
import { SITE } from '../../config/site';
import { TranslationService } from '../../i18n/translation.service';

type SocialIcon = 'instagram' | 'facebook' | 'whatsapp';

interface SocialLink {
  icon: SocialIcon;
  labelKey: string;
  href: string;
  /** Which country or countries the account covers, rendered beside the icon.
   *  Set on every account that is not self-evident: the two Instagram accounts
   *  need telling apart, and the single Facebook page needs saying that it
   *  serves both branches rather than only the one its neighbour names. */
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
      labelKey: 'social.facebook',
      countryKey: 'social.country.both',
      href: SITE.facebook,
    },
  ];
}
