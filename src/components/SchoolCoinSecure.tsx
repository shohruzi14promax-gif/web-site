import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Activity, Backpack, BookOpen, CheckCircle2, Coins, FileText, Gift, History, LayoutDashboard, Leaf, Lightbulb, LogOut, Palette, Pencil, Plus, Search, ShoppingBag, Shirt, SlidersHorizontal, Star, Trophy, UploadCloud, Users, X, XCircle } from 'lucide-react';
import { signOutAdmin, supabase } from '../lib/supabase';
import SchoolCoinEconomyDashboard from './SchoolCoinEconomyDashboard';

interface Props { onClose: () => void; initialMode?: 'student' | 'admin'; adminSession?: { user?: { email?: string; app_metadata?: { role?: string; ministry?: string } } } | null; }
type Student = { id: string; student_code: string; full_name: string; class_name: string; active?: boolean; balance: number };
type ActivityItem = { id: string; name: string; category: string; coin_reward: number; description?: string; max_per_month?: number | null; requires_evidence?: boolean };
type Reward = { id: string; title: string; description: string; category: string; price: number; stock: number; image?: string };
type Order = { id: string; status: string; price: number; created_at: string; reward_title: string };
type RequestItem = { id: string; status: string; created_at: string; evidence_url?: string | null; note?: string | null; student?: { full_name?: string; student_code?: string } | null; activity?: { name?: string; category?: string; coin_reward?: number } | null };
type Transaction = { id: string; student_id: string; amount: number; transaction_type: string; note?: string; created_at: string };
type StudentTransaction = { amount: number; transaction_type: string; note?: string; created_at: string };
type TopStudent = { rank: number; student_id: string; full_name: string; class_name: string; balance: number };
type StudentRequest = { activity_name: string; status: string; created_at: string; evidence_url?: string | null; note?: string | null; reviewed_at?: string | null };
type PersonalMessage = { id: string; message: string; sender_label: string; created_at: string };
type AdminTab = 'dashboard' | 'students' | 'activities' | 'approvals' | 'market' | 'orders' | 'transactions';

const EVIDENCE_BUCKET = 'schoolcoin-evidence';
const SCHOOL_YEAR_START = '2026-09-02T00:00:00+05:00';
const MAX_EVIDENCE_BYTES = 5 * 1024 * 1024;
const ALLOWED_EVIDENCE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'] as const;
const ACCEPTED_EVIDENCE = ALLOWED_EVIDENCE_TYPES.join(',');

function friendlyError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : '';
  if (/evidence/i.test(message) && /required|topilmadi|tegishli emas/i.test(message)) return 'Evidence fayli yaroqsiz yoki student hisobiga tegishli emas.';
  if (/already exists|duplicate|allaqachon/i.test(message)) return 'Bu faoliyat uchun kutilayotgan so‘rov allaqachon mavjud.';
  if (/limit/i.test(message)) return 'Bu faoliyat uchun oylik limit tugagan.';
  if (/active|Faoliyat topilmadi/i.test(message)) return 'Bu faoliyat endi mavjud emas.';
  if (/Authentication|authenticated|Student authentication/i.test(message)) return 'Student sessiyasi tugagan. Qayta kiring.';
  return fallback;
}

export default function SchoolCoinSecure({ onClose, initialMode = 'student', adminSession = null }: Props) {
  const [mode, setMode] = useState<'student' | 'guest' | 'admin'>(initialMode);
  const [student, setStudent] = useState<Student | null>(null);
  const [code, setCode] = useState(''); const [pin, setPin] = useState('');
  const [activities, setActivities] = useState<ActivityItem[]>([]); const [rewards, setRewards] = useState<Reward[]>([]);
  const [orders, setOrders] = useState<Order[]>([]); const [studentTransactions, setStudentTransactions] = useState<StudentTransaction[]>([]); const [studentRequests, setStudentRequests] = useState<StudentRequest[]>([]); const [topStudents, setTopStudents] = useState<TopStudent[]>([]); const [personalMessages, setPersonalMessages] = useState<PersonalMessage[]>([]);
  const [adminState, setAdminState] = useState(adminSession); const [students, setStudents] = useState<Student[]>([]); const [requests, setRequests] = useState<RequestItem[]>([]); const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [adminEmail, setAdminEmail] = useState(''); const [adminPassword, setAdminPassword] = useState(''); const [tab, setTab] = useState<AdminTab>('dashboard');
  const [search, setSearch] = useState(''); const [category, setCategory] = useState('All'); const [marketCategory, setMarketCategory] = useState('Barchasi'); const [approvalFilter, setApprovalFilter] = useState<'new' | 'approved' | 'rejected'>('new'); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  const [activityName, setActivityName] = useState(''); const [activityCategory, setActivityCategory] = useState('Sport'); const [activityReward, setActivityReward] = useState('10'); const [activityLimit, setActivityLimit] = useState(''); const [activityEvidence, setActivityEvidence] = useState(false);
  const [adjustingStudent, setAdjustingStudent] = useState<Student | null>(null); const [adjustAmount, setAdjustAmount] = useState(''); const [adjustReason, setAdjustReason] = useState('');
  const [evidenceActivity, setEvidenceActivity] = useState<ActivityItem | null>(null); const [evidenceFile, setEvidenceFile] = useState<File | null>(null); const [evidencePreview, setEvidencePreview] = useState(''); const [evidenceNote, setEvidenceNote] = useState('');
  const [viewerUrl, setViewerUrl] = useState(''); const [viewerTitle, setViewerTitle] = useState(''); const [viewerLoading, setViewerLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null); const adjustDialogRef = useRef<HTMLFormElement | null>(null);
  const role = adminState?.user?.app_metadata?.role || '';
  const assignedMinistry = adminState?.user?.app_metadata?.ministry || '';
  const admin = role === 'admin';
  const reviewer = admin || role === 'president' || (role === 'ministry' && Boolean(assignedMinistry));

  const fail = useCallback((value: unknown, fallback: string) => setError(friendlyError(value, fallback)), []);
  const flash = useCallback((message: string) => { setNotice(message); window.setTimeout(() => setNotice(''), 2200); }, []);

  const loadCatalog = useCallback(async () => {
    const [a, r] = await Promise.all([
      supabase.from('schoolcoin_activities').select('*').eq('active', true).order('category').order('coin_reward', { ascending: false }),
      supabase.from('schoolcoin_market_rewards').select('*').eq('active', true).order('category').order('price'),
    ]);
    if (a.error) throw a.error; if (r.error) throw r.error;
    setActivities((a.data || []) as ActivityItem[]); setRewards((r.data || []) as Reward[]);
  }, []);

  const loadStudentHistory = useCallback(async () => {
    const [o, t, q, leaderboard] = await Promise.all([supabase.rpc('schoolcoin_student_orders'), supabase.rpc('schoolcoin_student_transactions'), supabase.rpc('schoolcoin_student_requests'), supabase.rpc('schoolcoin_top_students', { p_limit: 10 })]);
    if (o.error) throw o.error; if (t.error) throw t.error; if (q.error) throw q.error; if (leaderboard.error) throw leaderboard.error;
    setOrders((o.data || []) as Order[]); setStudentTransactions(((t.data || []) as StudentTransaction[]).filter(item => !item.note?.includes('Joonimmm'))); setStudentRequests((q.data || []) as StudentRequest[]); setTopStudents((leaderboard.data || []) as TopStudent[]);
  }, []);

  const loadMinistryApprovals = useCallback(async () => {
    setBusy(true); setError('');
    try {
      const result = await supabase.from('schoolcoin_requests').select('id,status,created_at,evidence_url,note,schoolcoin_students(full_name,student_code),schoolcoin_activities(name,category,coin_reward)').order('created_at', { ascending: false });
      if (result.error) throw result.error;
      setRequests(((result.data || []) as Array<Record<string, unknown>>).map(row => ({ id: String(row.id), status: String(row.status), created_at: String(row.created_at), evidence_url: row.evidence_url ? String(row.evidence_url) : null, note: row.note ? String(row.note) : null, student: (row.schoolcoin_students as { full_name?: string; student_code?: string } | null) || null, activity: (row.schoolcoin_activities as { name?: string; category?: string; coin_reward?: number } | null) || null })));
    } catch (err) { fail(err, 'Vazirlik topshiriqlari yuklanmadi'); } finally { setBusy(false); }
  }, [fail]);

  const loadAdmin = useCallback(async () => {
    setBusy(true); setError('');
    try {
      const [sr, rr, tr, or, ar, mr] = await Promise.all([
        supabase.rpc('schoolcoin_admin_student_balances'),
        supabase.from('schoolcoin_requests').select('id,status,created_at,evidence_url,note,student_id,activity_id,schoolcoin_students(full_name,student_code),schoolcoin_activities(name,category,coin_reward)').order('created_at', { ascending: false }),
        supabase.from('schoolcoin_transactions').select('id,student_id,amount,transaction_type,note,created_at').order('created_at', { ascending: false }).limit(100),
        supabase.from('schoolcoin_orders').select('id,status,price,created_at,schoolcoin_market_rewards(title)').order('created_at', { ascending: false }),
        supabase.from('schoolcoin_activities').select('*').eq('active', true).order('category').order('coin_reward', { ascending: false }),
        supabase.from('schoolcoin_market_rewards').select('*').eq('active', true).order('category').order('price'),
      ]);
      for (const result of [sr, rr, tr, or, ar, mr]) if (result.error) throw result.error;
      setStudents((sr.data || []) as Student[]); setTransactions((tr.data || []) as Transaction[]); setActivities((ar.data || []) as ActivityItem[]); setRewards((mr.data || []) as Reward[]);
      setRequests(((rr.data || []) as Array<Record<string, unknown>>).map(row => ({ id: String(row.id), status: String(row.status), created_at: String(row.created_at), evidence_url: row.evidence_url ? String(row.evidence_url) : null, note: row.note ? String(row.note) : null, student: (row.schoolcoin_students as { full_name?: string; student_code?: string } | null) || null, activity: (row.schoolcoin_activities as { name?: string; category?: string; coin_reward?: number } | null) || null })));
      setOrders(((or.data || []) as Array<Record<string, unknown>>).map(row => ({ id: String(row.id), status: String(row.status), price: Number(row.price), created_at: String(row.created_at), reward_title: String((row.schoolcoin_market_rewards as { title?: string } | null)?.title || 'Reward') })));
    } catch (err) { fail(err, 'Admin ma’lumotlari yuklanmadi'); } finally { setBusy(false); }
  }, [fail]);

  useEffect(() => setAdminState(adminSession), [adminSession]);
  useEffect(() => { if ((mode === 'student' || mode === 'guest') && !student) void loadCatalog().catch(err => fail(err, 'SchoolCoin katalogi yuklanmadi')); }, [mode, student, loadCatalog, fail]);
  useEffect(() => { if (mode === 'guest') void supabase.rpc('schoolcoin_top_students', { p_limit: 10 }).then(result => { if (!result.error) setTopStudents((result.data || []) as TopStudent[]); }); }, [mode]);
  useEffect(() => { if (mode === 'admin' && admin) void loadAdmin(); else if (mode === 'admin' && reviewer) void loadMinistryApprovals(); }, [mode, admin, reviewer, loadAdmin, loadMinistryApprovals]);
  useEffect(() => { if (!evidenceFile) { setEvidencePreview(''); return; } const url = evidenceFile.type.startsWith('image/') ? URL.createObjectURL(evidenceFile) : ''; setEvidencePreview(url); return () => { if (url) URL.revokeObjectURL(url); }; }, [evidenceFile]);
  useEffect(() => { if (!adjustingStudent) return; adjustDialogRef.current?.querySelector<HTMLInputElement>('input')?.focus(); const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setAdjustingStudent(null); }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, [adjustingStudent]);
  useEffect(() => { if (!evidenceActivity) return; const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { setEvidenceActivity(null); setEvidenceFile(null); setEvidenceNote(''); } }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, [evidenceActivity]);

  const studentLogin = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const auth = await supabase.auth.getSession();
      if (!auth.data.session?.user?.is_anonymous) { const signed = await supabase.auth.signInAnonymously(); if (signed.error) throw signed.error; }
      const binding = await supabase.rpc('schoolcoin_bind_student', { p_code: code.trim(), p_pin: pin }); if (binding.error) throw binding.error;
      const current = await supabase.rpc('schoolcoin_current_student'); if (current.error) throw current.error; if (!current.data) throw new Error('Student hisobi topilmadi.');
      const currentStudent = current.data as Student;
      setStudent(currentStudent); setMarketCategory('Barchasi');
      setPersonalMessages(currentStudent.full_name === 'O\'razaliyeva Zuxra Nodirbek qizi' && currentStudent.class_name === '9-V'
        ? [{ id: 'frontend-zuxra-love-note', message: 'Zuxra, buni kim yozganini bilasan. Shunchaki bilib qo‘y: seni sevaman. — Shoxruz', sender_label: 'Shoxruz', created_at: new Date().toISOString() }]
        : []);
      await loadCatalog(); await loadStudentHistory(); flash('SchoolCoin hisobingiz ochildi ✓');
    } catch (err) { fail(err, 'Kirishda xatolik'); } finally { setBusy(false); }
  };
  const studentLogout = async () => { await supabase.auth.signOut(); setStudent(null); setOrders([]); setStudentTransactions([]); setStudentRequests([]); setPersonalMessages([]); setCode(''); setPin(''); flash('SchoolCoin sessiyasi yopildi'); };

  const validateEvidence = (file: File | null) => {
    if (!file) return 'Evidence faylini tanlang.';
    if (file.size <= 0) return 'Bo‘sh fayl yuklash mumkin emas.';
    if (file.size > MAX_EVIDENCE_BYTES) return 'Fayl hajmi 5 MB dan oshmasligi kerak.';
    if (!(ALLOWED_EVIDENCE_TYPES as readonly string[]).includes(file.type)) return 'Faqat JPG, PNG, WEBP yoki PDF fayllar qabul qilinadi.';
    return '';
  };
  const selectEvidence = (file: File | undefined) => { const validation = validateEvidence(file || null); setError(validation); if (validation) { setEvidenceFile(null); return; } setError(''); setEvidenceFile(file || null); };

  const submitActivity = async (activity: ActivityItem, evidence?: File | null, note?: string) => {
    setBusy(true); setError(''); let uploadedPath = '';
    try {
      const session = await supabase.auth.getSession(); const user = session.data.session?.user;
      if (!user?.is_anonymous) throw new Error('Student authentication required');
      if (activity.requires_evidence) {
        const validation = validateEvidence(evidence || null); if (validation) throw new Error(validation);
        const extension = (evidence!.name.split('.').pop() || 'file').toLowerCase().replace(/[^a-z0-9]/g, '');
        const base = evidence!.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50) || 'evidence';
        uploadedPath = `${user.id}/${crypto.randomUUID()}-${base}.${extension}`;
        const upload = await supabase.storage.from(EVIDENCE_BUCKET).upload(uploadedPath, evidence!, { contentType: evidence!.type, upsert: false });
        if (upload.error) throw upload.error;
      }
      const result = await supabase.rpc('schoolcoin_submit_request', { p_activity_id: activity.id, p_evidence_url: uploadedPath || null, p_note: note?.trim() || null });
      if (result.error) throw result.error;
      await loadStudentHistory();
      setEvidenceActivity(null); setEvidenceFile(null); setEvidenceNote('');
      flash('Evidence va so‘rov muvaffaqiyatli yuborildi ✓');
    } catch (err) {
      if (uploadedPath) await supabase.storage.from(EVIDENCE_BUCKET).remove([uploadedPath]).catch(() => undefined);
      fail(err, uploadedPath ? 'Evidence yuklandi, lekin so‘rov yuborilmadi.' : 'So‘rov yuborilmadi');
    } finally { setBusy(false); }
  };

  const handleActivityClick = (activity: ActivityItem) => {
    const pending = studentRequests.some(item => item.activity_name === activity.name && item.status === 'pending');
    if (pending) { setError('Bu faoliyat uchun kutilayotgan so‘rov allaqachon mavjud.'); return; }
    if (activity.requires_evidence) { setError(''); setEvidenceActivity(activity); return; }
    void submitActivity(activity);
  };

  const redeem = async (reward: Reward) => {
    if (!student || reward.stock < 1) return; setBusy(true); setError('');
    try { const result = await supabase.rpc('schoolcoin_market_redeem', { p_reward_id: reward.id }); if (result.error) throw result.error; const newBalance = Number((result.data as { new_balance?: number } | null)?.new_balance ?? student.balance - reward.price); setStudent(prev => prev ? { ...prev, balance: newBalance } : prev); await Promise.all([loadStudentHistory(), loadCatalog()]); flash('Buyurtma yuborildi 🎁'); }
    catch (err) { fail(err, 'Redeem amalga oshmadi'); } finally { setBusy(false); }
  };

  const adminLogin = async (event: FormEvent) => { event.preventDefault(); setBusy(true); setError(''); try { const result = await supabase.auth.signInWithPassword({ email: adminEmail.trim(), password: adminPassword }); if (result.error) throw result.error; const nextRole = result.data.user?.app_metadata?.role || ''; const nextMinistry = result.data.user?.app_metadata?.ministry || ''; if (!['admin', 'president'].includes(nextRole) && !(nextRole === 'ministry' && nextMinistry)) { await supabase.auth.signOut(); throw new Error('Bu akkauntga SchoolCoin topshiriqlarini ko‘rish ruxsati berilmagan.'); } setAdminState(result.data.session as typeof adminState); setMode('admin'); setAdminPassword(''); setTab('approvals'); } catch (err) { fail(err, 'Kirishda xatolik'); } finally { setBusy(false); } };
  const approve = async (requestId: string, allow: boolean) => { setBusy(true); setError(''); try { const result = await supabase.rpc('schoolcoin_admin_approve_request', { p_request_id: requestId, p_approve: allow }); if (result.error) throw result.error; flash(allow ? 'Topshiriq tasdiqlandi, SchoolCoin berildi ✓' : 'Topshiriq rad etildi'); if (admin) await loadAdmin(); else await loadMinistryApprovals(); } catch (err) { fail(err, 'Amal bajarilmadi'); } finally { setBusy(false); } };
  const updateOrder = async (id: string, status: 'pending' | 'approved' | 'ready' | 'delivered' | 'rejected') => { setBusy(true); setError(''); try { const result = await supabase.rpc('schoolcoin_admin_update_order_status', { p_order_id: id, p_status: status, p_reason: null }); if (result.error) throw result.error; flash('Buyurtma yangilandi ✓'); await loadAdmin(); } catch (err) { fail(err, 'Buyurtma yangilanmadi'); } finally { setBusy(false); } };
  const createActivity = async (event: FormEvent) => { event.preventDefault(); setBusy(true); setError(''); try { const reward = Number(activityReward); const limit = activityLimit.trim() ? Number(activityLimit) : null; if (!activityName.trim() || !activityCategory.trim() || !Number.isInteger(reward) || reward <= 0) throw new Error('Faoliyat nomi, kategoriya va musbat coin reward kerak.'); if (limit !== null && (!Number.isInteger(limit) || limit <= 0)) throw new Error('Oylik limit musbat butun son bo‘lishi kerak.'); const result = await supabase.rpc('schoolcoin_admin_create_activity', { p_name: activityName.trim(), p_category: activityCategory.trim(), p_coin_reward: reward, p_max_per_month: limit, p_requires_evidence: activityEvidence }); if (result.error) throw result.error; setActivityName(''); setActivityReward('10'); setActivityLimit(''); setActivityEvidence(false); flash('Faoliyat qo‘shildi ✓'); await loadAdmin(); } catch (err) { fail(err, 'Faoliyat qo‘shilmadi'); } finally { setBusy(false); } };
  const adjustBalance = async (event: FormEvent) => { event.preventDefault(); if (!adjustingStudent) return; setBusy(true); setError(''); try { const amount = Number(adjustAmount); if (!Number.isInteger(amount) || amount === 0) throw new Error('Adjustment miqdori 0 bo‘lmagan butun son bo‘lishi kerak.'); if (!adjustReason.trim()) throw new Error('Adjustment sababi talab qilinadi.'); const result = await supabase.rpc('schoolcoin_admin_adjust_balance', { p_student_id: adjustingStudent.id, p_amount: amount, p_reason: adjustReason.trim() }); if (result.error) throw result.error; setAdjustingStudent(null); setAdjustAmount(''); setAdjustReason(''); flash('Balans yangilandi ✓'); await loadAdmin(); } catch (err) { fail(err, 'Balans yangilanmadi'); } finally { setBusy(false); } };
  const logout = async () => { await signOutAdmin(); setAdminState(null); setMode('student'); };

  const viewEvidence = async (path: string | null | undefined, title: string) => { if (!path) return; setViewerLoading(true); setViewerTitle(title); setViewerUrl(''); try { const session = await supabase.auth.getSession(); if (!['admin', 'president', 'ministry'].includes(session.data.session?.user?.app_metadata?.role || '')) throw new Error('Reviewer authentication required'); const result = await supabase.storage.from(EVIDENCE_BUCKET).createSignedUrl(path, 300); if (result.error) throw result.error; setViewerUrl(result.data.signedUrl); } catch (err) { fail(err, 'Evidence faylini ochib bo‘lmadi'); } finally { setViewerLoading(false); } };

  const categories = ['All', ...Array.from(new Set(activities.map(item => item.category).filter(Boolean)))];
  const filteredActivities = category === 'All' ? activities : activities.filter(item => item.category === category);
  const ministryCatalogs = [
    { id: 'Sport vazirligi', label: 'Sport vazirligi', Icon: Activity },
    { id: 'Ta’lim vazirligi', label: 'Ta’lim vazirligi', Icon: BookOpen },
    { id: 'Innovatsiya va IT vazirligi', label: 'Innovatsiya va IT vazirligi', Icon: Lightbulb },
    { id: 'Madaniyat vazirligi', label: 'Madaniyat vazirligi', Icon: Palette },
    { id: 'Ekologiya vazirligi', label: 'Ekologiya vazirligi', Icon: Leaf },
    { id: 'Yoshlar va ijtimoiy ishlar vazirligi', label: 'Yoshlar va ijtimoiy ishlar vazirligi', Icon: Users },
  ];
  const getMarketCategory = (reward: Reward) => {
    if (ministryCatalogs.some(ministry => ministry.id === reward.category)) return reward.category;
    const textValue = (reward.title + ' ' + reward.description + ' ' + reward.category).toLowerCase();
    if (/futbol|voleybol|basketbol|badminton|frisbee|arqon|sport|medal/.test(textValue)) return 'Sport vazirligi';
    if (/lego|lamp|quloqchin|coding|arduino|stem|ai|texnolog|tech|elektron/.test(textValue)) return 'Innovatsiya va IT vazirligi';
    if (/akvarel|guash|flomaster|rangli|skretch|ijod|stiker|art|creative|dizayn|marker/.test(textValue)) return 'Madaniyat vazirligi';
    if (/eco|eko|ekolog|yashil|tote|bottle/.test(textValue)) return 'Ekologiya vazirligi';
    if (/hoodie|futbolka|kepka|merch|badge|wristband|ryukzak|premium|vip|bundle|experience|achievement/.test(textValue)) return 'Yoshlar va ijtimoiy ishlar vazirligi';
    return 'Ta’lim vazirligi';
  };
  const marketCatalogs = [{ id: 'Barchasi', label: 'Barchasi', Icon: Gift }, ...ministryCatalogs];
  const filteredRewards = marketCategory === 'Barchasi' ? rewards : rewards.filter(item => getMarketCategory(item) === marketCategory);
  const filteredStudents = useMemo(() => { const q = search.trim().toLowerCase(); return q ? students.filter(item => `${item.full_name} ${item.student_code} ${item.class_name}`.toLowerCase().includes(q)) : students; }, [students, search]);
  const totalCoins = students.reduce((sum, item) => sum + item.balance, 0);
  const currentYearRequests = studentRequests.filter(item => new Date(item.created_at).getTime() >= new Date(SCHOOL_YEAR_START).getTime());
  const completedCurrentYearTasks = currentYearRequests.filter(item => item.status === 'approved');
  const currentYearTransactions = studentTransactions.filter(item => new Date(item.created_at).getTime() >= new Date(SCHOOL_YEAR_START).getTime());

  return <div className="fixed inset-0 z-[120] overflow-auto bg-slate-950/70 p-3 backdrop-blur-xl md:p-6 motion-reduce:backdrop-blur-none">
    <div className="mx-auto flex max-h-[calc(100vh-24px)] min-h-[calc(100vh-24px)] max-w-7xl flex-col overflow-hidden rounded-[28px] bg-slate-50 shadow-2xl">
      <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur md:px-6"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-100 text-amber-600"><Coins /></div><div><h1 className="text-lg font-black">SchoolCoin</h1><p className="text-xs text-slate-500">Student economy & rewards</p></div></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setMode('guest')} className={`min-h-10 rounded-xl px-3 py-2 text-sm font-semibold transition ${mode === 'guest' ? 'bg-slate-900 text-white' : 'bg-slate-100 hover:bg-slate-200'}`}>Guest Mode</button><button type="button" onClick={() => setMode('student')} className={`min-h-10 rounded-xl px-3 py-2 text-sm font-semibold transition ${mode === 'student' ? 'bg-slate-900 text-white' : 'bg-slate-100 hover:bg-slate-200'}`}>Student</button><button type="button" onClick={() => setMode('admin')} className={`min-h-10 rounded-xl px-3 py-2 text-sm font-semibold transition ${mode === 'admin' ? 'bg-slate-900 text-white' : 'bg-slate-100 hover:bg-slate-200'}`}>Admin</button><button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-slate-100" aria-label="Yopish"><X /></button></div></header>
      <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
        {error && <div role="alert" className="mb-4 flex items-center justify-between rounded-2xl border border-red-100 bg-red-50 p-3 text-sm text-red-700"><span>{error}</span><button type="button" onClick={() => setError('')} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-red-100" aria-label="Xatoni yopish"><X className="h-4 w-4" /></button></div>}
        {notice && <div role="status" className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{notice}</div>}
        {mode !== 'admin' && <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-bold text-slate-900">Yangiliklarni kuzatib boring</p><p className="mt-1 text-sm text-slate-500">SchoolCoin va saytning yangi imkoniyatlari, rewardlar hamda muhim e’lonlar — barchasi Telegram kanalimizda.</p></div><a href="https://t.me/yusufovichsh" target="_blank" rel="noreferrer" className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">@yusufovichsh <span className="ml-1">→</span></a></div>}
        {mode === 'guest' && <section className="space-y-6">
          <div className="rounded-3xl bg-slate-900 p-6 text-white"><p className="text-sm text-white/60">SchoolCoin</p><h2 className="mt-1 text-2xl font-black">Guest Mode</h2><p className="mt-2 max-w-2xl text-sm text-white/70">Login qilmasdan SchoolCoin faoliyatlari, TOP 10 va Market rewardlarini ko‘rishingiz mumkin.</p></div>
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between gap-3"><div><h3 className="flex items-center gap-2 font-bold"><Trophy className="h-5 w-5 text-amber-500" />Top o‘quvchilar</h3><p className="mt-1 text-xs text-slate-500">SchoolCoin balansi bo‘yicha TOP 10</p></div><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">TOP 10</span></div>
            {topStudents.length ? <div className="max-h-72 space-y-2 overflow-y-auto pr-1">{topStudents.map(item => <div key={item.student_id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-sm font-black shadow-sm">{item.rank}</div><div className="min-w-0 flex-1"><p className="truncate font-semibold">{item.full_name}</p><p className="text-xs text-slate-500">{item.class_name}</p></div><span className="shrink-0 font-black text-amber-600">{item.balance} 🪙</span></div>)}</div> : <p className="text-sm text-slate-500">Hozircha reyting mavjud emas.</p>}
          </section>
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4"><h3 className="flex items-center gap-2 font-bold"><Activity className="h-5 w-5 text-amber-600" />SchoolCoin Tasks</h3><p className="mt-1 text-xs text-slate-500">Mavjud faoliyatlar va beriladigan SchoolCoin mukofotlari.</p></div><div className="flex gap-2 overflow-x-auto pb-1">{categories.map(item => <span key={item} className="min-h-10 shrink-0 rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold">{item}</span>)}</div><div className="mt-5 max-h-[560px] overflow-y-auto pr-1"><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{filteredActivities.length ? filteredActivities.map(item => <article key={item.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><h3 className="font-bold">{item.name}</h3><span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">+{item.coin_reward}</span></div><p className="mt-2 text-sm text-slate-500">{item.description || 'Faoliyat uchun SchoolCoin olinadi.'}</p>{item.requires_evidence && <p className="mt-2 text-xs font-semibold text-slate-500">Evidence talab qilinadi</p>}</article>) : <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Hozircha tasklar yo‘q.</p>}</div></div></section>
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between gap-3"><div><div className="flex items-center gap-2"><Gift className="h-5 w-5 text-amber-600" /><h3 className="font-bold">SchoolCoin Market</h3></div><p className="mt-1 text-xs text-slate-500">Guest Mode’da rewardlarni ko‘rish mumkin. Sotib olish uchun student hisobiga kiring.</p></div><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{filteredRewards.length} ta reward</span></div><div className="mb-4 flex gap-2 overflow-x-auto pb-1">{marketCatalogs.map(({ id, label, Icon }) => <button type="button" key={id} onClick={() => setMarketCategory(id)} className={`flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${marketCategory === id ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}><Icon className="h-4 w-4" />{label}</button>)}</div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{filteredRewards.length ? filteredRewards.map(item => <article key={item.id} className="rounded-2xl border border-slate-200 p-4"><div className="mb-2 flex items-start justify-between gap-3"><div><span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{getMarketCategory(item)}</span><h4 className="mt-1 font-bold">{item.title}</h4></div><span className="shrink-0 rounded-lg bg-amber-50 px-2 py-1 text-sm font-black text-amber-700">{item.price} 🪙</span></div><p className="mt-2 text-sm text-slate-500">{item.description}</p><div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs"><span className="font-semibold text-slate-600">📦 Qoldiq</span><span className="font-black">{item.stock === 0 ? 'Tugagan' : item.stock + ' dona'}</span></div></article>) : <div className="rounded-2xl bg-slate-50 p-5 text-center md:col-span-2 lg:col-span-3"><p className="font-semibold text-slate-700">Bu katalogda hozircha reward yo‘q.</p></div>}</div></section>
        </section>}
        {mode === 'student' && !student && <section className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><div className="mb-6 text-center"><Coins className="mx-auto h-10 w-10 text-amber-500" /><h2 className="mt-3 text-2xl font-black">Student Login</h2><p className="mt-1 text-sm text-slate-500">Student kodi va PIN orqali xavfsiz kirish</p></div><form onSubmit={studentLogin} className="space-y-3"><label className="block text-sm font-semibold">Student code<input required value={code} onChange={e => setCode(e.target.value)} placeholder="Student code" autoComplete="username" className="mt-1 w-full rounded-2xl border border-slate-200 p-3.5 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200" /></label><label className="block text-sm font-semibold">PIN<input required value={pin} onChange={e => setPin(e.target.value)} placeholder="PIN" type="password" inputMode="numeric" autoComplete="current-password" className="mt-1 w-full rounded-2xl border border-slate-200 p-3.5 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200" /></label><button disabled={busy} className="min-h-11 w-full rounded-2xl bg-slate-900 p-3.5 font-semibold text-white transition active:scale-[.98] disabled:opacity-50">{busy ? 'Tekshirilmoqda…' : 'Kirish'}</button></form></section>}
        {mode === 'student' && student && <section className="space-y-6">
          {personalMessages.length > 0 && <section className="rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 via-white to-pink-50 p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-rose-100 text-rose-600">❤️</div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wide text-rose-500">Siz uchun maxsus xabar</p>
                <p className="mt-2 text-base font-semibold leading-7 text-slate-800">{personalMessages[0].message}</p>
                <p className="mt-2 text-xs text-slate-400">— {personalMessages[0].sender_label}</p>
              </div>
            </div>
          </section>}
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900 shadow-sm">
            <p className="font-bold">📢 Yangi o‘quv yili boshlandi!</p>
            <p className="mt-1">SchoolCoin’da tasklar <b>2026-yil 2-sentabrdan</b> boshlab hisoblanadi. O‘tgan o‘quv yilidagi tasklar bu yilgi natijalarga qo‘shilmaydi.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_auto]"><div className="rounded-3xl bg-slate-900 p-6 text-white"><p className="text-sm text-white/60">Student</p><h2 className="mt-1 text-2xl font-black">{student.full_name}</h2><p className="mt-1 text-sm text-white/60">{student.class_name} · {student.student_code}</p></div><div className="flex items-center justify-between gap-4 rounded-3xl bg-amber-50 p-6 md:block md:text-right"><div><p className="text-xs font-bold uppercase text-amber-700">Balance</p><p className="mt-1 text-4xl font-black text-amber-700">{student.balance}</p></div><button type="button" onClick={() => void studentLogout()} className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">Chiqish</button></div></div>
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div><h3 className="flex items-center gap-2 font-bold"><Trophy className="h-5 w-5 text-amber-500" />Top o‘quvchilar</h3><p className="mt-1 text-xs text-slate-500">SchoolCoin balansi bo‘yicha TOP 10</p></div>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">TOP 10</span>
            </div>
            {topStudents.length ? <div className="space-y-2">{topStudents.map(item => <div key={item.student_id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-sm font-black shadow-sm">{item.rank}</div>
              <div className="min-w-0 flex-1"><p className="truncate font-semibold">{item.full_name}</p><p className="text-xs text-slate-500">{item.class_name}</p></div>
              <span className="shrink-0 font-black text-amber-600">{item.balance} 🪙</span>
            </div>)}</div> : <p className="text-sm text-slate-500">Hozircha reyting mavjud emas.</p>}
          </section>
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map(item => (
                <button type="button" key={item} onClick={() => setCategory(item)} className={`min-h-10 shrink-0 rounded-full px-3 py-2 text-xs font-semibold ${category === item ? 'bg-slate-900 text-white' : 'bg-slate-100 hover:bg-slate-200'}`}>
                  {item}
                </button>
              ))}
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredActivities.length ? filteredActivities.map(item => (
                <article key={item.id} className="rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold">{item.name}</h3>
                    <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">+{item.coin_reward}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{item.description || 'Faoliyat uchun SchoolCoin oling.'}</p>
                  {item.requires_evidence && <p className="mt-2 text-xs font-semibold text-slate-500">Evidence: JPG, PNG, WEBP yoki PDF · max 5 MB</p>}
                  <button disabled={busy || studentRequests.some(req => req.activity_name === item.name && req.status === 'pending')} type="button" onClick={() => handleActivityClick(item)} className="mt-4 min-h-11 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white transition active:scale-[.98] disabled:opacity-40">
                    {studentRequests.some(req => req.activity_name === item.name && req.status === 'pending') ? 'Kutilmoqda…' : item.requires_evidence ? 'Evidence bilan yuborish' : 'So‘rov yuborish'}
                  </button>
                </article>
              )) : <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Bu kategoriyada faoliyat yo‘q.</p>}
            </div>
          </section>
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div><div className="flex items-center gap-2"><Gift className="h-5 w-5 text-amber-600" /><h3 className="font-bold">SchoolCoin Market</h3></div><p className="mt-1 text-xs text-slate-500">SchoolCoinlaringizni kerakli rewardlarga almashtiring.</p></div>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{filteredRewards.length} ta reward</span>
            </div>
            <div className="flex gap-2 overflow-x-auto border-b border-slate-100 pb-3">
              {marketCatalogs.map(({ id, label, Icon }) => <button type="button" key={id} onClick={() => setMarketCategory(id)} className={`flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${marketCategory === id ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}><Icon className="h-4 w-4" />{label}</button>)}
            </div>
            <div className="mt-5 max-h-[600px] overflow-y-auto pr-1"><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredRewards.length ? filteredRewards.map(item => <article key={item.id} className="rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none">
                <div className="mb-2 flex items-start justify-between gap-3"><div><span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{getMarketCategory(item)}</span><h4 className="mt-1 font-bold">{item.title}</h4></div><span className="shrink-0 rounded-lg bg-amber-50 px-2 py-1 text-sm font-black text-amber-700">{item.price} 🪙</span></div>
                <p className="mt-2 text-sm text-slate-500">{item.description}</p>
                <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs"><span className="font-semibold text-slate-600">📦 Qoldiq</span><span className={`font-black ${item.stock === 0 ? 'text-red-600' : item.stock <= 3 ? 'text-amber-600' : 'text-emerald-600'}`}>{item.stock === 0 ? 'Tugagan' : `${item.stock} dona`}</span></div>
                <button disabled={busy || item.stock < 1 || student.balance < item.price} type="button" onClick={() => void redeem(item)} className="mt-4 min-h-11 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white disabled:opacity-40">{item.stock < 1 ? 'Tugagan' : student.balance < item.price ? 'Coin yetarli emas' : 'Sotib olish'}</button>
              </article>) : <div className="rounded-2xl bg-slate-50 p-5 text-center md:col-span-2 lg:col-span-3"><p className="font-semibold text-slate-700">Bu katalogda hozircha reward yo‘q.</p><p className="mt-1 text-xs text-slate-500">Boshqa kataloglarni ko‘rib chiqing.</p></div>}
            </div></div>
          </section>
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="flex items-center gap-2 font-bold"><CheckCircle2 className="h-5 w-5 text-emerald-600" />Bu o‘quv yilida bajarilgan tasklar</h3><p className="mt-1 text-xs text-slate-600">Faqat 2-sentabr 2026 dan boshlab tasdiqlangan tasklar hisoblanadi. O‘tgan o‘quv yilidagi tasklar hisoblanmaydi.</p></div><span className="rounded-full bg-white px-3 py-1 text-xs font-black text-emerald-700">{completedCurrentYearTasks.length} ta</span></div>{completedCurrentYearTasks.length ? <div className="mt-4 max-h-72 overflow-y-auto pr-1"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{completedCurrentYearTasks.slice(0, 12).map((item,index)=><div key={item.created_at + '-' + index} className="rounded-2xl bg-white p-4"><div className="flex items-start justify-between gap-2"><b>{item.activity_name}</b><span className="text-xs font-bold text-emerald-700">✓ Bajarilgan</span></div><p className="mt-1 text-xs text-slate-500">{new Date(item.created_at).toLocaleString()}</p></div>)}</div></div> : <p className="mt-4 rounded-2xl bg-white p-4 text-sm text-slate-500">2-sentabrdan beri hali tasdiqlangan task yo‘q.</p>}</div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2"><section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="mb-4 flex items-center gap-2 font-bold"><History className="h-5 w-5" />Bu o‘quv yili Coin tarixi</h3>{currentYearTransactions.length ? <div className="max-h-72 space-y-2 overflow-y-auto pr-1">{currentYearTransactions.slice(0, 20).map((item, index) => <div key={item.created_at + '-' + index} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3"><div><b>{item.transaction_type}</b><p className="text-xs text-slate-500">{item.note || 'SchoolCoin transaction'}</p></div><span className={item.amount >= 0 ? 'font-black text-emerald-600' : 'font-black text-red-600'}>{item.amount > 0 ? '+' : ''}{item.amount}</span></div>)}</div> : <p className="text-sm text-slate-500">Bu o‘quv yilida transaction yo‘q.</p>}</section><section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="mb-4 font-bold">Bu o‘quv yilidagi faoliyat so‘rovlari</h3>{currentYearRequests.length ? <div className="max-h-72 space-y-2 overflow-y-auto pr-1">{currentYearRequests.slice(0, 20).map((item, index) => <div key={item.created_at + '-' + index} className="rounded-2xl bg-slate-50 p-3"><div className="flex items-center justify-between gap-3"><b>{item.activity_name}</b><span className="text-xs font-semibold">{item.status}</span></div><p className="mt-1 text-xs text-slate-500">{new Date(item.created_at).toLocaleString()}</p>{item.evidence_url && <p className="mt-1 text-xs font-semibold text-emerald-700">Evidence biriktirilgan</p>}</div>)}</div> : <p className="text-sm text-slate-500">Bu o‘quv yilida so‘rov yo‘q.</p>}</section></div>
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="mb-4 flex items-center gap-2 font-bold"><ShoppingBag className="h-5 w-5" />Buyurtmalar tarixi</h3>{orders.length ? <div className="space-y-2">{orders.map(item => <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3"><div><b>{item.reward_title}</b><p className="text-xs text-slate-500">{new Date(item.created_at).toLocaleString()}</p></div><div className="text-right"><b>{item.price}</b><p className="text-xs text-slate-500">{item.status}</p></div></div>)}</div> : <p className="text-sm text-slate-500">Hozircha buyurtma yo‘q.</p>}</section>
        </section>}
        {mode === 'admin' && !reviewer && <section className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><div className="mb-6 text-center"><LayoutDashboard className="mx-auto h-10 w-10" /><h2 className="mt-3 text-2xl font-black">SchoolCoin · Vazirlik tekshiruvi</h2><p className="mt-1 text-sm text-slate-500">Vazirlik yoki Prezident akkaunti orqali kiring</p></div><form onSubmit={adminLogin} className="space-y-3"><label className="block text-sm font-semibold">Admin email<input required type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="Email" autoComplete="username" className="mt-1 w-full rounded-2xl border p-3.5" /></label><label className="block text-sm font-semibold">Parol<input required type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} placeholder="Parol" autoComplete="current-password" className="mt-1 w-full rounded-2xl border p-3.5" /></label><button disabled={busy} className="min-h-11 w-full rounded-2xl bg-slate-900 p-3.5 font-semibold text-white disabled:opacity-50">{busy ? 'Tekshirilmoqda…' : 'Kirish'}</button></form></section>}
        {mode === 'admin' && reviewer && !admin && <section className="space-y-5"><div className="rounded-3xl border border-slate-200 bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-black">Topshiriqlarni tekshirish</h2><p className="mt-1 text-sm text-slate-500">{role === 'president' ? 'Prezident — barcha vazirliklar' : assignedMinistry} · {requests.length} ta topshiriq</p></div><div className="flex gap-2"><button type="button" onClick={() => void loadMinistryApprovals()} className="rounded-xl border px-4 py-2 text-sm font-semibold">Yangilash</button><button type="button" onClick={() => void logout()} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Chiqish</button></div></div></div>{busy && !requests.length ? <p className="rounded-2xl bg-white p-6">Yuklanmoqda…</p> : requests.length ? <div className="grid gap-4 lg:grid-cols-2">{requests.map(item => <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">{item.activity?.category || assignedMinistry || 'Vazirlik'}</span><h3 className="mt-3 font-bold">{item.activity?.name || 'Faoliyat'}</h3><p className="mt-1 text-sm text-slate-500">{item.student?.full_name || 'O‘quvchi'} · {item.student?.student_code || ''}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${item.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : item.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{item.status === 'pending' ? 'Tekshiruvda' : item.status === 'approved' ? 'Tasdiqlangan' : 'Rad etilgan'}</span></div><p className="mt-3 text-sm text-slate-600">Mukofot: +{item.activity?.coin_reward || 0} SchoolCoin</p>{item.note && <p className="mt-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">Izoh: {item.note}</p>}{item.evidence_url && <button type="button" disabled={viewerLoading} onClick={() => void viewEvidence(item.evidence_url, `${item.student?.full_name || 'O‘quvchi'} · ${item.activity?.name || 'Dalil'}`)} className="mt-3 rounded-xl border px-3 py-2 text-sm font-semibold"><FileText className="mr-1 inline h-4 w-4" />Dalilni ko‘rish</button>}<div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={busy || item.status !== 'pending'} onClick={() => void approve(item.id, true)} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"><CheckCircle2 className="mr-1 inline h-4 w-4" />Tasdiqlash</button><button type="button" disabled={busy || item.status !== 'pending'} onClick={() => void approve(item.id, false)} className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700"><XCircle className="mr-1 inline h-4 w-4" />Rad etish</button></div></article>)}</div> : <p className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500">Hozircha sizga biriktirilgan topshiriqlar yo‘q.</p>}</section>}
        {mode === 'admin' && admin && (\n          <div className="grid gap-6 lg:grid-cols-[220px_1fr]"><aside className="rounded-3xl bg-slate-900 p-3 text-white lg:sticky lg:top-24 lg:h-fit">{([['dashboard', LayoutDashboard, 'Dashboard'], ['students', Users, 'Students'], ['activities', Activity, 'Activities'], ['approvals', CheckCircle2, 'Approvals'], ['market', Gift, 'Market'], ['orders', ShoppingBag, 'Orders'], ['transactions', History, 'Transactions']] as const).map(([id, Icon, label]) => <button type="button" key={id} onClick={() => setTab(id)} className={`mb-1 flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold transition ${tab === id ? 'bg-white text-slate-900' : 'text-white/75 hover:bg-white/10'}`}><Icon className="h-4 w-4" />{label}</button>)}<button type="button" onClick={() => void logout()} className="mt-4 flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-red-300 hover:bg-white/10"><LogOut className="h-4 w-4" />Chiqish</button></aside><section className="space-y-5">
          {tab === 'dashboard' && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-3xl border border-slate-200 bg-white p-5"><p className="text-xs text-slate-500">Students</p><p className="mt-2 text-3xl font-black">{students.length}</p></div><div className="rounded-3xl border border-slate-200 bg-white p-5"><p className="text-xs text-slate-500">SchoolCoin</p><p className="mt-2 text-3xl font-black">{totalCoins}</p></div><div className="rounded-3xl border border-slate-200 bg-white p-5"><p className="text-xs text-slate-500">Approvals</p><p className="mt-2 text-3xl font-black">{requests.length}</p></div><div className="rounded-3xl border border-slate-200 bg-white p-5"><p className="text-xs text-slate-500">Pending orders</p><p className="mt-2 text-3xl font-black">{orders.filter(o => o.status === 'pending').length}</p></div></div>}
          {tab === 'dashboard' && <SchoolCoinEconomyDashboard />}
          {tab === 'students' && <div className="rounded-3xl border border-slate-200 bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold">Students</h3><p className="text-xs text-slate-500">Balance adjustment server-side RPC orqali himoyalangan.</p></div><div className="relative w-full sm:w-auto"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Qidirish" aria-label="Student qidirish" className="w-full rounded-xl border py-2.5 pl-9 pr-3 text-sm sm:w-64" /></div></div><div className="mt-4 max-h-[520px] overflow-auto rounded-2xl border border-slate-100"><table className="min-w-[680px] w-full text-sm"><thead><tr className="border-b text-left text-slate-500"><th className="px-3 py-3">Student</th><th className="px-3 py-3">Class</th><th className="px-3 py-3">Code</th><th className="px-3 py-3">Balance</th><th className="px-3 py-3">Action</th></tr></thead><tbody>{filteredStudents.length ? filteredStudents.map(item => <tr key={item.id} className="border-b last:border-0"><td className="px-3 py-3 font-semibold">{item.full_name}</td><td className="px-3 py-3">{item.class_name}</td><td className="px-3 py-3">{item.student_code}</td><td className="px-3 py-3 font-bold">{item.balance}</td><td className="px-3 py-3"><button type="button" onClick={() => setAdjustingStudent(item)} className="inline-flex min-h-10 items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white"><SlidersHorizontal className="h-3.5 w-3.5" />Adjust</button></td></tr>) : <tr><td colSpan={5} className="px-3 py-8 text-center text-sm text-slate-500">Student topilmadi.</td></tr>}</tbody></table></div></div>}
          {tab === 'activities' && <div className="space-y-4"><div className="rounded-3xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2"><Plus className="h-5 w-5" /><div><h3 className="font-bold">Activity yaratish</h3><p className="text-xs text-slate-500">Mavjud admin RPC ishlatiladi.</p></div></div><form onSubmit={createActivity} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><input required value={activityName} onChange={e => setActivityName(e.target.value)} placeholder="Activity nomi" aria-label="Activity nomi" className="rounded-xl border p-3" /><input required value={activityCategory} onChange={e => setActivityCategory(e.target.value)} placeholder="Kategoriya" aria-label="Kategoriya" className="rounded-xl border p-3" /><input required min="1" type="number" value={activityReward} onChange={e => setActivityReward(e.target.value)} placeholder="Coin" aria-label="Coin reward" className="rounded-xl border p-3" /><input min="1" type="number" value={activityLimit} onChange={e => setActivityLimit(e.target.value)} placeholder="Oylik limit" aria-label="Oylik limit" className="rounded-xl border p-3" /><label className="flex items-center gap-2 rounded-xl border p-3 text-sm"><input type="checkbox" checked={activityEvidence} onChange={e => setActivityEvidence(e.target.checked)} /> Evidence</label><button disabled={busy} className="min-h-11 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-50 sm:col-span-2 lg:col-span-5">{busy ? 'Saqlanmoqda…' : 'Activity qo‘shish'}</button></form></div><div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="font-bold">Activities · {activities.length}</h3><div className="mt-4 max-h-[520px] overflow-y-auto pr-1"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{activities.length ? activities.map(item => <div key={item.id} className="rounded-2xl border p-4"><div className="flex justify-between gap-3"><b>{item.name}</b><span className="text-xs font-bold text-amber-700">+{item.coin_reward}</span></div><p className="mt-1 text-xs text-slate-500">{item.category}{item.max_per_month ? ` · ${item.max_per_month}/oy` : ''}{item.requires_evidence ? ' · Evidence' : ''}</p></div>) : <p className="text-sm text-slate-500">Faoliyat yo‘q.</p>}</div></div></div>}
          {tab === 'approvals' && (() => {
            const filteredRequests = requests.filter(item => item.status === (approvalFilter === 'new' ? 'pending' : approvalFilter));
            const pendingCount = requests.filter(item => item.status === 'pending').length;
            const approvedCount = requests.filter(item => item.status === 'approved').length;
            const rejectedCount = requests.filter(item => item.status === 'rejected').length;
            return <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-bold">Approvals</h3>
                <div className="flex flex-wrap gap-2">
                  {([
                    ['new', 'Yangi', pendingCount],
                    ['approved', 'Tasdiqlangan', approvedCount],
                    ['rejected', 'Rad etilgan', rejectedCount],
                  ] as const).map(([id, label, count]) => <button key={id} type="button" onClick={() => setApprovalFilter(id)} className={`min-h-10 rounded-xl px-3 py-2 text-sm font-semibold transition ${approvalFilter === id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{label} <span className={`ml-1 rounded-full px-1.5 py-0.5 text-xs ${approvalFilter === id ? 'bg-white/15' : 'bg-white'}`}>{count}</span></button>)}
                </div>
              </div>
              <div className="mt-4 max-h-[620px] space-y-3 overflow-y-auto pr-1">
                {filteredRequests.length ? filteredRequests.map(item => <div key={item.id} className="flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <b>{item.student?.full_name || 'Student'} · {item.activity?.name || 'Activity'}</b>
                    <p className="text-sm text-slate-500">+{item.activity?.coin_reward || 0} coin · {item.status === 'pending' ? 'Yangi' : item.status === 'approved' ? 'Tasdiqlangan' : 'Rad etilgan'}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.evidence_url && <button type="button" disabled={viewerLoading} onClick={() => void viewEvidence(item.evidence_url, `${item.student?.full_name || 'Student'} · ${item.activity?.name || 'Evidence'}`)} className="min-h-10 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"><FileText className="mr-1 inline h-4 w-4" />Evidence</button>}
                    {item.status === 'pending' && <><button type="button" disabled={busy} onClick={() => void approve(item.id, true)} className="min-h-10 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"><CheckCircle2 className="mr-1 inline h-4 w-4" />Tasdiqlash</button><button type="button" disabled={busy} onClick={() => void approve(item.id, false)} className="min-h-10 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"><XCircle className="mr-1 inline h-4 w-4" />Rad etish</button></>}
                  </div>
                </div>) : <p className="text-sm text-slate-500">{approvalFilter === 'new' ? 'Yangi so‘rov yo‘q.' : approvalFilter === 'approved' ? 'Tasdiqlangan so‘rov yo‘q.' : 'Rad etilgan so‘rov yo‘q.'}</p>}
              </div>
            </div>;
          })()}
          {tab === 'market' && <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="font-bold">Market · {rewards.length}</h3><p className="mt-2 text-sm text-slate-500">Market rewardlar read-only. Production backendda xavfsiz admin CRUD interface mavjud emas; RLS’ni zaiflashtirmasdan write access qo‘shilmadi.</p><div className="mt-4 max-h-[620px] overflow-y-auto pr-1"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{rewards.length ? rewards.map(item => <div key={item.id} className="rounded-2xl border p-4"><div className="flex items-center justify-between gap-3"><b>{item.title}</b><span className="font-bold text-amber-600">{item.price}</span></div><p className="mt-1 text-xs text-slate-500">Stock: {item.stock} · {item.category}</p></div>) : <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Reward yo‘q.</p>}</div></div></div>}
          {tab === 'orders' && (
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <h3 className="font-bold">Orders · {orders.length}</h3>
              <div className="mt-4 max-h-[520px] space-y-3 overflow-y-auto pr-1">
                {orders.length ? orders.map(item => (
                  <div key={item.id} className="flex flex-col gap-3 rounded-2xl border p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <b>{item.reward_title}</b>
                      <p className="text-sm text-slate-500">{item.price} coin · {item.status}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" disabled={busy} onClick={() => void updateOrder(item.id, 'approved')} className="min-h-10 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white">Approved</button>
                      <button type="button" disabled={busy} onClick={() => void updateOrder(item.id, 'ready')} className="min-h-10 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white">Ready</button>
                      <button type="button" disabled={busy} onClick={() => void updateOrder(item.id, 'delivered')} className="min-h-10 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">Delivered</button>
                      <button type="button" disabled={busy} onClick={() => void updateOrder(item.id, 'rejected')} className="min-h-10 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">Rejected</button>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-slate-500">Buyurtma yo‘q.</p>
                )}
              </div>
            </div>
          )}

          {tab === 'transactions' && (
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <h3 className="font-bold">Transactions · {transactions.length}</h3>
              <div className="mt-4 max-h-[520px] space-y-2 overflow-y-auto pr-1">
                {transactions.length ? transactions.map(item => (
                  <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3">
                    <div>
                      <b>{item.transaction_type}</b>
                      <p className="text-xs text-slate-500">{item.note || item.student_id}</p>
                    </div>
                    <span className={item.amount >= 0 ? 'font-black text-emerald-600' : 'font-black text-red-600'}>
                      {item.amount > 0 ? '+' : ''}{item.amount}
                    </span>
                  </div>
                )) : (
                  <p className="text-sm text-slate-500">Transaction yo‘q.</p>
                )}
              </div>
            </div>
          )}
          </section>\n          </div>\n        )}\n      </main>
    </div>
    {evidenceActivity && <div className="fixed inset-0 z-[220] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm motion-reduce:backdrop-blur-none" role="presentation" onClick={() => { if (!busy) { setEvidenceActivity(null); setEvidenceFile(null); setEvidenceNote(''); } }}><section onClick={event => event.stopPropagation()} className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="evidence-title"><div className="flex items-start justify-between gap-3"><div><h2 id="evidence-title" className="text-xl font-black">Evidence yuborish</h2><p className="mt-1 text-sm text-slate-500">{evidenceActivity.name} · +{evidenceActivity.coin_reward} coin</p></div><button type="button" disabled={busy} onClick={() => { setEvidenceActivity(null); setEvidenceFile(null); setEvidenceNote(''); }} className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-slate-100" aria-label="Yopish"><X /></button></div><div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center"><UploadCloud className="mx-auto h-9 w-9 text-slate-500" /><p className="mt-2 font-semibold">JPG, PNG, WEBP yoki PDF</p><p className="mt-1 text-xs text-slate-500">Maksimal hajm: 5 MB</p><input ref={fileInputRef} type="file" accept={ACCEPTED_EVIDENCE} className="sr-only" onChange={event => selectEvidence(event.target.files?.[0])} /><button type="button" disabled={busy} onClick={() => fileInputRef.current?.click()} className="mt-4 min-h-11 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">{evidenceFile ? 'Boshqa fayl tanlash' : 'Fayl tanlash'}</button>{evidenceFile && <div className="mt-4 rounded-2xl bg-white p-3 text-left shadow-sm"><div className="flex items-center gap-3">{evidencePreview ? <img src={evidencePreview} alt="Evidence preview" className="h-14 w-14 rounded-xl object-cover" /> : <div className="grid h-14 w-14 place-items-center rounded-xl bg-slate-100"><FileText /></div>}<div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{evidenceFile.name}</p><p className="text-xs text-slate-500">{(evidenceFile.size / 1024 / 1024).toFixed(2)} MB</p></div><button type="button" disabled={busy} onClick={() => { setEvidenceFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100" aria-label="Faylni olib tashlash"><X className="h-4 w-4" /></button></div></div>}</div><label className="mt-4 block text-sm font-semibold">Izoh (ixtiyoriy)<textarea value={evidenceNote} onChange={event => setEvidenceNote(event.target.value)} className="mt-1 min-h-20 w-full rounded-xl border border-slate-200 p-3 outline-none focus:ring-2 focus:ring-slate-200" placeholder="Qisqa izoh" /></label><button type="button" disabled={busy || !evidenceFile} onClick={() => void submitActivity(evidenceActivity, evidenceFile, evidenceNote)} className="mt-4 min-h-11 w-full rounded-xl bg-slate-900 p-3 font-semibold text-white transition active:scale-[.98] disabled:opacity-40">{busy ? 'Evidence yuklanmoqda…' : 'Evidence va so‘rovni yuborish'}</button></section></div>}
    {adjustingStudent && <div className="fixed inset-0 z-[220] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm motion-reduce:backdrop-blur-none" role="presentation" onClick={() => setAdjustingStudent(null)}><form ref={adjustDialogRef} onSubmit={adjustBalance} onClick={event => event.stopPropagation()} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="adjust-title"><div className="mb-5 flex items-center justify-between"><div><h2 id="adjust-title" className="text-xl font-black">Balance adjustment</h2><p className="text-sm text-slate-500">{adjustingStudent.full_name}</p></div><button type="button" onClick={() => setAdjustingStudent(null)} className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-slate-100" aria-label="Yopish"><X /></button></div><div className="space-y-3"><label className="block text-sm font-semibold">Amount<input required type="number" value={adjustAmount} onChange={e => setAdjustAmount(e.target.value)} placeholder="Masalan: 20 yoki -20" className="mt-1 w-full rounded-xl border p-3" /></label><label className="block text-sm font-semibold">Sabab<textarea required value={adjustReason} onChange={e => setAdjustReason(e.target.value)} placeholder="Adjustment sababi" className="mt-1 min-h-24 w-full rounded-xl border p-3" /></label></div><button disabled={busy} className="mt-5 min-h-11 w-full rounded-xl bg-slate-900 p-3 font-semibold text-white disabled:opacity-50">{busy ? 'Saqlanmoqda…' : 'Adjustment saqlash'}</button></form></div>}
    {viewerUrl || viewerLoading ? <div className="fixed inset-0 z-[240] grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm" role="presentation" onClick={() => { setViewerUrl(''); setViewerTitle(''); }}><section onClick={event => event.stopPropagation()} className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="evidence-viewer-title"><div className="flex items-center justify-between gap-3 border-b p-4"><h2 id="evidence-viewer-title" className="truncate font-bold">{viewerTitle}</h2><button type="button" onClick={() => { setViewerUrl(''); setViewerTitle(''); }} className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-slate-100" aria-label="Yopish"><X /></button></div><div className="min-h-0 flex-1 bg-slate-100 p-3">{viewerLoading ? <div className="grid h-full place-items-center text-sm text-slate-500">Evidence ochilmoqda…</div> : viewerUrl ? <iframe title={viewerTitle} src={viewerUrl} className="h-full w-full rounded-2xl bg-white" /> : <div className="grid h-full place-items-center text-sm text-slate-500">Evidence ochilmadi.</div>}</div></section></div> : null}
  </div>;
}