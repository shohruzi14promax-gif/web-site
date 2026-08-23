import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, CheckCircle2, Coins, Gift, History, LayoutDashboard, LogOut, Plus, Search, ShoppingBag, SlidersHorizontal, Users, X, XCircle } from 'lucide-react';
import { signInAdmin, signOutAdmin, supabase } from '../lib/supabase';

interface Props { onClose: () => void; initialMode?: 'student' | 'admin'; adminSession?: { user?: { email?: string; app_metadata?: { role?: string } } } | null; }
type Student = { id: string; student_code: string; full_name: string; class_name: string; active?: boolean; balance: number };
type ActivityItem = { id: string; name: string; category: string; coin_reward: number; description?: string; max_per_month?: number | null; requires_evidence?: boolean };
type Reward = { id: string; title: string; description: string; category: string; price: number; stock: number; image?: string };
type Order = { id: string; status: string; price: number; created_at: string; reward_title: string };
type RequestItem = { id: string; status: string; created_at: string; student?: { full_name?: string; student_code?: string } | null; activity?: { name?: string; coin_reward?: number } | null };
type Transaction = { id: string; student_id: string; amount: number; transaction_type: string; note?: string; created_at: string };
type StudentTransaction = { amount: number; transaction_type: string; note?: string; created_at: string };
type StudentRequest = { activity_name: string; status: string; created_at: string; evidence_url?: string | null; note?: string | null; reviewed_at?: string | null };
type AdminTab = 'dashboard' | 'students' | 'activities' | 'approvals' | 'market' | 'orders' | 'transactions';

export default function SchoolCoinSecure({ onClose, initialMode = 'student', adminSession = null }: Props) {
  const [mode, setMode] = useState<'student' | 'admin'>(initialMode);
  const [student, setStudent] = useState<Student | null>(null);
  const [code, setCode] = useState('');
  const [pin, setPin] = useState('');
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [studentTransactions, setStudentTransactions] = useState<StudentTransaction[]>([]);
  const [studentRequests, setStudentRequests] = useState<StudentRequest[]>([]);
  const [adminState, setAdminState] = useState(adminSession);
  const [students, setStudents] = useState<Student[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [activityName, setActivityName] = useState('');
  const [activityCategory, setActivityCategory] = useState('Sport');
  const [activityReward, setActivityReward] = useState('10');
  const [activityLimit, setActivityLimit] = useState('');
  const [activityEvidence, setActivityEvidence] = useState(false);
  const [adjustingStudent, setAdjustingStudent] = useState<Student | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const admin = adminState?.user?.app_metadata?.role === 'admin';

  const fail = useCallback((value: unknown, fallback: string) => setError(value instanceof Error ? value.message : fallback), []);
  const flash = useCallback((message: string) => { setNotice(message); window.setTimeout(() => setNotice(''), 2200); }, []);

  const loadCatalog = useCallback(async () => {
    const [activitiesResult, rewardsResult] = await Promise.all([
      supabase.from('schoolcoin_activities').select('*').eq('active', true).order('category').order('coin_reward', { ascending: false }),
      supabase.from('schoolcoin_market_rewards').select('*').eq('active', true).order('category').order('price'),
    ]);
    if (activitiesResult.error) throw activitiesResult.error;
    if (rewardsResult.error) throw rewardsResult.error;
    setActivities((activitiesResult.data || []) as ActivityItem[]);
    setRewards((rewardsResult.data || []) as Reward[]);
  }, []);

  const loadStudentHistory = useCallback(async () => {
    const [ordersResult, txResult, requestsResult] = await Promise.all([
      supabase.rpc('schoolcoin_student_orders'),
      supabase.rpc('schoolcoin_student_transactions'),
      supabase.rpc('schoolcoin_student_requests'),
    ]);
    if (ordersResult.error) throw ordersResult.error;
    if (txResult.error) throw txResult.error;
    if (requestsResult.error) throw requestsResult.error;
    setOrders((ordersResult.data || []) as Order[]);
    setStudentTransactions((txResult.data || []) as StudentTransaction[]);
    setStudentRequests((requestsResult.data || []) as StudentRequest[]);
  }, []);

  const loadAdmin = useCallback(async () => {
    setBusy(true);
    setError('');
    try {
      const [sr, rr, tr, or, ar, mr] = await Promise.all([
        supabase.rpc('schoolcoin_admin_student_balances'),
        supabase.from('schoolcoin_requests').select('id,status,created_at,student_id,activity_id,schoolcoin_students(full_name,student_code),schoolcoin_activities(name,coin_reward)').eq('status', 'pending').order('created_at', { ascending: false }),
        supabase.from('schoolcoin_transactions').select('id,student_id,amount,transaction_type,note,created_at').order('created_at', { ascending: false }).limit(100),
        supabase.from('schoolcoin_orders').select('id,status,price,created_at,schoolcoin_market_rewards(title)').order('created_at', { ascending: false }),
        supabase.from('schoolcoin_activities').select('*').eq('active', true).order('category').order('coin_reward', { ascending: false }),
        supabase.from('schoolcoin_market_rewards').select('*').eq('active', true).order('category').order('price'),
      ]);
      for (const result of [sr, rr, tr, or, ar, mr]) if (result.error) throw result.error;
      setStudents((sr.data || []) as Student[]);
      setTransactions((tr.data || []) as Transaction[]);
      setActivities((ar.data || []) as ActivityItem[]);
      setRewards((mr.data || []) as Reward[]);
      setRequests(((rr.data || []) as Array<Record<string, unknown>>).map(row => ({
        id: String(row.id), status: String(row.status), created_at: String(row.created_at),
        student: (row.schoolcoin_students as { full_name?: string; student_code?: string } | null) || null,
        activity: (row.schoolcoin_activities as { name?: string; coin_reward?: number } | null) || null,
      })));
      setOrders(((or.data || []) as Array<Record<string, unknown>>).map(row => ({
        id: String(row.id), status: String(row.status), price: Number(row.price), created_at: String(row.created_at),
        reward_title: String((row.schoolcoin_market_rewards as { title?: string } | null)?.title || 'Reward'),
      })));
    } catch (err) {
      fail(err, 'Admin ma’lumotlari yuklanmadi');
    } finally {
      setBusy(false);
    }
  }, [fail]);

  useEffect(() => setAdminState(adminSession), [adminSession]);
  useEffect(() => { if (mode === 'student' && !student) void loadCatalog().catch(err => fail(err, 'SchoolCoin katalogi yuklanmadi')); }, [mode, student, loadCatalog, fail]);
  useEffect(() => { if (mode === 'admin' && admin) void loadAdmin(); }, [mode, admin, loadAdmin]);

  const studentLogin = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      const auth = await supabase.auth.getSession();
      if (!auth.data.session?.user?.is_anonymous) {
        const signed = await supabase.auth.signInAnonymously();
        if (signed.error) throw signed.error;
      }
      const binding = await supabase.rpc('schoolcoin_bind_student', { p_code: code.trim(), p_pin: pin });
      if (binding.error) throw binding.error;
      const current = await supabase.rpc('schoolcoin_current_student');
      if (current.error) throw current.error;
      if (!current.data) throw new Error('Student hisobi topilmadi.');
      setStudent(current.data as Student);
      await loadStudentHistory();
      flash('SchoolCoin hisobingiz ochildi ✓');
    } catch (err) {
      fail(err, 'Kirishda xatolik');
    } finally {
      setBusy(false);
    }
  };

  const studentLogout = async () => {
    await supabase.auth.signOut();
    setStudent(null); setOrders([]); setStudentTransactions([]); setStudentRequests([]); setCode(''); setPin('');
    flash('SchoolCoin sessiyasi yopildi');
  };

  const submitActivity = async (activityId: string) => {
    setBusy(true); setError('');
    try {
      const result = await supabase.rpc('schoolcoin_submit_request', { p_activity_id: activityId, p_evidence_url: null, p_note: null });
      if (result.error) throw result.error;
      await loadStudentHistory();
      flash('So‘rov yuborildi ✓');
    } catch (err) { fail(err, 'So‘rov yuborilmadi'); } finally { setBusy(false); }
  };

  const redeem = async (reward: Reward) => {
    if (!student || reward.stock < 1) return;
    setBusy(true); setError('');
    try {
      const result = await supabase.rpc('schoolcoin_market_redeem', { p_reward_id: reward.id });
      if (result.error) throw result.error;
      const newBalance = Number((result.data as { new_balance?: number } | null)?.new_balance ?? student.balance - reward.price);
      setStudent(prev => prev ? { ...prev, balance: newBalance } : prev);
      await Promise.all([loadStudentHistory(), loadCatalog()]);
      flash('Buyurtma yuborildi 🎁');
    } catch (err) { fail(err, 'Redeem amalga oshmadi'); } finally { setBusy(false); }
  };

  const adminLogin = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError('');
    try { const result = await signInAdmin(adminEmail.trim(), adminPassword); setAdminState(result.session as typeof adminState); setMode('admin'); setAdminPassword(''); }
    catch (err) { fail(err, 'Admin kirishda xatolik'); } finally { setBusy(false); }
  };

  const approve = async (requestId: string, allow: boolean) => {
    setBusy(true); setError('');
    try { const result = await supabase.rpc('schoolcoin_admin_approve_request', { p_request_id: requestId, p_approve: allow }); if (result.error) throw result.error; flash(allow ? 'Coin berildi ✓' : 'So‘rov rad etildi'); await loadAdmin(); }
    catch (err) { fail(err, 'Amal bajarilmadi'); } finally { setBusy(false); }
  };

  const updateOrder = async (id: string, status: 'pending' | 'approved' | 'ready' | 'delivered' | 'rejected') => {
    setBusy(true); setError('');
    try { const result = await supabase.rpc('schoolcoin_admin_update_order_status', { p_order_id: id, p_status: status, p_reason: null }); if (result.error) throw result.error; flash('Buyurtma yangilandi ✓'); await loadAdmin(); }
    catch (err) { fail(err, 'Buyurtma yangilanmadi'); } finally { setBusy(false); }
  };

  const createActivity = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const reward = Number(activityReward);
      const limit = activityLimit.trim() ? Number(activityLimit) : null;
      if (!activityName.trim() || !activityCategory.trim() || !Number.isInteger(reward) || reward <= 0) throw new Error('Faoliyat nomi, kategoriya va musbat coin reward kerak.');
      if (limit !== null && (!Number.isInteger(limit) || limit <= 0)) throw new Error('Oylik limit musbat butun son bo‘lishi kerak.');
      const result = await supabase.rpc('schoolcoin_admin_create_activity', { p_name: activityName.trim(), p_category: activityCategory.trim(), p_coin_reward: reward, p_max_per_month: limit, p_requires_evidence: activityEvidence });
      if (result.error) throw result.error;
      setActivityName(''); setActivityReward('10'); setActivityLimit(''); setActivityEvidence(false);
      flash('Faoliyat qo‘shildi ✓'); await loadAdmin();
    } catch (err) { fail(err, 'Faoliyat qo‘shilmadi'); } finally { setBusy(false); }
  };

  const adjustBalance = async (event: FormEvent) => {
    event.preventDefault();
    if (!adjustingStudent) return;
    setBusy(true); setError('');
    try {
      const amount = Number(adjustAmount);
      if (!Number.isInteger(amount) || amount === 0) throw new Error('Adjustment miqdori 0 bo‘lmagan butun son bo‘lishi kerak.');
      if (!adjustReason.trim()) throw new Error('Adjustment sababi talab qilinadi.');
      const result = await supabase.rpc('schoolcoin_admin_adjust_balance', { p_student_id: adjustingStudent.id, p_amount: amount, p_reason: adjustReason.trim() });
      if (result.error) throw result.error;
      setAdjustingStudent(null); setAdjustAmount(''); setAdjustReason('');
      flash('Balans yangilandi ✓'); await loadAdmin();
    } catch (err) { fail(err, 'Balans yangilanmadi'); } finally { setBusy(false); }
  };

  const logout = async () => { await signOutAdmin(); setAdminState(null); setMode('student'); };
  const categories = ['All', ...Array.from(new Set(activities.map(item => item.category).filter(Boolean)))];
  const filteredActivities = category === 'All' ? activities : activities.filter(item => item.category === category);
  const filteredStudents = useMemo(() => { const q = search.trim().toLowerCase(); return q ? students.filter(item => `${item.full_name} ${item.student_code} ${item.class_name}`.toLowerCase().includes(q)) : students; }, [students, search]);
  const totalCoins = students.reduce((sum, item) => sum + item.balance, 0);

  return <div className="fixed inset-0 z-[120] overflow-auto bg-slate-950/70 p-3 backdrop-blur-xl md:p-6 motion-reduce:backdrop-blur-none">
    <div className="mx-auto min-h-[calc(100vh-24px)] max-w-7xl overflow-hidden rounded-[28px] bg-slate-50 shadow-2xl">
      <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur md:px-6">
        <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-100 text-amber-600"><Coins /></div><div><h1 className="text-lg font-black">SchoolCoin</h1><p className="text-xs text-slate-500">Student economy & rewards</p></div></div>
        <div className="flex flex-wrap gap-2"><button type="button" onClick={() => setMode('student')} className={`min-h-10 rounded-xl px-3 py-2 text-sm font-semibold transition ${mode === 'student' ? 'bg-slate-900 text-white' : 'bg-slate-100 hover:bg-slate-200'}`}>Student</button><button type="button" onClick={() => setMode('admin')} className={`min-h-10 rounded-xl px-3 py-2 text-sm font-semibold transition ${mode === 'admin' ? 'bg-slate-900 text-white' : 'bg-slate-100 hover:bg-slate-200'}`}>Admin</button><button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-slate-100" aria-label="Yopish"><X /></button></div>
      </header>
      <main className="p-4 md:p-6">
        {error && <div role="alert" className="mb-4 flex items-center justify-between rounded-2xl border border-red-100 bg-red-50 p-3 text-sm text-red-700"><span>{error}</span><button type="button" onClick={() => setError('')} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-red-100" aria-label="Xatoni yopish"><X className="h-4 w-4" /></button></div>}
        {notice && <div role="status" className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{notice}</div>}

        {mode === 'student' && !student && <section className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="mb-6 text-center"><Coins className="mx-auto h-10 w-10 text-amber-500" /><h2 className="mt-3 text-2xl font-black">Student Login</h2><p className="mt-1 text-sm text-slate-500">Student kodi va PIN orqali xavfsiz kirish</p></div>
          <form onSubmit={studentLogin} className="space-y-3"><label className="block text-sm font-semibold">Student code<input required value={code} onChange={e => setCode(e.target.value)} placeholder="Student code" autoComplete="username" className="mt-1 w-full rounded-2xl border border-slate-200 p-3.5 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200" /></label><label className="block text-sm font-semibold">PIN<input required value={pin} onChange={e => setPin(e.target.value)} placeholder="PIN" type="password" inputMode="numeric" autoComplete="current-password" className="mt-1 w-full rounded-2xl border border-slate-200 p-3.5 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200" /></label><button disabled={busy} className="min-h-11 w-full rounded-2xl bg-slate-900 p-3.5 font-semibold text-white transition active:scale-[.98] disabled:opacity-50">{busy ? 'Tekshirilmoqda…' : 'Kirish'}</button></form>
        </section>}

        {mode === 'student' && student && <section className="space-y-6">
          <div className="grid gap-4 md:grid-cols-[1fr_auto]"><div className="rounded-3xl bg-slate-900 p-6 text-white"><p className="text-sm text-white/60">Student</p><h2 className="mt-1 text-2xl font-black">{student.full_name}</h2><p className="mt-1 text-sm text-white/60">{student.class_name} · {student.student_code}</p></div><div className="flex items-center justify-between gap-4 rounded-3xl bg-amber-50 p-6 md:block md:text-right"><div><p className="text-xs font-bold uppercase text-amber-700">Balance</p><p className="mt-1 text-4xl font-black text-amber-700">{student.balance}</p></div><button type="button" onClick={() => void studentLogout()} className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">Chiqish</button></div></div>
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex gap-2 overflow-x-auto pb-1">{categories.map(item => <button type="button" key={item} onClick={() => setCategory(item)} className={`min-h-10 shrink-0 rounded-full px-3 py-2 text-xs font-semibold ${category === item ? 'bg-slate-900 text-white' : 'bg-slate-100 hover:bg-slate-200'}`}>{item}</button>)}</div><div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{filteredActivities.map(item => <article key={item.id} className="rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none"><div className="flex items-start justify-between gap-3"><h3 className="font-bold">{item.name}</h3><span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">+{item.coin_reward}</span></div><p className="mt-2 text-sm text-slate-500">{item.description || 'Faoliyat uchun SchoolCoin oling.'}</p><button disabled={busy} type="button" onClick={() => void submitActivity(item.id)} className="mt-4 min-h-11 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white transition active:scale-[.98] disabled:opacity-50">So‘rov yuborish</button></article>)}</div></section>
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><Gift className="h-5 w-5 text-amber-600" /><h3 className="font-bold">Market</h3></div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{rewards.map(item => <article key={item.id} className="rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none"><div className="flex items-center justify-between gap-3"><h4 className="font-bold">{item.title}</h4><span className="font-bold text-amber-600">{item.price}</span></div><p className="mt-2 text-sm text-slate-500">{item.description}</p><button disabled={busy || item.stock < 1 || student.balance < item.price} type="button" onClick={() => void redeem(item)} className="mt-4 min-h-11 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white disabled:opacity-40">{item.stock < 1 ? 'Tugagan' : student.balance < item.price ? 'Coin yetarli emas' : 'Sotib olish'}</button></article>)}</div></section>
          <div className="grid gap-6 lg:grid-cols-2"><section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="mb-4 flex items-center gap-2 font-bold"><History className="h-5 w-5" />Coin tarixi</h3>{studentTransactions.length ? <div className="space-y-2">{studentTransactions.slice(0, 20).map((item, index) => <div key={`${item.created_at}-${index}`} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3"><div><b>{item.transaction_type}</b><p className="text-xs text-slate-500">{item.note || 'SchoolCoin transaction'}</p></div><span className={item.amount >= 0 ? 'font-black text-emerald-600' : 'font-black text-red-600'}>{item.amount > 0 ? '+' : ''}{item.amount}</span></div>)}</div> : <p className="text-sm text-slate-500">Hozircha transaction yo‘q.</p>}</section><section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="mb-4 font-bold">Faoliyat so‘rovlari</h3>{studentRequests.length ? <div className="space-y-2">{studentRequests.slice(0, 20).map((item, index) => <div key={`${item.created_at}-${index}`} className="rounded-2xl bg-slate-50 p-3"><div className="flex items-center justify-between gap-3"><b>{item.activity_name}</b><span className="text-xs font-semibold">{item.status}</span></div><p className="mt-1 text-xs text-slate-500">{new Date(item.created_at).toLocaleString()}</p></div>)}</div> : <p className="text-sm text-slate-500">Hozircha so‘rov yo‘q.</p>}</section></div>
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="mb-4 flex items-center gap-2 font-bold"><ShoppingBag className="h-5 w-5" />Buyurtmalar tarixi</h3>{orders.length ? <div className="space-y-2">{orders.map(item => <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3"><div><b>{item.reward_title}</b><p className="text-xs text-slate-500">{new Date(item.created_at).toLocaleString()}</p></div><div className="text-right"><b>{item.price}</b><p className="text-xs text-slate-500">{item.status}</p></div></div>)}</div> : <p className="text-sm text-slate-500">Hozircha buyurtma yo‘q.</p>}</section>
        </section>}

        {mode === 'admin' && !admin && <section className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><div className="mb-6 text-center"><LayoutDashboard className="mx-auto h-10 w-10" /><h2 className="mt-3 text-2xl font-black">SchoolCoin Admin</h2><p className="mt-1 text-sm text-slate-500">Faqat admin akkauntlari uchun</p></div><form onSubmit={adminLogin} className="space-y-3"><label className="block text-sm font-semibold">Admin email<input required type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="Admin email" autoComplete="username" className="mt-1 w-full rounded-2xl border p-3.5" /></label><label className="block text-sm font-semibold">Parol<input required type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} placeholder="Parol" autoComplete="current-password" className="mt-1 w-full rounded-2xl border p-3.5" /></label><button disabled={busy} className="min-h-11 w-full rounded-2xl bg-slate-900 p-3.5 font-semibold text-white disabled:opacity-50">{busy ? 'Tekshirilmoqda…' : 'Kirish'}</button></form></section>}

        {mode === 'admin' && admin && <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="rounded-3xl bg-slate-900 p-3 text-white lg:sticky lg:top-24 lg:h-fit">{([['dashboard', LayoutDashboard, 'Dashboard'], ['students', Users, 'Students'], ['activities', Activity, 'Activities'], ['approvals', CheckCircle2, 'Approvals'], ['market', Gift, 'Market'], ['orders', ShoppingBag, 'Orders'], ['transactions', History, 'Transactions']] as const).map(([id, Icon, label]) => <button type="button" key={id} onClick={() => setTab(id)} className={`mb-1 flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold transition ${tab === id ? 'bg-white text-slate-900' : 'text-white/75 hover:bg-white/10'}`}><Icon className="h-4 w-4" />{label}</button>)}<button type="button" onClick={() => void logout()} className="mt-4 flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-red-300 hover:bg-white/10"><LogOut className="h-4 w-4" />Chiqish</button></aside>
          <section className="space-y-5">
            {tab === 'dashboard' && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-3xl border border-slate-200 bg-white p-5"><p className="text-xs text-slate-500">Students</p><p className="mt-2 text-3xl font-black">{students.length}</p></div><div className="rounded-3xl border border-slate-200 bg-white p-5"><p className="text-xs text-slate-500">SchoolCoin</p><p className="mt-2 text-3xl font-black">{totalCoins}</p></div><div className="rounded-3xl border border-slate-200 bg-white p-5"><p className="text-xs text-slate-500">Approvals</p><p className="mt-2 text-3xl font-black">{requests.length}</p></div><div className="rounded-3xl border border-slate-200 bg-white p-5"><p className="text-xs text-slate-500">Pending orders</p><p className="mt-2 text-3xl font-black">{orders.filter(o => o.status === 'pending').length}</p></div></div>}
            {tab === 'students' && <div className="rounded-3xl border border-slate-200 bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold">Students</h3><p className="text-xs text-slate-500">Balance adjustment server-side RPC orqali himoyalangan.</p></div><div className="relative w-full sm:w-auto"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Qidirish" aria-label="Student qidirish" className="w-full rounded-xl border py-2.5 pl-9 pr-3 text-sm sm:w-64" /></div></div><div className="mt-4 overflow-x-auto rounded-2xl border border-slate-100"><table className="min-w-[680px] w-full text-sm"><thead><tr className="border-b text-left text-slate-500"><th className="px-3 py-3">Student</th><th className="px-3 py-3">Class</th><th className="px-3 py-3">Code</th><th className="px-3 py-3">Balance</th><th className="px-3 py-3">Action</th></tr></thead><tbody>{filteredStudents.map(item => <tr key={item.id} className="border-b last:border-0"><td className="px-3 py-3 font-semibold">{item.full_name}</td><td className="px-3 py-3">{item.class_name}</td><td className="px-3 py-3">{item.student_code}</td><td className="px-3 py-3 font-bold">{item.balance}</td><td className="px-3 py-3"><button type="button" onClick={() => setAdjustingStudent(item)} className="inline-flex min-h-10 items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white"><SlidersHorizontal className="h-3.5 w-3.5" />Adjust</button></td></tr>)}</tbody></table></div></div>}
            {tab === 'activities' && <div className="space-y-4"><div className="rounded-3xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2"><Plus className="h-5 w-5" /><div><h3 className="font-bold">Activity yaratish</h3><p className="text-xs text-slate-500">Mavjud admin RPC ishlatiladi; business logic o‘zgarmaydi.</p></div></div><form onSubmit={createActivity} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><input required value={activityName} onChange={e => setActivityName(e.target.value)} placeholder="Activity nomi" aria-label="Activity nomi" className="rounded-xl border p-3" /><input required value={activityCategory} onChange={e => setActivityCategory(e.target.value)} placeholder="Kategoriya" aria-label="Kategoriya" className="rounded-xl border p-3" /><input required min="1" type="number" value={activityReward} onChange={e => setActivityReward(e.target.value)} placeholder="Coin" aria-label="Coin reward" className="rounded-xl border p-3" /><input min="1" type="number" value={activityLimit} onChange={e => setActivityLimit(e.target.value)} placeholder="Oylik limit" aria-label="Oylik limit" className="rounded-xl border p-3" /><label className="flex items-center gap-2 rounded-xl border p-3 text-sm"><input type="checkbox" checked={activityEvidence} onChange={e => setActivityEvidence(e.target.checked)} /> Evidence</label><button disabled={busy} className="min-h-11 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-50 sm:col-span-2 lg:col-span-5">{busy ? 'Saqlanmoqda…' : 'Activity qo‘shish'}</button></form></div><div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="font-bold">Activities · {activities.length}</h3><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{activities.map(item => <div key={item.id} className="rounded-2xl border p-4"><div className="flex justify-between gap-3"><b>{item.name}</b><span className="text-xs font-bold text-amber-700">+{item.coin_reward}</span></div><p className="mt-1 text-xs text-slate-500">{item.category}{item.max_per_month ? ` · ${item.max_per_month}/oy` : ''}</p></div>)}</div></div></div>}
            {tab === 'approvals' && <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="font-bold">Approvals</h3><div className="mt-4 space-y-3">{requests.length ? requests.map(item => <div key={item.id} className="flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between"><div><b>{item.student?.full_name || 'Student'} · {item.activity?.name || 'Activity'}</b><p className="text-sm text-slate-500">+{item.activity?.coin_reward || 0} coin</p></div><div className="flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={() => void approve(item.id, true)} className="min-h-10 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"><CheckCircle2 className="mr-1 inline h-4 w-4" />Tasdiqlash</button><button type="button" disabled={busy} onClick={() => void approve(item.id, false)} className="min-h-10 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"><XCircle className="mr-1 inline h-4 w-4" />Rad etish</button></div></div>) : <p className="text-sm text-slate-500">Kutilayotgan so‘rov yo‘q.</p>}</div></div>}
            {tab === 'market' && <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="font-bold">Market · {rewards.length}</h3><p className="mt-2 text-sm text-slate-500">Market rewardlar o‘qish uchun ochiq. Hozirgi production backendda market reward CRUD uchun xavfsiz admin RPC yoki write policy mavjud emas; shu sababli bu auditda backend xavfsizligini zaiflashtiradigan write access qo‘shilmadi.</p><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{rewards.map(item => <div key={item.id} className="rounded-2xl border p-4"><div className="flex items-center justify-between gap-3"><b>{item.title}</b><span className="font-bold text-amber-600">{item.price}</span></div><p className="mt-1 text-xs text-slate-500">Stock: {item.stock} · {item.category}</p></div>)}</div></div>}
            {tab === 'orders' && <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="font-bold">Orders · {orders.length}</h3><div className="mt-4 space-y-3">{orders.length ? orders.map(item => <div key={item.id} className="flex flex-col gap-3 rounded-2xl border p-4 lg:flex-row lg:items-center lg:justify-between"><div><b>{item.reward_title}</b><p className="text-sm text-slate-500">{item.price} coin · {item.status}</p></div><div className="flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={() => void updateOrder(item.id, 'approved')} className="min-h-10 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white">Approved</button><button type="button" disabled={busy} onClick={() => void updateOrder(item.id, 'ready')} className="min-h-10 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white">Ready</button><button type="button" disabled={busy} onClick={() => void updateOrder(item.id, 'delivered')} className="min-h-10 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">Delivered</button><button type="button" disabled={busy} onClick={() => void updateOrder(item.id, 'rejected')} className="min-h-10 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">Rejected</button></div></div>) : <p className="text-sm text-slate-500">Buyurtma yo‘q.</p>}</div></div>}
            {tab === 'transactions' && <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="font-bold">Transactions · {transactions.length}</h3><div className="mt-4 space-y-2">{transactions.length ? transactions.map(item => <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3"><div><b>{item.transaction_type}</b><p className="text-xs text-slate-500">{item.note || item.student_id}</p></div><span className={item.amount >= 0 ? 'font-black text-emerald-600' : 'font-black text-red-600'}>{item.amount > 0 ? '+' : ''}{item.amount}</span></div>) : <p className="text-sm text-slate-500">Transaction yo‘q.</p>}</div></div>}
          </section>
        </div>}
      </main>
    </div>
    {adjustingStudent && <div className="fixed inset-0 z-[220] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm motion-reduce:backdrop-blur-none" role="presentation" onClick={() => setAdjustingStudent(null)}><form onSubmit={adjustBalance} onClick={event => event.stopPropagation()} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="adjust-title"><div className="mb-5 flex items-center justify-between"><div><h2 id="adjust-title" className="text-xl font-black">Balance adjustment</h2><p className="text-sm text-slate-500">{adjustingStudent.full_name}</p></div><button type="button" onClick={() => setAdjustingStudent(null)} className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-slate-100" aria-label="Yopish"><X /></button></div><div className="space-y-3"><label className="block text-sm font-semibold">Amount<input required type="number" value={adjustAmount} onChange={e => setAdjustAmount(e.target.value)} placeholder="Masalan: 20 yoki -20" className="mt-1 w-full rounded-xl border p-3" /></label><label className="block text-sm font-semibold">Sabab<textarea required value={adjustReason} onChange={e => setAdjustReason(e.target.value)} placeholder="Adjustment sababi" className="mt-1 min-h-24 w-full rounded-xl border p-3" /></label></div><button disabled={busy} className="mt-5 min-h-11 w-full rounded-xl bg-slate-900 p-3 font-semibold text-white disabled:opacity-50">{busy ? 'Saqlanmoqda…' : 'Adjustment saqlash'}</button></form></div>}
  </div>;
}
