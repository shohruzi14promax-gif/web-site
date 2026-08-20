import { CalendarDays, Clock3, MapPin, Sparkles } from 'lucide-react';

export default function Events() {
  return (
    <section id="events" className="scroll-mt-24 px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white/85 p-7 shadow-sm backdrop-blur sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_.75fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-blue-600">Tadbirlar</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Upcoming events</h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
                Maktab tadbirlari uchun yagona ko‘rinish. Hozirgi tizimda alohida event/calendar ma’lumot manbasi mavjud emas, shuning uchun bu yerda taxminiy sana yoki tadbir nomlari ko‘rsatilmaydi.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                <Sparkles className="h-4 w-4" /> Yangi tadbirlar qo‘shilganda shu yerda chiqadi
              </div>
            </div>

            <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50/80 p-7">
              <div className="grid grid-cols-3 gap-3 text-center text-slate-400">
                <div className="rounded-2xl bg-white p-4"><CalendarDays className="mx-auto h-5 w-5" /><p className="mt-2 text-[11px] font-semibold">Sana</p></div>
                <div className="rounded-2xl bg-white p-4"><Clock3 className="mx-auto h-5 w-5" /><p className="mt-2 text-[11px] font-semibold">Vaqt</p></div>
                <div className="rounded-2xl bg-white p-4"><MapPin className="mx-auto h-5 w-5" /><p className="mt-2 text-[11px] font-semibold">Joy</p></div>
              </div>
              <div className="mt-5 text-center">
                <p className="font-bold text-slate-700">Hozircha tadbirlar mavjud emas</p>
                <p className="mt-1 text-sm text-slate-500">Keyinroq tekshirib ko‘ring.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
