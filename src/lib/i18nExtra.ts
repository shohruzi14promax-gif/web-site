import type { Locale } from './i18n';

const extra: Record<'ru' | 'en', Record<string, string>> = {
  ru: {
    'Bilim, innovatsiya va vatanga muhabbat': 'Знания, инновации и любовь к Родине',
    'Maktab haqida batafsil': 'Подробнее о школе',
    'Akademik portal': 'Академический портал',
    'Maqsadlarimiz va tariximiz': 'Наши цели и история',
    'O‘quvchilarni chuqur bilim, tanqidiy fikrlash va ijodiy yondashuv bilan qurollantirish. Har bir o‘quvchining salohiyatini to‘liq ochish.': 'Давать учащимся глубокие знания, развивать критическое мышление и творческий подход. Раскрывать потенциал каждого ученика.',
    'STEM, robototexnika va yangi texnologiyalar orqali o‘quvchilarni kelajak kasblariga tayyorlash. Tadqiqot va loyiha asosida o‘qitish.': 'Готовить учащихся к профессиям будущего через STEM, робототехнику и новые технологии. Обучение на основе исследований и проектов.',
    'Milliy g‘urur, fuqarolik mas’uliyati va jamiyat oldidagi burchini chuqur his qiladigan, harakatchan yoshlarni tarbiyalash.': 'Воспитывать активную молодёжь с чувством национальной гордости, гражданской ответственности и долга перед обществом.',
    'Prezident Devoni orqali o‘quvchilarning yetakchilik, jamoa boshqaruvi va qaror qabul qilish ko‘nikmalarini rivojlantirish.': 'Развивать лидерские навыки, управление командой и принятие решений через Президентский совет.',
    'Jizzax shahrida iqtidorli o‘quvchilar uchun 1-sonli ixtisoslashtirilgan maktab-internati tashkil etildi. Zamonaviy kampus, laboratoriyalar va sport zali bilan 450 nafar o‘quvchiga mo‘ljallangan holda faoliyat boshladi.': 'В Джизаке была создана специализированная школа-интернат №1 для талантливых учащихся. Школа начала работу с современным кампусом, лабораториями и спортивным залом, рассчитанным на 450 учащихся.',
    'Matematika, fizika va informatika bo‘yicha chuqurlashtirilgan o‘quv dasturlari joriy etildi. Bir vaqtning o‘zida STEM innovatsiya markazi ochildi — robototexnika, sun’iy intellekt va 3D modellashtirish to‘garaklari tashkil etildi.': 'Введены углублённые программы по математике, физике и информатике. Одновременно открыт STEM-инновационный центр с кружками робототехники, искусственного интеллекта и 3D-моделирования.',
    'Turkiya va Qozog‘istondagi nufuzli maktablar bilan almashinuv dasturi boshlandi. Cambridge English sertifikatlash markazi ochildi. Birinchi o‘quvchilar respublika olimpiadalarida g‘olib bo‘ldi.': 'Начались программы обмена с престижными школами Турции и Казахстана. Открыт центр сертификации Cambridge English. Первые учащиеся стали победителями республиканских олимпиад.',
    'O‘quvchilar o‘zini-o‘zi boshqarish tizimi sifatida 6 ta vazirlikdan iborat Prezident Devoni tashkil etildi. O‘quvchilarning tashabbuskorlik va yetakchilik mahorati rivojlantirildi.': 'Президентский совет из 6 министерств создан как система ученического самоуправления. Развиваются инициативность и лидерские навыки учащихся.',
    'To‘liq raqamli maktab portaliga o‘tish amalga oshirildi. Video darslar arxivi, onlayn GPA reytingi va ota-onalar kuzatuvi tizimi ishga tushdi. Birinchi bitiruvchilar oliy o‘quv muassasalariga muvaffaqiyatli kirdi.': 'Осуществлён переход на полностью цифровой школьный портал. Запущены архив видеуроков, онлайн-рейтинг GPA и система родительского контроля. Первые выпускники успешно поступили в вузы.',
    'Abdullayeva Nigora Askarovna': 'Абдуллаева Нигора Аскаровна', 'Abdurasulova Munira Husan qizi': 'Абдурасулова Мунира Хусан кызы', 'Adashboyev Jaloliddin Nabi o‘g‘li': 'Адашбоев Жалолиддин Наби угли', 'Aralova Gulchexra Kuchkarovna': 'Аралова Гулчехра Кучкаровна', 'Asrayev Saidazim Ulug‘bek o‘g‘li': 'Асраев Саидазим Улугбек угли', 'Ashurova Feruza Oltiboyevna': 'Ашурова Феруза Олтибоевна', 'Bobojanova Dilafruz Murodovna': 'Бобожанова Дилафруз Муродовна', 'Yodgorov Erkin Yodgor o‘g‘li': 'Ёдгоров Эркин Ёдгор угли',
    'Matematik analiz: Cheklovlar va hosilalar': 'Математический анализ: пределы и производные', 'Mexanika: Nyuton qonunlari va ularning qo‘llanishi': 'Механика: законы Ньютона и их применение', 'Python dasturlash: Funksiyalar va ro‘yxatlar': 'Программирование на Python: функции и списки', 'Organik kimyo: Uglevodorodlar va izomeriya': 'Органическая химия: углеводороды и изомерия', 'Genetika: Mendel qonunlari va DNK tuzilishi': 'Генетика: законы Менделя и структура ДНК', 'IELTS Writing Task 2: Essay tuzilishi': 'IELTS Writing Task 2: структура эссе',
    'O‘qituvchi: Azizov Shuhrat E.': 'Учитель: Азизов Шухрат Э.', 'O‘qituvchi: Saidova Gulnoza T.': 'Учитель: Саидова Гульноза Т.', 'O‘qituvchi: Ergashev Jamshid P.': 'Учитель: Эргашев Джамшид П.', 'O‘qituvchi: Hakimov Otabek N.': 'Учитель: Хакимов Отабек Н.', 'O‘qituvchi: Yuldasheva Barno Q.': 'Учитель: Юлдашева Барно К.', 'O‘qituvchi: Toshmatova Dilfuza R.': 'Учитель: Тошматова Дилфуза Р.',
    'Maktab Prezidenti va 7 ta vazirlik': 'Президент школы и 7 министерств', 'Shamsiddinov Shohruz': 'Шамсиддинов Шохруз',
    'Bilim sifatini oshirish va o‘quv faoliyatini nazorat qilish. Olimpiada va tanlovlarga tayyorgarlik, o‘qituvchilar bilan hamkorlik.': 'Повышение качества знаний и контроль учебной деятельности. Подготовка к олимпиадам и конкурсам, сотрудничество с учителями.',
    'Zamonaviy texnologiyalar, startaplar va yangi g‘oyalarni joriy etish. STEM loyihalarini boshqarish, texnologik tanlovlar o‘tkazish.': 'Внедрение современных технологий, стартапов и новых идей. Управление STEM-проектами и проведение технологических конкурсов.',
    'Sog‘lom turmush tarzi va musobaqalarni tashkil etish. Maktab terma jamoalarini boshqarish va sport tadbirlarini o‘tkazish.': 'Продвижение здорового образа жизни и организация соревнований. Управление школьными сборными и спортивными мероприятиями.',
    'Loyihalarni iqtisodiy asoslash va resurslar hisobi. Maktab byudjetini rejalashtirish, xarajatlarni nazorat qilish va moliyaviy hisobotlar.': 'Экономическое обоснование проектов и учёт ресурсов. Планирование бюджета школы, контроль расходов и финансовая отчётность.',
    'Ma’naviy-ma’rifiy tadbirlar va ijodiy loyihalar. Teatr to‘garaklari, musiqa kechalari va milliy urf-odatlarni saqlash.': 'Духовно-просветительские мероприятия и творческие проекты. Театральные кружки, музыкальные вечера и сохранение национальных традиций.',
    'Atrof-muhit muhofazasi va tozalikni saqlash. Daraxt ekish aksiyalari, chiqindini saralash va ekologik ta’lim.': 'Защита окружающей среды и поддержание чистоты. Акции по посадке деревьев, сортировка отходов и экологическое образование.',
    'SMM boshqaruv, rasmiy kanallar, dizayn va jamoaaro aloqalar. Maktab ijtimoiy tarmoqlarini boshqarish va yangiliklar chiqarish.': 'SMM, официальные каналы, дизайн и связи с общественностью. Управление соцсетями школы и публикация новостей.',
    'Matematika olimpiadasi': 'Олимпиада по математике', 'Kitobxonlik klubi': 'Клуб чтения', 'O‘qituvchilar bahori': 'Весна учителей', 'Robototexnika klubi': 'Клуб робототехники', 'Startap haftaligi': 'Стартап-неделя', 'AI tanlovi': 'AI-конкурс', 'Futbol ligasi': 'Футбольная лига', 'Shaxmat turniri': 'Шахматный турнир', 'Sport kunlari': 'Спортивные дни', 'Loyiha byudjetlari': 'Бюджеты проектов', 'Moliyaviy hisobot': 'Финансовая отчётность', 'Resurslar taqsimoti': 'Распределение ресурсов', 'Teatr studiyasi': 'Театральная студия', 'Navro‘z bayrami': 'Праздник Навруз', 'She’riyat oqshomi': 'Вечер поэзии', 'Daraxt ekish aksi': 'Акция по посадке деревьев', 'Chiqindi saralash': 'Сортировка отходов', 'Ekologik olimpiada': 'Экологическая олимпиада', 'Maktab gazetasi': 'Школьная газета', 'Telegram kanal': 'Telegram-канал', 'Media studiya': 'Медиастудия',
  },
  en: {
    'O‘quvchilarni chuqur bilim, tanqidiy fikrlash va ijodiy yondashuv bilan qurollantirish. Har bir o‘quvchining salohiyatini to‘liq ochish.': 'Equip students with deep knowledge, critical thinking and creative approaches. Unlock every student’s full potential.',
    'STEM, robototexnika va yangi texnologiyalar orqali o‘quvchilarni kelajak kasblariga tayyorlash. Tadqiqot va loyiha asosida o‘qitish.': 'Prepare students for future careers through STEM, robotics and new technologies. Research- and project-based learning.',
    'Milliy g‘urur, fuqarolik mas’uliyati va jamiyat oldidagi burchini chuqur his qiladigan, harakatchan yoshlarni tarbiyalash.': 'Develop active young people with national pride, civic responsibility and a strong sense of duty to society.',
    'Prezident Devoni orqali o‘quvchilarning yetakchilik, jamoa boshqaruvi va qaror qabul qilish ko‘nikmalarini rivojlantirish.': 'Develop leadership, team management and decision-making skills through the President’s Office.',
    'Jizzax shahrida iqtidorli o‘quvchilar uchun 1-sonli ixtisoslashtirilgan maktab-internati tashkil etildi. Zamonaviy kampus, laboratoriyalar va sport zali bilan 450 nafar o‘quvchiga mo‘ljallangan holda faoliyat boshladi.': 'Specialized Boarding School No. 1 was established in Jizzakh for talented students. It opened with a modern campus, laboratories and a sports hall designed for 450 students.',
    'Matematika, fizika va informatika bo‘yicha chuqurlashtirilgan o‘quv dasturlari joriy etildi. Bir vaqtning o‘zida STEM innovatsiya markazi ochildi — robototexnika, sun’iy intellekt va 3D modellashtirish to‘garaklari tashkil etildi.': 'Advanced curricula in mathematics, physics and computer science were introduced. A STEM innovation center was also opened with robotics, AI and 3D modeling clubs.',
    'Turkiya va Qozog‘istondagi nufuzli maktablar bilan almashinuv dasturi boshlandi. Cambridge English sertifikatlash markazi ochildi. Birinchi o‘quvchilar respublika olimpiadalarida g‘olib bo‘ldi.': 'Exchange programs began with prestigious schools in Turkey and Kazakhstan. A Cambridge English certification center opened. The first students won national olympiads.',
    'O‘quvchilar o‘zini-o‘zi boshqarish tizimi sifatida 6 ta vazirlikdan iborat Prezident Devoni tashkil etildi. O‘quvchilarning tashabbuskorlik va yetakchilik mahorati rivojlantirildi.': 'A six-ministry President’s Office was created as a student self-government system. Student initiative and leadership skills were strengthened.',
    'To‘liq raqamli maktab portaliga o‘tish amalga oshirildi. Video darslar arxivi, onlayn GPA reytingi va ota-onalar kuzatuvi tizimi ishga tushdi. Birinchi bitiruvchilar oliy o‘quv muassasalariga muvaffaqiyatli kirdi.': 'The school moved to a fully digital portal. A video lesson archive, online GPA ranking and parent monitoring system were launched. The first graduates successfully entered universities.',
    'O‘qituvchilar, fanlar va reytinglar': 'Teachers, subjects and rankings', 'Chuqurlashtirilgan ta’lim dasturi, professional pedagoglar va GPA reytingi': 'Advanced curriculum, professional educators and GPA ranking',
    'Matematik analiz: Cheklovlar va hosilalar': 'Mathematical analysis: limits and derivatives', 'Mexanika: Nyuton qonunlari va ularning qo‘llanishi': 'Mechanics: Newton’s laws and applications', 'Python dasturlash: Funksiyalar va ro‘yxatlar': 'Python programming: functions and lists', 'Organik kimyo: Uglevodorodlar va izomeriya': 'Organic chemistry: hydrocarbons and isomerism', 'Genetika: Mendel qonunlari va DNK tuzilishi': 'Genetics: Mendel’s laws and DNA structure', 'IELTS Writing Task 2: Essay tuzilishi': 'IELTS Writing Task 2: essay structure',
    'O‘qituvchi: Azizov Shuhrat E.': 'Teacher: Azizov Shuhrat E.', 'O‘qituvchi: Saidova Gulnoza T.': 'Teacher: Saidova Gulnoza T.', 'O‘qituvchi: Ergashev Jamshid P.': 'Teacher: Ergashev Jamshid P.', 'O‘qituvchi: Hakimov Otabek N.': 'Teacher: Hakimov Otabek N.', 'O‘qituvchi: Yuldasheva Barno Q.': 'Teacher: Yuldasheva Barno Q.', 'O‘qituvchi: Toshmatova Dilfuza R.': 'Teacher: Toshmatova Dilfuza R.',
    'Maktab Prezidenti': 'School President', 'Faol boshqaruv': 'Active leadership', 'O‘quvchilar jamoasi': 'Student community', 'Boshqaruv jamoasi': 'Leadership team', 'Vazirliklar': 'Ministries', '7 ta yo‘nalish': '7 areas', 'Vazir': 'Minister', 'Tashabbuslar': 'Initiatives',
    'Bilim sifatini oshirish va o‘quv faoliyatini nazorat qilish. Olimpiada va tanlovlarga tayyorgarlik, o‘qituvchilar bilan hamkorlik.': 'Improve learning quality and monitor academic activity. Prepare for olympiads and competitions and collaborate with teachers.',
    'Zamonaviy texnologiyalar, startaplar va yangi g‘oyalarni joriy etish. STEM loyihalarini boshqarish, texnologik tanlovlar o‘tkazish.': 'Introduce modern technologies, startups and new ideas. Manage STEM projects and run technology competitions.',
    'Sog‘lom turmush tarzi va musobaqalarni tashkil etish. Maktab terma jamoalarini boshqarish va sport tadbirlarini o‘tkazish.': 'Promote healthy lifestyles and organize competitions. Manage school teams and sports events.',
    'Loyihalarni iqtisodiy asoslash va resurslar hisobi. Maktab byudjetini rejalashtirish, xarajatlarni nazorat qilish va moliyaviy hisobotlar.': 'Build economic cases for projects and track resources. Plan the school budget, control spending and prepare financial reports.',
    'Ma’naviy-ma’rifiy tadbirlar va ijodiy loyihalar. Teatr to‘garaklari, musiqa kechalari va milliy urf-odatlarni saqlash.': 'Run cultural and creative projects, theatre clubs and music evenings while preserving national traditions.',
    'Atrof-muhit muhofazasi va tozalikni saqlash. Daraxt ekish aksiyalari, chiqindini saralash va ekologik ta’lim.': 'Protect the environment and keep the campus clean through tree-planting campaigns, waste sorting and environmental education.',
    'SMM boshqaruv, rasmiy kanallar, dizayn va jamoaaro aloqalar. Maktab ijtimoiy tarmoqlarini boshqarish va yangiliklar chiqarish.': 'Manage SMM, official channels, design and public relations. Run school social media and publish news.',
    'Matematika olimpiadasi': 'Mathematics Olympiad', 'Kitobxonlik klubi': 'Reading Club', 'O‘qituvchilar bahori': 'Teachers’ Spring', 'Robototexnika klubi': 'Robotics Club', 'Startap haftaligi': 'Startup Week', 'AI tanlovi': 'AI Competition', 'Futbol ligasi': 'Football League', 'Shaxmat turniri': 'Chess Tournament', 'Sport kunlari': 'Sports Days', 'Loyiha byudjetlari': 'Project Budgets', 'Moliyaviy hisobot': 'Financial Reports', 'Resurslar taqsimoti': 'Resource Allocation', 'Teatr studiyasi': 'Theatre Studio', 'Navro‘z bayrami': 'Navruz Celebration', 'She’riyat oqshomi': 'Poetry Evening', 'Daraxt ekish aksi': 'Tree Planting Campaign', 'Chiqindi saralash': 'Waste Sorting', 'Ekologik olimpiada': 'Environmental Olympiad', 'Maktab gazetasi': 'School Newspaper', 'Telegram kanal': 'Telegram Channel', 'Media studiya': 'Media Studio',
  },
};

export function initExtraI18n() {
  if (typeof window === 'undefined') return;
  const locale = localStorage.getItem('site_locale') as Locale | null;
  if (locale !== 'ru' && locale !== 'en') return;
  const dictionary = extra[locale];
  const translate = () => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) nodes.push(node as Text);
    for (const textNode of nodes) {
      const parent = textNode.parentElement;
      if (!parent || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) continue;
      let value = textNode.textContent || '';
      for (const [from, to] of Object.entries(dictionary).sort((a, b) => b[0].length - a[0].length)) {
        if (value.includes(from)) value = value.split(from).join(to);
      }
      if (value !== textNode.textContent) textNode.textContent = value;
    }
  };
  translate();
  const observer = new MutationObserver(translate);
  observer.observe(document.body, { childList: true, subtree: true });
}
