import { useEffect, useRef, useState } from 'react';
import { ChevronDown, GraduationCap, Menu, Moon, Sun, X } from 'lucide-react';
import { useI18n, type Locale } from '../i18n';

type SectionKey = 'home' | 'about' | 'academic' | 'life' | 'administration' | 'media' | 'contact' | 'president' | 'innovation' | 'gallery';
const links: { href: string; key: SectionKey }[] = [
  { href: '#hero', key: 'home' }, { href: '#about', key: 'about' }, { href: '#academic', key: 'academic' },
  { href: '#school-life', key: 'life' }, { href: '#administration', key: 'administration' }, { href: '#videolessons', key: 'media' }, { href: '#contact', key: 'contact' },
];
const extraLinks: { href: string; key: Exclude<SectionKey, 'home' | 'about' | 'academic' | 'life' | 'administration' | 'media' | 'contact'> }[] = [
  { href: '#president', key: 'president' }, { href: '#innovation', key: 'innovation' }, { href: '#gallery', key: 'gallery' },
];
const sectionIds = [...links, ...extraLinks].map(link => link.href.slice(1));

export default function Navbar() {
  const { locale, setLocale, t } = useI18n();
  const [scrolled, setScrolled] = useState(false), [menuOpen, setMenuOpen] = useState(false), [moreOpen, setMoreOpen] = useState(false), [activeSection, setActiveSection] = useState<SectionKey>('home');
  const [dark, setDark] = useState(() => localStorage.getItem('site_theme') === 'dark');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') { setMenuOpen(false); setMoreOpen(false); } };
    const onPointerDown = (event: PointerEvent) => { if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMoreOpen(false); };
    const sections = sectionIds.map(id => document.getElementById(id)).filter((element): element is HTMLElement => Boolean(element));
    const observer = sections.length ? new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) setActiveSection(visible.target.id as SectionKey);
    }, { rootMargin: '-24% 0px -62% 0px', threshold: [0.05, 0.2, 0.5] }) : null;
    window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('keydown', onKeyDown); document.addEventListener('pointerdown', onPointerDown);
    sections.forEach(section => observer?.observe(section));
    document.documentElement.classList.toggle('dark', dark); document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('keydown', onKeyDown); document.removeEventListener('pointerdown', onPointerDown); observer?.disconnect(); };
  }, [dark]);

  const navigate = (href: string) => {
    setActiveSection(href.slice(1) as SectionKey); setMenuOpen(false); setMoreOpen(false);
    const element = document.querySelector(href); if (!element) return;
    window.scrollTo({ top: Math.max(0, element.getBoundingClientRect().top + window.scrollY - 86), behavior: 'smooth' });
  };
  const changeTheme = () => setDark(value => { const next = !value; localStorage.setItem('site_theme', next ? 'dark' : 'light'); return next; });
  const navButton = (link: { href: string; key: SectionKey }) => {
    const active = activeSection === link.key;
    return <button key={link.href} type="button" onClick={() => navigate(link.href)} aria-current={active ? 'page' : undefined} className={`group relative whitespace-nowrap rounded-xl px-3 py-2 text-[12px] font-semibold transition-all duration-300 active:scale-[.96] xl:text-[13px] ${active ? 'text-[#0071e3] dark:text-white' : 'text-slate-700 hover:text-[#0071e3] dark:text-slate-200 dark:hover:text-white'}`}>
      {active && <span className="absolute inset-0 -z-10 rounded-xl bg-white shadow-[0_4px_16px_rgba(15,23,42,.08)] ring-1 ring-slate-200/60 dark:bg-white/10 dark:ring-white/10" />}{t(link.key)}
    </button>;
  };
  const localeButtons = <div className="flex items-center rounded-2xl border border-slate-200/70 bg-slate-100/70 p-0.5 shadow-inner dark:border-white/10 dark:bg-white/5" aria-label={t('language')}>
    {(['uz', 'ru', 'en'] as Locale[]).map(item => <button key={item} type="button" onClick={() => setLocale(item)} aria-pressed={locale === item} className={`rounded-xl px-2.5 py-1.5 text-[10px] font-extrabold uppercase transition-all duration-300 active:scale-95 ${locale === item ? 'bg-white text-[#0071e3] shadow-sm dark:bg-white dark:text-slate-900' : 'text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'}`}>{item}</button>)}
  </div>;

  return <header className="fixed inset-x-0 top-0 z-50 px-2 sm:px-3"><nav ref={menuRef} className={`mx-auto mt-2 flex max-w-7xl items-center gap-2 rounded-[22px] border px-3 py-2 transition-all duration-500 sm:px-4 ${scrolled ? 'border-slate-200/70 bg-white/85 shadow-[0_12px_40px_rgba(15,23,42,.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/85' : 'border-white/60 bg-white/65 shadow-[0_8px_32px_rgba(15,23,42,.06)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70'}`}>
    <button type="button" onClick={() => navigate('#hero')} className="group flex shrink-0 items-center gap-2 rounded-xl px-1.5 py-1.5 active:scale-[.96]" aria-label={t('home')}><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0071e3]"><GraduationCap className="h-5 w-5 text-white" /></span><span className="hidden text-sm font-extrabold tracking-tight text-slate-900 dark:text-white sm:inline lg:text-base">1-IMI Jizzax</span></button>
    <div className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 xl:flex">{links.map(navButton)}<div className="relative"><button type="button" onClick={() => setMoreOpen(value => !value)} aria-expanded={moreOpen} className="flex items-center gap-1 rounded-xl px-3 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10 xl:text-[13px]">{t('more')}<ChevronDown className={`h-4 w-4 transition-transform ${moreOpen ? 'rotate-180' : ''}`} /></button>{moreOpen && <div className="absolute right-0 top-12 w-64 rounded-3xl border border-slate-200/70 bg-white/95 p-2 shadow-[0_20px_60px_rgba(15,23,42,.18)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/95"><p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">{t('digital')}</p>{extraLinks.map(link => <button key={link.href} type="button" onClick={() => navigate(link.href)} className="flex w-full rounded-2xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10">{t(link.key)}</button>)}<div className="my-2 border-t border-slate-200 dark:border-white/10" /><button type="button" onClick={() => { setMoreOpen(false); window.dispatchEvent(new CustomEvent('open-schoolcoin')); }} className="flex w-full rounded-2xl px-3 py-2.5 text-left text-sm font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10">🪙 {t('schoolCoin')}</button><button type="button" onClick={() => { setMoreOpen(false); window.dispatchEvent(new CustomEvent('open-admin')); }} className="flex w-full rounded-2xl px-3 py-2.5 text-left text-sm font-bold text-slate-800 hover:bg-slate-100 dark:text-white dark:hover:bg-white/10">⚙️ {t('admin')}</button></div>}</div></div>
    <div className="ml-auto hidden items-center gap-1.5 lg:flex">{localeButtons}<button type="button" onClick={changeTheme} className="flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200/70 bg-slate-100/70 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white" aria-label={t('theme')} title={dark ? t('light') : t('dark')}>{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button></div>
    <div className="relative ml-auto lg:hidden"><button type="button" onClick={() => setMenuOpen(value => !value)} className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/70 bg-white/75 text-slate-800 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-white" aria-label={menuOpen ? t('closeMenu') : t('openMenu')} aria-expanded={menuOpen}>{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>{menuOpen && <div className="absolute right-0 top-12 max-h-[80vh] w-[min(94vw,390px)] overflow-y-auto rounded-[28px] border border-slate-200/70 bg-white/95 p-3 shadow-[0_24px_70px_rgba(15,23,42,.2)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/95">{links.map((link, index) => <button key={link.href} type="button" onClick={() => navigate(link.href)} aria-current={activeSection === link.key ? 'page' : undefined} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"><span className="w-5 text-xs text-slate-400">{index + 1}</span>{t(link.key)}</button>)}<div className="my-2 border-t border-slate-200 dark:border-white/10" />{extraLinks.map(link => <button key={link.href} type="button" onClick={() => navigate(link.href)} className="flex w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10">{t(link.key)}</button>)}<div className="my-2 border-t border-slate-200 dark:border-white/10" /><div className="flex items-center justify-between gap-2 px-2 py-2">{localeButtons}<button type="button" onClick={changeTheme} className="flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5" aria-label={t('theme')}>{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button></div><button type="button" onClick={() => { setMenuOpen(false); window.dispatchEvent(new CustomEvent('open-schoolcoin')); }} className="w-full rounded-2xl px-4 py-3 text-left text-sm font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10">🪙 {t('schoolCoin')}</button><button type="button" onClick={() => { setMenuOpen(false); window.dispatchEvent(new CustomEvent('open-admin')); }} className="w-full rounded-2xl px-4 py-3 text-left text-sm font-bold text-slate-800 dark:text-white dark:hover:bg-white/10">⚙️ {t('admin')}</button></div>}</div>
  </nav></header>;
}
