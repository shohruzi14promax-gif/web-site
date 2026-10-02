// @ts-nocheck
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Activity, AlertTriangle, BarChart3, Coins, CreditCard, Gauge,
  Package, RefreshCw, ShoppingCart, ShieldAlert, TrendingDown, TrendingUp, Users
} from 'lucide-react';
import { supabase } from '../lib/supabase';

type Student = { id: string; full_name: string; class_name: string; active: boolean };
type Transaction = { id: string; student_id: string; amount: number; transaction_type: string; note: string | null; created_at: string };
type Reward = { id: string; title: string; category: string; price: number; stock: number; active: boolean };
type Request = { id: string; student_id: string; activity_id: string; status: string; created_at: string };
type Order = { id: string; student_id: string; reward_id: string; price: number; status: string; created_at: string };
type Redemption = { id: string; student_id: string; reward_id: string; cost: number; status: string; created_at: string };

type EconomyData = {
  students: Student[];
  transactions: Transaction[];
  rewards: Reward[];
  requests: Request[];
  orders: Order[];
  redemptions: Redemption[];
};

const money = (n: number) => new Intl.NumberFormat('uz-UZ').format(Math.round(n));
const dateLabel = (value: string) => new Date(value).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' });
const pct = (n: number) => `${n.toFixed(1)}%`;

function Card({ icon, title, value, hint, tone = 'blue' }: { icon: ReactNode; title: string; value: string; hint?: string; tone?: 'blue'|'green'|'amber'|'violet'|'red' }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    violet: 'bg-violet-50 text-violet-700 border-violet-100',
    red: 'bg-red-50 text-red-700 border-red-100',
  };
  return <article className={`rounded-3xl border p-5 shadow-sm ${tones[tone]}`}>
    <div className="flex items-center justify-between"><span className="text-xs font-semibold opacity-80">{title}</span><span>{icon}</span></div>
    <div className="mt-3 text-2xl font-black text-slate-900">{value}</div>
    {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
  </article>;
}

export default function SchoolCoinEconomyDashboard() {
  const [data, setData] = useState<EconomyData>({ students: [], transactions: [], rewards: [], requests: [], orders: [], redemptions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState<7 | 30 | 0>(7);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    const queries = [
      ['O‘quvchilar', supabase.from('schoolcoin_students').select('id,full_name,class_name,active')],
      ['Transactionlar', supabase.from('schoolcoin_transactions').select('id,student_id,amount,transaction_type,note,created_at').order('created_at', { ascending: false })],
      ['Market rewardlar', supabase.from('schoolcoin_market_rewards').select('id,title,category,price,stock,active')],
      ['So‘rovlar', supabase.from('schoolcoin_requests').select('id,student_id,activity_id,status,created_at').order('created_at', { ascending: false })],
      ['Buyurtmalar', supabase.from('schoolcoin_orders').select('id,student_id,reward_id,price,status,created_at').order('created_at', { ascending: false })],
      ['Redemptionlar', supabase.from('schoolcoin_redemptions').select('id,student_id,reward_id,cost,status,created_at').order('created_at', { ascending: false })],
    ] as const;

    try {
      const results = await Promise.all(queries.map(async ([label, query]) => ({ label, result: await query })));
      const [students, transactions, rewards, requests, orders, redemptions] = results.map(x => x.result);
      const errors = results.filter(x => x.result.error);
      setData({
        students: (students.data || []) as Student[],
        transactions: (transactions.data || []) as Transaction[],
        rewards: (rewards.data || []) as Reward[],
        requests: (requests.data || []) as Request[],
        orders: (orders.data || []) as Order[],
        redemptions: (redemptions.data || []) as Redemption[],
      });
      if (errors.length) {
        setError(errors.map(x => `${x.label}: ${x.result.error?.message || 'yuklashda xatolik'}`).join(' · '));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'SchoolCoin ma’lumotlari yuklanmadi.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const activeStudents = useMemo(() => data.students.filter(s => s.active), [data.students]);
  const balances = useMemo(() => {
    const map = new Map<string, number>();
    data.transactions.forEach(t => map.set(t.student_id, (map.get(t.student_id) || 0) + Number(t.amount || 0)));
    return activeStudents.map(s => ({ ...s, balance: map.get(s.id) || 0 })).sort((a,b) => b.balance - a.balance);
  }, [activeStudents, data.transactions]);

  const periodTransactions = useMemo(() => {
    if (!period) return data.transactions;
    const cutoff = Date.now() - period * 86400000;
    return data.transactions.filter(t => new Date(t.created_at).getTime() >= cutoff);
  }, [data.transactions, period]);

  const issued = data.transactions.filter(t => t.transaction_type === 'earn' || t.transaction_type === 'reward').reduce((s,t) => s + Math.max(0, t.amount), 0);
  const normalSpent = data.transactions.filter(t => t.transaction_type === 'spend').reduce((s,t) => s + Math.abs(Math.min(0,t.amount)), 0);
  const earn = data.transactions.filter(t => t.transaction_type === 'earn').reduce((s,t) => s + Math.max(0,t.amount), 0);
  const rewardIssued = data.transactions.filter(t => t.transaction_type === 'reward').reduce((s,t) => s + Math.max(0,t.amount), 0);
  const adjustments = data.transactions.filter(t => t.transaction_type === 'adjustment').reduce((s,t) => s + t.amount, 0);
  const totalSupply = balances.reduce((s,x) => s + x.balance, 0);
  const withBalance = balances.filter(x => x.balance > 0).length;
  const avg = balances.length ? totalSupply / balances.length : 0;
  const sortedBalances = balances.map(x => x.balance).sort((a,b) => a-b);
  const median = sortedBalances.length ? sortedBalances[Math.floor(sortedBalances.length / 2)] : 0;
  const activeRewards = data.rewards.filter(r => r.active);
  const stock = activeRewards.reduce((s,r) => s + Math.max(0,r.stock), 0);
  const inventoryValue = activeRewards.reduce((s,r) => s + Math.max(0,r.stock) * Math.max(0,r.price), 0);
  const minPrice = activeRewards.length ? Math.min(...activeRewards.map(r => r.price)) : 0;
  const maxPrice = activeRewards.length ? Math.max(...activeRewards.map(r => r.price)) : 0;
  const avgPrice = activeRewards.length ? activeRewards.reduce((s,r) => s+r.price,0) / activeRewards.length : 0;
  const pendingRequests = data.requests.filter(r => r.status.toLowerCase() === 'pending').length;
  const pendingOrders = data.orders.filter(o => ['pending','new'].includes(o.status.toLowerCase())).length;
  const pendingRedemptions = data.redemptions.filter(r => ['pending','new'].includes(r.status.toLowerCase())).length;

  const periodEarn = periodTransactions.filter(t => t.transaction_type === 'earn' || t.transaction_type === 'reward').reduce((s,t) => s + Math.max(0,t.amount),0);
  const periodSpend = periodTransactions.filter(t => t.transaction_type === 'spend').reduce((s,t) => s + Math.abs(Math.min(0,t.amount)),0);
  const periodAdjustment = periodTransactions.filter(t => t.transaction_type === 'adjustment').reduce((s,t) => s + t.amount,0);

  const categoryStats = useMemo(() => {
    const map = new Map<string, { rewards:number; stock:number; value:number }>();
    activeRewards.forEach(r => {
      const current = map.get(r.category) || { rewards:0, stock:0, value:0 };
      current.rewards++; current.stock += r.stock; current.value += r.price * r.stock; map.set(r.category,current);
    });
    return [...map.entries()].sort((a,b) => b[1].value-a[1].value);
  }, [activeRewards]);

  const topRewards = useMemo(() => {
    const counts = new Map<string, { title:string; count:number; spent:number }>();
    [...data.orders, ...data.redemptions].forEach(x => {
      const reward = activeRewards.find(r => r.id === x.reward_id) || data.rewards.find(r => r.id === x.reward_id);
      if (!reward) return;
      const current = counts.get(reward.id) || { title:reward.title, count:0, spent:0 };
      current.count++; current.spent += Number('price' in x ? x.price : x.cost) || 0; counts.set(reward.id,current);
    });
    return [...counts.values()].sort((a,b) => b.count-a.count).slice(0,6);
  }, [data.orders, data.redemptions, data.rewards, activeRewards]);

  const economyStatus = withBalance / Math.max(1, activeStudents.length) < 0.5
    ? { label:'Diqqat kerak', tone:'amber', text:'O‘quvchilarning yarmidan kamida SC bor.' }
    : periodSpend > periodEarn * 0.9
      ? { label:'Faol sarf', tone:'green', text:'SC aylanishi yaxshi.' }
      : { label:'Barqaror', tone:'blue', text:'Emission va sarf o‘rtasida zaxira bor.' };

  return <section className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><div className="flex items-center gap-2"><Gauge className="h-5 w-5 text-[#0071e3]" /><h2 className="text-2xl font-black">SchoolCoin iqtisodiyoti</h2></div><p className="mt-1 text-sm text-slate-500">Real Supabase ma’lumotlari asosida avtomatik hisoblanadi.</p></div>
      <div className="flex items-center gap-2">
        <select value={period} onChange={e => setPeriod(Number(e.target.value) as 7|30|0)} className="rounded-xl border bg-white px-3 py-2 text-sm"><option value={7}>7 kun</option><option value={30}>30 kun</option><option value={0}>Barcha vaqt</option></select>
        <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin':''}`} /> Yangilash</button>
      </div>
    </div>

    {error && <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-sm text-red-700"><AlertTriangle className="h-4 w-4" />{error}</div>}

    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
      <Card icon={<Users className="h-4 w-4"/>} title="Faol o‘quvchilar" value={money(activeStudents.length)} hint={`${money(withBalance)} tasida SC bor`} />
      <Card icon={<Coins className="h-4 w-4"/>} title="Jami SC supply" value={money(totalSupply)} hint="Balanslar yig‘indisi" tone="amber" />
      <Card icon={<Activity className="h-4 w-4"/>} title="O‘rtacha balans" value={`${money(avg)} SC`} hint="Faol o‘quvchilar" tone="violet" />
      <Card icon={<BarChart3 className="h-4 w-4"/>} title="Median balans" value={`${money(median)} SC`} hint="Markaziy qiymat" tone="blue" />
      <Card icon={<TrendingUp className="h-4 w-4"/>} title="SC chiqarilgan" value={`+${money(issued)}`} hint="Earn + reward" tone="green" />
      <Card icon={<TrendingDown className="h-4 w-4"/>} title="SC sarflangan" value={`−${money(normalSpent)}`} hint="Spend tranzaksiyalari" tone="red" />
      <Card icon={<ShoppingCart className="h-4 w-4"/>} title="Faol rewardlar" value={money(activeRewards.length)} hint={`${money(stock)} dona stock`} />
      <Card icon={<Package className="h-4 w-4"/>} title="Market qiymati" value={`${money(inventoryValue)} SC`} hint="Stock × narx" tone="amber" />
    </div>

    <div className="grid gap-5 lg:grid-cols-[1.4fr_.6fr]">
      <article className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between"><div><h3 className="font-black">📈 {period ? `${period} kunlik` : 'Umumiy'} iqtisodiy oqim</h3><p className="text-xs text-slate-500">Manual adjustmentlar alohida ko‘rsatiladi.</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${economyStatus.tone === 'green' ? 'bg-emerald-50 text-emerald-700' : economyStatus.tone === 'amber' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>{economyStatus.label}</span></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-emerald-50 p-4"><p className="text-xs text-emerald-700">Kirim</p><b className="text-xl text-slate-900">+{money(periodEarn)} SC</b></div>
          <div className="rounded-2xl bg-red-50 p-4"><p className="text-xs text-red-700">Chiqim</p><b className="text-xl text-slate-900">−{money(periodSpend)} SC</b></div>
          <div className="rounded-2xl bg-amber-50 p-4"><p className="text-xs text-amber-700">Adjustment</p><b className="text-xl text-slate-900">{periodAdjustment >= 0 ? '+' : '−'}{money(Math.abs(periodAdjustment))} SC</b></div>
        </div>
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{width:`${Math.min(100, periodEarn ? periodSpend/periodEarn*100 : 0)}%`}} /></div>
        <p className="mt-2 text-xs text-slate-500">Sarf/kirim nisbati: <b>{periodEarn ? pct(periodSpend/periodEarn*100) : '0.0%'}</b></p>
      </article>

      <article className="rounded-3xl bg-white p-5 shadow-sm">
        <h3 className="font-black">🛡️ Nazorat signallari</h3>
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl bg-slate-50 p-3"><span className="text-xs text-slate-500">O‘quvchi ishtiroki</span><b className="mt-1 block">{pct(withBalance/Math.max(1,activeStudents.length)*100)}</b></div>
          <div className="rounded-2xl bg-slate-50 p-3"><span className="text-xs text-slate-500">Kutilayotgan so‘rovlar</span><b className="mt-1 block">{pendingRequests}</b></div>
          <div className="rounded-2xl bg-slate-50 p-3"><span className="text-xs text-slate-500">Kutilayotgan buyurtmalar</span><b className="mt-1 block">{pendingOrders + pendingRedemptions}</b></div>
          <div className="rounded-2xl bg-slate-50 p-3"><span className="text-xs text-slate-500">Eng yuqori balans</span><b className="mt-1 block">{money(balances[0]?.balance || 0)} SC</b></div>
        </div>
      </article>
    </div>

    <div className="grid gap-5 lg:grid-cols-2">
      <article className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between"><h3 className="font-black">🏆 Eng katta balanslar</h3><span className="text-xs text-slate-400">Top 10</span></div>
        <div className="mt-4 space-y-2">{balances.slice(0,10).map((s,i) => <div key={s.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-white text-xs font-black">{i+1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{s.full_name}</p><p className="text-xs text-slate-500">{s.class_name}</p></div><b className="text-sm">{money(s.balance)} SC</b></div>)}{!balances.length && <p className="text-sm text-slate-500">Ma’lumot yo‘q.</p>}</div>
      </article>

      <article className="rounded-3xl bg-white p-5 shadow-sm">
        <h3 className="font-black">🛒 Market narxlari</h3>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Eng arzon</p><b>{money(minPrice)} SC</b></div>
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">O‘rtacha</p><b>{money(avgPrice)} SC</b></div>
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Eng qimmat</p><b>{money(maxPrice)} SC</b></div>
        </div>
        <div className="mt-5 space-y-3">{categoryStats.map(([category,stat]) => <div key={category}><div className="mb-1 flex justify-between text-xs"><span className="font-semibold">{category}</span><span>{stat.rewards} reward · {money(stat.stock)} dona</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#0071e3]" style={{width:`${Math.min(100, stat.value/Math.max(1,inventoryValue)*100*3)}%`}} /></div></div>)}</div>
      </article>
    </div>

    <div className="grid gap-5 lg:grid-cols-3">
      <article className="rounded-3xl bg-white p-5 shadow-sm"><h3 className="font-black">🔥 Eng ko‘p olingan rewardlar</h3><div className="mt-4 space-y-2">{topRewards.map((r,i)=><div key={r.title} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3"><span className="text-sm"><b>#{i+1}</b> {r.title}</span><span className="text-xs font-bold">{r.count} marta</span></div>)}{!topRewards.length&&<p className="text-sm text-slate-500">Hali redemption/order yo‘q.</p>}</div></article>
      <article className="rounded-3xl bg-white p-5 shadow-sm"><h3 className="font-black">📦 Stock nazorati</h3><div className="mt-4 space-y-2">{[...activeRewards].sort((a,b)=>a.stock-b.stock).slice(0,8).map(r=><div key={r.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3"><span className="truncate pr-3 text-sm">{r.title}</span><span className={`rounded-full px-2 py-1 text-xs font-bold ${r.stock <= 2 ? 'bg-red-100 text-red-700' : r.stock <= 5 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{r.stock} dona</span></div>)}</div></article>
      <article className="rounded-3xl bg-white p-5 shadow-sm"><h3 className="font-black">🚨 Anti-farming</h3><div className="mt-4 space-y-3"><div className="rounded-2xl bg-amber-50 p-4"><ShieldAlert className="h-5 w-5 text-amber-700"/><p className="mt-2 text-sm font-semibold">Manual adjustmentlar</p><b>{data.transactions.filter(t=>t.transaction_type==='adjustment').length} ta</b></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Eng katta balans</p><b>{money(balances[0]?.balance||0)} SC</b><p className="mt-1 text-xs text-slate-500">{balances[0]?.full_name || '—'}</p></div><p className="text-xs text-slate-500">Bu bo‘lim avtomatik ayblamaydi; faqat admin tekshirishi kerak bo‘lgan signallarni ko‘rsatadi.</p></div></article>
    </div>

    <article className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between"><div><h3 className="font-black">🧾 So‘nggi tranzaksiyalar</h3><p className="text-xs text-slate-500">Real SchoolCoin ledger</p></div><CreditCard className="h-5 w-5 text-slate-400"/></div>
      <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead><tr className="border-b text-xs text-slate-500"><th className="p-2">Sana</th><th className="p-2">O‘quvchi</th><th className="p-2">Turi</th><th className="p-2">Miqdor</th><th className="p-2">Izoh</th></tr></thead><tbody>{data.transactions.slice(0,12).map(t=>{const s=data.students.find(x=>x.id===t.student_id); return <tr key={t.id} className="border-b last:border-0"><td className="p-2 text-slate-500">{dateLabel(t.created_at)}</td><td className="p-2 font-semibold">{s?.full_name || 'Noma’lum'}</td><td className="p-2">{t.transaction_type}</td><td className={`p-2 font-bold ${t.amount>=0?'text-emerald-700':'text-red-700'}`}>{t.amount>=0?'+':''}{money(t.amount)} SC</td><td className="max-w-[260px] truncate p-2 text-slate-500">{t.note || '—'}</td></tr>})}</tbody></table></div>
    </article>
  </section>;
}
