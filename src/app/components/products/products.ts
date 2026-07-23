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

type CategoryId = 'cardboard' | 'plastic' | 'hard' | 'printing' | 'souvenir' | 'bags' | 'ribbons';

/** A string that exists in both languages, resolved at render time by `text()`. */
type Localized = Record<Lang, string>;

interface Product {
  name: Localized;
  description: Localized;
  /** File name only; the folder it lives in is the category id. */
  image: string;
  // Display-only label shown in the card badge. Does not affect filtering.
  subCategory: Localized;
  category: CategoryId;
}

const CATEGORIES: CategoryId[] = [
  'cardboard',
  'plastic',
  'hard',
  'printing',
  'souvenir',
  'bags',
  'ribbons',
];

const CATEGORY_LABEL_KEYS: Record<CategoryId, string> = {
  cardboard: 'category.cardboard',
  plastic: 'category.plastic',
  hard: 'category.hard',
  printing: 'category.printing',
  souvenir: 'category.souvenir',
  bags: 'category.bags',
  ribbons: 'category.ribbons',
};

/** Folder under `public/products` holding each category's shots. */
const CATEGORY_FOLDERS: Record<CategoryId, string> = {
  cardboard: 'cardboard_boxes',
  plastic: 'plastic_boxes',
  hard: 'hard_cover_boxes',
  printing: 'digital_printing',
  souvenir: 'souvenir_boxes',
  bags: 'cardboard_bags',
  ribbons: 'ribbons',
};

type ProductSeed = Omit<Product, 'category'>;

const PRODUCTS_BY_CATEGORY: Record<CategoryId, ProductSeed[]> = {
  cardboard: [
    {
      name: { en: 'Corrugated Shipping Box', ar: 'علبة شحن مضلّعة' },
      description: { en: 'Standard shipping box for e-commerce orders.', ar: 'علبة شحن قياسية لطلبات التجارة الإلكترونية.' },
      image: 'cardboard_boxes_1.png',
      subCategory: { en: 'Corrugated', ar: 'مضلّع' },
    },
    {
      name: { en: 'Double Wall Export Carton', ar: 'كرتونة تصدير مزدوجة الجدار' },
      description: { en: 'Reinforced carton for heavy export loads.', ar: 'كرتونة معزّزة للأحمال الثقيلة والتصدير.' },
      image: 'cardboard_boxes_2.png',
      subCategory: { en: 'Export', ar: 'تصدير' },
    },
    {
      name: { en: 'Die-Cut Retail Box', ar: 'علبة تجزئة مقصوصة بالقالب' },
      description: { en: 'Custom die-cut box for retail display.', ar: 'علبة مقصوصة حسب الطلب للعرض في المتاجر.' },
      image: 'cardboard_boxes_3.png',
      subCategory: { en: 'Retail', ar: 'تجزئة' },
    },
    {
      name: { en: 'Mailer Box', ar: 'علبة بريدية' },
      description: { en: 'Self-locking mailer for direct-to-consumer shipping.', ar: 'علبة ذاتية الإغلاق للشحن المباشر إلى المستهلك.' },
      image: 'cardboard_boxes_4.png',
      subCategory: { en: 'Mailer', ar: 'بريدي' },
    },
    {
      name: { en: 'Corrugated Tray', ar: 'صينية مضلّعة' },
      description: { en: 'Open tray for produce and bulk goods.', ar: 'صينية مفتوحة للخضار والبضائع السائبة.' },
      image: 'cardboard_boxes_5.png',
      subCategory: { en: 'Tray', ar: 'صينية' },
    },
    {
      name: { en: 'Archive Storage Box', ar: 'علبة أرشفة' },
      description: { en: 'Stackable box for document archiving.', ar: 'علبة قابلة للتكديس لحفظ المستندات.' },
      image: 'cardboard_boxes_6.png',
      subCategory: { en: 'Archive', ar: 'أرشفة' },
    },
    {
      name: { en: 'Pizza Box', ar: 'علبة بيتزا' },
      description: { en: 'Grease-resistant box for food delivery.', ar: 'علبة مقاومة للدهون لتوصيل الطعام.' },
      image: 'cardboard_boxes_7.png',
      subCategory: { en: 'Food', ar: 'أغذية' },
    },
    {
      name: { en: 'Moving Box', ar: 'علبة نقل أثاث' },
      description: { en: 'Heavy-duty box for household moving.', ar: 'علبة متينة لنقل الأثاث المنزلي.' },
      image: 'cardboard_boxes_8.png',
      subCategory: { en: 'Moving', ar: 'نقل' },
    },
    {
      name: { en: 'Printed Carton', ar: 'كرتونة مطبوعة' },
      description: { en: 'Full-color printed carton for branding.', ar: 'كرتونة مطبوعة بألوان كاملة لإبراز العلامة التجارية.' },
      image: 'cardboard_boxes_9.png',
      subCategory: { en: 'Printed', ar: 'مطبوع' },
    },
    {
      name: { en: 'Flat Pack Carton', ar: 'كرتونة مسطّحة التغليف' },
      description: { en: 'Space-saving flat-pack carton.', ar: 'كرتونة مسطّحة توفّر المساحة عند التخزين.' },
      image: 'cardboard_boxes_10.png',
      subCategory: { en: 'Flat Pack', ar: 'مسطّح' },
    },
  ],
  plastic: [
    {
      name: { en: 'Stackable Storage Bin', ar: 'صندوق تخزين قابل للتكديس' },
      description: { en: 'Durable bin for warehouse storage.', ar: 'صندوق متين لتخزين المستودعات.' },
      image: 'plastic_boxes_1.png',
      subCategory: { en: 'Storage', ar: 'تخزين' },
    },
    {
      name: { en: 'Clear Display Box', ar: 'علبة عرض شفافة' },
      description: { en: 'Transparent box for retail display.', ar: 'علبة شفافة للعرض في المتاجر.' },
      image: 'plastic_boxes_2.png',
      subCategory: { en: 'Display', ar: 'عرض' },
    },
    {
      name: { en: 'Hinged Container', ar: 'حاوية بغطاء مفصلي' },
      description: { en: 'Snap-lid container for small parts.', ar: 'حاوية بغطاء يُغلق بإحكام للقطع الصغيرة.' },
      image: 'plastic_boxes_3.png',
      subCategory: { en: 'Hinged', ar: 'مفصلي' },
    },
    {
      name: { en: 'Produce Crate', ar: 'صندوق خضار' },
      description: { en: 'Ventilated crate for fresh produce.', ar: 'صندوق مهوّى للخضار والفواكه الطازجة.' },
      image: 'plastic_boxes_4.png',
      subCategory: { en: 'Produce', ar: 'خضار' },
    },
    {
      name: { en: 'Modular Tote Box', ar: 'صندوق نقل معياري' },
      description: { en: 'Stackable tote for logistics.', ar: 'صندوق قابل للتكديس للخدمات اللوجستية.' },
      image: 'plastic_boxes_5.png',
      subCategory: { en: 'Tote', ar: 'نقل' },
    },
    {
      name: { en: 'Injection Molded Case', ar: 'علبة مصنّعة بالحقن' },
      description: { en: 'Precision case for tools or parts.', ar: 'علبة دقيقة للأدوات أو القطع.' },
      image: 'plastic_boxes_6.png',
      subCategory: { en: 'Molded', ar: 'حقن' },
    },
    {
      name: { en: 'Food-Grade Container', ar: 'حاوية غذائية' },
      description: { en: 'Sealed container for food storage.', ar: 'حاوية محكمة الإغلاق لحفظ الأطعمة.' },
      image: 'plastic_boxes_7.png',
      subCategory: { en: 'Food Grade', ar: 'غذائي' },
    },
    {
      name: { en: 'Divided Organizer Box', ar: 'علبة تنظيم مقسّمة' },
      description: { en: 'Compartmented box for small items.', ar: 'علبة بفواصل داخلية للأغراض الصغيرة.' },
      image: 'plastic_boxes_8.png',
      subCategory: { en: 'Organizer', ar: 'تنظيم' },
    },
    {
      name: { en: 'Nesting Crate', ar: 'صندوق متداخل' },
      description: { en: 'Space-saving nesting crate.', ar: 'صندوق متداخل يوفّر المساحة.' },
      image: 'plastic_boxes_9.png',
      subCategory: { en: 'Nesting', ar: 'متداخل' },
    },
    {
      name: { en: 'Industrial Parts Bin', ar: 'صندوق قطع صناعية' },
      description: { en: 'Heavy-duty bin for industrial parts.', ar: 'صندوق شديد التحمّل لقطع الغيار الصناعية.' },
      image: 'plastic_boxes_10.png',
      subCategory: { en: 'Industrial', ar: 'صناعي' },
    },
  ],
  hard: [
    {
      name: { en: 'Rigid Gift Box', ar: 'علبة هدايا صلبة' },
      description: { en: 'Sturdy rigid box for premium gifting.', ar: 'علبة صلبة متينة للهدايا الفاخرة.' },
      image: 'hard_cover_boxes_1.png',
      subCategory: { en: 'Gift', ar: 'هدايا' },
    },
    {
      name: { en: 'Magnetic Closure Box', ar: 'علبة بإغلاق مغناطيسي' },
      description: { en: 'Rigid box with magnetic flap closure.', ar: 'علبة صلبة بغطاء يُغلق مغناطيسياً.' },
      image: 'hard_cover_boxes_2.png',
      subCategory: { en: 'Magnetic', ar: 'مغناطيسي' },
    },
    {
      name: { en: 'Two-Piece Rigid Box', ar: 'علبة صلبة من قطعتين' },
      description: { en: 'Classic lid-and-base rigid box.', ar: 'علبة صلبة كلاسيكية بغطاء وقاعدة.' },
      image: 'hard_cover_boxes_3.png',
      subCategory: { en: 'Two-Piece', ar: 'قطعتان' },
    },
    {
      name: { en: 'Rigid Presentation Case', ar: 'علبة عرض صلبة' },
      description: { en: 'Display-ready rigid case.', ar: 'علبة صلبة جاهزة للعرض.' },
      image: 'hard_cover_boxes_4.png',
      subCategory: { en: 'Presentation', ar: 'عرض' },
    },
    {
      name: { en: 'Rigid Jewelry Box', ar: 'علبة مجوهرات صلبة' },
      description: { en: 'Compact rigid box for jewelry.', ar: 'علبة صلبة صغيرة للمجوهرات.' },
      image: 'hard_cover_boxes_5.png',
      subCategory: { en: 'Jewelry', ar: 'مجوهرات' },
    },
    {
      name: { en: 'Rigid Bottle Box', ar: 'علبة زجاجات صلبة' },
      description: { en: 'Fitted rigid box for bottles.', ar: 'علبة صلبة مفصّلة على قياس الزجاجات.' },
      image: 'hard_cover_boxes_6.png',
      subCategory: { en: 'Bottle', ar: 'زجاجات' },
    },
    {
      name: { en: 'Rigid Drawer Box', ar: 'علبة صلبة بدرج' },
      description: { en: 'Sliding drawer-style rigid box.', ar: 'علبة صلبة بدرج منزلق.' },
      image: 'hard_cover_boxes_7.png',
      subCategory: { en: 'Drawer', ar: 'درج' },
    },
    {
      name: { en: 'Rigid Book-Style Box', ar: 'علبة صلبة على شكل كتاب' },
      description: { en: 'Book-shaped rigid box with hinge.', ar: 'علبة صلبة بشكل كتاب مزوّدة بمفصلة.' },
      image: 'hard_cover_boxes_8.png',
      subCategory: { en: 'Book-Style', ar: 'كتاب' },
    },
    {
      name: { en: 'Rigid Sample Box', ar: 'علبة عيّنات صلبة' },
      description: { en: 'Small rigid box for product samples.', ar: 'علبة صلبة صغيرة لعيّنات المنتجات.' },
      image: 'hard_cover_boxes_9.png',
      subCategory: { en: 'Sample', ar: 'عيّنات' },
    },
    {
      name: { en: "Rigid Collector's Box", ar: 'علبة صلبة للمقتنيات' },
      description: { en: 'Premium rigid box for collectibles.', ar: 'علبة صلبة فاخرة للمقتنيات النادرة.' },
      image: 'hard_cover_boxes_10.png',
      subCategory: { en: 'Collector', ar: 'مقتنيات' },
    },
  ],
  printing: [
    {
      name: { en: 'Custom Printed Label', ar: 'ملصق مطبوع حسب الطلب' },
      description: { en: 'High-resolution custom label printing.', ar: 'طباعة ملصقات عالية الدقة حسب الطلب.' },
      image: 'digital_printing_1.png',
      subCategory: { en: 'Label', ar: 'ملصق' },
    },
    {
      name: { en: 'Branded Tissue Paper', ar: 'ورق حرير بعلامتك التجارية' },
      description: { en: 'Printed tissue paper for gift wrap.', ar: 'ورق حرير مطبوع لتغليف الهدايا.' },
      image: 'digital_printing_2.png',
      subCategory: { en: 'Tissue', ar: 'ورق حرير' },
    },
    {
      name: { en: 'Printed Ribbon', ar: 'شريط مطبوع' },
      description: { en: 'Custom branded ribbon.', ar: 'شريط مطبوع يحمل علامتك التجارية.' },
      image: 'digital_printing_3.png',
      subCategory: { en: 'Ribbon', ar: 'شريط' },
    },
    {
      name: { en: 'Product Hang Tag', ar: 'بطاقة تعليق للمنتج' },
      description: { en: 'Printed tag for apparel and gifts.', ar: 'بطاقة مطبوعة للألبسة والهدايا.' },
      image: 'digital_printing_4.png',
      subCategory: { en: 'Hang Tag', ar: 'بطاقة تعليق' },
    },
    {
      name: { en: 'Custom Sticker Sheet', ar: 'ورقة ملصقات مخصّصة' },
      description: { en: 'Die-cut sticker sheet, full color.', ar: 'ورقة ملصقات مقصوصة بالقالب بألوان كاملة.' },
      image: 'digital_printing_5.png',
      subCategory: { en: 'Stickers', ar: 'ملصقات' },
    },
    {
      name: { en: 'Printed Wrapping Paper', ar: 'ورق تغليف مطبوع' },
      description: { en: 'Custom pattern wrapping paper.', ar: 'ورق تغليف بنقشة مخصّصة.' },
      image: 'digital_printing_6.png',
      subCategory: { en: 'Wrapping', ar: 'تغليف' },
    },
    {
      name: { en: 'Branded Sleeve', ar: 'غلاف بعلامتك التجارية' },
      description: { en: 'Printed sleeve for cups or packaging.', ar: 'غلاف مطبوع للأكواب أو العبوات.' },
      image: 'digital_printing_7.png',
      subCategory: { en: 'Sleeve', ar: 'غلاف' },
    },
    {
      name: { en: 'Custom Insert Card', ar: 'بطاقة إدراج مخصّصة' },
      description: { en: 'Printed insert for unboxing experience.', ar: 'بطاقة مطبوعة تُثري تجربة فتح العلبة.' },
      image: 'digital_printing_8.png',
      subCategory: { en: 'Insert', ar: 'إدراج' },
    },
    {
      name: { en: 'Printed Poly Mailer', ar: 'مغلّف شحن بلاستيكي مطبوع' },
      description: { en: 'Custom printed poly shipping mailer.', ar: 'مغلّف شحن بلاستيكي مطبوع حسب الطلب.' },
      image: 'digital_printing_9.png',
      subCategory: { en: 'Poly Mailer', ar: 'مغلّف شحن' },
    },
    {
      name: { en: 'Branded Packing Tape', ar: 'شريط لاصق بعلامتك التجارية' },
      description: { en: 'Printed tape for branded sealing.', ar: 'شريط لاصق مطبوع لإغلاق الطرود.' },
      image: 'digital_printing_10.png',
      subCategory: { en: 'Tape', ar: 'شريط لاصق' },
    },
  ],
  souvenir: [
    {
      name: { en: 'Keepsake Memory Box', ar: 'علبة ذكريات' },
      description: { en: 'Decorative box for keepsakes.', ar: 'علبة مزخرفة لحفظ الذكريات.' },
      image: 'souvenir_boxes_1.png',
      subCategory: { en: 'Keepsake', ar: 'ذكريات' },
    },
    {
      name: { en: 'Travel Souvenir Box', ar: 'علبة تذكارات السفر' },
      description: { en: 'Compact box for travel mementos.', ar: 'علبة صغيرة لتذكارات الأسفار.' },
      image: 'souvenir_boxes_2.png',
      subCategory: { en: 'Travel', ar: 'سفر' },
    },
    {
      name: { en: 'Wooden-Style Souvenir Case', ar: 'علبة تذكارية بمظهر خشبي' },
      description: { en: 'Wood-finish case for souvenirs.', ar: 'علبة بتشطيب خشبي للتذكارات.' },
      image: 'souvenir_boxes_3.png',
      subCategory: { en: 'Wooden', ar: 'خشبي' },
    },
    {
      name: { en: 'Cultural Gift Box', ar: 'علبة هدايا تراثية' },
      description: { en: 'Box designed for cultural gift items.', ar: 'علبة مصمّمة للهدايا التراثية.' },
      image: 'souvenir_boxes_4.png',
      subCategory: { en: 'Cultural', ar: 'تراثي' },
    },
    {
      name: { en: 'Miniature Display Box', ar: 'علبة عرض مصغّرة' },
      description: { en: 'Small box for miniature collectibles.', ar: 'علبة صغيرة للمجسّمات المصغّرة.' },
      image: 'souvenir_boxes_5.png',
      subCategory: { en: 'Miniature', ar: 'مصغّر' },
    },
    {
      name: { en: 'Anniversary Keepsake Box', ar: 'علبة ذكرى سنوية' },
      description: { en: 'Box for anniversary keepsakes.', ar: 'علبة لحفظ هدايا الذكرى السنوية.' },
      image: 'souvenir_boxes_6.png',
      subCategory: { en: 'Anniversary', ar: 'ذكرى سنوية' },
    },
    {
      name: { en: 'Engraved Souvenir Case', ar: 'علبة تذكارية محفورة' },
      description: { en: 'Case designed for engraved items.', ar: 'علبة مصمّمة للقطع المحفورة.' },
      image: 'souvenir_boxes_7.png',
      subCategory: { en: 'Engraved', ar: 'محفور' },
    },
    {
      name: { en: 'Festival Gift Box', ar: 'علبة هدايا الأعياد' },
      description: { en: 'Festive box for seasonal souvenirs.', ar: 'علبة احتفالية للتذكارات الموسمية.' },
      image: 'souvenir_boxes_8.png',
      subCategory: { en: 'Festival', ar: 'أعياد' },
    },
    {
      name: { en: 'Tourist Gift Set Box', ar: 'علبة هدايا سياحية' },
      description: { en: 'Box for tourist gift assortments.', ar: 'علبة لمجموعات الهدايا السياحية.' },
      image: 'souvenir_boxes_9.png',
      subCategory: { en: 'Tourist', ar: 'سياحي' },
    },
    {
      name: { en: 'Commemorative Box', ar: 'علبة تذكارية' },
      description: { en: 'Box for commemorative items.', ar: 'علبة للقطع التذكارية.' },
      image: 'souvenir_boxes_10.png',
      subCategory: { en: 'Commemorative', ar: 'تذكاري' },
    },
  ],
  bags: [
    {
      name: { en: 'Kraft Shopping Bag', ar: 'كيس تسوّق كرافت' },
      description: { en: 'Everyday kraft bag with twisted handles.', ar: 'كيس كرافت يومي بمقابض ملفوفة.' },
      image: 'cardboard_bags_1.png',
      subCategory: { en: 'Kraft', ar: 'كرافت' },
    },
    {
      name: { en: 'Laminated Boutique Bag', ar: 'كيس بوتيك مغلّف' },
      description: { en: 'Matt-laminated bag for retail boutiques.', ar: 'كيس بتغليف مطفي لمحلات البوتيك.' },
      image: 'cardboard_bags_2.png',
      subCategory: { en: 'Boutique', ar: 'بوتيك' },
    },
    {
      name: { en: 'Rope Handle Gift Bag', ar: 'كيس هدايا بمقبض حبلي' },
      description: { en: 'Gift bag finished with rope handles.', ar: 'كيس هدايا بمقابض من الحبل.' },
      image: 'cardboard_bags_3.png',
      subCategory: { en: 'Gift', ar: 'هدايا' },
    },
    {
      name: { en: 'Food Takeaway Bag', ar: 'كيس طعام للتوصيل' },
      description: { en: 'Grease-resistant bag for food takeaway.', ar: 'كيس مقاوم للدهون لتوصيل الطعام.' },
      image: 'cardboard_bags_4.png',
      subCategory: { en: 'Food', ar: 'أغذية' },
    },
    {
      name: { en: 'Wine Bottle Bag', ar: 'كيس زجاجات' },
      description: { en: 'Tall bag sized for bottles.', ar: 'كيس طويل مفصّل على قياس الزجاجات.' },
      image: 'cardboard_bags_5.png',
      subCategory: { en: 'Bottle', ar: 'زجاجات' },
    },
    {
      name: { en: 'Printed Promotional Bag', ar: 'كيس دعائي مطبوع' },
      description: { en: 'Full-color bag for events and campaigns.', ar: 'كيس مطبوع بألوان كاملة للفعاليات والحملات.' },
      image: 'cardboard_bags_6.png',
      subCategory: { en: 'Promotional', ar: 'دعائي' },
    },
    {
      name: { en: 'Flat Handle Paper Bag', ar: 'كيس ورقي بمقبض مسطّح' },
      description: { en: 'Classic paper bag with flat handles.', ar: 'كيس ورقي كلاسيكي بمقابض مسطّحة.' },
      image: 'cardboard_bags_7.png',
      subCategory: { en: 'Classic', ar: 'كلاسيكي' },
    },
    {
      name: { en: 'Pharmacy Bag', ar: 'كيس صيدلية' },
      description: { en: 'Compact bag for pharmacy counters.', ar: 'كيس صغير لطاولات الصيدليات.' },
      image: 'cardboard_bags_8.png',
      subCategory: { en: 'Pharmacy', ar: 'صيدلية' },
    },
    {
      name: { en: 'Luxury Gusset Bag', ar: 'كيس فاخر موسّع' },
      description: { en: 'Wide-gusset bag for premium packaging.', ar: 'كيس بجوانب موسّعة للتغليف الفاخر.' },
      image: 'cardboard_bags_9.png',
      subCategory: { en: 'Luxury', ar: 'فاخر' },
    },
    {
      name: { en: 'Recycled Paper Bag', ar: 'كيس ورق معاد تدويره' },
      description: { en: 'Bag made from recycled paper stock.', ar: 'كيس مصنوع من ورق معاد تدويره.' },
      image: 'cardboard_bags_10.png',
      subCategory: { en: 'Recycled', ar: 'معاد تدويره' },
    },
  ],
  ribbons: [
    {
      name: { en: 'Satin Ribbon', ar: 'شريط ساتان' },
      description: { en: 'Smooth satin ribbon for gift finishing.', ar: 'شريط ساتان ناعم لتزيين الهدايا.' },
      image: 'ribbons_1.png',
      subCategory: { en: 'Satin', ar: 'ساتان' },
    },
    {
      name: { en: 'Grosgrain Ribbon', ar: 'شريط غروغران' },
      description: { en: 'Ribbed ribbon with a firm hold.', ar: 'شريط مضلّع يحافظ على شكله.' },
      image: 'ribbons_2.png',
      subCategory: { en: 'Grosgrain', ar: 'غروغران' },
    },
    {
      name: { en: 'Organza Ribbon', ar: 'شريط أورغانزا' },
      description: { en: 'Sheer ribbon for delicate wrapping.', ar: 'شريط شفاف للتغليف الرقيق.' },
      image: 'ribbons_3.png',
      subCategory: { en: 'Organza', ar: 'أورغانزا' },
    },
    {
      name: { en: 'Printed Logo Ribbon', ar: 'شريط مطبوع بالشعار' },
      description: { en: 'Ribbon printed with your brand logo.', ar: 'شريط مطبوع عليه شعار علامتك التجارية.' },
      image: 'ribbons_4.png',
      subCategory: { en: 'Branded', ar: 'مطبوع' },
    },
    {
      name: { en: 'Metallic Ribbon', ar: 'شريط معدني اللمعة' },
      description: { en: 'Foil-finish ribbon for festive packaging.', ar: 'شريط بلمسة معدنية للتغليف الاحتفالي.' },
      image: 'ribbons_5.png',
      subCategory: { en: 'Metallic', ar: 'معدني' },
    },
    {
      name: { en: 'Velvet Ribbon', ar: 'شريط مخمل' },
      description: { en: 'Soft velvet ribbon for luxury boxes.', ar: 'شريط مخمل ناعم للعلب الفاخرة.' },
      image: 'ribbons_6.png',
      subCategory: { en: 'Velvet', ar: 'مخمل' },
    },
    {
      name: { en: 'Pre-Tied Bow', ar: 'عقدة جاهزة' },
      description: { en: 'Ready-made bow for fast finishing.', ar: 'عقدة جاهزة لتزيين سريع.' },
      image: 'ribbons_7.png',
      subCategory: { en: 'Bow', ar: 'عقدة' },
    },
    {
      name: { en: 'Curling Ribbon', ar: 'شريط لولبي' },
      description: { en: 'Curlable ribbon for gift bundles.', ar: 'شريط قابل للفتل لتزيين الهدايا.' },
      image: 'ribbons_8.png',
      subCategory: { en: 'Curling', ar: 'لولبي' },
    },
    {
      name: { en: 'Woven Edge Ribbon', ar: 'شريط بحواف منسوجة' },
      description: { en: 'Woven-edge ribbon that resists fraying.', ar: 'شريط بحواف منسوجة لا تتفكك.' },
      image: 'ribbons_9.png',
      subCategory: { en: 'Woven', ar: 'منسوج' },
    },
    {
      name: { en: 'Recycled Cotton Ribbon', ar: 'شريط قطن معاد تدويره' },
      description: { en: 'Cotton ribbon from recycled fibre.', ar: 'شريط قطني من ألياف معاد تدويرها.' },
      image: 'ribbons_10.png',
      subCategory: { en: 'Recycled', ar: 'معاد تدويره' },
    },
  ],
};

const PRODUCTS: Product[] = CATEGORIES.flatMap((category) =>
  PRODUCTS_BY_CATEGORY[category].map((item) => ({ ...item, category })),
);

/** How many cards fan out on each side of the front one. */
const DECK_REACH = 4;

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

  protected readonly filteredProducts = computed(() => {
    const active = this.activeCategory();
    return active === 'all'
      ? shuffled(PRODUCTS)
      : PRODUCTS.filter((product) => product.category === active);
  });

  protected readonly trackProducts = computed(() => {
    const list = this.filteredProducts();
    return [...list, ...list];
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
      this.measure();
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
      queueMicrotask(() => {
        const el = this.viewport()?.nativeElement;
        if (el) {
          el.scrollLeft = 0;
        }
        this.scrollPos = 0;
        this.measure();
      });
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

  /** Product shots are filed under a folder per category. */
  protected imageSrc(product: Product): string {
    return `/products/${CATEGORY_FOLDERS[product.category]}/${product.image}`;
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
      // left-to-right in Arabic. The list is duplicated, so the wrap at either
      // end lands on identical content and the reversal stays seamless.
      this.scrollPos += this.directionSign() * this.speedPxPerMs * dt;
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

  setCategory(category: CategoryId | 'all'): void {
    this.activeCategory.set(category);
  }

  pillClasses(category: CategoryId | 'all'): string {
    const base = 'shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition';
    return this.activeCategory() === category
      ? `${base} bg-navy-900 text-white`
      : `${base} bg-navy-900/5 text-slate-600 hover:bg-navy-900/10`;
  }

  onImageError(image: string): void {
    this.brokenImages.update((set) => new Set(set).add(image));
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
    const delta = event.clientX - this.dragStartX;
    el.scrollLeft = this.dragStartScroll - delta;
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
