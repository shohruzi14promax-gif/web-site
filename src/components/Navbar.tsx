import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ChevronDown, GraduationCap, Menu, X } from 'lucide-react';

const menuLinks = [
  { href: '#hero', label: 'Bosh sahifa' },
  { href: '#about', label: 'Maktab haqida' },
  { href: '#academic', label: 'Akademik' },
  { href: '#school-life', label: 'Maktab hayoti' },
  { href: '#administration', label: 'Ma’muriyat' },
  { href: '#gallery', label: 'Media' },
  { href: '#contact', label: 'Aloqa' },
];

const sectionLinks = [
  { href: '#gallery', label: 'Galereya' },
  { href: '#innovation', label: 'Innovatsiya' },
  { href: '#president', label: 'Prezident devoni' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeHref, setActiveHref] = useState('#hero');
  const [menuOpen, setMenuOpen] = useState(false);
  const [sectionsOpen, setSectionsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setSectionsOpen(false);
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menuOpen && menuRef.current && !menuRef.current.contains(target)) setMenuOpen(false);
      if (sectionsOpen && sectionsRef.current && !sectionsRef.current.contains(target)) setSectionsOpen(false);
    };

    const sectionIds = [...menuLinks, ...sectionLinks].map(link => link.href.slice(1));
    const sections = sectionIds
      .map(id => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    const observer = sections.length
      ? new IntersectionObserver(
          entries => {
            const visible = entries
              .filter(entry => entry.isIntersecting)
              .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
            if (visible) setActiveHref(`#${visible.target.id}`);
          },
          { rootMargin: '-24% 0px -62% 0px', threshold: [0.05, 0.2, 0.5] },
        )
      : null;

    onScroll();
    sections.forEach(section => observer?.observe(section));
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      observer?.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [menuOpen, sectionsOpen]);

  const handleNavClick = (href: string) => {
    setActiveHref(href);
    setMenuOpen(false);
    setSectionsOpen(false);
    const element = document.querySelector(href);
    if (!element) return;
    const y = element.getBoundingClientRect().top + window.pageYOffset - 78;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  const navStyle = {
    '--nav-bg': scrolled ? 'rgba(255, 255, 255, 0.76)' : 'rgba(255, 255, 255, 0.28)',
    '--nav-border': scrolled ? 'rgba(255, 255, 255, 0.62)' : 'rgba(255, 255, 255, 0.42)',
    '--nav-shadow': scrolled ? '0 10px 30px rgba(15, 23, 42, 0.055)' : '0 7px 20px rgba(15, 23, 42, 0.022)',
  } as CSSProperties;

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-2 sm:px-5 sm:pt-2.5">
      <nav style={navStyle} className="glass-nav mx-auto flex w-full max-w-5xl items-center justify-between rounded-[20px] px-3 py-1.5 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-200 sm:px-4">
        <button type="button" onClick={() => handleNavClick('#hero')} className="group flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-1 transition-transform duration-200 active:scale-[.98]" aria-label="Bosh sahifaga o'tish">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0b1424] text-white shadow-sm transition-all duration-300">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="hidden text-sm font-bold tracking-tight text-[#0b1424] sm:block">1-IMI Jizzax</span>
        </button>

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 lg:flex">
          {menuLinks.map(link => {
            const isActive = activeHref === link.href;
            return (
              <button key={link.href} type="button" onClick={() => handleNavClick(link.href)} className={`relative rounded-[11px] px-3 py-1.5 text-[13px] font-medium transition-colors duration-200 hover:bg-[#0071e3]/[0.07] hover:text-[#0b1424] focus-visible:bg-white/60 ${isActive ? 'bg-[#0071e3]/[0.10] text-[#0068d7]' : 'text-slate-600'}`} aria-current={isActive ? 'page' : undefined}>
                {link.label}
              </button>
            );
          })}

          <div ref={sectionsRef} className="relative">
            <button
              type="button"
              onClick={() => setSectionsOpen(value => !value)}
              className={`flex items-center gap-1 rounded-[11px] px-3 py-1.5 text-[13px] font-medium transition-colors duration-200 hover:bg-[#0071e3]/[0.07] hover:text-[#0b1424] focus-visible:bg-white/60 ${sectionLinks.some(link => activeHref === link.href) ? 'bg-[#0071e3]/[0.10] text-[#0068d7]' : 'text-slate-600'}`}
              aria-expanded={sectionsOpen}
              aria-haspopup="true"
            >
              Yana
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${sectionsOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className={`absolute right-0 top-[calc(100%+8px)] w-52 origin-top-right rounded-2xl border border-white/70 bg-white/80 p-1.5 shadow-xl shadow-slate-900/10 backdrop-blur-xl transition-all duration-200 ${sectionsOpen ? 'visible translate-y-0 scale-100 opacity-100' : 'invisible -translate-y-1 scale-[.98] opacity-0'}`}>
              {sectionLinks.map(link => (
                <button key={link.href} type="button" onClick={() => handleNavClick(link.href)} className={`flex min-h-10 w-full items-center rounded-xl px-3 py-2 text-left text-[13px] font-medium transition-colors duration-200 hover:bg-[#0071e3]/[0.07] hover:text-[#0071e3] ${activeHref === link.href ? 'bg-[#0071e3]/[0.10] text-[#0068d7]' : 'text-slate-600'}`} aria-current={activeHref === link.href ? 'page' : undefined}>
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div ref={menuRef} className="relative lg:hidden">
          <button type="button" onClick={() => setMenuOpen(value => !value)} className="glass-button flex h-11 w-11 items-center justify-center rounded-full text-slate-800" aria-label={menuOpen ? 'Menyuni yopish' : 'Menyuni ochish'} aria-expanded={menuOpen} aria-controls="mobile-navigation">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div id="mobile-navigation" className={`glass-nav absolute right-0 top-[52px] w-[min(90vw,360px)] overflow-hidden rounded-[24px] transition-all duration-300 ${menuOpen ? 'visible translate-y-0 scale-100 opacity-100' : 'invisible -translate-y-2 scale-[.98] opacity-0'}`}>
            <div className="p-2.5">
              {menuLinks.map(link => (
                <button key={link.href} type="button" onClick={() => handleNavClick(link.href)} className={`flex min-h-11 w-full items-center rounded-2xl px-4 py-3 text-left text-[15px] font-medium transition-colors duration-200 hover:bg-[#0071e3]/[0.07] hover:text-[#0071e3] ${activeHref === link.href ? 'bg-[#0071e3]/[0.10] text-[#0068d7]' : 'text-slate-700'}`} aria-current={activeHref === link.href ? 'page' : undefined}>
                  {link.label}
                </button>
              ))}

              <div className="my-1.5 border-t border-slate-200/60 pt-1.5">
                <button type="button" onClick={() => setSectionsOpen(value => !value)} className="flex min-h-11 w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-[15px] font-semibold text-slate-800 transition-colors duration-200 hover:bg-[#0071e3]/[0.07]" aria-expanded={sectionsOpen}>
                  <span>Yana</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${sectionsOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`grid transition-[grid-template-rows,opacity] duration-250 ${sectionsOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="min-h-0 overflow-hidden px-2 pb-1">
                    {sectionLinks.map(link => (
                      <button key={link.href} type="button" onClick={() => handleNavClick(link.href)} className={`flex min-h-10 w-full items-center rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors duration-200 hover:bg-[#0071e3]/[0.07] hover:text-[#0071e3] ${activeHref === link.href ? 'bg-[#0071e3]/[0.10] text-[#0068d7]' : 'text-slate-600'}`} aria-current={activeHref === link.href ? 'page' : undefined}>
                        {link.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
