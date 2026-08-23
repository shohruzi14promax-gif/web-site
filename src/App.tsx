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
import { Settings, Bell, X, Cake, Megaphone, Coins } from 'lucide-react';
import { supabase, supabaseConfigured, getSiteData } from './lib/supabase';

type NotificationKey = 'announcements' | 'birthdays';
type NotificationItem = Record<string, unknown> & { id?: string | number; name?: string; class?: string; title?: string; content?: string; description?: string; message?: string; date?: string };

const readArray = <T,>(key: string): T[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSchoolCoinOpen, setIsSchoolCoinOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<NotificationItem[]>([]);
  const [birthdays, setBirthdays] = useState<NotificationItem[]>([]);
  const [showNotifModal, setShowNotifModal] = useState(false);

  useEffect(() => {
    let alive = true;
    const syncNotificationKey = async (key: NotificationKey) => {
      if (!supabaseConfigured) return;
      const value = await getSiteData<NotificationItem[]>(key, []);
      if (!alive) return;
      localStorage.setItem(key, JSON.stringify(value));
      window.dispatchEvent(new Event('admin_data_updated'));
    };
    const loadNotifications = () => {
      setAnnouncements(readArray<NotificationItem>('announcements'));
      setBirthdays(readArray<NotificationItem>('birthdays'));
    };
    loadNotifications();
    if (supabaseConfigured) {
      void Promise.all([syncNotificationKey('announcements'), syncNotificationKey('birthdays')]).catch(() => undefined);
    }
    const channel = supabaseConfigured
      ? supabase.channel('site-notifications-live').on('postgres_changes', { event: '*', schema: 'public', table: 'site_data' }, payload => {
          const key = (payload.new as { key?: string } | null)?.key || (payload.old as { key?: string } | null)?.key;
          if (key === 'announcements' || key === 'birthdays') void syncNotificationKey(key);
        }).subscribe()
      : null;
    window.addEventListener('admin_data_updated', loadNotifications);
    window.addEventListener('storage', loadNotifications);
    return () => {
      alive = false;
      if (channel) void supabase.removeChannel(channel);
      window.removeEventListener('admin_data_updated', loadNotifications);
      window.removeEventListener('storage', loadNotifications);
    };
  }, []);

  const totalNotifications = announcements.length + birthdays.length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-[#0071e3]/15 selection:text-[#0b1424]">
      <Navbar />
      <main className="relative z-10 pb-10">
        <Hero />
        <About />
        <Academic />
        <SchoolLife />
        <Administration />
        <VideoLessons />
        <PresidentOffice />
        <Innovation />
        <Gallery />
        <Contact />
      </main>
      <Footer />

      <button type="button" onClick={() => setIsSchoolCoinOpen(true)} className="fixed bottom-24 right-4 z-40 flex min-h-11 items-center gap-2 rounded-full border border-[#b8892d]/20 bg-white px-4 py-3 text-[#7a5a18] shadow-lg shadow-slate-900/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-[.98] sm:right-6 sm:px-5" title="SchoolCoin" aria-label="SchoolCoin">
        <Coins className="h-5 w-5" />
        <span className="hidden text-sm font-semibold sm:inline">SchoolCoin</span>
      </button>

      <button type="button" onClick={() => setIsAdminOpen(true)} className="fixed bottom-5 right-4 z-50 flex min-h-11 items-center gap-2 rounded-full border border-slate-800/10 bg-[#0b1424] px-4 py-3 text-white shadow-xl shadow-slate-900/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#111d31] active:scale-[.98] sm:right-6 sm:px-5" title="Admin Panel" aria-label="Admin Panel">
        <Settings className="h-5 w-5" />
        <span className="hidden text-sm font-semibold sm:inline">Admin Panel</span>
      </button>

      {totalNotifications > 0 && (
        <button type="button" onClick={() => setShowNotifModal(true)} className="fixed bottom-5 left-4 z-40 flex min-h-11 items-center gap-2.5 rounded-full bg-[#0071e3] px-4 py-3 text-white shadow-lg shadow-blue-900/15 transition-all duration-200 hover:-translate-y-0.5 active:scale-[.98] sm:left-6 sm:px-5" aria-label={`Yangi bildirishnomalar: ${totalNotifications}`}>
          <Bell className="h-5 w-5" />
          <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-[#0071e3]">{totalNotifications}</span>
          <span className="hidden text-sm font-medium sm:inline">E'lonlar va Tadbirlar</span>
        </button>
      )}

      {showNotifModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1424]/35 p-4 backdrop-blur-sm motion-reduce:backdrop-blur-none" role="presentation" onClick={() => setShowNotifModal(false)}>
          <div className="relative w-full max-w-lg overflow-hidden rounded-[26px] border border-white/70 bg-white p-5 shadow-2xl sm:p-6" role="dialog" aria-modal="true" aria-labelledby="notification-title" onClick={event => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 id="notification-title" className="flex items-center gap-2 text-base font-bold"><Megaphone className="h-5 w-5 text-[#0071e3]" />Yangi bildirishnomalar</h3>
              <button type="button" onClick={() => setShowNotifModal(false)} aria-label="Yopish" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="max-h-[60vh] space-y-3 overflow-y-auto">
              {birthdays.map(b => <div key={`b-${b.id}`} className="flex gap-3 rounded-2xl border border-pink-100 bg-pink-50 p-4"><Cake className="h-5 w-5 shrink-0 text-pink-600" /><div><h4 className="text-sm font-semibold">Tug'ilgan kun! 🎂</h4><p className="mt-1 text-xs"><strong>{b.name}</strong> ({b.class}) ning bugun tug'ilgan kuni!</p></div></div>)}
              {announcements.map(a => <div key={`a-${a.id}`} className="flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4"><Megaphone className="h-5 w-5 shrink-0 text-[#0071e3]" /><div><h4 className="text-sm font-semibold">{a.title}</h4><p className="mt-1 text-xs">{a.content || a.description || a.message}</p><span className="text-[10px] text-slate-400">{a.date}</span></div></div>)}
            </div>
          </div>
        </div>
      )}

      {isAdminOpen && <CloudAdminPanelPro onClose={() => setIsAdminOpen(false)} />}
      {isSchoolCoinOpen && <SchoolCoinSecure onClose={() => setIsSchoolCoinOpen(false)} initialMode="student" />}
      {isSchoolCoinOpen && <SchoolCoinActivityQuickAdd />}
    </div>
  );
}
