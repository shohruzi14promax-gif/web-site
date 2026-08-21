import { Target, Lightbulb, Heart, Users } from 'lucide-react';
import { historyTimeline } from '@/lib/data';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useI18n } from '../i18n';

const iconMap: Record<string, typeof Target> = { Target, Lightbulb, Heart, Users };

const copy = {
  uz: {
    eyebrow: 'Maktab', title: 'Maktab haqida', source: 'Rasmiy manba',
    goals: [
      ['Akademik mukammallik', 'O‘quvchilarni chuqur bilim, tanqidiy fikrlash va ijodiy yondashuv bilan qurollantirish. Har bir o‘quvchining salohiyatini to‘liq ochish.'],
      ['Innovatsion tafakkur', 'STEM, robototexnika va yangi texnologiyalar orqali o‘quvchilarni kelajak kasblariga tayyorlash. Tadqiqot va loyiha asosida o‘qitish.'],
      ['Vatanga muhabbat', 'Milliy g‘urur, fuqarolik mas’uliyati va jamiyat oldidagi burchini chuqur his qiladigan yoshlarni tarbiyalash.'],
      ['Yetakchilik mahorati', 'O‘quvchilarning yetakchilik, jamoa boshqaruvi va qaror qabul qilish ko‘nikmalarini rivojlantirish.'],
    ],
  },
  ru: {
    eyebrow: 'Школа', title: 'О школе', source: 'Официальный источник',
    goals: [
      ['Академическое совершенство', 'Глубокие знания, критическое мышление и творческий подход. Мы создаём условия для раскрытия потенциала каждого ученика.'],
      ['Инновационное мышление', 'STEM, робототехника и современные технологии помогают ученикам готовиться к профессиям будущего через исследования и проекты.'],
      ['Гражданская ответственность', 'Воспитываем уважение к стране, чувство ответственности и готовность приносить пользу обществу.'],
      ['Лидерские навыки', 'Развиваем лидерство, командное управление и самостоятельное принятие решений через ученические инициативы.'],
    ],
  },
  en: {
    eyebrow: 'School', title: 'About the school', source: 'Official source',
    goals: [
      ['Academic excellence', 'Deep knowledge, critical thinking, and creative problem-solving help every student unlock their full potential.'],
      ['Innovative thinking', 'STEM, robotics, and modern technology prepare students for future careers through research and project-based learning.'],
      ['Civic responsibility', 'We nurture pride, responsibility, and a strong commitment to making a positive contribution to society.'],
      ['Leadership skills', 'Student initiatives build leadership, teamwork, communication, and confident decision-making skills.'],
    ],
  },
} as const;

export default function About() {
  const { locale } = useI18n();
  const { ref: goalsRef, isVisible: goalsVisible } = useScrollAnimation<HTMLDivElement>();
  const { ref: timelineRef, isVisible: timelineVisible } = useScrollAnimation<HTMLDivElement>();
  const current = copy[locale];

  return (
    <section id="about" className="apple-section relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute left-[-150px] top-[15%] h-[350px] w-[350px] rounded-full bg-blue-200/20 blur-3xl animate-float" />
        <div className="absolute right-[-150px] top-[45%] h-[400px] w-[400px] rounded-full bg-purple-200/15 blur-3xl animate-liquid [animation-delay:2s]" />
      </div>
      <div className="apple-container">
        <div className={`mx-auto mb-16 max-w-3xl text-center transition-all duration-1000 motion-reduce:transition-none ${goalsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <p className="apple-eyebrow mb-4">{current.eyebrow}</p>
          <h2 className="apple-heading">{current.title}</h2>
          <p className="apple-subheading mt-4">{current.source}</p>
        </div>

        <div ref={goalsRef} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {current.goals.map(([title, description], index) => {
            const Icon = [Target, Lightbulb, Heart, Users][index];
            return (
              <div key={title} className={`apple-card group relative overflow-hidden transition-all duration-700 motion-reduce:transition-none ${goalsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} style={{ transitionDelay: `${index * 120}ms` }}>
                <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-200/20 blur-3xl transition-all duration-700 group-hover:scale-[2]" aria-hidden="true" />
                <div className="relative z-10 mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0071e3]/10"><Icon className="h-6 w-6 text-[#0071e3]" aria-hidden="true" /></div>
                <h3 className="relative z-10 mb-2 text-lg font-semibold text-[#1d1d1f] dark:text-white">{title}</h3>
                <p className="relative z-10 text-sm leading-relaxed text-[#6e6e73] dark:text-slate-400">{description}</p>
              </div>
            );
          })}
        </div>

        <div ref={timelineRef} className="relative mt-24">
          <div className={`mb-12 text-center transition-all duration-1000 motion-reduce:transition-none ${timelineVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h3 className="text-2xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white sm:text-3xl">{locale === 'uz' ? 'Tarixiy xronologiya' : locale === 'ru' ? 'Историческая хронология' : 'Historical timeline'}</h3>
            <p className="mt-3 text-base text-[#6e6e73] dark:text-slate-400">{current.source}</p>
          </div>
          <div className="relative mx-auto max-w-3xl">
            <div className={`absolute left-4 top-0 h-full w-px origin-top bg-gradient-to-b from-[#0071e3] via-[#0071e3]/30 to-transparent transition-transform duration-[1500ms] motion-reduce:transition-none sm:left-1/2 sm:-translate-x-1/2 ${timelineVisible ? 'scale-y-100' : 'scale-y-0'}`} aria-hidden="true" />
            {historyTimeline.map((item, index) => (
              <div key={index} className={`relative mb-12 flex flex-col gap-4 pl-12 sm:w-1/2 sm:pl-0 ${index % 2 === 0 ? 'sm:pr-12 sm:text-right' : 'sm:ml-auto sm:pl-12'} transition-all duration-800 motion-reduce:transition-none ${timelineVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} style={{ transitionDelay: `${index * 150}ms` }}>
                <div className={`absolute top-1.5 left-0 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md ring-4 ring-[#0071e3]/10 dark:bg-slate-900 sm:left-auto ${index % 2 === 0 ? 'sm:-right-4' : 'sm:-left-4'}`} aria-hidden="true"><div className="h-2.5 w-2.5 rounded-full bg-[#0071e3]" /></div>
                <div className="apple-card group !p-6 transition-all duration-500 hover:-translate-y-2 motion-reduce:transition-none">
                  <div className="mb-1 text-2xl font-bold text-[#0071e3]">{item.year}</div>
                  <h4 className="mb-2 text-lg font-semibold text-[#1d1d1f] dark:text-white">{item.title}</h4>
                  <p className="text-sm leading-relaxed text-[#6e6e73] dark:text-slate-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
