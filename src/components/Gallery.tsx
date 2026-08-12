import { useState, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';

export default function Gallery() {
  const [galleryList, setGalleryList] = useState<any[]>([]);

  useEffect(() => {
    const loadGallery = () => {
      // Admin paneldan kelishi mumkin bo'lgan localStorage kalitlari
      const saved = 
        localStorage.getItem('galleryList') || 
        localStorage.getItem('gallery') || 
        localStorage.getItem('admin_media');

      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setGalleryList(
              parsed.map((g: any, idx: number) => ({
                id: g.id || idx,
                title: g.title || g.name || "Maktab hayoti",
                category: g.category || g.subject || "Lavha",
                image: g.image || g.url || g.avatar || ""
              }))
            );
            return;
          }
        } catch (e) {}
      }
      
      // Agar ma'lumot bo'lmasa bo'sh massiv qoldiramiz
      setGalleryList([]);
    };

    loadGallery();
    window.addEventListener('storage', loadGallery);
    const interval = setInterval(loadGallery, 1000);

    return () => {
      window.removeEventListener('storage', loadGallery);
      clearInterval(interval);
    };
  }, []);

  return (
    <section id="gallery" className="apple-section py-16 px-4 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-50 text-[#0071e3] rounded-2xl">
          <ImageIcon className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#1d1d1f]">Galereya</h2>
          <p className="text-sm text-gray-500">Maktab hayotidan foto lavhalar</p>
        </div>
      </div>

      {galleryList.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">Hozircha galereyaga rasmlar qo'shilmagan.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {galleryList.map((g, index) => (
            <div key={g.id || index} className="apple-card group overflow-hidden bg-white rounded-3xl shadow-sm border border-gray-100">
              <div className="relative aspect-video overflow-hidden bg-gray-100 rounded-2xl mb-4">
                {g.image ? (
                  <img 
                    src={g.image} 
                    alt={g.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div>
                {g.category && <span className="text-xs text-[#0071e3] font-semibold">{g.category}</span>}
                <h3 className="font-bold text-[#1d1d1f] text-base mt-1">{g.title}</h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}