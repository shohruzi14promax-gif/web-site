import { useState } from 'react';
import { MapPin, Phone, Send, Instagram, Facebook, ExternalLink, Sparkles, CheckCircle2, User, MessageSquareText } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { supabase } from '../lib/supabase';
import { schoolInfo } from '../lib/data';
import { useI18n } from '../i18n';

export default function Contact() {
  const { t } = useI18n();
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); const text = message.trim(); if (!text || sending) return; setSending(true); setSubmitError('');
    const { error } = await supabase.from('student_proposals').insert({ ministry: 'Jizzax shahar 1-son ixtisoslashtirilgan MI', full_name: name.trim() || 'Anonim foydalanuvchi', class: "O'quvchi", title: 'Saytdan Murojaat', description: text, status: 'pending' });
    if (error) { setSubmitError(t('serverError')); setSending(false); return; }
    setName(''); setMessage(''); setSubmitted(true); setSending(false); window.setTimeout(() => setSubmitted(false), 4000);
  };

  const exactMapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(schoolInfo.address)}&output=embed`;

  return (
    <section id="contact" className="apple-section bg-[#f5f5f7]/60 py-20 dark:bg-slate-950/40">
      <div className="apple-container max-w-7xl">
        <div className="mx-auto mb-14 max-w-3xl text-center"><p className="apple-eyebrow mb-3 text-xs font-semibold tracking-widest text-[#0071e3] uppercase">{t('contact')}</p><h2 className="apple-heading text-3xl font-bold tracking-tight text-[#1d1d1f] dark:text-white">{t('contact')}</h2><p className="apple-subheading mt-3 text-base text-[#6e6e73] dark:text-slate-400">{t('officialSource')}</p></div>
        <div ref={ref} className="grid items-start gap-8 lg:grid-cols-12">
          <div className={`space-y-5 lg:col-span-6 transition-all duration-700 motion-reduce:transition-none ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="group rounded-3xl border border-black/5 bg-white/80 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-slate-900/80"><div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0071e3]/10 text-[#0071e3]"><MapPin className="h-6 w-6" /></div><div><h3 className="text-base font-semibold text-[#1d1d1f] dark:text-white">{t('place')}</h3><p className="mt-1 text-sm text-[#6e6e73] dark:text-slate-400">{schoolInfo.address}</p><a href={schoolInfo.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#0071e3]">Google Maps<ExternalLink className="h-3 w-3" /></a></div></div></div>
            <div className="group rounded-3xl border border-black/5 bg-white/80 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-slate-900/80"><div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#34c759]/10 text-[#34c759]"><Phone className="h-6 w-6" /></div><div><h3 className="text-base font-semibold text-[#1d1d1f] dark:text-white">{t('contact')}</h3><a href={`tel:${schoolInfo.phone.replace(/[^\d+]/g, '')}`} className="mt-1 block text-sm font-medium text-[#1d1d1f] dark:text-white">{schoolInfo.phone}</a><a href={`tel:${schoolInfo.phone2.replace(/[^\d+]/g, '')}`} className="block text-sm font-medium text-[#1d1d1f] dark:text-white">{schoolInfo.phone2}</a></div></div></div>
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 dark:border-white/10 dark:bg-slate-900 sm:p-8">
              <div className="mb-2 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0071e3]/10 text-[#0071e3]"><Sparkles className="h-5 w-5" /></div><div><h3 className="text-base font-bold text-[#1d1d1f] dark:text-white">{t('contact')}</h3><p className="text-xs text-[#6e6e73] dark:text-slate-400">{t('submit')}</p></div></div>
              {submitError && <div role="alert" className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-950/30 dark:text-red-300">{submitError}</div>}
              {submitted ? <div className="my-6 flex flex-col items-center justify-center py-6 text-center"><CheckCircle2 className="mb-3 h-10 w-10 text-[#34c759]" /><h4 className="text-base font-semibold dark:text-white">{t('success')}</h4></div> : <form onSubmit={handleSubmit} className="mt-5 space-y-3.5"><label className="relative block"><span className="sr-only">{t('profileInfo')}</span><User className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[#8e8e93]" /><input aria-label={t('profileInfo')} type="text" placeholder={t('profileInfo')} value={name} onChange={e => setName(e.target.value)} className="w-full rounded-2xl border border-black/10 bg-[#f5f5f7] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#0071e3] dark:border-white/10 dark:bg-slate-800 dark:text-white" /></label><label className="relative block"><span className="sr-only">{t('contact')}</span><MessageSquareText className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[#8e8e93]" /><textarea aria-label={t('contact')} placeholder={t('contact')} rows={3} value={message} onChange={e => setMessage(e.target.value)} className="w-full resize-none rounded-2xl border border-black/10 bg-[#f5f5f7] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#0071e3] dark:border-white/10 dark:bg-slate-800 dark:text-white" required /></label><button type="submit" disabled={sending} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#0071e3] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60"><Send className="h-4 w-4" />{sending ? t('loading') : t('submit')}</button></form>}
            </div>
            <div className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/80"><h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#6e6e73]">{t('media')}</h3><div className="flex gap-4"><a href={schoolInfo.social.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="flex flex-1 flex-col items-center gap-2 rounded-2xl bg-[#f5f5f7] p-3 transition hover:-translate-y-1 dark:bg-slate-800"><Send className="h-5 w-5 text-[#0088cc]" /><span className="text-xs font-medium dark:text-white">Telegram</span></a><a href={schoolInfo.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex flex-1 flex-col items-center gap-2 rounded-2xl bg-[#f5f5f7] p-3 transition hover:-translate-y-1 dark:bg-slate-800"><Instagram className="h-5 w-5 text-[#c13584]" /><span className="text-xs font-medium dark:text-white">Instagram</span></a><a href={schoolInfo.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex flex-1 flex-col items-center gap-2 rounded-2xl bg-[#f5f5f7] p-3 transition hover:-translate-y-1 dark:bg-slate-800"><Facebook className="h-5 w-5 text-[#1877f2]" /><span className="text-xs font-medium dark:text-white">Facebook</span></a></div></div>
          </div>
          <div className={`h-full min-h-[480px] overflow-hidden rounded-3xl border border-black/5 shadow-sm lg:col-span-6 transition-all duration-700 motion-reduce:transition-none ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}><iframe src={exactMapEmbed} width="100%" height="100%" style={{ minHeight: '520px', border: 0 }} loading="lazy" title={t('place')} /></div>
        </div>
      </div>
    </section>
  );
}
