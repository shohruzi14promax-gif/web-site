import { useEffect, useMemo, useState } from 'react';
import { supabase, getSiteData, saveSiteData, signInAdmin, signOutAdmin } from '../lib/supabase';
import { LogIn, LogOut, X, Save, Trash2, RefreshCw, ShieldCheck, AlertTriangle, Upload, Image as ImageIcon, Pencil } from 'lucide-react';

interface Props { onClose: () => void; }
type Key = 'teachers'|'projects'|'galleryList'|'videoLessons'|'announcements'|'birthdays'|'gpaList';
interface GalleryItem { id: number; title: string; date: string; description: string; image: string; }
const keys: { key: Key; label: string }[] = [
  { key:'teachers', label:'O\'qituvchilar' }, { key:'projects', label:'Loyihalar' },
  { key:'galleryList', label:'Galereya' }, { key:'videoLessons', label:'Video darslar' },
  { key:'announcements', label:'E\'lonlar' }, { key:'birthdays', label:'Tug\'ilgan kunlar' }, { key:'gpaList', label:'GPA' },
];
const defaults: Record<Key, any[]> = { teachers:[], projects:[], galleryList:[], videoLessons:[], announcements:[], birthdays:[], gpaList:[] };

function createId() { return Date.now() + Math.floor(Math.random() * 1000); }

async function compressImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Faqat rasm faylini tanlang.');
  if (file.size > 10 * 1024 * 1024) throw new Error('Rasm 10 MB dan kichik bo\'lishi kerak.');
  const bitmap = await createImageBitmap(file);
  const maxSize = 1600;
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Rasmni qayta ishlashda xatolik.');
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.78);
}

export default function CloudAdminPanel({ onClose }: Props) {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const [active, setActive] = useState<Key>('teachers'); const [data, setData] = useState<Record<Key, any[]>>(defaults);
  const [messages, setMessages] = useState<any[]>([]); const [json, setJson] = useState('[]'); const [notice, setNotice] = useState('');
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryDate, setGalleryDate] = useState(new Date().toISOString().slice(0,10));
  const [galleryDescription, setGalleryDescription] = useState('');
  const [galleryImage, setGalleryImage] = useState('');
  const [editingGalleryId, setEditingGalleryId] = useState<number | null>(null);

  useEffect(() => { supabase.auth.getSession().then(({ data }) => setSession(data.session)); const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s)); return () => sub.subscription.unsubscribe(); }, []);

  const load = async () => {
    setBusy(true); setError('');
    try {
      const entries = await Promise.all(keys.map(async ({key}) => [key, await getSiteData(key, defaults[key])] as const));
      const next = Object.fromEntries(entries) as Record<Key, any[]>;
      setData(next);
      const { data: msgs, error: msgError } = await supabase.from('student_proposals').select('*').order('created_at', { ascending:false });
      if (msgError) throw msgError; setMessages(msgs || []); setJson(JSON.stringify(next[active] || [], null, 2));
    } catch (e:any) { setError(e.message || 'Ma\'lumotlarni yuklashda xatolik'); } finally { setBusy(false); }
  };
  useEffect(() => { if (session?.user?.app_metadata?.role === 'admin') load(); }, [session]);
  useEffect(() => { if (active !== 'galleryList') setJson(JSON.stringify(data[active] || [], null, 2)); }, [active, data]);

  const login = async (e: React.FormEvent) => { e.preventDefault(); setBusy(true); setError(''); try { const result = await signInAdmin(email.trim(), password); setSession(result.session); setPassword(''); } catch (e:any) { setError(e.message || 'Kirishda xatolik'); } finally { setBusy(false); } };
  const logout = async () => { await signOutAdmin(); setSession(null); };
  const save = async () => { setBusy(true); setError(''); try { const parsed = JSON.parse(json); if (!Array.isArray(parsed)) throw new Error('JSON massiv bo\'lishi kerak'); await saveSiteData(active, parsed); setData(p => ({...p, [active]: parsed})); setNotice('Saqlandi ✓'); setTimeout(() => setNotice(''), 2500); } catch(e:any) { setError(e.message || 'Saqlashda xatolik'); } finally { setBusy(false); } };
  const deleteMessage = async (id:string) => { if (!confirm('Murojaatni o\'chirasizmi?')) return; const { error } = await supabase.from('student_proposals').delete().eq('id', id); if (error) setError(error.message); else setMessages(p => p.filter(x => x.id !== id)); };

  const resetGalleryForm = () => { setGalleryTitle(''); setGalleryDate(new Date().toISOString().slice(0,10)); setGalleryDescription(''); setGalleryImage(''); setEditingGalleryId(null); };

  const handleGalleryFile = async (file?: File) => {
    if (!file) return;
    setBusy(true); setError('');
    try { setGalleryImage(await compressImage(file)); }
    catch (e:any) { setError(e.message || 'Rasmni yuklashda xatolik'); }
    finally { setBusy(false); }
  };

  const saveGalleryItem = async () => {
    if (!galleryTitle.trim()) { setError('Galereya sarlavhasini kiriting.'); return; }
    if (!galleryImage && editingGalleryId === null) { setError('Rasm tanlang.'); return; }
    setBusy(true); setError('');
    try {
      const current = [...((data.galleryList || []) as GalleryItem[])];
      const item: GalleryItem = { id: editingGalleryId ?? createId(), title: galleryTitle.trim(), date: galleryDate, description: galleryDescription.trim(), image: galleryImage };
      const next = editingGalleryId === null ? [...current, item] : current.map(x => x.id === editingGalleryId ? { ...x, ...item, image: galleryImage || x.image } : x);
      await saveSiteData('galleryList', next);
      setData(p => ({ ...p, galleryList: next }));
      resetGalleryForm(); setNotice('Rasm galereyaga qo\'shildi ✓'); setTimeout(() => setNotice(''), 2500);
    } catch (e:any) { setError(e.message || 'Galereyani saqlashda xatolik'); }
    finally { setBusy(false); }
  };

  const editGalleryItem = (item: GalleryItem) => { setEditingGalleryId(item.id); setGalleryTitle(item.title || ''); setGalleryDate(item.date || ''); setGalleryDescription(item.description || ''); setGalleryImage(item.image || ''); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const deleteGalleryItem = async (id: number) => {
    if (!confirm('Bu rasmni galereyadan o\'chirasizmi?')) return;
    setBusy(true); setError('');
    try { const next = (data.galleryList || []).filter((x: GalleryItem) => x.id !== id); await saveSiteData('galleryList', next); setData(p => ({ ...p, galleryList: next })); setNotice('Rasm o\'chirildi ✓'); setTimeout(() => setNotice(''), 2500); }
    catch (e:any) { setError(e.message || 'O\'chirishda xatolik'); }
    finally { setBusy(false); }
  };

  const validAdmin = session?.user?.app_metadata?.role === 'admin';
  const stats = useMemo(() => keys.map(k => ({...k, count:data[k.key]?.length || 0})), [data]);

  if (!session || !validAdmin) return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-xl p-4"><div className="w-full max-w-md rounded-[32px] bg-white p-7 shadow-2xl"><div className="flex items-center justify-between mb-7"><div><div className="flex items-center gap-2 text-[#0071e3] font-bold"><ShieldCheck className="h-5 w-5"/> Secure Admin</div><h2 className="mt-2 text-2xl font-bold text-slate-900">Admin panel</h2><p className="text-sm text-slate-500 mt-1">Supabase Auth orqali xavfsiz kirish</p></div><button onClick={onClose}><X /></button></div><form onSubmit={login} className="space-y-4"><input type="email" required autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Admin email" className="w-full rounded-2xl border p-3.5 outline-none focus:border-[#0071e3]"/><input type="password" required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Parol" className="w-full rounded-2xl border p-3.5 outline-none focus:border-[#0071e3]"/>{error && <p className="text-sm text-red-600 flex gap-2"><AlertTriangle className="h-4 w-4 shrink-0"/>{error}</p>}<button disabled={busy} className="w-full rounded-2xl bg-[#0071e3] py-3.5 text-white font-semibold disabled:opacity-50">{busy?'Tekshirilmoqda…':'Kirish'} <LogIn className="inline h-4 w-4 ml-1"/></button></form></div></div>;

  return <div className="fixed inset-0 z-[100] bg-slate-100 overflow-auto"><header className="sticky top-0 z-10 bg-white/90 backdrop-blur-xl border-b px-4 py-3"><div className="max-w-7xl mx-auto flex items-center justify-between gap-3"><div><h1 className="font-bold text-slate-900">School Admin</h1><p className="text-xs text-slate-500">{session.user.email}</p></div><div className="flex gap-2"><button onClick={load} className="p-2 rounded-xl bg-slate-100" title="Yangilash"><RefreshCw className={`h-4 w-4 ${busy?'animate-spin':''}`}/></button><button onClick={logout} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 text-white text-sm"><LogOut className="h-4 w-4"/> Chiqish</button><button onClick={onClose} className="p-2"><X/></button></div></div></header><main className="max-w-7xl mx-auto p-4 md:p-6 space-y-5">{error && <div className="rounded-2xl bg-red-50 text-red-700 p-3 text-sm">{error}</div>}{notice && <div className="rounded-2xl bg-green-50 text-green-700 p-3 text-sm">{notice}</div>}<div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">{stats.map(s=><button key={s.key} onClick={()=>{setActive(s.key); if(s.key!=='galleryList') setJson(JSON.stringify(data[s.key] || [], null, 2));}} className={`rounded-2xl p-3 text-left border ${active===s.key?'border-[#0071e3] bg-blue-50':'bg-white'}`}><div className="text-xs text-slate-500">{s.label}</div><div className="text-xl font-bold">{s.count}</div></button>)}</div>

{active === 'galleryList' ? <section className="space-y-5"><div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm"><div className="flex items-center justify-between mb-4"><div><h2 className="font-bold text-lg">{editingGalleryId ? 'Rasmni tahrirlash' : 'Galereyaga rasm qo\'shish'}</h2><p className="text-xs text-slate-500">Rasm Supabase PostgreSQL'dagi galereya ma'lumotlariga saqlanadi.</p></div>{editingGalleryId && <button onClick={resetGalleryForm} className="text-sm text-slate-500">Bekor qilish</button>}</div><div className="grid md:grid-cols-2 gap-4"><input value={galleryTitle} onChange={e=>setGalleryTitle(e.target.value)} placeholder="Rasm sarlavhasi" className="w-full rounded-2xl border p-3.5 outline-none focus:border-[#0071e3]"/><input type="date" value={galleryDate} onChange={e=>setGalleryDate(e.target.value)} className="w-full rounded-2xl border p-3.5 outline-none focus:border-[#0071e3]"/></div><textarea value={galleryDescription} onChange={e=>setGalleryDescription(e.target.value)} placeholder="Tavsif (ixtiyoriy)" rows={3} className="w-full rounded-2xl border p-3.5 mt-4 outline-none focus:border-[#0071e3]"/><div className="mt-4 flex flex-col md:flex-row gap-4 md:items-center md:justify-between"><label className="inline-flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-3 text-sm font-semibold cursor-pointer hover:bg-slate-100"><Upload className="h-4 w-4"/> {galleryImage ? 'Boshqa rasm tanlash' : 'Rasm tanlash'}<input type="file" accept="image/*" className="hidden" onChange={e=>handleGalleryFile(e.target.files?.[0])}/></label>{galleryImage && <img src={galleryImage} alt="Preview" className="h-20 w-28 rounded-xl object-cover border"/>}<button onClick={saveGalleryItem} disabled={busy} className="rounded-2xl bg-[#0071e3] text-white px-5 py-3 text-sm font-semibold disabled:opacity-50">{busy?'Saqlanmoqda…':editingGalleryId?'Saqlash':'Rasmni qo\'shish'}</button></div></div><div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm"><div className="flex items-center gap-2 mb-4"><ImageIcon className="h-5 w-5 text-[#0071e3]"/><h2 className="font-bold text-lg">Galereya ({data.galleryList?.length || 0})</h2></div>{data.galleryList?.length ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{(data.galleryList as GalleryItem[]).map(item=><article key={item.id} className="overflow-hidden rounded-2xl border bg-white"><div className="aspect-[4/3] bg-slate-100">{item.image ? <img src={item.image} alt={item.title} className="w-full h-full object-cover"/> : <div className="h-full flex items-center justify-center text-slate-400"><ImageIcon/></div>}</div><div className="p-4"><div className="flex items-start justify-between gap-2"><div><h3 className="font-semibold text-sm">{item.title}</h3><p className="text-xs text-slate-400 mt-1">{item.date}</p></div><div className="flex gap-1"><button onClick={()=>editGalleryItem(item)} className="p-2 text-slate-400 hover:text-[#0071e3]"><Pencil className="h-4 w-4"/></button><button onClick={()=>deleteGalleryItem(item.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4"/></button></div></div>{item.description && <p className="text-xs text-slate-500 mt-3 line-clamp-3">{item.description}</p>}</div></article>)}</div> : <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-400">Hozircha rasm yo\'q. Yuqoridagi <b>Rasm tanlash</b> tugmasidan boshlang.</div>}</div></section> : <><section className="bg-white rounded-3xl p-4 md:p-6 shadow-sm"><div className="flex items-center justify-between mb-3"><div><h2 className="font-bold text-lg">{keys.find(k=>k.key===active)?.label}</h2><p className="text-xs text-slate-500">Ma'lumotlar Supabase PostgreSQL'da saqlanadi.</p></div><button onClick={save} disabled={busy} className="rounded-xl bg-[#0071e3] text-white px-4 py-2 text-sm font-semibold"><Save className="inline h-4 w-4 mr-1"/>Saqlash</button></div><textarea value={json} onChange={e=>setJson(e.target.value)} spellCheck={false} className="w-full min-h-[420px] rounded-2xl bg-slate-950 text-slate-100 p-4 font-mono text-xs outline-none"/></section><section className="bg-white rounded-3xl p-4 md:p-6 shadow-sm"><h2 className="font-bold text-lg mb-1">Murojaatlar</h2><p className="text-xs text-slate-500 mb-4">Faqat admin ko\'ra oladi.</p><div className="space-y-2">{messages.length===0?<p className="text-sm text-slate-400">Murojaatlar yo\'q.</p>:messages.map(m=><div key={m.id} className="rounded-2xl border p-4 flex gap-3 justify-between"><div><div className="font-semibold text-sm">{m.full_name}</div><div className="text-sm mt-1">{m.description}</div><div className="text-xs text-slate-400 mt-2">{m.created_at}</div></div><button onClick={()=>deleteMessage(m.id)} className="text-red-500 p-2"><Trash2 className="h-4 w-4"/></button></div>)}</div></section></>}</main></div>;
}
