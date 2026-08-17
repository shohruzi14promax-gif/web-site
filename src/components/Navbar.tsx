import { useEffect, useRef, useState } from 'react';
import { GraduationCap, Menu, X, Languages } from 'lucide-react';
import { getLocale, initI18n, type Locale } from '../lib/i18n';
import { initExtraI18n } from '../lib/i18nExtra';

const menuLinks = [
  { href: '#hero', label: 'Bosh sahifa' },
  { href: '#about', label: 'Maktab haqida' },
  { href: '#academic', label: 'Akademik' },
  { href: '#school-life', label: 'Maktab hayoti' },
  { href: '#administration', label: 'Ma’muriyat' },
  { href: '#media', label: 'Media' },
  { href: '#contact', label: 'Aloqa' },
];

const locales: Locale[] = ['uz', 'ru', 'en'];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [locale, setCurrentLocale] = useState<Locale>('uz');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentLocale(getLocale());
    initI18n();
    initExtraI18n();
    const onScroll = () => setScrolled(window.scrollY > 20);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [menuOpen]);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    const element = document.querySelector(href);
    if (!element) return;
    const y = element.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  const handleLocaleChange = (next: Locale) => {
    if (next === locale) return;
    localStorage.setItem('site_locale', next);
    setCurrentLocale(next);
    window.location.reload();
  };

  return (
    <header className={`fixed inset-x-0 top-0 z-50 px-0 transition-all duration-300 ${scrolled ? 'sm:px-5' : ''}`}>
      <nav className={`relative mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-8 md:px-12 lg:px-16 transition-all duration-300 ${scrolled ? 'mt-3 rounded-2xl border border-white/70 bg-white/75 py-2.5 shadow-lg shadow-slate-900/5 backdrop-blur-2xl' : 'bg-transparent py-3'}`}>
        <button type="button" onClick={() => handleNavClick('#hero')} className="group flex shrink-0 items-center gap-2.5 rounded-xl transition-transform duration-200 hover:scale-[1.02] active:scale-95" aria-label="Bosh sahifaga o'tish">
          <span className={`relative flex items-center justify-center rounded-xl bg-[#0071e3] shadow-lg shadow-blue-500/20 transition-all duration-300 ${scrolled ? 'h-8 w-8' : 'h-9 w-9'}`}>
            <GraduationCap className="h-5 w-5 text-white" />
          </span>
          <span className="text-base font-bold tracking-tight text-[#1d1d1f]">1-IMI Jizzax</span>
        </button>

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
          {menuLinks.map((link) => (
            <button key={link.href} type="button" onClick={() => handleNavClick(link.href)} className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-[#1d1d1f] transition-all duration-200 hover:bg-white/80 hover:text-[#0071e3] active:scale-95">
              {link.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-0.5 rounded-full border border-white/70 bg-white/70 p-1 shadow-sm backdrop-blur-xl sm:flex" aria-label="Language selector">
            <Languages className="ml-2 h-4 w-4 text-slate-500" />
            {locales.map((item) => (
              <button key={item} type="button" onClick={() => handleLocaleChange(item)} className={`rounded-full px-2.5 py-1.5 text-[11px] font-bold uppercase transition-all ${locale === item ? 'bg-[#0071e3] text-white shadow-sm' : 'text-slate-600 hover:bg-white'}`} aria-pressed={locale === item}>{item}</button>
            ))}
          </div>

          <div ref={menuRef} className="relative lg:hidden">
            <button type="button" onClick={() => setMenuOpen((value) => !value)} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/70 backdrop-blur-md transition-all duration-200 hover:bg-white active:scale-90" aria-label={menuOpen ? 'Menyuni yopish' : 'Menyuni ochish'} aria-expanded={menuOpen} aria-controls="mobile-navigation">
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div id="mobile-navigation" className={`absolute right-0 top-12 w-[min(92vw,380px)] overflow-hidden rounded-3xl border border-white/70 bg-white/95 shadow-2xl backdrop-blur-2xl transition-all duration-200 ${menuOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0'}`}>
              <div className="flex flex-col gap-1 p-3">
                <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-2">
                  <Languages className="ml-1 h-4 w-4 text-slate-500" />
                  {locales.map((item) => (
                    <button key={item} type="button" onClick={() => handleLocaleChange(item)} className={`flex-1 rounded-xl px-3 py-2 text-xs font-bold uppercase ${locale === item ? 'bg-[#0071e3] text-white' : 'text-slate-600 hover:bg-white'}`} aria-pressed={locale === item}>{item}</button>
                  ))}
                </div>
                {menuLinks.map((link) => (
                  <button key={link.href} type="button" onClick={() => handleNavClick(link.href)} className="rounded-2xl px-4 py-3.5 text-left text-base font-medium text-[#1d1d1f] transition-all duration-200 hover:bg-blue-50 hover:pl-5 hover:text-[#0071e3]">
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
