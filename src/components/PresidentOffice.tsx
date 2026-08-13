import {
  GraduationCap,
  Trophy,
  Leaf,
  Palette,
  Rocket,
  MessageCircle,
  Wallet,
  Send,
  Crown,
  Lightbulb,
  ArrowUpRight,
  Sparkles,
  Users,
  ShieldCheck,
} from 'lucide-react';

import { ministries, schoolPresident } from '../lib/data';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const iconMap: Record<string, typeof GraduationCap> = {
  GraduationCap,
  Trophy,
  Leaf,
  Palette,
  Rocket,
  MessageCircle,
  Wallet,
};

const colorMap: Record<
  string,
  {
    bg: string;
    text: string;
    border: string;
    glow: string;
    gradient: string;
  }
> = {
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600',
    border: 'border-blue-200/60',
    glow: 'group-hover:shadow-blue-500/20',
    gradient: 'from-blue-500/20 to-cyan-500/5',
  },

  green: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600',
    border: 'border-emerald-200/60',
    glow: 'group-hover:shadow-emerald-500/20',
    gradient: 'from-emerald-500/20 to-teal-500/5',
  },

  orange: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-600',
    border: 'border-orange-200/60',
    glow: 'group-hover:shadow-orange-500/20',
    gradient: 'from-orange-500/20 to-yellow-500/5',
  },

  red: {
    bg: 'bg-red-500/10',
    text: 'text-red-600',
    border: 'border-red-200/60',
    glow: 'group-hover:shadow-red-500/20',
    gradient: 'from-red-500/20 to-pink-500/5',
  },
};

export default function PresidentOffice() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();

  return (
    <section
      id="president"
      className="apple-section relative overflow-hidden"
    >
      {/* ================= BACKGROUND GLOW ================= */}

      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-180px] top-[10%] h-[420px] w-[420px] rounded-full bg-blue-400/10 blur-[100px]" />

        <div className="absolute right-[-150px] top-[35%] h-[400px] w-[400px] rounded-full bg-purple-400/10 blur-[100px]" />

        <div className="absolute bottom-[-200px] left-[35%] h-[500px] w-[500px] rounded-full bg-cyan-400/10 blur-[120px]" />
      </div>

      <div className="apple-container relative">

        {/* ================= HEADER ================= */}

        <div
          className={`mx-auto mb-16 max-w-3xl text-center transition-all duration-1000 ${
            isVisible
              ? 'translate-y-0 opacity-100'
              : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-xl">
            <Crown className="h-4 w-4 text-orange-500" />
            Prezident Devoni

            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
          </div>

          <h2 className="text-4xl font-black tracking-[-0.04em] text-slate-900 sm:text-5xl md:text-6xl">
            O'zini-o'zi
            <br />

            <span className="text-gradient-blue">
              boshqarish tizimi
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-500 sm:text-lg">
            Maktab Prezidenti va 7 ta vazirlik — o'quvchilar
            maktab hayotini birgalikda boshqaradi, yangi
            g'oyalarni amalga oshiradi va maktab rivojiga hissa
            qo'shadi.
          </p>
        </div>

        {/* ================= PRESIDENT CARD ================= */}

        <div
          className={`relative mb-14 overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e293b] p-7 shadow-2xl transition-all duration-1000 sm:p-10 ${
            isVisible
              ? 'translate-y-0 scale-100 opacity-100'
              : 'translate-y-10 scale-[0.98] opacity-0'
          }`}
        >
          {/* Card glow */}

          <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-blue-500/20 blur-[90px]" />

          <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-orange-500/10 blur-[90px]" />

          {/* Decorative grid */}

          <div className="pointer-events-none absolute inset-0 opacity-[0.035]">
            <div
              className="h-full w-full"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)',
                backgroundSize: '35px 35px',
              }}
            />
          </div>

          <div className="relative flex flex-col items-center gap-7 sm:flex-row">

            {/* President Avatar */}

            <div className="relative flex-shrink-0">
              <div className="absolute inset-[-8px] rounded-[30px] bg-gradient-to-br from-orange-400/30 to-blue-500/20 blur-md" />

              <div className="relative flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/20 bg-gradient-to-br from-orange-400 to-orange-600 shadow-xl shadow-orange-500/20 sm:h-28 sm:w-28">
                <Crown
                  className="h-12 w-12 text-white sm:h-14 sm:w-14"
                  strokeWidth={1.8}
                />
              </div>

              <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-4 border-[#111827] bg-blue-500 shadow-lg">
                <span className="text-xs font-black text-white">
                  P
                </span>
              </div>
            </div>

            {/* President Info */}

            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">
                  Maktab Prezidenti
                </span>

                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.8)]" />
              </div>

              <h3 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
                {schoolPresident.name}
              </h3>

              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
                {schoolPresident.description}
              </p>

              <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 backdrop-blur-md">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  Faol boshqaruv
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 backdrop-blur-md">
                  <Users className="h-3.5 w-3.5 text-blue-400" />
                  O'quvchilar jamoasi
                </div>
              </div>
            </div>

            {/* Telegram */}

            <a
              href={`https://t.me/${schoolPresident.telegram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-5 py-3.5 text-white backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:bg-white/15 hover:shadow-xl"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0088cc]/20">
                <Send className="h-5 w-5 text-[#42a5f5]" />
              </div>

              <div className="flex flex-col items-start leading-tight">
                <span className="text-[10px] uppercase tracking-wider text-white/40">
                  Telegram
                </span>

                <span className="mt-1 text-sm font-bold">
                  @{schoolPresident.telegram}
                </span>
              </div>

              <ArrowUpRight className="h-4 w-4 text-white/40 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
            </a>
          </div>
        </div>

        {/* ================= MINISTRIES TITLE ================= */}

        <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Boshqaruv jamoasi
            </p>

            <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Vazirliklar
            </h3>
          </div>

          <div className="hidden h-px flex-1 bg-gradient-to-r from-black/5 via-black/10 to-transparent sm:ml-8 sm:block" />

          <div className="rounded-full bg-white/70 px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm backdrop-blur-md">
            {ministries.length} ta yo'nalish
          </div>
        </div>

        {/* ================= MINISTRIES ================= */}

        <div
          ref={ref}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {ministries.map((ministry, index: number) => {
            const Icon =
              iconMap[ministry.icon] ?? GraduationCap;

            const colors =
              colorMap[ministry.color] ?? colorMap.blue;

            return (
              <div
                key={index}
                className={`group relative overflow-hidden rounded-[30px] border bg-white/70 p-6 shadow-sm backdrop-blur-xl transition-all duration-700 ease-out hover:-translate-y-2 hover:shadow-2xl ${colors.border} ${colors.glow} ${
                  isVisible
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-10 opacity-0'
                }`}
                style={{
                  transitionDelay: `${index * 90}ms`,
                }}
              >
                {/* Hover gradient */}

                <div
                  className={`pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${colors.gradient}`}
                />

                {/* Top glow */}

                <div
                  className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100 ${colors.bg}`}
                />

                {/* Icon + title */}

                <div className="relative flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${colors.bg} transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    <Icon
                      className={`h-6 w-6 ${colors.text}`}
                      strokeWidth={2}
                    />
                  </div>

                  <div>
                    <h3 className="text-base font-bold leading-tight text-slate-900">
                      {ministry.name}
                    </h3>

                    <p className="mt-1 text-xs font-medium text-slate-400">
                      O'zini-o'zi boshqarish
                    </p>
                  </div>
                </div>

                {/* Minister */}

                <div className="mt-5 rounded-2xl border border-black/5 bg-slate-50/80 p-3.5 transition-colors duration-300 group-hover:bg-white/80">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Vazir
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {ministry.minister}
                      </p>
                    </div>

                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${colors.bg}`}
                    >
                      <Crown
                        className={`h-4 w-4 ${colors.text}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}

                <p className="mt-5 text-sm leading-relaxed text-slate-500">
                  {ministry.description}
                </p>

                {/* Initiatives */}

                <div className="mt-5 border-t border-black/5 pt-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Lightbulb
                      className={`h-4 w-4 ${colors.text}`}
                    />

                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Tashabbuslar
                    </span>
                  </div>

                  <div className="space-y-2">
                    {ministry.initiatives.map(
                      (init: string, i: number) => (
                        <div
                          key={i}
                          className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-500"
                        >
                          <span
                            className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${colors.bg} ring-2 ring-current ${colors.text}`}
                          />

                          <span>{init}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Telegram */}

                <a
                  href={`https://t.me/${ministry.telegram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 flex items-center justify-between rounded-2xl border border-[#0088cc]/10 bg-[#0088cc]/5 px-4 py-3 transition-all duration-300 hover:bg-[#0088cc]/10 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0088cc]/10">
                      <Send className="h-4 w-4 text-[#0088cc]" />
                    </div>

                    <div className="flex flex-col leading-tight">
                      <span className="text-[10px] font-medium text-slate-400">
                        Telegram orqali
                      </span>

                      <span className="mt-1 text-xs font-bold text-[#0088cc]">
                        @{ministry.telegram}
                      </span>
                    </div>
                  </div>

                  <ArrowUpRight className="h-4 w-4 text-[#0088cc]/50 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </div>
            );
          })}
        </div>

        {/* ================= BOTTOM INFO ================= */}

        <div
          className={`mt-12 flex flex-col items-center justify-center gap-3 rounded-3xl border border-white/70 bg-white/60 p-5 text-center shadow-sm backdrop-blur-xl transition-all duration-1000 sm:flex-row ${
            isVisible
              ? 'translate-y-0 opacity-100'
              : 'translate-y-6 opacity-0'
          }`}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10">
            <Sparkles className="h-4 w-4 text-blue-600" />
          </div>

          <p className="text-sm font-medium text-slate-500">
            Har bir vazirlik maktab hayotini rivojlantirish,
            o'quvchilar tashabbuslarini qo'llab-quvvatlash va
            yangi loyihalarni amalga oshirishga xizmat qiladi.
          </p>
        </div>
      </div>
    </section>
  );
}