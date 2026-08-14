import { useEffect, useState } from 'react';
import {
  getSiteData,
  saveSiteData,
  signInAdmin,
  signOutAdmin,
  supabase,
} from '../lib/supabase';
import { X, ShieldCheck, Save, LogIn, LogOut, Plus, Trash2 } from 'lucide-react';

type Item = { time: string; activity: string; description?: string };
type Meal = { name: string; time: string; description?: string };
type Data = {
  dormitory: { title: string; description: string; image?: string; features: string[] };
  meals: { title: string; description: string; menu: Meal[] };
  routine: { title: string; description: string; items: Item[] };
};

const empty: Data = {
  dormitory: { title: 'Yotoqxona', description: '', image: '', features: [] },
  meals: { title: 'Ovqatlanish', description: '', menu: [] },
  routine: { title: 'Kun tartibi', description: '', items: [] },
};

export default function SchoolLifeAdmin({ onClose }: { onClose: () => void }) {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [data, setData] = useState<Data>(empty);
  const [feature, setFeature] = useState('');
  const [meal, setMeal] = useState<Meal>({ name: '', time: '', description: '' });
  const [routine, setRoutine] = useState<Item>({ time: '', activity: '', description: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user?.app_metadata?.role !== 'admin') return;
    void getSiteData('schoolLife', empty)
      .then(value => setData(value || empty))
      .catch(() => undefined);
  }, [session]);

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const result = await signInAdmin(email.trim(), password);
      setSession(result.session);
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Kirishda xatolik');
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      await saveSiteData('schoolLife', data);
      setNotice('Maktab hayoti saqlandi ✓');
      window.setTimeout(() => setNotice(''), 2500);
    } catch (err: any) {
      setError(err.message || 'Saqlashda xatolik');
    } finally {
      setBusy(false);
    }
  };

  const admin = session?.user?.app_metadata?.role === 'admin';

  if (!session || !admin) {
    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 backdrop-blur-xl p-4">
        <div className="w-full max-w-md rounded-[32px] bg-white p-7 shadow-2xl">
          <div className="mb-7 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 font-bold text-[#0071e3]">
                <ShieldCheck className="h-5 w-5" /> Secure Admin
              </div>
              <h2 className="mt-2 text-2xl font-bold">Maktab hayoti</h2>
            </div>
            <button onClick={onClose} aria-label="Yopish">
              <X />
            </button>
          </div>
          <form onSubmit={login} className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder="Admin email"
              className="w-full rounded-2xl border p-3.5"
            />
            <input
              type="password"
              required
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="Parol"
              className="w-full rounded-2xl border p-3.5"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              disabled={busy}
              className="w-full rounded-2xl bg-[#0071e3] py-3.5 font-semibold text-white disabled:opacity-60"
            >
              {busy ? 'Tekshirilmoqda…' : 'Kirish'}{' '}
              <LogIn className="ml-1 inline h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[120] overflow-auto bg-slate-100">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white/90 px-5 py-3 backdrop-blur-xl">
        <div>
          <h2 className="font-bold">Maktab hayoti boshqaruvi</h2>
          <p className="text-xs text-slate-500">Yotoqxona · Ovqatlanish · Kun tartibi</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => void save()}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0071e3] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Save className="h-4 w-4" /> Saqlash
          </button>
          <button onClick={() => void signOutAdmin()} className="p-2" aria-label="Chiqish">
            <LogOut className="h-5 w-5" />
          </button>
          <button onClick={onClose} className="p-2" aria-label="Yopish">
            <X />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-5 p-5">
        {error && <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {notice && <div className="rounded-2xl bg-green-50 p-3 text-sm text-green-700">{notice}</div>}

        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-bold">🛏️ Yotoqxona</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={data.dormitory.title}
              onChange={event =>
                setData(prev => ({
                  ...prev,
                  dormitory: { ...prev.dormitory, title: event.target.value },
                }))
              }
              placeholder="Sarlavha"
              className="rounded-2xl border p-3"
            />
            <input
              value={data.dormitory.image || ''}
              onChange={event =>
                setData(prev => ({
                  ...prev,
                  dormitory: { ...prev.dormitory, image: event.target.value },
                }))
              }
              placeholder="Rasm URL"
              className="rounded-2xl border p-3"
            />
            <textarea
              value={data.dormitory.description}
              onChange={event =>
                setData(prev => ({
                  ...prev,
                  dormitory: { ...prev.dormitory, description: event.target.value },
                }))
              }
              placeholder="Tavsif"
              className="rounded-2xl border p-3 md:col-span-2"
            />
            <div className="md:col-span-2">
              <div className="flex gap-2">
                <input
                  value={feature}
                  onChange={event => setFeature(event.target.value)}
                  placeholder="Yangi qulaylik"
                  className="flex-1 rounded-2xl border p-3"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!feature.trim()) return;
                    setData(prev => ({
                      ...prev,
                      dormitory: {
                        ...prev.dormitory,
                        features: [...prev.dormitory.features, feature.trim()],
                      },
                    }));
                    setFeature('');
                  }}
                  className="rounded-2xl bg-slate-900 px-4 text-white"
                  aria-label="Qulaylik qo‘shish"
                >
                  <Plus />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {data.dormitory.features.map((item, index) => (
                  <span
                    key={`${item}-${index}`}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() =>
                        setData(prev => ({
                          ...prev,
                          dormitory: {
                            ...prev.dormitory,
                            features: prev.dormitory.features.filter((_, itemIndex) => itemIndex !== index),
                          },
                        }))
                      }
                      aria-label={`${item} ni o‘chirish`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-bold">🍽️ Ovqatlanish</h3>
          <input
            value={data.meals.title}
            onChange={event =>
              setData(prev => ({ ...prev, meals: { ...prev.meals, title: event.target.value } }))
            }
            className="mb-3 w-full rounded-2xl border p-3"
            placeholder="Sarlavha"
          />
          <textarea
            value={data.meals.description}
            onChange={event =>
              setData(prev => ({ ...prev, meals: { ...prev.meals, description: event.target.value } }))
            }
            className="mb-4 w-full rounded-2xl border p-3"
            placeholder="Tavsif"
          />
          <div className="grid gap-2 md:grid-cols-[1fr_140px_1fr_auto]">
            <input
              value={meal.name}
              onChange={event => setMeal(prev => ({ ...prev, name: event.target.value }))}
              placeholder="Masalan: Nonushta"
              className="rounded-2xl border p-3"
            />
            <input
              value={meal.time}
              onChange={event => setMeal(prev => ({ ...prev, time: event.target.value }))}
              placeholder="07:30"
              className="rounded-2xl border p-3"
            />
            <input
              value={meal.description || ''}
              onChange={event => setMeal(prev => ({ ...prev, description: event.target.value }))}
              placeholder="Izoh"
              className="rounded-2xl border p-3"
            />
            <button
              type="button"
              onClick={() => {
                if (!meal.name.trim() || !meal.time.trim()) return;
                setData(prev => ({
                  ...prev,
                  meals: { ...prev.meals, menu: [...prev.meals.menu, meal] },
                }));
                setMeal({ name: '', time: '', description: '' });
              }}
              className="rounded-2xl bg-slate-900 px-4 text-white"
              aria-label="Ovqat qo‘shish"
            >
              <Plus />
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {data.meals.menu.map((item, index) => (
              <div key={`${item.name}-${index}`} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                <span>
                  <b>{item.name}</b> · {item.time}
                  {item.description ? ` — ${item.description}` : ''}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setData(prev => ({
                      ...prev,
                      meals: {
                        ...prev.meals,
                        menu: prev.meals.menu.filter((_, itemIndex) => itemIndex !== index),
                      },
                    }))
                  }
                  aria-label={`${item.name} ni o‘chirish`}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-bold">🕐 Kun tartibi</h3>
          <input
            value={data.routine.title}
            onChange={event =>
              setData(prev => ({ ...prev, routine: { ...prev.routine, title: event.target.value } }))
            }
            className="mb-3 w-full rounded-2xl border p-3"
            placeholder="Sarlavha"
          />
          <textarea
            value={data.routine.description}
            onChange={event =>
              setData(prev => ({ ...prev, routine: { ...prev.routine, description: event.target.value } }))
            }
            className="mb-4 w-full rounded-2xl border p-3"
            placeholder="Tavsif"
          />
          <div className="grid gap-2 md:grid-cols-[120px_1fr_1fr_auto]">
            <input
              value={routine.time}
              onChange={event => setRoutine(prev => ({ ...prev, time: event.target.value }))}
              placeholder="08:30"
              className="rounded-2xl border p-3"
            />
            <input
              value={routine.activity}
              onChange={event => setRoutine(prev => ({ ...prev, activity: event.target.value }))}
              placeholder="Darslar"
              className="rounded-2xl border p-3"
            />
            <input
              value={routine.description || ''}
              onChange={event => setRoutine(prev => ({ ...prev, description: event.target.value }))}
              placeholder="Izoh"
              className="rounded-2xl border p-3"
            />
            <button
              type="button"
              onClick={() => {
                if (!routine.time.trim() || !routine.activity.trim()) return;
                setData(prev => ({
                  ...prev,
                  routine: { ...prev.routine, items: [...prev.routine.items, routine] },
                }));
                setRoutine({ time: '', activity: '', description: '' });
              }}
              className="rounded-2xl bg-slate-900 px-4 text-white"
              aria-label="Kun tartibiga qo‘shish"
            >
              <Plus />
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {data.routine.items.map((item, index) => (
              <div key={`${item.time}-${index}`} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                <span>
                  <b className="text-[#0071e3]">{item.time}</b> · {item.activity}
                  {item.description ? ` — ${item.description}` : ''}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setData(prev => ({
                      ...prev,
                      routine: {
                        ...prev.routine,
                        items: prev.routine.items.filter((_, itemIndex) => itemIndex !== index),
                      },
                    }))
                  }
                  aria-label={`${item.time} bandini o‘chirish`}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
