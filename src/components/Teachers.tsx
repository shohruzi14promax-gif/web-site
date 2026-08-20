import { useEffect, useMemo, useState } from 'react';
import { Search, Users } from 'lucide-react';
import { getSiteData } from '../lib/supabase';
import { teachers as fallbackTeachers, type Teacher } from '../lib/data';

export default function Teachers() {
  const [items, setItems] = useState<Teacher[]>([]);
  const [query, setQuery] = useState('');
  const [state, setState] = useState<'loading' | 'success' | 'empty' | 'error'>('loading');

  useEffect(() => {
    let alive = true;
    getSiteData<Teacher[]>('teachers', [])
      .then(data => {
        if (!alive) return;
        const records = Array.isArray(data) && data.length ? data : fallbackTeachers;
        setItems(records);
        setState(records.length ? 'success' : 'empty');
      })
      .catch(() => {
        if (!alive) return;
        setItems(fallbackTeachers);
        setState(fallbackTeachers.length ? 'success' : 'error');
      });
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    if (!q) return items;
    return items.filter(t => [t.name, t.subject, t.role, t.category].filter(Boolean).some(value => String(value).toLocaleLowerCase().includes(q)));
  }, [items, query]);

  return (
    <section id="teachers" className="scroll-mt-24 px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[.18em] text-blue-600">Jamoa</p><h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Ustozlarimiz</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Maktab tizimida mavjud o‘qituvchi profillari va fan yo‘nalishlari.</p></div>
          {state === 'success' && <label className="flex w-full max-w-sm items-center gap-2 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm"><Search className="h-4 w-4 text-slate-400" /><span className="sr-only">Ustozlarni qidirish</span><input value={query} onChange={event => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Ism yoki fan bo‘yicha qidirish" /></label>}
        </div>

        {state === 'loading' && <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{[1, 2, 3, 4].map(i => <div key={i} className="h-64 animate-pulse rounded-3xl border border-slate-200 bg-white/70" />)}</div>}
        {state === 'error' && <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">O‘qituvchilarni yuklashda xatolik yuz berdi.</div>}
        {state === 'empty' && <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white/60 p-10 text-center"><Users className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-3 font-semibold text-slate-700">O‘qituvchi ma’lumotlari mavjud emas.</p></div>}
        {state === 'success' && <>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((teacher, index) => <article key={teacher.id || `${teacher.name}-${index}`} className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
              <div className="aspect-[4/3] overflow-hidden bg-slate-100">{teacher.image ? <img src={teacher.image} alt={teacher.name} className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full items-center justify-center text-slate-400"><Users className="h-10 w-10" /></div>}</div>
              <div className="p-5"><p className="text-[11px] font-bold uppercase tracking-[.12em] text-blue-600">{teacher.subject || 'O‘qituvchi'}</p><h3 className="mt-1 text-lg font-black text-slate-950">{teacher.name}</h3><p className="mt-2 text-sm text-slate-600">{teacher.role}</p>{teacher.category && <span className="mt-4 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{teacher.category}</span>}</div>
            </article>)}
          </div>
          {!filtered.length && <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">Qidiruv bo‘yicha ustoz topilmadi.</div>}
        </>}
      </div>
    </section>
  );
}
