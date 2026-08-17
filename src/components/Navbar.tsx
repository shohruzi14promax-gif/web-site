import { useEffect, useRef, useState } from 'react';
import { GraduationCap, Menu, X } from 'lucide-react';

// Keep this order exactly aligned with App.tsx render order.
const menuLinks = [
  { href: '#hero', label: 'Bosh sahifa' },
  { href: '#about', label: 'Maktab haqida' },
  { href: '#academic', label: 'Akademik' },
  { href: '#school-life', label: 'Maktab hayoti' },
  { href: '#administration', label: 'Ma’muriyat' },
  { href: '#videolessons', label: 'Video darslar' },
  { href: '#president-office', label: 'Prezident maktabi' },
  { href: '#innovation', label: 'Innovatsiya' },
  { href: '#gallery', label: 'Galereya' },
  { href: '#contact', label: 'Aloqa' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
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

    const y = element.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  return (
    <header className={`fixed inset-x-0 top-0 z-50 px-0 transition-all duration-300 ${scrolled ? 'sm:px-3' : ''}`}>
      <nav
        className={`relative mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 transition-all duration-300 sm:px-6 lg:px-7 ${
          scrolled
            ? 'mt-2 rounded-2xl border border-white/70 bg-white/80 py-2 shadow-lg shadow-slate-900/5 backdrop-blur-2xl'
            : 'bg-transparent py-3'
        }`}
      >
        <button
          type="button"
          onClick={() => handleNavClick('#hero')}
          className="group flex shrink-0 items-center gap-2 rounded-xl transition-transform duration-200 hover:scale-[1.02] active:scale-95"
          aria-label="Bosh sahifaga o‘tish"
        >
          <span className={`relative flex items-center justify-center rounded-xl bg-[#0071e3] shadow-lg shadow-blue-500/20 transition-all duration-300 ${scrolled ? 'h-8 w-8' : 'h-9 w-9'}`}>
            <GraduationCap className="h-5 w-5 text-white" />
          </span>
          <span className="hidden text-sm font-bold tracking-tight text-[#1d1d1f] sm:inline lg:text-base">1-IMI Jizzax</span>
        </button>

        {/* Desktop: exact same order as the sections in App.tsx. */}
        <div className="hidden min-w-0 flex-1 items-center justify-end gap-0.5 lg:flex">
          {menuLinks.map((link) => (
            <button
              key={link.href}
              type="button"
              onClick={() => handleNavClick(link.href)}
              className="whitespace-nowrap rounded-full px-2.5 py-2 text-[12px] font-medium text-[#1d1d1f] transition-all duration-200 hover:bg-white/85 hover:text-[#0071e3] active:scale-95 xl:px-3 xl:text-[13px]"
            >
              {link.label}
            </button>
          ))}
        </div>

        <div ref={menuRef} className="relative lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/70 backdrop-blur-md transition-all duration-200 hover:bg-white/90 hover:shadow-md active:scale-90"
            aria-label={menuOpen ? 'Menyuni yopish' : 'Menyuni ochish'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div
            id="mobile-navigation"
            className={`absolute right-0 top-12 w-[min(92vw,380px)] overflow-hidden rounded-3xl border border-white/70 bg-white/95 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl transition-all duration-200 ${
              menuOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0'
            }`}
          >
            <div className="flex max-h-[75vh] flex-col gap-1 overflow-y-auto p-3">
              {menuLinks.map((link, index) => (
                <button
                  key={link.href}
                  type="button"
                  onClick={() => handleNavClick(link.href)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-[#1d1d1f] transition-all duration-200 hover:bg-blue-50 hover:pl-5 hover:text-[#0071e3]"
                >
                  <span className="w-5 text-xs font-bold text-slate-400">{index + 1}</span>
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
