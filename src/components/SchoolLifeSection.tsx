import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { getSiteData, saveSiteData } from '../lib/supabase';

type Feature = string;
type Meal = { name: string; time: string; description: string };
type RoutineItem = { time: string; activity: string; description: string };

type SchoolLifeData = {
  dormitory: { title: string; description: string; image: string; features: Feature[] };
  meals: { title: string; description: string; menu: Meal[] };
  routine: { title: string; description: string; items: RoutineItem[] };
};

const emptyData: SchoolLifeData = {
  dormitory: { title: 'Yotoqxona', description: '', image: '', features: [] },
  meals: { title: 'Ovqatlanish', description: '', menu: [] },
  routine: { title: 'Kun tartibi', description: '', items: [] },
};

const cloneData = (value: SchoolLifeData): SchoolLifeData => ({
  dormitory: {
    title: value.dormitory?.title || '',
    description: value.dormitory?.description || '',
    image: value.dormitory?.image || '',
    features: Array.isArray(value.dormitory?.features) ? value.dormitory.features.filter(Boolean) : [],
  },
  meals: {
    title: value.meals?.title || '',
    description: value.meals?.description || '',
    menu: Array.isArray(value.meals?.menu)
      ? value.meals.menu.map(item => ({ name: item.name || '', time: item.time || '', description: item.description || '' }))
      : [],
  },
  routine: {
    title: value.routine?.title || '',
    description: value.routine?.description || '',
    items: Array.isArray(value.routine?.items)
      ? value.routine.items.map(item => ({ time: item.time || '', activity: item.activity || '', description: item.description || '' }))
      : [],
  },
});

export default function SchoolLifeSection() {
  const [data, setData] = useState<SchoolLifeData>(emptyData);
  const [feature, setFeature] = useState('');
  const [mealDraft, setMealDraft] = useState<Meal>({ name: '', time: '', description: '' });
  const [mealEditingIndex, setMealEditingIndex] = useState<number | null>(null);
  const [routineDraft, setRoutineDraft] = useState<RoutineItem>({ time: '', activity: '', description: '' });
  const [routineEditingIndex, setRoutineEditingIndex] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = async () => {
    setBusy(true);
    setError('');
    try {
      const value = await getSiteData('schoolLife', emptyData);
      setData(cloneData(value || emptyData));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Maktab hayotini yuklashda xatolik.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const persist = async (next: SchoolLifeData, message = 'Saqlandi ✓') => {
    setBusy(true);
    setError('');
    try {
      await saveSiteData('schoolLife', next);
      setData(cloneData(next));
      setNotice(message);
      window.setTimeout(() => setNotice(''), 2200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Saqlashda xatolik.');
    } finally {
      setBusy(false);
    }
  };

  const updateDormitory = (patch: Partial<SchoolLifeData['dormitory']>) => {
    setData(prev => ({ ...prev, dormitory: { ...prev.dormitory, ...patch } }));
  };

  const addFeature = () => {
    const value = feature.trim();
    if (!value || data.dormitory.features.includes(value)) return;
    updateDormitory({ features: [...data.dormitory.features, value] });
    setFeature('');
  };

  const saveMealDraft = () => {
    if (!mealDraft.name.trim() || !mealDraft.time.trim()) {
      setError('Ovqat nomi va vaqtini kiriting.');
      return;
    }
    const menu = [...data.meals.menu];
    const next = { ...mealDraft, name: mealDraft.name.trim(), time: mealDraft.time.trim(), description: mealDraft.description.trim() };
    if (mealEditingIndex === null) menu.push(next);
    else menu[mealEditingIndex] = next;
    setData(prev => ({ ...prev, meals: { ...prev.meals, menu } }));
    setMealDraft({ name: '', time: '', description: '' });
    setMealEditingIndex(null);
    setError('');
  };

  const editMeal = (index: number) => {
    setMealDraft({ ...data.meals.menu[index] });
    setMealEditingIndex(index);
  };

  const deleteMeal = (index: number) => {
    setData(prev => ({ ...prev, meals: { ...prev.meals, menu: prev.meals.menu.filter((_, i) => i !== index) } }));
    if (mealEditingIndex === index) {
      setMealEditingIndex(null);
      setMealDraft({ name: '', time: '', description: '' });
    }
  };

  const saveRoutineDraft = () => {
    if (!routineDraft.time.trim() || !routineDraft.activity.trim()) {
      setError('Kun tartibi uchun vaqt va faoliyatni kiriting.');
      return;
    }
    const items = [...data.routine.items];
    const next = { ...routineDraft, time: routineDraft.time.trim(), activity: routineDraft.activity.trim(), description: routineDraft.description.trim() };
    if (routineEditingIndex === null) items.push(next);
    else items[routineEditingIndex] = next;
    setData(prev => ({ ...prev, routine: { ...prev.routine, items } }));
    setRoutineDraft({ time: '', activity: '', description: '' });
    setRoutineEditingIndex(null);
    setError('');
  };

  const editRoutine = (index: number) => {
    setRoutineDraft({ ...data.routine.items[index] });
    setRoutineEditingIndex(index);
  };

  const deleteRoutine = (index: number) => {
    setData(prev => ({ ...prev, routine: { ...prev.routine, items: prev.routine.items.filter((_, i) => i !== index) } }));
    if (routineEditingIndex === index) {
      setRoutineEditingIndex(null);
      setRoutineDraft({ time: '', activity: '', description: '' });
    }
  };

  const moveRoutine = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= data.routine.items.length) return;
    const items = [...data.routine.items];
    [items[index], items[target]] = [items[target], items[index]];
    setData(prev => ({ ...prev, routine: { ...prev.routine, items } }));
  };

  return (
    <section className="rounded-3xl bg-white p-4 shadow-sm md:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">🏫 Maktab hayoti</h2>
          <p className="mt-1 text-xs text-slate-500">Yotoqxona, ovqatlanish va kun tartibi shu Admin Panel ichidan boshqariladi.</p>
        </div>
        <button type="button" onClick={() => void persist(data)} disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0071e3] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">
          <Save className="h-4 w-4" /> {busy ? 'Saqlanmoqda…' : 'Saqlash'}
        </button>
      </div>

      {error && <div className="mb-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {notice && <div className="mb-4 rounded-2xl bg-green-50 p-3 text-sm text-green-700">{notice}</div>}

      <div className="space-y-5">
        <article className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4 md:p-5">
          <h3 className="mb-4 text-lg font-bold">🛏️ Yotoqxona</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <input aria-label="Yotoqxona sarlavhasi" value={data.dormitory.title} onChange={event => updateDormitory({ title: event.target.value })} placeholder="Sarlavha" className="rounded-2xl border bg-white p-3" />
            <input aria-label="Yotoqxona rasm URL" value={data.dormitory.image} onChange={event => updateDormitory({ image: event.target.value })} placeholder="Rasm URL" className="rounded-2xl border bg-white p-3" />
            <textarea aria-label="Yotoqxona tavsifi" value={data.dormitory.description} onChange={event => updateDormitory({ description: event.target.value })} placeholder="Tavsif" rows={4} className="rounded-2xl border bg-white p-3 md:col-span-2" />
          </div>
          <div className="mt-4 flex gap-2">
            <input aria-label="Yangi yotoqxona qulayligi" value={feature} onChange={event => setFeature(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); addFeature(); } }} placeholder="Yangi qulaylik" className="min-w-0 flex-1 rounded-2xl border bg-white p-3" />
            <button type="button" onClick={addFeature} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white" aria-label="Qulaylik qo‘shish"><Plus className="h-4 w-4" /> Qo‘shish</button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.dormitory.features.map((item, index) => (
              <span key={`${item}-${index}`} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm shadow-sm">
                {item}
                <button type="button" onClick={() => updateDormitory({ features: data.dormitory.features.filter((_, i) => i !== index) })} aria-label={`${item} ni o‘chirish`}><Trash2 className="h-3.5 w-3.5 text-red-500" /></button>
              </span>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4 md:p-5">
          <h3 className="mb-4 text-lg font-bold">🍽️ Ovqatlanish</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <input aria-label="Ovqatlanish sarlavhasi" value={data.meals.title} onChange={event => setData(prev => ({ ...prev, meals: { ...prev.meals, title: event.target.value } }))} placeholder="Sarlavha" className="rounded-2xl border bg-white p-3" />
            <textarea aria-label="Ovqatlanish tavsifi" value={data.meals.description} onChange={event => setData(prev => ({ ...prev, meals: { ...prev.meals, description: event.target.value } }))} placeholder="Tavsif" rows={3} className="rounded-2xl border bg-white p-3" />
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-[1fr_140px_1fr_auto]">
            <input aria-label="Ovqat nomi" value={mealDraft.name} onChange={event => setMealDraft(prev => ({ ...prev, name: event.target.value }))} placeholder="Masalan: Nonushta" className="rounded-2xl border bg-white p-3" />
            <input aria-label="Ovqat vaqti" type="time" value={mealDraft.time} onChange={event => setMealDraft(prev => ({ ...prev, time: event.target.value }))} className="rounded-2xl border bg-white p-3" />
            <input aria-label="Ovqat izohi" value={mealDraft.description} onChange={event => setMealDraft(prev => ({ ...prev, description: event.target.value }))} placeholder="Izoh" className="rounded-2xl border bg-white p-3" />
            <button type="button" onClick={saveMealDraft} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-white" aria-label={mealEditingIndex === null ? 'Ovqat qo‘shish' : 'Ovqatni saqlash'}>{mealEditingIndex === null ? <Plus className="h-4 w-4" /> : <Save className="h-4 w-4" />}</button>
          </div>
          <div className="mt-3 space-y-2">
            {data.meals.menu.map((item, index) => (
              <div key={`${item.name}-${item.time}-${index}`} className="flex flex-col gap-3 rounded-2xl bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                <div><b>{item.name}</b> <span className="text-[#0071e3]">· {item.time}</span>{item.description && <p className="text-xs text-slate-500">{item.description}</p>}</div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => editMeal(index)} className="inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-sm"><Pencil className="h-4 w-4" /> Tahrirlash</button>
                  <button type="button" onClick={() => deleteMeal(index)} className="inline-flex items-center gap-1 rounded-xl border border-red-100 px-3 py-2 text-sm text-red-600"><Trash2 className="h-4 w-4" /> O‘chirish</button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4 md:p-5">
          <h3 className="mb-4 text-lg font-bold">🕐 Kun tartibi</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <input aria-label="Kun tartibi sarlavhasi" value={data.routine.title} onChange={event => setData(prev => ({ ...prev, routine: { ...prev.routine, title: event.target.value } }))} placeholder="Sarlavha" className="rounded-2xl border bg-white p-3" />
            <textarea aria-label="Kun tartibi tavsifi" value={data.routine.description} onChange={event => setData(prev => ({ ...prev, routine: { ...prev.routine, description: event.target.value } }))} placeholder="Tavsif" rows={3} className="rounded-2xl border bg-white p-3" />
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-[120px_1fr_1fr_auto]">
            <input aria-label="Kun tartibi vaqti" type="time" value={routineDraft.time} onChange={event => setRoutineDraft(prev => ({ ...prev, time: event.target.value }))} className="rounded-2xl border bg-white p-3" />
            <input aria-label="Faoliyat" value={routineDraft.activity} onChange={event => setRoutineDraft(prev => ({ ...prev, activity: event.target.value }))} placeholder="Faoliyat" className="rounded-2xl border bg-white p-3" />
            <input aria-label="Faoliyat izohi" value={routineDraft.description} onChange={event => setRoutineDraft(prev => ({ ...prev, description: event.target.value }))} placeholder="Izoh" className="rounded-2xl border bg-white p-3" />
            <button type="button" onClick={saveRoutineDraft} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-white" aria-label={routineEditingIndex === null ? 'Kun tartibiga qo‘shish' : 'Bandni saqlash'}>{routineEditingIndex === null ? <Plus className="h-4 w-4" /> : <Save className="h-4 w-4" />}</button>
          </div>
          <div className="mt-3 space-y-2">
            {data.routine.items.map((item, index) => (
              <div key={`${item.time}-${item.activity}-${index}`} className="flex flex-col gap-3 rounded-2xl bg-white p-3 lg:flex-row lg:items-center lg:justify-between">
                <div><b className="text-[#0071e3]">{item.time}</b> <span>· {item.activity}</span>{item.description && <p className="text-xs text-slate-500">{item.description}</p>}</div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => moveRoutine(index, -1)} disabled={index === 0} className="rounded-xl border p-2 disabled:opacity-40" aria-label="Yuqoriga ko‘chirish"><ArrowUp className="h-4 w-4" /></button>
                  <button type="button" onClick={() => moveRoutine(index, 1)} disabled={index === data.routine.items.length - 1} className="rounded-xl border p-2 disabled:opacity-40" aria-label="Pastga ko‘chirish"><ArrowDown className="h-4 w-4" /></button>
                  <button type="button" onClick={() => editRoutine(index)} className="inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-sm"><Pencil className="h-4 w-4" /> Tahrirlash</button>
                  <button type="button" onClick={() => deleteRoutine(index)} className="inline-flex items-center gap-1 rounded-xl border border-red-100 px-3 py-2 text-sm text-red-600"><Trash2 className="h-4 w-4" /> O‘chirish</button>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
