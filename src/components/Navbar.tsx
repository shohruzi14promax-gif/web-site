import { useState, useEffect } from 'react';
import { GraduationCap, Menu, X } from 'lucide-react';
import { navLinks } from '../lib/data';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) {
      const yOffset = -80;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass border-b border-black/5 bg-white/80 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8 md:px-12 lg:px-16">
        <button
          onClick={() => handleNavClick('#hero')}
          className="flex items-center gap-2.5 transition-transform hover:scale-105 cursor-pointer"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0071e3]">
            <GraduationCap className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-base font-bold tracking-tight text-[#1d1d1f]">1-IMI Jizzax</span>
        </button>

        {/* Desktop menyu */}
        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-[#1d1d1f] transition-colors hover:bg-black/5 cursor-pointer"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Mobil menyu tugmasi */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-black/5 cursor-pointer"
            aria-label="Menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="glass border-t border-black/5 lg:hidden bg-white/95 backdrop-blur-md">
          <div className="flex flex-col px-5 py-4 sm:px-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="rounded-xl px-4 py-3 text-left text-base font-medium text-[#1d1d1f] transition-colors hover:bg-black/5 cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}