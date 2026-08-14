import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BedDouble,
  ChevronDown,
  ChevronUp,
  Coins,
  LayoutDashboard,
  LogIn,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import SchoolCoinSecure from './SchoolCoinSecure';
import { getSiteData, saveSiteData, signInAdmin, signOutAdmin, supabase } from '../lib/supabase';

interface Props { onClose: () => void; }

type Key = 'teachers' | 'projects' | 'galleryList' | 'videoLessons' | 'announcements' | 'birthdays' | 'gpaList';
type RecordItem = Record<string, string | number | undefined> & { id?: string | number };
type SchoolLife = {
  dormitory: { title: string; description: string; image?: string; features: string[] };
  meals: { title: string; description: string; menu: Array<{ id?: string | number; name: string; time: string; description?: string }> };
  routine: { title: string; description: string; items: Array<{ id?: string | number; time: string; activity: string; description?: string }> };
};

const keys: Array<{ key: Key; label: string }> = [
  { key: 'teachers', label: "O'qituvchilar" },
  { key: 'projects', label: 'Loyihalar' },
  { key: 'galleryList', label: 'Galereya' },
  { key: 'videoLessons', label: 'Video darslar' },
  { key: 'announcements', label: "E'lonlar" },
  { key: 'birthdays', label: "Tug'ilgan kunlar" },
  { key: 'gpaList', label: 'GPA' },
];

const defaults: Record<Key, RecordItem[]> = {
  teachers: [], projects: [], galleryList: [], videoLessons: [], announcements: [], birthdays: [], gpaList: [],
};

const fieldMap: Record<Key, Array<{ key: string; label: string; type?: 'text' | 'date' | 'number' | 'url' | 'textarea' | 'image'; placeholder?: string; required?: boolean }>> = {
  teachers: [
    { key: 'name', label: 'Ism-familiya', required: true },
    { key: 'subject', label: 'Fan', required: true },
    { key: 'role', label: 'Lavozim' },
    { key: 'experience', label: 'Tajriba' },
    { key: 'classes', label: 'Sinflar' },
    { key: 'category', label: 'Toifa' },
    { key: 'bio', label: 'Qisqacha ma’lumot', type: 'textarea' },
    { key: 'image', label: 'Rasm', type: 'image' },
  ],
  projects: [
    { key: 'title', label: 'Loyiha nomi', required: true },
    { key: 'date', label: 'Sana', type: 'date' },
    { key: 'description', label: 'Tavsif', type: 'textarea' },
    { key: 'image', label: 'Rasm', type: 'image' },
  ],
  galleryList: [
    { key: 'title', label: 'Rasm nomi', required: true },
    { key: 'date', label: 'Sana', type: 'date' },
    { key: 'description', label: 'Tavsif', type: 'textarea' },
    { key: 'image', label: 'Rasm', type: 'image' },
  ],
  videoLessons: [
    { key: 'title', label: 'Video nomi', required: true },
    { key: 'url', label: 'Video havolasi', type: 'url', required: true },
    { key: 'description', label: 'Tavsif', type: 'textarea' },
    { key: 'image', label: 'Muqova rasmi', type: 'image' },
  ],
  announcements: [
    { key: 'title', label: 'E’lon sarlavhasi', required: true },
    { key: 'date', label: 'Sana', type: 'date' },
    { key: 'description', label: 'Matn', type: 'textarea' },
    { key: 'image', label: 'Rasm', type: 'image' },
  ],
  birthdays: [
    { key: 'name', label: 'Ism-familiya', required: true },
    { key: 'date', label: 'Tug‘ilgan sana', type: 'date', required: true },
    { key: 'class', label: 'Sinf / lavozim' },
    { key: 'image', label: 'Rasm', type: 'image' },
  ],
  gpaList: [
    { key: 'name', label: 'O‘quvchi', required: true },
    { key: 'class', label: 'Sinf' },
    { key: 'gpa', label: 'GPA', type: 'number', required: true },
  ],
};

const emptySchoolLife: SchoolLife = {
  dormitory: { title: 'Yotoqxona', description: '', image: '', features: [] },
  meals: { title: 'Ovqatlanish', description: '', menu: [] },
  routine: { title: 'Kun tartibi', description: '', items: [] },
};

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

async function compressImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Faqat rasm faylini tanlang.');
  if (file.size > 10 * 1024 * 1024) throw new Error('Rasm 10 MB dan kichik bo‘lishi kerak.');
  const bitmap = await createImageBitmap(file);
  const maxSize = 1600;
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d');
  if (!context) { bitmap.close(); throw new Error('Rasmni qayta ishlashda xatolik.'); }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.78);
}

export default function CloudAdminPanelPro({ onClose }: Props) {
  const [session, setSession] = useState<{ user?: { email?: string; app_metadata?: { role?: string } } } | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [active, setActive] = useState<Key>('teachers');
  const [dashboard, setDashboard] = useState(true);
  const [data, setData] = useState<Record<Key, RecordItem[]>>(defaults);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [form, setForm] = useState<Record<string, string | number>>({});
  const [messages, setMessages] = useState<RecordItem[]>([]);
  const [schoolLife, setSchoolLife] = useState<SchoolLife>(emptySchoolLife);
  const [mealForm, setMealForm] = useState({ name: '', time: '', description: '' });
  const [mealEditingId, setMealEditingId] = useState<string | number | null>(null);
  const [routineForm, setRoutineForm] = useState({ time: '', activity: '', description: '' });
  const [routineEditingId, setRoutineEditingId] = useState<string | number | null>(null);
  const [featureInput, setFeatureInput] = useState('');
  const [schoolCoinOpen, setSchoolCoinOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const admin = session?.user?.app_metadata?.role === 'admin';
  const fields = fieldMap[active];
  const stats = useMemo(() => keys.map(item => ({ ...item, count: data[item.key]?.length || 0 })), [data]);

  const resetForm = () => {
    const next: Record<string, string | number> = {};
    for (const field of fields) {
      next[field.key] = field.type === 'date' ? new Date().toISOString().slice(0, 10) : '';
    }
    setForm(next);
    setEditingId(null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: authData }) => setSession(authData.session as typeof session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next as typeof session));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => { resetForm(); }, [active]);

  const load = async () => {
    if (!admin) return;
    setBusy(true); setError('');
    try {
      const entries = await Promise.all(keys.map(async item => [item.key, await getSiteData(item.key, defaults[item.key])] as const));
      setData(Object.fromEntries(entries) as Record<Key, RecordItem[]>);
      const schoolData = await getSiteData('schoolLife', emptySchoolLife);
      setSchoolLife(schoolData || emptySchoolLife);
      const { data: proposalData, error: proposalError } = await supabase.from('student_proposals').select('*').order('created_at', { ascending: false });
      if (proposalError) throw proposalError;
      setMessages((proposalData || []) as RecordItem[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ma’lumotlar yuklanmadi');
    } finally { setBusy(false); }
  };

  useEffect(() => { if (admin) void load(); }, [admin]);

  const login = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const result = await signInAdmin(email.trim(), password);
      setSession(result.session as typeof session); setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kirishda xatolik');
    } finally { setBusy(false); }
  };

  const logout = async () => { await signOutAdmin(); setSession(null); setPassword(''); };

  const saveItem = async () => {
    for (const field of fields) {
      if (field.required && !String(form[field.key] ?? '').trim()) { setError(`${field.label} maydoni majburiy.`); return; }
      if (field.type === 'url' && form[field.key] && !/^https?:\\/\\//i.test(String(form[field.key]))) { setError(`${field.label} http:// yoki https:// bilan boshlansin.`); return; }
    }
    if (active === 'gpaList' && form.gpa !== '' && (Number(form.gpa) < 0 || Number(form.gpa) > 5)) { setError('GPA 0 dan 5 gacha bo‘lishi kerak.'); return; }
    setBusy(true); setError('');
    try {
      const current = [...data[active]];
      const item: RecordItem = { ...form, id: editingId ?? newId() };
      if (active === 'gpaList' && form.gpa !== '') item.gpa = Number(form.gpa);
      const next = editingId === null ? [...current, item] : current.map(entry => String(entry.id) === String(editingId) ? { ...entry, ...item } : entry);
      await saveSiteData(active, next);
      setData(prev => ({ ...prev, [active]: next })); resetForm(); setNotice('Saqlandi ✓'); window.setTimeout(() => setNotice(''), 2000);
    } catch (err) { setError(err instanceof Error ? err.message : 'Saqlashda xatolik'); }
    finally { setBusy(false); }
  };

  const deleteItem = async (id: string | number) => {
    if (!window.confirm('Bu ma’lumotni o‘chirasizmi?')) return;
    setBusy(true); setError('');
    try {
      const next = data[active].filter(entry => String(entry.id) !== String(id));
      await saveSiteData(active, next); setData(prev => ({ ...prev, [active]: next })); setNotice('O‘chirildi ✓'); window.setTimeout(() => setNotice(''), 2000);
    } catch (err) { setError(err instanceof Error ? err.message : 'O‘chirishda xatolik'); }
    finally { setBusy(false); }
  };

  const editItem = (item: RecordItem) => {
    const next: Record<string, string | number> = {};
    for (const field of fields) next[field.key] = item[field.key] === undefined ? '' : (item[field.key] as string | number);
    setForm(next); setEditingId(item.id ?? null); setDashboard(false); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImage = async (file?: File) => {
    if (!file) return; setBusy(true); setError('');
    try { setForm(prev => ({ ...prev, image: await compressImage(file) })); }
    catch (err) { setError(err instanceof Error ? err.message : 'Rasmni yuklashda xatolik'); }
    finally { setBusy(false); }
  };

  const saveSchoolLife = async () => {
    setBusy(true); setError('');
    try { await saveSiteData('schoolLife', schoolLife); setNotice('Maktab hayoti saqlandi ✓'); window.setTimeout(() => setNotice(''), 2200); }
    catch (err) { setError(err instanceof Error ? err.message : 'Maktab hayotini saqlashda xatolik'); }
    finally { setBusy(false); }
  };

  const resetDormitory = () => {
    if (!window.confirm('Yotoqxona ma’lumotlarini tozalaysizmi?')) return;
    setSchoolLife(prev => ({ ...prev, dormitory: { ...emptySchoolLife.dormitory } }));
  };

  const addFeature = () => {
    const value = featureInput.trim(); if (!value) return;
    setSchoolLife(prev => ({ ...prev, dormitory: { ...prev.dormitory, features: [...prev.dormitory.features, value] } })); setFeatureInput('');
  };

  const saveMeal = () => {
    if (!mealForm.name.trim() || !mealForm.time.trim()) { setError('Ovqat nomi va vaqtini kiriting.'); return; }
    const item = { ...mealForm, id: mealEditingId ?? newId() };
    setSchoolLife(prev => ({ ...prev, meals: { ...prev.meals, menu: mealEditingId === null ? [...prev.meals.menu, item] : prev.meals.menu.map(entry => String(entry.id) === String(mealEditingId) ? item : entry) } }));
    setMealForm({ name: '', time: '', description: '' }); setMealEditingId(null);
  };

  const editMeal = (item: SchoolLife['meals']['menu'][number]) => { setMealForm({ name: item.name, time: item.time, description: item.description || '' }); setMealEditingId(item.id ?? null); };
  const deleteMeal = (id: string | number | undefined) => setSchoolLife(prev => ({ ...prev, meals: { ...prev.meals, menu: prev.meals.menu.filter((_, index) => String((_.id ?? index)) !== String(id ?? index)) } }));

  const saveRoutine = () => {
    if (!routineForm.time.trim() || !routineForm.activity.trim()) { setError('Kun tartibi uchun vaqt va faoliyatni kiriting.'); return; }
    const item = { ...routineForm, id: routineEditingId ?? newId() };
    setSchoolLife(prev => ({ ...prev, routine: { ...prev.routine, items: routineEditingId === null ? [...prev.routine.items, item] : prev.routine.items.map(entry => String(entry.id) === String(routineEditingId) ? item : entry) } }));
    setRoutineForm({ time: '', activity: '', description: '' }); setRoutineEditingId(null);
  };

  const editRoutine = (item: SchoolLife['routine']['items'][number]) => { setRoutineForm({ time: item.time, activity: item.activity, description: item.description || '' }); setRoutineEditingId(item.id ?? null); };
  const deleteRoutine = (id: string | number | undefined, index: number) => setSchoolLife(prev => ({ ...prev, routine: { ...prev.routine, items: prev.routine.items.filter((entry, entryIndex) => String(entry.id ?? entryIndex) !== String(id ?? index)) } }));
  const moveRoutine = (index: number, direction: -1 | 1) => setSchoolLife(prev => { const next = [...prev.routine.items]; const target = index + direction; if (target < 0 || target >= next.length) return prev; [next[index], next[target]] = [next[target], next[index]]; return { ...prev, routine: { ...prev.routine, items: next } }; });

  const deleteProposal = async (id: string | number) => {
    if (!window.confirm('Murojaatni o‘chirasizmi?')) return;
    setBusy(true); setError('');
    try { const { error: proposalError } = await supabase.from('student_proposals').delete().eq('id', id); if (proposalError) throw proposalError; setMessages(prev => prev.filter(item => String(item.id) !== String(id))); }
    catch (err) { setError(err instanceof Error ? err.message : 'Murojaatni o‘chirishda xatolik'); }
    finally { setBusy(false); }
  };

  if (!session || !admin) {
    return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xl"><div className="w-full max-w-md rounded-[28px] bg-white p-7 shadow-2xl"><div className="mb-7 flex items-center justify-between"><div><div className="flex items-center gap-2 font-bold text-[#0071e3]"><ShieldCheck className="h-5 w-5" /> Secure Admin</div><h2 className="mt-2 text-2xl font-black">School Admin</h2><p className="mt-1 text-sm text-slate-500">Supabase Auth orqali admin kirishi</p></div><button type="button" onClick={onClose} aria-label="Yopish"><X /></button></div><form onSubmit={login} className="space-y-4"><label className="block text-sm font-semibold">Email<input type="email" required autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} className="mt-1 w-full rounded-2xl border p-3.5" /></label><label className="block text-sm font-semibold">Parol<input type="password" required autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} className="mt-1 w-full rounded-2xl border p-3.5" /></label>{error && <p role="alert" className="flex gap-2 text-sm text-red-600"><AlertTriangle className="h-4 w-4 shrink-0" />{error}</p>}<button disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0071e3] py-3.5 font-semibold text-white disabled:opacity-50"><LogIn className="h-4 w-4" />{busy ? 'Tekshirilmoqda…' : 'Kirish'}</button></form></div></div>;
  }

  return <div className="fixed inset-0 z-[100] overflow-auto bg-slate-100"><header className="sticky top-0 z-30 border-b bg-white/95 px-4 py-3 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3"><div><h1 className="font-black">School Admin</h1><p className="text-xs text-slate-500">{session.user?.email}</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setSchoolCoinOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700"><Coins className="h-4 w-4" /> SchoolCoin</button><button type="button" onClick={() => void load()} disabled={busy} className="rounded-xl bg-slate-100 p-2" title="Yangilash" aria-label="Yangilash"><RefreshCw className={busy ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} /></button><button type="button" onClick={() => void logout()} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white"><LogOut className="h-4 w-4" /> Chiqish</button><button type="button" onClick={onClose} className="rounded-xl p-2" aria-label="Yopish"><X /></button></div></div></header>

  <main className="mx-auto max-w-7xl p-4 md:p-6">
    {error && <div role="alert" className="mb-5 flex items-start gap-2 rounded-2xl bg-red-50 p-3 text-sm text-red-700"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
    {notice && <div role="status" className="mb-5 rounded-2xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{notice}</div>}

    <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
      <button type="button" onClick={() => setDashboard(true)} className={`rounded-2xl border p-3 text-left ${dashboard ? 'border-[#0071e3] bg-blue-50' : 'bg-white'}`}><LayoutDashboard className="h-4 w-4" /><div className="mt-2 text-xs text-slate-500">Dashboard</div><div className="text-xl font-black">{stats.reduce((sum, item) => sum + item.count, 0)}</div></button>
      {stats.map(item => <button type="button" key={item.key} onClick={() => { setActive(item.key); setDashboard(false); }} className={`rounded-2xl border p-3 text-left ${!dashboard && active === item.key ? 'border-[#0071e3] bg-blue-50' : 'bg-white'}`}><div className="text-xs text-slate-500">{item.label}</div><div className="text-xl font-black">{item.count}</div></button>)}
      <button type="button" onClick={() => { setDashboard(false); setActive('teachers'); window.setTimeout(() => document.getElementById('school-life')?.scrollIntoView({ behavior: 'smooth' }), 0); }} className="rounded-2xl border bg-white p-3 text-left"><BedDouble className="h-4 w-4 text-[#0071e3]" /><div className="mt-2 text-xs text-slate-500">Maktab hayoti</div><div className="text-sm font-black">Live data</div></button>
    </div>

    {dashboard ? <section className="space-y-5"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{stats.slice(0, 4).map(item => <button type="button" key={item.key} onClick={() => { setActive(item.key); setDashboard(false); }} className="rounded-3xl bg-white p-5 text-left shadow-sm"><p className="text-xs text-slate-500">{item.label}</p><p className="mt-2 text-3xl font-black">{item.count}</p><p className="mt-1 text-xs text-slate-400">Supabase site_data</p></button>)}</div><section className="rounded-3xl bg-white p-5 shadow-sm"><h2 className="text-lg font-black">Murojaatlar · {messages.length}</h2><div className="mt-4 space-y-2">{messages.slice(0, 5).map(item => <div key={String(item.id)} className="flex items-start justify-between gap-3 rounded-2xl bg-slate-50 p-3"><div><p className="font-semibold">{String(item.full_name || item.name || 'Murojaat')}</p><p className="text-sm text-slate-600">{String(item.description || item.message || '')}</p></div><button type="button" onClick={() => void deleteProposal(item.id as string | number)} className="rounded-xl p-2 text-red-600" aria-label="Murojaatni o‘chirish"><Trash2 className="h-4 w-4" /></button></div>)}</div></section></section> : <section className="space-y-5">
      <section className="rounded-3xl bg-white p-4 shadow-sm md:p-6"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-black">{editingId === null ? `${keys.find(item => item.key === active)?.label} qo‘shish` : 'Tahrirlash'}</h2><p className="mt-1 text-xs text-slate-500">Create / Read / Update / Delete</p></div><button type="button" onClick={resetForm} className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"><Plus className="h-4 w-4" /> Yangi</button></div><div className="grid gap-4 md:grid-cols-2">{fields.map(field => field.type === 'textarea' ? <label key={field.key} className="md:col-span-2 text-sm font-semibold">{field.label}<textarea value={String(form[field.key] ?? '')} onChange={event => setForm(prev => ({ ...prev, [field.key]: event.target.value }))} rows={4} className="mt-1 w-full rounded-2xl border p-3.5" /></label> : field.type === 'image' ? <div key={field.key} className="md:col-span-2"><p className="text-sm font-semibold">{field.label}</p><label className="mt-1 inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-dashed bg-slate-50 px-4 py-3 text-sm"><Upload className="h-4 w-4" />{form.image ? 'Boshqa rasm tanlash' : 'Rasm tanlash'}<input type="file" accept="image/*" className="hidden" onChange={event => void handleImage(event.target.files?.[0])} /></label>{form.image && <img src={String(form.image)} alt="Tanlangan rasm" loading="lazy" className="mt-3 h-28 w-40 rounded-xl border object-cover" />}</div> : <label key={field.key} className="text-sm font-semibold">{field.label}{field.required && <span className="text-red-500"> *</span>}<input type={field.type || 'text'} required={field.required} inputMode={field.type === 'number' ? 'decimal' : undefined} value={String(form[field.key] ?? '')} onChange={event => setForm(prev => ({ ...prev, [field.key]: field.type === 'number' ? (event.target.value === '' ? '' : Number(event.target.value)) : event.target.value }))} className="mt-1 w-full rounded-2xl border p-3.5" placeholder={field.placeholder} /></label>)}</div><div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={() => void saveItem()} disabled={busy} className="inline-flex items-center gap-2 rounded-2xl bg-[#0071e3] px-5 py-3 font-semibold text-white disabled:opacity-50"><Save className="h-4 w-4" />{busy ? 'Saqlanmoqda…' : 'Saqlash'}</button>{editingId !== null && <button type="button" onClick={resetForm} className="rounded-2xl border px-5 py-3">Bekor qilish</button>}</div></section>

      <section className="rounded-3xl bg-white p-4 shadow-sm md:p-6"><h3 className="font-black">{keys.find(item => item.key === active)?.label} · {data[active].length}</h3>{data[active].length ? <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{data[active].map(item => <article key={String(item.id)} className="overflow-hidden rounded-2xl border bg-white">{item.image && <img src={String(item.image)} alt={String(item.title || item.name || 'Rasm')} loading="lazy" className="h-40 w-full object-cover" /> }<div className="p-4"><h4 className="font-bold">{String(item.title || item.name || item.student || 'Ma’lumot')}</h4><p className="mt-1 line-clamp-3 text-sm text-slate-500">{String(item.description || item.bio || item.subject || (item.gpa !== undefined ? `GPA: ${item.gpa}` : '') || item.url || '')}</p><div className="mt-4 flex gap-2"><button type="button" onClick={() => editItem(item)} className="inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-sm"><Pencil className="h-4 w-4" /> Tahrirlash</button><button type="button" disabled={busy} onClick={() => void deleteItem(item.id as string | number)} className="inline-flex items-center gap-1 rounded-xl border border-red-100 px-3 py-2 text-sm text-red-600 disabled:opacity-50"><Trash2 className="h-4 w-4" /> O‘chirish</button></div></div></article>)}</div> : <p className="py-12 text-center text-sm text-slate-500">Hozircha ma’lumot yo‘q.</p>}</section>

      <section id="school-life" className="space-y-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-2xl font-black">🏫 Maktab hayoti</h2><p className="text-sm text-slate-500">Cloud Admin ichida bevosita boshqariladi.</p></div><button type="button" onClick={() => void saveSchoolLife()} disabled={busy} className="inline-flex items-center gap-2 rounded-2xl bg-[#0071e3] px-5 py-3 font-semibold text-white disabled:opacity-50"><Save className="h-4 w-4" />Saqlash</button></div>
        <article className="rounded-3xl bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between gap-3"><h3 className="text-lg font-black">🛏️ Yotoqxona</h3><button type="button" onClick={resetDormitory} className="rounded-xl border border-red-100 px-3 py-2 text-xs font-semibold text-red-600">Tozalash</button></div><div className="grid gap-3 md:grid-cols-2"><label className="text-sm font-semibold">Title<input value={schoolLife.dormitory.title} onChange={event => setSchoolLife(prev => ({ ...prev, dormitory: { ...prev.dormitory, title: event.target.value } }))} className="mt-1 w-full rounded-2xl border p-3" /></label><label className="text-sm font-semibold">Image URL<input value={schoolLife.dormitory.image || ''} onChange={event => setSchoolLife(prev => ({ ...prev, dormitory: { ...prev.dormitory, image: event.target.value } }))} className="mt-1 w-full rounded-2xl border p-3" /></label><label className="md:col-span-2 text-sm font-semibold">Description<textarea value={schoolLife.dormitory.description} onChange={event => setSchoolLife(prev => ({ ...prev, dormitory: { ...prev.dormitory, description: event.target.value } }))} rows={3} className="mt-1 w-full rounded-2xl border p-3" /></label><div className="md:col-span-2"><p className="text-sm font-semibold">Features</p><div className="mt-1 flex gap-2"><input value={featureInput} onChange={event => setFeatureInput(event.target.value)} className="flex-1 rounded-2xl border p-3" placeholder="Masalan: 24/7 nazorat" /><button type="button" onClick={addFeature} className="rounded-2xl bg-slate-900 px-4 text-white" aria-label="Feature qo‘shish"><Plus /></button></div><div className="mt-3 flex flex-wrap gap-2">{schoolLife.dormitory.features.map((item, index) => <span key={`${item}-${index}`} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm">{item}<button type="button" onClick={() => setSchoolLife(prev => ({ ...prev, dormitory: { ...prev.dormitory, features: prev.dormitory.features.filter((_, itemIndex) => itemIndex !== index) } }))} aria-label={`${item} ni o‘chirish`}><Trash2 className="h-3 w-3" /></button></span>)}</div></div></div></article>

        <article className="rounded-3xl bg-white p-5 shadow-sm"><h3 className="text-lg font-black">🍽️ Ovqatlanish</h3><div className="mt-3 grid gap-3 md:grid-cols-2"><label className="text-sm font-semibold">Title<input value={schoolLife.meals.title} onChange={event => setSchoolLife(prev => ({ ...prev, meals: { ...prev.meals, title: event.target.value } }))} className="mt-1 w-full rounded-2xl border p-3" /></label><label className="text-sm font-semibold">Description<input value={schoolLife.meals.description} onChange={event => setSchoolLife(prev => ({ ...prev, meals: { ...prev.meals, description: event.target.value } }))} className="mt-1 w-full rounded-2xl border p-3" /></label></div><div className="mt-4 grid gap-2 md:grid-cols-[1fr_130px_1fr_auto]"><input value={mealForm.name} onChange={event => setMealForm(prev => ({ ...prev, name: event.target.value }))} placeholder="Ovqat nomi" className="rounded-2xl border p-3" /><input value={mealForm.time} onChange={event => setMealForm(prev => ({ ...prev, time: event.target.value }))} placeholder="07:30" className="rounded-2xl border p-3" /><input value={mealForm.description} onChange={event => setMealForm(prev => ({ ...prev, description: event.target.value }))} placeholder="Izoh" className="rounded-2xl border p-3" /><button type="button" onClick={saveMeal} className="rounded-2xl bg-slate-900 px-4 text-white" aria-label="Ovqatni saqlash">{mealEditingId === null ? <Plus /> : <Save />}</button></div><div className="mt-3 space-y-2">{schoolLife.meals.menu.map((item, index) => <div key={String(item.id ?? index)} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-slate-50 p-3"><span><b>{item.name}</b> · {item.time}{item.description ? ` — ${item.description}` : ''}</span><div className="flex gap-1"><button type="button" onClick={() => editMeal(item)} className="rounded-lg p-2" aria-label="Ovqatni tahrirlash"><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => deleteMeal(item.id ?? index)} className="rounded-lg p-2 text-red-500" aria-label="Ovqatni o‘chirish"><Trash2 className="h-4 w-4" /></button></div></div>)}</div></article>

        <article className="rounded-3xl bg-white p-5 shadow-sm"><h3 className="text-lg font-black">🕐 Kun tartibi</h3><div className="mt-4 grid gap-2 md:grid-cols-[120px_1fr_1fr_auto]"><input value={routineForm.time} onChange={event => setRoutineForm(prev => ({ ...prev, time: event.target.value }))} placeholder="08:30" className="rounded-2xl border p-3" /><input value={routineForm.activity} onChange={event => setRoutineForm(prev => ({ ...prev, activity: event.target.value }))} placeholder="Darslar" className="rounded-2xl border p-3" /><input value={routineForm.description} onChange={event => setRoutineForm(prev => ({ ...prev, description: event.target.value }))} placeholder="Izoh" className="rounded-2xl border p-3" /><button type="button" onClick={saveRoutine} className="rounded-2xl bg-slate-900 px-4 text-white" aria-label="Kun tartibini saqlash">{routineEditingId === null ? <Plus /> : <Save />}</button></div><div className="mt-3 space-y-2">{schoolLife.routine.items.map((item, index) => <div key={String(item.id ?? index)} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-slate-50 p-3"><span><b className="text-[#0071e3]">{item.time}</b> · {item.activity}{item.description ? ` — ${item.description}` : ''}</span><div className="flex gap-1"><button type="button" onClick={() => moveRoutine(index, -1)} disabled={index === 0} className="rounded-lg p-2 disabled:opacity-30" aria-label="Yuqoriga"><ChevronUp className="h-4 w-4" /></button><button type="button" onClick={() => moveRoutine(index, 1)} disabled={index === schoolLife.routine.items.length - 1} className="rounded-lg p-2 disabled:opacity-30" aria-label="Pastga"><ChevronDown className="h-4 w-4" /></button><button type="button" onClick={() => editRoutine(item)} className="rounded-lg p-2" aria-label="Kun tartibini tahrirlash"><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => deleteRoutine(item.id, index)} className="rounded-lg p-2 text-red-500" aria-label="Kun tartibini o‘chirish"><Trash2 className="h-4 w-4" /></button></div></div>)}</div></article>
      </section>
    </section>}

    <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm"><h2 className="font-black">📨 Murojaatlar · {messages.length}</h2><div className="mt-4 space-y-2">{messages.map(item => <div key={String(item.id)} className="flex items-start justify-between gap-3 rounded-2xl border p-3"><div><p className="font-semibold">{String(item.full_name || item.name || 'Murojaat')}</p><p className="text-sm text-slate-600">{String(item.description || item.message || '')}</p></div><button type="button" onClick={() => void deleteProposal(item.id as string | number)} className="rounded-xl p-2 text-red-500" aria-label="Murojaatni o‘chirish"><Trash2 className="h-4 w-4" /></button></div>)}</div></section>
  </main>
  {schoolCoinOpen && <SchoolCoinSecure onClose={() => setSchoolCoinOpen(false)} initialMode="admin" adminSession={session as typeof session} />}
  </div>;
}
