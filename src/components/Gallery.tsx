import { useEffect, useState } from 'react';
import { Image as ImageIcon, Calendar } from 'lucide-react';

interface GalleryItem { id: number; title: string; date: string; description: string; image: string; }

const loadGalleryData = (): GalleryItem[] => {
  try {
    const saved = localStorage.getItem('galleryList');
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Galereyani yuklashda xatolik:', error);
    return [];
  }
};

export default function Gallery() {
  const [galleryList, setGalleryList] = useState<GalleryItem[]>([]);

  useEffect(() => {
    const load = () => setGalleryList(loadGalleryData());
    load();
    window.addEventListener('storage', load);
    window.addEventListener('admin_data_updated', load);
    return () => {
      window.removeEventListener('storage', load);
      window.removeEventListener('admin_data_updated', load);
    };
  }, []);

  return (
    <section id="gallery" className="apple-section py-16 px-4 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-50 text-[#0071e3] rounded-2xl"><ImageIcon className="h-6 w-6" /></div>
        <div><h2 className="text-2xl font-bold text-[#1d1d1f]">Galereya</h2><p className="text-sm text-gray-500">Maktab hayotidan foto lavhalar</p></div>
      </div>
      {galleryList.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 shadow-sm"><ImageIcon className="h-10 w-10 mx-auto mb-3 text-gray-300" /><p className="text-sm text-gray-500">Hozircha galereyaga rasmlar qo'shilmagan.</p></div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {galleryList.map((item) => (
            <div key={item.id} className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="relative aspect-video overflow-hidden bg-gray-100">
                {item.image ? <img src={item.image} alt={item.title} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon className="h-10 w-10" /></div>}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg text-[#1d1d1f]">{item.title}</h3>
                {item.date && <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400"><Calendar className="h-3.5 w-3.5" /><span>{item.date}</span></div>}
                {item.description && <p className="text-sm text-gray-500 mt-3 leading-relaxed">{item.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
