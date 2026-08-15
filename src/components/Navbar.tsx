import { useEffect, useRef, useState } from 'react';
import { GraduationCap, Menu, X } from 'lucide-react';
import { navLinks } from '../lib/data';

const menuLinks = [
  navLinks[0],
  navLinks[1],
  navLinks[2],
  { href: '#school-life', label: 'Maktab hayoti' },
  ...navLinks.slice(3),
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
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
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

    const y =
      element.getBoundingClientRect().top +
      window.pageYOffset -
      80;

    window.scrollTo({
      top: y,
      behavior: 'smooth',
    });
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 px-0 transition-[padding] duration-300 ${
        scrolled ? 'sm:px-5' : ''
      }`}
    >
      <nav
        className={`relative mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8 md:px-12 lg:px-16 transition-[margin,padding,border-radius,background-color,box-shadow] duration-300 ${
          scrolled
            ? 'mt-3 rounded-2xl border border-white/70 bg-white/75 py-2.5 shadow-lg shadow-slate-900/5 backdrop-blur-2xl'
            : 'bg-transparent py-3'
        }`}
      >
        {/* Logo */}
        <button
          type="button"
          onClick={() => handleNavClick('#hero')}
          className="group flex items-center gap-2.5 rounded-xl transition-transform duration-200 hover:scale-[1.02] active:scale-95"
          aria-label="Bosh sahifaga o'tish"
        >
          <span
            className={`relative flex items-center justify-center rounded-xl bg-[#0071e3] shadow-lg shadow-blue-500/20 transition-[width,height] duration-300 ${
              scrolled ? 'h-8 w-8' : 'h-9 w-9'
            }`}
          >
            <GraduationCap className="h-5 w-5 text-white" />
          </span>

          <span className="text-base font-bold tracking-tight text-[#1d1d1f]">
            1-IMI Jizzax
          </span>
        </button>

        {/* Desktop navigation */}
        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 lg:flex">
          {menuLinks.map((link) => (
            <button
              type="button"
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-[#1d1d1f] transition-[background-color,color,transform] duration-200 hover:bg-white/80 hover:text-[#0071e3] hover:scale-[1.02] active:scale-95"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Mobile navigation */}
        <div ref={menuRef} className="relative lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-transparent bg-white/60 backdrop-blur-md transition-[border-color,background-color,box-shadow,transform] duration-200 hover:border-white hover:bg-white/80 hover:shadow-md active:scale-90"
            aria-label={
              menuOpen ? 'Menyuni yopish' : 'Menyuni ochish'
            }
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          <div
            id="mobile-navigation"
            className={`absolute right-0 top-12 w-[min(90vw,360px)] overflow-hidden rounded-3xl border border-white/70 bg-white/95 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl transition-[opacity,transform,visibility] duration-200 ${
              menuOpen
                ? 'visible translate-y-0 opacity-100'
                : 'invisible -translate-y-2 opacity-0'
            }`}
          >
            <div className="flex flex-col p-3">
              {menuLinks.map((link) => (
                <button
                  type="button"
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="rounded-2xl px-4 py-3.5 text-left text-base font-medium text-[#1d1d1f] transition-[background-color,color,padding-left] duration-200 hover:bg-blue-50 hover:pl-5 hover:text-[#0071e3]"
                >
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
