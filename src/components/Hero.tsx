import { ArrowRight, Coins, GraduationCap, ChevronDown } from 'lucide-react';
import { schoolInfo, stats } from '@/lib/data';
import { useScrollAnimation, useCountUp } from '@/hooks/useScrollAnimation';

function StatCard({ stat, index, visible }: { stat: (typeof stats)[number]; index: number; visible: boolean }) {
  const count = useCountUp(stat.value, 1500, visible);
  return (
    <div className="border-l border-slate-200 first:border-l-0 px-4 py-3 text-center sm:px-5">
      <div className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
        {count.toLocaleString()}<span className="text-blue-600">{stat.suffix}</span>
      </div>
      <div className="mt-1 text-xs font-semibold leading-5 text-slate-500 sm:text-sm">{stat.label}</div>
      <span className={`mx-auto mt-3 block h-1 w-8 rounded-full bg-blue-600 transition-all duration-700 ${visible ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}`} style={{ transitionDelay: `${index * 90}ms` }} />
    </div>
  );
}

export default function Hero() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();
  const scrollTo = (id: string) => document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="hero" className="relative overflow-hidden bg-slate-950 pt-28 text-white sm:pt-32">
      <div className="absolute inset-0">
        <img src="/images/maktab-bg.JPG" alt="1-IMI Jizzax kampusi" className="h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,20,40,.98)_0%,rgba(7,31,58,.9)_46%,rgba(7,31,58,.52)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_65%,#0b1f3a_100%)]" />
      </div>

      <div ref={ref} className="relative mx-auto grid min-h-[680px] max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 md:grid-cols-[1.15fr_.85fr] md:px-10 lg:px-12 lg:py-28">
        <div className={`max-w-3xl transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.16em] text-blue-200 backdrop-blur-sm">
            <GraduationCap className="h-4 w-4" /> 1-IMI Jizzax
          </div>
          <h1 className="mt-7 text-5xl font-black leading-[.98] tracking-[-.045em] sm:text-7xl lg:text-[5.4rem]">
            Learn.<br />Create.<br /><span className="text-blue-400">Lead.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg lg:text-xl">
            {schoolInfo.name}. Akademik mukammallik, innovatsion tafakkur va yetakchilikni birlashtiradigan zamonaviy ta’lim muhiti.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => scrollTo('#about')} className="school-button bg-blue-600 text-white shadow-lg shadow-blue-950/30 hover:bg-blue-500">
              Maktab haqida <ArrowRight className="ml-2 h-4 w-4" />
            </button>
            <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-schoolcoin'))} className="school-button border border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/15">
              <Coins className="mr-2 h-4 w-4 text-amber-300" /> SchoolCoin
            </button>
          </div>
        </div>

        <div className={`hidden md:block transition-all delay-150 duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="ml-auto max-w-md rounded-[24px] border border-white/15 bg-white/10 p-2 shadow-2xl backdrop-blur-md">
            <div className="overflow-hidden rounded-[18px] border border-white/10 bg-slate-950/35 p-7">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div><p className="text-xs font-bold uppercase tracking-[.16em] text-blue-200">Digital School</p><p className="mt-1 text-lg font-bold">Bitta ekotizim</p></div>
                <div className="rounded-xl bg-amber-400/15 p-3 text-amber-300"><Coins className="h-5 w-5" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-5">
                {['Academics', 'Projects', 'Student Life', 'SchoolCoin'].map((item) => <div key={item} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200">{item}</div>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-5 pb-8 sm:px-8 md:px-10 lg:px-12">
        <div className="grid grid-cols-2 overflow-hidden rounded-[20px] border border-slate-200/15 bg-white p-2 text-slate-950 shadow-2xl sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat, index) => <StatCard key={`${stat.label}-${index}`} stat={stat} index={index} visible={isVisible} />)}
        </div>
      </div>

      <button type="button" onClick={() => scrollTo('#about')} className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-slate-300 sm:flex" aria-label="Pastga o'tish">
        Explore <ChevronDown className="h-4 w-4" />
      </button>
    </section>
  );
}
