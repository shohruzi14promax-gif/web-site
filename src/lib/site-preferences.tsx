import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Locale = 'uz' | 'ru' | 'en';
export type Theme = 'light' | 'dark';

const localeLabels: Record<Locale, string> = { uz: 'O‘zbek', ru: 'Русский', en: 'English' };
const translations = {
  uz: { home: 'Bosh sahifa', school: 'Maktab', education: 'Ta’lim', life: 'Maktab hayoti', news: 'Yangiliklar', more: 'Yana', about: 'Maktab haqida', academic: 'Akademik portal', theme: 'Rang mavzusi', language: 'Tilni tanlang', schoolAbout: 'Maktab haqida', teachers: 'O‘qituvchilar', infrastructure: 'Infratuzilma', schedule: 'Dars jadvali', videos: 'Video darslar', dormitory: 'Yotoqxona', meals: 'Ovqatlanish', daily: 'Kun tartibi', sport: 'Sport', clubs: 'To‘garaklar', events: 'Tadbirlar', achievements: 'Yutuqlar', innovation: 'Innovatsiya', gallery: 'Galereya', media: 'Media', announcements: 'E’lonlar', contact: 'Aloqa', digitalSystems: 'Raqamli tizimlar', openNavigation: 'Navigatsiyani ochish', closeNavigation: 'Navigatsiyani yopish' },
  ru: { home: 'Главная', school: 'Школа', education: 'Обучение', life: 'Школьная жизнь', news: 'Новости', more: 'Ещё', about: 'О школе', academic: 'Академический портал', theme: 'Тема оформления', language: 'Выберите язык', schoolAbout: 'О школе', teachers: 'Учителя', infrastructure: 'Инфраструктура', schedule: 'Расписание', videos: 'Видеоуроки', dormitory: 'Общежитие', meals: 'Питание', daily: 'Распорядок дня', sport: 'Спорт', clubs: 'Кружки', events: 'События', achievements: 'Достижения', innovation: 'Инновации', gallery: 'Галерея', media: 'Медиа', announcements: 'Объявления', contact: 'Контакты', digitalSystems: 'Цифровые системы', openNavigation: 'Открыть навигацию', closeNavigation: 'Закрыть навигацию' },
  en: { home: 'Home', school: 'School', education: 'Education', life: 'School life', news: 'News', more: 'More', about: 'About the school', academic: 'Academic portal', theme: 'Theme', language: 'Choose language', schoolAbout: 'About the school', teachers: 'Teachers', infrastructure: 'Facilities', schedule: 'Timetable', videos: 'Video lessons', dormitory: 'Dormitory', meals: 'Meals', daily: 'Daily routine', sport: 'Sport', clubs: 'Clubs', events: 'Events', achievements: 'Achievements', innovation: 'Innovation', gallery: 'Gallery', media: 'Media', announcements: 'Announcements', contact: 'Contact', digitalSystems: 'Digital systems', openNavigation: 'Open navigation', closeNavigation: 'Close navigation' },
} as const;

const metadata: Record<Locale, { title: string; description: string; ogLocale: string }> = {
  uz: { title: '1-IMI Jizzax — ixtisoslashtirilgan maktab-internati', description: 'Jizzax shahridagi 1-sonli ixtisoslashtirilgan maktab-internatining rasmiy raqamli portali.', ogLocale: 'uz_UZ' },
  ru: { title: '1-ИМИ Джизак — специализированная школа-интернат', description: 'Официальный цифровой портал специализированной школы-интерната №1 города Джизака.', ogLocale: 'ru_RU' },
  en: { title: '1-IMI Jizzakh — specialised boarding school', description: 'The official digital portal of Jizzakh City Specialised Boarding School No. 1.', ogLocale: 'en_US' },
};

type Preferences = { locale: Locale; setLocale: (locale: Locale) => void; theme: Theme; toggleTheme: () => void; t: (key: keyof typeof translations.uz) => string; localeLabels: typeof localeLabels };
const PreferencesContext = createContext<Preferences | null>(null);

function preferredTheme(): Theme {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function SitePreferencesProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const queryLocale = new URLSearchParams(window.location.search).get('lang');
    return queryLocale === 'uz' || queryLocale === 'ru' || queryLocale === 'en' ? queryLocale : (localStorage.getItem('site-locale') as Locale) || 'uz';
  });
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('site-theme') as Theme) || preferredTheme());
  const setLocale = (next: Locale) => setLocaleState(next);

  useEffect(() => {
    localStorage.setItem('site-locale', locale);
    document.documentElement.lang = locale;
    const url = new URL(window.location.href);
    url.searchParams.set('lang', locale);
    window.history.replaceState({}, '', url);
    const current = metadata[locale];
    document.title = current.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', current.description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', current.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', current.description);
    document.querySelector('meta[property="og:locale"]')?.setAttribute('content', current.ogLocale);
  }, [locale]);

  useEffect(() => {
    localStorage.setItem('site-theme', theme);
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0f172a' : '#f8fafc');
  }, [theme]);

  const value = useMemo(() => ({ locale, setLocale, theme, toggleTheme: () => setTheme(value => value === 'dark' ? 'light' : 'dark'), t: (key: keyof typeof translations.uz) => translations[locale][key], localeLabels }), [locale, theme]);
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function useSitePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error('useSitePreferences must be used inside SitePreferencesProvider');
  return context;
}
