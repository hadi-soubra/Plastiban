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
    'nav.process': 'Process',
    'nav.why': 'Why Us',
    'nav.products': 'Products',
    'nav.contact': 'Contact',
    'nav.quote': 'Get a Quote',
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
    'about.heading': 'More than packaging. A complete manufacturing partner.',
    'about.lead':
      'For over 35 years, Plastiban has been creating packaging solutions that combine functionality, presentation and craftsmanship.',
    'about.body1':
      'Since 1989, Plastiban has combined experience, craftsmanship and manufacturing expertise to create packaging that does more than protect a product. It becomes part of the experience.',
    'about.body2':
      'Today, with operations in Lebanon and the U.A.E., we work with businesses and brands to develop packaging solutions tailored to their identity, products and requirements.',
    'about.body3':
      'Packaging should represent the product inside, reflect the identity of the brand and create a memorable experience for the person receiving it. That is the idea the company was built on, and the one we return to on every project.',
    'about.body4':
      'Over the years, our experience has grown alongside the packaging industry. We have developed our capabilities, expanded our product offering and continued to invest in the way we design and manufacture.',
    'about.body5':
      'Today, Plastiban combines decades of experience with a forward-looking approach to packaging.',
    'about.timelineLabel': 'How we got here',
    'about.timeline.founded.year': '1989',
    'about.timeline.founded.title': 'Plastiban is founded',
    'about.timeline.founded.description': 'The beginning of our packaging journey.',
    'about.timeline.expansion.year': '2022',
    'about.timeline.expansion.title': 'U.A.E. expansion',
    'about.timeline.expansion.description': 'A second branch opens, widening our reach across the region.',
    'about.timeline.today.year': 'Today',
    'about.timeline.today.title': 'Two markets, one standard',
    'about.timeline.today.description':
      'The same focus on quality, customization and attention to detail in both countries.',

    'process.eyebrow': 'How we work',
    'process.heading': 'From an idea to the finished package.',
    'process.lead': 'If you can imagine it, we can work towards making it.',
    'process.intro':
      'Every project starts with a purpose. Whether you arrive with a defined design or only an idea, our team works with you to develop packaging that fits your product, brand and occasion.',
    'process.intro2':
      'Every project has different requirements. That is why we do not believe in forcing every product into the same packaging format.',
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

    'why.eyebrow': 'Why Plastiban',
    'why.heading': 'Experience you can build on.',
    'why.intro': 'We work alongside our clients, not simply as a supplier.',
    'why.since.title': 'Since 1989',
    'why.since.description': 'More than three decades of knowledge and manufacturing experience.',
    'why.inHouse.title': 'In-house production',
    'why.inHouse.description':
      'Keeping the process in our own facilities, from development through production, means closer control over quality and execution, better communication and greater flexibility.',
    'why.measure.title': 'Made to measure',
    'why.measure.description':
      'Packaging is rarely one size fits all. Every project is developed around your product, brand and requirements.',
    'why.reach.title': 'Lebanon & U.A.E.',
    'why.reach.description': 'A presence in both markets, serving clients across the region.',
    'why.consistency.title': 'Consistency',
    'why.consistency.description':
      'The same quality, precision and finish across an entire production run.',
    'why.detail.title': 'Attention to detail',
    'why.detail.description':
      'Materials, dimensions, structure and finishing all shape how the result looks, feels and performs.',

    'vision.eyebrow': 'Looking ahead',
    'vision.heading': 'To create packaging that people remember.',
    'vision.body':
      'We believe great packaging can turn an ordinary idea into an experience. Our vision is to continue developing innovative, high-quality packaging solutions while growing our presence across the region.',
    'vision.missionLabel': 'Our mission',
    'vision.missionHeading':
      'To make exceptional packaging accessible to every brand and every occasion.',
    'vision.missionBody':
      'We combine experience, creativity and manufacturing expertise to deliver packaging solutions that are practical, distinctive and made to the highest standards.',
    'vision.sustainabilityLabel': 'Sustainability',
    'vision.sustainabilityHeading': 'Better packaging starts with better decisions.',
    'vision.sustainabilityBody':
      'We continuously look for ways to improve the materials, processes and practices behind our products. As packaging requirements evolve, we believe responsible manufacturing means continually evaluating how we design, produce and deliver.',

    'products.eyebrow': 'Portfolio',
    'products.heading': "Ideas we've brought to life.",
    'products.intro':
      'Every project begins differently. Some start with a sketch, others with a product, a brand guideline or simply an idea.',
    'products.intro2':
      'What they have in common is the journey from concept to finished packaging.',
    'products.all': 'All',
    'products.hint': 'Tap any product to view it larger.',
    'products.filters': 'Product categories',
    'products.subFilters': 'Product types',
    'products.allTypes': 'All types',

    'category.hard': 'Hard Cover Boxes',
    'category.printed': 'Digital Printed',
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
    'contact.heading': "Let's talk packaging.",
    'contact.intro':
      'Whether you already have a complete packaging concept or you are starting with an idea, we would love to hear about your project.',
    'contact.intro2':
      'Tell us what you are looking forward to creating and our team will get back to you.',
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
    'contact.form.sending': 'Sending…',
    'contact.form.success': "Thanks, your message has been noted. We'll be in touch shortly.",
    'contact.form.error':
      'Your message could not be sent. Please try again, or email us directly at info@plastiban.com.',
    'contact.form.errorRateLimited':
      'That is a few messages in a short time. Please wait a little while before sending another.',

    'footer.rights': 'All rights reserved.',
    'footer.tagline': 'Premium Packaging Made to Make an Impression',
    'footer.follow': 'Follow us',
    'social.instagram.lb': 'Instagram (Lebanon)',
    'social.instagram.ae': 'Instagram (UAE)',
    'social.country.lb': 'Lebanon',
    'social.country.ae': 'UAE',
    'social.country.both': 'Lebanon / UAE',
    'social.facebook': 'Facebook (Lebanon & UAE)',
    'social.whatsapp': 'WhatsApp',

    'seo.title':
      'Plastiban - Packaging & Industrial Plastics Manufacturer | Lebanon & U.A.E.',
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
    'nav.process': 'مراحل العمل',
    'nav.why': 'لماذا نحن',
    'nav.products': 'منتجاتنا',
    'nav.contact': 'اتصل بنا',
    'nav.quote': 'اطلب عرض سعر',
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
    'about.heading': 'أكثر من تغليف. شريك تصنيع متكامل.',
    'about.lead':
      'منذ أكثر من 35 عاماً، تصنع بلاستيبان حلول تغليف تجمع بين الوظيفة والمظهر والحرفية.',
    'about.body1':
      'منذ عام 1989، تجمع بلاستيبان بين الخبرة والحرفية وقدرات التصنيع لصناعة تغليف لا يحمي المنتج فحسب، بل يصبح جزءاً من التجربة.',
    'about.body2':
      'اليوم، ومع عملياتنا في لبنان والإمارات، نعمل مع الشركات والعلامات التجارية لتطوير حلول تغليف مفصّلة على هويتها ومنتجاتها ومتطلباتها.',
    'about.body3':
      'نؤمن بأن التغليف يجب أن يعبّر عن المنتج في داخله، ويعكس هوية العلامة التجارية، ويترك أثراً لا يُنسى لدى من يتسلّمه. هذه الفكرة التي قامت عليها الشركة، ونعود إليها في كل مشروع.',
    'about.body4':
      'مع مرور السنوات، نمت خبرتنا مع نمو صناعة التغليف. طوّرنا قدراتنا، ووسّعنا تشكيلة منتجاتنا، وواصلنا الاستثمار في طريقة تصميمنا وتصنيعنا.',
    'about.body5':
      'واليوم تجمع بلاستيبان عقوداً من الخبرة مع نظرة استشرافية إلى التغليف.',
    'about.timelineLabel': 'كيف وصلنا إلى هنا',
    'about.timeline.founded.year': '1989',
    'about.timeline.founded.title': 'تأسيس بلاستيبان',
    'about.timeline.founded.description': 'بداية رحلتنا في عالم التغليف.',
    'about.timeline.expansion.year': '2022',
    'about.timeline.expansion.title': 'التوسّع إلى الإمارات',
    'about.timeline.expansion.description': 'افتتاح فرع ثانٍ يوسّع حضورنا في المنطقة.',
    'about.timeline.today.year': 'اليوم',
    'about.timeline.today.title': 'سوقان، معيار واحد',
    'about.timeline.today.description': 'التركيز ذاته على الجودة والتخصيص والاهتمام بالتفاصيل في البلدين.',

    'process.eyebrow': 'كيف نعمل',
    'process.heading': 'من الفكرة إلى العلبة الجاهزة.',
    'process.lead': 'إذا كنت تتخيّله، فنحن نعمل على تحقيقه.',
    'process.intro':
      'كل مشروع يبدأ بهدف. سواء وصلت بتصميم واضح أو بفكرة فقط، يعمل فريقنا معك لتطوير تغليف يناسب منتجك وعلامتك ومناسبتك.',
    'process.intro2':
      'لكل مشروع متطلباته الخاصة. لذلك لا نؤمن بحشر كل منتج في قالب تغليف واحد.',
    'process.understand.title': 'الفهم',
    'process.understand.description': 'نبدأ من منتجك وعلامتك والكميات والأبعاد والميزانية والاستخدام المقصود.',
    'process.develop.title': 'التطوير',
    'process.develop.description': 'يعمل فريقنا على الهيكل والمواد والتفاصيل التي تجمع الفكرة معاً.',
    'process.prototype.title': 'النموذج',
    'process.prototype.description': 'عيّنة ملموسة تتيح لك رؤية التغليف وتجربته وتقييمه قبل بدء الإنتاج.',
    'process.manufacture.title': 'التصنيع',
    'process.manufacture.description':
      'بعد الموافقة، ينتقل التغليف إلى الإنتاج في منشآتنا، مع عناية دقيقة بالثبات والجودة.',
    'process.finishing.title': 'التشطيب والتفاصيل',
    'process.finishing.description':
      'نجمع كل التفاصيل معاً بحرفية دقيقة ولمسات تشطيب مدروسة.',
    'process.deliver.title': 'التسليم',
    'process.deliver.description': 'يُجهَّز التغليف النهائي وفق المتطلبات المتفق عليها وجاهزاً لمنتجك.',

    'why.eyebrow': 'لماذا بلاستيبان',
    'why.heading': 'خبرة يمكنك البناء عليها.',
    'why.intro': 'نعمل إلى جانب عملائنا، لا كمورّد فحسب.',
    'why.since.title': 'منذ 1989',
    'why.since.description': 'أكثر من ثلاثة عقود من المعرفة وخبرة التصنيع.',
    'why.inHouse.title': 'إنتاج داخلي',
    'why.inHouse.description':
      'إبقاء العملية داخل منشآتنا، من التطوير حتى الإنتاج، يعني رقابة أدق على الجودة والتنفيذ، وتواصلاً أفضل ومرونة أكبر.',
    'why.measure.title': 'مفصّل على القياس',
    'why.measure.description':
      'نادراً ما يناسب تغليف واحد كل المنتجات. كل مشروع يُطوَّر حول منتجك وعلامتك ومتطلباتك.',
    'why.reach.title': 'لبنان والإمارات',
    'why.reach.description': 'حضور في السوقين، وخدمة لعملاء في أنحاء المنطقة.',
    'why.consistency.title': 'ثبات الجودة',
    'why.consistency.description': 'الجودة والدقة والتشطيب ذاتها عبر خط الإنتاج بالكامل.',
    'why.detail.title': 'اهتمام بالتفاصيل',
    'why.detail.description':
      'المواد والأبعاد والهيكل والتشطيب، كلها تصنع شكل النتيجة وملمسها وأداءها.',

    'vision.eyebrow': 'نظرتنا إلى الأمام',
    'vision.heading': 'أن نصنع تغليفاً يبقى في الذاكرة.',
    'vision.body':
      'نؤمن بأن التغليف الجيّد قادر على تحويل فكرة عادية إلى تجربة. رؤيتنا أن نواصل تطوير حلول تغليف مبتكرة وعالية الجودة، مع توسيع حضورنا في المنطقة.',
    'vision.missionLabel': 'مهمتنا',
    'vision.missionHeading': 'أن يكون التغليف الاستثنائي في متناول كل علامة تجارية وكل مناسبة.',
    'vision.missionBody':
      'نجمع بين الخبرة والإبداع وقدرات التصنيع لتقديم حلول تغليف عملية ومميّزة ومصنوعة بأعلى المعايير.',
    'vision.sustainabilityLabel': 'الاستدامة',
    'vision.sustainabilityHeading': 'التغليف الأفضل يبدأ بقرارات أفضل.',
    'vision.sustainabilityBody':
      'نبحث باستمرار عن طرق لتحسين المواد والعمليات والممارسات التي تقف خلف منتجاتنا. ومع تطوّر متطلبات التغليف، نرى أن التصنيع المسؤول يعني المراجعة الدائمة لطريقة تصميمنا وإنتاجنا وتسليمنا.',
    'products.eyebrow': 'أعمالنا',
    'products.heading': 'أفكار حوّلناها إلى واقع.',
    'products.intro':
      'كل مشروع يبدأ بشكل مختلف. بعضها يبدأ برسم أوّلي، وبعضها بمنتج أو دليل هوية أو مجرّد فكرة.',
    'products.intro2':
      'وما يجمعها جميعاً هو الرحلة من الفكرة إلى التغليف الجاهز.',
    'products.all': 'الكل',
    'products.hint': 'اضغط على أي منتج لعرضه بحجم أكبر.',
    'products.filters': 'فئات المنتجات',
    'products.subFilters': 'أنواع المنتجات',
    'products.allTypes': 'كل الأنواع',

    'category.hard': 'علب بغلاف صلب',
    'category.printed': 'طباعة رقمية',
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
    'contact.heading': 'لنتحدّث عن التغليف.',
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
    'footer.tagline': 'تغليف فاخر يترك انطباعاً لا يُنسى',
    'footer.follow': 'تابعنا',
    'social.instagram.lb': 'إنستغرام (لبنان)',
    'social.instagram.ae': 'إنستغرام (الإمارات)',
    'social.country.lb': 'لبنان',
    'social.country.ae': 'الإمارات',
    'social.country.both': 'لبنان / الإمارات',
    'social.facebook': 'فيسبوك (لبنان والإمارات)',
    'social.whatsapp': 'واتساب',

    'seo.title': 'بلاستيبان - تصنيع التغليف والبلاستيك الصناعي | لبنان والإمارات',
    'seo.description':
      'تصنّع بلاستيبان للصناعات التقنية ش.م.م مواد التغليف والبلاستيك التقني منذ عام ١٩٨٩: علب كرتون وبلاستيك وعلب صلبة وتذكارية وطباعة رقمية، صناعة لبنانية وإماراتية.',
  },
};
