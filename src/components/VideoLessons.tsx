import { useEffect, useState } from 'react';
import { ExternalLink, Play, Sparkles, Video } from 'lucide-react';
import { getSiteData, supabaseConfigured } from '../lib/supabase';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useI18n } from '../i18n';

type VideoLesson = { id?: string | number; title?: string; url?: string; youtubeId?: string; thumbnail?: string; image?: string; subject?: string; duration?: string; teacher?: string; description?: string };

export default function VideoLessons() {
  const { t } = useI18n();
  const [videoLessons, setVideoLessons] = useState<VideoLesson[]>([]);
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();

  useEffect(() => {
    let alive = true;
    const loadVideos = async () => {
      try {
        let videos: VideoLesson[] = [];
        if (supabaseConfigured) {
          const cloud = await getSiteData<VideoLesson[]>('videoLessons', []);
          if (Array.isArray(cloud)) videos = cloud;
        }
        if (!videos.length) {
          const saved = localStorage.getItem('videoLessons');
          const parsed = saved ? JSON.parse(saved) : [];
          videos = Array.isArray(parsed) ? parsed as VideoLesson[] : [];
        }
        if (alive) setVideoLessons(videos.filter(video => video && (video.url || video.youtubeId || video.thumbnail || video.image)));
      } catch {
        if (alive) setVideoLessons([]);
      }
    };
    void loadVideos();
    const handleUpdate = () => void loadVideos();
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('admin_data_updated', handleUpdate);
    return () => { alive = false; window.removeEventListener('storage', handleUpdate); window.removeEventListener('admin_data_updated', handleUpdate); };
  }, []);

  return <section id="videolessons" className="apple-section relative overflow-hidden"><div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true"><div className="absolute left-[-180px] top-[10%] h-[450px] w-[450px] rounded-full bg-blue-300/15 blur-3xl animate-liquid" /><div className="absolute right-[-150px] bottom-[5%] h-[450px] w-[450px] rounded-full bg-purple-300/15 blur-3xl animate-liquid [animation-delay:3s]" /></div><div className="apple-container"><div className={`mx-auto mb-12 max-w-3xl text-center transition-[opacity,transform] duration-700 motion-reduce:transition-none ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/70 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#0071e3] shadow-sm backdrop-blur-md"><Sparkles className="h-3.5 w-3.5" />{t('videoLessons')}</div><h2 className="apple-heading">{t('learnViaVideo')}</h2><p className="apple-subheading mt-4">{t('videoLessonsDescription')}</p></div>
  {videoLessons.length === 0 ? <div ref={ref} className="mx-auto max-w-xl rounded-[32px] border border-slate-200 bg-white p-14 text-center shadow-xl"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#0071e3]"><Video className="h-8 w-8" /></div><p className="mt-5 text-sm font-medium text-[#6e6e73]">{t('noVideos')}</p></div> : <div ref={ref} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{videoLessons.map((video, index) => { const videoUrl = video.url || (video.youtubeId ? `https://www.youtube.com/embed/${encodeURIComponent(video.youtubeId)}` : ''); const isEmbed = /^https:\/\/(www\.)?(youtube\.com\/embed|youtube-nocookie\.com\/embed)\//i.test(videoUrl); return <article key={video.id ?? `${video.title}-${index}`} className={`group relative overflow-hidden rounded-[30px] border border-white/80 bg-white/65 shadow-lg backdrop-blur-2xl transition-[opacity,transform,box-shadow] duration-500 motion-reduce:transition-none hover:-translate-y-1 hover:shadow-2xl ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`} style={{ transitionDelay: `${index * 70}ms` }}><div className="relative aspect-video w-full overflow-hidden bg-slate-100">{isEmbed ? <iframe src={videoUrl} title={video.title || t('videoLesson')} className="absolute inset-0 h-full w-full border-0" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /> : video.thumbnail || video.image ? <img src={video.thumbnail || video.image} alt={video.title || t('videoLesson')} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="grid h-full place-items-center bg-gradient-to-br from-blue-50 via-white to-indigo-50"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#0071e3] shadow-xl"><Play className="ml-1 h-7 w-7 fill-current" /></div></div>}</div><div className="p-5"><div className="flex items-center justify-between gap-3"><span className="rounded-full bg-[#0071e3]/10 px-3 py-1 text-xs font-semibold text-[#0071e3]">{video.subject || t('general')}</span>{video.duration && <span className="text-[11px] text-[#6e6e73]">{video.duration}</span>}</div><h3 className="mt-3 text-base font-bold leading-snug text-[#1d1d1f]">{video.title || t('videoLesson')}</h3>{(video.teacher || video.description) && <p className="mt-2 text-xs leading-relaxed text-[#6e6e73]">{video.teacher ? <>{t('teacher')}: <span className="text-[#1d1d1f]">{video.teacher}</span></> : video.description}</p>}</div></article>; })}</div>}
  {videoLessons.length > 0 && <div className="mx-auto mt-10 flex items-center justify-center gap-2 text-center text-xs font-medium text-[#6e6e73]"><ExternalLink className="h-3.5 w-3.5" />{t('videoAdminHint')}</div>}
  </div></section>;
}
