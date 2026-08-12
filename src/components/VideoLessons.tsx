import { useState, useEffect } from 'react';
import { Play, Video } from 'lucide-react';
import { videoLessons as defaultVideos } from '../lib/data';

export default function VideoLessons() {
  const [videoLessons, setVideoLessons] = useState<any[]>([]);

  useEffect(() => {
    const loadVideos = () => {
      try {
        const saved = localStorage.getItem('videoLessons');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setVideoLessons(parsed);
            return;
          }
        }
        setVideoLessons(defaultVideos);
      } catch (e) {
        setVideoLessons(defaultVideos);
      }
    };

    loadVideos();
    window.addEventListener('storage', loadVideos);
    const interval = setInterval(loadVideos, 1000);

    return () => {
      window.removeEventListener('storage', loadVideos);
      clearInterval(interval);
    };
  }, []);

  return (
    /* MUHIM: Mana shu yerga id qo'shildi */
    <section id="videolessons" className="py-16 px-4 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-50 text-[#0071e3] rounded-2xl">
          <Video className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#1d1d1f]">Video Darslar</h2>
          <p className="text-sm text-gray-500">Admin paneldan yuklangan ochiq darslar va videolar</p>
        </div>
      </div>

      {videoLessons.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">Hozircha video darslar qo'shilmagan. Admin paneldan qo'shishingiz mumkin.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {videoLessons.map((v) => {
            const videoUrl = v.url || (v.youtubeId ? `https://www.youtube.com/embed/${v.youtubeId}` : '');

            return (
              <div key={v.id || v.title} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col justify-between">
                <div>
                  {videoUrl && videoUrl.includes('embed') ? (
                    <div className="relative aspect-video w-full">
                      <iframe src={videoUrl} title={v.title} className="absolute inset-0 w-full h-full border-0" allowFullScreen></iframe>
                    </div>
                  ) : v.thumbnail ? (
                    <div className="relative aspect-video w-full bg-gray-100 overflow-hidden">
                      <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="aspect-video w-full bg-gray-100 flex items-center justify-center text-gray-400">
                      <Play className="h-10 w-10" />
                    </div>
                  )}
                  <div className="p-5">
                    <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-[#0071e3] rounded-full">{v.subject || "Umumiy"}</span>
                    <h3 className="font-bold text-[#1d1d1f] text-base mt-3">{v.title}</h3>
                    {v.teacher && <p className="text-xs text-gray-500 mt-1">O'qituvchi: {v.teacher}</p>}
                  </div>
                </div>
                {v.duration && (
                  <div className="px-5 pb-5 text-xs text-gray-400 flex items-center gap-1">
                    <span>Davomiyligi: {v.duration}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}