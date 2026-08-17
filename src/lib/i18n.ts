export type Locale = 'uz' | 'ru' | 'en';

const dictionaries: Record<Exclude<Locale, 'uz'>, Record<string, string>> = {
  ru: {
    'Bosh sahifa': 'Главная', 'Maktab haqida': 'О школе', 'Akademik': 'Академика', 'Maktab hayoti': 'Школьная жизнь',
    'Ma’muriyat': 'Администрация', "Ma'muriyat": 'Администрация', 'Media': 'Медиа', 'Aloqa': 'Контакты', 'Yana': 'Ещё',
    'Maktab haqida batafsil': 'Подробнее о школе', 'Akademik portal': 'Академический портал', 'O‘quvchilar': 'Учащиеся', 'Oqituvchilar': 'Учителя', 'O‘qituvchilar': 'Учителя',
    'Chuqurlashtirilgan fanlar': 'Углублённые предметы', 'Yutuqlar (2024)': 'Достижения (2024)', 'Birinchi bitiruvchilar': 'Первые выпускники',
    'Oliy o‘quv muassasalariga kirish': 'Поступление в вузы', 'Explore': 'Обзор', 'Maqsadlarimiz va tariximiz': 'Наши цели и история',
    '2022-yildan beri iqtidorli o‘quvchilarni kelajak yetakchilariga aylantirib kelyapmiz': 'С 2022 года мы помогаем талантливым учащимся становиться лидерами будущего',
    'Akademik mukammallik': 'Академическое совершенство', 'Innovatsion tafakkur': 'Инновационное мышление', 'Vatanga muhabbat': 'Любовь к Родине', 'Yetakchilik mahorati': 'Лидерские навыки',
    'Tarixiy xronologiya': 'Историческая хронология', 'Maktabning rivojlanish yo‘nalishi — yildan yilga': 'Развитие школы — год за годом',
    'Maktab tashkil etilishi': 'Основание школы', 'Chuqurlashtirilgan dastur va innovatsiya markazi': 'Углублённая программа и инновационный центр',
    'Xalqaro hamkorlik': 'Международное сотрудничество', 'Prezident Devoni': 'Президентский совет', 'Raqamli maktab': 'Цифровая школа',
    'Akademik Portal': 'Академический портал', 'O‘qituvchilar, fanlar va reytinglar': 'Учителя, предметы и рейтинги', 'Chuqurlashtirilgan ta’lim dasturi, professional pedagoglar va GPA reytingi': 'Углублённая образовательная программа, профессиональные педагоги и рейтинг GPA',
    'O‘qituvchilar': 'Учителя', 'Fanlar': 'Предметы', 'GPA Reyting': 'Рейтинг GPA', 'Sinflar': 'Классы', 'Staj': 'Стаж', 'Toifa': 'Категория',
    'Oliy toifa': 'Высшая категория', 'Birinchi toifa': 'Первая категория', 'Mutaxassis': 'Специалист', 'Ko‘proq ko‘rish': 'Показать больше',
    'Ta’limdan tashqari hayot ham muhim.': 'Жизнь вне учёбы тоже важна.', 'Yotoqxona, ovqatlanish va kun tartibi haqida kerakli ma’lumotlar bir joyda.': 'Вся необходимая информация о проживании, питании и распорядке дня — в одном месте.',
    'Yotoqxona': 'Общежитие', 'Ovqatlanish': 'Питание', 'Kun tartibi': 'Распорядок дня', 'Qulay yashash sharoiti': 'Комфортные условия проживания', 'Nazorat va xavfsizlik': 'Контроль и безопасность', 'Dam olish va mustaqil tayyorgarlik zonalari': 'Зоны отдыха и самостоятельной подготовки',
    'Nonushta': 'Завтрак', 'Tushlik': 'Обед', 'Kechki ovqat': 'Ужин', 'Uyg‘onish': 'Подъём', 'Darslar': 'Занятия', 'To‘garaklar / mustaqil ta’lim': 'Кружки / самостоятельное обучение', 'Uyqu': 'Сон',
    'Rahbariyat va qabul kunlari': 'Руководство и часы приёма', 'Maktab ma’muriyati a’zolari, ularning lavozimlari va fuqarolarni qabul qilish kunlari.': 'Члены администрации школы, их должности и часы приёма граждан.',
    'Maktab direktori': 'Директор школы', 'O\'quv ishlari bo‘yicha direktor o‘rinbosari': 'Заместитель директора по учебной работе', 'Ma’naviy-ma’rifiy ishlar bo‘yicha direktor o‘rinbosari': 'Заместитель директора по духовно-просветительской работе', 'Maktab maslahatchisi': 'Школьный советник', 'Maktab psixologi': 'Школьный психолог', 'Maktab kadrlar bo‘yicha menejeri': 'Менеджер по кадрам', 'Maktab bosh hisobchisi': 'Главный бухгалтер школы', 'Xo‘jalik ishlari bo‘yicha direktor o‘rinbosari': 'Заместитель директора по хозяйственным вопросам',
    'Har kuni': 'Ежедневно', 'Dushanba - Juma': 'Понедельник - Пятница',
    'Video darslar': 'Видеоуроки', 'Bilimni video orqali o‘rganing': 'Изучайте знания через видео', 'Admin panel orqali boshqariladigan ochiq darslar va ta’limiy videolar': 'Открытые уроки и образовательные видео, управляемые через админ-панель', 'Video darslar admin panel orqali boshqariladi': 'Видеоуроки управляются через админ-панель',
    'Matematika': 'Математика', 'Fizika': 'Физика', 'Informatika': 'Информатика', 'Kimyo': 'Химия', 'Biologiya': 'Биология', 'Ingliz tili': 'Английский язык', 'Rus tili': 'Русский язык', 'Ona tili va adabiyot': 'Родной язык и литература',
    'O‘zini-o‘zi boshqarish tizimi': 'Система самоуправления', 'Maktab Prezidenti va 7 ta vazirlik — o‘quvchilar maktab hayotini birgalikda boshqaradi, yangi g‘oyalarni amalga oshiradi va maktab rivojiga hissa qo‘shadi.': 'Президент школы и 7 министерств — учащиеся вместе управляют школьной жизнью, реализуют новые идеи и вносят вклад в развитие школы.',
    'Maktab Prezidenti': 'Президент школы', 'Faol boshqaruv': 'Активное управление', 'O‘quvchilar jamoasi': 'Ученическое сообщество', 'Boshqaruv jamoasi': 'Управленческая команда', 'Vazirliklar': 'Министерства', '7 ta yo‘nalish': '7 направлений',
    'Ta’lim Vazirligi': 'Министерство образования', 'Innovatsiya Vazirligi': 'Министерство инноваций', 'Sport Vazirligi': 'Министерство спорта', 'Moliya Vazirligi': 'Министерство финансов', 'Madaniyat Vazirligi': 'Министерство культуры', 'Ekologiya Vazirligi': 'Министерство экологии', 'Kommunikatsiya Vazirligi': 'Министерство коммуникаций',
    'Vazir': 'Министр', 'Tashabbuslar': 'Инициативы', 'Telegram orqali': 'Через Telegram', 'Har bir vazirlik maktab hayotini rivojlantirish, o‘quvchilar tashabbuslarini qo‘llab-quvvatlash va yangi loyihalarni amalga oshirishga xizmat qiladi.': 'Каждое министерство развивает школьную жизнь, поддерживает инициативы учащихся и реализует новые проекты.',
    'Innovatsiya va yutuqlar': 'Инновации и достижения', 'Maktabimizning raqamlardagi muvaffaqiyatlari': 'Успехи нашей школы в цифрах', 'Yilning eng faol maktabi – Jizzax viloyati, 2026': 'Самая активная школа года — Джизакская область, 2026', 'Aksiya qatnashchilari': 'Участники акций', 'Maxsus loyihalar': 'Специальные проекты', 'Ochiq portal': 'Открытый портал', 'Grant yutuqlari': 'Грантовые достижения',
    'Galereya': 'Галерея', 'Maktab hayotidan foto lavhalar': 'Фотографии из школьной жизни', 'Hozircha galereyaga rasmlar qo‘shilmagan.': 'Пока фотографии в галерею не добавлены.',
    'Aloqa va Takliflar': 'Контакты и предложения', 'Biz bilan bog‘laning': 'Свяжитесь с нами', 'Manzil': 'Адрес', 'Google Maps\'da ko‘rish': 'Открыть в Google Maps', 'Telefonlar': 'Телефоны', 'Taklif va Murojaatlar': 'Предложения и обращения', 'Murojaatingiz xavfsiz ravishda admin panelga yuboriladi.': 'Ваше обращение безопасно отправляется в админ-панель.', 'Ismingiz (ixtiyoriy)': 'Ваше имя (необязательно)', 'Taklif yoki murojaatingizni yozing...': 'Напишите предложение или обращение...', 'Yuborish': 'Отправить', 'Ijtimoiy tarmoqlar': 'Социальные сети',
    'Bo‘limlar': 'Разделы', 'Bosh sahifa': 'Главная', 'Maktab haqida': 'О школе', 'Akademik': 'Академика', 'Ma’muriyat': 'Администрация', 'Video darsliklar': 'Видеоуроки', 'Aloqa': 'Контакты', 'Barcha huquqlar himoyalangan.': 'Все права защищены.',
    'Yangi bildirishnomalar': 'Новые уведомления', "E'lonlar va Tadbirlar": 'Объявления и события', 'Yopish': 'Закрыть', "Tug'ilgan kun! 🎂": 'День рождения! 🎂', 'bugun tug‘ilgan kuni!': 'сегодня день рождения!',
    '2022-yildan beri sifatli ta’lim': 'Качественное образование с 2022 года', 'Bilim, innovatsiya va vatanga muhabbat': 'Знания, инновации и любовь к Родине',
    'Jizzax shahridagi 1-sonli ixtisoslashtirilgan maktab-internati. Iqtidorli o‘quvchilar uchun chuqurlashtirilgan ta’lim, zamonaviy laboratoriyalar va yetakchilik mahoratini rivojlantiruvchi innovatsion muhit.': 'Специализированная школа-интернат №1 города Джизака. Углублённое образование для талантливых учащихся, современные лаборатории и инновационная среда для развития лидерских навыков.',
  },
  en: {
    'Bosh sahifa': 'Home', 'Maktab haqida': 'About the School', 'Akademik': 'Academics', 'Maktab hayoti': 'School Life', 'Ma’muriyat': 'Administration', "Ma'muriyat": 'Administration', 'Media': 'Media', 'Aloqa': 'Contact', 'Yana': 'More',
    'Maktab haqida batafsil': 'Learn more about the school', 'Akademik portal': 'Academic portal', 'O‘quvchilar': 'Students', 'Oqituvchilar': 'Teachers', 'O‘qituvchilar': 'Teachers', 'Chuqurlashtirilgan fanlar': 'Advanced subjects', 'Yutuqlar (2024)': 'Achievements (2024)', 'Birinchi bitiruvchilar': 'First graduates', 'Oliy o‘quv muassasalariga kirish': 'University admission',
    'Explore': 'Explore', 'Maqsadlarimiz va tariximiz': 'Our goals and history', '2022-yildan beri iqtidorli o‘quvchilarni kelajak yetakchilariga aylantirib kelyapmiz': 'Since 2022, we have been helping talented students become the leaders of tomorrow',
    'Akademik mukammallik': 'Academic excellence', 'Innovatsion tafakkur': 'Innovative thinking', 'Vatanga muhabbat': 'Love for the homeland', 'Yetakchilik mahorati': 'Leadership skills', 'Tarixiy xronologiya': 'Historical timeline', 'Maktabning rivojlanish yo‘nalishi — yildan yilga': 'The school’s development — year by year',
    'Maktab tashkil etilishi': 'School founded', 'Chuqurlashtirilgan dastur va innovatsiya markazi': 'Advanced program and innovation center', 'Xalqaro hamkorlik': 'International cooperation', 'Prezident Devoni': 'President’s Office', 'Raqamli maktab': 'Digital school',
    'Akademik Portal': 'Academic Portal', 'O‘qituvchilar, fanlar va reytinglar': 'Teachers, subjects and rankings', 'Chuqurlashtirilgan ta’lim dasturi, professional pedagoglar va GPA reytingi': 'Advanced curriculum, professional educators and GPA ranking', 'O‘qituvchilar': 'Teachers', 'Fanlar': 'Subjects', 'GPA Reyting': 'GPA Ranking', 'Sinflar': 'Classes', 'Staj': 'Experience', 'Toifa': 'Category', 'Oliy toifa': 'Highest category', 'Birinchi toifa': 'First category', 'Mutaxassis': 'Specialist', 'Ko‘proq ko‘rish': 'View more',
    'Ta’limdan tashqari hayot ham muhim.': 'Life beyond the classroom matters too.', 'Yotoqxona, ovqatlanish va kun tartibi haqida kerakli ma’lumotlar bir joyda.': 'Everything you need to know about accommodation, meals and the daily schedule in one place.', 'Yotoqxona': 'Dormitory', 'Ovqatlanish': 'Meals', 'Kun tartibi': 'Daily schedule', 'Qulay yashash sharoiti': 'Comfortable living conditions', 'Nazorat va xavfsizlik': 'Supervision and safety', 'Dam olish va mustaqil tayyorgarlik zonalari': 'Rest and self-study zones', 'Nonushta': 'Breakfast', 'Tushlik': 'Lunch', 'Kechki ovqat': 'Dinner', 'Uyg‘onish': 'Wake up', 'Darslar': 'Classes', 'To‘garaklar / mustaqil ta’lim': 'Clubs / self-study', 'Uyqu': 'Sleep',
    'Rahbariyat va qabul kunlari': 'Leadership and reception hours', 'Maktab ma’muriyati a’zolari, ularning lavozimlari va fuqarolarni qabul qilish kunlari.': 'School administrators, their roles and citizen reception hours.', 'Maktab direktori': 'School Principal', 'O\'quv ishlari bo‘yicha direktor o‘rinbosari': 'Deputy Principal for Academic Affairs', 'Ma’naviy-ma’rifiy ishlar bo‘yicha direktor o‘rinbosari': 'Deputy Principal for Spiritual and Educational Affairs', 'Maktab maslahatchisi': 'School Counselor', 'Maktab psixologi': 'School Psychologist', 'Maktab kadrlar bo‘yicha menejeri': 'HR Manager', 'Maktab bosh hisobchisi': 'Chief Accountant', 'Xo‘jalik ishlari bo‘yicha direktor o‘rinbosari': 'Deputy Principal for Operations', 'Har kuni': 'Daily', 'Dushanba - Juma': 'Monday - Friday',
    'Video darslar': 'Video Lessons', 'Bilimni video orqali o‘rganing': 'Learn through video', 'Admin panel orqali boshqariladigan ochiq darslar va ta’limiy videolar': 'Open lessons and educational videos managed through the admin panel', 'Video darslar admin panel orqali boshqariladi': 'Video lessons are managed through the admin panel', 'Matematika': 'Mathematics', 'Fizika': 'Physics', 'Informatika': 'Computer Science', 'Kimyo': 'Chemistry', 'Biologiya': 'Biology', 'Ingliz tili': 'English', 'Rus tili': 'Russian', 'Ona tili va adabiyot': 'Native Language and Literature',
    'O‘zini-o‘zi boshqarish tizimi': 'Student self-government', 'Maktab Prezidenti va 7 ta vazirlik — o‘quvchilar maktab hayotini birgalikda boshqaradi, yangi g‘oyalarni amalga oshiradi va maktab rivojiga hissa qo‘shadi.': 'The School President and 7 ministries work together to manage school life, launch new ideas and contribute to school development.', 'Maktab Prezidenti': 'School President', 'Faol boshqaruv': 'Active leadership', 'O‘quvchilar jamoasi': 'Student community', 'Boshqaruv jamoasi': 'Leadership team', 'Vazirliklar': 'Ministries', '7 ta yo‘nalish': '7 areas',
    'Ta’lim Vazirligi': 'Education Ministry', 'Innovatsiya Vazirligi': 'Innovation Ministry', 'Sport Vazirligi': 'Sports Ministry', 'Moliya Vazirligi': 'Finance Ministry', 'Madaniyat Vazirligi': 'Culture Ministry', 'Ekologiya Vazirligi': 'Ecology Ministry', 'Kommunikatsiya Vazirligi': 'Communications Ministry', 'Vazir': 'Minister', 'Tashabbuslar': 'Initiatives', 'Telegram orqali': 'Via Telegram', 'Har bir vazirlik maktab hayotini rivojlantirish, o‘quvchilar tashabbuslarini qo‘llab-quvvatlash va yangi loyihalarni amalga oshirishga xizmat qiladi.': 'Each ministry helps develop school life, support student initiatives and deliver new projects.',
    'Innovatsiya va yutuqlar': 'Innovation and achievements', 'Maktabimizning raqamlardagi muvaffaqiyatlari': 'Our school’s success in numbers', 'Yilning eng faol maktabi – Jizzax viloyati, 2026': 'Most active school of the year — Jizzakh Region, 2026', 'Aksiya qatnashchilari': 'Campaign participants', 'Maxsus loyihalar': 'Special projects', 'Ochiq portal': 'Open portal', 'Grant yutuqlari': 'Grant achievements', 'Galereya': 'Gallery', 'Maktab hayotidan foto lavhalar': 'Photos from school life', 'Hozircha galereyaga rasmlar qo‘shilmagan.': 'No photos have been added to the gallery yet.',
    'Aloqa va Takliflar': 'Contact & Suggestions', 'Biz bilan bog‘laning': 'Get in touch', 'Manzil': 'Address', 'Google Maps\'da ko‘rish': 'View on Google Maps', 'Telefonlar': 'Phone numbers', 'Taklif va Murojaatlar': 'Suggestions & Requests', 'Murojaatingiz xavfsiz ravishda admin panelga yuboriladi.': 'Your message is securely sent to the admin panel.', 'Ismingiz (ixtiyoriy)': 'Your name (optional)', 'Taklif yoki murojaatingizni yozing...': 'Write your suggestion or request...', 'Yuborish': 'Send', 'Ijtimoiy tarmoqlar': 'Social networks', 'Bo‘limlar': 'Sections', 'Bosh sahifa': 'Home', 'Maktab haqida': 'About the School', 'Akademik': 'Academics', 'Ma’muriyat': 'Administration', 'Video darsliklar': 'Video Lessons', 'Aloqa': 'Contact', 'Barcha huquqlar himoyalangan.': 'All rights reserved.',
    'Yangi bildirishnomalar': 'New notifications', "E'lonlar va Tadbirlar": 'Announcements & Events', 'Yopish': 'Close', "Tug'ilgan kun! 🎂": 'Birthday! 🎂', 'bugun tug‘ilgan kuni!': 'has a birthday today!',
    '2022-yildan beri sifatli ta’lim': 'Quality education since 2022', 'Bilim, innovatsiya va vatanga muhabbat': 'Knowledge, innovation and love for the homeland',
    'Jizzax shahridagi 1-sonli ixtisoslashtirilgan maktab-internati. Iqtidorli o‘quvchilar uchun chuqurlashtirilgan ta’lim, zamonaviy laboratoriyalar va yetakchilik mahoratini rivojlantiruvchi innovatsion muhit.': 'Specialized Boarding School No. 1 in Jizzakh. Advanced education for talented students, modern laboratories and an innovative environment for developing leadership skills.',
  },
};

const attrNames = ['placeholder', 'aria-label', 'title', 'alt'];
let observer: MutationObserver | null = null;
let currentLocale: Locale = 'uz';

function translateValue(value: string, locale: Locale) {
  if (locale === 'uz') return value;
  const dictionary = dictionaries[locale];
  if (dictionary[value]) return dictionary[value];
  let result = value;
  for (const [from, to] of Object.entries(dictionary).sort((a, b) => b[0].length - a[0].length)) {
    if (result.includes(from)) result = result.split(from).join(to);
  }
  return result;
}

function translateDocument(locale: Locale) {
  currentLocale = locale;
  document.documentElement.lang = locale;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) nodes.push(node as Text);
  for (const textNode of nodes) {
    const parent = textNode.parentElement;
    if (!parent || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) continue;
    const original = textNode.textContent || '';
    if (!original.trim()) continue;
    const translated = translateValue(original, locale);
    if (translated !== original) textNode.textContent = translated;
  }
  for (const element of Array.from(document.querySelectorAll<HTMLElement>('*'))) {
    for (const attr of attrNames) {
      const value = element.getAttribute(attr);
      if (!value) continue;
      const translated = translateValue(value, locale);
      if (translated !== value) element.setAttribute(attr, translated);
    }
  }
  document.title = locale === 'ru' ? '1-IMI Джизак — Специализированная школа-интернат №1' : locale === 'en' ? '1-IMI Jizzakh — Specialized Boarding School No. 1' : '1-IMI Jizzax — 1-sonli ixtisoslashtirilgan maktab-internati';
}

export function getLocale(): Locale {
  const saved = localStorage.getItem('site_locale');
  return saved === 'ru' || saved === 'en' || saved === 'uz' ? saved : 'uz';
}

export function setLocale(locale: Locale) {
  localStorage.setItem('site_locale', locale);
  translateDocument(locale);
}

export function initI18n() {
  if (typeof window === 'undefined') return;
  currentLocale = getLocale();
  translateDocument(currentLocale);
  if (!observer) {
    observer = new MutationObserver(() => {
      if (currentLocale !== 'uz') translateDocument(currentLocale);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
}
