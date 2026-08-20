import { useEffect, useState } from 'react';
import { ArrowUpRight, CalendarDays, Megaphone } from 'lucide-react';
import { getSiteData } from '../lib/supabase';

type NewsItem = { id?: string | number; title?: string; content?: string; description?: string; message?: string; date?: string; category?: string; image?: string; thumbnail?: string };

export default function News() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [state, setState] = useState<'loading' | 'success' | 'empty' | 'error'>('loading');

  useEffect(() => {
    let alive = true;
    getSiteData<NewsItem[]>('announcements', [])
      .then(data => {
        if (!alive) return;
        setItems(Array.isArray(data) ? data : []);
        setState(Array.isArray(data) && data.length ? 'success' : 'empty');
      })
      .catch(() => alive && setState('error'));
    return () => { alive = false; };
  }, []);

  const latest = [...items].sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))).slice(0, 6);

  return (
    <section id="news" className="scroll-mt-24 px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[.18em] text-blue-600">Yangiliklar</p><h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Maktab hayotidan</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Rasmiy e’lonlar va yangiliklar. Faqat maktab tizimida mavjud ma’lumotlar ko‘rsatiladi.</p></div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-600"><Megaphone className="h-4 w-4 text-blue-600" /> Rasmiy manba</span>
        </div>

        {state === 'loading' && <div className="grid gap-4 md:grid-cols-3">{[1, 2, 3].map(i => <div key={i} className="h-44 animate-pulse rounded-3xl border border-slate-200 bg-white/70" />)}</div>}
        {state === 'error' && <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">Yangiliklarni yuklashda xatolik yuz berdi.</div>}
        {state === 'empty' && <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-10 text-center"><Megaphone className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-3 font-semibold text-slate-700">Hozircha yangiliklar e’lon qilinmagan.</p><p className="mt-1 text-sm text-slate-500">Yangi e’lonlar admin tizimidan qo‘shilganda shu yerda ko‘rinadi.</p></div>}
        {state === 'success' && <div className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
          <article className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
            {(latest[0].image || latest[0].thumbnail) && <img src={latest[0].image || latest[0].thumbnail} alt="" className="h-56 w-full object-cover" loading="lazy" />}
            <div className="p-6"><div className="flex items-center gap-2 text-xs text-slate-500"><CalendarDays className="h-4 w-4" />{latest[0].date || 'Sana ko‘rsatilmagan'}</div><h3 className="mt-3 text-2xl font-black text-slate-950">{latest[0].title || 'Yangilik'}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{latest[0].content || latest[0].description || latest[0].message || 'Tafsilot mavjud emas.'}</p></div>
          </article>
          <div className="space-y-3">{latest.slice(1).map((item, index) => <article key={item.id ?? `${item.title}-${index}`} className="rounded-2xl border border-slate-200 bg-white/85 p-5 transition hover:border-blue-200 hover:shadow-md"><div className="flex items-start justify-between gap-3"><div><p className="text-[11px] font-bold uppercase tracking-[.14em] text-blue-600">{item.category || 'Yangilik'}</p><h3 className="mt-1 font-bold text-slate-900">{item.title || 'Yangilik'}</h3><p className="mt-2 line-clamp-2 text-sm text-slate-600">{item.content || item.description || item.message || 'Tafsilot mavjud emas.'}</p></div><ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-slate-400" /></div><p className="mt-3 text-xs text-slate-400">{item.date || 'Sana ko‘rsatilmagan'}</p></article>)}</div>
        </div>}
      </div>
    </section>
  );
}
