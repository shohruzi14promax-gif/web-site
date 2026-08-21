import { useEffect, useRef, useState } from 'react';
import { ChevronDown, GraduationCap, Menu, Moon, Sun, X } from 'lucide-react';
import { useI18n, type Locale } from '../i18n';

type SectionKey = 'home' | 'about' | 'academic' | 'life' | 'administration' | 'media' | 'contact' | 'president' | 'innovation' | 'gallery';
type NavLink = { href: string; key: SectionKey };

const links: NavLink[] = [
  { href: '#hero', key: 'home' },
  { href: '#about', key: 'about' },
  { href: '#academic', key: 'academic' },
  { href: '#school-life', key: 'life' },
  { href: '#administration', key: 'administration' },
  { href: '#media', key: 'media' },
];

const extraLinks: NavLink[] = [
  { href: '#president', key: 'president' },
  { href: '#innovation', key: 'innovation' },
  { href: '#gallery', key: 'gallery' },
  { href: '#contact', key: 'contact' },
];

const sectionIds = [...links, ...extraLinks].map(link => link.href.slice(1));
const sectionKeyById: Record<string, SectionKey> = {
  hero: 'home', about: 'about', academic: 'academic', 'school-life': 'life',
  administration: 'administration', media: 'media', president: 'president',
  innovation: 'innovation', gallery: 'gallery', contact: 'contact',
};

export default function Navbar() {
  const { locale, setLocale, t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionKey>('home');
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('site_theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMenuOpen(false); setMoreOpen(false); }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMoreOpen(false);
    };
    const sections = sectionIds.map(id => document.getElementById(id)).filter((element): element is HTMLElement => Boolean(element));
    const observer = sections.length ? new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      const nextKey = visible?.target.id ? sectionKeyById[visible.target.id] : undefined;
      if (nextKey) setActiveSection(nextKey);
    }, { rootMargin: '-24% 0px -62% 0px', threshold: [0.05, 0.2, 0.5] }) : null;

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    sections.forEach(section => observer?.observe(section));
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
      observer?.disconnect();
    };
  }, [dark]);

  const navigate = (href: string) => {
    const nextKey = sectionKeyById[href.slice(1)];
    if (nextKey) setActiveSection(nextKey);
    setMenuOpen(false); setMoreOpen(false);
    const element = document.querySelector(href);
    if (!element) return;
    window.scrollTo({ top: Math.max(0, element.getBoundingClientRect().top + window.scrollY - 86), behavior: 'smooth' });
  };

  const changeTheme = () => setDark(value => {
    const next = !value;
    localStorage.setItem('site_theme', next ? 'dark' : 'light');
    return next;
  });

  const openSchoolCoin = () => { setMenuOpen(false); setMoreOpen(false); window.dispatchEvent(new CustomEvent('open-schoolcoin')); };
  const openAdmin = () => { setMenuOpen(false); setMoreOpen(false); window.dispatchEvent(new CustomEvent('open-admin')); };

  const navButton = (link: NavLink) => {
    const active = activeSection === link.key;
    return (
      <button key={link.href} type="button" onClick={() => navigate(link.href)} aria-current={active ? 'page' : undefined}
        className={`ios-nav-link ${active ? 'is-active' : ''}`}>
        {active && <span className="ios-nav-active-pill" aria-hidden="true" />}
        <span className="relative z-10">{t(link.key)}</span>
      </button>
    );
  };

  const localeButtons = (
    <div className="ios-locale-switch" aria-label={t('language')}>
      {(['uz', 'ru', 'en'] as Locale[]).map(item => (
        <button key={item} type="button" onClick={() => setLocale(item)} aria-pressed={locale === item}
          className={locale === item ? 'is-active' : ''}>{item}</button>
      ))}
    </div>
  );

  const themeToggle = (compact = false) => (
    <button type="button" onClick={changeTheme} className={`ios-theme-toggle ${compact ? 'is-compact' : ''}`} aria-label={t('theme')} title={dark ? t('light') : t('dark')} aria-pressed={dark}>
      <span className="ios-theme-track" aria-hidden="true">
        <span className="ios-theme-icon ios-theme-icon-light"><Sun /></span>
        <span className="ios-theme-icon ios-theme-icon-dark"><Moon /></span>
        <span className="ios-theme-thumb"><span>{dark ? <Moon /> : <Sun />}</span></span>
      </span>
      {!compact && <span className="sr-only">{dark ? t('light') : t('dark')}</span>}
    </button>
  );

  return (
    <header className="ios-navbar-wrap">
      <nav ref={menuRef} className={`ios-navbar ${scrolled ? 'is-scrolled' : ''}`}>
        <button type="button" onClick={() => navigate('#hero')} className="ios-brand" aria-label={t('home')}>
          <span className="ios-brand-mark"><GraduationCap /></span>
          <span className="ios-brand-name">1-IMI Jizzax</span>
        </button>

        <div className="ios-desktop-nav">
          {links.map(navButton)}
          <div className="ios-more-wrap">
            <button type="button" onClick={() => setMoreOpen(value => !value)} aria-expanded={moreOpen} className={`ios-nav-link ${moreOpen ? 'is-open' : ''}`}>
              <span>{t('more')}</span><ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${moreOpen ? 'rotate-180' : ''}`} />
            </button>
            {moreOpen && (
              <div className="ios-popover ios-more-menu">
                <p>{t('digital')}</p>
                {extraLinks.map(link => <button key={link.href} type="button" onClick={() => navigate(link.href)}>{t(link.key)}</button>)}
                <div className="ios-menu-divider" />
                <button type="button" onClick={openAdmin} className="ios-menu-strong">⚙️ {t('admin')}</button>
              </div>
            )}
          </div>
        </div>

        <div className="ios-actions">
          {localeButtons}
          {themeToggle()}
          <button type="button" onClick={openSchoolCoin} className="ios-coin-button"><span>🪙</span>{t('schoolCoin')}</button>
        </div>

        <div className="ios-mobile-actions">
          {themeToggle(true)}
          <button type="button" onClick={() => setMenuOpen(value => !value)} className="ios-menu-button" aria-label={menuOpen ? t('closeMenu') : t('openMenu')} aria-expanded={menuOpen}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {menuOpen && (
          <div className="ios-mobile-menu">
            <div className="ios-mobile-links">
              {links.map((link, index) => <button key={link.href} type="button" onClick={() => navigate(link.href)} aria-current={activeSection === link.key ? 'page' : undefined} className={activeSection === link.key ? 'is-active' : ''}><span>{String(index + 1).padStart(2, '0')}</span>{t(link.key)}</button>)}
              <div className="ios-menu-divider" />
              {extraLinks.map(link => <button key={link.href} type="button" onClick={() => navigate(link.href)}>{t(link.key)}</button>)}
            </div>
            <div className="ios-mobile-controls">{localeButtons}{themeToggle(true)}</div>
            <button type="button" onClick={openSchoolCoin} className="ios-mobile-coin">🪙 {t('schoolCoin')}</button>
            <button type="button" onClick={openAdmin} className="ios-mobile-admin">⚙️ {t('admin')}</button>
          </div>
        )}
      </nav>
    </header>
  );
}
