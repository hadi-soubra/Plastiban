import {
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { TiltDirective } from '../../directives/tilt.directive';
import { RevealDirective } from '../../directives/reveal.directive';
import { TranslationService } from '../../i18n/translation.service';
import { Lang } from '../../i18n/translations';

type CategoryId = 'hard' | 'printed';

/** A string that exists in both languages, resolved at render time by `text()`. */
type Localized = Record<Lang, string>;

/**
 * One sub-category of a category — a product line, not a single shot. Its
 * pictures live together in `public/products/<category folder>/<folder>`, and
 * every one of them becomes its own card under the same name and description.
 */
interface SubCategory {
  /** Short label shown as the card title. Does not affect filtering. */
  name: Localized;
  description: Localized;
  /** Folder holding this line's shots, inside its category's folder. */
  folder: string;
  /**
   * File names in that folder, in the order they should appear. Empty until the
   * shots arrive — the line still gets one card, showing the placeholder.
   */
  images: string[];
}

/** One card: a single shot of a sub-category, flattened out of the tree above. */
interface Product {
  subCategory: Localized;
  description: Localized;
  /** Path under `public`, or empty while the sub-category has no shots yet. */
  src: string;
  category: CategoryId;
  /** Which sub-category this shot came from — what the deal spreads apart. */
  line: string;
}

const CATEGORIES: CategoryId[] = ['hard', 'printed'];

const CATEGORY_LABEL_KEYS: Record<CategoryId, string> = {
  hard: 'category.hard',
  printed: 'category.printed',
};

/** Folder under `public/products` holding each category's shots. */
const CATEGORY_FOLDERS: Record<CategoryId, string> = {
  hard: 'hard_box',
  printed: 'digital_printed',
};

/**
 * The real catalogue. Each sub-category owns a folder; listing a file name in
 * `images` puts that shot on the wall as its own card. The folders are empty for
 * now, so every line shows a single placeholder card until its pictures land —
 * drop them in and add their names here, in the order they should appear.
 */
const SUBCATEGORIES_BY_CATEGORY: Record<CategoryId, SubCategory[]> = {
  hard: [
    {
      name: { en: 'Top/Base Hard Box', ar: 'علبة صلبة بغطاء وقاعدة' },
      description: { en: 'Classic two-piece rigid box with a lift-off lid.', ar: 'علبة صلبة من قطعتين بغطاء يُرفع عن القاعدة.' },
      folder: 'top_base',
      images: ['1.jpeg', '2.jpeg', '3.jpeg', '4.jpeg', '5.jpeg'],
    },
    {
      name: { en: 'Magnet Hard Box', ar: 'علبة صلبة مغناطيسية' },
      description: { en: 'Rigid box that snaps shut on a hidden magnet.', ar: 'علبة صلبة تُغلق بمغناطيس مخفي.' },
      folder: 'magnet',
      images: ['1.jpeg', '2.jpeg', '3.jpeg', '4.jpeg', '5.jpeg', '6.jpeg', '7.jpeg', '8.jpeg'],
    },
    {
      name: { en: 'Hard Box with Ribbon Closing', ar: 'علبة صلبة بإغلاق بشريط' },
      description: { en: 'Rigid box tied shut with a ribbon in your colours.', ar: 'علبة صلبة تُربط بشريط بألوان علامتك التجارية.' },
      folder: 'ribbon_closing',
      images: ['1.jpeg', '2.jpeg'],
    },
    {
      name: { en: 'Drawer Hard Box', ar: 'علبة صلبة بدرج' },
      description: { en: 'Rigid sleeve and drawer that slides out to reveal the product.', ar: 'علبة صلبة بدرج منزلق يكشف المنتج عند سحبه.' },
      folder: 'drawer',
      images: ['1.jpeg', '2.jpeg'],
    },
  ],
  printed: [
    {
      name: { en: 'Digital Printed Boxes', ar: 'علب مطبوعة رقمياً' },
      description: { en: 'Full-colour boxes printed straight from your artwork.', ar: 'علب مطبوعة بألوان كاملة مباشرة من تصميمك.' },
      folder: 'boxes',
      images: ['1.jpeg', '2.jpeg', '3.jpeg', '4.jpeg', '5.jpeg', '6.jpeg'],
    },
    {
      name: { en: 'Digital Printed Bags', ar: 'أكياس مطبوعة رقمياً' },
      description: { en: 'Paper bags carrying your brand, printed to order.', ar: 'أكياس ورقية تحمل علامتك التجارية وتُطبع حسب الطلب.' },
      folder: 'bags',
      images: ['1.jpeg', '2.jpeg', '3.jpeg', '4.jpeg'],
    },
    {
      name: { en: 'Digital Printed Cards', ar: 'بطاقات مطبوعة رقمياً' },
      description: { en: 'Thank-you and greeting cards for every occasion.', ar: 'بطاقات شكر وتهنئة لكل المناسبات.' },
      folder: 'cards',
      images: ['1.jpeg', '2.jpeg', '3.jpeg', '4.jpeg'],
    },
    {
      name: { en: 'Digital Printed Wrapping Papers', ar: 'أوراق تغليف مطبوعة رقمياً' },
      description: { en: 'Wrapping paper in your own pattern or logo.', ar: 'ورق تغليف بنقشتك أو شعارك الخاص.' },
      folder: 'wrapping_papers',
      images: ['1.jpeg'],
    },
    {
      name: { en: 'Digital Printed Table Numbers', ar: 'أرقام طاولات مطبوعة رقمياً' },
      description: { en: 'Table numbers for weddings and events.', ar: 'أرقام طاولات للأعراس والمناسبات.' },
      folder: 'table_numbers',
      images: ['1.jpeg', '2.jpeg'],
    },
    {
      name: { en: 'Digital Printed Stickers', ar: 'ملصقات مطبوعة رقمياً' },
      description: { en: 'Die-cut stickers and labels in any shape.', ar: 'ملصقات وبطاقات مقصوصة بأي شكل تريده.' },
      folder: 'stickers',
      images: ['1.jpeg'],
    },
  ],
};

/**
 * The wall of cards: every shot of every sub-category, in catalogue order. A
 * sub-category with no shots yet still contributes one card, with an empty `src`
 * that the template renders as the placeholder.
 */
const PRODUCTS: Product[] = CATEGORIES.flatMap((category) =>
  SUBCATEGORIES_BY_CATEGORY[category].flatMap((sub) => {
    const base = `/products/${CATEGORY_FOLDERS[category]}/${sub.folder}`;
    const sources = sub.images.length ? sub.images.map((file) => `${base}/${file}`) : [''];
    return sources.map((src) => ({
      subCategory: sub.name,
      description: sub.description,
      src,
      category,
      line: sub.folder,
    }));
  }),
);

/**
 * The order the cards actually appear in. Catalogue order puts all eight magnet
 * boxes back to back, which reads as one product photographed eight times, so
 * the shots are dealt out instead, spreading every line as far apart as the
 * counts allow. Each category is dealt on its own before the two are woven
 * together, so a category's own view is mixed as well as the wall — dealing the
 * whole catalogue at once looks fine until a pill is pressed and the cards that
 * were separating the magnets disappear. The result is arranged differently on
 * each visit but holds still while the visitor browses it.
 */
const WALL: Product[] = woven(
  CATEGORIES.map((category) => rotated(deal(PRODUCTS.filter((product) => product.category === category)))),
);

/** How many cards fan out on each side of the front one. */
const DECK_REACH = 4;

/** How many times the catalogue is repeated across the marquee track. */
const TRACK_COPIES = 3;

/** Folds an unbounded slot number back onto a valid list index. */
function wrap(value: number, count: number): number {
  return ((value % count) + count) % count;
}

function shuffled<T>(list: T[]): T[] {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Interleaves one category's sub-categories so no two neighbouring cards come
 * from the same one unless the counts leave no choice — always drawing from the
 * largest pile left is what guarantees that. Each pile is shuffled first, so
 * which shot of a line comes up where varies too.
 */
function deal(list: Product[]): Product[] {
  const piles = new Map<string, Product[]>();
  for (const product of list) {
    const pile = piles.get(product.line);
    if (pile) {
      pile.push(product);
    } else {
      piles.set(product.line, [product]);
    }
  }
  for (const [line, pile] of piles) {
    piles.set(line, shuffled(pile));
  }

  const result: Product[] = [];
  let previous = '';
  while (result.length < list.length) {
    // The largest pile that isn't the line just played; falling back to the
    // largest outright once that is all that's left to deal.
    const options = [...piles].filter(([line, pile]) => pile.length > 0 && line !== previous);
    const pool = options.length ? options : [...piles].filter(([, pile]) => pile.length > 0);
    const most = Math.max(...pool.map(([, pile]) => pile.length));
    const tied = pool.filter(([, pile]) => pile.length === most);
    const [line, pile] = tied[Math.floor(Math.random() * tied.length)];
    result.push(pile.pop()!);
    previous = line;
  }
  return result;
}

/**
 * Starts a dealt run at a random point. Drawing from the largest pile first
 * means a deal always opens on the same line — the eight magnet boxes — so the
 * run is cut and rejoined somewhere else instead. Every neighbour in a dealt run
 * already differs, so the only pair this can push together is the old last card
 * and the old first: when those two match, the run is left where it is.
 */
function rotated(list: Product[]): Product[] {
  if (list.length < 3 || list[0].line === list[list.length - 1].line) {
    return list;
  }
  const at = Math.floor(Math.random() * list.length);
  return [...list.slice(at), ...list.slice(0, at)];
}

/**
 * Weaves the category runs into one wall, each run keeping its own order so that
 * filtering the wall back down to a category returns that run intact. Which run
 * gives up the next card is random, weighted by how much of it is left, so the
 * categories stay evenly mixed from end to end. Any weave is safe: two cards can
 * only land side by side if they were already neighbours in one run.
 */
function woven(runs: Product[][]): Product[] {
  const rest = runs.map((run) => [...run].reverse());
  const result: Product[] = [];
  let left = rest.reduce((sum, run) => sum + run.length, 0);
  while (left > 0) {
    let pick = Math.floor(Math.random() * left);
    const run = rest.find((candidate) => (pick -= candidate.length) < 0) ?? rest[0];
    result.push(run.pop()!);
    left--;
  }
  return result;
}

@Component({
  selector: 'app-products',
  imports: [TiltDirective, RevealDirective],
  templateUrl: './products.html',
  styleUrl: './products.css',
  host: {
    '(document:keydown)': 'onKeydown($event)',
  },
})
export class Products implements OnDestroy {
  protected readonly i18n = inject(TranslationService);

  protected readonly categories = CATEGORIES;
  protected readonly activeCategory = signal<CategoryId | 'all'>('all');
  protected readonly brokenImages = signal<ReadonlySet<string>>(new Set());

  /**
   * Filtering the dealt wall rather than the catalogue keeps a category's own
   * view mixed too, and keeps every card where it was: re-dealing here would
   * reshuffle the whole strip each time a pill is pressed.
   */
  protected readonly filteredProducts = computed(() => {
    const active = this.activeCategory();
    return active === 'all' ? WALL : WALL.filter((product) => product.category === active);
  });

  /**
   * The list repeated three times. Two copies would be enough for the marquee's
   * one-way drift, but the user can drag either way: parking the viewport on the
   * middle copy leaves a whole set of runway behind *and* ahead, so a backwards
   * drag has real content to reveal instead of dead-ending on scrollLeft = 0.
   */
  protected readonly trackProducts = computed(() => {
    const list = this.filteredProducts();
    return [...list, ...list, ...list];
  });

  /**
   * Position of the front card in *slot* space, which is deliberately unbounded:
   * it keeps counting past the ends of the list so dragging never hits a seam.
   * The real product index is this value folded back into range.
   */
  protected readonly lightboxAnchor = signal<number | null>(null);

  /**
   * Index of whichever card is at the front *right now* — it follows the drag,
   * so the counter ticks over as the fan slides rather than only on release.
   */
  protected readonly lightboxIndex = computed(() => {
    const count = this.filteredProducts().length;
    if (this.lightboxAnchor() === null || count === 0) {
      return null;
    }
    return wrap(Math.round(this.deckPosition()), count);
  });

  protected readonly lightboxProduct = computed(() => {
    const index = this.lightboxIndex();
    return index === null ? null : (this.filteredProducts()[index] ?? null);
  });

  /** Drives the fan's spacing; cards re-place themselves as the window resizes. */
  private readonly viewportWidth = signal(typeof window === 'undefined' ? 1440 : window.innerWidth);

  /** How far the fan spreads either side — never so far a product repeats. */
  protected readonly deckReach = computed(() => {
    const count = this.filteredProducts().length;
    return Math.max(1, Math.min(DECK_REACH, Math.floor((count - 1) / 2)));
  });

  /**
   * Where the fan currently sits, as a fractional slot. At rest it equals the
   * anchor; mid-drag it moves continuously with the pointer.
   */
  protected readonly deckPosition = computed(() => {
    const anchor = this.lightboxAnchor();
    return anchor === null ? 0 : anchor - this.dragUnits();
  });

  /**
   * The slice of the catalogue rendered as the fan. It re-centres on wherever
   * the fan currently *is* rather than where it last came to rest, so cards keep
   * appearing at the edges throughout a drag and you can keep going forever.
   */
  protected readonly deckCards = computed(() => {
    const list = this.filteredProducts();
    const count = list.length;
    if (this.lightboxAnchor() === null || count === 0) {
      return [];
    }
    const reach = this.deckReach();
    const centre = Math.round(this.deckPosition());
    const cards = [];
    for (let offset = -reach; offset <= reach; offset++) {
      const slot = centre + offset;
      cards.push({ product: list[wrap(slot, count)], slot });
    }
    return cards;
  });

  private readonly viewport = viewChild<ElementRef<HTMLDivElement>>('viewport');
  private readonly track = viewChild<ElementRef<HTMLDivElement>>('track');
  private readonly pills = viewChild<ElementRef<HTMLDivElement>>('pills');

  protected readonly pillsCanScrollStart = signal(false);
  protected readonly pillsCanScrollEnd = signal(false);

  private readonly zone = inject(NgZone);

  private rafId = 0;
  private singleSetWidth = 0;
  private scrollPos = 0;
  private lastTs = 0;
  private readonly speedPxPerMs = 0.036; // ~36px per second, refresh-rate independent
  private pausedByUser = false;
  private resumeTimer: ReturnType<typeof setTimeout> | null = null;
  private isDragging = false;
  private dragPointerId: number | null = null;
  private dragStartX = 0;
  private dragStartScroll = 0;
  private pointerStart: { x: number; y: number } | null = null;
  /** Set once a pointer travels far enough to count as a drag rather than a tap. */
  private dragMoved = false;
  private deckPointerStart: { x: number; y: number } | null = null;
  /** True once a deck gesture has travelled far enough to be a drag, not a tap. */
  private deckMoved = false;
  /** Live drag position in card units; folded into every card's transform. */
  protected readonly dragUnits = signal(0);
  protected readonly dragging = signal(false);

  constructor() {
    afterNextRender(() => {
      this.recentre();
      this.setupInteractions();
      this.zone.runOutsideAngular(() => {
        window.addEventListener('resize', this.onResize, { passive: true });
      });
      this.updatePillOverflow();
      this.rafId = requestAnimationFrame(this.step);
    });

    // Translated category names are a different length, so the row may start or
    // stop overflowing when the language changes.
    effect(() => {
      this.i18n.lang();
      queueMicrotask(() => this.updatePillOverflow());
    });

    effect(() => {
      this.filteredProducts();
      queueMicrotask(() => this.recentre());
    });

    // Lock the page behind the lightbox so a scroll gesture can't drift the
    // section underneath while the overlay is up.
    effect(() => {
      const open = this.lightboxAnchor() !== null;
      if (typeof document !== 'undefined') {
        document.body.style.overflow = open ? 'hidden' : '';
      }
    });
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
    if (this.resumeTimer) {
      clearTimeout(this.resumeTimer);
    }
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
    window.removeEventListener('resize', this.onResize);
    const el = this.viewport()?.nativeElement;
    if (el) {
      el.removeEventListener('pointerdown', this.onPointerDown);
      el.removeEventListener('pointermove', this.onPointerMove);
      el.removeEventListener('pointerup', this.onPointerUp);
      el.removeEventListener('pointercancel', this.onPointerUp);
      el.removeEventListener('scroll', this.onScroll);
      el.removeEventListener('wheel', this.onWheel);
    }
  }

  /** Resolves a localized string for the active language. */
  protected text(value: Localized): string {
    return value[this.i18n.lang()];
  }

  protected categoryLabel(category: CategoryId): string {
    return this.i18n.t(CATEGORY_LABEL_KEYS[category]);
  }

  /**
   * Whether the category row has more pills hidden past either edge. Chrome
   * reports scrollLeft as a negative offset under RTL, so distance travelled is
   * taken as an absolute value and both directions share one calculation.
   */
  updatePillOverflow(): void {
    const el = this.pills()?.nativeElement;
    if (!el) {
      return;
    }
    const travelled = Math.abs(el.scrollLeft);
    const maximum = el.scrollWidth - el.clientWidth;
    this.pillsCanScrollStart.set(travelled > 1);
    this.pillsCanScrollEnd.set(travelled < maximum - 1);
  }

  private readonly step = (ts: number): void => {
    const el = this.viewport()?.nativeElement;
    const dt = this.lastTs ? Math.min(ts - this.lastTs, 50) : 16;
    this.lastTs = ts;
    const paused = this.pausedByUser || this.lightboxAnchor() !== null;
    if (el && this.singleSetWidth > 0 && !paused) {
      // The strip travels the way the language reads: right-to-left in English,
      // left-to-right in Arabic. The list is repeated, so the wrap at either end
      // lands on identical content and the reversal stays seamless.
      this.scrollPos = this.normalize(this.scrollPos + this.directionSign() * this.speedPxPerMs * dt);
      // Drive the scroll from our own float accumulator instead of reading
      // scrollLeft back each frame: mobile Safari floors scrollLeft to an
      // integer, so sub-pixel increments were lost and the marquee never moved.
      el.scrollLeft = this.scrollPos;
    }
    this.rafId = requestAnimationFrame(this.step);
  };

  private measure(): void {
    const trackEl = this.track()?.nativeElement;
    this.singleSetWidth = trackEl ? trackEl.scrollWidth / TRACK_COPIES : 0;
  }

  /** Parks the strip on the middle copy, so both directions have runway. */
  private recentre(): void {
    const el = this.viewport()?.nativeElement;
    this.measure();
    this.scrollPos = this.singleSetWidth;
    if (el) {
      el.scrollLeft = this.scrollPos;
    }
  }

  /**
   * Folds a scroll offset back onto the middle copy. Every copy is identical, so
   * shifting by exactly one set width is invisible — it just buys back the
   * runway the gesture spent. Returns the offset unchanged when there is nothing
   * to fold onto.
   */
  private normalize(scroll: number): number {
    const width = this.singleSetWidth;
    if (width <= 0) {
      return scroll;
    }
    // Folded on a half-set of slack rather than at the copy's exact edge: a
    // touch scroll is folded by writing scrollLeft, which cuts the fling short
    // on iOS, so the boundary is kept well away from where a swipe comes to rest.
    if (scroll < width * 0.5) {
      return scroll + width;
    }
    if (scroll >= width * 1.5) {
      return scroll - width;
    }
    return scroll;
  }

  setCategory(category: CategoryId | 'all'): void {
    this.activeCategory.set(category);
  }

  pillClasses(category: CategoryId | 'all'): string {
    const base = 'shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition';
    return this.activeCategory() === category
      ? `${base} bg-navy-900 text-white`
      : `${base} bg-navy-900/5 text-slate-600 hover:bg-navy-900/10`;
  }

  onImageError(src: string): void {
    this.brokenImages.update((set) => new Set(set).add(src));
  }

  // --- Lightbox -------------------------------------------------------------

  /**
   * `trackIndex` addresses the doubled marquee list, so it is folded back onto
   * the real product list. A click that followed a drag is ignored — otherwise
   * every swipe of the carousel would pop the overlay open.
   */
  openLightbox(trackIndex: number): void {
    if (this.dragMoved) {
      return;
    }
    const count = this.filteredProducts().length;
    if (count === 0) {
      return;
    }
    this.lightboxAnchor.set(trackIndex % count);
  }

  closeLightbox(): void {
    this.lightboxAnchor.set(null);
  }

  /** Backdrop taps dismiss, but a drag that ended on the backdrop must not. */
  onBackdropClick(): void {
    if (this.deckMoved) {
      this.deckMoved = false;
      return;
    }
    this.closeLightbox();
  }

  onDeckPointerDown(event: PointerEvent): void {
    this.deckPointerStart = { x: event.clientX, y: event.clientY };
    this.deckMoved = false;
  }

  /**
   * Drives the fan straight from the pointer: one card-gap of travel moves the
   * fan by exactly one card, so dragging feels like sliding the whole hand
   * rather than triggering a step. Identical for mouse and touch.
   */
  onDeckPointerMove(event: PointerEvent): void {
    const start = this.deckPointerStart;
    if (!start) {
      return;
    }
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;

    if (!this.deckMoved) {
      if (Math.hypot(dx, dy) < 8) {
        return;
      }
      // A mostly-vertical drag isn't meant for the fan; let it go entirely so it
      // can't nudge the cards sideways.
      if (Math.abs(dx) < Math.abs(dy)) {
        this.deckPointerStart = null;
        return;
      }
      this.deckMoved = true;
      this.dragging.set(true);
    }

    // Unclamped on purpose: the rendered window follows deckPosition, so fresh
    // cards keep arriving at the edges no matter how far the drag runs. The sign
    // flips in Arabic so the cards still follow the pointer exactly.
    this.dragUnits.set((dx / this.cardGap()) * this.directionSign());
  }

  onDeckPointerUp(): void {
    const start = this.deckPointerStart;
    this.deckPointerStart = null;
    if (!start || !this.deckMoved) {
      this.releaseDrag();
      return;
    }
    // Settle on whichever card is nearest to the front, then let the CSS
    // transition carry the fan the rest of the way.
    const shift = -Math.round(this.dragUnits());
    this.releaseDrag();
    if (shift !== 0) {
      this.stepLightbox(shift);
    }
  }

  onDeckPointerCancel(): void {
    this.deckPointerStart = null;
    this.deckMoved = false;
    this.releaseDrag();
  }

  private releaseDrag(): void {
    this.dragUnits.set(0);
    this.dragging.set(false);
  }

  stepLightbox(delta: number): void {
    const count = this.filteredProducts().length;
    const current = this.lightboxAnchor();
    if (current === null || count === 0) {
      return;
    }
    // Deliberately not wrapped — the anchor stays continuous so the fan's slots
    // never jump, and lightboxIndex folds it back into range for display.
    this.lightboxAnchor.set(current + delta);
  }

  /** Brings a card that is sitting off to one side of the fan to the front. */
  focusCard(slot: number): void {
    if (this.deckMoved) {
      return;
    }
    this.lightboxAnchor.set(slot);
  }

  /** Horizontal distance between neighbouring cards; also the drag-to-card ratio. */
  private cardGap(): number {
    const width = this.viewportWidth();
    return width < 640 ? 40 : width < 1024 ? 82 : 104;
  }

  /**
   * Mirrors the fan for Arabic: later products sit to the left and the deck
   * advances left-to-right, matching the direction the page is read in.
   */
  private directionSign(): number {
    return this.i18n.isRtl() ? -1 : 1;
  }

  /**
   * A card's placement in the fan, from how far it sits from the front. The live
   * drag amount is folded in here, so the whole fan tracks the pointer
   * continuously instead of jumping a card at a time.
   */
  protected cardTransform(slot: number): string {
    const offset = slot - this.deckPosition();
    const width = this.viewportWidth();
    const angle = width < 640 ? 6 : 7;
    const lift = width < 640 ? 10 : 14;
    const distance = Math.abs(offset);
    const scale = Math.max(0.6, 1 - distance * 0.055);
    // Only the horizontal placement and the tilt mirror; the arc's lift and the
    // depth scaling are the same whichever way the fan runs.
    const across = offset * this.directionSign();
    return (
      `translateX(${(across * this.cardGap()).toFixed(1)}px) ` +
      `translateY(${(distance * lift).toFixed(1)}px) ` +
      `rotate(${(across * angle).toFixed(1)}deg) ` +
      `scale(${scale.toFixed(3)})`
    );
  }

  /**
   * Solid through most of the fan, fading out only across the last card's worth
   * of distance — so cards joining at the edge mid-drag fade in instead of
   * blinking into existence.
   */
  protected cardOpacity(slot: number): number {
    const distance = Math.abs(slot - this.deckPosition());
    return Math.max(0, Math.min(1, (this.deckReach() - distance) / 1.1));
  }

  protected cardZIndex(slot: number): number {
    return 100 - Math.round(Math.abs(slot - this.deckPosition()) * 10);
  }

  protected isFrontCard(slot: number): boolean {
    return Math.abs(slot - this.deckPosition()) < 0.5;
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.lightboxAnchor() === null) {
      return;
    }
    if (event.key === 'Escape') {
      this.closeLightbox();
      return;
    }
    // Arrow keys follow the on-screen arrows, which mirror in RTL.
    const forward = this.i18n.isRtl() ? 'ArrowLeft' : 'ArrowRight';
    const backward = this.i18n.isRtl() ? 'ArrowRight' : 'ArrowLeft';
    if (event.key === forward) {
      event.preventDefault();
      this.stepLightbox(1);
    } else if (event.key === backward) {
      event.preventDefault();
      this.stepLightbox(-1);
    }
  }

  // --- Carousel interaction -------------------------------------------------

  private setupInteractions(): void {
    const el = this.viewport()?.nativeElement;
    if (!el) {
      return;
    }
    this.zone.runOutsideAngular(() => {
      el.addEventListener('pointerdown', this.onPointerDown);
      el.addEventListener('pointermove', this.onPointerMove);
      el.addEventListener('pointerup', this.onPointerUp);
      el.addEventListener('pointercancel', this.onPointerUp);
      el.addEventListener('scroll', this.onScroll, { passive: true });
      el.addEventListener('wheel', this.onWheel, { passive: true });
    });
  }

  private pauseForUser(): void {
    this.pausedByUser = true;
    if (this.resumeTimer) {
      clearTimeout(this.resumeTimer);
      this.resumeTimer = null;
    }
  }

  // Resume the auto-advance only after the user's scrolling — including any
  // fling/momentum — has been idle for a beat. Writing scrollLeft while the
  // browser is still touch-scrolling is what made the carousel stutter.
  private scheduleResume(): void {
    if (this.resumeTimer) {
      clearTimeout(this.resumeTimer);
    }
    this.resumeTimer = setTimeout(() => {
      const el = this.viewport()?.nativeElement;
      if (el) {
        // Hand a folded position back to the marquee: a fling that ran past the
        // slack, or one the browser clamped at either end, must not become the
        // accumulator the auto-advance carries on from.
        this.scrollPos = this.normalize(el.scrollLeft);
        el.scrollLeft = this.scrollPos;
      }
      this.pausedByUser = false;
      this.resumeTimer = null;
    }, 700);
  }

  private readonly onScroll = (): void => {
    // A mouse drag ends explicitly on pointerup, so never let the idle-resume
    // timer fire mid-drag — that would resume the marquee and make its
    // scrollLeft writes fight the drag. Idle-resume is only for touch/wheel.
    if (!this.pausedByUser || this.isDragging) {
      return;
    }
    const el = this.viewport()?.nativeElement;
    if (el) {
      // Touch and wheel scroll the element themselves, so fold them back onto
      // the middle copy here. A whole set has to be crossed before this fires,
      // so it stays clear of the ordinary swipe that would otherwise have its
      // momentum cut short by the write.
      const folded = this.normalize(el.scrollLeft);
      if (folded !== el.scrollLeft) {
        el.scrollLeft = folded;
      }
      this.scrollPos = folded;
    }
    this.scheduleResume();
  };

  private readonly onResize = (): void => {
    this.zone.run(() => {
      this.viewportWidth.set(window.innerWidth);
      this.updatePillOverflow();
    });
  };

  private readonly onWheel = (): void => {
    this.pauseForUser();
    this.scheduleResume();
  };

  private readonly onPointerDown = (event: PointerEvent): void => {
    const el = this.viewport()?.nativeElement;
    if (!el) {
      return;
    }
    this.pauseForUser();
    this.pointerStart = { x: event.clientX, y: event.clientY };
    this.dragMoved = false;

    if (event.pointerType !== 'mouse') {
      // Touch: let the browser own the scroll natively; we resume once it goes
      // idle so our writes never fight the swipe or its momentum.
      return;
    }
    this.isDragging = true;
    this.dragPointerId = event.pointerId;
    this.dragStartX = event.clientX;
    this.dragStartScroll = el.scrollLeft;
    // Capture is deliberately NOT taken here. While a pointer is captured the
    // browser retargets the resulting `click` to the capturing element, so
    // capturing on pointerdown would stop every card click from ever reaching
    // the card's own handler. Capture is taken in onPointerMove instead, once
    // the gesture has proven itself to be a drag rather than a click.
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    if (this.pointerStart && !this.dragMoved) {
      const dx = event.clientX - this.pointerStart.x;
      const dy = event.clientY - this.pointerStart.y;
      if (Math.hypot(dx, dy) > 8) {
        this.dragMoved = true;
        // Now that this is unambiguously a drag, take capture so the gesture
        // keeps working if the pointer leaves the strip mid-drag.
        if (this.isDragging && this.dragPointerId !== null) {
          this.viewport()?.nativeElement.setPointerCapture(this.dragPointerId);
        }
      }
    }
    if (!this.isDragging) {
      return;
    }
    const el = this.viewport()?.nativeElement;
    if (!el) {
      return;
    }
    // Fold the drag back onto the middle copy as it goes, and shift the gesture's
    // origin by the same amount so the card under the pointer doesn't move. This
    // is what lets a backwards drag keep going instead of jamming on scrollLeft = 0.
    const delta = event.clientX - this.dragStartX;
    const target = this.dragStartScroll - delta;
    const folded = this.normalize(target);
    this.dragStartScroll += folded - target;
    el.scrollLeft = folded;
    this.scrollPos = folded;
  };

  private readonly onPointerUp = (): void => {
    const el = this.viewport()?.nativeElement;
    this.pointerStart = null;
    if (this.isDragging) {
      this.isDragging = false;
      // Capture is only taken once a drag passes the threshold, so releasing it
      // unconditionally would throw on a plain click.
      if (el && this.dragPointerId !== null && el.hasPointerCapture(this.dragPointerId)) {
        el.releasePointerCapture(this.dragPointerId);
      }
      this.dragPointerId = null;
      if (el) {
        this.scrollPos = this.normalize(el.scrollLeft);
        el.scrollLeft = this.scrollPos;
      }
      // Mouse drag ended — resume promptly.
      this.pausedByUser = false;
      if (this.resumeTimer) {
        clearTimeout(this.resumeTimer);
        this.resumeTimer = null;
      }
      return;
    }
    // Touch or tap ended — resume once scrolling settles.
    this.scheduleResume();
  };
}
