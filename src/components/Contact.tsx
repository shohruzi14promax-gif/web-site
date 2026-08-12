import { useState } from 'react';
import { MapPin, Phone, Send, Instagram, Facebook, ExternalLink, MessageSquare } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export default function Contact() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();
  
  const [senderName, setSenderName] = useState('');
  const [senderMessage, setSenderMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderMessage.trim()) return;

    // Mavjud xabarlarni olish
    const existingMessages = JSON.parse(localStorage.getItem('admin_messages') || '[]');
    
    // Yangi taklif/xabarni qo'shish
    const newMessage = {
      id: Date.now(),
      name: senderName.trim() || "Anonim foydalanuvchi",
      message: senderMessage.trim(),
      date: new Date().toLocaleString()
    };

    localStorage.setItem('admin_messages', JSON.stringify([newMessage, ...existingMessages]));

    setSenderName('');
    setSenderMessage('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section id="contact" className="apple-section bg-white/50">
      <div className="apple-container">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <p className="apple-eyebrow mb-4">Aloqa va Takliflar</p>
          <h2 className="apple-heading">Biz bilan bog'laning</h2>
          <p className="apple-subheading mt-4">
            Prezident ta'lim muassasalari agentligi tizimidagi Jizzax shahar 1-son ixtisoslashtirilgan MI rasmiy kanallari va takliflar oynasi
          </p>
        </div>

        <div ref={ref} className="grid gap-6 lg:grid-cols-2">
          <div
            className={`space-y-4 transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="apple-card">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#0071e3]/10">
                  <MapPin className="h-6 w-6 text-[#0071e3]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#1d1d1f]">Manzil</h3>
                  <p className="mt-1 text-sm text-[#6e6e73]">Jizzax shahri, O'zbekiston</p>
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[#0071e3] hover:underline"
                  >
                    Google Maps'da ko'rish
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>

            <div className="apple-card">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#34c759]/10">
                  <Phone className="h-6 w-6 text-[#34c759]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#1d1d1f]">Telefonlar</h3>
                  <p className="mt-1 text-sm text-[#6e6e73]">+998 72 223-86-17</p>
                  <p className="text-sm text-[#6e6e73]">+998 72 223-86-14</p>
                </div>
              </div>
            </div>

            {/* Taklif yuborish forma qismi */}
            <div className="apple-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-[#1d1d1f]">Taklif va Murojaatlar</h3>
              </div>
              <p className="text-xs text-[#6e6e73] mb-4">
                Fikr va takliflaringiz to'g'ridan-to'g'ri maktab ma'muriyatiga (admin panelga) yuboriladi.
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label htmlFor="senderNameInput" className="sr-only">Ismingiz</label>
                  <input
                    id="senderNameInput"
                    name="senderName"
                    type="text"
                    placeholder="Ismingiz (ixtiyoriy)"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                  />
                </div>
                <div>
                  <label htmlFor="senderMessageInput" className="sr-only">Taklif yoki murojaat</label>
                  <textarea
                    id="senderMessageInput"
                    name="senderMessage"
                    placeholder="Taklif yoki murojaatingizni yozing..."
                    rows={3}
                    value={senderMessage}
                    onChange={(e) => setSenderMessage(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#0071e3] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition"
                >
                  Yuborish
                </button>
                {submitted && (
                  <p className="text-xs text-green-600 font-medium text-center mt-1">
                    Taklifingiz muvaffaqiyatli yuborildi!
                  </p>
                )}
              </form>
            </div>

            <div className="apple-card">
              <h3 className="mb-4 text-base font-semibold text-[#1d1d1f]">Ijtimoiy tarmoqlar</h3>
              <div className="flex gap-4">
                <a
                  href="https://t.me/Jizzax_1_son_IMI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-2"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5f5f7] transition-all group-hover:scale-110 group-hover:bg-white group-hover:shadow-md">
                    <Send className="h-5 w-5 text-[#0088cc]" />
                  </div>
                  <span className="text-xs font-medium text-[#6e6e73]">Telegram</span>
                </a>

                <a
                  href="http://cc.uz/168hg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-2"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5f5f7] transition-all group-hover:scale-110 group-hover:bg-white group-hover:shadow-md">
                    <Instagram className="h-5 w-5 text-[#c13584]" />
                  </div>
                  <span className="text-xs font-medium text-[#6e6e73]">Instagram</span>
                </a>

                <a
                  href="http://cc.uz/168hf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-2"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5f5f7] transition-all group-hover:scale-110 group-hover:bg-white group-hover:shadow-md">
                    <Facebook className="h-5 w-5 text-[#1877f2]" />
                  </div>
                  <span className="text-xs font-medium text-[#6e6e73]">Facebook</span>
                </a>
              </div>
            </div>
          </div>

          <div
            className={`overflow-hidden rounded-3xl shadow-sm transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.2!2d67.8!3d40.12!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zSph6enpheGF4!5e0!3m2!1suz!2suz!4v1"
              width="100%"
              height="100%"
              style={{ minHeight: '500px', border: 0 }}
              loading="eager"
              referrerPolicy="no-referrer-when-downgrade"
              title="Maktab manzili xaritada"
            />
          </div>
        </div>
      </div>
    </section>
  );
}