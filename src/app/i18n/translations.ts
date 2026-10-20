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
    'nav.about': 'About Us',
    'nav.products': 'Products',
    'nav.whoWeAre': 'Who we are',
    'nav.vision': 'Vision & mission',
    'nav.portfolio': 'Portfolio',
    'nav.capabilities': 'Manufacturing & printing',
    'nav.howWeWork': 'How we work',
    'nav.contact': 'Contact',
    'nav.toggleMenu': 'Toggle navigation menu',
    'nav.primary': 'Primary',

    'hero.title.lead': 'Premium Packaging',
    'hero.title.accent': 'Made to Make an Impression',
    'hero.subtitle':
      'For more than three decades, Plastiban has been creating distinctive packaging solutions for brands, businesses and special occasions.',
    'hero.subtitle2':
      'From concept to production, we bring ideas to life through thoughtful design, quality materials and in-house manufacturing.',
    'hero.scroll': 'Scroll',
    'hero.scrollAria': 'Scroll to the About section',

    'clients.eyebrow': 'Trusted by',
    'clients.label': 'Companies we have worked with',

    'about.eyebrow': 'Who we are',
    'about.heading': 'More than packaging. A complete manufacturing partner',
    'about.body':
      'Since 1989, Plastiban has combined experience, craftsmanship and manufacturing expertise to create packaging that does more than protect a product. It becomes part of the experience.',
    'about.timelineLabel': 'How we got here',
    'about.timeline.founded.year': '1989',
    'about.timeline.founded.title': 'Plastiban was founded',
    'about.timeline.founded.description': 'The beginning of our packaging journey.',
    'about.timeline.production.year': '2006',
    'about.timeline.production.title': 'Expanding our production capabilities',
    'about.timeline.production.description':
      'We invested in new machinery and production lines to develop more innovative products and deliver better quality.',
    'about.timeline.expansion.year': '2022',
    'about.timeline.expansion.title': 'Expanding into the U.A.E.',
    'about.timeline.expansion.description':
      'We opened our second branch in the United Arab Emirates, extending our presence in the region.',
    'about.timeline.luxury.year': '2024',
    'about.timeline.luxury.title': 'Introducing luxury packaging and digital printing',
    'about.timeline.luxury.description':
      'We introduced hardcover packaging and digital printing, enabling high-quality customization with low minimum order quantities and making our products more accessible to businesses of all sizes.',
    'about.timeline.today.year': 'Today',
    'about.timeline.today.title': 'Two markets, one standard',
    'about.timeline.today.description':
      'We continue to deliver quality, customization and attention to detail across Lebanon and the U.A.E.',

    'capabilities.eyebrow': 'What we do',
    'capabilities.heading': 'Manufacturing & Printing',
    'capabilities.intro':
      'Printing, cutting, and finishing are all handled in-house at our facilities in Lebanon and the United Arab Emirates, ensuring complete control and consistent quality at every stage of production.',
    'capabilities.offset.title': 'Offset Printing',
    'capabilities.offset.description':
      'High-quality printing for sharp details, consistent colors and professional packaging results.',
    'capabilities.digital.title': 'Digital Printing',
    'capabilities.digital.description': 'Flexible printing for customized designs and short production runs.',
    'capabilities.dieCutting.title': 'Die-Cutting',
    'capabilities.dieCutting.description':
      'Precision cutting and creasing to create custom packaging shapes and structures.',
    'capabilities.router.title': 'Router Cutting',
    'capabilities.router.description':
      'Accurate routing for intricate cuts, custom shapes and specialized packaging components.',
    'capabilities.lamination.title': 'Lamination',
    'capabilities.lamination.description':
      'Protective and decorative finishes that enhance packaging durability and appearance.',
    'capabilities.finishing.title': 'Premium Finishing',
    'capabilities.finishing.description':
      'Hot foil stamping, embossing, debossing and spot UV to add texture, shine, contrast and distinctive detail.',

    'process.eyebrow': 'How we work',
    'process.heading': 'From an idea to the finished package',
    'process.lead': 'If you can imagine it, we can work towards making it',
    'process.steps': 'Our process, step by step',
    'process.understand.title': 'Understand',
    'process.understand.description':
      'We start with your product, brand, quantities, dimensions, budget and intended use.',
    'process.develop.title': 'Develop',
    'process.develop.description':
      'Our team works out the structure, materials and details that bring the concept together.',
    'process.prototype.title': 'Prototype',
    'process.prototype.description':
      'A physical sample lets you see, feel and evaluate the packaging before production begins.',
    'process.manufacture.title': 'Manufacture',
    'process.manufacture.description':
      'Once approved, your packaging moves into production in our own facilities, with careful attention to consistency and quality.',
    'process.finishing.title': 'Finishing & details',
    'process.finishing.description':
      'Bringing every detail together with refined craftsmanship and considered finishing touches.',
    'process.deliver.title': 'Deliver',
    'process.deliver.description':
      'The finished packaging is prepared to the agreed requirements and ready for your product.',

    'vision.eyebrow': 'Looking ahead',
    'vision.heading': 'To create packaging that people remember',
    'vision.body':
      'We believe great packaging can turn an ordinary idea into an experience. Our vision is to continue developing innovative, high-quality packaging solutions while growing our presence across the region.',
    'vision.missionLabel': 'Our mission',
    'vision.missionHeading':
      'To make exceptional packaging accessible to every brand and every occasion',
    'vision.missionBody':
      'We combine experience, creativity and manufacturing expertise to deliver packaging solutions that are practical, distinctive and made to the highest standards.',
    'vision.sustainabilityLabel': 'Sustainability',
    'vision.sustainabilityHeading': 'Better packaging starts with better decisions',
    'vision.sustainabilityBody':
      'We continuously look for ways to improve the materials, processes and practices behind our products. As packaging requirements evolve, we believe responsible manufacturing means continually evaluating how we design, produce and deliver.',
    'vision.valuesLabel': 'Our values',
    'vision.valuesHeading': 'What every project is held to',
    'vision.values.measure.title': 'Made to measure',
    'vision.values.measure.description':
      'Packaging is rarely one size fits all. Every project is developed around your product, brand and requirements.',
    'vision.values.consistency.title': 'Consistency',
    'vision.values.consistency.description':
      'The same quality, precision and finish across an entire production run.',
    'vision.values.detail.title': 'Attention to detail',
    'vision.values.detail.description':
      'Materials, dimensions, structure and finishing all shape how the result looks, feels and performs.',

    'products.eyebrow': 'Portfolio',
    'products.heading': "Ideas we've brought to life",
    'products.intro':
      'Every project begins differently. Some start with a sketch, others with a product, a brand guideline or simply an idea.',
    'products.intro2':
      'What they have in common is the journey from concept to finished packaging.',
    'products.all': 'All',
    'products.hint': 'Tap any card for a better view.',
    'products.filters': 'Product categories',
    'products.subFilters': 'Product types',
    'products.allTypes': 'All types',

    'category.hard': 'Hard Cover Boxes',
    'category.printed': 'Digital Printing',
    'category.cardboard': 'Cardboard Boxes',
    'category.bags': 'Cardboard Bags',
    'category.plastic': 'Plastic Boxes',
    'category.ribbons': 'Ribbons',
    'category.souvenir': 'Traditional Souvenir Boxes',

    'lightbox.close': 'Close',
    'lightbox.prev': 'Previous product',
    'lightbox.next': 'Next product',
    'lightbox.title': 'Product preview',
    'lightbox.dragHint': 'Drag to browse',

    'contact.eyebrow': 'Get in touch',
    'contact.heading': "Let's talk packaging",
    'contact.intro':
      'Whether you already have a complete packaging concept or you are starting with an idea, we would love to hear about your project.',
    'contact.intro2':
      'Tell us what you are looking forward to creating and our team will get back to you.',
    'contact.office.lb.name': 'Plastiban Technical Industry S.A.R.L',
    'contact.office.lb.address': 'Ain al Tineh - Sakiat al Janzir, Beirut, Lebanon',
    'contact.office.lb.label': 'Ain al Tineh, Beirut',
    'contact.office.ae.name': 'Plastiban Packaging Factory L.L.C',
    'contact.office.ae.address': 'New Industrial Area - Umm Al Quwain, United Arab Emirates',
    'contact.office.ae.label': 'Umm Al Quwain, UAE',
    'contact.map.hint': 'Tap a location to zoom in on it.',
    'contact.map.open': 'Open in Google Maps',
    'contact.map.reset': 'Reset map view',
    'contact.form.title': 'Send us a message',
    'contact.form.office': 'Send to',
    'contact.form.office.lb': 'Lebanon',
    'contact.form.office.ae': 'United Arab Emirates',
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
    'contact.form.sending': 'Sending…',
    'contact.form.success': "Thanks, your message has been noted. We'll be in touch shortly.",
    'contact.form.error':
      'Your message could not be sent. Please try again, or email us directly at info@plastiban.com.',
    'contact.form.errorRateLimited':
      'That is a few messages in a short time. Please wait a little while before sending another.',

    'footer.rights': 'All rights reserved.',
    'footer.follow': 'Follow us',
    'social.instagram.lb': 'Instagram (Lebanon)',
    'social.instagram.ae': 'Instagram (UAE)',
    'social.country.lb': 'Lebanon',
    'social.country.ae': 'UAE',
    'social.facebook.lb': 'Facebook (Lebanon)',
    'social.facebook.ae': 'Facebook (UAE)',
    'social.whatsapp': 'WhatsApp',

    'seo.title':
      'Plastiban - Packaging & Industrial Plastics Manufacturer | Lebanon & U.A.E.',
    'seo.description':
      'Plastiban Technical Industry S.A.R.L has manufactured packaging since 1989: cardboard, plastic, rigid and souvenir boxes plus digital printing, with offices in Beirut, Lebanon and Umm Al Quwain, U.A.E.',
  },

  ar: {
    'lang.name': 'العربية',
    'lang.other': 'English',
    'lang.switch': 'التبديل إلى الإنكليزية',

    'brand.name': 'بلاستيبان',
    'brand.full': 'بلاستيبان للصناعات التقنية ش.م.م',

    'nav.home': 'الرئيسية',
    'nav.about': 'من نحن',
    'nav.products': 'منتجاتنا',
    'nav.whoWeAre': 'قصتنا',
    'nav.vision': 'رؤيتنا ورسالتنا',
    'nav.portfolio': 'أعمالنا',
    'nav.capabilities': 'التصنيع والطباعة',
    'nav.howWeWork': 'كيف نعمل',
    'nav.contact': 'اتصل بنا',
    'nav.toggleMenu': 'فتح قائمة التنقل',
    'nav.primary': 'الرئيسية',

    'hero.title.lead': 'تغليف فاخر',
    'hero.title.accent': 'يترك انطباعاً لا يُنسى',
    'hero.subtitle':
      'منذ أكثر من ثلاثة عقود، تبتكر بلاستيبان حلول تغليف مميّزة للعلامات التجارية والشركات والمناسبات الخاصة.',
    'hero.subtitle2':
      'من الفكرة إلى الإنتاج، نحوّل الأفكار إلى واقع عبر تصميم مدروس ومواد عالية الجودة وتصنيع داخل منشآتنا.',
    'hero.scroll': 'مرّر للأسفل',
    'hero.scrollAria': 'الانتقال إلى قسم من نحن',

    'clients.eyebrow': 'يثقون بنا',
    'clients.label': 'شركات عملنا معها',

    'about.eyebrow': 'من نحن',
    'about.heading': 'أكثر من تغليف! شريك في التّصنيع!',
    'about.body':
      'منذ عام 1989، تجمع بلاستيبان بين الخبرة والحرفية ودقّة التّصنيع لتقديم حلول تغليف لا تقتصر على حماية المنتج، بل تضيف قيمة إلى تجربة استخدامه.',
    'about.timelineLabel': 'كيف وصلنا إلى هنا',
    'about.timeline.founded.year': '1989',
    'about.timeline.founded.title': 'تأسيس بلاستيبان',
    'about.timeline.founded.description': 'بداية رحلتنا في عالم التغليف.',
    'about.timeline.production.year': '2006',
    'about.timeline.production.title': 'توسيع قدراتنا الإنتاجية',
    'about.timeline.production.description':
      'استثمرنا في آلات وخطوط إنتاج جديدة لتطوير منتجات أكثر ابتكارًا وجودة.',
    'about.timeline.expansion.year': '2022',
    'about.timeline.expansion.title': 'التوسّع إلى الإمارات',
    'about.timeline.expansion.description':
      'افتتحنا فرعنا الثاني في الإمارات العربية المتحدة، لنوسّع حضورنا في المنطقة.',
    'about.timeline.luxury.year': '2024',
    'about.timeline.luxury.title': 'إطلاق التغليف الفاخر (هارد كوفر) والطباعة الديجيتال',
    'about.timeline.luxury.description':
      'أطلقنا العلب الصلبة الفاخرة (هارد كوفر) والطباعة الديجيتال التي أتاحت لنا تنفيذ تصاميم عالية الجودة بحد أدنى منخفض للطّلب، مما جعل منتجاتنا متاحة للشركات بمختلف أحجامها.',
    'about.timeline.today.year': 'اليوم',
    'about.timeline.today.title': 'موقعان، معيار واحد',
    'about.timeline.today.description':
      'نواصل تقديم الجودة والتخصيص والاهتمام بالتفاصيل في لبنان والإمارات.',

    'capabilities.eyebrow': 'ما نقوم به',
    'capabilities.heading': 'التصنيع والطباعة',
    'capabilities.intro':
      'تتمّ الطباعة والقص والتشطيب بالكامل داخل منشآتنا في لبنان والإمارات العربية المتحدة، ما يضمن تحكّماً كاملاً وجودة ثابتة في كل مرحلة من مراحل الإنتاج.',
    'capabilities.offset.title': 'طباعة الأوفست',
    'capabilities.offset.description': 'طباعة عالية الجودة بتفاصيل حادّة وألوان ثابتة ونتائج تغليف احترافية.',
    'capabilities.digital.title': 'الطباعة الديجيتال',
    'capabilities.digital.description': 'طباعة مرنة للتصاميم المخصّصة وكميات الإنتاج الصغيرة.',
    'capabilities.dieCutting.title': 'القص والتكسير بالقوالب',
    'capabilities.dieCutting.description': 'قصّ وتكسير دقيقان لصنع أشكال وهياكل تغليف مخصّصة.',
    'capabilities.router.title': 'القص بالراوتر',
    'capabilities.router.description': 'قصّ دقيق للتفاصيل والأشكال المخصّصة ومكوّنات التغليف الخاصة.',
    'capabilities.lamination.title': 'التغليف الحراري (لامينيشن)',
    'capabilities.lamination.description': 'تشطيبات واقية وزخرفية تعزّز متانة التغليف ومظهره.',
    'capabilities.finishing.title': 'التشطيبات الفاخرة',
    'capabilities.finishing.description':
      'الطباعة بالرّقائق الحرارية والنقش البارز والغائر وطبقة الـUV الموضعية، لإضافة الملمس واللمعان والتباين وتفاصيل مميّزة.',

    'process.eyebrow': 'كيف نعمل',
    'process.heading': 'من الفكرة إلى العلبة الجاهزة',
    'process.lead': 'إذا كنت تتخيّله، فنحن نعمل على تحقيقه',
    'process.steps': 'مراحل العمل، خطوة بخطوة',
    'process.understand.title': 'الفهم',
    'process.understand.description': 'نبدأ بتحديد احتياجات منتجك وهويتك التّجارية والكميات والمقاسات والميزانية والغرض من الاستخدام.',
    'process.develop.title': 'التطوير',
    'process.develop.description': 'يعمل فريقنا على تطوير الهيكل واختيار المواد وتحديد التّفاصيل التي تجسّد التّصميم.',
    'process.prototype.title': 'النموذج',
    'process.prototype.description': 'تتيحُ لكَ العيّنة الملموسة رؤية التّغليف وتقييمه قبل بدء الإنتاج.',
    'process.manufacture.title': 'التصنيع',
    'process.manufacture.description':
      'بعد الموافقة على التّصميم، ينتقل التّغليف إلى مرحلة الإنتاج، مع ضمان الجودة، الثّبات والتّناسق.',
    'process.finishing.title': 'التشطيب والتفاصيل',
    'process.finishing.description':
      'تُجمَعُ كلُّ التّفاصيل بحرفية متقنة ولمسات نهائية مدروسة.',
    'process.deliver.title': 'التسليم',
    'process.deliver.description': 'يُسَلَّم التّغليف النّهائي وفق المتطلبات المتّفق عليها ليكون جاهزًا لمنتجك.',

    'vision.eyebrow': 'نظرتنا إلى الأمام',
    'vision.heading': 'أن نصنع تغليفاً يبقى في الذاكرة',
    'vision.body':
      'نؤمن بأن التغليف الجيّد قادر على تحويل فكرة عادية إلى تجربة. رؤيتنا أن نواصل تطوير حلول تغليف مبتكرة وعالية الجودة، مع توسيع حضورنا في المنطقة.',
    'vision.missionLabel': 'مهمتنا',
    'vision.missionHeading': 'أن يكون التغليف الاستثنائي في متناول كل علامة تجارية وكل مناسبة',
    'vision.missionBody':
      'نجمع بين الخبرة والإبداع وقدرات التصنيع لتقديم حلول تغليف عملية ومميّزة ومصنوعة بأعلى المعايير.',
    'vision.sustainabilityLabel': 'الاستدامة',
    'vision.sustainabilityHeading': 'التغليف الأفضل يبدأ بقرارات أفضل',
    'vision.sustainabilityBody':
      'نبحث باستمرار عن طرق لتحسين المواد والعمليات والممارسات التي تقف خلف منتجاتنا. ومع تطوّر متطلبات التغليف، نرى أن التصنيع المسؤول يعني المراجعة الدائمة لطريقة تصميمنا وإنتاجنا وتسليمنا.',
    'vision.valuesLabel': 'قيمنا',
    'vision.valuesHeading': 'ما نلتزم به في كل مشروع',
    'vision.values.measure.title': 'مفصّل على القياس',
    'vision.values.measure.description':
      'نادراً ما يناسب تغليف واحد كل المنتجات. كل مشروع يُطوَّر حول منتجك وعلامتك ومتطلباتك.',
    'vision.values.consistency.title': 'ثبات الجودة',
    'vision.values.consistency.description': 'الحفاظ على مستوى ثابت من الجودة والدّقة والإتقان في كل دفعة إنتاج.',
    'vision.values.detail.title': 'اهتمام بالتفاصيل',
    'vision.values.detail.description':
      'تحدّد المواد والمقاسات والهيكل والتّشطيبات المظهر النّهائي وملمس وأداء التّغليف.',
    'products.eyebrow': 'أعمالنا',
    'products.heading': 'أفكار حوّلناها إلى واقع',
    'products.intro':
      'كل مشروع يبدأ بشكل مختلف. بعضها يبدأ برسم أوّلي، وبعضها بمنتج أو دليل هوية أو مجرّد فكرة.',
    'products.intro2':
      'وما يجمعها جميعاً هو الرحلة من الفكرة إلى التغليف الجاهز.',
    'products.all': 'الكل',
    'products.hint': 'اضغط على أي بطاقة لعرض أوضح.',
    'products.filters': 'فئات المنتجات',
    'products.subFilters': 'أنواع المنتجات',
    'products.allTypes': 'كل الأنواع',

    'category.hard': 'علب بغلاف صلب (هارد كوفر)',
    'category.printed': 'الطباعة الديجيتال',
    'category.cardboard': 'علب كرتون',
    'category.bags': 'أكياس كرتون',
    'category.plastic': 'علب بلاستيك',
    'category.ribbons': 'شرائط',
    'category.souvenir': 'علب تذكارية تقليدية',

    'lightbox.close': 'إغلاق',
    'lightbox.prev': 'المنتج السابق',
    'lightbox.next': 'المنتج التالي',
    'lightbox.title': 'معاينة المنتج',
    'lightbox.dragHint': 'اسحب للتصفّح',

    'contact.eyebrow': 'تواصل معنا',
    'contact.heading': 'لنتحدّث عن التغليف',
    'contact.intro':
      'سواء كان لديك تصوّر متكامل للتغليف أو كنت تبدأ من فكرة، يسعدنا أن نسمع عن مشروعك.',
    'contact.intro2':
      'أخبرنا بما تتطلّع إلى صنعه، وسيعود إليك فريقنا.',
    'contact.office.lb.name': 'بلاستيبان للصناعات التقنية ش.م.م',
    'contact.office.lb.address': 'عين التينة - ساقية الجنزير، بيروت، لبنان',
    'contact.office.lb.label': 'عين التينة، بيروت',
    'contact.office.ae.name': 'مصنع بلاستيبان للتعبئة والتغليف ذ.م.م',
    'contact.office.ae.address': 'المنطقة الصناعية الجديدة - أم القيوين، الإمارات العربية المتحدة',
    'contact.office.ae.label': 'أم القيوين، الإمارات',
    'contact.map.hint': 'اضغط على أي موقع لتكبيره.',
    'contact.map.open': 'افتح في خرائط غوغل',
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
    'contact.form.contactHint': 'أدخل وسيلة واحدة على الأقل: هاتف أو بريد إلكتروني.',
    'contact.form.contactError':
      'يرجى إدخال بريد إلكتروني أو رقم هاتف لنتمكّن من التواصل معك.',
    'contact.form.message': 'الرسالة',
    'contact.form.messagePlaceholder': 'أخبرنا عن مشروعك',
    'contact.form.submit': 'إرسال الرسالة',
    'contact.form.sending': 'جارٍ الإرسال…',
    'contact.form.success': 'شكراً لك، وصلتنا رسالتك وسنتواصل معك قريباً.',
    'contact.form.error':
      'تعذّر إرسال رسالتك. يُرجى المحاولة مرة أخرى، أو مراسلتنا مباشرةً على info@plastiban.com.',
    'contact.form.errorRateLimited':
      'لقد أرسلت عدة رسائل خلال وقت قصير. يُرجى الانتظار قليلاً قبل إرسال رسالة أخرى.',

    'footer.rights': 'جميع الحقوق محفوظة.',
    'footer.follow': 'تابعنا',
    'social.instagram.lb': 'إنستغرام (لبنان)',
    'social.instagram.ae': 'إنستغرام (الإمارات)',
    'social.country.lb': 'لبنان',
    'social.country.ae': 'الإمارات',
    'social.facebook.lb': 'فيسبوك (لبنان)',
    'social.facebook.ae': 'فيسبوك (الإمارات)',
    'social.whatsapp': 'واتساب',

    'seo.title': 'بلاستيبان - تصنيع التغليف والبلاستيك الصناعي | لبنان والإمارات',
    'seo.description':
      'تصنّع بلاستيبان للصناعات التقنية ش.م.م مواد التغليف منذ عام ١٩٨٩: علب كرتون وبلاستيك وعلب صلبة (هارد كوفر) وتذكارية وطباعة ديجيتال، مع مكاتب في بيروت، لبنان وأم القيوين، الإمارات.',
  },
};
