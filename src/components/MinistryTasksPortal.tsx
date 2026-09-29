import { FormEvent, useEffect, useState } from 'react';
import { LogIn, LogOut, Plus, RefreshCw, ShieldCheck, Trash2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ministries = ["Ta'lim Vazirligi", 'Innovatsiya Vazirligi', 'Sport Vazirligi', 'Moliya Vazirligi', 'Madaniyat Vazirligi', 'Ekologiya Vazirligi', 'Kommunikatsiya Vazirligi'];
type Task = { id: string; title: string; description: string; ministry: string; due_date: string | null; status: string; report: string; created_at: string };
type UserSession = { user: { id: string; email?: string; app_metadata?: { role?: string; ministry?: string } } };

export default function MinistryTasksPortal({ onClose }: { onClose: () => void }) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ministry, setMinistry] = useState(ministries[0]);
  const [dueDate, setDueDate] = useState('');
  const [reports, setReports] = useState<Record<string, string>>({});
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const isPresident = ['admin', 'president'].includes(session?.user.app_metadata?.role || '');
  const assignedMinistry = session?.user.app_metadata?.ministry || '';
  const allowed = isPresident || (session?.user.app_metadata?.role === 'ministry' && ministries.includes(assignedMinistry));

  const load = async () => {
    setBusy(true); setError('');
    const { data, error: e } = await supabase.from('ministry_tasks').select('*').order('created_at', { ascending: false });
    if (e) setError(e.message);
    else {
      const rows = (data || []) as Task[];
      setTasks(rows);
      setReports(Object.fromEntries(rows.map(t => [t.id, t.report || ''])));
      setStatuses(Object.fromEntries(rows.map(t => [t.id, t.status])));
    }
    setBusy(false);
  };

  useEffect(() => { if (allowed) void load(); }, [allowed]);

  const login = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError('');
    const { data, error: e } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (e) setError(e.message);
    else {
      const next = data.session as unknown as UserSession | null;
      const role = next?.user.app_metadata?.role || '';
      const ministryClaim = next?.user.app_metadata?.ministry || '';
      if (next && (['admin', 'president'].includes(role) || (role === 'ministry' && ministries.includes(ministryClaim)))) {
        setSession(next); setPassword('');
      } else { await supabase.auth.signOut(); setError('Bu akkauntga topshiriqlar uchun ruxsat berilmagan.'); }
    }
    setBusy(false);
  };

  const createTask = async (event: FormEvent) => {
    event.preventDefault();
    if (!isPresident || !title.trim()) return;
    setBusy(true); setError('');
    const { error: e } = await supabase.from('ministry_tasks').insert({ title: title.trim(), description: description.trim(), ministry, due_date: dueDate || null, created_by: session?.user.id });
    if (e) setError(e.message); else { setTitle(''); setDescription(''); setDueDate(''); await load(); }
    setBusy(false);
  };

  const save = async (task: Task) => {
    setBusy(true); setError('');
    const { error: e } = await supabase.from('ministry_tasks').update({ status: statuses[task.id] || task.status, report: reports[task.id] ?? task.report ?? '', updated_at: new Date().toISOString() }).eq('id', task.id);
    if (e) setError(e.message); else await load();
    setBusy(false);
  };

  const remove = async (task: Task) => {
    if (!isPresident || !window.confirm('Topshiriqni o‘chirasizmi?')) return;
    setBusy(true);
    const { error: e } = await supabase.from('ministry_tasks').delete().eq('id', task.id);
    if (e) setError(e.message); else await load();
    setBusy(false);
  };

  if (!allowed) return <div className="fixed inset-0 z-[110] grid place-items-center bg-slate-950/75 p-4"><div className="w-full max-w-md rounded-3xl bg-white p-7"><div className="mb-5 flex justify-between"><div><p className="flex items-center gap-2 text-sm font-bold text-blue-600"><ShieldCheck className="h-4 w-4" /> Himoyalangan bo‘lim</p><h2 className="mt-2 text-2xl font-black">Vazirlik topshiriqlari</h2></div><button onClick={onClose} aria-label="Yopish"><X /></button></div><form onSubmit={login} className="space-y-3"><label className="block text-sm font-semibold">Email<input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border p-3" /></label><label className="block text-sm font-semibold">Parol<input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full rounded-xl border p-3" /></label>{error && <p className="text-sm text-red-600">{error}</p>}<button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white"><LogIn className="h-4 w-4" />Kirish</button></form></div></div>;

  return <div className="fixed inset-0 z-[110] overflow-auto bg-slate-100"><header className="sticky top-0 z-30 border-b bg-white p-4"><div className="mx-auto flex max-w-6xl items-center justify-between gap-3"><div><h1 className="font-black">Vazirlik topshiriqlari</h1><p className="text-xs text-slate-500">{isPresident ? 'Prezident — barcha vazirliklar' : assignedMinistry} · {session?.user.email}</p></div><div className="flex gap-2"><button onClick={() => void load()} title="Yangilash"><RefreshCw /></button><button onClick={async () => { await supabase.auth.signOut(); setSession(null); setTasks([]); }}><LogOut /></button><button onClick={onClose} aria-label="Yopish"><X /></button></div></div></header><main className="mx-auto max-w-6xl space-y-5 p-4 md:p-6">{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
  {isPresident && <form onSubmit={createTask} className="rounded-3xl bg-white p-5"><h2 className="font-black"><Plus className="mr-2 inline h-4 w-4" />Yangi topshiriq berish</h2><div className="mt-4 grid gap-3 md:grid-cols-2"><label className="text-sm font-semibold">Topshiriq nomi<input required value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full rounded-xl border p-3" /></label><label className="text-sm font-semibold">Vazirlik<select value={ministry} onChange={e => setMinistry(e.target.value)} className="mt-1 w-full rounded-xl border p-3">{ministries.map(m => <option key={m}>{m}</option>)}</select></label><label className="text-sm font-semibold md:col-span-2">Batafsil ma’lumot<textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 w-full rounded-xl border p-3" /></label><label className="text-sm font-semibold">Muddat<input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-1 w-full rounded-xl border p-3" /></label></div><button disabled={busy} className="mt-4 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white">Topshiriq yuborish</button></form>}
  <section className="rounded-3xl bg-white p-5"><h2 className="mb-4 font-black">{isPresident ? 'Barcha topshiriqlar' : 'Sizga biriktirilgan topshiriqlar'} · {tasks.length}</h2>{busy && !tasks.length ? <p>Yuklanmoqda…</p> : tasks.length === 0 ? <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">Hozircha topshiriqlar yo‘q.</p> : <div className="grid gap-4 lg:grid-cols-2">{tasks.map(task => <article key={task.id} className="rounded-2xl border p-4"><div className="flex justify-between gap-3"><div><span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">{task.ministry}</span><h3 className="mt-3 font-bold">{task.title}</h3></div>{isPresident && <button onClick={() => void remove(task)} aria-label="O‘chirish" className="text-red-600"><Trash2 className="h-4 w-4" /></button>}</div>{task.description && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{task.description}</p>}<p className="mt-3 text-xs text-slate-500">Muddat: {task.due_date || 'Belgilanmagan'} · {new Date(task.created_at).toLocaleDateString('uz-UZ')}</p><label className="mt-4 block text-sm font-semibold">Holati<select value={statuses[task.id] || task.status} onChange={e => setStatuses(p => ({ ...p, [task.id]: e.target.value }))} className="mt-1 w-full rounded-xl border p-3"><option value="pending">Yangi</option><option value="in_progress">Jarayonda</option><option value="completed">Bajarildi</option><option value="needs_review">Tekshiruvga yuborildi</option></select></label><label className="mt-3 block text-sm font-semibold">Hisobot / izoh<textarea rows={3} value={reports[task.id] ?? ''} onChange={e => setReports(p => ({ ...p, [task.id]: e.target.value }))} className="mt-1 w-full rounded-xl border p-3" /></label><button disabled={busy} onClick={() => void save(task)} className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Saqlash</button></article>)}</div>}</section></main></div>;
}
