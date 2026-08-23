import { ArrowRight, ChevronDown, Coins, GraduationCap } from 'lucide-react';
import { stats } from '@/lib/data';
import { useScrollAnimation, useCountUp } from '@/hooks/useScrollAnimation';
import { useI18n } from '../i18n';

function StatCard({ stat, label, visible }: { stat: (typeof stats)[number]; label: string; visible: boolean }) {
  const count = useCountUp(stat.value, 1200, visible);
  return (
    <div className="group border-l border-white/10 px-4 py-4 text-center first:border-l-0 sm:px-5">
      <div className="text-2xl font-black tracking-tight text-white transition-transform duration-300 group-hover:-translate-y-0.5 sm:text-3xl">
        {count.toLocaleString()}<span className="text-blue-400">{stat.suffix}</span>
      </div>
      <div className="mx-auto mt-1 max-w-[150px] text-xs font-semibold leading-5 text-slate-300 sm:text-sm">{label}</div>
    </div>
  );
}

export default function Hero() {
  const { t } = useI18n();
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();
  const scrollTo = (id: string) => document.querySelector(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const reveal = isVisible ? 'is-visible' : '';

  const statLabels = ['students', 'teachers', 'subjects', 'achievements', 'graduates', 'admissionRate'];

  return (
    <section id="hero" className="relative isolate min-h-[760px] overflow-hidden bg-[#020817] pt-24 text-white sm:min-h-[820px] sm:pt-28 lg:min-h-[850px]">
      {/* Full-bleed school photography. Keep this layer independent from the content flow. */}
      <div className="absolute inset-0 z-0 h-full w-full overflow-hidden" aria-hidden="true">
        <img
          src="/images/maktab-bg.JPG"
          alt=""
          className="absolute inset-0 h-full w-full max-w-none object-cover object-center opacity-40 motion-safe:animate-[hero-kenburns_18s_ease-in-out_infinite_alternate]"
          style={{ height: '100%', width: '100%', objectFit: 'cover' }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,8,23,.96)_0%,rgba(3,13,31,.86)_42%,rgba(5,24,47,.62)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,8,23,.78)_0%,rgba(2,10,24,.26)_42%,rgba(2,8,23,.96)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#020817] to-transparent" />
        <div className="absolute -right-32 top-16 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div ref={ref} className="relative z-10 mx-auto flex min-h-[660px] max-w-7xl items-center px-5 py-20 sm:min-h-[700px] sm:px-8 md:grid md:min-h-[720px] md:grid-cols-[1.15fr_.85fr] md:gap-12 md:px-10 lg:min-h-[740px] lg:px-12 lg:py-24">
        <div className="max-w-3xl">
          <div className={`hero-reveal hero-reveal-1 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.07] px-4 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-blue-100 backdrop-blur-xl sm:text-xs ${reveal}`}>
            <GraduationCap className="h-4 w-4" />1-IMI Jizzax
          </div>
          <h1 className={`hero-reveal hero-reveal-2 mt-6 text-[2.9rem] font-black leading-[.94] tracking-[-.055em] drop-shadow-[0_12px_35px_rgba(0,0,0,.35)] sm:mt-7 sm:text-7xl lg:text-[5.4rem] ${reveal}`}>
            {t('learn')}.<br />{t('create')}.<br /><span className="text-blue-400">{t('lead')}.</span>
          </h1>
          <p className={`hero-reveal hero-reveal-3 mt-6 max-w-2xl text-sm leading-6 text-slate-200/90 sm:mt-7 sm:text-lg sm:leading-7 lg:text-xl ${reveal}`}>{t('heroDescription')}</p>
          <div className={`hero-reveal hero-reveal-4 mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row ${reveal}`}>
            <button type="button" onClick={() => scrollTo('#about')} className="school-button bg-blue-600 text-white shadow-xl shadow-blue-950/30 hover:bg-blue-500">
              {t('schoolAbout')}<ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </button>
            <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-schoolcoin'))} className="school-button border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-xl hover:bg-white/15">
              <Coins className="mr-2 h-4 w-4 text-amber-300" />{t('schoolCoin')}
            </button>
          </div>
        </div>

        <div className={`hero-reveal hero-reveal-5 hidden md:block ${reveal}`}>
          <div className="hero-product-card ml-auto max-w-md rounded-[30px] p-2">
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

      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-8 sm:px-8 md:px-10 lg:px-12">
        <div className="hero-stats grid grid-cols-2 overflow-hidden rounded-[20px] border border-white/10 bg-white/[.06] p-2 backdrop-blur-xl sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat, index) => <StatCard key={stat.label} stat={stat} label={t(statLabels[index])} visible={isVisible} />)}
        </div>
      </div>

      <button type="button" onClick={() => scrollTo('#about')} className="absolute bottom-4 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-slate-300 transition hover:text-white sm:flex" aria-label={t('explore')}>
        {t('explore')}<ChevronDown className="h-4 w-4 animate-bounce" />
      </button>
    </section>
  );
}
