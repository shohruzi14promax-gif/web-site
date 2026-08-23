import { useEffect, useState } from 'react';
import { Image as ImageIcon, Calendar } from 'lucide-react';
import { getSiteData, supabaseConfigured } from '../lib/supabase';
import { useI18n } from '../i18n';

interface GalleryItem { id: number | string; title: string; date: string; description: string; image: string; }

const loadLocalGallery = (): GalleryItem[] => {
  try {
    const saved = localStorage.getItem('galleryList');
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function Gallery() {
  const { t } = useI18n();
  const [galleryList, setGalleryList] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      if (supabaseConfigured) {
        const cloud = await getSiteData<GalleryItem[]>('galleryList', []);
        if (cloud.length > 0) {
          setGalleryList(cloud);
          localStorage.setItem('galleryList', JSON.stringify(cloud));
          return;
        }
      }
      setGalleryList(loadLocalGallery());
    } catch {
      setGalleryList([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    const handleUpdate = () => void load();
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('admin_data_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('admin_data_updated', handleUpdate);
    };
  }, []);

  return (
    <section id="gallery" className="apple-section mx-auto max-w-7xl px-4 py-16 !bg-gradient-to-b !from-[#fafafa] !to-[#f3f6f9] !text-slate-900">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#0071e3] shadow-sm"><ImageIcon className="h-6 w-6" aria-hidden="true" /></div>
        <p className="apple-eyebrow mb-2 !text-[#0071e3]">{t('life')}</p>
        <h2 className="text-3xl font-bold tracking-tight !text-[#0f172a] sm:text-4xl">{t('gallery')}</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 !text-slate-500">{t('officialSource')}</p>
      </div>

      {loading ? (
        <div role="status" aria-label={t('loading')} aria-busy="true" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => <div key={index} className="aspect-video animate-pulse rounded-3xl border border-slate-200 bg-white/80 shadow-sm dark:border-white/10 dark:bg-slate-900/70" />)}
        </div>
      ) : error ? (
        <div role="alert" className="rounded-3xl border border-red-200 bg-red-50 py-12 text-center text-sm text-red-700 dark:border-red-500/20 dark:bg-red-950/30 dark:text-red-300">{t('error')}</div>
      ) : galleryList.length === 0 ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[28px] border border-slate-200/80 !bg-white/90 px-6 py-14 text-center shadow-[0_18px_55px_rgba(15,23,42,.07)] backdrop-blur-xl">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><ImageIcon className="h-7 w-7" aria-hidden="true" /></div>
          <p className="text-base font-semibold !text-slate-700">{t('empty')}</p>
          <p className="mt-1 max-w-md text-sm !text-slate-400">{t('life')}</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {galleryList.map((item) => (
            <article key={item.id} className="group apple-card overflow-hidden !bg-white/95 !p-0">
              <div className="relative aspect-video overflow-hidden bg-slate-100">
                {item.image ? <img src={item.image} alt={item.title || t('gallery')} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="flex h-full w-full items-center justify-center text-slate-400"><ImageIcon className="h-10 w-10" aria-hidden="true" /></div>}
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold !text-[#1d1d1f]">{item.title || t('gallery')}</h3>
                {item.date && <div className="mt-2 flex items-center gap-1.5 text-xs !text-slate-400"><Calendar className="h-3.5 w-3.5" aria-hidden="true" /><span>{item.date}</span></div>}
                {item.description && <p className="mt-3 text-sm leading-relaxed !text-slate-500">{item.description}</p>}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
