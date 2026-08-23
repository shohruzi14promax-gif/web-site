import { useEffect, useState } from 'react';
import { Image as ImageIcon, Calendar, ArrowUpRight } from 'lucide-react';
import { getSiteData, supabaseConfigured } from '../lib/supabase';

interface GalleryItem { id: number | string; title: string; date: string; description: string; image: string; }

const loadLocalGallery = (): GalleryItem[] => {
  try {
    const saved = localStorage.getItem('galleryList');
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Galereyani yuklashda xatolik:', error);
    return [];
  }
};

export default function Gallery() {
  const [galleryList, setGalleryList] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
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
    <section id="gallery" className="apple-section">
      <div className="apple-container">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="apple-eyebrow mb-3">Media</p>
            <h2 className="apple-heading text-3xl sm:text-4xl">Galereya</h2>
            <p className="mt-3 text-sm text-slate-500 sm:text-base">Maktab hayotidan foto lavhalar</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#0071e3]"><ImageIcon className="h-5 w-5" /></div>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Galereya yuklanmoqda">
            {Array.from({ length: 6 }).map((_, index) => <div key={index} className="aspect-[4/3] animate-pulse rounded-[24px] border border-slate-100 bg-white" />)}
          </div>
        ) : galleryList.length === 0 ? (
          <div className="rounded-[26px] border border-slate-200/80 bg-white p-12 text-center shadow-sm sm:p-16">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><ImageIcon className="h-6 w-6" /></div>
            <h3 className="mt-5 text-lg font-semibold text-[#0b1424]">Galereya hozircha bo‘sh</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Maktab tadbirlari va kundalik hayotidan rasmlar admin panel orqali qo‘shilganda shu yerda ko‘rinadi.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {galleryList.map(item => (
              <article key={item.id} className="group overflow-hidden rounded-[24px] border bg-white shadow-sm transition-all duration-300">
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  {item.image ? <img src={item.image} alt={item.title || 'Maktab galereyasi'} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500" /> : <div className="flex h-full items-center justify-center text-slate-300"><ImageIcon className="h-10 w-10" /></div>}
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-slate-950/55 to-transparent p-4 pt-12 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className="text-xs font-semibold text-white">{item.date}</span><ArrowUpRight className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold tracking-tight text-[#0b1424]">{item.title || 'Maktab tadbiri'}</h3>
                  {item.date && <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400"><Calendar className="h-3.5 w-3.5" /><span>{item.date}</span></div>}
                  {item.description && <p className="mt-3 text-sm leading-6 text-slate-500">{item.description}</p>}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
