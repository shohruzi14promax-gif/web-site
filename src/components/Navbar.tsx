import { useState, useEffect } from 'react';
import { GraduationCap, Menu, X } from 'lucide-react';
import { navLinks } from '../lib/data';

const menuLinks = navLinks;

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
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${scrolled ? 'px-3 sm:px-5' : 'px-0'}`}>
        <nav className={`mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8 md:px-12 lg:px-16 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${scrolled ? 'mt-3 rounded-2xl border border-white/70 bg-white/75 py-2.5 shadow-lg shadow-slate-900/5 backdrop-blur-2xl saturate-150' : 'py-3 bg-transparent'}`}>
          <button onClick={() => handleNavClick('#hero')} className="group flex items-center gap-2.5 cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-95">
            <div className={`relative flex items-center justify-center rounded-xl bg-[#0071e3] shadow-lg shadow-blue-500/20 transition-all duration-500 group-hover:rotate-3 group-hover:scale-110 ${scrolled ? 'h-8 w-8' : 'h-9 w-9'}`}>
              <div className="absolute inset-0 rounded-xl bg-[#0071e3] blur-md opacity-0 transition-opacity duration-300 group-hover:opacity-40" />
              <GraduationCap className="relative z-10 h-5 w-5 text-white transition-transform duration-300 group-hover:scale-110" strokeWidth={2.5} />
            </div>
            <span className="text-base font-bold tracking-tight text-[#1d1d1f] transition-colors duration-300 group-hover:text-[#0071e3]">1-IMI Jizzax</span>
          </button>

          <div className="hidden items-center gap-1 lg:flex">
            {menuLinks.map((link, index) => (
              <button key={link.href} onClick={() => handleNavClick(link.href)} className="group relative rounded-full px-3.5 py-2 text-sm font-medium text-[#1d1d1f] cursor-pointer transition-all duration-300 hover:bg-white/80 hover:text-[#0071e3] hover:scale-[1.03] active:scale-95" style={{ animationDelay: `${index * 50}ms` }}>
                {link.label}
                <span className="absolute bottom-1 left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-[#0071e3] transition-all duration-300 group-hover:w-1/2" />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)} className="group flex h-10 w-10 items-center justify-center rounded-full border border-transparent bg-white/50 backdrop-blur-md cursor-pointer transition-all duration-300 hover:border-white hover:bg-white/80 hover:shadow-md active:scale-90" aria-label="Menu" aria-expanded={menuOpen}>
              <span className="transition-transform duration-300 group-hover:scale-110">{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</span>
            </button>
          </div>
        </nav>

        <div className={`overflow-hidden lg:hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${menuOpen ? 'max-h-[700px] opacity-100 translate-y-0' : 'pointer-events-none max-h-0 opacity-0 -translate-y-3'}`}>
          <div className="mx-3 mt-2 overflow-hidden rounded-3xl border border-white/70 bg-white/85 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl sm:mx-5">
            <div className="flex flex-col p-3">
              {menuLinks.map((link, index) => (
                <button key={link.href} onClick={() => handleNavClick(link.href)} className={`group flex items-center justify-between rounded-2xl px-4 py-3.5 text-left text-base font-medium text-[#1d1d1f] cursor-pointer transition-all duration-300 hover:bg-blue-50 hover:text-[#0071e3] hover:pl-6 active:scale-[0.98] ${menuOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`} style={{ transitionDelay: menuOpen ? `${index * 50 + 100}ms` : '0ms' }}>
                  <span>{link.label}</span>
                  <span className="text-[#0071e3] opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">→</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
