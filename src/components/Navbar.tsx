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
type SectionKey = 'home' | 'about' | 'academic' | 'life' | 'administration' | 'media' | 'contact' | 'president' | 'innovation' | 'gallery';

type Copy = {
  home: string;
  about: string;
  academic: string;
  life: string;
  administration: string;
  media: string;
  contact: string;
  more: string;
  digital: string;
  president: string;
  innovation: string;
  gallery: string;
  schoolCoin: string;
  admin: string;
  language: string;
  theme: string;
  openMenu: string;
  closeMenu: string;
};

const translations: Record<Locale, Copy> = {
  uz: {
    home: 'Bosh sahifa', about: 'Maktab haqida', academic: 'Akademik', life: 'Maktab hayoti', administration: 'Ma’muriyat', media: 'Media', contact: 'Aloqa', more: 'Yana', digital: 'Qo‘shimcha bo‘limlar', president: 'Prezident Devoni', innovation: 'Innovatsiya', gallery: 'Galereya', schoolCoin: 'SchoolCoin', admin: 'Admin Panel', language: 'Til', theme: 'Rejim', openMenu: 'Menyuni ochish', closeMenu: 'Menyuni yopish',
  },
  ru: {
    home: 'Главная', about: 'О школе', academic: 'Академика', life: 'Школьная жизнь', administration: 'Администрация', media: 'Медиа', contact: 'Контакты', more: 'Ещё', digital: 'Дополнительные разделы', president: 'Президентский совет', innovation: 'Инновации', gallery: 'Галерея', schoolCoin: 'SchoolCoin', admin: 'Панель админа', language: 'Язык', theme: 'Тема', openMenu: 'Открыть меню', closeMenu: 'Закрыть меню',
  },
  en: {
    home: 'Home', about: 'About school', academic: 'Academics', life: 'School life', administration: 'Administration', media: 'Media', contact: 'Contact', more: 'More', digital: 'Additional sections', president: 'President Office', innovation: 'Innovation', gallery: 'Gallery', schoolCoin: 'SchoolCoin', admin: 'Admin Panel', language: 'Language', theme: 'Theme', openMenu: 'Open menu', closeMenu: 'Close menu',
  },
};

const links: { href: string; key: SectionKey }[] = [
  { href: '#hero', key: 'home' },
  { href: '#about', key: 'about' },
  { href: '#academic', key: 'academic' },
  { href: '#school-life', key: 'life' },
  { href: '#administration', key: 'administration' },
  { href: '#videolessons', key: 'media' },
  { href: '#contact', key: 'contact' },
];

const extraLinks: { href: string; key: Exclude<SectionKey, 'home' | 'about' | 'academic' | 'life' | 'administration' | 'media' | 'contact'> }[] = [
  { href: '#president', key: 'president' },
  { href: '#innovation', key: 'innovation' },
  { href: '#gallery', key: 'gallery' },
];

const sectionIds = [...links, ...extraLinks].map((link) => link.href.slice(1));

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionKey>('home');
  const [locale, setLocale] = useState<Locale>(() => {
    const saved = localStorage.getItem('site_locale');
    return saved === 'ru' || saved === 'en' ? saved : 'uz';
  });
  const [dark, setDark] = useState(() => localStorage.getItem('site_theme') === 'dark');
  const menuRef = useRef<HTMLDivElement>(null);
  const t = translations[locale];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setMoreOpen(false);
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMoreOpen(false);
    };

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));
    const observer = sections.length
      ? new IntersectionObserver(
          (entries) => {
            const visible = entries
              .filter((entry) => entry.isIntersecting)
              .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
            if (visible?.target.id) setActiveSection(visible.target.id as SectionKey);
          },
          { rootMargin: '-24% 0px -62% 0px', threshold: [0.05, 0.2, 0.5] },
        )
      : null;

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    sections.forEach((section) => observer?.observe(section));
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
      observer?.disconnect();
    };
  }, [dark]);

  const navigate = (href: string) => {
    const key = href.slice(1) as SectionKey;
    setActiveSection(key);
    setMenuOpen(false);
    setMoreOpen(false);
    const element = document.querySelector(href);
    if (!element) return;
    const y = element.getBoundingClientRect().top + window.scrollY - 86;
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  };

  const changeLocale = (next: Locale) => {
    setLocale(next);
    localStorage.setItem('site_locale', next);
    window.dispatchEvent(new CustomEvent('site-locale-change', { detail: next }));
  };

  const toggleTheme = () => {
    setDark((value) => {
      const next = !value;
      localStorage.setItem('site_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const navButton = (link: { href: string; key: SectionKey }) => {
    const active = activeSection === link.key;
    return (
      <button
        key={link.href}
        type="button"
        onClick={() => navigate(link.href)}
        aria-current={active ? 'page' : undefined}
        className={`group relative whitespace-nowrap rounded-xl px-3 py-2 text-[12px] font-semibold transition-all duration-300 ease-[cubic-bezier(.16,1,.3,1)] active:scale-[.96] xl:text-[13px] ${active ? 'text-[#0071e3] dark:text-white' : 'text-slate-700 hover:text-[#0071e3] dark:text-slate-200 dark:hover:text-white'}`}
      >
        {active && <span className="absolute inset-0 -z-10 rounded-xl bg-white shadow-[0_4px_16px_rgba(15,23,42,.08)] ring-1 ring-slate-200/60 dark:bg-white/10 dark:ring-white/10" />}
        {!active && <span className="absolute inset-0 -z-10 rounded-xl bg-slate-100/0 transition-all duration-300 group-hover:bg-slate-100/80 dark:group-hover:bg-white/10" />}
        {t[link.key]}
      </button>
    );
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-2 sm:px-3">
      <nav
        ref={menuRef}
        className={`mx-auto mt-2 flex max-w-7xl items-center gap-2 rounded-[22px] border px-3 py-2 transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)] sm:px-4 ${
          scrolled
            ? 'border-slate-200/70 bg-white/85 shadow-[0_12px_40px_rgba(15,23,42,.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/85'
            : 'border-white/60 bg-white/65 shadow-[0_8px_32px_rgba(15,23,42,.06)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70'
        }`}
      >
        <button type="button" onClick={() => navigate('#hero')} className="group flex shrink-0 items-center gap-2 rounded-xl px-1.5 py-1.5 transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)] active:scale-[.96]" aria-label={t.home}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0071e3] shadow-lg shadow-blue-500/25 transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-105 group-active:scale-95">
            <GraduationCap className="h-5 w-5 text-white" />
          </span>
          <span className="hidden text-sm font-extrabold tracking-tight text-slate-900 dark:text-white sm:inline lg:text-base">1-IMI Jizzax</span>
        </button>

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 xl:flex">
          {links.map(navButton)}
          <div className="relative">
            <button type="button" onClick={() => setMoreOpen((value) => !value)} aria-expanded={moreOpen} className={`flex items-center gap-1 rounded-xl px-3 py-2 text-[12px] font-semibold transition-all duration-300 active:scale-[.96] xl:text-[13px] ${extraLinks.some((link) => link.key === activeSection) ? 'bg-white text-[#0071e3] shadow-[0_4px_16px_rgba(15,23,42,.08)] dark:bg-white/10 dark:text-white' : 'text-slate-700 hover:bg-slate-100/80 hover:text-[#0071e3] dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white'}`}>
              {t.more}<ChevronDown className={`h-4 w-4 transition-transform duration-300 ${moreOpen ? 'rotate-180' : ''}`} />
            </button>
            {moreOpen && (
              <div className="absolute right-0 top-12 w-64 origin-top-right animate-[ios-pop_.22s_cubic-bezier(.16,1,.3,1)] rounded-3xl border border-slate-200/70 bg-white/95 p-2 shadow-[0_20px_60px_rgba(15,23,42,.18)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/95">
                <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">{t.digital}</p>
                {extraLinks.map((link) => (
                  <button key={link.href} type="button" onClick={() => navigate(link.href)} className={`flex w-full items-center rounded-2xl px-3 py-2.5 text-left text-sm font-semibold transition-all duration-200 active:scale-[.98] ${activeSection === link.key ? 'bg-blue-50 text-[#0071e3] dark:bg-white/10 dark:text-white' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10'}`}>
                    {t[link.key]}
                  </button>
                ))}
                <div className="my-2 border-t border-slate-200 dark:border-white/10" />
                <button type="button" onClick={() => { setMenuOpen(false); setMoreOpen(false); window.dispatchEvent(new CustomEvent('open-schoolcoin')); }} className="flex w-full items-center rounded-2xl px-3 py-2.5 text-left text-sm font-bold text-amber-600 transition-all duration-200 hover:bg-amber-50 active:scale-[.98] dark:hover:bg-amber-500/10">🪙 {t.schoolCoin}</button>
                <button type="button" onClick={() => { setMenuOpen(false); setMoreOpen(false); window.dispatchEvent(new CustomEvent('open-admin')); }} className="flex w-full items-center rounded-2xl px-3 py-2.5 text-left text-sm font-bold text-slate-800 transition-all duration-200 hover:bg-slate-100 active:scale-[.98] dark:text-white dark:hover:bg-white/10">⚙️ {t.admin}</button>
              </div>
            )}
          </div>
        </div>

        <div className="ml-auto hidden items-center gap-1.5 lg:flex">
          <div className="flex items-center rounded-2xl border border-slate-200/70 bg-slate-100/70 p-0.5 shadow-inner dark:border-white/10 dark:bg-white/5" aria-label={t.language}>
            {(['uz', 'ru', 'en'] as Locale[]).map((item) => (
              <button key={item} type="button" onClick={() => changeLocale(item)} className={`rounded-xl px-2.5 py-1.5 text-[10px] font-extrabold uppercase transition-all duration-300 active:scale-95 ${locale === item ? 'bg-white text-[#0071e3] shadow-[0_2px_8px_rgba(15,23,42,.12)] dark:bg-white dark:text-slate-900' : 'text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'}`}>{item}</button>
            ))}
          </div>
          <button type="button" onClick={toggleTheme} className="group flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200/70 bg-slate-100/70 text-slate-700 shadow-inner transition-all duration-300 hover:-translate-y-0.5 hover:bg-white active:scale-90 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10" aria-label={t.theme} title={dark ? 'Light' : 'Dark'}>
            <span className="transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:rotate-12">{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</span>
          </button>
        </div>

        <div className="relative ml-auto lg:hidden">
          <button type="button" onClick={() => setMenuOpen((value) => !value)} className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/70 bg-white/75 text-slate-800 shadow-sm transition-all duration-300 active:scale-90 dark:border-white/10 dark:bg-white/10 dark:text-white" aria-label={menuOpen ? t.closeMenu : t.openMenu} aria-expanded={menuOpen}>
            <span className="transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)]">{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</span>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-12 w-[min(94vw,390px)] max-h-[80vh] origin-top-right animate-[ios-pop_.22s_cubic-bezier(.16,1,.3,1)] overflow-y-auto rounded-[28px] border border-slate-200/70 bg-white/95 p-3 shadow-[0_24px_70px_rgba(15,23,42,.2)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/95">
              {links.map((link, index) => {
                const active = activeSection === link.key;
                return <button key={link.href} type="button" onClick={() => navigate(link.href)} aria-current={active ? 'page' : undefined} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-all duration-200 active:scale-[.98] ${active ? 'bg-blue-50 text-[#0071e3] dark:bg-white/10 dark:text-white' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10'}`}><span className="w-5 text-xs text-slate-400">{index + 1}</span>{t[link.key]}</button>;
              })}
              <div className="my-2 border-t border-slate-200 dark:border-white/10" />
              {extraLinks.map((link) => <button key={link.href} type="button" onClick={() => navigate(link.href)} className="flex w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-100 active:scale-[.98] dark:text-slate-200 dark:hover:bg-white/10">{t[link.key]}</button>)}
              <div className="my-2 border-t border-slate-200 dark:border-white/10" />
              <div className="flex items-center justify-between gap-2 px-2 py-2">
                <div className="flex items-center rounded-2xl border border-slate-200/70 bg-slate-100/70 p-0.5 dark:border-white/10 dark:bg-white/5">
                  {(['uz', 'ru', 'en'] as Locale[]).map((item) => <button key={item} type="button" onClick={() => changeLocale(item)} className={`rounded-xl px-2.5 py-1.5 text-[10px] font-extrabold uppercase transition-all duration-300 active:scale-95 ${locale === item ? 'bg-white text-[#0071e3] shadow-sm dark:bg-white dark:text-slate-900' : 'text-slate-500 dark:text-slate-300'}`}>{item}</button>)}
                </div>
                <button type="button" onClick={toggleTheme} className="flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 transition-all duration-300 active:scale-90 dark:border-white/10 dark:bg-white/5" aria-label={t.theme}>{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
              </div>
              <button type="button" onClick={() => { setMenuOpen(false); window.dispatchEvent(new CustomEvent('open-schoolcoin')); }} className="w-full rounded-2xl px-4 py-3 text-left text-sm font-bold text-amber-600 transition-all duration-200 hover:bg-amber-50 active:scale-[.98] dark:hover:bg-amber-500/10">🪙 {t.schoolCoin}</button>
              <button type="button" onClick={() => { setMenuOpen(false); window.dispatchEvent(new CustomEvent('open-admin')); }} className="w-full rounded-2xl px-4 py-3 text-left text-sm font-bold text-slate-800 transition-all duration-200 active:scale-[.98] dark:text-white dark:hover:bg-white/10">⚙️ {t.admin}</button>
            </div>
          )}
        </div>
      </nav>
      <style>{`@keyframes ios-pop{from{opacity:0;transform:translateY(-6px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
    </header>
  );
}
