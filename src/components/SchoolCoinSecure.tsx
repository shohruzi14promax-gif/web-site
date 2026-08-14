import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Coins,
  Gift,
  History,
  LayoutDashboard,
  LogIn,
  LogOut,
  Package,
  Search,
  ShoppingBag,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { signInAdmin, signOutAdmin, supabase } from '../lib/supabase';

interface Props {
  onClose: () => void;
  initialMode?: 'student' | 'admin';
  adminSession?: { user?: { email?: string; app_metadata?: { role?: string } } } | null;
}

type Student = {
  id: string;
  student_code: string;
  full_name: string;
  class_name: string;
  balance: number;
};

type ActivityItem = {
  id: string;
  name: string;
  category: string;
  coin_reward: number;
  description?: string;
};

type Reward = {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  image?: string;
};

type Order = {
  id: string;
  status: string;
  price: number;
  created_at: string;
  reward_title: string;
};

type RequestItem = {
  id: string;
  status: string;
  created_at: string;
  student_id: string;
  activity_id: string;
  student?: { full_name?: string; student_code?: string } | null;
  activity?: { name?: string; coin_reward?: number } | null;
};

type AdminStudent = Student;
type Transaction = { id: string; student_id: string; amount: number; transaction_type: string; note?: string; created_at: string };
type AdminTab = 'dashboard' | 'students' | 'activities' | 'approvals' | 'market' | 'orders' | 'transactions';

const categoryLabels: Record<string, string> = {
  Academic: '📚 Academic',
  Sport: '🏃 Sport',
  'Culture & Creativity': '🎨 Culture & Creativity',
  'Leadership & Volunteering': '🤝 Leadership & Volunteering',
  Technology: '💻 Technology',
  Environment: '🌱 Environment',
  'Personal Development': '📖 Personal Development',
  Achievements: '🏆 Achievements',
};

export default function SchoolCoinSecure({ onClose, initialMode = 'student', adminSession = null }: Props) {
  const [mode, setMode] = useState<'student' | 'admin'>(initialMode);
  const [student, setStudent] = useState<Student | null>(null);
  const [code, setCode] = useState('');
  const [pin, setPin] = useState('');
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [adminSessionState, setAdminSessionState] = useState(adminSession);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [studentSearch, setStudentSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    setAdminSessionState(adminSession);
  }, [adminSession]);

  useEffect(() => {
    if (mode !== 'student' || student) return;
    const loadCatalog = async () => {
      const [activityResult, rewardResult] = await Promise.all([
        supabase.from('schoolcoin_activities').select('*').eq('active', true).order('category').order('coin_reward', { ascending: false }),
        supabase.from('schoolcoin_market_rewards').select('*').eq('active', true).order('category').order('price'),
      ]);
      if (activityResult.error) setError(activityResult.error.message);
      if (rewardResult.error) setError(rewardResult.error.message);
      setActivities((activityResult.data || []) as ActivityItem[]);
      setRewards((rewardResult.data || []) as Reward[]);
    };
    void loadCatalog();
  }, [mode, student]);

  useEffect(() => {
    if (mode !== 'admin' || adminSessionState?.user?.app_metadata?.role !== 'admin') return;
    void loadAdmin();
  }, [mode, adminSessionState]);

  const flash = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2400);
  };

  const loadStudentOrders = async () => {
    const { data, error: orderError } = await supabase.rpc('schoolcoin_student_orders', { p_code: code, p_pin: pin });
    if (orderError) throw orderError;
    setOrders((data || []) as Order[]);
  };

  const studentLogin = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data, error: loginError } = await supabase.rpc('schoolcoin_student_login', {
        p_code: code.trim(),
        p_pin: pin,
      });
      if (loginError) throw loginError;
      const nextStudent = data as Student;
      setStudent(nextStudent);
      await loadStudentOrders();
      flash('SchoolCoin hisobingiz ochildi ✨');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kirishda xatolik');
    } finally {
      setBusy(false);
    }
  };

  const submitActivity = async (activityId: string) => {
    setBusy(true);
    setError('');
    try {
      const { error: requestError } = await supabase.rpc('schoolcoin_submit_request', {
        p_code: code.trim(),
        p_pin: pin,
        p_activity_id: activityId,
        p_evidence_url: null,
        p_note: null,
      });
      if (requestError) throw requestError;
      flash('Faoliyat so‘rovi yuborildi. Admin tasdiqlagach coin qo‘shiladi.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'So‘rov yuborilmadi');
    } finally {
      setBusy(false);
    }
  };

  const redeemReward = async (reward: Reward) => {
    if (!student || reward.stock < 1) return;
    setBusy(true);
    setError('');
    try {
      const { data, error: redeemError } = await supabase.rpc('schoolcoin_market_redeem', {
        p_code: code.trim(),
        p_pin: pin,
        p_reward_id: reward.id,
      });
      if (redeemError) throw redeemError;
      setStudent(prev => prev ? { ...prev, balance: Number((data as { new_balance?: number } | null)?.new_balance ?? prev.balance - reward.price) } : prev);
      await loadStudentOrders();
      const { data: marketData } = await supabase.from('schoolcoin_market_rewards').select('*').eq('active', true).order('category').order('price');
      setRewards((marketData || []) as Reward[]);
      flash('Buyurtma yuborildi 🎁');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Redeem amalga oshmadi');
    } finally {
      setBusy(false);
    }
  };

  const loadAdmin = async () => {
    setBusy(true);
    setError('');
    try {
      const [ordersResult, requestResult, studentsResult, txResult, activitiesResult, rewardsResult] = await Promise.all([
        supabase.from('schoolcoin_orders').select('id,status,price,created_at,student_id,schoolcoin_students(full_name,student_code),schoolcoin_market_rewards(title)').order('created_at', { ascending: false }),
        supabase.from('schoolcoin_requests').select('id,status,created_at,student_id,activity_id,schoolcoin_students(full_name,student_code),schoolcoin_activities(name,coin_reward)').eq('status', 'pending').order('created_at', { ascending: false }),
        supabase.from('schoolcoin_students').select('id,student_code,full_name,class_name,balance').order('class_name').order('full_name'),
        supabase.from('schoolcoin_transactions').select('id,student_id,amount,transaction_type,note,created_at').order('created_at', { ascending: false }).limit(100),
        supabase.from('schoolcoin_activities').select('*').eq('active', true).order('category').order('coin_reward', { ascending: false }),
        supabase.from('schoolcoin_market_rewards').select('*').eq('active', true).order('category').order('price'),
      ]);
      for (const result of [ordersResult, requestResult, studentsResult, txResult, activitiesResult, rewardsResult]) {
        if (result.error) throw result.error;
      }
      setOrders(((ordersResult.data || []) as Array<Record<string, unknown>>).map(row => ({
        id: String(row.id),
        status: String(row.status),
        price: Number(row.price),
        created_at: String(row.created_at),
        reward_title: String((row.schoolcoin_market_rewards as { title?: string } | null)?.title || 'Reward'),
      })));
      setRequests(((requestResult.data || []) as Array<Record<string, unknown>>).map(row => ({
        id: String(row.id),
        status: String(row.status),
        created_at: String(row.created_at),
        student_id: String(row.student_id),
        activity_id: String(row.activity_id),
        student: (row.schoolcoin_students as { full_name?: string; student_code?: string } | null) || null,
        activity: (row.schoolcoin_activities as { name?: string; coin_reward?: number } | null) || null,
      })));
      setStudents((studentsResult.data || []) as AdminStudent[]);
      setTransactions((txResult.data || []) as Transaction[]);
      setActivities((activitiesResult.data || []) as ActivityItem[]);
      setRewards((rewardsResult.data || []) as Reward[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Admin ma’lumotlari yuklanmadi');
    } finally {
      setBusy(false);
    }
  };

  const adminLogin = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const result = await signInAdmin(adminEmail.trim(), adminPassword);
      setAdminSessionState(result.session as typeof adminSessionState);
      setAdminPassword('');
      setMode('admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Admin kirishda xatolik');
    } finally {
      setBusy(false);
    }
  };

  const approveRequest = async (requestId: string, approve: boolean) => {
    setBusy(true);
    setError('');
    try {
      const { error: approveError } = await supabase.rpc('schoolcoin_admin_approve_request', { p_request_id: requestId, p_approve: approve });
      if (approveError) throw approveError;
      flash(approve ? 'Coin berildi ✓' : 'So‘rov rad etildi');
      await loadAdmin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Amal bajarilmadi');
    } finally {
      setBusy(false);
    }
  };

  const updateOrder = async (id: string, status: string) => {
    setBusy(true);
    setError('');
    try {
      const { error: updateError } = await supabase.from('schoolcoin_orders').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
      if (updateError) throw updateError;
      flash('Buyurtma yangilandi ✓');
      await loadAdmin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Buyurtma yangilanmadi');
    } finally {
      setBusy(false);
    }
  };

  const logoutAdmin = async () => {
    await signOutAdmin();
    setAdminSessionState(null);
    setAdminEmail('');
    setAdminPassword('');
    setActiveTab('dashboard');
  };

  const categories = useMemo(() => ['All', ...Array.from(new Set(activities.map(item => item.category).filter(Boolean)))], [activities]);
  const visibleActivities = category === 'All' ? activities : activities.filter(item => item.category === category);
  const visibleStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();
    if (!query) return students;
    return students.filter(item => `${item.full_name} ${item.student_code} ${item.class_name}`.toLowerCase().includes(query));
  }, [students, studentSearch]);
  const totalCoins = useMemo(() => students.reduce((sum, item) => sum + Number(item.balance || 0), 0), [students]);
  const pendingOrders = orders.filter(item => item.status === 'pending').length;

  const admin = adminSessionState?.user?.app_metadata?.role === 'admin';

  return (
    <div className="fixed inset-0 z-[120] overflow-auto bg-slate-950/70 p-3 backdrop-blur-xl md:p-6">
      <div className="mx-auto min-h-[calc(100vh-24px)] max-w-7xl overflow-hidden rounded-[28px] bg-slate-50 shadow-2xl">
        <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b bg-white/95 px-4 py-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-100 text-amber-600"><Coins /></div>
            <div><h1 className="text-lg font-black">SchoolCoin</h1><p className="text-xs text-slate-500">Student economy & reward system</p></div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setMode('student')} className={`rounded-xl px-3 py-2 text-sm font-semibold ${mode === 'student' ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}>Student</button>
            <button type="button" onClick={() => setMode('admin')} className={`rounded-xl px-3 py-2 text-sm font-semibold ${mode === 'admin' ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}>Admin</button>
            <button type="button" onClick={onClose} className="rounded-xl p-2" aria-label="Yopish"><X /></button>
          </div>
        </header>

        <main className="p-4 md:p-6">
          {error && <div className="mb-4 flex items-center justify-between rounded-2xl bg-red-50 p-3 text-sm text-red-700"><span>{error}</span><button type="button" onClick={() => setError('')} aria-label="Xatoni yopish"><X className="h-4 w-4" /></button></div>}
          {notice && <div className="mb-4 rounded-2xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{notice}</div>}

          {mode === 'student' && !student && (
            <section className="mx-auto max-w-md rounded-3xl bg-white p-7 shadow-sm">
              <div className="mb-6 text-center"><Coins className="mx-auto h-10 w-10 text-amber-500" /><h2 className="mt-3 text-2xl font-black">Student Login</h2><p className="mt-1 text-sm text-slate-500">Kod va PIN orqali hisobingizga kiring.</p></div>
              <form onSubmit={studentLogin} className="space-y-3">
                <input value={code} onChange={event => setCode(event.target.value)} placeholder="Student code" className="w-full rounded-2xl border p-3.5" autoComplete="username" required />
                <input value={pin} onChange={event => setPin(event.target.value)} placeholder="PIN" type="password" inputMode="numeric" className="w-full rounded-2xl border p-3.5" autoComplete="current-password" required />
                <button disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3.5 font-semibold text-white disabled:opacity-50"><LogIn className="h-4 w-4" />{busy ? 'Tekshirilmoqda…' : 'Kirish'}</button>
              </form>
            </section>
          )}

          {mode === 'student' && student && (
            <div className="space-y-6">
              <section className="grid gap-4 md:grid-cols-[1fr_auto]">
                <div className="rounded-3xl bg-slate-900 p-6 text-white"><p className="text-sm text-white/60">Student</p><h2 className="mt-1 text-2xl font-black">{student.full_name}</h2><p className="mt-1 text-sm text-white/65">{student.class_name} · {student.student_code}</p></div>
                <div className="rounded-3xl bg-amber-50 p-6 text-right"><p className="text-xs font-bold uppercase tracking-wider text-amber-700">Balance</p><p className="mt-2 text-4xl font-black text-amber-700">{student.balance}</p><p className="text-xs text-amber-700/70">SchoolCoin</p></div>
              </section>

              <section className="rounded-3xl bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-bold">Faoliyatlar</h3><p className="text-sm text-slate-500">Tasdiqlash uchun faoliyat yuboring.</p></div><div className="flex max-w-full gap-2 overflow-x-auto">{categories.map(item => <button type="button" key={item} onClick={() => setCategory(item)} className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold ${category === item ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}>{categoryLabels[item] || item}</button>)}</div></div>
                <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {visibleActivities.map(item => <article key={item.id} className="rounded-2xl border p-4"><div className="flex items-start justify-between gap-3"><div><h4 className="font-bold">{item.name}</h4><p className="mt-1 text-sm text-slate-500">{item.description}</p></div><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">+{item.coin_reward}</span></div><button disabled={busy} type="button" onClick={() => void submitActivity(item.id)} className="mt-4 w-full rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-50">So‘rov yuborish</button></article>)}
                </div>
              </section>

              <section className="rounded-3xl bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><Gift className="h-5 w-5 text-amber-600" /><h3 className="text-lg font-bold">Market</h3></div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{rewards.map(item => <article key={item.id} className="rounded-2xl border p-4"><div className="flex items-start justify-between gap-3"><h4 className="font-bold">{item.title}</h4><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">{item.price}</span></div><p className="mt-2 text-sm text-slate-500">{item.description}</p><p className="mt-2 text-xs text-slate-400">Stock: {item.stock}</p><button disabled={busy || item.stock < 1 || student.balance < item.price} type="button" onClick={() => void redeemReward(item)} className="mt-4 w-full rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-40">{item.stock < 1 ? 'Tugagan' : student.balance < item.price ? 'Coin yetarli emas' : 'Sotib olish'}</button></article>)}</div></section>

              <section className="rounded-3xl bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><History className="h-5 w-5" /><h3 className="text-lg font-bold">Buyurtmalar tarixi</h3></div>{orders.length ? <div className="space-y-2">{orders.map(item => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3"><div><p className="font-semibold">{item.reward_title}</p><p className="text-xs text-slate-500">{new Date(item.created_at).toLocaleString()}</p></div><div className="text-right"><p className="font-bold">{item.price}</p><p className="text-xs text-slate-500">{item.status}</p></div></div>)}</div> : <p className="text-sm text-slate-500">Hozircha buyurtmalar yo‘q.</p>}</section>
            </div>
          )}

          {mode === 'admin' && !admin && (
            <section className="mx-auto max-w-md rounded-3xl bg-white p-7 shadow-sm">
              <div className="mb-6 text-center"><LayoutDashboard className="mx-auto h-10 w-10 text-slate-700" /><h2 className="mt-3 text-2xl font-black">SchoolCoin Admin</h2><p className="mt-1 text-sm text-slate-500">Admin roliga ega akkaunt bilan kiring.</p></div>
              <form onSubmit={adminLogin} className="space-y-3"><input type="email" required value={adminEmail} onChange={event => setAdminEmail(event.target.value)} placeholder="Admin email" autoComplete="username" className="w-full rounded-2xl border p-3.5" /><input type="password" required value={adminPassword} onChange={event => setAdminPassword(event.target.value)} placeholder="Parol" autoComplete="current-password" className="w-full rounded-2xl border p-3.5" /><button disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3.5 font-semibold text-white disabled:opacity-50"><LogIn className="h-4 w-4" />{busy ? 'Tekshirilmoqda…' : 'Kirish'}</button></form>
            </section>
          )}

          {mode === 'admin' && admin && (
            <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
              <aside className="rounded-3xl bg-slate-900 p-4 text-white"><div className="mb-4 text-xs text-white/50">{adminSessionState?.user?.email}</div>{([['dashboard', LayoutDashboard, 'Dashboard'], ['students', Users, 'Students'], ['activities', Activity, 'Activities'], ['approvals', CheckCircle2, 'Approvals'], ['market', Gift, 'Market'], ['orders', ShoppingBag, 'Orders'], ['transactions', History, 'Transactions']] as const).map(([id, Icon, label]) => <button type="button" key={id} onClick={() => setActiveTab(id)} className={`mb-1 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold ${activeTab === id ? 'bg-white text-slate-900' : 'text-white/75 hover:bg-white/10'}`}><Icon className="h-4 w-4" />{label}</button>)}<button type="button" onClick={() => void logoutAdmin()} className="mt-4 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-red-300 hover:bg-red-500/10"><LogOut className="h-4 w-4" /> Chiqish</button></aside>

              <section className="space-y-5">
                {activeTab === 'dashboard' && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><div className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-xs text-slate-500">Students</p><p className="mt-2 text-3xl font-black">{students.length}</p></div><div className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-xs text-slate-500">SchoolCoin</p><p className="mt-2 text-3xl font-black">{totalCoins}</p></div><div className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-xs text-slate-500">Pending approvals</p><p className="mt-2 text-3xl font-black">{requests.length}</p></div><div className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-xs text-slate-500">Pending orders</p><p className="mt-2 text-3xl font-black">{pendingOrders}</p></div></div>}

                {activeTab === 'students' && <div className="rounded-3xl bg-white p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-lg font-bold">Students</h3><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={studentSearch} onChange={event => setStudentSearch(event.target.value)} placeholder="Qidirish" className="rounded-xl border py-2.5 pl-9 pr-3 text-sm" /></div></div><div className="mt-4 overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b text-left text-slate-500"><th className="px-3 py-2">Student</th><th className="px-3 py-2">Class</th><th className="px-3 py-2">Code</th><th className="px-3 py-2">Balance</th></tr></thead><tbody>{visibleStudents.map(item => <tr key={item.id} className="border-b last:border-0"><td className="px-3 py-3 font-semibold">{item.full_name}</td><td className="px-3 py-3">{item.class_name}</td><td className="px-3 py-3">{item.student_code}</td><td className="px-3 py-3 font-bold">{item.balance}</td></tr>)}</tbody></table></div></div>}

                {activeTab === 'activities' && <div className="rounded-3xl bg-white p-5 shadow-sm"><h3 className="text-lg font-bold">Activities</h3><div className="mt-4 grid gap-3 md:grid-cols-2">{activities.map(item => <div key={item.id} className="rounded-2xl border p-4"><div className="flex justify-between gap-3"><span className="font-semibold">{item.name}</span><span className="font-bold text-amber-600">+{item.coin_reward}</span></div><p className="mt-1 text-sm text-slate-500">{item.description}</p></div>)}</div></div>}

                {activeTab === 'approvals' && <div className="rounded-3xl bg-white p-5 shadow-sm"><h3 className="text-lg font-bold">Approvals</h3><div className="mt-4 space-y-3">{requests.length ? requests.map(item => <div key={item.id} className="flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between"><div><p className="font-semibold">{item.student?.full_name || 'Student'} · {item.activity?.name || 'Activity'}</p><p className="text-sm text-slate-500">+{item.activity?.coin_reward || 0} coin · {new Date(item.created_at).toLocaleString()}</p></div><div className="flex gap-2"><button type="button" disabled={busy} onClick={() => void approveRequest(item.id, true)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"><CheckCircle2 className="h-4 w-4" /> Tasdiqlash</button><button type="button" disabled={busy} onClick={() => void approveRequest(item.id, false)} className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-50"><XCircle className="h-4 w-4" /> Rad etish</button></div></div>) : <p className="text-sm text-slate-500">Kutilayotgan so‘rov yo‘q.</p>}</div></div>}

                {activeTab === 'market' && <div className="rounded-3xl bg-white p-5 shadow-sm"><h3 className="text-lg font-bold">Market</h3><div className="mt-4 grid gap-3 md:grid-cols-2">{rewards.map(item => <div key={item.id} className="rounded-2xl border p-4"><div className="flex justify-between gap-3"><span className="font-semibold">{item.title}</span><span className="font-bold text-amber-600">{item.price}</span></div><p className="mt-1 text-sm text-slate-500">Stock: {item.stock}</p></div>)}</div></div>}

                {activeTab === 'orders' && <div className="rounded-3xl bg-white p-5 shadow-sm"><h3 className="text-lg font-bold">Orders</h3><div className="mt-4 space-y-3">{orders.map(item => <div key={item.id} className="flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between"><div><p className="font-semibold">{item.reward_title}</p><p className="text-sm text-slate-500">{item.price} coin</p></div><div className="flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={() => void updateOrder(item.id, 'processing')} className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Processing</button><button type="button" disabled={busy} onClick={() => void updateOrder(item.id, 'delivered')} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Delivered</button><button type="button" disabled={busy} onClick={() => void updateOrder(item.id, 'cancelled')} className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-50">Cancelled</button></div></div>)}</div></div>}

                {activeTab === 'transactions' && <div className="rounded-3xl bg-white p-5 shadow-sm"><h3 className="text-lg font-bold">Transactions</h3><div className="mt-4 space-y-2">{transactions.map(item => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3"><div><p className="font-semibold">{item.transaction_type}</p><p className="text-xs text-slate-500">{item.note || item.student_id} · {new Date(item.created_at).toLocaleString()}</p></div><span className={`font-black ${item.amount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{item.amount > 0 ? '+' : ''}{item.amount}</span></div>)}</div></div>}
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
