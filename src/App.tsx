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
import CloudAdminPanel from './components/CloudAdminPanel';
import { Settings, Bell, X, Cake, Megaphone } from 'lucide-react';
import { supabase, getSiteData } from './lib/supabase';

const siteKeys = ['announcements','birthdays','teachers','projects','galleryList','videoLessons','gpaList'] as const;
const readArray = <T,>(key: string): T[] => { try { const parsed = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(parsed) ? parsed : []; } catch { return []; } };

export default function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [birthdays, setBirthdays] = useState<any[]>([]);
  const [showNotifModal, setShowNotifModal] = useState(false);

  useEffect(() => {
    let alive = true;
    const syncCloud = async () => {
      try {
        await Promise.all(siteKeys.map(async (key) => {
          const value = await getSiteData(key, []);
          if (!alive) return;
          localStorage.setItem(key, JSON.stringify(value));
        }));
        if (alive) window.dispatchEvent(new Event('admin_data_updated'));
      } catch (error) { console.error('Cloud sync error:', error); }
    };
    syncCloud();
    const channel = supabase.channel('site-data-live').on('postgres_changes', { event: '*', schema: 'public', table: 'site_data' }, () => syncCloud()).subscribe();
    const loadLocal = () => { setAnnouncements(readArray('announcements')); setBirthdays(readArray('birthdays')); };
    loadLocal();
    window.addEventListener('admin_data_updated', loadLocal);
    window.addEventListener('storage', loadLocal);
    return () => { alive = false; supabase.removeChannel(channel); window.removeEventListener('admin_data_updated', loadLocal); window.removeEventListener('storage', loadLocal); };
  }, []);

  const totalNotifications = announcements.length + birthdays.length;
  return <div className="min-h-screen text-slate-900 selection:bg-[#0071e3] selection:text-white relative" style={{backgroundImage:`linear-gradient(to bottom, rgba(248,250,252,.65), rgba(248,250,252,.45)), url('/images/maktab-bg.JPG')`,backgroundSize:'cover',backgroundPosition:'center',backgroundAttachment:'fixed',backgroundRepeat:'no-repeat'}}>
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none"><div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-blue-500/25 to-indigo-600/20 blur-3xl animate-liquid"/><div className="absolute top-[35%] right-[-10%] w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-purple-500/25 to-pink-500/20 blur-3xl animate-liquid [animation-delay:3s]"/><div className="absolute bottom-[-10%] left-[20%] w-[550px] h-[550px] rounded-full bg-gradient-to-r from-sky-400/20 to-teal-400/20 blur-3xl animate-liquid [animation-delay:6s]"/></div>
    <Navbar/><main className="relative z-10 space-y-8 pb-16"><Hero/><About/><Academic/><Administration/><VideoLessons/><PresidentOffice/><Innovation/><Gallery/><Contact/></main><Footer/>
    <button onClick={()=>setIsAdminOpen(true)} className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-slate-900/90 backdrop-blur-xl border border-white/20 px-5 py-3 text-white shadow-2xl transition-all duration-300 hover:bg-black hover:scale-105 active:scale-95 cursor-pointer" title="Admin Panel"><Settings className="h-5 w-5"/><span className="text-sm font-semibold">Admin Panel</span></button>
    {totalNotifications>0&&<button onClick={()=>setShowNotifModal(true)} className="fixed bottom-6 left-6 z-40 flex items-center gap-2.5 rounded-full bg-[#0071e3] px-5 py-3 text-white shadow-xl transition-all duration-300 hover:bg-[#0077ed] hover:scale-105 active:scale-95 cursor-pointer"><Bell className="h-5 w-5"/><span className="text-xs font-bold bg-white text-[#0071e3] px-2 py-0.5 rounded-full">{totalNotifications}</span><span className="text-sm font-medium hidden sm:inline">E'lonlar va Tadbirlar</span></button>}
    {showNotifModal&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4" onClick={()=>setShowNotifModal(false)}><div className="relative w-full max-w-lg overflow-hidden rounded-[32px] bg-white/95 p-6 shadow-2xl" onClick={e=>e.stopPropagation()}><div className="flex justify-between items-center mb-4 border-b pb-3"><h3 className="text-base font-bold flex items-center gap-2"><Megaphone className="h-5 w-5 text-[#0071e3]"/>Yangi bildirishnomalar</h3><button onClick={()=>setShowNotifModal(false)}><X className="h-5 w-5"/></button></div><div className="space-y-3 max-h-[60vh] overflow-y-auto">{birthdays.map(b=><div key={`b-${b.id}`} className="p-4 rounded-2xl bg-pink-50 border border-pink-100 flex gap-3"><Cake className="h-5 w-5 text-pink-600"/><div><h4 className="font-semibold text-sm">Tug'ilgan kun! 🎂</h4><p className="text-xs mt-1"><strong>{b.name}</strong> ({b.class}) ning bugun tug'ilgan kuni!</p></div></div>)}{announcements.map(a=><div key={`a-${a.id}`} className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex gap-3"><Megaphone className="h-5 w-5 text-[#0071e3]"/><div><h4 className="font-semibold text-sm">{a.title}</h4><p className="text-xs mt-1">{a.content||a.message}</p><span className="text-[10px] text-slate-400">{a.date}</span></div></div>)}</div></div></div>}
    {isAdminOpen&&<CloudAdminPanel onClose={()=>setIsAdminOpen(false)}/>} 
  </div>;
}
