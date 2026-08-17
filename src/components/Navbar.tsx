import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  GraduationCap,
  Menu,
  Moon,
  Sun,
  X,
} from 'lucide-react';

type Locale = 'uz' | 'ru' | 'en';

const translations: Record<Locale, { home: string; about: string; academic: string; life: string; administration: string; media: string; contact: string; more: string; digital: string; schoolCoin: string; admin: string; language: string; theme: string }> = {
  uz: {
    home: 'Bosh sahifa', about: 'Maktab haqida', academic: 'Akademik', life: 'Maktab hayoti', administration: 'Ma’muriyat', media: 'Media', contact: 'Aloqa', more: 'Ko‘proq', digital: 'Raqamli tizimlar', schoolCoin: 'SchoolCoin', admin: 'Admin Panel', language: 'Til', theme: 'Rejim',
  },
  ru: {
    home: 'Главная', about: 'О школе', academic: 'Академика', life: 'Школьная жизнь', administration: 'Администрация', media: 'Медиа', contact: 'Контакты', more: 'Ещё', digital: 'Цифровые системы', schoolCoin: 'SchoolCoin', admin: 'Панель админа', language: 'Язык', theme: 'Тема',
  },
  en: {
    home: 'Home', about: 'About school', academic: 'Academics', life: 'School life', administration: 'Administration', media: 'Media', contact: 'Contact', more: 'More', digital: 'Digital systems', schoolCoin: 'SchoolCoin', admin: 'Admin Panel', language: 'Language', theme: 'Theme',
  },
};

const links = [
  { href: '#hero', key: 'home' },
  { href: '#about', key: 'about' },
  { href: '#academic', key: 'academic' },
  { href: '#school-life', key: 'life' },
  { href: '#administration', key: 'administration' },
  { href: '#videolessons', key: 'media' },
  { href: '#contact', key: 'contact' },
] as const;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [locale, setLocale] = useState<Locale>(() => (localStorage.getItem('site_locale') as Locale) || 'uz');
  const [dark, setDark] = useState(() => localStorage.getItem('site_theme') === 'dark');
  const menuRef = useRef<HTMLDivElement>(null);
  const t = translations[locale];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMenuOpen(false); setMoreOpen(false); }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMoreOpen(false);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [dark]);

  const navigate = (href: string) => {
    setMenuOpen(false);
    setMoreOpen(false);
    const element = document.querySelector(href);
    if (!element) return;
    const y = element.getBoundingClientRect().top + window.scrollY - 86;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  const changeLocale = (next: Locale) => {
    setLocale(next);
    localStorage.setItem('site_locale', next);
  };

  const toggleTheme = () => {
    setDark((value) => {
      const next = !value;
      localStorage.setItem('site_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-2 sm:px-3">
      <nav
        ref={menuRef}
        className={`mx-auto mt-2 flex max-w-7xl items-center gap-2 rounded-2xl border px-3 py-2 transition-all duration-300 sm:px-4 ${
          scrolled
            ? 'border-slate-200/70 bg-white/85 shadow-xl shadow-slate-900/10 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/85'
            : 'border-white/50 bg-white/65 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70'
        }`}
      >
        <button type="button" onClick={() => navigate('#hero')} className="group flex shrink-0 items-center gap-2 rounded-xl px-1.5 py-1.5" aria-label={t.home}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0071e3] shadow-lg shadow-blue-500/25 transition-transform group-hover:scale-105">
            <GraduationCap className="h-5 w-5 text-white" />
          </span>
          <span className="hidden text-sm font-extrabold tracking-tight text-slate-900 dark:text-white sm:inline lg:text-base">1-IMI Jizzax</span>
        </button>

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 xl:flex">
          {links.map((link) => (
            <button key={link.href} type="button" onClick={() => navigate(link.href)} className="whitespace-nowrap rounded-xl px-2.5 py-2 text-[12px] font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-[#0071e3] dark:text-slate-200 dark:hover:bg-white/10 xl:px-3 xl:text-[13px]">
              {t[link.key]}
            </button>
          ))}
          <div className="relative">
            <button type="button" onClick={() => setMoreOpen((v) => !v)} className="flex items-center gap-1 rounded-xl px-3 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10" aria-expanded={moreOpen}>
              {t.more}<ChevronDown className={`h-4 w-4 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
            </button>
            {moreOpen && (
              <div className="absolute right-0 top-11 w-60 rounded-2xl border border-slate-200/70 bg-white/95 p-2 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95">
                <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.digital}</p>
                <button type="button" onClick={() => navigate('#president')} className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10">President Office</button>
                <button type="button" onClick={() => navigate('#innovation')} className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10">Innovation</button>
                <button type="button" onClick={() => navigate('#gallery')} className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10">Gallery</button>
                <div className="my-1 border-t border-slate-200 dark:border-white/10" />
                <button type="button" onClick={() => { setMenuOpen(false); window.dispatchEvent(new CustomEvent('open-schoolcoin')); }} className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10">🪙 {t.schoolCoin}</button>
                <button type="button" onClick={() => { setMenuOpen(false); window.dispatchEvent(new CustomEvent('open-admin')); }} className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-bold text-slate-800 hover:bg-slate-100 dark:text-white dark:hover:bg-white/10">⚙️ {t.admin}</button>
              </div>
            )}
          </div>
        </div>

        <div className="ml-auto hidden items-center gap-1.5 lg:flex">
          <div className="flex items-center rounded-xl border border-slate-200/70 bg-slate-50/70 p-0.5 dark:border-white/10 dark:bg-white/5" aria-label={t.language}>
            {(['uz', 'ru', 'en'] as Locale[]).map((item) => (
              <button key={item} type="button" onClick={() => changeLocale(item)} className={`rounded-lg px-2 py-1.5 text-[10px] font-extrabold uppercase transition ${locale === item ? 'bg-[#0071e3] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'}`}>{item}</button>
            ))}
          </div>
          <button type="button" onClick={toggleTheme} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/70 bg-slate-50/70 text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white" aria-label={t.theme} title={dark ? 'Light' : 'Dark'}>
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>

        <div className="relative ml-auto lg:hidden">
          <button type="button" onClick={() => setMenuOpen((v) => !v)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/70 bg-white/75 text-slate-800 dark:border-white/10 dark:bg-white/10 dark:text-white" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-12 w-[min(94vw,390px)] max-h-[80vh] overflow-y-auto rounded-3xl border border-slate-200/70 bg-white/95 p-3 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/95">
              {links.map((link, index) => (
                <button key={link.href} type="button" onClick={() => navigate(link.href)} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"><span className="w-5 text-xs text-slate-400">{index + 1}</span>{t[link.key]}</button>
              ))}
              <button type="button" onClick={() => navigate('#president')} className="flex w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10">President Office</button>
              <button type="button" onClick={() => navigate('#innovation')} className="flex w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10">Innovation</button>
              <button type="button" onClick={() => navigate('#gallery')} className="flex w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10">Gallery</button>
              <div className="my-2 border-t border-slate-200 dark:border-white/10" />
              <div className="flex items-center justify-between gap-2 px-2 py-2">
                <div className="flex items-center rounded-xl border border-slate-200/70 bg-slate-50 p-0.5 dark:border-white/10 dark:bg-white/5">
                  {(['uz', 'ru', 'en'] as Locale[]).map((item) => <button key={item} type="button" onClick={() => changeLocale(item)} className={`rounded-lg px-2.5 py-1.5 text-[10px] font-extrabold uppercase ${locale === item ? 'bg-[#0071e3] text-white' : 'text-slate-500 dark:text-slate-300'}`}>{item}</button>)}
                </div>
                <button type="button" onClick={toggleTheme} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10" aria-label={t.theme}>{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
              </div>
              <button type="button" onClick={() => { setMenuOpen(false); window.dispatchEvent(new CustomEvent('open-schoolcoin')); }} className="w-full rounded-2xl px-4 py-3 text-left text-sm font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10">🪙 {t.schoolCoin}</button>
              <button type="button" onClick={() => { setMenuOpen(false); window.dispatchEvent(new CustomEvent('open-admin')); }} className="w-full rounded-2xl px-4 py-3 text-left text-sm font-bold text-slate-800 dark:text-white">⚙️ {t.admin}</button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
