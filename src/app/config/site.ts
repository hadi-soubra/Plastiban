/**
 * Outward-facing links for the business. The Instagram and Facebook handles are
 * placeholders — swap them for the real accounts before going live. The business
 * runs one Instagram account per country, so the footer links to both.
 */
export const SITE = {
  origin: 'https://plastiban.me',
  instagramLb: 'https://www.instagram.com/plastiban',
  instagramAe: 'https://www.instagram.com/plastiban.ae',
  facebook: 'https://www.facebook.com/plastiban',
  /** wa.me wants the number in international form with no +, spaces or dashes. */
  whatsapp: 'https://wa.me/9613227144',
} as const;

/**
 * The logo strip under the hero. Every entry is placeholder artwork until the
 * real files arrive: drop the client's logo into `public/logos` over the file it
 * replaces and change `name`, which is what a screen reader announces and the
 * only text a sighted reader never sees.
 *
 * Source files want a transparent background and no colour box behind the mark —
 * the strip paints every logo as a flat white silhouette, so a logo's own
 * colours are discarded but a baked-in white panel would survive as a slab.
 * SVG over PNG: these are scaled by height and PNGs go soft on retina screens.
 */
export const CLIENTS = [
  { name: 'Client 01', logo: '/logos/client-01.svg' },
  { name: 'Client 02 Group', logo: '/logos/client-02.svg' },
  { name: 'Client 03 Studio', logo: '/logos/client-03.svg' },
  { name: 'Client 04 Co.', logo: '/logos/client-04.svg' },
  { name: 'Client 05', logo: '/logos/client-05.svg' },
  { name: 'Client 06 Ltd', logo: '/logos/client-06.svg' },
  { name: 'Client 07 PLC', logo: '/logos/client-07.svg' },
] as const;
