import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Locale = 'uz' | 'en' | 'ru';

type Dictionary = Record<string, string>;

const dictionaries: Record<Locale, Dictionary> = {
  uz: {
    home:'Bosh sahifa', about:'Maktab haqida', academic:'Akademik', life:'Maktab hayoti', administration:'Ma’muriyat', media:'Media', contact:'Aloqa', more:'Yana', digital:'Qo‘shimcha bo‘limlar', president:'Prezident Devoni', innovation:'Innovatsiya', gallery:'Galereya', schoolCoin:'SchoolCoin', admin:'Admin Panel', language:'Til', theme:'Rejim', openMenu:'Menyuni ochish', closeMenu:'Menyuni yopish',
    learn:'O‘rganing', create:'Yarating', lead:'Yetakchilik qiling', schoolAbout:'Maktab haqida', explore:'Ko‘rish',
    news:'Yangiliklar', newsFromSchool:'Maktab hayotidan', officialSource:'Rasmiy manba', newsError:'Yangiliklarni yuklashda xatolik yuz berdi.', newsEmpty:'Hozircha yangiliklar e’lon qilinmagan.', newsEmptyHint:'Yangi e’lonlar admin tizimidan qo‘shilganda shu yerda ko‘rinadi.', noDetails:'Tafsilot mavjud emas.', dateUnavailable:'Sana ko‘rsatilmagan',
    events:'Tadbirlar', upcomingEvents:'Upcoming events', eventsEmpty:'Hozircha tadbirlar mavjud emas', eventsHint:'Keyinroq tekshirib ko‘ring.', date:'Sana', time:'Vaqt', place:'Joy',
    teachers:'Ustozlarimiz', team:'Jamoa', teacherSearch:'Ism yoki fan bo‘yicha qidirish', teacherSearchLabel:'Ustozlarni qidirish', teacherError:'O‘qituvchilarni yuklashda xatolik yuz berdi.', teacherEmpty:'O‘qituvchi ma’lumotlari mavjud emas.', teacherNotFound:'Qidiruv bo‘yicha ustoz topilmadi.',
    notifications:'Yangi bildirishnomalar', close:'Yopish', birthdays:'Tug‘ilgan kun!', announcements:'E’lonlar va Tadbirlar',
    light:'Yorug‘', dark:'Qorong‘i', system:'Tizim', loading:'Yuklanmoqda…', error:'Xatolik', empty:'Hozircha ma’lumot yo‘q', success:'Muvaffaqiyatli'
  },
  en: {
    home:'Home', about:'About school', academic:'Academics', life:'School life', administration:'Administration', media:'Media', contact:'Contact', more:'More', digital:'Additional sections', president:'President Office', innovation:'Innovation', gallery:'Gallery', schoolCoin:'SchoolCoin', admin:'Admin Panel', language:'Language', theme:'Theme', openMenu:'Open menu', closeMenu:'Close menu',
    learn:'Learn', create:'Create', lead:'Lead', schoolAbout:'About school', explore:'Explore',
    news:'News', newsFromSchool:'From school life', officialSource:'Official source', newsError:'Unable to load news.', newsEmpty:'No news has been published yet.', newsEmptyHint:'New announcements added from the admin system will appear here.', noDetails:'No details available.', dateUnavailable:'Date not available',
    events:'Events', upcomingEvents:'Upcoming events', eventsEmpty:'No events available yet', eventsHint:'Please check again later.', date:'Date', time:'Time', place:'Place',
    teachers:'Our teachers', team:'Team', teacherSearch:'Search by name or subject', teacherSearchLabel:'Search teachers', teacherError:'Unable to load teachers.', teacherEmpty:'Teacher information is not available.', teacherNotFound:'No teacher found for this search.',
    notifications:'New notifications', close:'Close', birthdays:'Birthday!', announcements:'Announcements & Events',
    light:'Light', dark:'Dark', system:'System', loading:'Loading…', error:'Error', empty:'No data yet', success:'Success'
  },
  ru: {
    home:'Главная', about:'О школе', academic:'Академика', life:'Школьная жизнь', administration:'Администрация', media:'Медиа', contact:'Контакты', more:'Ещё', digital:'Дополнительные разделы', president:'Президентский офис', innovation:'Инновации', gallery:'Галерея', schoolCoin:'SchoolCoin', admin:'Панель администратора', language:'Язык', theme:'Тема', openMenu:'Открыть меню', closeMenu:'Закрыть меню',
    learn:'Учиться', create:'Создавать', lead:'Лидировать', schoolAbout:'О школе', explore:'Подробнее',
    news:'Новости', newsFromSchool:'Из школьной жизни', officialSource:'Официальный источник', newsError:'Не удалось загрузить новости.', newsEmpty:'Пока новостей нет.', newsEmptyHint:'Новые объявления из панели администратора появятся здесь.', noDetails:'Подробности недоступны.', dateUnavailable:'Дата не указана',
    events:'События', upcomingEvents:'Предстоящие события', eventsEmpty:'Пока событий нет', eventsHint:'Проверьте позже.', date:'Дата', time:'Время', place:'Место',
    teachers:'Наши учителя', team:'Команда', teacherSearch:'Поиск по имени или предмету', teacherSearchLabel:'Поиск учителей', teacherError:'Не удалось загрузить учителей.', teacherEmpty:'Информация об учителях недоступна.', teacherNotFound:'Учитель не найден.',
    notifications:'Новые уведомления', close:'Закрыть', birthdays:'День рождения!', announcements:'Объявления и события',
    light:'Светлая', dark:'Тёмная', system:'Системная', loading:'Загрузка…', error:'Ошибка', empty:'Данных пока нет', success:'Успешно'
  },
};

interface I18nContextValue { locale: Locale; setLocale: (locale: Locale) => void; t: (key: string) => string; }
const I18nContext = createContext<I18nContextValue | null>(null);

const readLocale = (): Locale => {
  if (typeof window === 'undefined') return 'uz';
  const saved = localStorage.getItem('site_locale');
  return saved === 'en' || saved === 'ru' || saved === 'uz' ? saved : 'uz';
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readLocale);
  const setLocale = (next: Locale) => {
    setLocaleState(next);
    localStorage.setItem('site_locale', next);
    window.dispatchEvent(new CustomEvent('site-locale-change', { detail: next }));
  };
  useEffect(() => {
    const onChange = (event: Event) => {
      const next = (event as CustomEvent<Locale>).detail;
      if (next === 'uz' || next === 'en' || next === 'ru') setLocaleState(next);
    };
    window.addEventListener('site-locale-change', onChange);
    return () => window.removeEventListener('site-locale-change', onChange);
  }, []);
  const value = useMemo(() => ({ locale, setLocale, t: (key: string) => dictionaries[locale][key] ?? dictionaries.uz[key] ?? key }), [locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n must be used inside I18nProvider');
  return value;
}
