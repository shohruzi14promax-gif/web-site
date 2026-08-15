import { Trophy, GraduationCap, Target, Award } from 'lucide-react';
import { stats } from '@/lib/data';

const resultIcons = [Trophy, GraduationCap, Target, Award, Trophy, GraduationCap];

export default function Results() {
  return (
    <section id="results" className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-16 md:px-12 lg:px-16">
      <div className="rounded-[32px] border border-slate-200/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-10 md:p-12">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#0071e3]">
            <Trophy className="h-4 w-4" aria-hidden="true" />
            Natijalar
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Natijalarimiz gapiradi.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Maktabimizning asosiy ko‘rsatkichlari va yutuqlari bir joyda, aniq va tushunarli ko‘rinishda.
          </p>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, index) => {
            const Icon = resultIcons[index] ?? Trophy;
            return (
              <article key={`${stat.label}-${index}`} className="rounded-3xl border border-slate-200/70 bg-slate-50/80 p-5 transition-transform duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg motion-reduce:transition-none">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                      {stat.value.toLocaleString()}{stat.suffix}
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{stat.label}</p>
                  </div>
                  <span className="rounded-2xl bg-white p-3 text-[#0071e3] shadow-sm" aria-hidden="true">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
