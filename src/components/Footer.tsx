import { GraduationCap, Send, Youtube, Instagram, Facebook } from 'lucide-react';
import { schoolInfo } from '@/lib/data';

const primaryLinks = [
  { label: 'Bosh sahifa', href: '#hero' },
  { label: 'Maktab haqida', href: '#about' },
  { label: 'Akademik', href: '#academic' },
  { label: 'Maktab hayoti', href: '#school-life' },
  { label: 'Ma’muriyat', href: '#administration' },
  { label: 'Aloqa', href: '#contact' },
];

const secondaryLinks = [
  { label: 'Prezident Devoni', href: '#president' },
  { label: 'Innovatsiya', href: '#innovation' },
  { label: 'Media', href: '#media' },
];

export default function Footer() {
  const handleNavClick = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#1d1d1f] px-5 py-16 sm:px-8 md:px-12 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0071e3]">
                <GraduationCap className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-base font-bold text-white">1-IMI Jizzax</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              {schoolInfo.name}. 2022-yildan beri sifatli ta'lim berib kelyapmiz.
            </p>
            <div className="mt-5 flex gap-3">
              <a href={schoolInfo.social.telegram} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition-colors hover:bg-white/20"><Send className="h-4 w-4 text-white" /></a>
              <a href={schoolInfo.social.youtube} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition-colors hover:bg-white/20"><Youtube className="h-4 w-4 text-white" /></a>
              <a href={schoolInfo.social.instagram} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition-colors hover:bg-white/20"><Instagram className="h-4 w-4 text-white" /></a>
              <a href={schoolInfo.social.facebook} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition-colors hover:bg-white/20"><Facebook className="h-4 w-4 text-white" /></a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-white/80">Asosiy</h4>
              <div className="mt-4 space-y-2">
                {primaryLinks.map(link => (
                  <button key={link.href} type="button" onClick={() => handleNavClick(link.href)} className="block text-left text-sm text-white/60 transition-colors hover:text-white">{link.label}</button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-white/80">Yana</h4>
              <div className="mt-4 space-y-2">
                {secondaryLinks.map(link => (
                  <button key={link.href} type="button" onClick={() => handleNavClick(link.href)} className="block text-left text-sm text-white/60 transition-colors hover:text-white">{link.label}</button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/80">Aloqa</h4>
            <div className="mt-4 space-y-2 text-sm text-white/60">
              <p>{schoolInfo.address}</p>
              <p>{schoolInfo.phone}</p>
              <p>{schoolInfo.email}</p>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center">
          <p className="text-xs text-white/40">© {new Date().getFullYear()} {schoolInfo.name}. Barcha huquqlar himoyalangan.</p>
        </div>
      </div>
    </footer>
  );
}
