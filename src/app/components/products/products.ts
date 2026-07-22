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

type Category = 'Cardboard Boxes' | 'Plastic Boxes' | 'Hard Boxes' | 'Digital Printing' | 'Souvenir Boxes';

interface Product {
  name: string;
  description: string;
  image: string;
  // Display-only label shown in the card badge. Does not affect filtering.
  subCategory: string;
  category: Category;
}

const CATEGORIES: Category[] = [
  'Cardboard Boxes',
  'Plastic Boxes',
  'Hard Boxes',
  'Digital Printing',
  'Souvenir Boxes',
];

const PRODUCTS_BY_CATEGORY: Record<
  Category,
  Array<{ name: string; description: string; image: string; subCategory: string }>
> = {
  'Cardboard Boxes': [
    { name: 'Corrugated Shipping Box', description: 'Standard shipping box for e-commerce orders.', image: 'cardboard_boxes_1.png', subCategory: 'Corrugated' },
    { name: 'Double Wall Export Carton', description: 'Reinforced carton for heavy export loads.', image: 'cardboard_boxes_2.png', subCategory: 'Export' },
    { name: 'Die-Cut Retail Box', description: 'Custom die-cut box for retail display.', image: 'cardboard_boxes_3.png', subCategory: 'Retail' },
    { name: 'Mailer Box', description: 'Self-locking mailer for direct-to-consumer shipping.', image: 'cardboard_boxes_4.png', subCategory: 'Mailer' },
    { name: 'Corrugated Tray', description: 'Open tray for produce and bulk goods.', image: 'cardboard_boxes_5.png', subCategory: 'Tray' },
    { name: 'Archive Storage Box', description: 'Stackable box for document archiving.', image: 'cardboard_boxes_6.png', subCategory: 'Archive' },
    { name: 'Pizza Box', description: 'Grease-resistant box for food delivery.', image: 'cardboard_boxes_7.png', subCategory: 'Food' },
    { name: 'Moving Box', description: 'Heavy-duty box for household moving.', image: 'cardboard_boxes_8.png', subCategory: 'Moving' },
    { name: 'Printed Carton', description: 'Full-color printed carton for branding.', image: 'cardboard_boxes_9.png', subCategory: 'Printed' },
    { name: 'Flat Pack Carton', description: 'Space-saving flat-pack carton.', image: 'cardboard_boxes_10.png', subCategory: 'Flat Pack' },
  ],
  'Plastic Boxes': [
    { name: 'Stackable Storage Bin', description: 'Durable bin for warehouse storage.', image: 'plastic_boxes_1.png', subCategory: 'Storage' },
    { name: 'Clear Display Box', description: 'Transparent box for retail display.', image: 'plastic_boxes_2.png', subCategory: 'Display' },
    { name: 'Hinged Container', description: 'Snap-lid container for small parts.', image: 'plastic_boxes_3.png', subCategory: 'Hinged' },
    { name: 'Produce Crate', description: 'Ventilated crate for fresh produce.', image: 'plastic_boxes_4.png', subCategory: 'Produce' },
    { name: 'Modular Tote Box', description: 'Stackable tote for logistics.', image: 'plastic_boxes_5.png', subCategory: 'Tote' },
    { name: 'Injection Molded Case', description: 'Precision case for tools or parts.', image: 'plastic_boxes_6.png', subCategory: 'Molded' },
    { name: 'Food-Grade Container', description: 'Sealed container for food storage.', image: 'plastic_boxes_7.png', subCategory: 'Food Grade' },
    { name: 'Divided Organizer Box', description: 'Compartmented box for small items.', image: 'plastic_boxes_8.png', subCategory: 'Organizer' },
    { name: 'Nesting Crate', description: 'Space-saving nesting crate.', image: 'plastic_boxes_9.png', subCategory: 'Nesting' },
    { name: 'Industrial Parts Bin', description: 'Heavy-duty bin for industrial parts.', image: 'plastic_boxes_10.png', subCategory: 'Industrial' },
  ],
  'Hard Boxes': [
    { name: 'Rigid Gift Box', description: 'Sturdy rigid box for premium gifting.', image: 'hard_boxes_1.png', subCategory: 'Gift' },
    { name: 'Magnetic Closure Box', description: 'Rigid box with magnetic flap closure.', image: 'hard_boxes_2.png', subCategory: 'Magnetic' },
    { name: 'Two-Piece Rigid Box', description: 'Classic lid-and-base rigid box.', image: 'hard_boxes_3.png', subCategory: 'Two-Piece' },
    { name: 'Rigid Presentation Case', description: 'Display-ready rigid case.', image: 'hard_boxes_4.png', subCategory: 'Presentation' },
    { name: 'Rigid Jewelry Box', description: 'Compact rigid box for jewelry.', image: 'hard_boxes_5.png', subCategory: 'Jewelry' },
    { name: 'Rigid Bottle Box', description: 'Fitted rigid box for bottles.', image: 'hard_boxes_6.png', subCategory: 'Bottle' },
    { name: 'Rigid Drawer Box', description: 'Sliding drawer-style rigid box.', image: 'hard_boxes_7.png', subCategory: 'Drawer' },
    { name: "Rigid Book-Style Box", description: 'Book-shaped rigid box with hinge.', image: 'hard_boxes_8.png', subCategory: 'Book-Style' },
    { name: 'Rigid Sample Box', description: 'Small rigid box for product samples.', image: 'hard_boxes_9.png', subCategory: 'Sample' },
    { name: "Rigid Collector's Box", description: 'Premium rigid box for collectibles.', image: 'hard_boxes_10.png', subCategory: 'Collector' },
  ],
  'Digital Printing': [
    { name: 'Custom Printed Label', description: 'High-resolution custom label printing.', image: 'digital_printing_1.png', subCategory: 'Label' },
    { name: 'Branded Tissue Paper', description: 'Printed tissue paper for gift wrap.', image: 'digital_printing_2.png', subCategory: 'Tissue' },
    { name: 'Printed Ribbon', description: 'Custom branded ribbon.', image: 'digital_printing_3.png', subCategory: 'Ribbon' },
    { name: 'Product Hang Tag', description: 'Printed tag for apparel and gifts.', image: 'digital_printing_4.png', subCategory: 'Hang Tag' },
    { name: 'Custom Sticker Sheet', description: 'Die-cut sticker sheet, full color.', image: 'digital_printing_5.png', subCategory: 'Stickers' },
    { name: 'Printed Wrapping Paper', description: 'Custom pattern wrapping paper.', image: 'digital_printing_6.png', subCategory: 'Wrapping' },
    { name: 'Branded Sleeve', description: 'Printed sleeve for cups or packaging.', image: 'digital_printing_7.png', subCategory: 'Sleeve' },
    { name: 'Custom Insert Card', description: 'Printed insert for unboxing experience.', image: 'digital_printing_8.png', subCategory: 'Insert' },
    { name: 'Printed Poly Mailer', description: 'Custom printed poly shipping mailer.', image: 'digital_printing_9.png', subCategory: 'Poly Mailer' },
    { name: 'Branded Packing Tape', description: 'Printed tape for branded sealing.', image: 'digital_printing_10.png', subCategory: 'Tape' },
  ],
  'Souvenir Boxes': [
    { name: 'Keepsake Memory Box', description: 'Decorative box for keepsakes.', image: 'souvenir_boxes_1.png', subCategory: 'Keepsake' },
    { name: 'Travel Souvenir Box', description: 'Compact box for travel mementos.', image: 'souvenir_boxes_2.png', subCategory: 'Travel' },
    { name: 'Wooden-Style Souvenir Case', description: 'Wood-finish case for souvenirs.', image: 'souvenir_boxes_3.png', subCategory: 'Wooden' },
    { name: 'Cultural Gift Box', description: 'Box designed for cultural gift items.', image: 'souvenir_boxes_4.png', subCategory: 'Cultural' },
    { name: 'Miniature Display Box', description: 'Small box for miniature collectibles.', image: 'souvenir_boxes_5.png', subCategory: 'Miniature' },
    { name: 'Anniversary Keepsake Box', description: 'Box for anniversary keepsakes.', image: 'souvenir_boxes_6.png', subCategory: 'Anniversary' },
    { name: 'Engraved Souvenir Case', description: 'Case designed for engraved items.', image: 'souvenir_boxes_7.png', subCategory: 'Engraved' },
    { name: 'Festival Gift Box', description: 'Festive box for seasonal souvenirs.', image: 'souvenir_boxes_8.png', subCategory: 'Festival' },
    { name: 'Tourist Gift Set Box', description: 'Box for tourist gift assortments.', image: 'souvenir_boxes_9.png', subCategory: 'Tourist' },
    { name: 'Commemorative Box', description: 'Box for commemorative items.', image: 'souvenir_boxes_10.png', subCategory: 'Commemorative' },
  ],
};

const PRODUCTS: Product[] = CATEGORIES.flatMap((category) =>
  PRODUCTS_BY_CATEGORY[category].map((item) => ({ ...item, category })),
);

function shuffled<T>(list: T[]): T[] {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

@Component({
  selector: 'app-products',
  imports: [TiltDirective],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnDestroy {
  protected readonly categories = CATEGORIES;
  protected readonly activeCategory = signal<Category | 'All'>('All');
  protected readonly brokenImages = signal<ReadonlySet<string>>(new Set());

  protected readonly filteredProducts = computed(() => {
    const active = this.activeCategory();
    return active === 'All'
      ? shuffled(PRODUCTS)
      : PRODUCTS.filter((product) => product.category === active);
  });

  protected readonly trackProducts = computed(() => {
    const list = this.filteredProducts();
    return [...list, ...list];
  });

  private readonly viewport = viewChild<ElementRef<HTMLDivElement>>('viewport');
  private readonly track = viewChild<ElementRef<HTMLDivElement>>('track');

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

  constructor() {
    afterNextRender(() => {
      this.measure();
      this.setupInteractions();
      this.rafId = requestAnimationFrame(this.step);
    });

    effect(() => {
      this.filteredProducts();
      queueMicrotask(() => {
        const el = this.viewport()?.nativeElement;
        if (el) {
          el.scrollLeft = 0;
        }
        this.scrollPos = 0;
        this.measure();
      });
    });
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
    if (this.resumeTimer) {
      clearTimeout(this.resumeTimer);
    }
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

  private readonly step = (ts: number): void => {
    const el = this.viewport()?.nativeElement;
    const dt = this.lastTs ? Math.min(ts - this.lastTs, 50) : 16;
    this.lastTs = ts;
    if (el && this.singleSetWidth > 0 && !this.pausedByUser) {
      this.scrollPos += this.speedPxPerMs * dt;
      if (this.scrollPos >= this.singleSetWidth) {
        this.scrollPos -= this.singleSetWidth;
      } else if (this.scrollPos < 0) {
        this.scrollPos += this.singleSetWidth;
      }
      // Drive the scroll from our own float accumulator instead of reading
      // scrollLeft back each frame: mobile Safari floors scrollLeft to an
      // integer, so sub-pixel increments were lost and the marquee never moved.
      el.scrollLeft = this.scrollPos;
    }
    this.rafId = requestAnimationFrame(this.step);
  };

  private measure(): void {
    const trackEl = this.track()?.nativeElement;
    this.singleSetWidth = trackEl ? trackEl.scrollWidth / 2 : 0;
  }

  setCategory(category: Category | 'All'): void {
    this.activeCategory.set(category);
  }

  pillClasses(category: Category | 'All'): string {
    const base = 'shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition';
    return this.activeCategory() === category
      ? `${base} bg-navy-900 text-white`
      : `${base} bg-navy-900/5 text-slate-600 hover:bg-navy-900/10`;
  }

  onImageError(image: string): void {
    this.brokenImages.update((set) => new Set(set).add(image));
  }

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
        this.scrollPos = el.scrollLeft;
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
      this.scrollPos = el.scrollLeft;
    }
    this.scheduleResume();
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

    if (event.pointerType !== 'mouse') {
      // Touch: let the browser own the scroll natively; we resume once it goes
      // idle so our writes never fight the swipe or its momentum.
      return;
    }
    this.isDragging = true;
    this.dragPointerId = event.pointerId;
    this.dragStartX = event.clientX;
    this.dragStartScroll = el.scrollLeft;
    el.setPointerCapture(event.pointerId);
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    if (!this.isDragging) {
      return;
    }
    const el = this.viewport()?.nativeElement;
    if (!el) {
      return;
    }
    const delta = event.clientX - this.dragStartX;
    el.scrollLeft = this.dragStartScroll - delta;
  };

  private readonly onPointerUp = (): void => {
    const el = this.viewport()?.nativeElement;
    if (this.isDragging) {
      this.isDragging = false;
      if (el && this.dragPointerId !== null) {
        el.releasePointerCapture(this.dragPointerId);
      }
      this.dragPointerId = null;
      if (el) {
        this.scrollPos = el.scrollLeft;
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
