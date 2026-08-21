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
    <section id="gallery" className="apple-section mx-auto max-w-7xl px-4 py-16">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-2xl bg-blue-50 p-3 text-[#0071e3]"><ImageIcon className="h-6 w-6" aria-hidden="true" /></div>
        <div><h2 className="text-2xl font-bold text-[#1d1d1f] dark:text-white">{t('gallery')}</h2><p className="text-sm text-gray-500 dark:text-slate-400">{t('life')}</p></div>
      </div>

      {loading ? (
        <div role="status" aria-label={t('loading')} aria-busy="true" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => <div key={index} className="aspect-video animate-pulse rounded-3xl border border-gray-100 bg-white/70 dark:border-white/10 dark:bg-slate-900/70" />)}
        </div>
      ) : error ? (
        <div role="alert" className="rounded-3xl border border-red-200 bg-red-50 py-12 text-center text-sm text-red-700 dark:border-red-500/20 dark:bg-red-950/30 dark:text-red-300">{t('error')}</div>
      ) : galleryList.length === 0 ? (
        <div className="rounded-3xl border border-gray-100 bg-white py-12 text-center shadow-sm dark:border-white/10 dark:bg-slate-900"><ImageIcon className="mx-auto mb-3 h-10 w-10 text-gray-300" aria-hidden="true" /><p className="text-sm text-gray-500 dark:text-slate-400">{t('empty')}</p></div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {galleryList.map((item) => (
            <article key={item.id} className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl dark:border-white/10 dark:bg-slate-900">
              <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-slate-800">
                {item.image ? <img src={item.image} alt={item.title || t('gallery')} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="flex h-full w-full items-center justify-center text-gray-400"><ImageIcon className="h-10 w-10" aria-hidden="true" /></div>}
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-[#1d1d1f] dark:text-white">{item.title || t('gallery')}</h3>
                {item.date && <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400"><Calendar className="h-3.5 w-3.5" aria-hidden="true" /><span>{item.date}</span></div>}
                {item.description && <p className="mt-3 text-sm leading-relaxed text-gray-500 dark:text-slate-400">{item.description}</p>}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
