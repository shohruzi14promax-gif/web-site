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
import { Settings, Bell, X, Cake, Megaphone, Coins } from 'lucide-react';
import { supabase, supabaseConfigured, getSiteData } from './lib/supabase';

type NotificationKey = 'announcements' | 'birthdays';

type NotificationItem = {
  id?: string | number;
  name?: string;
  class?: string;
  title?: string;
  content?: string;
  description?: string;
  message?: string;
  date?: string;
};

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
    <div className="relative min-h-screen text-slate-900 selection:bg-[#0071e3] selection:text-white" style={{ backgroundImage: `linear-gradient(to bottom, rgba(248,250,252,.65), rgba(248,250,252,.45)), url('/images/maktab-bg.JPG')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'scroll', backgroundRepeat: 'no-repeat' }}>
      <div className="pointer-events-none fixed inset-0 -z-10 select-none overflow-hidden" aria-hidden="true">
        <div className="absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-500/25 to-indigo-600/20 blur-3xl animate-liquid" />
        <div className="absolute right-[-10%] top-[35%] h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-purple-500/25 to-pink-500/20 blur-3xl animate-liquid [animation-delay:3s]" />
        <div className="absolute bottom-[-10%] left-[20%] h-[550px] w-[550px] rounded-full bg-gradient-to-r from-sky-400/20 to-teal-400/20 blur-3xl [animation-delay:6s]" />
      </div>
      <Navbar />
      <main className="relative z-10 space-y-8 pb-16">
        <Hero /><About /><Academic /><SchoolLife /><Administration /><VideoLessons /><PresidentOffice /><Innovation /><Gallery /><Contact />
      </main>
      <Footer />

      <button type="button" onClick={() => setIsSchoolCoinOpen(true)} className="fixed bottom-24 right-6 z-50 flex cursor-pointer items-center gap-2 rounded-full bg-amber-500 px-5 py-3 text-white shadow-2xl transition-[transform,background-color] duration-300 hover:scale-105 hover:bg-amber-600 active:scale-95" title="SchoolCoin" aria-label="SchoolCoin"><Coins className="h-5 w-5" /><span className="text-sm font-bold">SchoolCoin</span></button>
      <button type="button" onClick={() => setIsAdminOpen(true)} className="fixed bottom-6 right-6 z-50 flex cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-slate-900/90 px-5 py-3 text-white shadow-2xl backdrop-blur-xl transition-[transform,background-color] duration-300 hover:scale-105 hover:bg-black active:scale-95" title="Admin Panel" aria-label="Admin Panel"><Settings className="h-5 w-5" /><span className="text-sm font-semibold">Admin Panel</span></button>

      {totalNotifications > 0 && <button type="button" onClick={() => setShowNotifModal(true)} className="fixed bottom-6 left-6 z-40 flex cursor-pointer items-center gap-2.5 rounded-full bg-[#0071e3] px-5 py-3 text-white shadow-xl transition-[transform,background-color] duration-300 hover:scale-105 hover:bg-[#0077ed] active:scale-95" aria-label={`Yangi bildirishnomalar: ${totalNotifications}`}><Bell className="h-5 w-5" /><span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-[#0071e3]">{totalNotifications}</span><span className="hidden text-sm font-medium sm:inline">E'lonlar va Tadbirlar</span></button>}

      {showNotifModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md" onClick={() => setShowNotifModal(false)}><div className="relative w-full max-w-lg overflow-hidden rounded-[32px] bg-white/95 p-6 shadow-2xl" onClick={event => event.stopPropagation()}><div className="mb-4 flex items-center justify-between border-b pb-3"><h3 className="flex items-center gap-2 text-base font-bold"><Megaphone className="h-5 w-5 text-[#0071e3]" />Yangi bildirishnomalar</h3><button type="button" onClick={() => setShowNotifModal(false)} aria-label="Yopish"><X className="h-5 w-5" /></button></div><div className="max-h-[60vh] space-y-3 overflow-y-auto">{birthdays.map(item => <div key={`b-${item.id}`} className="flex gap-3 rounded-2xl border border-pink-100 bg-pink-50 p-4"><Cake className="h-5 w-5 text-pink-600" /><div><h4 className="text-sm font-semibold">Tug'ilgan kun! 🎂</h4><p className="mt-1 text-xs"><strong>{item.name}</strong> ({item.class}) ning bugun tug'ilgan kuni!</p></div></div>)}{announcements.map(item => <div key={`a-${item.id}`} className="flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4"><Megaphone className="h-5 w-5 text-[#0071e3]" /><div><h4 className="text-sm font-semibold">{item.title}</h4><p className="mt-1 text-xs">{item.content || item.description || item.message}</p><span className="text-[10px] text-slate-400">{item.date}</span></div></div>)}</div></div></div>}

      {isAdminOpen && <CloudAdminPanelPro onClose={() => setIsAdminOpen(false)} />}
      {isSchoolCoinOpen && <SchoolCoinSecure onClose={() => setIsSchoolCoinOpen(false)} />}
    </div>
  );
}
