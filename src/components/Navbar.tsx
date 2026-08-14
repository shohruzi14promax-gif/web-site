import { useEffect, useRef, useState } from 'react';
import { GraduationCap, Menu, X } from 'lucide-react';

const menuLinks = [
  { href: '#hero', label: 'Bosh sahifa' },
  { href: '#about', label: 'Maktab haqida' },
  { href: '#academic', label: 'Akademik' },
  { href: '#school-life', label: 'Maktab hayoti' },
  { href: '#administration', label: "Ma'muriyat" },
  { href: '#videolessons', label: 'Video darsliklar' },
  { href: '#innovation', label: 'Innovatsiya' },
  { href: '#gallery', label: 'Galereya' },
  { href: '#contact', label: 'Aloqa' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (menuOpen && navRef.current && !navRef.current.contains(event.target as Node)) setMenuOpen(false);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [menuOpen]);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
  };

  return (
    <header ref={node => { navRef.current = node; }} className={`fixed inset-x-0 top-0 z-50 transition-[padding] duration-300 ${scrolled ? 'px-3 sm:px-5' : 'px-0'}`}>
      <nav className={`mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8 md:px-12 lg:px-16 transition-[background-color,box-shadow,border-radius,margin,padding] duration-300 ${scrolled ? 'mt-3 rounded-2xl border border-white/70 bg-white/75 py-2.5 shadow-lg shadow-slate-900/5 backdrop-blur-2xl saturate-150' : 'bg-transparent py-3'}`}>
        <button type="button" onClick={() => handleNavClick('#hero')} className="group flex cursor-pointer items-center gap-2.5 transition-[transform] duration-200 hover:scale-[1.03] active:scale-95" aria-label="Bosh sahifa">
          <span className={`relative flex items-center justify-center rounded-xl bg-[#0071e3] shadow-lg shadow-blue-500/20 transition-[transform] duration-300 ${scrolled ? 'h-8 w-8' : 'h-9 w-9'}`}>
            <GraduationCap className="relative z-10 h-5 w-5 text-white" strokeWidth={2.5} />
          </span>
          <span className="text-base font-bold tracking-tight text-[#1d1d1f]">1-IMI Jizzax</span>
        </button>

        <div className="hidden items-center gap-1 lg:flex">
          {menuLinks.map(link => (
            <button type="button" key={link.href} onClick={() => handleNavClick(link.href)} className="rounded-full px-3 py-2 text-sm font-medium text-[#1d1d1f] transition-[background-color,color,transform] duration-200 hover:scale-[1.03] hover:bg-white/80 hover:text-[#0071e3] active:scale-95">
              {link.label}
            </button>
          ))}
        </div>

        <button type="button" onClick={() => setMenuOpen(prev => !prev)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/50 backdrop-blur-md transition-[background-color,box-shadow,transform] duration-200 hover:bg-white/80 hover:shadow-md active:scale-90 lg:hidden" aria-label={menuOpen ? 'Menyuni yopish' : 'Menyuni ochish'} aria-expanded={menuOpen} aria-controls="mobile-navigation">
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <div id="mobile-navigation" className={`overflow-hidden transition-[max-height,opacity,transform] duration-300 lg:hidden ${menuOpen ? 'max-h-[700px] translate-y-0 opacity-100' : 'pointer-events-none max-h-0 -translate-y-2 opacity-0'}`}>
        <div className="mx-3 mt-2 overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl sm:mx-5">
          <div className="flex flex-col p-3">
            {menuLinks.map(link => (
              <button type="button" key={link.href} onClick={() => handleNavClick(link.href)} className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-left text-base font-medium text-[#1d1d1f] transition-[background-color,color,padding-left] duration-200 hover:bg-blue-50 hover:pl-5 hover:text-[#0071e3]">
                <span>{link.label}</span><span aria-hidden="true" className="text-[#0071e3]">→</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
