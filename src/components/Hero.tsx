import { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, ChevronDown } from 'lucide-react';
import { schoolInfo, stats } from '@/lib/data';
import { useScrollAnimation, useCountUp } from '@/hooks/useScrollAnimation';

function StatCard({
  stat,
  index,
  visible,
}: {
  stat: (typeof stats)[number];
  index: number;
  visible: boolean;
}) {
  const count = useCountUp(stat.value, 2000, visible);

  return (
    <div
      className={`group relative flex flex-col items-center text-center rounded-2xl px-3 py-4 transition-all duration-700 ease-out
        hover:-translate-y-2 hover:bg-white/50
        ${
          visible
            ? 'translate-y-0 opacity-100'
            : 'translate-y-8 opacity-0'
        }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="absolute inset-0 -z-10 rounded-2xl bg-white/0 transition-all duration-500 group-hover:bg-white/40 group-hover:shadow-lg" />

      <div className="text-4xl font-black tracking-tight text-slate-900 transition-transform duration-500 group-hover:scale-110 sm:text-5xl md:text-6xl">
        {count.toLocaleString()}
        <span className="text-[#0071e3]">{stat.suffix}</span>
      </div>

      <div className="mt-2 text-sm font-medium text-slate-500 transition-colors duration-300 group-hover:text-[#0071e3] sm:text-base">
        {stat.label}
      </div>
    </div>
  );
}

export default function Hero() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setStatsVisible(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const scrollToAbout = () => {
    document.querySelector('#about')?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  const scrollToAcademic = () => {
    document.querySelector('#academic')?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28"
    >
      {/* =====================================================
          BACKGROUND IMAGE
      ===================================================== */}

      <div className="absolute inset-0 -z-20">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/maktab-bg.JPG')",
          }}
        />

        {/* Main overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/75 via-white/55 to-slate-50/90" />

        {/* Blue glass tint */}
        <div className="absolute inset-0 bg-blue-100/10 backdrop-blur-[1px]" />
      </div>

      {/* =====================================================
          ANIMATED GLOW
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">

        {/* Blue */}
        <div
          className="
            absolute
            -left-32
            -top-32
            h-[500px]
            w-[500px]
            rounded-full
            bg-blue-400/20
            blur-[100px]
            animate-liquid
          "
        />

        {/* Purple */}
        <div
          className="
            absolute
            right-[-150px]
            top-[20%]
            h-[450px]
            w-[450px]
            rounded-full
            bg-purple-400/15
            blur-[110px]
            animate-liquid
          "
          style={{ animationDelay: '2s' }}
        />

        {/* Cyan */}
        <div
          className="
            absolute
            bottom-[-200px]
            left-[25%]
            h-[500px]
            w-[500px]
            rounded-full
            bg-cyan-400/15
            blur-[120px]
            animate-liquid
          "
          style={{ animationDelay: '5s' }}
        />
      </div>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div
        ref={ref}
        className="relative mx-auto flex min-h-[calc(100vh-140px)] max-w-7xl items-center px-5 sm:px-8 md:px-12 lg:px-16"
      >
        <div className="w-full">

          {/* HERO TEXT */}

          <div
            className={`mx-auto max-w-5xl text-center transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]
              ${
                isVisible
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-12 opacity-0'
              }`}
          >

            {/* Badge */}

            <div
              className={`mb-7 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/65 px-5 py-2 text-sm font-semibold text-[#0071e3] shadow-lg shadow-blue-900/5 backdrop-blur-2xl transition-all duration-700 hover:scale-105 hover:bg-white/85
                ${
                  isVisible
                    ? 'scale-100 opacity-100'
                    : 'scale-90 opacity-0'
                }`}
              style={{ transitionDelay: '150ms' }}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0071e3] opacity-50" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#0071e3]" />
              </span>

              <Sparkles className="h-4 w-4 animate-pulse" />

              2022-yildan beri sifatli ta'lim
            </div>

            {/* TITLE */}

            <h1
              className={`text-5xl font-black leading-[0.98] tracking-[-0.045em] text-slate-900 drop-shadow-sm transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] sm:text-7xl md:text-8xl
                ${
                  isVisible
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-10 opacity-0'
                }`}
              style={{ transitionDelay: '250ms' }}
            >
              Bilim, innovatsiya
              <br />

              <span className="text-slate-900">va </span>

              <span className="text-gradient-blue">
                vatanga muhabbat
              </span>
            </h1>

            {/* DESCRIPTION */}

            <p
              className={`mx-auto mt-7 max-w-2xl text-base font-medium leading-relaxed text-slate-600 transition-all duration-1000 sm:text-lg md:text-xl
                ${
                  isVisible
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-8 opacity-0'
                }`}
              style={{ transitionDelay: '400ms' }}
            >
              {schoolInfo.name}. Iqtidorli o'quvchilar uchun
              chuqurlashtirilgan ta'lim, zamonaviy laboratoriyalar
              va yetakchilik mahoratini rivojlantiruvchi
              innovatsion muhit.
            </p>

            {/* BUTTONS */}

            <div
              className={`mt-10 flex flex-col items-center justify-center gap-4 transition-all duration-1000 sm:flex-row
                ${
                  isVisible
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-8 opacity-0'
                }`}
              style={{ transitionDelay: '550ms' }}
            >
              <button
                onClick={scrollToAbout}
                className="group apple-button min-w-[230px] shadow-[0_15px_35px_rgba(0,113,227,0.30)]"
              >
                Maktab haqida batafsil

                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
              </button>

              <button
                onClick={scrollToAcademic}
                className="
                  group
                  min-w-[190px]
                  rounded-full
                  border
                  border-white/80
                  bg-white/65
                  px-7
                  py-3.5
                  text-base
                  font-semibold
                  text-slate-800
                  shadow-lg
                  shadow-slate-900/5
                  backdrop-blur-2xl
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:bg-white/90
                  hover:shadow-xl
                  active:scale-95
                "
              >
                Akademik portal
              </button>
            </div>
          </div>

          {/* =================================================
              STATS
          ================================================= */}

          <div
            className={`relative mt-20 overflow-hidden rounded-[32px] border border-white/80 bg-white/55 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl transition-all duration-1000 sm:p-8 md:p-10
              ${
                statsVisible
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-12 opacity-0'
              }`}
          >
            {/* Glass shine */}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-blue-100/10" />

            {/* Top light */}

            <div className="pointer-events-none absolute left-[10%] right-[10%] top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

            <div className="relative grid grid-cols-2 gap-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-6">
              {stats.map((stat, index) => (
                <StatCard
                  key={index}
                  stat={stat}
                  index={index}
                  visible={statsVisible}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          SCROLL INDICATOR
      ===================================================== */}

      <button
        onClick={scrollToAbout}
        className="
          absolute
          bottom-7
          left-1/2
          hidden
          -translate-x-1/2
          flex-col
          items-center
          gap-1
          text-slate-400
          transition-all
          duration-300
          hover:text-[#0071e3]
          sm:flex
        "
        aria-label="Pastga o'tish"
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">
          Explore
        </span>

        <ChevronDown className="h-5 w-5 animate-bounce" />
      </button>

      {/* Bottom fade */}

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50/70 to-transparent" />
    </section>
  );
}