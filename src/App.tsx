import { useState, useEffect } from 'react';
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
import AdminPanel from './components/adminpanel';
import { Settings, Bell, X, Cake, Megaphone } from 'lucide-react';

export default function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [birthdays, setBirthdays] = useState<any[]>([]);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [stats, setStats] = useState<any[]>([]);

  // Ma'lumotlarni localStorage dan o'qish va kuzatish
  useEffect(() => {
    const loadData = () => {
      try {
        const savedAnnouncements = localStorage.getItem('announcements');
        if (savedAnnouncements) {
          const parsed = JSON.parse(savedAnnouncements);
          if (Array.isArray(parsed)) setAnnouncements(parsed);
        } else {
          setAnnouncements([]);
        }

        const savedBirthdays = localStorage.getItem('birthdays');
        if (savedBirthdays) {
          const parsedB = JSON.parse(savedBirthdays);
          if (Array.isArray(parsedB)) setBirthdays(parsedB);
        } else {
          setBirthdays([]);
        }

        // Maktab statistikasini olish[cite: 2]
        const savedStats = localStorage.getItem('schoolStats');
        if (savedStats) {
          const parsedStats = JSON.parse(savedStats);
          if (Array.isArray(parsedStats)) setStats(parsedStats);
        }
      } catch (e) {
        console.error(e);
      }
    };

    loadData();
    window.addEventListener('storage', loadData);
    window.addEventListener('schoolStatsUpdated', loadData);
    const interval = setInterval(loadData, 1000);

    return () => {
      window.removeEventListener('storage', loadData);
      window.removeEventListener('schoolStatsUpdated', loadData);
      clearInterval(interval);
    };
  }, []);

  const totalNotifications = announcements.length + birthdays.length;

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] selection:bg-[#0071e3] selection:text-white relative">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Academic />
        <Administration />
        <VideoLessons />
        <PresidentOffice />
        <Innovation />
        <Gallery />
        <Contact />
      </main>
      <Footer />

      {/* Admin panel tugmasi */}
      <button
        onClick={() => setIsAdminOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[#1d1d1f] px-5 py-3 text-white shadow-2xl transition-all hover:bg-black hover:scale-105 active:scale-95 cursor-pointer"
        title="Admin Panel"
      >
        <Settings className="h-5 w-5 animate-spin-slow" />
        <span className="text-sm font-semibold">Admin Panel</span>
      </button>

      {/* E'lonlar va Tadbirlar tugmasi */}
      {totalNotifications > 0 && (
        <button
          onClick={() => setShowNotifModal(true)}
          className="fixed bottom-6 left-6 z-40 flex items-center gap-2.5 rounded-full bg-blue-600 px-5 py-3 text-white shadow-xl transition-all hover:bg-blue-700 hover:scale-105 cursor-pointer animate-bounce"
        >
          <Bell className="h-5 w-5" />
          <span className="text-xs font-bold bg-white text-blue-600 px-2 py-0.5 rounded-full">
            {totalNotifications}
          </span>
          <span className="text-sm font-medium hidden sm:inline">E'lonlar va Tadbirlar</span>
        </button>
      )}

      {/* Bildirishnomalar oynasi (Modal) */}
      {showNotifModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-black/5">
            <div className="flex justify-between items-center mb-4 border-b border-black/5 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2 text-gray-900">
                <Megaphone className="h-5 w-5 text-blue-600" /> Yangi Bildirishnomalar va E'lonlar
              </h3>
              <button
                onClick={() => setShowNotifModal(false)}
                className="rounded-full bg-black/5 p-2 text-[#1d1d1f] transition-colors hover:bg-black/10 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {birthdays.map((b: any) => (
                <div key={`b-${b.id}`} className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-pink-100 text-pink-600 mt-0.5">
                    <Cake className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">Tug'ilgan kun! 🎂</h4>
                    <p className="text-xs text-gray-700 mt-1">
                      <strong>{b.name}</strong> ({b.class}) ning bugun tug'ilgan kuni! Tabriklaymiz!
                    </p>
                    <span className="inline-block mt-2 text-[10px] text-gray-400 font-medium">{b.date}</span>
                  </div>
                </div>
              ))}

              {announcements.map((item: any) => (
                <div key={`a-${item.id}`} className="p-4 rounded-2xl bg-[#f5f5f7] border border-black/5 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-blue-100 text-blue-600 mt-0.5">
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{item.content || item.message}</p>
                    <span className="inline-block mt-2 text-[10px] text-gray-400 font-medium">{item.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Admin Panel */}
      {isAdminOpen && (
        <AdminPanel onClose={() => setIsAdminOpen(false)} />
      )}
    </div>
  );
}