import { useState, useEffect } from 'react';
import { Phone, Clock, User } from 'lucide-react';
import { administration as staticAdministration } from '../lib/data';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export default function Administration() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();
  const [administrationData, setAdministrationData] = useState<any[]>([]);

  useEffect(() => {
    // localStorage'dan ma'lumotni o'qiymiz, agar u bo'sh bo'lsa static ma'lumotni olamiz
    const saved = localStorage.getItem('administration');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAdministrationData(parsed.length > 0 ? parsed : staticAdministration);
      } catch (e) {
        setAdministrationData(staticAdministration);
      }
    } else {
      setAdministrationData(staticAdministration);
    }
  }, []);

  return (
    <section id="administration" className="apple-section bg-white/50">
      <div className="apple-container">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <p className="apple-eyebrow mb-4">Ma'muriyat</p>
          <h2 className="apple-heading">Rahbariyat va qabul kunlari</h2>
          <p className="apple-subheading mt-4">
            Maktab ma'muriyati a'zolari, ularning lavozimlari va fuqarolarni qabul qilish kunlari
          </p>
        </div>

        <div ref={ref} className="grid gap-6 sm:grid-cols-2">
          {administrationData.map((person: any, index: number) => (
            <div
              key={person.id || index}
              className={`apple-card flex flex-col sm:flex-row items-center sm:items-start gap-5 transition-all duration-700 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 120}ms` }}
            >
              <div className="flex-shrink-0">
                <div className="h-24 w-24 sm:h-28 sm:w-28 overflow-hidden rounded-2xl bg-gradient-to-br from-[#0071e3]/10 to-[#42a5f5]/10 shadow-sm">
                  <img
                    src={person.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'}
                    alt={person.name}
                    className="h-full w-full object-cover object-center"
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="flex flex-1 flex-col text-center sm:text-left">
                <h3 className="text-lg font-semibold text-[#1d1d1f]">{person.name}</h3>
                <p className="mt-0.5 text-sm font-medium text-[#0071e3]">{person.role || person.position}</p>

                <div className="mt-3 space-y-2">
                  {person.reception && (
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-[#6e6e73]">
                      <Clock className="h-4 w-4 flex-shrink-0 text-[#0071e3]" />
                      <span>{person.reception}</span>
                    </div>
                  )}
                  {person.phone && (
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-[#6e6e73]">
                      <Phone className="h-4 w-4 flex-shrink-0 text-[#0071e3]" />
                      <span>{person.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-center gap-3 rounded-2xl bg-[#0071e3]/5 px-6 py-4 text-center">
          <User className="h-5 w-5 flex-shrink-0 text-[#0071e3]" />
          <p className="text-sm font-medium text-[#6e6e73]">
            Qabul kunlari dam olish kunlari va rasmiy bayramlardan tashqari har kuni amalga oshiriladi
          </p>
        </div>
      </div>
    </section>
  );
}