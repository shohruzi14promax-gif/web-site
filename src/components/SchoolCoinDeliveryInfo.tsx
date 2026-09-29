import { useMemo } from 'react';
import { CalendarDays } from 'lucide-react';
import { supabase } from '../lib/supabase';

function nextDeliveryDate(from = new Date()) {
  const date = new Date(from.getFullYear(), from.getMonth() + 1, 0);
  const offset = (date.getDay() - 5 + 7) % 7;
  date.setDate(date.getDate() - offset);
  date.setHours(0, 0, 0, 0);
  if (date <= from) {
    const nextMonth = new Date(from.getFullYear(), from.getMonth() + 2, 0);
    const nextOffset = (nextMonth.getDay() - 5 + 7) % 7;
    nextMonth.setDate(nextMonth.getDate() - nextOffset);
    nextMonth.setHours(0, 0, 0, 0);
    return nextMonth;
  }
  return date;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

interface Props { open: boolean; }

export default function SchoolCoinDeliveryInfo({ open }: Props) {
  const deliveryDate = useMemo(() => nextDeliveryDate(), []);

  if (!open) return null;

  return (
    <div className="fixed right-4 top-4 z-[230] w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-amber-200 bg-white/95 p-3 shadow-2xl backdrop-blur md:right-8 md:top-6">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600"><CalendarDays className="h-5 w-5" /></div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Reward topshirish kuni</p>
          <p className="mt-0.5 text-sm font-bold text-slate-900">Har oyning oxirgi juma kuni</p>
          <p className="mt-0.5 text-xs text-slate-500">Keyingi topshirish: {formatDate(deliveryDate)}</p>
        </div>
      </div>
      <p className="mt-2 text-[11px] leading-4 text-slate-500">Buyurtma berganingizdan keyin rewardni belgilangan kuni maktabdagi SchoolCoin topshirish punktidan olasiz.</p>
    </div>
  );
}
