import { useEffect, useRef, useState } from 'react';
import { ChevronDown, GraduationCap, Menu, Moon, Sun, X } from 'lucide-react';
import { useSitePreferences } from '../lib/site-preferences';

type Link = { href: string; label: string };

export default function Navbar() {
  const { locale, setLocale, localeLabels, theme, toggleTheme, t } = useSitePreferences();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const desktopMenuRef = useRef<HTMLDivElement>(null);
  const go = (href: string) => { setMenuOpen(false); setDesktopOpen(null); document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const school: Link[] = [{ href: '#about', label: t('schoolAbout') }, { href: '#administration', label: t('teachers') }, { href: '#about', label: t('infrastructure') }];
  const education: Link[] = [{ href: '#academic', label: t('academic') }, { href: '#academic', label: t('schedule') }, { href: '#videolessons', label: t('videos') }];
  const life: Link[] = [{ href: '#school-life', label: t('dormitory') }, { href: '#school-life', label: t('meals') }, { href: '#school-life', label: t('daily') }];
  const more: Link[] = [{ href: '#innovation', label: 'Innovation' }, { href: '#gallery', label: t('gallery') }, { href: '#contact', label: t('contact') }];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    const close = (event: KeyboardEvent) => event.key === 'Escape' && (setMenuOpen(false), setDesktopOpen(null));
    const outside = (event: PointerEvent) => { const node = event.target as Node; if (menuRef.current && !menuRef.current.contains(node)) setMenuOpen(false); if (desktopMenuRef.current && !desktopMenuRef.current.contains(node)) setDesktopOpen(null); };
    window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('keydown', close); document.addEventListener('pointerdown', outside);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('keydown', close); document.removeEventListener('pointerdown', outside); };
  }, []);

  const dropdown = (label: string, links: Link[], id: string) => <div ref={desktopOpen === id ? desktopMenuRef : undefined} className="relative">
    <button type="button" onClick={() => setDesktopOpen(value => value === id ? null : id)} className="nav-link" aria-expanded={desktopOpen === id}>{label}<ChevronDown className={`h-3.5 w-3.5 ${desktopOpen === id ? 'rotate-180' : ''}`} /></button>
    <div className={`nav-dropdown ${desktopOpen === id ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0'}`}>{links.map(link => <button key={link.label} type="button" onClick={() => go(link.href)}>{link.label}</button>)}</div>
  </div>;
  const controls = <div className="flex items-center gap-1"><button type="button" className="nav-icon" onClick={toggleTheme} aria-label={t('theme')} title={t('theme')}>{theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button><select aria-label={t('language')} value={locale} onChange={event => setLocale(event.target.value as typeof locale)} className="nav-language">{(['uz', 'ru', 'en'] as const).map(item => <option key={item} value={item}>{localeLabels[item]}</option>)}</select></div>;

  return <header className={`fixed inset-x-0 top-0 z-50 px-0 transition-[padding] duration-300 ${scrolled ? 'sm:px-5' : ''}`}><nav className={`relative mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8 md:px-12 lg:px-16 ${scrolled ? 'nav-surface mt-3 py-2.5' : 'bg-transparent py-3'}`}>
    <button type="button" onClick={() => go('#hero')} className="flex items-center gap-2.5 rounded-xl" aria-label={t('home')}><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#0071e3] text-white"><GraduationCap className="h-5 w-5" /></span><span className="text-base font-bold tracking-tight">1-IMI Jizzax</span></button>
    <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex"><button type="button" className="nav-link" onClick={() => go('#hero')}>{t('home')}</button>{dropdown(t('school'), school, 'school')}{dropdown(t('education'), education, 'education')}{dropdown(t('life'), life, 'life')}<button type="button" className="nav-link" onClick={() => go('#news')}>{t('news')}</button>{dropdown(t('more'), more, 'more')}</div>
    <div className="hidden lg:block">{controls}</div>
    <div ref={menuRef} className="relative lg:hidden"><button type="button" onClick={() => setMenuOpen(value => !value)} className="nav-icon" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen}>{menuOpen ? <X /> : <Menu />}</button><div className={`mobile-nav ${menuOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0'}`}><div className="space-y-1 p-3">{([{ href: '#hero', label: t('home') }, ...school, ...education, ...life, { href: '#news', label: t('news') }, ...more]).map(link => <button key={link.label} type="button" onClick={() => go(link.href)}>{link.label}</button>)}<div className="border-t px-3 pt-3">{controls}</div></div></div></div>
  </nav></header>;
}
