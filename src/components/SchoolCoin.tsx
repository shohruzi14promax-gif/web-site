import { useEffect, useMemo, useState } from 'react';
import {
  Coins,
  Gift,
  LogIn,
  LogOut,
  X,
  Check,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trophy,
  Zap,
  Users,
  LayoutDashboard,
  Activity,
  Package,
  History,
  RefreshCw,
  Search,
  TrendingUp,
  Clock3,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { supabase, signInAdmin, signOutAdmin } from '../lib/supabase';

interface Props {
  onClose: () => void;
}

type Student = {
  id: string;
  student_code: string;
  full_name: string;
  class_name: string;
  balance: number;
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

type AdminTab =
  | 'dashboard'
  | 'students'
  | 'activities'
  | 'approvals'
  | 'market'
  | 'orders'
  | 'transactions';

const categoryMeta: Record<string, { emoji: string; label: string }> = {
  Academic: { emoji: '📚', label: 'Academic' },
  Sport: { emoji: '🏃', label: 'Sport' },
  'Culture & Creativity': {
    emoji: '🎨',
    label: 'Culture & Creativity',
  },
  'Leadership & Volunteering': {
    emoji: '🤝',
    label: 'Leadership & Volunteering',
  },
  Technology: { emoji: '💻', label: 'Technology' },
  Environment: { emoji: '🌱', label: 'Environment' },
  'Personal Development': {
    emoji: '📖',
    label: 'Personal Development',
  },
  Achievements: { emoji: '🏆', label: 'Achievements' },
};

export default function SchoolCoin({ onClose }: Props) {
  const [mode, setMode] = useState<'student' | 'admin'>('student');

  const [code, setCode] = useState('');
  const [pin, setPin] = useState('');
  const [student, setStudent] = useState<Student | null>(null);

  const [activities, setActivities] = useState<any[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  const [adminSession, setAdminSession] = useState<any>(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [coinBurst, setCoinBurst] = useState(0);

  const [activeCategory, setActiveCategory] = useState('All');
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [studentSearch, setStudentSearch] = useState('');

  const flash = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2800);
  };

  const loadMarket = async () => {
    const { data, error } = await supabase
      .from('schoolcoin_market_rewards')
      .select('*')
      .eq('active', true)
      .order('category')
      .order('price');

    if (error) setError(error.message);
    else setRewards(data || []);
  };

  const loadCatalog = async () => {
    const { data, error } = await supabase
      .from('schoolcoin_activities')
      .select('*')
      .eq('active', true)
      .order('category')
      .order('coin_reward', { ascending: false });

    if (error) setError(error.message);
    else setActivities(data || []);
  };

  const loadStudent = async (s: Student) => {
    const { data, error } = await supabase
      .from('schoolcoin_orders')
      .select(
        'id,status,price,created_at,schoolcoin_market_rewards(title)'
      )
      .eq('student_id', s.id)
      .order('created_at', { ascending: false });

    if (error) setError(error.message);
    else setOrders(data || []);
  };

  const login = async (e: React.FormEvent) => {
    e.preventDefault();

    setBusy(true);
    setError('');

    try {
      const { data, error } = await supabase.rpc(
        'schoolcoin_student_login',
        {
          p_code: code,
          p_pin: pin,
        }
      );

      if (error) throw error;

      const s = data as Student;

      setStudent(s);

      await Promise.all([
        loadMarket(),
        loadCatalog(),
        loadStudent(s),
      ]);

      flash('Welcome to SchoolCoin ✨');
    } catch (e: any) {
      setError(e.message || 'Kirishda xatolik');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (mode === 'student') {
      loadCatalog();
      loadMarket();
    }
  }, [mode]);

  const submit = async (id: string) => {
    setBusy(true);
    setError('');

    try {
      const { error } = await supabase.rpc(
        'schoolcoin_submit_request',
        {
          p_code: code,
          p_pin: pin,
          p_activity_id: id,
          p_evidence_url: null,
          p_note: null,
        }
      );

      if (error) throw error;

      setCoinBurst((x) => x + 1);

      flash(
        '⚡ Activity so‘rovi yuborildi! Admin tasdiqlagach coin keladi.'
      );
    } catch (e: any) {
      setError(e.message || 'So‘rov yuborilmadi');
    } finally {
      setBusy(false);
    }
  };

  const redeem = async (r: Reward) => {
    if (r.stock < 1) return;

    setBusy(true);
    setError('');

    try {
      const { data, error } = await supabase.rpc(
        'schoolcoin_market_redeem',
        {
          p_code: code,
          p_pin: pin,
          p_reward_id: r.id,
        }
      );

      if (error) throw error;

      const next = Number(
        data?.new_balance ??
          (student?.balance || 0) - r.price
      );

      setStudent((s) =>
        s ? { ...s, balance: next } : s
      );

      if (student) {
        await loadStudent({
          ...student,
          balance: next,
        });
      }

      await loadMarket();

      setCoinBurst((x) => x + 1);

      flash('🎁 Buyurtma yuborildi! Admin tayyorlaydi.');
    } catch (e: any) {
      setError(e.message || 'Redeem amalga oshmadi');
    } finally {
      setBusy(false);
    }
  };

  const adminLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setBusy(true);
    setError('');

    try {
      const r = await signInAdmin(
        adminEmail.trim(),
        adminPassword
      );

      setAdminSession(r.session);

      await loadAdmin();
    } catch (e: any) {
      setError(e.message || 'Admin kirishda xatolik');
    } finally {
      setBusy(false);
    }
  };

  const loadAdmin = async () => {
    setBusy(true);
    setError('');

    try {
      const ordersQuery = await supabase
        .from('schoolcoin_orders')
        .select(
          `
          id,
          status,
          price,
          created_at,
          student_id,
          schoolcoin_students(full_name,student_code),
          schoolcoin_market_rewards(title)
        `
        )
        .order('created_at', {
          ascending: false,
        });

      if (ordersQuery.error) {
        throw ordersQuery.error;
      }

      setOrders(ordersQuery.data || []);

      const requestsQuery = await supabase
        .from('schoolcoin_requests')
        .select(
          `
          id,
          status,
          created_at,
          student_id,
          activity_id,
          schoolcoin_students(full_name,student_code),
          schoolcoin_activities(name,coin_reward)
        `
        )
        .eq('status', 'pending')
        .order('created_at', {
          ascending: false,
        });

      if (requestsQuery.error) {
        throw requestsQuery.error;
      }

      setRequests(requestsQuery.data || []);

      const studentsQuery = await supabase
        .from('schoolcoin_students')
        .select(
          'id,student_code,full_name,class_name,balance'
        )
        .order('class_name')
        .order('full_name');

      if (!studentsQuery.error) {
        setStudents(
          (studentsQuery.data || []) as Student[]
        );
      }

      const transactionsQuery = await supabase
        .from('schoolcoin_transactions')
        .select('*')
        .order('created_at', {
          ascending: false,
        })
        .limit(100);

      if (!transactionsQuery.error) {
        setTransactions(
          transactionsQuery.data || []
        );
      }

      await loadCatalog();
      await loadMarket();
    } catch (e: any) {
      setError(
        e.message || 'Admin maʼlumotlarini yuklashda xatolik'
      );
    } finally {
      setBusy(false);
    }
  };

  const approveActivity = async (
    id: string,
    yes: boolean
  ) => {
    setBusy(true);
    setError('');

    try {
      const { error } = await supabase.rpc(
        'schoolcoin_admin_approve_request',
        {
          p_request_id: id,
          p_approve: yes,
        }
      );

      if (error) throw error;

      if (yes) {
        setCoinBurst((x) => x + 1);
      }

      flash(
        yes
          ? '🪙 Coin berildi ✓'
          : 'So‘rov rad etildi'
      );

      await loadAdmin();
    } catch (e: any) {
      setError(
        e.message || 'Amal bajarilmadi'
      );
    } finally {
      setBusy(false);
    }
  };

  const updateOrder = async (
    id: string,
    status: string
  ) => {
    setBusy(true);

    try {
      const { error } = await supabase
        .from('schoolcoin_orders')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      flash('📦 Buyurtma yangilandi ✓');

      await loadAdmin();
    } catch (e: any) {
      setError(
        e.message || 'Buyurtmani yangilab bo‘lmadi'
      );
    } finally {
      setBusy(false);
    }
  };

  const adminLogout = async () => {
    try {
      await signOutAdmin();
    } catch {
      // ignore logout errors
    }

    setAdminSession(null);
    setAdminEmail('');
    setAdminPassword('');
    setAdminTab('dashboard');
    flash('Admin sessiyasi yopildi 👋');
  };

  const categories = useMemo(
    () => [
      'All',
      ...Object.keys(categoryMeta).filter((c) =>
        activities.some(
          (a) => a.category === c
        )
      ),
    ],
    [activities]
  );

  const filteredActivities =
    activeCategory === 'All'
      ? activities
      : activities.filter(
          (a) => a.category === activeCategory
        );

  const filteredStudents = useMemo(() => {
    const q = studentSearch
      .trim()
      .toLowerCase();

    if (!q) return students;

    return students.filter((s) =>
      [
        s.full_name,
        s.student_code,
        s.class_name,
      ]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [students, studentSearch]);

  const totalCoins = useMemo(
    () =>
      students.reduce(
        (sum, s) => sum + Number(s.balance || 0),
        0
      ),
    [students]
  );

  const pendingOrders = orders.filter(
    (o) => o.status === 'pending'
  ).length;

  const completedOrders = orders.filter(
    (o) => o.status === 'delivered'
  ).length;

  const stats = [
    {
      title: 'Students',
      value: students.length,
      icon: Users,
      text: 'registered students',
    },
    {
      title: 'SchoolCoin',
      value: totalCoins,
      icon: Coins,
      text: 'current balance',
    },
    {
      title: 'Pending',
      value: requests.length,
      icon: Clock3,
      text: 'activity approvals',
    },
    {
      title: 'Orders',
      value: pendingOrders,
      icon: Package,
      text: 'pending orders',
    },
  ];

  const adminNav: {
    id: AdminTab;
    label: string;
    icon: any;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'students',
      label: 'Students',
      icon: Users,
    },
    {
      id: 'activities',
      label: 'Activities',
      icon: Activity,
    },
    {
      id: 'approvals',
      label: 'Approvals',
      icon: CheckCircle2,
    },
    {
      id: 'market',
      label: 'Market',
      icon: Gift,
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingBag,
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: History,
    },
  ];

  return (
    <div className="fixed inset-0 z-[120] overflow-auto bg-slate-950/70 p-3 backdrop-blur-xl md:p-6">
      <style>{`
        @keyframes scFloat {
          0% {
            opacity: 0;
            transform: translateY(12px) scale(.7);
          }
          25% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(-90px) scale(1.25);
          }
        }

        @keyframes scPop {
          0% {
            transform: scale(.94);
            opacity: 0;
          }
          60% {
            transform: scale(1.02);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes scShine {
          0% {
            transform: translateX(-130%);
          }
          100% {
            transform: translateX(180%);
          }
        }

        @keyframes scPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.06);
          }
        }

        .sc-pop {
          animation: scPop .35s ease-out;
        }

        .sc-float {
          animation: scFloat 1.25s ease-out forwards;
        }

        .sc-card {
          transition:
            transform .25s ease,
            box-shadow .25s ease,
            border-color .25s ease;
        }

        .sc-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 40px rgba(15,23,42,.10);
        }

        .sc-shine {
          position: relative;
          overflow: hidden;
        }

        .sc-shine:after {
          content: '';
          position: absolute;
          inset: 0;
          width: 35%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,.5),
            transparent
          );
          transform: translateX(-130%);
          animation: scShine 2.8s infinite;
          pointer-events: none;
        }

        .sc-pulse {
          animation: scPulse 1.8s infinite;
        }
      `}</style>

      <div className="mx-auto min-h-[calc(100vh-24px)] max-w-7xl overflow-hidden rounded-[32px] bg-slate-50 shadow-2xl">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-white/95 px-5 py-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-100 text-amber-600 sc-pulse">
              <Coins />
            </div>

            <div>
              <h1 className="text-xl font-black">
                SchoolCoin
              </h1>
              <p className="text-xs text-slate-500">
                Student economy & reward system
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setMode('student')}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                mode === 'student'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200'
              }`}
            >
              Student
            </button>

            <button
              onClick={() => setMode('admin')}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                mode === 'admin'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200'
              }`}
            >
              Admin
            </button>

            <button
              onClick={onClose}
              className="p-2 transition hover:rotate-90"
            >
              <X />
            </button>
          </div>
        </header>

        <main className="p-5 md:p-7">
          {error && (
            <div className="sc-pop mb-4 flex items-center justify-between rounded-2xl bg-red-50 p-3 text-sm text-red-700">
              <span>{error}</span>

              <button
                onClick={() => setError('')}
                className="rounded-lg p-1 hover:bg-red-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {notice && (
            <div className="sc-pop mb-4 rounded-2xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
              {notice}
            </div>
          )}

          {coinBurst > 0 && (
            <div
              key={coinBurst}
              className="sc-float pointer-events-none fixed right-8 top-24 z-[200] text-3xl font-black text-amber-500"
            >
              +🪙
            </div>
          )}

          {/* ================= STUDENT ================= */}

          {mode === 'student' &&
            !student && (
              <section className="sc-pop mx-auto max-w-md rounded-3xl bg-white p-7 shadow-sm">
                <div className="mb-6 text-center">
                  <Coins className="mx-auto h-10 w-10 animate-bounce text-amber-500" />

                  <h2 className="mt-3 text-2xl font-black">
                    Student Login
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Kod va PIN orqali SchoolCoin
                    hisobingizga kiring.
                  </p>
                </div>

                <form
                  onSubmit={login}
                  className="space-y-3"
                >
                  <input
                    value={code}
                    onChange={(e) =>
                      setCode(
                        e.target.value.toUpperCase()
                      )
                    }
                    placeholder="Student code (STU001)"
                    className="w-full rounded-2xl border p-3.5 outline-none transition focus:ring-4 focus:ring-amber-100"
                    required
                  />

                  <input
                    value={pin}
                    onChange={(e) =>
                      setPin(e.target.value)
                    }
                    type="password"
                    placeholder="PIN"
                    className="w-full rounded-2xl border p-3.5 outline-none transition focus:ring-4 focus:ring-amber-100"
                    required
                  />

                  <button
                    disabled={busy}
                    className="sc-shine w-full rounded-2xl bg-slate-900 py-3.5 font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    <LogIn className="mr-1 inline h-4 w-4" />

                    {busy
                      ? 'Kirilmoqda…'
                      : 'Kirish'}
                  </button>
                </form>
              </section>
            )}

          {mode === 'student' &&
            student && (
              <div className="sc-pop space-y-7">
                <section className="grid gap-4 md:grid-cols-3">
                  <div className="sc-shine rounded-3xl bg-slate-900 p-6 text-white md:col-span-2">
                    <p className="text-sm text-white/60">
                      Salom, {student.full_name} 👋
                    </p>

                    <h2 className="mt-1 text-3xl font-black">
                      {student.balance}{' '}
                      SchoolCoin
                    </h2>

                    <p className="mt-2 text-sm text-white/60">
                      {student.class_name} ·{' '}
                      {student.student_code}
                    </p>

                    <div className="mt-5 flex gap-2 text-xs">
                      <span className="rounded-full bg-white/10 px-3 py-1">
                        ⚡ Earn
                      </span>

                      <span className="rounded-full bg-white/10 px-3 py-1">
                        🏪 Market
                      </span>

                      <span className="rounded-full bg-white/10 px-3 py-1">
                        🏆 Achievements
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setStudent(null);
                      setCode('');
                      setPin('');
                    }}
                    className="rounded-3xl bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <LogOut />

                    <p className="mt-3 font-bold">
                      Chiqish
                    </p>
                  </button>
                </section>

                <section>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-black">
                      🪙 Coin olish
                    </h3>

                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
                      {activities.length}{' '}
                      activities
                    </span>
                  </div>

                  <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
                    {categories.map((c) => (
                      <button
                        key={c}
                        onClick={() =>
                          setActiveCategory(c)
                        }
                        className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold transition ${
                          activeCategory === c
                            ? 'scale-105 bg-slate-900 text-white'
                            : 'bg-white hover:bg-slate-100'
                        }`}
                      >
                        {c === 'All'
                          ? '✨ All'
                          : `${
                              categoryMeta[c]
                                ?.emoji || '🪙'
                            } ${
                              categoryMeta[c]
                                ?.label || c
                            }`}
                      </button>
                    ))}
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {filteredActivities.map(
                      (a) => (
                        <article
                          key={a.id}
                          className="sc-card rounded-3xl bg-white p-5 shadow-sm"
                        >
                          <div className="flex justify-between gap-3">
                            <div>
                              <b>{a.name}</b>

                              <p className="mt-1 text-xs text-slate-500">
                                {categoryMeta[
                                  a.category
                                ]?.emoji || '🪙'}{' '}
                                {a.category}
                              </p>
                            </div>

                            <span className="sc-shine rounded-full bg-amber-100 px-3 py-1 text-sm font-black text-amber-700">
                              +{a.coin_reward}
                            </span>
                          </div>

                          <button
                            disabled={busy}
                            onClick={() =>
                              submit(a.id)
                            }
                            className="mt-4 w-full rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-amber-600 disabled:opacity-40"
                          >
                            <Zap className="mr-1 inline h-4 w-4" />
                            So‘rov yuborish
                          </button>
                        </article>
                      )
                    )}
                  </div>
                </section>

                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-xl font-black">
                      🏪 SchoolCoin Market
                    </h3>

                    <span className="text-xs text-slate-500">
                      Haqiqiy sovg‘alar
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {rewards.map((r) => (
                      <article
                        key={r.id}
                        className="sc-card overflow-hidden rounded-3xl bg-white shadow-sm"
                      >
                        {r.image ? (
                          <img
                            src={r.image}
                            className="h-40 w-full object-cover transition duration-500 hover:scale-105"
                          />
                        ) : (
                          <div className="grid h-28 place-items-center bg-gradient-to-br from-amber-50 to-violet-50">
                            <Gift className="h-12 w-12 animate-pulse text-amber-500" />
                          </div>
                        )}

                        <div className="p-5">
                          <div className="flex justify-between">
                            <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-700">
                              {r.category}
                            </span>

                            <span className="text-xs text-slate-500">
                              Stock: {r.stock}
                            </span>
                          </div>

                          <h4 className="mt-3 text-lg font-black">
                            {r.title}
                          </h4>

                          <p className="mt-1 min-h-10 text-sm text-slate-500">
                            {r.description}
                          </p>

                          <div className="mt-4 flex items-center justify-between">
                            <b className="text-lg">
                              {r.price} 🪙
                            </b>

                            <button
                              disabled={
                                busy ||
                                r.stock < 1
                              }
                              onClick={() =>
                                redeem(r)
                              }
                              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:scale-105 disabled:opacity-40"
                            >
                              {r.stock < 1
                                ? 'Tugagan'
                                : 'Sotib olish'}
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="mb-3 flex items-center gap-2">
                    <ShoppingBag />
                    <h3 className="text-xl font-black">
                      📦 Mening buyurtmalarim
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {orders.length ? (
                      orders.map((o) => (
                        <div
                          key={o.id}
                          className="sc-card flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
                        >
                          <div>
                            <b>
                              {o
                                .schoolcoin_market_rewards
                                ?.title ||
                                'Reward'}
                            </b>

                            <p className="text-xs text-slate-500">
                              {o.price} coin ·{' '}
                              {new Date(
                                o.created_at
                              ).toLocaleString()}
                            </p>
                          </div>

                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize">
                            {o.status}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl bg-white p-5 text-sm text-slate-500">
                        Hali buyurtma yo‘q.
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )}

          {/* ================= ADMIN LOGIN ================= */}

          {mode === 'admin' &&
            !adminSession && (
              <section className="sc-pop mx-auto max-w-md rounded-3xl bg-white p-7 shadow-sm">
                <ShieldCheck className="mx-auto h-10 w-10 animate-pulse text-blue-600" />

                <h2 className="mt-3 text-center text-2xl font-black">
                  SchoolCoin Admin
                </h2>

                <p className="mt-1 text-center text-sm text-slate-500">
                  Administrator dashboard
                </p>

                <form
                  onSubmit={adminLogin}
                  className="mt-6 space-y-3"
                >
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) =>
                      setAdminEmail(e.target.value)
                    }
                    placeholder="Admin email"
                    className="w-full rounded-2xl border p-3.5 outline-none focus:ring-4 focus:ring-blue-100"
                    required
                  />

                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) =>
                      setAdminPassword(
                        e.target.value
                      )
                    }
                    placeholder="Parol"
                    className="w-full rounded-2xl border p-3.5 outline-none focus:ring-4 focus:ring-blue-100"
                    required
                  />

                  <button
                    disabled={busy}
                    className="w-full rounded-2xl bg-blue-600 py-3.5 font-bold text-white transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:opacity-50"
                  >
                    <LogIn className="mr-1 inline h-4 w-4" />
                    {busy
                      ? 'Kirilmoqda…'
                      : 'Kirish'}
                  </button>
                </form>
              </section>
            )}

          {/* ================= ADMIN ================= */}

          {mode === 'admin' &&
            adminSession && (
              <div className="sc-pop grid gap-6 lg:grid-cols-[220px_1fr]">
                {/* SIDEBAR */}

                <aside className="rounded-3xl bg-slate-900 p-3 text-white">
                  <div className="mb-4 px-3 py-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="text-amber-400" />
                      <span className="font-black">
                        Admin Panel
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-white/50">
                      SchoolCoin 2.0
                    </p>
                  </div>

                  <nav className="space-y-1">
                    {adminNav.map((item) => {
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.id}
                          onClick={() =>
                            setAdminTab(item.id)
                          }
                          className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-bold transition ${
                            adminTab === item.id
                              ? 'bg-white text-slate-900 shadow-lg'
                              : 'text-white/70 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <Icon className="h-4 w-4" />

                          {item.label}

                          {item.id ===
                            'approvals' &&
                            requests.length > 0 && (
                              <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-[10px] text-white">
                                {requests.length}
                              </span>
                            )}
                        </button>
                      );
                    })}
                  </nav>

                  <div className="mt-6 border-t border-white/10 pt-3">
                    <button
                      onClick={loadAdmin}
                      disabled={busy}
                      className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-white/70 transition hover:bg-white/10 hover:text-white"
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${
                          busy
                            ? 'animate-spin'
                            : ''
                        }`}
                      />
                      Refresh
                    </button>

                    <button
                      onClick={adminLogout}
                      className="mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-red-300 transition hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Chiqish
                    </button>
                  </div>
                </aside>

                {/* CONTENT */}

                <section className="min-w-0">
                  {/* DASHBOARD */}

                  {adminTab ===
                    'dashboard' && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-3xl font-black">
                          Dashboard 👋
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          SchoolCoin tizimining
                          umumiy holati.
                        </p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {stats.map((stat) => {
                          const Icon =
                            stat.icon;

                          return (
                            <div
                              key={stat.title}
                              className="sc-card rounded-3xl bg-white p-5 shadow-sm"
                            >
                              <div className="flex items-center justify-between">
                                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100">
                                  <Icon className="h-5 w-5" />
                                </div>

                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                              </div>

                              <p className="mt-5 text-sm text-slate-500">
                                {stat.title}
                              </p>

                              <p className="mt-1 text-3xl font-black">
                                {stat.value.toLocaleString()}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                {stat.text}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="rounded-3xl bg-white p-6 shadow-sm">
                          <div className="flex items-center gap-2">
                            <Activity className="text-amber-500" />
                            <h3 className="font-black">
                              Activities
                            </h3>
                          </div>

                          <p className="mt-4 text-4xl font-black">
                            {activities.length}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            active activities
                          </p>
                        </div>

                        <div className="rounded-3xl bg-white p-6 shadow-sm">
                          <div className="flex items-center gap-2">
                            <Trophy className="text-amber-500" />
                            <h3 className="font-black">
                              Completed orders
                            </h3>
                          </div>

                          <p className="mt-4 text-4xl font-black">
                            {completedOrders}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            delivered rewards
                          </p>
                        </div>
                      </div>

                      {requests.length > 0 && (
                        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
                          <div className="flex items-center gap-3">
                            <Sparkles className="text-amber-600" />

                            <div>
                              <b>
                                {requests.length}{' '}
                                ta approval kutmoqda
                              </b>

                              <p className="text-xs text-slate-500">
                                Approvals bo‘limidan
                                tekshiring.
                              </p>
                            </div>

                            <button
                              onClick={() =>
                                setAdminTab(
                                  'approvals'
                                )
                              }
                              className="ml-auto rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white"
                            >
                              Ko‘rish
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* STUDENTS */}

                  {adminTab ===
                    'students' && (
                    <div className="space-y-5">
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div>
                          <h2 className="text-2xl font-black">
                            👨‍🎓 Students
                          </h2>

                          <p className="text-sm text-slate-500">
                            O‘quvchilar va ularning
                            SchoolCoin balansi.
                          </p>
                        </div>

                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                          <input
                            value={studentSearch}
                            onChange={(e) =>
                              setStudentSearch(
                                e.target.value
                              )
                            }
                            placeholder="Ism, kod yoki sinf..."
                            className="w-full rounded-2xl border bg-white py-3 pl-10 pr-4 text-sm outline-none focus:ring-4 focus:ring-blue-100 sm:w-72"
                          />
                        </div>
                      </div>

                      <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm">
                            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
                              <tr>
                                <th className="px-5 py-4">
                                  Student
                                </th>
                                <th className="px-5 py-4">
                                  Code
                                </th>
                                <th className="px-5 py-4">
                                  Class
                                </th>
                                <th className="px-5 py-4">
                                  Balance
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {filteredStudents.map(
                                (s) => (
                                  <tr
                                    key={s.id}
                                    className="border-b last:border-0 hover:bg-slate-50"
                                  >
                                    <td className="px-5 py-4 font-bold">
                                      {s.full_name}
                                    </td>

                                    <td className="px-5 py-4 text-slate-500">
                                      {s.student_code}
                                    </td>

                                    <td className="px-5 py-4">
                                      {s.class_name}
                                    </td>

                                    <td className="px-5 py-4">
                                      <span className="rounded-full bg-amber-100 px-3 py-1 font-black text-amber-700">
                                        {s.balance}{' '}
                                        🪙
                                      </span>
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>

                        {!filteredStudents.length && (
                          <div className="p-8 text-center text-sm text-slate-500">
                            Student topilmadi.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ACTIVITIES */}

                  {adminTab ===
                    'activities' && (
                    <div className="space-y-5">
                      <div>
                        <h2 className="text-2xl font-black">
                          📚 Activities
                        </h2>

                        <p className="text-sm text-slate-500">
                          {activities.length} ta faol
                          activity.
                        </p>
                      </div>

                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {categories.map(
                          (category) => (
                            <button
                              key={category}
                              onClick={() =>
                                setActiveCategory(
                                  category
                                )
                              }
                              className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold transition ${
                                activeCategory ===
                                category
                                  ? 'bg-slate-900 text-white'
                                  : 'bg-white hover:bg-slate-100'
                              }`}
                            >
                              {category ===
                              'All'
                                ? '✨ All'
                                : `${
                                    categoryMeta[
                                      category
                                    ]?.emoji ||
                                    '🪙'
                                  } ${
                                    categoryMeta[
                                      category
                                    ]?.label ||
                                    category
                                  }`}
                            </button>
                          )
                        )}
                      </div>

                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {filteredActivities.map(
                          (a) => (
                            <div
                              key={a.id}
                              className="sc-card rounded-3xl bg-white p-5 shadow-sm"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h3 className="font-black">
                                    {a.name}
                                  </h3>

                                  <p className="mt-1 text-xs text-slate-500">
                                    {categoryMeta[
                                      a.category
                                    ]?.emoji ||
                                      '🪙'}{' '}
                                    {a.category}
                                  </p>
                                </div>

                                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
                                  +{a.coin_reward}{' '}
                                  🪙
                                </span>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* APPROVALS */}

                  {adminTab ===
                    'approvals' && (
                    <div className="rounded-3xl bg-white p-6 shadow-sm">
                      <div className="mb-5 flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-black">
                            ✅ Activity Approvals
                          </h2>

                          <p className="text-sm text-slate-500">
                            Student activity
                            submissions.
                          </p>
                        </div>

                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
                          {requests.length}{' '}
                          pending
                        </span>
                      </div>

                      {requests.length ? (
                        <div className="divide-y">
                          {requests.map((q) => (
                            <div
                              key={q.id}
                              className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between"
                            >
                              <div>
                                <b>
                                  {
                                    q
                                      .schoolcoin_students
                                      ?.full_name
                                  }{' '}
                                  ·{' '}
                                  {
                                    q
                                      .schoolcoin_activities
                                      ?.name
                                  }
                                </b>

                                <p className="mt-1 text-xs text-slate-500">
                                  {
                                    q
                                      .schoolcoin_students
                                      ?.student_code
                                  }{' '}
                                  · +
                                  {
                                    q
                                      .schoolcoin_activities
                                      ?.coin_reward
                                  }{' '}
                                  coin
                                </p>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  disabled={busy}
                                  onClick={() =>
                                    approveActivity(
                                      q.id,
                                      true
                                    )
                                  }
                                  className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white transition hover:scale-105 disabled:opacity-50"
                                >
                                  <Check className="mr-1 inline h-4 w-4" />
                                  Approve
                                </button>

                                <button
                                  disabled={busy}
                                  onClick={() =>
                                    approveActivity(
                                      q.id,
                                      false
                                    )
                                  }
                                  className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700 transition hover:scale-105 disabled:opacity-50"
                                >
                                  <XCircle className="mr-1 inline h-4 w-4" />
                                  Reject
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">
                          🎉 Hozir pending
                          activity yo‘q.
                        </div>
                      )}
                    </div>
                  )}

                  {/* MARKET */}

                  {adminTab ===
                    'market' && (
                    <div className="space-y-5">
                      <div>
                        <h2 className="text-2xl font-black">
                          🏪 Market
                        </h2>

                        <p className="text-sm text-slate-500">
                          Haqiqiy sovg‘alar katalogi.
                        </p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {rewards.map((r) => (
                          <div
                            key={r.id}
                            className="sc-card overflow-hidden rounded-3xl bg-white shadow-sm"
                          >
                            {r.image ? (
                              <img
                                src={r.image}
                                className="h-36 w-full object-cover"
                              />
                            ) : (
                              <div className="grid h-28 place-items-center bg-gradient-to-br from-amber-50 to-violet-50">
                                <Gift className="h-11 w-11 text-amber-500" />
                              </div>
                            )}

                            <div className="p-5">
                              <div className="flex items-center justify-between">
                                <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-700">
                                  {r.category}
                                </span>

                                <span
                                  className={`text-xs font-bold ${
                                    r.stock > 0
                                      ? 'text-emerald-600'
                                      : 'text-red-500'
                                  }`}
                                >
                                  Stock:{' '}
                                  {r.stock}
                                </span>
                              </div>

                              <h3 className="mt-3 text-lg font-black">
                                {r.title}
                              </h3>

                              <p className="mt-1 text-sm text-slate-500">
                                {r.description}
                              </p>

                              <div className="mt-4 flex items-center justify-between">
                                <b>
                                  {r.price}{' '}
                                  🪙
                                </b>

                                <span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold">
                                  {r.stock > 0
                                    ? 'Available'
                                    : 'Out of stock'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ORDERS */}

                  {adminTab ===
                    'orders' && (
                    <div className="rounded-3xl bg-white p-6 shadow-sm">
                      <div className="mb-5">
                        <h2 className="text-2xl font-black">
                          📦 Orders
                        </h2>

                        <p className="text-sm text-slate-500">
                          Reward buyurtmalarini
                          boshqarish.
                        </p>
                      </div>

                      {orders.length ? (
                        <div className="divide-y">
                          {orders.map((o) => (
                            <div
                              key={o.id}
                              className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between"
                            >
                              <div>
                                <b>
                                  {
                                    o
                                      .schoolcoin_students
                                      ?.full_name
                                  }{' '}
                                  →{' '}
                                  {
                                    o
                                      .schoolcoin_market_rewards
                                      ?.title
                                  }
                                </b>

                                <p className="mt-1 text-xs text-slate-500">
                                  {
                                    o
                                      .schoolcoin_students
                                      ?.student_code
                                  }{' '}
                                  · {o.price}{' '}
                                  coin
                                </p>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {o.status ===
                                  'pending' && (
                                  <button
                                    disabled={busy}
                                    onClick={() =>
                                      updateOrder(
                                        o.id,
                                        'approved'
                                      )
                                    }
                                    className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white transition hover:scale-105"
                                  >
                                    Approve
                                  </button>
                                )}

                                {o.status ===
                                  'approved' && (
                                  <button
                                    disabled={busy}
                                    onClick={() =>
                                      updateOrder(
                                        o.id,
                                        'ready'
                                      )
                                    }
                                    className="rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-white transition hover:scale-105"
                                  >
                                    Ready
                                  </button>
                                )}

                                {o.status ===
                                  'ready' && (
                                  <button
                                    disabled={busy}
                                    onClick={() =>
                                      updateOrder(
                                        o.id,
                                        'delivered'
                                      )
                                    }
                                    className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:scale-105"
                                  >
                                    Delivered
                                  </button>
                                )}

                                <span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold capitalize">
                                  {o.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">
                          Buyurtma yo‘q.
                        </p>
                      )}
                    </div>
                  )}

                  {/* TRANSACTIONS */}

                  {adminTab ===
                    'transactions' && (
                    <div className="rounded-3xl bg-white p-6 shadow-sm">
                      <div className="mb-5">
                        <h2 className="text-2xl font-black">
                          📜 Transactions
                        </h2>

                        <p className="text-sm text-slate-500">
                          Oxirgi 100 ta SchoolCoin
                          transaction.
                        </p>
                      </div>

                      {transactions.length ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm">
                            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
                              <tr>
                                <th className="px-4 py-3">
                                  Type
                                </th>
                                <th className="px-4 py-3">
                                  Amount
                                </th>
                                <th className="px-4 py-3">
                                  Date
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {transactions.map(
                                (t) => (
                                  <tr
                                    key={t.id}
                                    className="border-b last:border-0"
                                  >
                                    <td className="px-4 py-3">
                                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">
                                        {t.transaction_type ||
                                          t.type ||
                                          'transaction'}
                                      </span>
                                    </td>

                                    <td className="px-4 py-3 font-black">
                                      {t.amount ??
                                        t.coin_amount ??
                                        '-'}{' '}
                                      🪙
                                    </td>

                                    <td className="px-4 py-3 text-xs text-slate-500">
                                      {t.created_at
                                        ? new Date(
                                            t.created_at
                                          ).toLocaleString()
                                        : '-'}
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">
                          Hozircha transaction
                          topilmadi.
                        </div>
                      )}
                    </div>
                  )}
                </section>
              </div>
            )}
        </main>
      </div>
    </div>
  );
}
