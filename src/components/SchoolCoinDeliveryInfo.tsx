import { useCallback, useState } from 'react';
import { CalendarDays, RefreshCw } from 'lucide-react';
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

function refreshVisibleBalance(balance: number) {
  const labels = Array.from(document.querySelectorAll('p'));
  const label = labels.find(node => node.textContent?.trim().toLowerCase() === 'balance');
  const value = label?.parentElement?.querySelector('p.text-4xl');
  if (value) value.textContent = String(balance);
}

interface Props { open: boolean; }

export default function SchoolCoinDeliveryInfo({ open }: Props) {
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');
  const deliveryDate = nextDeliveryDate();

  const refresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    setMessage('');
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session?.user?.is_anonymous) throw new Error('Student session not found');
      const result = await supabase.rpc('schoolcoin_current_student');
      if (result.error) throw result.error;
      const balance = Number((result.data as { balance?: number } | null)?.balance ?? 0);
      refreshVisibleBalance(balance);
      setMessage('Balans yangilandi ✓');
    } catch {
      setMessage('Balansni yangilab bo‘lmadi. Qayta urinib ko‘ring.');
    } finally {
      window.setTimeout(() => setMessage(''), 2200);
      setRefreshing(false);
    }
  }, [refreshing]);

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
        <button type="button" onClick={() => void refresh()} disabled={refreshing} title="SchoolCoin balansini yangilash" aria-label="SchoolCoin balansini yangilash" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
      <p className="mt-2 text-[11px] leading-4 text-slate-500">Buyurtma berganingizdan keyin rewardni belgilangan kuni maktabdagi SchoolCoin topshirish punktidan olasiz.</p>
      {message && <p className="mt-2 text-xs font-semibold text-emerald-700" role="status">{message}</p>}
    </div>
  );
}
