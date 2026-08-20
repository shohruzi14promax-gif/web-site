import { Facebook, GraduationCap, Instagram, Send, Youtube } from 'lucide-react';
import { schoolInfo } from '@/lib/data';

const groups = [
  { title: 'Maktab', links: ['#about', '#administration', '#academic', '#contact'], labels: ['About', 'Leadership', 'Academics', 'Contact'] },
  { title: 'Student Life', links: ['#school-life', '#videolessons', '#gallery', '#innovation'], labels: ['Dormitory & Meals', 'Videos', 'Gallery', 'Projects'] },
];

export default function Footer() {
  const handleNavClick = (href: string) => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  const socials = [
    { href: schoolInfo.social.telegram, icon: Send, label: 'Telegram' },
    { href: schoolInfo.social.youtube, icon: Youtube, label: 'YouTube' },
    { href: schoolInfo.social.instagram, icon: Instagram, label: 'Instagram' },
    { href: schoolInfo.social.facebook, icon: Facebook, label: 'Facebook' },
  ].filter(item => item.href);

  return (
    <footer className="bg-[#08182d] text-white">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 md:px-10 lg:px-12 lg:py-18">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600"><GraduationCap className="h-5 w-5" /></span>
              <div><p className="text-sm font-black tracking-wide">1-IMI JIZZAX</p><p className="text-xs text-slate-400">Learn. Create. Lead.</p></div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-300">{schoolInfo.name}. Raqamli xizmatlar, akademik rivojlanish va o‘quvchi tashabbuslari birlashadigan yagona ekotizim.</p>
            <div className="mt-6 flex gap-2">
              {socials.map(({ href, icon: Icon, label }) => <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-blue-400/40 hover:bg-blue-500/15 hover:text-white"><Icon className="h-4 w-4" /></a>)}
            </div>
          </div>

          {groups.map(group => (
            <div key={group.title}>
              <h3 className="text-xs font-bold uppercase tracking-[.16em] text-blue-300">{group.title}</h3>
              <div className="mt-5 space-y-3">
                {group.links.map((href, index) => <button key={href} type="button" onClick={() => handleNavClick(href)} className="block text-sm text-slate-300 transition hover:text-white">{group.labels[index]}</button>)}
              </div>
            </div>
          ))}

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[.16em] text-amber-300">SchoolCoin</h3>
            <div className="mt-5 space-y-3">
              {['About', 'How it works', 'Marketplace', 'Leaderboard'].map(label => <button key={label} type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-schoolcoin'))} className="block text-sm text-slate-300 transition hover:text-white">{label}</button>)}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {schoolInfo.name}. Barcha huquqlar himoyalangan.</p>
          <p>{schoolInfo.address} · {schoolInfo.phone}</p>
        </div>
      </div>
    </footer>
  );
}
