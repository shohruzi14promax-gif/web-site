import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useI18n } from '../i18n';

type ThemeMode = 'light' | 'dark' | 'system';
function applyTheme(mode: ThemeMode) {
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = mode === 'dark' || (mode === 'system' && systemDark);
  document.documentElement.classList.toggle('dark', dark); document.documentElement.dataset.theme = mode;
}
export default function ThemeMode() {
  const { t } = useI18n();
  const [mode, setMode] = useState<ThemeMode>(() => { const saved = localStorage.getItem('site_theme'); return saved === 'dark' || saved === 'light' || saved === 'system' ? saved : 'system'; });
  useEffect(() => { applyTheme(mode); const media = window.matchMedia('(prefers-color-scheme: dark)'); const onChange = () => mode === 'system' && applyTheme('system'); media.addEventListener('change', onChange); return () => media.removeEventListener('change', onChange); }, [mode]);
  const options: { value: ThemeMode; label: string; icon: typeof Sun }[] = [{ value: 'light', label: t('light'), icon: Sun }, { value: 'dark', label: t('dark'), icon: Moon }, { value: 'system', label: t('system'), icon: Monitor }];
  return <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-1" aria-label={t('theme')}>{options.map(({ value, label, icon: Icon }) => <button key={value} type="button" onClick={() => { setMode(value); localStorage.setItem('site_theme', value); applyTheme(value); }} aria-pressed={mode === value} aria-label={label} title={label} className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${mode === value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}><Icon className="h-4 w-4" /></button>)}</div>;
}
