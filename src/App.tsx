import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import CloudAdminPanelPro from './components/CloudAdminPanelPro';
import SchoolCoinSecure from './components/SchoolCoinSecure';
import PublicSite from './components/PublicSite';
import { getSiteData, supabase, supabaseConfigured } from './lib/supabase';

type NotificationItem = Record<string, unknown> & {
  id?: string | number;
  title?: string;
  content?: string;
  description?: string;
  message?: string;
  date?: string;
};

const clearModuleHash = () => {
  const url = new URL(window.location.href);
  url.hash = '';
  window.history.replaceState({}, '', url);
};

export default function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSchoolCoinOpen, setIsSchoolCoinOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<NotificationItem[]>([]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      if (!supabaseConfigured) return;
      const value = await getSiteData<NotificationItem[]>('announcements', []);
      if (alive) setAnnouncements(value);
    };
    void load();
    const channel = supabaseConfigured
      ? supabase
          .channel('site-announcements-live')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'site_data' }, payload => {
            const key = (payload.new as { key?: string } | null)?.key || (payload.old as { key?: string } | null)?.key;
            if (key === 'announcements') void load();
          })
          .subscribe()
      : null;
    return () => {
      alive = false;
      if (channel) void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const syncHash = () => {
      setIsAdminOpen(window.location.hash === '#internal-admin');
      setIsSchoolCoinOpen(window.location.hash === '#schoolcoin');
    };
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  const closeAdmin = () => {
    setIsAdminOpen(false);
    clearModuleHash();
  };
  const closeSchoolCoin = () => {
    setIsSchoolCoinOpen(false);
    clearModuleHash();
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />
      <PublicSite announcements={announcements} />
      {isAdminOpen && <CloudAdminPanelPro onClose={closeAdmin} />}
      {isSchoolCoinOpen && <SchoolCoinSecure onClose={closeSchoolCoin} initialMode="student" />}
    </div>
  );
}
