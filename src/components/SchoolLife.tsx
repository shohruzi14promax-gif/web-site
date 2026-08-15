import { useEffect, useState } from 'react';
import { BedDouble, Utensils, Clock3, ChevronRight } from 'lucide-react';
import { getSiteData, supabase, supabaseConfigured } from '../lib/supabase';

type SchoolLifeData = {
  dormitory?: { title?: string; description?: string; image?: string; features?: string[] };
  meals?: { title?: string; description?: string; menu?: { name: string; time: string; description?: string }[] };
  routine?: { title?: string; description?: string; items?: { time: string; activity: string; description?: string }[] };
};

const fallback: SchoolLifeData = {
  dormitory: { title: 'Yotoqxona', description: 'O‘quvchilar uchun qulay, xavfsiz va tartibli yashash muhiti.', features: ['Qulay yashash sharoiti', 'Nazorat va xavfsizlik', 'Dam olish va mustaqil tayyorgarlik zonalari'] },
  meals: { title: 'Ovqatlanish', description: 'O‘quvchilar uchun kun davomida belgilangan vaqtlarda ovqatlanish tartibi.', menu: [{ name: 'Nonushta', time: '07:30' }, { name: 'Tushlik', time: '13:00' }, { name: 'Kechki ovqat', time: '18:30' }] },
  routine: { title: 'Kun tartibi', description: 'O‘quv, dam olish va mustaqil tayyorgarlik vaqtlarini muvozanatli tashkil etish.', items: [{ time: '06:30', activity: 'Uyg‘onish' }, { time: '07:30', activity: 'Nonushta' }, { time: '08:30', activity: 'Darslar' }, { time: '13:00', activity: 'Tushlik' }, { time: '15:00', activity: 'To‘garaklar / mustaqil ta’lim' }, { time: '18:30', activity: 'Kechki ovqat' }, { time: '22:00', activity: 'Uyqu' }] },
};

const cleanText = (value?: string) => {
  const text = value?.trim();
  return text && text.length > 1 ? text : undefined;
};

const cleanList = (items?: string[]) => (items || []).map(item => item.trim()).filter(item => item.length > 1);

export default function SchoolLife() {
  const [data, setData] = useState<SchoolLifeData>(fallback);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const value = await getSiteData<SchoolLifeData>('schoolLife', fallback);
      if (!alive) return;
      const next = value || fallback;
      setData({
        dormitory: next.dormitory ? { ...next.dormitory, title: cleanText(next.dormitory.title) || 'Yotoqxona', description: cleanText(next.dormitory.description), features: cleanList(next.dormitory.features) } : undefined,
        meals: next.meals ? { ...next.meals, title: cleanText(next.meals.title) || 'Ovqatlanish', description: cleanText(next.meals.description), menu: (next.meals.menu || []).filter(item => cleanText(item.name) && cleanText(item.time)).map(item => ({ ...item, name: cleanText(item.name)!, time: cleanText(item.time)! })) } : undefined,
        routine: next.routine ? { ...next.routine, title: cleanText(next.routine.title) || 'Kun tartibi', description: cleanText(next.routine.description), items: (next.routine.items || []).filter(item => cleanText(item.time) && cleanText(item.activity)).map(item => ({ ...item, time: cleanText(item.time)!, activity: cleanText(item.activity)! })) } : undefined,
      });
    };
    void load();

    if (!supabaseConfigured) return () => { alive = false; };
    const channel = supabase.channel('school-life-live').on('postgres_changes', { event: '*', schema: 'public', table: 'site_data' }, payload => {
      const key = (payload.new as { key?: string } | null)?.key || (payload.old as { key?: string } | null)?.key;
      if (key === 'schoolLife') void load();
    }).subscribe();
    return () => { alive = false; void supabase.removeChannel(channel); };
  }, []);

  const dormitory = data.dormitory;
  const meals = data.meals;
  const routine = data.routine;
  const visibleCards = [dormitory?.description || dormitory?.image || (dormitory?.features?.length ? true : false), meals?.description || (meals?.menu?.length ? true : false), routine?.description || (routine?.items?.length ? true : false)];

  return (
    <section id="school-life" className="scroll-mt-24 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 md:px-12 lg:px-16">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#0071e3]">Maktab hayoti</p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">Ta’limdan tashqari hayot ham muhim.</h2>
          <p className="mt-4 text-slate-600">Yotoqxona, ovqatlanish va kun tartibi haqida kerakli ma’lumotlar bir joyda.</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {visibleCards[0] && <article className="rounded-[30px] border border-white/70 bg-white/80 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#0071e3]"><BedDouble className="h-6 w-6" /></div>
            <h3 className="text-xl font-bold">{dormitory?.title || 'Yotoqxona'}</h3>
            {dormitory?.description && <p className="mt-2 text-sm leading-6 text-slate-600">{dormitory.description}</p>}
            {!!dormitory?.features?.length && <ul className="mt-5 space-y-3">{dormitory.features.map((item, i) => <li key={`${item}-${i}`} className="flex items-center gap-2 text-sm text-slate-700"><ChevronRight className="h-4 w-4 text-[#0071e3]" />{item}</li>)}</ul>}
            {dormitory?.image && <img src={dormitory.image} alt="Yotoqxona" loading="lazy" decoding="async" className="mt-5 h-40 w-full rounded-2xl object-cover" />}
          </article>}
          {visibleCards[1] && <article className="rounded-[30px] border border-white/70 bg-white/80 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600"><Utensils className="h-6 w-6" /></div>
            <h3 className="text-xl font-bold">{meals?.title || 'Ovqatlanish'}</h3>
            {meals?.description && <p className="mt-2 text-sm leading-6 text-slate-600">{meals.description}</p>}
            {!!meals?.menu?.length && <div className="mt-5 space-y-3">{meals.menu.map((item, i) => <div key={`${item.name}-${i}`} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"><div><p className="text-sm font-semibold">{item.name}</p>{item.description && <p className="text-xs text-slate-500">{item.description}</p>}</div><span className="font-bold text-[#0071e3]">{item.time}</span></div>)}</div>}
          </article>}
          {visibleCards[2] && <article className="rounded-[30px] border border-white/70 bg-white/80 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600"><Clock3 className="h-6 w-6" /></div>
            <h3 className="text-xl font-bold">{routine?.title || 'Kun tartibi'}</h3>
            {routine?.description && <p className="mt-2 text-sm leading-6 text-slate-600">{routine.description}</p>}
            {!!routine?.items?.length && <div className="mt-5 max-h-72 space-y-2 overflow-auto pr-1">{routine.items.map((item, i) => <div key={`${item.time}-${i}`} className="flex gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3"><span className="w-14 shrink-0 font-bold text-[#0071e3]">{item.time}</span><div><p className="text-sm font-semibold">{item.activity}</p>{item.description && <p className="text-xs text-slate-500">{item.description}</p>}</div></div>)}</div>}
          </article>}
        </div>
      </div>
    </section>
  );
}
