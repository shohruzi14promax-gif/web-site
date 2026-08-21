import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Academic from './components/Academic';
import Administration from './components/Administration';
import VideoLessons from './components/VideoLessons';
import PresidentOffice from './components/PresidentOffice';
import Innovation from './components/Innovation';
import Gallery from './components/Gallery';
import Contact from './components/Contact';
import Footer from './components/Footer';
import CloudAdminPanelPro from './components/CloudAdminPanelPro';
import SchoolLife from './components/SchoolLife';
import SchoolCoinSecure from './components/SchoolCoinSecure';
import SchoolCoinActivityQuickAdd from './components/SchoolCoinActivityQuickAdd';
import News from './components/News';
import Events from './components/Events';
import { Settings, Bell, X, Cake, Megaphone, Coins } from 'lucide-react';
import { supabase, supabaseConfigured, getSiteData } from './lib/supabase';
import { useI18n } from './i18n';

type NotificationKey = 'announcements' | 'birthdays';
type NotificationItem = Record<string, unknown> & { id?: string | number; name?: string; class?: string; title?: string; content?: string; description?: string; message?: string; date?: string };

const readArray = <T,>(key: string): T[] => { try { const parsed = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(parsed) ? parsed : []; } catch { return []; } };

export default function App() {
  const { t } = useI18n();
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSchoolCoinOpen, setIsSchoolCoinOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<NotificationItem[]>([]);
  const [birthdays, setBirthdays] = useState<NotificationItem[]>([]);
  const [showNotifModal, setShowNotifModal] = useState(false);

  useEffect(() => {
    let alive = true;
    const sync = async (key: NotificationKey) => { if (!supabaseConfigured) return; const value = await getSiteData<NotificationItem[]>(key, []); if (!alive) return; localStorage.setItem(key, JSON.stringify(value)); window.dispatchEvent(new Event('admin_data_updated')); };
    const load = () => { setAnnouncements(readArray<NotificationItem>('announcements')); setBirthdays(readArray<NotificationItem>('birthdays')); };
    load();
    if (supabaseConfigured) void Promise.all([sync('announcements'), sync('birthdays')]).catch(() => undefined);
    const channel = supabaseConfigured ? supabase.channel('site-notifications-live').on('postgres_changes', { event: '*', schema: 'public', table: 'site_data' }, payload => { const key = (payload.new as { key?: string } | null)?.key || (payload.old as { key?: string } | null)?.key; if (key === 'announcements' || key === 'birthdays') void sync(key); }).subscribe() : null;
    const openAdmin = () => setIsAdminOpen(true); const openCoin = () => setIsSchoolCoinOpen(true);
    window.addEventListener('admin_data_updated', load); window.addEventListener('storage', load); window.addEventListener('open-admin', openAdmin); window.addEventListener('open-schoolcoin', openCoin);
    return () => { alive = false; if (channel) void supabase.removeChannel(channel); window.removeEventListener('admin_data_updated', load); window.removeEventListener('storage', load); window.removeEventListener('open-admin', openAdmin); window.removeEventListener('open-schoolcoin', openCoin); };
  }, []);

  const total = announcements.length + birthdays.length;
  return (
    <div className="site-shell relative min-h-screen text-slate-900 selection:bg-[#0071e3] selection:text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 select-none overflow-hidden" aria-hidden="true"><div className="animate-liquid absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-500/15 to-indigo-600/10 blur-3xl motion-reduce:animate-none" /><div className="animate-liquid absolute right-[-10%] top-[35%] h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-purple-500/10 to-pink-500/10 blur-3xl motion-reduce:animate-none" /></div>
      <Navbar />
      <main className="relative z-10 pb-16">
        <Hero />
        <About />
        <Academic />
        <SchoolLife />
        <PresidentOffice />
        <Administration />
        <section id="media" className="scroll-mt-24 media-section">
          <News />
          <Events />
          <VideoLessons />
          <Gallery />
        </section>
        <Innovation />
        <Contact />
      </main>

      <Footer />

      <button type="button" onClick={() => setIsSchoolCoinOpen(true)} className="fixed bottom-24 right-4 z-40 flex items-center gap-2 rounded-full bg-amber-500 px-4 py-3 text-white shadow-2xl transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none sm:right-6" title={t('schoolCoin')} aria-label={t('schoolCoin')}><Coins className="h-5 w-5" /><span className="hidden text-sm font-bold sm:inline">{t('schoolCoin')}</span></button>
      <button type="button" onClick={() => setIsAdminOpen(true)} className="fixed bottom-5 right-4 z-50 flex items-center gap-2 rounded-full border border-white/20 bg-slate-900/90 px-4 py-3 text-white shadow-2xl transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none sm:right-6" title={t('admin')} aria-label={t('admin')}><Settings className="h-5 w-5" /><span className="hidden text-sm font-semibold sm:inline">{t('admin')}</span></button>

      {total > 0 && <button type="button" onClick={() => setShowNotifModal(true)} className="fixed bottom-5 left-4 z-40 flex items-center gap-2.5 rounded-full bg-[#0071e3] px-4 py-3 text-white shadow-xl transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none sm:left-6" aria-label={`${t('notifications')}: ${total}`}><Bell className="h-5 w-5" /><span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-[#0071e3]">{total}</span><span className="hidden text-sm font-medium sm:inline">{t('announcements')}</span></button>}

      {showNotifModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md" role="presentation" onClick={() => setShowNotifModal(false)}><div className="relative w-full max-w-lg overflow-hidden rounded-[28px] bg-white p-5 shadow-2xl dark:bg-slate-900 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="notification-title" onClick={e => e.stopPropagation()}><div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3 dark:border-white/10"><h3 id="notification-title" className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white"><Megaphone className="h-5 w-5 text-[#0071e3]" />{t('notifications')}</h3><button type="button" onClick={() => setShowNotifModal(false)} aria-label={t('close')} className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-white/10"><X className="h-5 w-5" /></button></div><div className="max-h-[60vh] space-y-3 overflow-y-auto">{birthdays.map(b => <div key={`b-${b.id}`} className="flex gap-3 rounded-2xl border border-pink-100 bg-pink-50 p-4 dark:border-pink-500/20 dark:bg-pink-950/20"><Cake className="h-5 w-5 text-pink-600" /><div><h4 className="text-sm font-semibold text-slate-900 dark:text-white">{t('birthdays')}</h4><p className="mt-1 text-xs dark:text-slate-300"><strong>{b.name}</strong> ({b.class})</p></div></div>)}{announcements.map(a => <div key={`a-${a.id}`} className="flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-500/20 dark:bg-blue-950/20"><Megaphone className="h-5 w-5 text-[#0071e3]" /><div><h4 className="text-sm font-semibold text-slate-900 dark:text-white">{a.title}</h4><p className="mt-1 text-xs dark:text-slate-300">{a.content || a.description || a.message}</p><span className="text-[10px] text-slate-400">{a.date}</span></div></div>)}</div></div></div>}

      {isAdminOpen && <CloudAdminPanelPro onClose={() => setIsAdminOpen(false)} />}
      {isSchoolCoinOpen && <SchoolCoinSecure onClose={() => setIsSchoolCoinOpen(false)} initialMode="student" />}
      {isSchoolCoinOpen && <SchoolCoinActivityQuickAdd />}
    </div>
  );
}
