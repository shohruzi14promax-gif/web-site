import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env variables are missing. Cloud data/auth is disabled.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

export interface StudentProposal {
  id: string;
  ministry: string;
  full_name: string;
  class: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

export type SiteDataKey =
  | 'teachers'
  | 'projects'
  | 'galleryList'
  | 'videoLessons'
  | 'announcements'
  | 'birthdays'
  | 'gpaList';

export async function getSiteData<T>(key: SiteDataKey, fallback: T): Promise<T> {
  const { data, error } = await supabase
    .from('site_data')
    .select('data')
    .eq('key', key)
    .maybeSingle();

  if (error || !data) return fallback;
  return (data.data as T) ?? fallback;
}

export async function saveSiteData<T>(key: SiteDataKey, value: T) {
  const { error } = await supabase.from('site_data').upsert({
    key,
    data: value,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function signInAdmin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (data.user?.app_metadata?.role !== 'admin') {
    await supabase.auth.signOut();
    throw new Error('Bu akkaunt admin huquqiga ega emas.');
  }
  return data;
}

export async function signOutAdmin() {
  await supabase.auth.signOut();
}
