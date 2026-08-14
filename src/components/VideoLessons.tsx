import { useEffect, useState } from 'react';
import { Play, Video, Sparkles, ExternalLink } from 'lucide-react';
import { videoLessons as defaultVideos } from '../lib/data';
import { getSiteData, supabaseConfigured } from '../lib/supabase';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export default function VideoLessons() {
  const [videoLessons, setVideoLessons] = useState<any[]>([]);
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();

  const loadVideos = async () => {
    try {
      if (supabaseConfigured) {
        const cloud = await getSiteData<any[]>('videoLessons', []);
        if (cloud.length > 0) {
          setVideoLessons(cloud);
          localStorage.setItem('videoLessons', JSON.stringify(cloud));
          return;
        }
      }

      try {
        const saved = localStorage.getItem('videoLessons');
        const parsed = saved ? JSON.parse(saved) : null;
        setVideoLessons(Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultVideos);
      } catch {
        setVideoLessons(defaultVideos);
      }
    } catch (error) {
      console.error('Video loading error:', error);
      setVideoLessons(defaultVideos);
    }
  };

  useEffect(() => {
    void loadVideos();
    const handleUpdate = () => void loadVideos();
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('admin_data_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('admin_data_updated', handleUpdate);
    };
  }, []);

  return (
    <section id="videolessons" className="apple-section relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute left-[-180px] top-[10%] h-[450px] w-[450px] rounded-full bg-blue-300/15 blur-3xl animate-liquid" />
        <div className="absolute right-[-150px] bottom-[5%] h-[450px] w-[450px] rounded-full bg-purple-300/15 blur-3xl animate-liquid" style={{ animationDelay: '3s' }} />
      </div>
      <div className="apple-container">
        <div className={`mx-auto mb-12 max-w-3xl text-center transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/70 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#0071e3] shadow-sm backdrop-blur-md"><Sparkles className="h-3.5 w-3.5" />Video darslar</div>
          <h2 className="apple-heading">Bilimni <span className="text-gradient-blue">video orqali</span><br className="hidden sm:block" /> o'rganing</h2>
          <p className="apple-subheading mt-4">Admin panel orqali boshqariladigan ochiq darslar va ta'limiy videolar</p>
        </div>

        {videoLessons.length === 0 ? (
          <div ref={ref} className={`mx-auto max-w-xl rounded-[32px] border border-white/70 bg-white/60 p-14 text-center shadow-xl shadow-slate-900/5 backdrop-blur-2xl transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#0071e3]"><Video className="h-8 w-8" /></div>
            <p className="mt-5 text-sm font-medium text-[#6e6e73]">Hozircha video darslar qo'shilmagan.<br />Admin paneldan qo'shishingiz mumkin.</p>
          </div>
        ) : (
          <div ref={ref} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videoLessons.map((v: any, index: number) => {
              const videoUrl = v.url || (v.youtubeId ? `https://www.youtube.com/embed/${v.youtubeId}` : '');
              const isEmbed = videoUrl.includes('youtube.com/embed/') || videoUrl.includes('youtube-nocookie.com/embed/');
              return (
                <article key={v.id || v.title || index} className={`group relative overflow-hidden rounded-[30px] border border-white/80 bg-white/65 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur-2xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:shadow-[0_25px_60px_rgba(15,23,42,0.14)] ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-[0.96]'}`} style={{ transitionDelay: `${index * 100}ms` }}>
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                    {isEmbed ? <iframe src={videoUrl} title={v.title || 'Video dars'} className="absolute inset-0 h-full w-full border-0" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /> : v.thumbnail || v.image ? <img src={v.thumbnail || v.image} alt={v.title || 'Video dars'} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#0071e3] shadow-xl"><Play className="ml-1 h-7 w-7 fill-current" /></div></div>}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3"><span className="inline-flex rounded-full bg-[#0071e3]/10 px-3 py-1 text-xs font-semibold text-[#0071e3]">{v.subject || 'Umumiy'}</span>{v.duration && <span className="text-[11px] font-medium text-[#6e6e73]">{v.duration}</span>}</div>
                    <h3 className="mt-3 text-base font-bold leading-snug text-[#1d1d1f] transition-colors duration-300 group-hover:text-[#0071e3]">{v.title}</h3>
                    {(v.teacher || v.description) && <p className="mt-2 text-xs leading-relaxed text-[#6e6e73]">{v.teacher ? <>O'qituvchi: <span className="text-[#1d1d1f]">{v.teacher}</span></> : v.description}</p>}
                  </div>
                  <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-[#0071e3] to-cyan-400 transition-all duration-500 group-hover:w-full" />
                </article>
              );
            })}
          </div>
        )}
        {videoLessons.length > 0 && <div className="mx-auto mt-10 flex max-w-2xl items-center justify-center gap-2 text-center text-xs font-medium text-[#6e6e73]"><ExternalLink className="h-3.5 w-3.5" />Barcha video darslar admin panel orqali boshqariladi</div>}
      </div>
    </section>
  );
}
