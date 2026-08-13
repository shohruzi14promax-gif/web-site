import { useState } from 'react';
import { 
  MapPin, Phone, Send, Instagram, Facebook, ExternalLink, 
  Sparkles, CheckCircle2, User, MessageSquareText
} from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export default function Contact() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();
  
  const [senderName, setSenderName] = useState('');
  const [senderMessage, setSenderMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderMessage.trim()) return;

    // Supabase va LocalStorage bilan 100% mos keluvchi obyekt
    const newMessage = {
      id: Date.now(),
      full_name: senderName.trim() || "Anonim foydalanuvchi",
      class: "O'quvchi",
      title: "Saytdan Murojaat",
      description: senderMessage.trim(),
      message: senderMessage.trim(), // Zaxira uchun
      name: senderName.trim() || "Anonim foydalanuvchi",
      date: new Date().toLocaleDateString('uz-UZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    // Barcha mumkin bo'lgan kalitlarga bir vaqtning o'zida saqlaymiz
    const keys = ['student_proposals', 'admin_messages', 'admin_proposals', 'proposals'];
    
    keys.forEach(key => {
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      localStorage.setItem(key, JSON.stringify([newMessage, ...existing]));
    });

    // Custom event tarqatamiz (Admin panel ochiq bo'lsa real-time yangilanishi uchun)
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('proposals_updated'));

    setSenderName('');
    setSenderMessage('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section id="contact" className="apple-section bg-[#f5f5f7]/60 py-20">
      <div className="apple-container max-w-7xl">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="apple-eyebrow mb-3 text-xs font-semibold tracking-widest text-[#0071e3] uppercase">
            Aloqa va Takliflar
          </p>
          <h2 className="apple-heading text-3xl font-bold tracking-tight text-[#1d1d1f] sm:text-4xl">
            Biz bilan bog'laning
          </h2>
          <p className="apple-subheading mt-3 text-base text-[#6e6e73]">
            Prezident ta'lim muassasalari agentligi tizimidagi Jizzax shahar 1-son ixtisoslashtirilgan MI rasmiy kanallari va takliflar oynasi
          </p>
        </div>

        <div ref={ref} className="grid gap-8 lg:grid-cols-12 items-start">
          <div
            className={`space-y-5 lg:col-span-6 transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {/* Manzil */}
            <div className="group rounded-3xl bg-white/80 p-6 shadow-sm border border-black/5 backdrop-blur-md transition-all hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#0071e3]/10 text-[#0071e3]">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#1d1d1f]">Manzil</h3>
                  <p className="mt-1 text-sm text-[#6e6e73]">Jizzax shahri, O'zbekiston</p>
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#0071e3] hover:underline"
                  >
                    Google Maps'da ko'rish
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Telefonlar */}
            <div className="group rounded-3xl bg-white/80 p-6 shadow-sm border border-black/5 backdrop-blur-md transition-all hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#34c759]/10 text-[#34c759]">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#1d1d1f]">Telefonlar</h3>
                  <p className="mt-1 text-sm font-medium text-[#1d1d1f]">+998 72 223-86-17</p>
                  <p className="text-sm font-medium text-[#1d1d1f]">+998 72 223-86-14</p>
                </div>
              </div>
            </div>

            {/* Taklif va Murojaatlar Formasi */}
            <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-black/5 transition-all hover:shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0071e3]/10 text-[#0071e3]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1d1d1f]">Taklif va Murojaatlar</h3>
                  <p className="text-xs text-[#6e6e73]">
                    Fikr va takliflaringiz to'g'ridan-to'g'ri admin panelga yuboriladi.
                  </p>
                </div>
              </div>

              {submitted ? (
                <div className="my-6 flex flex-col items-center justify-center py-6 text-center animate-in fade-in duration-300">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#34c759]/10 text-[#34c759]">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h4 className="text-base font-semibold text-[#1d1d1f]">Murojaatingiz yuborildi!</h4>
                  <p className="mt-1 text-xs text-[#6e6e73]">
                    Rahmat, murojaatingiz admin panelda aks etadi.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8e8e93]">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Ismingiz (ixtiyoriy)"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full rounded-2xl border border-black/10 bg-[#f5f5f7] pl-10 pr-4 py-3 text-sm text-[#1d1d1f] outline-none transition-all placeholder:text-[#aeaeb2] focus:border-[#0071e3] focus:bg-white focus:ring-4 focus:ring-[#0071e3]/10"
                    />
                  </div>

                  <div className="relative">
                    <div className="pointer-events-none absolute top-3.5 left-0 flex items-center pl-3.5 text-[#8e8e93]">
                      <MessageSquareText className="h-4 w-4" />
                    </div>
                    <textarea
                      placeholder="Taklif yoki murojaatingizni yozing..."
                      rows={3}
                      value={senderMessage}
                      onChange={(e) => setSenderMessage(e.target.value)}
                      className="w-full resize-none rounded-2xl border border-black/10 bg-[#f5f5f7] pl-10 pr-4 py-3 text-sm text-[#1d1d1f] outline-none transition-all placeholder:text-[#aeaeb2] focus:border-[#0071e3] focus:bg-white focus:ring-4 focus:ring-[#0071e3]/10"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0071e3] px-5 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#0077ed] hover:shadow-lg active:scale-[0.98]"
                  >
                    <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    Yuborish
                  </button>
                </form>
              )}
            </div>

            {/* Social Media */}
            <div className="rounded-3xl bg-white/80 p-6 shadow-sm border border-black/5 backdrop-blur-md">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#6e6e73]">
                Ijtimoiy tarmoqlar
              </h3>
              <div className="flex gap-4">
                <a href="https://t.me/Jizzax_1_son_IMI" target="_blank" rel="noopener noreferrer" className="group flex flex-1 flex-col items-center gap-2 rounded-2xl bg-[#f5f5f7] p-3 transition-all hover:bg-white hover:scale-105">
                  <Send className="h-5 w-5 text-[#0088cc]" />
                  <span className="text-xs font-medium text-[#1d1d1f]">Telegram</span>
                </a>
                <a href="http://cc.uz/168hg" target="_blank" rel="noopener noreferrer" className="group flex flex-1 flex-col items-center gap-2 rounded-2xl bg-[#f5f5f7] p-3 transition-all hover:bg-white hover:scale-105">
                  <Instagram className="h-5 w-5 text-[#c13584]" />
                  <span className="text-xs font-medium text-[#1d1d1f]">Instagram</span>
                </a>
                <a href="http://cc.uz/168hf" target="_blank" rel="noopener noreferrer" className="group flex flex-1 flex-col items-center gap-2 rounded-2xl bg-[#f5f5f7] p-3 transition-all hover:bg-white hover:scale-105">
                  <Facebook className="h-5 w-5 text-[#1877f2]" />
                  <span className="text-xs font-medium text-[#1d1d1f]">Facebook</span>
                </a>
              </div>
            </div>
          </div>

          {/* Maps */}
          <div
            className={`h-full min-h-[480px] overflow-hidden rounded-3xl shadow-sm border border-black/5 lg:col-span-6 transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.2!2d67.8!3d40.12!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zSph6enpheGF4!5e0!3m2!1suz!2suz!4v1"
              width="100%"
              height="100%"
              style={{ minHeight: '520px', border: 0 }}
              loading="eager"
              referrerPolicy="no-referrer-when-downgrade"
              title="Maktab manzili xaritada"
              className="grayscale-[15%] contrast-[102%]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}