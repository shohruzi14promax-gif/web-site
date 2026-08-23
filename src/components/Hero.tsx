import { useEffect, useState } from 'react';
import { ArrowRight, ChevronDown, Sparkles } from 'lucide-react';
import { schoolInfo, stats } from '@/lib/data';
import { useScrollAnimation, useCountUp } from '@/hooks/useScrollAnimation';

function StatCard({ stat, index, visible }: { stat: (typeof stats)[number]; index: number; visible: boolean }) {
  const count = useCountUp(stat.value, 1500, visible);
  return (
    <div className={`rounded-2xl px-3 py-3 text-center transition-[opacity,transform] duration-600 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ transitionDelay: `${index * 80}ms` }}>
      <div className="text-3xl font-bold tracking-tight text-[#0b1424] sm:text-4xl">{count.toLocaleString()}<span className="text-[#0071e3]">{stat.suffix}</span></div>
      <div className="mt-1.5 text-xs font-medium text-slate-500 sm:text-sm">{stat.label}</div>
    </div>
  );
}

export default function Hero() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;
    const timer = window.setTimeout(() => setStatsVisible(true), 500);
    return () => window.clearTimeout(timer);
  }, [isVisible]);

  const scrollTo = (id: string) => document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="hero" className="relative isolate min-h-[760px] overflow-hidden pt-28 pb-16 sm:min-h-[820px] sm:pt-32 sm:pb-20">
      <div className="absolute inset-0 -z-20" aria-hidden="true">
        <div className="absolute inset-0 bg-cover bg-[center_38%] bg-no-repeat motion-safe:animate-[imageReveal_1.2s_ease-out_both]" style={{ backgroundImage: "url('/images/maktab-bg.JPG')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-white/82 via-white/48 to-white/16" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-[#f8fafc]/95" />
      </div>

      <div ref={ref} className="relative mx-auto flex min-h-[650px] max-w-7xl items-center px-5 sm:px-8 md:px-12 lg:px-16">
        <div className="w-full max-w-3xl text-left">
          <div className={`mb-6 inline-flex items-center gap-2 rounded-full border border-slate-900/8 bg-white/78 px-4 py-2 text-xs font-semibold text-[#0b1424] shadow-sm backdrop-blur-md transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ transitionDelay: '80ms' }}>
            <span className="h-2 w-2 rounded-full bg-[#0071e3]" />
            <Sparkles className="h-3.5 w-3.5 text-[#0071e3]" />
            2022-yildan beri sifatli ta'lim
          </div>

          <h1 className={`max-w-4xl text-[clamp(3.1rem,7.2vw,6.7rem)] font-bold leading-[.94] tracking-[-.055em] text-[#0b1424] transition-all duration-800 ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: '160ms' }}>
            Bilim, innovatsiya
            <br />
            <span>va </span><span className="text-[#0071e3]">vatanga muhabbat</span>
          </h1>

          <p className={`mt-7 max-w-2xl text-base font-medium leading-7 text-slate-700 sm:text-lg md:text-xl transition-all duration-800 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`} style={{ transitionDelay: '300ms' }}>
            {schoolInfo.name}. Iqtidorli o'quvchilar uchun chuqurlashtirilgan ta'lim, zamonaviy laboratoriyalar va yetakchilik mahoratini rivojlantiruvchi innovatsion muhit.
          </p>

          <div className={`mt-9 flex flex-col gap-3 sm:flex-row transition-all duration-800 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`} style={{ transitionDelay: '440ms' }}>
            <button type="button" onClick={() => scrollTo('#about')} className="apple-button group min-h-12 px-6">
              Maktab haqida batafsil <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-250 group-hover:translate-x-1" />
            </button>
            <button type="button" onClick={() => scrollTo('#academic')} className="min-h-12 rounded-full border border-slate-900/10 bg-white/78 px-6 text-sm font-semibold text-[#0b1424] shadow-sm backdrop-blur-md transition-all duration-250 hover:-translate-y-0.5 hover:bg-white active:scale-[.98]">
              Akademik portal
            </button>
          </div>

          <div className={`mt-12 grid max-w-4xl grid-cols-2 gap-2 rounded-[26px] border border-white/80 bg-white/82 p-3 shadow-lg shadow-slate-900/8 backdrop-blur-md sm:grid-cols-3 lg:grid-cols-6 transition-all duration-900 ${statsVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            {stats.map((stat, index) => <StatCard key={`${stat.label}-${index}`} stat={stat} index={index} visible={statsVisible} />)}
          </div>
        </div>
      </div>

      <button type="button" onClick={() => scrollTo('#about')} className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-white/80 bg-white/65 px-4 py-2 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500 shadow-sm backdrop-blur-md transition-colors hover:text-[#0071e3] sm:flex" aria-label="Pastga o'tish">
        Explore <ChevronDown className="h-4 w-4" />
      </button>
    </section>
  );
}
