import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Coins, Gift, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Reward = { id: string; title: string; description: string; category: string; price: number; stock: number };
type Activity = { id: string; name: string; category: string; coin_reward: number; description?: string };

export default function SchoolCoinPublic() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true); setError('');
      const [a, r] = await Promise.all([
        supabase.from('schoolcoin_activities').select('id,name,category,coin_reward,description').eq('active', true).order('coin_reward', { ascending: false }).limit(4),
        supabase.from('schoolcoin_market_rewards').select('id,title,description,category,price,stock').eq('active', true).order('price').limit(4),
      ]);
      if (!alive) return;
      if (a.error || r.error) { setError('SchoolCoin ma’lumotlarini yuklashda xatolik yuz berdi.'); setLoading(false); return; }
      setActivities((a.data || []) as Activity[]); setRewards((r.data || []) as Reward[]); setLoading(false);
    };
    void load();
    return () => { alive = false; };
  }, []);

  return (
    <section id="schoolcoin" className="scroll-mt-24 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 md:px-12 lg:px-16">
        <div className="overflow-hidden rounded-[32px] border border-amber-200/70 bg-gradient-to-br from-amber-50 via-white to-blue-50 p-6 shadow-xl shadow-slate-900/5 sm:p-10">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-3 py-1.5 text-xs font-bold uppercase tracking-[.14em] text-amber-700"><Sparkles className="h-3.5 w-3.5" /> Student ecosystem</span>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">SchoolCoin — yaxshi tashabbusni qadrlaydigan maktab iqtisodiyoti.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">O‘quvchilar maktabdagi foydali faoliyatlarda qatnashib Coin ishlab topadi, tasdiqlangan so‘rovlar orqali balansini oshiradi va mavjud mukofotlarga almashadi.</p>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {[
                  ['01', 'Faoliyat', 'Real maktab tashabbuslarida qatnashish'],
                  ['02', 'Verification', 'So‘rovlar secure backend orqali tekshiriladi'],
                  ['03', 'Rewards', 'Tasdiqlangan balans bilan marketplace'],
                ].map(([number, title, text]) => <div key={number} className="rounded-2xl border border-white bg-white/75 p-4"><span className="text-xs font-black text-amber-600">{number}</span><h3 className="mt-2 text-sm font-bold text-slate-900">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{text}</p></div>)}
              </div>
              <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-schoolcoin'))} className="apple-button mt-7"><span>Student portal</span><ArrowRight className="h-4 w-4" /></button>
            </div>

            <div className="rounded-[28px] border border-white/80 bg-white/80 p-5 shadow-lg backdrop-blur-xl sm:p-6">
              <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-slate-400">Live catalog</p><h3 className="mt-1 text-xl font-black">Marketplace preview</h3></div><Coins className="h-8 w-8 text-amber-500" /></div>
              {loading && <div className="flex items-center gap-2 py-12 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Ma’lumotlar yuklanmoqda…</div>}
              {!loading && error && <div role="alert" className="py-12 text-sm text-red-600">{error}</div>}
              {!loading && !error && activities.length === 0 && rewards.length === 0 && <div className="py-12 text-center text-sm text-slate-500">Hozircha SchoolCoin katalogi bo‘sh.</div>}
              {!loading && !error && (activities.length > 0 || rewards.length > 0) && <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {activities.slice(0, 2).map(item => <div key={item.id} className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4"><div className="flex items-center justify-between gap-2"><span className="text-xs font-bold text-blue-700">{item.category}</span><span className="font-black text-amber-600">+{item.coin_reward}</span></div><h4 className="mt-2 text-sm font-bold">{item.name}</h4><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{item.description || 'Maktabdagi foydali faoliyat.'}</p></div>)}
                {rewards.slice(0, 2).map(reward => <div key={reward.id} className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4"><div className="flex items-center justify-between gap-2"><Gift className="h-4 w-4 text-amber-600" /><span className="font-black text-slate-900">{reward.price} Coin</span></div><h4 className="mt-2 text-sm font-bold">{reward.title}</h4><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{reward.description}</p></div>)}
              </div>}
              <div className="mt-5 flex items-center gap-2 text-xs text-slate-500"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Financial actions remain protected by the existing backend RPC/RLS model.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
