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
import SchoolCoinPublic from './components/SchoolCoinPublic';
import SchoolCoinSecure from './components/SchoolCoinSecure';
import SchoolCoinActivityQuickAdd from './components/SchoolCoinActivityQuickAdd';
import News from './components/News';
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
    const openAdmin = () => setIsAdminOpen(true);
    const openSchoolCoin = () => setIsSchoolCoinOpen(true);
    window.addEventListener('admin_data_updated', loadNotifications);
    window.addEventListener('storage', loadNotifications);
    window.addEventListener('open-admin', openAdmin);
    window.addEventListener('open-schoolcoin', openSchoolCoin);
    return () => {
      alive = false;
      if (channel) void supabase.removeChannel(channel);
      window.removeEventListener('admin_data_updated', loadNotifications);
      window.removeEventListener('storage', loadNotifications);
      window.removeEventListener('open-admin', openAdmin);
      window.removeEventListener('open-schoolcoin', openSchoolCoin);
    };
  }, []);

  const totalNotifications = announcements.length + birthdays.length;

  return (
    <div className="site-shell min-h-screen relative text-slate-900 selection:bg-[#0071e3] selection:text-white" style={{ backgroundImage: `linear-gradient(to bottom, rgba(248,250,252,.72), rgba(248,250,252,.54)), url('/images/maktab-bg.JPG')`, backgroundSize: 'cover', backgroundPosition: 'center top', backgroundAttachment: 'scroll', backgroundRepeat: 'no-repeat' }}>
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none" aria-hidden="true">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-500/15 to-indigo-600/10 blur-3xl animate-liquid motion-reduce:animate-none" />
        <div className="absolute top-[35%] right-[-10%] h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-purple-500/10 to-pink-500/10 blur-3xl animate-liquid motion-reduce:animate-none [animation-delay:3s]" />
      </div>

      <Navbar />
      <main className="relative z-10 space-y-4 pb-16 sm:space-y-8">
        <Hero />
        <About />
        <Academic />
        <Administration />
        <Innovation />
        <SchoolCoinPublic />
        <SchoolLife />
        <PresidentOffice />
        <News />
        <VideoLessons />
        <div id="gallery" className="scroll-mt-24"><Gallery /></div>
        <Contact />
      </main>
      <Footer />

      <button type="button" onClick={() => setIsSchoolCoinOpen(true)} className="fixed bottom-24 right-4 z-40 flex items-center gap-2 rounded-full bg-amber-500 px-4 py-3 text-white shadow-2xl transition-transform duration-200 hover:scale-105 active:scale-95 sm:right-6 sm:px-5" title="SchoolCoin" aria-label="SchoolCoin">
        <Coins className="h-5 w-5" />
        <span className="hidden text-sm font-bold sm:inline">SchoolCoin</span>
      </button>

      <button type="button" onClick={() => setIsAdminOpen(true)} className="fixed bottom-5 right-4 z-50 flex items-center gap-2 rounded-full border border-white/20 bg-slate-900/90 px-4 py-3 text-white shadow-2xl backdrop-blur-xl transition-transform duration-200 hover:scale-105 active:scale-95 sm:right-6 sm:px-5" title="Admin Panel" aria-label="Admin Panel">
        <Settings className="h-5 w-5" />
        <span className="hidden text-sm font-semibold sm:inline">Admin Panel</span>
      </button>

      {totalNotifications > 0 && (
        <button type="button" onClick={() => setShowNotifModal(true)} className="fixed bottom-5 left-4 z-40 flex items-center gap-2.5 rounded-full bg-[#0071e3] px-4 py-3 text-white shadow-xl transition-transform duration-200 hover:scale-105 active:scale-95 sm:left-6 sm:px-5" aria-label={`Yangi bildirishnomalar: ${totalNotifications}`}>
          <Bell className="h-5 w-5" />
          <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-[#0071e3]">{totalNotifications}</span>
          <span className="hidden text-sm font-medium sm:inline">E'lonlar va Tadbirlar</span>
        </button>
      )}

      {showNotifModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md motion-reduce:backdrop-blur-none" role="presentation" onClick={() => setShowNotifModal(false)}>
          <div className="relative w-full max-w-lg overflow-hidden rounded-[28px] bg-white/95 p-5 shadow-2xl sm:p-6" role="dialog" aria-modal="true" aria-labelledby="notification-title" onClick={event => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between border-b pb-3">
              <h3 id="notification-title" className="flex items-center gap-2 text-base font-bold"><Megaphone className="h-5 w-5 text-[#0071e3]" />Yangi bildirishnomalar</h3>
              <button type="button" onClick={() => setShowNotifModal(false)} aria-label="Yopish" className="rounded-full p-2 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="max-h-[60vh] space-y-3 overflow-y-auto">
              {birthdays.map(b => <div key={`b-${b.id}`} className="flex gap-3 rounded-2xl border border-pink-100 bg-pink-50 p-4"><Cake className="h-5 w-5 text-pink-600" /><div><h4 className="text-sm font-semibold">Tug'ilgan kun! 🎂</h4><p className="mt-1 text-xs"><strong>{b.name}</strong> ({b.class}) ning bugun tug'ilgan kuni!</p></div></div>)}
              {announcements.map(a => <div key={`a-${a.id}`} className="flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4"><Megaphone className="h-5 w-5 text-[#0071e3]" /><div><h4 className="text-sm font-semibold">{a.title}</h4><p className="mt-1 text-xs">{a.content || a.description || a.message}</p><span className="text-[10px] text-slate-400">{a.date}</span></div></div>)}
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
