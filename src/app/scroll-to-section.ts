/** Same gate as the section snapping in styles.css. */
const SNAPPING_QUERY = '(min-width: 1024px) and (min-height: 640px) and (pointer: fine)';

/**
 * Brings a section into view where the desktop snapping would settle it anyway:
 * centred under the header when it is shorter than the space below the header,
 * top-aligned otherwise. Without this a jump would land on the section's top and
 * the snap would then visibly drag it down to the centre. A section that does
 * not fit keeps `start`, or centring would open it halfway through. Where there
 * is no snapping (phones, tablets) every section keeps the top-aligned jump.
 */
export function scrollToSection(target: HTMLElement, behavior: ScrollBehavior): void {
  const header = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  const fits = target.offsetHeight < window.innerHeight - header;
  const block: ScrollLogicalPosition = fits && window.matchMedia(SNAPPING_QUERY).matches ? 'center' : 'start';
  target.scrollIntoView({ behavior, block });
}
