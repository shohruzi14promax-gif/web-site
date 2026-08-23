import { ArrowRight, ChevronDown, Coins, GraduationCap } from 'lucide-react';
import { stats } from '@/lib/data';
import { useScrollAnimation, useCountUp } from '@/hooks/useScrollAnimation';
import { useI18n } from '../i18n';

function StatCard({ stat, label, visible }: { stat: (typeof stats)[number]; label: string; visible: boolean }) {
  const count = useCountUp(stat.value, 1500, visible);
  return (
    <div className="group border-l border-slate-200 px-4 py-4 text-center first:border-l-0 sm:px-5">
      <div className="text-2xl font-black tracking-tight text-slate-950 transition-transform duration-300 group-hover:-translate-y-0.5 sm:text-3xl">
        {count.toLocaleString()}<span className="text-blue-600">{stat.suffix}</span>
      </div>
      <div className="mx-auto mt-1 max-w-[150px] text-xs font-semibold leading-5 text-slate-500 sm:text-sm">{label}</div>
    </div>
  );
}

export default function Hero() {
  const { t } = useI18n();
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();
  const scrollTo = (id: string) => document.querySelector(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const statLabels = ['students', 'teachers', 'subjects', 'achievements', 'graduates', 'admissionRate'];

  return (
    <section id="hero" className="relative isolate overflow-hidden bg-slate-950 pt-28 text-white sm:pt-32">
      <div className="absolute inset-0" aria-hidden="true">
        <img
          src="/images/maktab-bg.JPG"
          alt=""
          className="hero-school-photo h-full w-full object-cover opacity-[.58] motion-safe:animate-[hero-kenburns_18s_ease-in-out_infinite_alternate]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,14,30,.97)_0%,rgba(5,22,43,.88)_42%,rgba(7,31,58,.58)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,10,24,.58)_0%,rgba(4,18,36,.18)_46%,#071a32_100%)]" />
        <div className="absolute -right-32 top-16 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div ref={ref} className="relative mx-auto grid min-h-[680px] max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 md:grid-cols-[1.15fr_.85fr] md:px-10 lg:px-12 lg:py-28">
        <div className={`max-w-3xl transition-all duration-700 motion-reduce:transition-none ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.16em] text-blue-100 shadow-lg shadow-black/10 backdrop-blur-xl">
            <GraduationCap className="h-4 w-4" />1-IMI Jizzax
          </div>
          <h1 className="mt-7 text-5xl font-black leading-[.98] tracking-[-.045em] drop-shadow-[0_12px_35px_rgba(0,0,0,.25)] sm:text-7xl lg:text-[5.4rem]">
            {t('learn')}.<br />{t('create')}.<br /><span className="text-blue-400">{t('lead')}.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-slate-200/95 sm:text-lg lg:text-xl">{t('heroDescription')}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => scrollTo('#about')} className="school-button bg-blue-600 text-white shadow-xl shadow-blue-950/30 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-500">
              {t('schoolAbout')}<ArrowRight className="ml-2 h-4 w-4" />
            </button>
            <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-schoolcoin'))} className="school-button border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white/15">
              <Coins className="mr-2 h-4 w-4 text-amber-300" />{t('schoolCoin')}
            </button>
          </div>
        </div>

        <div className="hidden md:block">
          <div className="ml-auto max-w-md rounded-[30px] border border-white/20 bg-white/10 p-2 shadow-[0_30px_90px_rgba(0,0,0,.28)] backdrop-blur-2xl transition duration-500 hover:-translate-y-1 hover:bg-white/[.13]">
            <div className="rounded-[24px] border border-white/10 bg-slate-950/45 p-7">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div><p className="text-xs font-bold uppercase tracking-[.16em] text-blue-200">{t('digitalSchool')}</p><p className="mt-1 text-lg font-bold">{t('schoolCoin')}</p></div>
                <Coins className="h-5 w-5 text-amber-300" />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-5">
                {[t('academic'), t('innovation'), t('life'), t('schoolCoin')].map(item => <div key={item} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:-translate-y-0.5 hover:bg-white/10">{item}</div>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-5 pb-8 sm:px-8 md:px-10 lg:px-12">
        <div className="grid grid-cols-2 overflow-hidden rounded-[20px] border border-white/15 bg-white/95 p-2 text-slate-950 shadow-2xl backdrop-blur-xl sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat, index) => <StatCard key={stat.label} stat={stat} label={t(statLabels[index])} visible={isVisible} />)}
        </div>
      </div>

      <button type="button" onClick={() => scrollTo('#about')} className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-slate-300 transition hover:text-white sm:flex" aria-label={t('explore')}>
        {t('explore')}<ChevronDown className="h-4 w-4 animate-bounce" />
      </button>
    </section>
  );
}
