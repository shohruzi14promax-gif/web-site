import { useEffect, useRef, useState } from 'react';
import { GraduationCap, Menu, X } from 'lucide-react';

const menuLinks = [
  { href: '#hero', label: 'Bosh sahifa' },
  { href: '#about', label: 'Maktab haqida' },
  { href: '#academic', label: 'Akademik' },
  { href: '#school-life', label: 'Maktab hayoti' },
  { href: '#media', label: 'Media' },
  { href: '#contact', label: 'Aloqa' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false); };
    const onPointerDown = (event: PointerEvent) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    };
    onScroll();
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
    const y = element.getBoundingClientRect().top + window.pageYOffset - 78;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 sm:px-5">
      <nav className={`mx-auto flex max-w-7xl items-center justify-between transition-all duration-300 ${scrolled ? 'mt-3 rounded-2xl border border-slate-900/10 bg-white/88 px-4 py-2.5 shadow-lg shadow-slate-900/8 backdrop-blur-xl sm:px-5' : 'px-2 py-4 sm:px-3'}`}>
        <button type="button" onClick={() => handleNavClick('#hero')} className="group flex min-h-11 shrink-0 items-center gap-2.5 rounded-xl px-1 transition-transform duration-200 active:scale-[.98]" aria-label="Bosh sahifaga o'tish">
          <span className={`flex items-center justify-center rounded-xl bg-[#0b1424] text-white shadow-sm transition-all duration-300 ${scrolled ? 'h-9 w-9' : 'h-10 w-10'}`}>
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="hidden text-sm font750 tracking-tight text-[#0b1424] sm:block">1-IMI Jizzax</span>
        </button>

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 lg:flex">
          {menuLinks.map(link => (
            <button key={link.href} type="button" onClick={() => handleNavClick(link.href)} className="relative rounded-full px-3.5 py-2 text-[13px] font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-100 hover:text-[#0b1424]">
              {link.label}
            </button>
          ))}
        </div>

        <div ref={menuRef} className="relative lg:hidden">
          <button type="button" onClick={() => setMenuOpen(value => !value)} className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-900/8 bg-white/85 text-slate-800 shadow-sm backdrop-blur-md transition-all duration-200 hover:bg-white active:scale-95" aria-label={menuOpen ? 'Menyuni yopish' : 'Menyuni ochish'} aria-expanded={menuOpen} aria-controls="mobile-navigation">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div id="mobile-navigation" className={`absolute right-0 top-[52px] w-[min(90vw,360px)] overflow-hidden rounded-[24px] border border-slate-900/8 bg-white/96 shadow-2xl shadow-slate-900/12 backdrop-blur-xl transition-all duration-250 ${menuOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0'}`}>
            <div className="p-2.5">
              {menuLinks.map(link => (
                <button key={link.href} type="button" onClick={() => handleNavClick(link.href)} className="flex min-h-11 w-full items-center rounded-2xl px-4 py-3 text-left text-[15px] font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-[#0071e3]">
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
