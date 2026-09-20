export type Lang = 'en' | 'ar';

export const LANGS: Lang[] = ['en', 'ar'];

/**
 * Flat key/value dictionaries. Every user-facing string in the app lives here so
 * a language switch is a single signal write with no page reload. Keys missing
 * from `ar` fall back to `en` (see TranslationService.t).
 */
export const TRANSLATIONS: Record<Lang, Record<string, string>> = {
  en: {
    'lang.name': 'English',
    'lang.other': 'العربية',
    'lang.switch': 'Switch to Arabic',

    'brand.name': 'PLASTIBAN',
    'brand.full': 'Plastiban Technical Industry S.A.R.L',

    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.services': 'Services',
    'nav.products': 'Products',
    'nav.contact': 'Contact',
    'nav.quote': 'Get a Quote',
    'nav.toggleMenu': 'Toggle navigation menu',
    'nav.primary': 'Primary',

    'hero.title.lead': 'Packaging & industrial plastics,',
    'hero.title.accent': 'engineered to endure.',
    'hero.subtitle':
      'Nearly three decades of continuous growth, driven by a dedicated team that never stops refining how we design, manufacture and deliver, from creative packaging to precision technical plastics.',
    'hero.scroll': 'Scroll',
    'hero.scrollAria': 'Scroll to the About section',

    'clients.eyebrow': 'Trusted by',
    'clients.label': 'Companies we have worked with',

    'about.eyebrow': 'Who we are',
    'about.yearLabel': 'The year it began',
    'about.heading': 'A family of makers, refining the craft of packaging for three decades.',
    'about.body':
      'Plastiban Technical Industry S.A.R.L was founded in 1989. Our path has led us to continuous growth, thanks to a dedicated and faithful team of professionals who have worked with us to continuously innovate and improve our techniques and methodologies, turning everyday packaging into something considered and enduring.',
    'about.stat.founded': 'Founded',
    'about.stat.years': 'Years operating',
    'about.stat.countries': 'Countries',
    'about.stat.refinements': 'Refinements',
    'about.feature.team.title': 'Faithful team',
    'about.feature.team.description': 'Professionals invested in every project.',
    'about.feature.innovation.title': 'Continuous innovation',
    'about.feature.innovation.description': 'Always improving techniques & methods.',
    'about.feature.endToEnd.title': 'Design to delivery',
    'about.feature.endToEnd.description': 'One partner across the whole journey.',
    'about.feature.reach.title': 'Local & global',
    'about.feature.reach.description': 'Serving Lebanon and the U.A.E.',

    'services.eyebrow': 'What we do',
    'services.heading': 'End to end, under one roof.',
    'services.intro':
      'From the first sketch to finished product design, manufacturing and technical plastics, delivered locally and abroad.',
    'services.creative.title': 'Creative Conception',
    'services.creative.description':
      'Design and creative direction for packaging and product identity, from concept to prototype.',
    'services.manufacturing.title': 'Manufacturing',
    'services.manufacturing.description':
      'End-to-end production of boxes, trays and bags in a full range of sizes and finishes.',
    'services.plastics.title': 'Industrial Plastics',
    'services.plastics.description':
      'Technical plastics manufacturing built on decades of process expertise.',
    'services.logistics.title': 'Logistics & Transfer',
    'services.logistics.description':
      'Reliable delivery and logistics for clients locally and abroad.',

    'products.eyebrow': 'Portfolio',
    'products.heading': 'Our Products',
    'products.all': 'All',
    'products.hint': 'Tap any product to view it larger.',
    'products.filters': 'Product categories',

    'category.hard': 'Hard Box',
    'category.printed': 'Digital Printed',

    'lightbox.close': 'Close',
    'lightbox.prev': 'Previous product',
    'lightbox.next': 'Next product',
    'lightbox.title': 'Product preview',
    'lightbox.dragHint': 'Drag to browse',

    'contact.eyebrow': 'Get in touch',
    'contact.heading': "Let's build something that lasts.",
    'contact.intro':
      'Reach our teams in Lebanon or the United Arab Emirates, we usually reply within one business day.',
    'contact.office.lb.name': 'Plastiban Technical Industry S.A.R.L',
    'contact.office.lb.address': 'Ain al Tineh - Sakiat al Janzir, Beirut, Lebanon',
    'contact.office.lb.label': 'Ain al Tineh, Beirut',
    'contact.office.ae.name': 'Plastiban Packaging Factory L.L.C',
    'contact.office.ae.address': 'New Industrial Area - Umm Al Quwain, United Arab Emirates',
    'contact.office.ae.label': 'Umm Al Quwain, U.A.E.',
    'contact.map.hint': 'Tap a pin to open the location in Google Maps.',
    'contact.map.reset': 'Reset map view',
    'contact.form.title': 'Send us a message',
    'contact.form.office': 'Send to',
    'contact.form.office.lb': 'Lebanon',
    'contact.form.office.ae': 'U.A.E.',
    'contact.form.name': 'Name',
    'contact.form.namePlaceholder': 'Full name',
    'contact.form.contact': 'Contact',
    'contact.form.phone': 'Phone number',
    'contact.form.email': 'Email address',
    'contact.form.contactHint': 'Enter at least one - phone or email.',
    'contact.form.contactError':
      'Please enter an email address or a phone number so we can reach you.',
    'contact.form.message': 'Message',
    'contact.form.messagePlaceholder': 'Tell us about your project',
    'contact.form.submit': 'Send Message',
    'contact.form.success': "Thanks — your message has been noted. We'll be in touch shortly.",

    'footer.rights': 'All rights reserved.',
    'footer.follow': 'Follow us',
    'social.instagram.lb': 'Instagram — Lebanon',
    'social.instagram.ae': 'Instagram — UAE',
    'social.country.lb': 'Lebanon',
    'social.country.ae': 'UAE',
    'social.facebook': 'Facebook',
    'social.whatsapp': 'WhatsApp',

    'seo.title':
      'Plastiban — Packaging & Industrial Plastics Manufacturer | Lebanon & U.A.E.',
    'seo.description':
      'Plastiban Technical Industry S.A.R.L has manufactured packaging and technical plastics since 1989. Cardboard, plastic, rigid and souvenir boxes plus digital printing, made in Lebanon and the U.A.E.',
  },

  ar: {
    'lang.name': 'العربية',
    'lang.other': 'English',
    'lang.switch': 'التبديل إلى الإنكليزية',

    'brand.name': 'بلاستيبان',
    'brand.full': 'بلاستيبان للصناعات التقنية ش.م.م',

    'nav.home': 'الرئيسية',
    'nav.about': 'من نحن',
    'nav.services': 'خدماتنا',
    'nav.products': 'منتجاتنا',
    'nav.contact': 'اتصل بنا',
    'nav.quote': 'اطلب عرض سعر',
    'nav.toggleMenu': 'فتح قائمة التنقل',
    'nav.primary': 'الرئيسية',

    'hero.title.lead': 'تغليف وبلاستيك صناعي،',
    'hero.title.accent': 'مصنوع ليدوم.',
    'hero.subtitle':
      'قرابة ثلاثة عقود من النمو المتواصل، بفضل فريق لا يتوقف عن تطوير طريقة تصميمنا وتصنيعنا وتسليمنا، من التغليف الإبداعي إلى البلاستيك التقني الدقيق.',
    'hero.scroll': 'مرّر للأسفل',
    'hero.scrollAria': 'الانتقال إلى قسم من نحن',

    'clients.eyebrow': 'يثقون بنا',
    'clients.label': 'شركات عملنا معها',

    'about.eyebrow': 'من نحن',
    'about.yearLabel': 'عام البداية',
    'about.heading': 'عائلة من الصنّاع، تصقل حرفة التغليف منذ ثلاثة عقود.',
    'about.body':
      'تأسست شركة بلاستيبان للصناعات التقنية ش.م.م عام ١٩٨٩. قادنا مسارنا إلى نموّ متواصل بفضل فريق مخلص من المحترفين عمل معنا على الابتكار الدائم وتحسين تقنياتنا وأساليبنا، فحوّلنا التغليف اليومي إلى صناعة مدروسة تدوم.',
    'about.stat.founded': 'سنة التأسيس',
    'about.stat.years': 'سنة من العمل',
    'about.stat.countries': 'دولتان',
    'about.stat.refinements': 'تحسينات مستمرة',
    'about.feature.team.title': 'فريق مخلص',
    'about.feature.team.description': 'محترفون يضعون خبرتهم في كل مشروع.',
    'about.feature.innovation.title': 'ابتكار مستمر',
    'about.feature.innovation.description': 'تطوير دائم للتقنيات والأساليب.',
    'about.feature.endToEnd.title': 'من التصميم إلى التسليم',
    'about.feature.endToEnd.description': 'شريك واحد على امتداد الرحلة.',
    'about.feature.reach.title': 'محلياً وعالمياً',
    'about.feature.reach.description': 'نخدم لبنان والإمارات العربية المتحدة.',

    'services.eyebrow': 'ماذا نقدّم',
    'services.heading': 'من الفكرة إلى التسليم، تحت سقف واحد.',
    'services.intro':
      'من الرسم الأول إلى المنتج النهائي: تصميم وتصنيع وبلاستيك تقني، نسلّمه محلياً وخارج الحدود.',
    'services.creative.title': 'التصميم الإبداعي',
    'services.creative.description':
      'تصميم وإدارة إبداعية للتغليف وهوية المنتج، من الفكرة إلى النموذج الأولي.',
    'services.manufacturing.title': 'التصنيع',
    'services.manufacturing.description':
      'إنتاج متكامل للعلب والصواني والأكياس بمقاسات وتشطيبات متنوّعة.',
    'services.plastics.title': 'البلاستيك الصناعي',
    'services.plastics.description':
      'تصنيع بلاستيك تقني مبني على عقود من الخبرة في العمليات الإنتاجية.',
    'services.logistics.title': 'الخدمات اللوجستية والنقل',
    'services.logistics.description': 'تسليم موثوق وخدمات لوجستية للعملاء محلياً وخارج الحدود.',

    'products.eyebrow': 'أعمالنا',
    'products.heading': 'منتجاتنا',
    'products.all': 'الكل',
    'products.hint': 'اضغط على أي منتج لعرضه بحجم أكبر.',
    'products.filters': 'فئات المنتجات',

    'category.hard': 'علب صلبة',
    'category.printed': 'طباعة رقمية',

    'lightbox.close': 'إغلاق',
    'lightbox.prev': 'المنتج السابق',
    'lightbox.next': 'المنتج التالي',
    'lightbox.title': 'معاينة المنتج',
    'lightbox.dragHint': 'اسحب للتصفّح',

    'contact.eyebrow': 'تواصل معنا',
    'contact.heading': 'لنصنع معاً ما يدوم.',
    'contact.intro':
      'تواصل مع فريقنا في لبنان أو الإمارات العربية المتحدة، وعادةً ما نردّ خلال يوم عمل واحد.',
    'contact.office.lb.name': 'بلاستيبان للصناعات التقنية ش.م.م',
    'contact.office.lb.address': 'عين التينة - ساقية الجنزير، بيروت، لبنان',
    'contact.office.lb.label': 'عين التينة، بيروت',
    'contact.office.ae.name': 'مصنع بلاستيبان للتعبئة والتغليف ذ.م.م',
    'contact.office.ae.address': 'المنطقة الصناعية الجديدة - أم القيوين، الإمارات العربية المتحدة',
    'contact.office.ae.label': 'أم القيوين، الإمارات',
    'contact.map.hint': 'اضغط على أي علامة لفتح الموقع في خرائط غوغل.',
    'contact.map.reset': 'إعادة ضبط عرض الخريطة',
    'contact.form.title': 'أرسل لنا رسالة',
    'contact.form.office': 'إرسال إلى',
    'contact.form.office.lb': 'لبنان',
    'contact.form.office.ae': 'الإمارات',
    'contact.form.name': 'الاسم',
    'contact.form.namePlaceholder': 'الاسم الكامل',
    'contact.form.contact': 'وسيلة التواصل',
    'contact.form.phone': 'رقم الهاتف',
    'contact.form.email': 'البريد الإلكتروني',
    'contact.form.contactHint': 'أدخل وسيلة واحدة على الأقل — هاتف أو بريد إلكتروني.',
    'contact.form.contactError':
      'يرجى إدخال بريد إلكتروني أو رقم هاتف لنتمكّن من التواصل معك.',
    'contact.form.message': 'الرسالة',
    'contact.form.messagePlaceholder': 'أخبرنا عن مشروعك',
    'contact.form.submit': 'إرسال الرسالة',
    'contact.form.success': 'شكراً لك — وصلتنا رسالتك وسنتواصل معك قريباً.',

    'footer.rights': 'جميع الحقوق محفوظة.',
    'footer.follow': 'تابعنا',
    'social.instagram.lb': 'إنستغرام — لبنان',
    'social.instagram.ae': 'إنستغرام — الإمارات',
    'social.country.lb': 'لبنان',
    'social.country.ae': 'الإمارات',
    'social.facebook': 'فيسبوك',
    'social.whatsapp': 'واتساب',

    'seo.title': 'بلاستيبان — تصنيع التغليف والبلاستيك الصناعي | لبنان والإمارات',
    'seo.description':
      'تصنّع بلاستيبان للصناعات التقنية ش.م.م مواد التغليف والبلاستيك التقني منذ عام ١٩٨٩: علب كرتون وبلاستيك وعلب صلبة وتذكارية وطباعة رقمية، صناعة لبنانية وإماراتية.',
  },
};
