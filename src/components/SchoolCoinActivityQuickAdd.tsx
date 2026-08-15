import { FormEvent, useEffect, useState } from 'react';
import { Activity, Plus, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function SchoolCoinActivityQuickAdd() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Sport');
  const [coinReward, setCoinReward] = useState('10');
  const [maxPerMonth, setMaxPerMonth] = useState('');
  const [requiresEvidence, setRequiresEvidence] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let alive = true;
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (alive) setIsAdmin(data.session?.user?.app_metadata?.role === 'admin');
    };
    void check();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(session?.user?.app_metadata?.role === 'admin');
    });
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, []);

  if (!isAdmin) return null;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const result = await supabase.rpc('schoolcoin_admin_create_activity', {
        p_name: name.trim(),
        p_category: category.trim(),
        p_coin_reward: Number(coinReward),
        p_max_per_month: maxPerMonth.trim() ? Number(maxPerMonth) : null,
        p_requires_evidence: requiresEvidence,
      });
      if (result.error) throw result.error;
      setMessage('Activity qo‘shildi ✓');
      setName('');
      setCoinReward('10');
      setMaxPerMonth('');
      setRequiresEvidence(false);
      window.dispatchEvent(new Event('schoolcoin_activity_added'));
      window.setTimeout(() => { setOpen(false); setMessage(''); }, 900);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Activity qo‘shilmadi');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="fixed bottom-40 right-4 z-[180] flex items-center gap-2 rounded-full bg-amber-500 px-4 py-3 text-sm font-bold text-white shadow-2xl hover:scale-105 active:scale-95 sm:right-6">
        <Plus className="h-4 w-4" />
        Activity qo‘shish
      </button>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md" onClick={() => setOpen(false)}>
          <form onSubmit={submit} onClick={event => event.stopPropagation()} className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-100 text-amber-600"><Activity className="h-5 w-5" /></div><div><h2 className="text-xl font-black">Add Activity</h2><p className="text-xs text-slate-500">Yangi SchoolCoin faoliyati</p></div></div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <input required value={name} onChange={e => setName(e.target.value)} placeholder="Activity nomi" className="w-full rounded-2xl border p-3.5" />
              <input required value={category} onChange={e => setCategory(e.target.value)} placeholder="Kategoriya" className="w-full rounded-2xl border p-3.5" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input required min="1" type="number" value={coinReward} onChange={e => setCoinReward(e.target.value)} placeholder="Coin reward" className="w-full rounded-2xl border p-3.5" />
                <input min="1" type="number" value={maxPerMonth} onChange={e => setMaxPerMonth(e.target.value)} placeholder="Oylik limit (ixtiyoriy)" className="w-full rounded-2xl border p-3.5" />
              </div>
              <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 text-sm font-semibold"><input type="checkbox" checked={requiresEvidence} onChange={e => setRequiresEvidence(e.target.checked)} /> Dalil/evidence talab qilinsin</label>
            </div>
            {message && <div className={`mt-4 rounded-2xl p-3 text-sm font-semibold ${message.includes('✓') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{message}</div>}
            <button disabled={busy} className="mt-5 w-full rounded-2xl bg-slate-900 p-3.5 font-bold text-white disabled:opacity-50">{busy ? 'Qo‘shilmoqda…' : 'Add Activity'}</button>
          </form>
        </div>
      )}
    </>
  );
}
