import { useEffect, useMemo, useState } from 'react';
import { supabase, getSiteData, saveSiteData, signInAdmin, signOutAdmin } from '../lib/supabase';
import { LogIn, LogOut, X, Save, Trash2, RefreshCw, ShieldCheck, AlertTriangle } from 'lucide-react';

interface Props { onClose: () => void; }
type Key = 'teachers'|'projects'|'galleryList'|'videoLessons'|'announcements'|'birthdays'|'gpaList';
const keys: { key: Key; label: string }[] = [
  { key:'teachers', label:'O\'qituvchilar' }, { key:'projects', label:'Loyihalar' },
  { key:'galleryList', label:'Galereya' }, { key:'videoLessons', label:'Video darslar' },
  { key:'announcements', label:'E\'lonlar' }, { key:'birthdays', label:'Tug\'ilgan kunlar' }, { key:'gpaList', label:'GPA' },
];
const defaults: Record<Key, any[]> = { teachers:[], projects:[], galleryList:[], videoLessons:[], announcements:[], birthdays:[], gpaList:[] };

export default function CloudAdminPanel({ onClose }: Props) {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const [active, setActive] = useState<Key>('teachers'); const [data, setData] = useState<Record<Key, any[]>>(defaults);
  const [messages, setMessages] = useState<any[]>([]); const [json, setJson] = useState('[]'); const [notice, setNotice] = useState('');

  useEffect(() => { supabase.auth.getSession().then(({ data }) => setSession(data.session)); const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s)); return () => sub.subscription.unsubscribe(); }, []);

  const load = async () => {
    setBusy(true); setError('');
    try {
      const entries = await Promise.all(keys.map(async ({key}) => [key, await getSiteData(key, defaults[key])] as const));
      setData(Object.fromEntries(entries) as Record<Key, any[]>);
      const { data: msgs, error: msgError } = await supabase.from('student_proposals').select('*').order('created_at', { ascending:false });
      if (msgError) throw msgError; setMessages(msgs || []); setJson(JSON.stringify((Object.fromEntries(entries) as any)[active] || [], null, 2));
    } catch (e:any) { setError(e.message || 'Ma\'lumotlarni yuklashda xatolik'); } finally { setBusy(false); }
  };
  useEffect(() => { if (session?.user?.app_metadata?.role === 'admin') load(); }, [session]);
  useEffect(() => { setJson(JSON.stringify(data[active] || [], null, 2)); }, [active, data]);

  const login = async (e: React.FormEvent) => { e.preventDefault(); setBusy(true); setError(''); try { const result = await signInAdmin(email.trim(), password); setSession(result.session); setPassword(''); } catch (e:any) { setError(e.message || 'Kirishda xatolik'); } finally { setBusy(false); } };
  const logout = async () => { await signOutAdmin(); setSession(null); };
  const save = async () => { setBusy(true); setError(''); try { const parsed = JSON.parse(json); if (!Array.isArray(parsed)) throw new Error('JSON massiv bo\'lishi kerak'); await saveSiteData(active, parsed); setData(p => ({...p, [active]: parsed})); setNotice('Saqlandi ✓'); setTimeout(() => setNotice(''), 2500); } catch(e:any) { setError(e.message || 'Saqlashda xatolik'); } finally { setBusy(false); } };
  const deleteMessage = async (id:string) => { if (!confirm('Murojaatni o\'chirasizmi?')) return; const { error } = await supabase.from('student_proposals').delete().eq('id', id); if (error) setError(error.message); else setMessages(p => p.filter(x => x.id !== id)); };
  const validAdmin = session?.user?.app_metadata?.role === 'admin';
  const stats = useMemo(() => keys.map(k => ({...k, count:data[k.key]?.length || 0})), [data]);

  if (!session || !validAdmin) return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-xl p-4"><div className="w-full max-w-md rounded-[32px] bg-white p-7 shadow-2xl"><div className="flex items-center justify-between mb-7"><div><div className="flex items-center gap-2 text-[#0071e3] font-bold"><ShieldCheck className="h-5 w-5"/> Secure Admin</div><h2 className="mt-2 text-2xl font-bold text-slate-900">Admin panel</h2><p className="text-sm text-slate-500 mt-1">Supabase Auth orqali xavfsiz kirish</p></div><button onClick={onClose}><X /></button></div><form onSubmit={login} className="space-y-4"><input type="email" required autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Admin email" className="w-full rounded-2xl border p-3.5 outline-none focus:border-[#0071e3]"/><input type="password" required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Parol" className="w-full rounded-2xl border p-3.5 outline-none focus:border-[#0071e3]"/>{error && <p className="text-sm text-red-600 flex gap-2"><AlertTriangle className="h-4 w-4 shrink-0"/>{error}</p>}<button disabled={busy} className="w-full rounded-2xl bg-[#0071e3] py-3.5 text-white font-semibold disabled:opacity-50">{busy?'Tekshirilmoqda…':'Kirish'} <LogIn className="inline h-4 w-4 ml-1"/></button></form></div></div>;

  return <div className="fixed inset-0 z-[100] bg-slate-100 overflow-auto"><header className="sticky top-0 z-10 bg-white/90 backdrop-blur-xl border-b px-4 py-3"><div className="max-w-7xl mx-auto flex items-center justify-between gap-3"><div><h1 className="font-bold text-slate-900">School Admin</h1><p className="text-xs text-slate-500">{session.user.email}</p></div><div className="flex gap-2"><button onClick={load} className="p-2 rounded-xl bg-slate-100" title="Yangilash"><RefreshCw className={`h-4 w-4 ${busy?'animate-spin':''}`}/></button><button onClick={logout} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 text-white text-sm"><LogOut className="h-4 w-4"/> Chiqish</button><button onClick={onClose} className="p-2"><X/></button></div></div></header><main className="max-w-7xl mx-auto p-4 md:p-6 space-y-5">{error && <div className="rounded-2xl bg-red-50 text-red-700 p-3 text-sm">{error}</div>}{notice && <div className="rounded-2xl bg-green-50 text-green-700 p-3 text-sm">{notice}</div>}<div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">{stats.map(s=><button key={s.key} onClick={()=>setActive(s.key)} className={`rounded-2xl p-3 text-left border ${active===s.key?'border-[#0071e3] bg-blue-50':'bg-white'}`}><div className="text-xs text-slate-500">{s.label}</div><div className="text-xl font-bold">{s.count}</div></button>)}</div><section className="bg-white rounded-3xl p-4 md:p-6 shadow-sm"><div className="flex items-center justify-between mb-3"><div><h2 className="font-bold text-lg">{keys.find(k=>k.key===active)?.label}</h2><p className="text-xs text-slate-500">Ma'lumotlar Supabase PostgreSQL'da saqlanadi.</p></div><button onClick={save} disabled={busy} className="rounded-xl bg-[#0071e3] text-white px-4 py-2 text-sm font-semibold"><Save className="inline h-4 w-4 mr-1"/>Saqlash</button></div><textarea value={json} onChange={e=>setJson(e.target.value)} spellCheck={false} className="w-full min-h-[420px] rounded-2xl bg-slate-950 text-slate-100 p-4 font-mono text-xs outline-none"/></section><section className="bg-white rounded-3xl p-4 md:p-6 shadow-sm"><h2 className="font-bold text-lg mb-1">Murojaatlar</h2><p className="text-xs text-slate-500 mb-4">Faqat admin ko\'ra oladi.</p><div className="space-y-2">{messages.length===0?<p className="text-sm text-slate-400">Murojaatlar yo\'q.</p>:messages.map(m=><div key={m.id} className="rounded-2xl border p-4 flex gap-3 justify-between"><div><div className="font-semibold text-sm">{m.full_name}</div><div className="text-sm mt-1">{m.description}</div><div className="text-xs text-slate-400 mt-2">{m.created_at}</div></div><button onClick={()=>deleteMessage(m.id)} className="text-red-500 p-2"><Trash2 className="h-4 w-4"/></button></div>)}</div></section></main></div>;
}
