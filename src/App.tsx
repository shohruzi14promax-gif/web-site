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
  const [, setStats] = useState<any[]>([]);

  // Ma'lumotlarni localStorage dan o'qish va kuzatish
  useEffect(() => {
    const loadData = () => {
      try {
        const savedAnnouncements = localStorage.getItem('announcements');

        if (savedAnnouncements) {
          const parsed = JSON.parse(savedAnnouncements);

          if (Array.isArray(parsed)) {
            setAnnouncements(parsed);
          }
        } else {
          setAnnouncements([]);
        }

        const savedBirthdays = localStorage.getItem('birthdays');

        if (savedBirthdays) {
          const parsedB = JSON.parse(savedBirthdays);

          if (Array.isArray(parsedB)) {
            setBirthdays(parsedB);
          }
        } else {
          setBirthdays([]);
        }

        // Maktab statistikasini olish
        const savedStats = localStorage.getItem('schoolStats');

        if (savedStats) {
          const parsedStats = JSON.parse(savedStats);

          if (Array.isArray(parsedStats)) {
            setStats(parsedStats);
          }
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

  const totalNotifications =
    announcements.length + birthdays.length;

  return (
    <div
      className="min-h-screen text-slate-900 selection:bg-[#0071e3] selection:text-white relative"
      style={{
        backgroundImage:
          `linear-gradient(
            to bottom,
            rgba(248, 250, 252, 0.65),
            rgba(248, 250, 252, 0.45)
          ),
          url('/images/maktab-bg.JPG')`,

        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat'
      }}
    >

      {/* Dynamic Liquid Glow Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none">

        <div
          className="
            absolute
            top-[-10%]
            left-[-10%]
            w-[500px]
            h-[500px]
            rounded-full
            bg-gradient-to-br
            from-blue-500/25
            to-indigo-600/20
            blur-3xl
            animate-liquid
          "
        />

        <div
          className="
            absolute
            top-[35%]
            right-[-10%]
            w-[450px]
            h-[450px]
            rounded-full
            bg-gradient-to-tr
            from-purple-500/25
            to-pink-500/20
            blur-3xl
            animate-liquid
            [animation-delay:3s]
          "
        />

        <div
          className="
            absolute
            bottom-[-10%]
            left-[20%]
            w-[550px]
            h-[550px]
            rounded-full
            bg-gradient-to-r
            from-sky-400/20
            to-teal-400/20
            blur-3xl
            animate-liquid
            [animation-delay:6s]
          "
        />

      </div>

      <Navbar />

      <main className="relative z-10 space-y-8 pb-16">
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
        className="
          fixed
          bottom-6
          right-6
          z-50
          flex
          items-center
          gap-2
          rounded-full
          bg-slate-900/90
          backdrop-blur-xl
          border
          border-white/20
          px-5
          py-3
          text-white
          shadow-2xl
          transition-all
          duration-300
          hover:bg-black
          hover:scale-105
          active:scale-95
          cursor-pointer
        "
        title="Admin Panel"
      >
        <Settings className="h-5 w-5 animate-spin-slow" />

        <span className="text-sm font-semibold">
          Admin Panel
        </span>
      </button>

      {/* E'lonlar va Tadbirlar tugmasi */}
      {totalNotifications > 0 && (
        <button
          onClick={() => setShowNotifModal(true)}
          className="
            fixed
            bottom-6
            left-6
            z-40
            flex
            items-center
            gap-2.5
            rounded-full
            bg-[#0071e3]
            backdrop-blur-md
            px-5
            py-3
            text-white
            shadow-xl
            shadow-blue-500/30
            transition-all
            duration-300
            hover:bg-[#0077ed]
            hover:scale-105
            active:scale-95
            cursor-pointer
            animate-bounce
          "
        >
          <Bell className="h-5 w-5" />

          <span
            className="
              text-xs
              font-bold
              bg-white
              text-[#0071e3]
              px-2
              py-0.5
              rounded-full
              shadow-sm
            "
          >
            {totalNotifications}
          </span>

          <span className="text-sm font-medium hidden sm:inline">
            E'lonlar va Tadbirlar
          </span>
        </button>
      )}

      {/* Bildirishnomalar oynasi */}
      {showNotifModal && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-slate-900/40
            backdrop-blur-md
            p-4
            animate-fade-in
          "
        >
          <div
            className="
              relative
              w-full
              max-w-lg
              overflow-hidden
              rounded-[32px]
              bg-white/90
              backdrop-blur-2xl
              p-6
              shadow-2xl
              border
              border-white/80
              animate-scale-in
            "
          >

            <div
              className="
                flex
                justify-between
                items-center
                mb-4
                border-b
                border-slate-200/60
                pb-3
              "
            >
              <h3
                className="
                  text-base
                  font-bold
                  flex
                  items-center
                  gap-2
                  text-slate-900
                "
              >
                <Megaphone className="h-5 w-5 text-[#0071e3]" />

                Yangi Bildirishnomalar va E'lonlar
              </h3>

              <button
                onClick={() => setShowNotifModal(false)}
                className="
                  rounded-full
                  bg-slate-100
                  p-2
                  text-slate-700
                  transition-colors
                  hover:bg-slate-200
                  cursor-pointer
                  active:scale-95
                "
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div
              className="
                space-y-3
                max-h-[60vh]
                overflow-y-auto
                pr-1
              "
            >

              {/* Tug'ilgan kunlar */}
              {birthdays.map((b: any) => (
                <div
                  key={`b-${b.id}`}
                  className="
                    p-4
                    rounded-2xl
                    bg-pink-50/70
                    border
                    border-pink-100/80
                    flex
                    items-start
                    gap-3
                    transition-all
                    hover:bg-pink-50
                  "
                >
                  <div
                    className="
                      p-2.5
                      rounded-xl
                      bg-pink-100
                      text-pink-600
                      mt-0.5
                      shadow-sm
                    "
                  >
                    <Cake className="h-5 w-5" />
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">
                      Tug'ilgan kun! 🎂
                    </h4>

                    <p className="text-xs text-slate-700 mt-1">
                      <strong>{b.name}</strong> ({b.class}) ning
                      bugun tug'ilgan kuni! Tabriklaymiz!
                    </p>

                    <span
                      className="
                        inline-block
                        mt-2
                        text-[10px]
                        text-slate-400
                        font-medium
                      "
                    >
                      {b.date}
                    </span>
                  </div>
                </div>
              ))}

              {/* E'lonlar */}
              {announcements.map((item: any) => (
                <div
                  key={`a-${item.id}`}
                  className="
                    p-4
                    rounded-2xl
                    bg-blue-50/50
                    border
                    border-blue-100/80
                    flex
                    items-start
                    gap-3
                    transition-all
                    hover:bg-blue-50/80
                  "
                >
                  <div
                    className="
                      p-2.5
                      rounded-xl
                      bg-blue-100
                      text-[#0071e3]
                      mt-0.5
                      shadow-sm
                    "
                  >
                    <Megaphone className="h-5 w-5" />
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">
                      {item.title}
                    </h4>

                    <p
                      className="
                        text-xs
                        text-slate-600
                        mt-1
                        leading-relaxed
                      "
                    >
                      {item.content || item.message}
                    </p>

                    <span
                      className="
                        inline-block
                        mt-2
                        text-[10px]
                        text-slate-400
                        font-medium
                      "
                    >
                      {item.date}
                    </span>
                  </div>
                </div>
              ))}

            </div>
          </div>
        </div>
      )}

      {/* Admin Panel */}
      {isAdminOpen && (
        <AdminPanel
          onClose={() => setIsAdminOpen(false)}
        />
      )}

    </div>
  );
}