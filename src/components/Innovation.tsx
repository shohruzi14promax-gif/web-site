import { useState, useEffect } from 'react';
import {
  Rocket,
  Users,
  Target,
  CheckCircle2,
  Clock,
  Activity,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { useScrollAnimation, useCountUp } from '../hooks/useScrollAnimation';

type SocialStat = {
  value: number;
  suffix: string;
  label: string;
};

function StatCard({
  stat,
  index,
  visible,
}: {
  stat: SocialStat;
  index: number;
  visible: boolean;
}) {
  const count = useCountUp(stat.value, 2000, visible);

  return (
    <div
      className={`group relative rounded-3xl border border-white/70 bg-white/45 px-4 py-7 text-center shadow-sm backdrop-blur-2xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:bg-white/70 hover:shadow-xl ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-10 opacity-0'
      }`}
      style={{
        transitionDelay: `${index * 100}ms`,
      }}
    >
      {/* Glass shine */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/50 via-transparent to-blue-100/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative">
        <div className="text-4xl font-black tracking-tight text-slate-900 transition-transform duration-500 group-hover:scale-110 sm:text-5xl">
          {count.toLocaleString()}
          <span className="text-[#0071e3]">{stat.suffix}</span>
        </div>

        <div className="mt-2 text-sm font-medium text-slate-500 transition-colors duration-300 group-hover:text-[#0071e3] sm:text-base">
          {stat.label}
        </div>
      </div>
    </div>
  );
}

export default function Innovation() {
  const { ref, isVisible } =
    useScrollAnimation<HTMLDivElement>();

  const {
    ref: statsRef,
    isVisible: statsVisible,
  } = useScrollAnimation<HTMLDivElement>();

  const [projects, setProjects] = useState<any[]>([]);

  const [socialActions, setSocialActions] =
    useState<SocialStat[]>([
      {
        value: 200,
        suffix: '+',
        label: 'Aksiya qatnashchilari',
      },
      {
        value: 15,
        suffix: ' ta',
        label: 'Maxsus loyihalar',
      },
      {
        value: 100,
        suffix: '%',
        label: 'Ochiq portal',
      },
      {
        value: 1,
        suffix: "-o'rin",
        label: 'Grant yutuqlari',
      },
    ]);

  const [awardText, setAwardText] = useState(
    "Yilning eng faol maktabi – Jizzax viloyati, 2026"
  );

  useEffect(() => {
    const loadData = () => {
      try {
        /* ================================
           STATISTIKA
        ================================= */

        const savedStats =
          localStorage.getItem('schoolStats');

        if (savedStats) {
          const parsed = JSON.parse(savedStats);

          if (
            Array.isArray(parsed) &&
            parsed.length > 0
          ) {
            setSocialActions(parsed);
          }
        }

        /* ================================
           LOYIHALAR
        ================================= */

        const savedProjects =
          localStorage.getItem('projects');

        if (savedProjects) {
          const parsedProjects =
            JSON.parse(savedProjects);

          if (Array.isArray(parsedProjects)) {
            setProjects(parsedProjects);
          }
        }

        /* ================================
           AWARD TEXT
        ================================= */

        const savedAward =
          localStorage.getItem('awardText');

        if (savedAward) {
          setAwardText(savedAward);
        }
      } catch (error) {
        console.error(
          "Innovatsiya ma'lumotlarini yuklashda xatolik:",
          error
        );
      }
    };

    loadData();

    window.addEventListener(
      'storage',
      loadData
    );

    window.addEventListener(
      'schoolStatsUpdated',
      loadData
    );

    window.addEventListener(
      'projectsUpdated',
      loadData
    );

    const interval = setInterval(
      loadData,
      1000
    );

    return () => {
      window.removeEventListener(
        'storage',
        loadData
      );

      window.removeEventListener(
        'schoolStatsUpdated',
        loadData
      );

      window.removeEventListener(
        'projectsUpdated',
        loadData
      );

      clearInterval(interval);
    };
  }, []);

  /* ================================
     STATUS BADGE
  ================================= */

  const getStatusBadge = (
    status: string
  ) => {
    switch (status) {
      case 'Tugallangan':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/70 bg-emerald-50/90 px-3 py-1.5 text-xs font-semibold text-emerald-600 shadow-sm backdrop-blur-md">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Tugallangan
          </span>
        );

      case 'Qilinmoqda':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/70 bg-amber-50/90 px-3 py-1.5 text-xs font-semibold text-amber-600 shadow-sm backdrop-blur-md">
            <Clock className="h-3.5 w-3.5" />
            Qilinmoqda
          </span>
        );

      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/70 bg-blue-50/90 px-3 py-1.5 text-xs font-semibold text-[#0071e3] shadow-sm backdrop-blur-md">
            <Activity className="h-3.5 w-3.5" />
            Amalda
          </span>
        );
    }
  };

  return (
    <section
      id="innovation"
      ref={ref}
      className="relative overflow-hidden py-24 sm:py-28"
    >
      {/* ==========================================
          BACKGROUND
      =========================================== */}

      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-15%] top-[5%] h-[500px] w-[500px] rounded-full bg-blue-400/10 blur-[120px] animate-liquid" />

        <div
          className="absolute right-[-15%] top-[30%] h-[500px] w-[500px] rounded-full bg-purple-400/10 blur-[130px] animate-liquid"
          style={{
            animationDelay: '3s',
          }}
        />

        <div
          className="absolute bottom-[-200px] left-[25%] h-[500px] w-[500px] rounded-full bg-cyan-400/10 blur-[120px] animate-liquid"
          style={{
            animationDelay: '6s',
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8 md:px-12 lg:px-16">

        {/* ==========================================
            HEADER
        =========================================== */}

        <div
          className={`mx-auto mb-16 max-w-3xl text-center transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isVisible
              ? 'translate-y-0 opacity-100'
              : 'translate-y-10 opacity-0'
          }`}
        >
          {/* Badge */}

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-white/60 px-4 py-1.5 text-sm font-semibold text-[#0071e3] shadow-sm backdrop-blur-xl">
            <Sparkles className="h-4 w-4 animate-pulse" />
            Innovatsiya va yutuqlar
          </div>

          <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Maktabimizning
            <br />
            <span className="text-gradient-blue">
              raqamlardagi muvaffaqiyatlari
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-500 sm:text-lg">
            {awardText}
          </p>
        </div>

        {/* ==========================================
            STATS
        =========================================== */}

        <div
          ref={statsRef}
          className={`relative grid grid-cols-2 gap-3 rounded-[36px] border border-white/80 bg-white/35 p-3 shadow-xl shadow-slate-900/5 backdrop-blur-2xl transition-all duration-1000 sm:gap-5 sm:p-5 md:grid-cols-4 ${
            statsVisible
              ? 'translate-y-0 opacity-100'
              : 'translate-y-12 opacity-0'
          }`}
        >
          {/* Glass shine */}

          <div className="pointer-events-none absolute inset-0 rounded-[36px] bg-gradient-to-br from-white/60 via-transparent to-blue-100/10" />

          {socialActions.map(
            (stat, index) => (
              <StatCard
                key={index}
                stat={stat}
                index={index}
                visible={statsVisible}
              />
            )
          )}
        </div>

        {/* ==========================================
            PROJECTS
        =========================================== */}

        {projects.length > 0 && (
          <div className="mt-24">

            {/* Section title */}

            <div
              className={`mb-10 flex flex-col gap-4 border-b border-slate-200/60 pb-6 transition-all duration-700 sm:flex-row sm:items-end sm:justify-between ${
                isVisible
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-8 opacity-0'
              }`}
            >
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0071e3]/10">
                    <Rocket className="h-5 w-5 text-[#0071e3]" />
                  </div>

                  <span className="text-xs font-bold uppercase tracking-widest text-[#0071e3]">
                    Loyihalar
                  </span>
                </div>

                <h3 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  Innovatsion loyihalar
                </h3>

                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
                  Maktabimiz o'quvchilari va
                  ustozlari tomonidan amalga
                  oshirilayotgan innovatsion
                  loyihalar.
                </p>
              </div>

              <div className="inline-flex w-fit items-center rounded-full border border-blue-200/60 bg-blue-50/70 px-4 py-2 text-xs font-bold text-[#0071e3] backdrop-blur-md">
                Jami: {projects.length} ta
              </div>
            </div>

            {/* Projects */}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map(
                (project, index) => (
                  <div
                    key={
                      project.id ||
                      project.title ||
                      index
                    }
                    className={`group relative overflow-hidden rounded-[30px] border border-white/80 bg-white/55 shadow-lg shadow-slate-900/5 backdrop-blur-2xl transition-all duration-700 hover:-translate-y-2 hover:bg-white/75 hover:shadow-2xl hover:shadow-blue-900/10 ${
                      isVisible
                        ? 'translate-y-0 opacity-100'
                        : 'translate-y-10 opacity-0'
                    }`}
                    style={{
                      transitionDelay: `${
                        index * 100
                      }ms`,
                    }}
                  >
                    {/* IMAGE */}

                    {project.image ? (
                      <div className="relative h-52 w-full overflow-hidden">
                        <img
                          src={project.image}
                          alt={
                            project.title ||
                            'Innovatsion loyiha'
                          }
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        />

                        {/* Image overlay */}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />

                        {/* Status */}

                        <div className="absolute right-4 top-4">
                          {getStatusBadge(
                            project.status
                          )}
                        </div>

                        {/* Floating icon */}

                        <div className="absolute bottom-4 left-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 text-[#0071e3] shadow-lg backdrop-blur-xl transition-transform duration-500 group-hover:scale-110">
                          <Rocket className="h-5 w-5" />
                        </div>
                      </div>
                    ) : (
                      <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
                        <Rocket className="h-12 w-12 text-[#0071e3]/30 transition-transform duration-700 group-hover:scale-125 group-hover:rotate-6" />

                        <div className="absolute right-4 top-4">
                          {getStatusBadge(
                            project.status
                          )}
                        </div>
                      </div>
                    )}

                    {/* CONTENT */}

                    <div className="p-6">

                      <h4 className="flex items-start justify-between gap-3 text-lg font-bold leading-snug text-slate-900 transition-colors duration-300 group-hover:text-[#0071e3]">
                        <span>
                          {project.title}
                        </span>

                        <ArrowUpRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-300 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#0071e3]" />
                      </h4>

                      {/* Goal */}

                      {project.goal && (
                        <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-blue-50/60 p-3">
                          <Target className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#0071e3]" />

                          <p className="text-xs leading-relaxed text-slate-600">
                            <strong className="text-slate-800">
                              Maqsadi:
                            </strong>{' '}
                            {project.goal}
                          </p>
                        </div>
                      )}

                      {/* Participants */}

                      {project.participants && (
                        <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-500">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
                            <Users className="h-3.5 w-3.5 text-emerald-500" />
                          </div>

                          <span>
                            <strong className="text-slate-700">
                              Ishtirokchilar:
                            </strong>{' '}
                            {project.participants}
                          </span>
                        </div>
                      )}

                      {/* Description */}

                      {project.description && (
                        <p className="mt-4 border-t border-slate-200/70 pt-4 text-xs leading-relaxed text-slate-500">
                          {project.description}
                        </p>
                      )}

                    </div>

                    {/* Bottom glow */}

                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#0071e3]/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* ==========================================
            EMPTY PROJECT STATE
        =========================================== */}

        {projects.length === 0 && (
          <div
            className={`mt-16 rounded-[30px] border border-white/70 bg-white/40 p-10 text-center shadow-lg backdrop-blur-2xl transition-all duration-700 ${
              isVisible
                ? 'translate-y-0 opacity-100'
                : 'translate-y-8 opacity-0'
            }`}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
              <Rocket className="h-7 w-7 text-[#0071e3]" />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900">
              Innovatsion loyihalar
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
              Hozircha loyihalar qo'shilmagan.
              Yangi loyihalarni admin panel orqali
              qo'shishingiz mumkin.
            </p>
          </div>
        )}

      </div>
    </section>
  );
}