import { useEffect, useState } from 'react';
import { ChevronDown, Phone, Clock, User, Sparkles } from 'lucide-react';
import { administration as staticAdministration } from '../lib/data';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useI18n } from '../i18n';

type AdministrationMember = { id?: string | number; name?: string; image?: string; role?: string; position?: string; reception?: string; phone?: string };

export default function Administration() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();
  const { t } = useI18n();
  const [administrationData, setAdministrationData] = useState<AdministrationMember[]>(staticAdministration as AdministrationMember[]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = () => {
      try {
        const raw = localStorage.getItem('administration');
        const parsed = raw ? JSON.parse(raw) : null;
        if (alive) setAdministrationData(Array.isArray(parsed) && parsed.length ? parsed as AdministrationMember[] : staticAdministration as AdministrationMember[]);
      } catch {
        if (alive) setAdministrationData(staticAdministration as AdministrationMember[]);
      }
    };
    load();
    window.addEventListener('storage', load);
    window.addEventListener('admin_data_updated', load);
    return () => { alive = false; window.removeEventListener('storage', load); window.removeEventListener('admin_data_updated', load); };
  }, []);

  const visibleMembers = showAll ? administrationData : administrationData.slice(0, 4);
  const hasMore = administrationData.length > 4;

  return (
    <section id="administration" className="apple-section relative overflow-hidden py-20">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute left-[-180px] top-[5%] h-[500px] w-[500px] rounded-full bg-blue-200/20 blur-3xl animate-liquid" />
        <div className="absolute right-[-180px] bottom-[5%] h-[500px] w-[500px] rounded-full bg-indigo-200/20 blur-3xl animate-liquid [animation-delay:3s]" />
      </div>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className={`mx-auto mb-14 max-w-3xl text-center transition-[opacity,transform] duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/70 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#0071e3]"><Sparkles className="h-3.5 w-3.5" />{t('administration')}</div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1d1d1f] sm:text-5xl md:text-6xl">{t('administration')}</h2>
          <p className="mt-5 text-base leading-relaxed text-[#6e6e73] sm:text-lg">{t('profileInfo')}</p>
        </div>

        {administrationData.length ? (
          <>
            <div ref={ref} className="grid gap-5 sm:grid-cols-2">
              {visibleMembers.map((person, index) => (
                <article key={person.id ?? `${person.name}-${index}`} className={`group overflow-hidden rounded-[30px] border border-white/80 bg-white/70 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-2xl transition-[opacity,transform,box-shadow] duration-700 hover:-translate-y-1 hover:shadow-2xl ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: `${index * 80}ms` }}>
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                    <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-white bg-slate-100 shadow-lg">
                      {person.image && !person.image.endsWith('/default.jpg') ? <img src={person.image} alt={person.name || t('administration')} loading="lazy" decoding="async" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-[#0071e3]/50"><User className="h-12 w-12" /></div>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl font-bold tracking-tight text-[#1d1d1f] group-hover:text-[#0071e3]">{person.name || t('administration')}</h3>
                      <p className="mt-1 text-sm font-semibold text-[#0071e3]">{person.role || person.position || t('unavailable')}</p>
                      <div className="my-4 h-px bg-gradient-to-r from-black/10 to-transparent" />
                      <div className="space-y-2 text-sm text-[#6e6e73]">
                        {person.reception && <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-[#0071e3]" />{person.reception}</p>}
                        {person.phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-[#0071e3]" />{person.phone}</p>}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button type="button" onClick={() => setShowAll(value => !value)} aria-expanded={showAll} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-black/10 bg-white/80 px-6 py-3 text-sm font-semibold text-[#1d1d1f] shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-[#0071e3]/30 hover:text-[#0071e3] hover:shadow-md">
                  {showAll ? 'Kamroq ko‘rsatish' : `Ko‘proq ko‘rish (${administrationData.length - 4})`}
                  <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="mx-auto max-w-xl rounded-[30px] border border-white/70 bg-white/60 p-14 text-center shadow-xl backdrop-blur-xl"><User className="mx-auto h-10 w-10 text-[#0071e3]" /><p className="mt-4 text-sm text-[#6e6e73]">{t('empty')}</p></div>
        )}
      </div>
    </section>
  );
}
