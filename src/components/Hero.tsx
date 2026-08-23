import { ArrowRight, ChevronDown, Coins, GraduationCap } from 'lucide-react';
import { stats } from '@/lib/data';
import { useScrollAnimation, useCountUp } from '@/hooks/useScrollAnimation';
import { useI18n } from '../i18n';

function StatCard({ stat, label, visible }: { stat: (typeof stats)[number]; label: string; visible: boolean }) {
  const count = useCountUp(stat.value, 1200, visible);
  return <div className="group border-l border-white/15 px-4 py-4 text-center first:border-l-0 sm:px-5"><div className="text-2xl font-black tracking-tight text-white transition-transform duration-300 group-hover:-translate-y-0.5 sm:text-3xl">{count.toLocaleString()}<span className="text-blue-300">{stat.suffix}</span></div><div className="mx-auto mt-1 max-w-[150px] text-xs font-semibold leading-5 text-white/75 sm:text-sm">{label}</div></div>;
}

export default function Hero() {
  const { t } = useI18n();
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();
  const scrollTo = (id: string) => document.querySelector(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const reveal = isVisible ? 'is-visible' : '';
  const statLabels = ['students', 'teachers', 'subjects', 'achievements', 'graduates', 'admissionRate'];

  return <section id="hero" className="relative isolate min-h-[720px] overflow-hidden bg-[#07111f] text-white sm:min-h-[790px] lg:min-h-[820px]">
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true"><img src="/images/maktab-bg.JPG" alt="" className="absolute inset-0 h-full w-full object-cover object-[62%_center] motion-safe:animate-[hero-kenburns_22s_ease-in-out_infinite_alternate]" /><div className="absolute inset-0 bg-gradient-to-r from-[#06101e]/95 via-[#071525]/58 to-[#071525]/12" /><div className="absolute inset-0 bg-gradient-to-t from-[#06101e]/92 via-transparent to-[#06101e]/25" /><div className="absolute inset-0 bg-blue-900/[.06] mix-blend-soft-light" /></div>
    <div ref={ref} className="relative z-10 mx-auto flex min-h-[720px] max-w-7xl items-center px-5 pb-28 pt-28 sm:min-h-[790px] sm:px-8 sm:pt-32 md:px-10 lg:min-h-[820px] lg:px-12"><div className="max-w-3xl"><div className={`hero-reveal hero-reveal-1 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-white/90 backdrop-blur-md sm:text-xs ${reveal}`}><GraduationCap className="h-4 w-4" />1-IMI Jizzax</div><h1 className={`hero-reveal hero-reveal-2 mt-6 max-w-3xl text-[3rem] font-black leading-[.94] tracking-[-.055em] text-white drop-shadow-[0_10px_35px_rgba(0,0,0,.4)] sm:mt-7 sm:text-7xl lg:text-[5.8rem] ${reveal}`}>{t('learn')}.<br />{t('create')}.<br /><span className="text-blue-200">{t('lead')}.</span></h1><p className={`hero-reveal hero-reveal-3 mt-6 max-w-xl text-sm leading-6 text-white/85 sm:mt-7 sm:text-lg sm:leading-7 ${reveal}`}>{t('heroDescription')}</p><div className={`hero-reveal hero-reveal-4 mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row ${reveal}`}><button type="button" onClick={() => scrollTo('#about')} className="school-button bg-white text-[#07111f] shadow-xl shadow-black/20 hover:bg-white/90">{t('schoolAbout')}<ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" /></button><button type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-schoolcoin'))} className="school-button border border-white/25 bg-white/10 text-white backdrop-blur-md hover:bg-white/15"><Coins className="mr-2 h-4 w-4 text-amber-200" />{t('schoolCoin')}</button></div></div></div>
    <div className="absolute bottom-5 left-0 right-0 z-10 mx-auto max-w-7xl px-5 sm:px-8 md:px-10 lg:px-12"><div className="hero-stats grid grid-cols-2 overflow-hidden rounded-[22px] border border-white/15 bg-black/20 p-2 backdrop-blur-xl sm:grid-cols-3 lg:grid-cols-6">{stats.map((stat, index) => <StatCard key={stat.label} stat={stat} label={t(statLabels[index])} visible={isVisible} />)}</div></div>
    <button type="button" onClick={() => scrollTo('#about')} className="absolute bottom-1 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-white/70 transition hover:text-white sm:flex" aria-label={t('explore')}>{t('explore')}<ChevronDown className="h-4 w-4 animate-bounce" /></button>
  </section>;
}
