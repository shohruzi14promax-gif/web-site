import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Coins, Eye, RefreshCw, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

type EventRow = { event_type: 'site_visit' | 'schoolcoin_visit'; visitor_id: string; created_at: string };
const dayKey = (date: Date) => date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
const formatDay = (key: string) => { const parts = key.split('-'); return parts[2] + '.' + parts[1]; };

export default function AnalyticsDashboard() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [totalSiteVisits, setTotalSiteVisits] = useState(0);
  const [totalSchoolCoinVisits, setTotalSchoolCoinVisits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = async () => {
    setLoading(true); setError('');
    try {
      const since = new Date(); since.setDate(since.getDate() - 6); since.setHours(0, 0, 0, 0);
      const [recent, siteTotal, coinTotal] = await Promise.all([
        supabase.from('site_analytics_events').select('event_type, visitor_id, created_at').gte('created_at', since.toISOString()).order('created_at', { ascending: true }),
        supabase.from('site_analytics_events').select('id', { count: 'exact', head: true }).eq('event_type', 'site_visit'),
        supabase.from('site_analytics_events').select('id', { count: 'exact', head: true }).eq('event_type', 'schoolcoin_visit'),
      ]);
      if (recent.error) throw recent.error; if (siteTotal.error) throw siteTotal.error; if (coinTotal.error) throw coinTotal.error;
      setEvents((recent.data || []) as EventRow[]); setTotalSiteVisits(siteTotal.count || 0); setTotalSchoolCoinVisits(coinTotal.count || 0);
    } catch (err) { setError(err instanceof Error ? err.message : 'Statistika yuklanmadi'); } finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  const stats = useMemo(() => {
    const today = dayKey(new Date());
    const todaySite = events.filter(e => e.event_type === 'site_visit' && dayKey(new Date(e.created_at)) === today).length;
    const todayCoin = events.filter(e => e.event_type === 'schoolcoin_visit' && dayKey(new Date(e.created_at)) === today).length;
    const uniqueRecent = new Set(events.filter(e => e.event_type === 'site_visit').map(e => e.visitor_id)).size;
    const days = Array.from({ length: 7 }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - (6 - index)); return dayKey(date); });
    const chart = days.map(day => ({ day, label: formatDay(day), visits: events.filter(e => e.event_type === 'site_visit' && dayKey(new Date(e.created_at)) === day).length }));
    return { todaySite, todayCoin, uniqueRecent, chart, max: Math.max(1, ...chart.map(item => item.visits)) };
  }, [events]);
  return <section className="rounded-3xl bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><div className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-[#0071e3]" /><h2 className="text-xl font-black">Tashriflar statistikasi</h2></div><p className="mt-1 text-xs text-slate-500">Faqat admin panelda ko‘rinadi</p></div><button type="button" onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold disabled:opacity-50"><RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} /> Yangilash</button></div>
    {error && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-2xl bg-blue-50 p-4"><Eye className="h-5 w-5 text-[#0071e3]" /><p className="mt-3 text-xs text-slate-500">Bugungi tashriflar</p><p className="text-2xl font-black">{stats.todaySite}</p></div>
      <div className="rounded-2xl bg-slate-50 p-4"><Users className="h-5 w-5 text-slate-700" /><p className="mt-3 text-xs text-slate-500">Oxirgi 7 kundagi tashrif buyuruvchilar*</p><p className="text-2xl font-black">{stats.uniqueRecent}</p></div>
      <div className="rounded-2xl bg-emerald-50 p-4"><BarChart3 className="h-5 w-5 text-emerald-700" /><p className="mt-3 text-xs text-slate-500">Jami sayt tashriflari</p><p className="text-2xl font-black">{totalSiteVisits}</p></div>
      <div className="rounded-2xl bg-amber-50 p-4"><Coins className="h-5 w-5 text-amber-700" /><p className="mt-3 text-xs text-slate-500">SchoolCoin tashriflari</p><p className="text-2xl font-black">{totalSchoolCoinVisits}</p></div>
    </div>
    <div className="mt-5 rounded-2xl border border-slate-100 p-4"><div className="mb-4 flex items-center justify-between"><h3 className="font-bold">Oxirgi 7 kun</h3><span className="text-xs text-slate-400">Bugun: {stats.todayCoin} ta SchoolCoin kirishi</span></div><div className="flex h-40 items-end gap-2 sm:gap-3">{stats.chart.map(item => <div key={item.day} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"><span className="text-xs font-semibold text-slate-500">{item.visits}</span><div className="w-full max-w-12 rounded-t-lg bg-[#0071e3]/80" style={{ height: Math.max(6, (item.visits / stats.max) * 100) + '%' }} title={item.label + ': ' + item.visits + ' tashrif'} /><span className="text-[10px] text-slate-400">{item.label}</span></div>)}</div></div>
    <p className="mt-3 text-[11px] text-slate-400">* Anonim tashrif identifikatori asosida hisoblanadi. Bir qurilma/brauzer almashsa, alohida tashrifchi sifatida ko‘rinishi mumkin.</p>
  </section>;
}