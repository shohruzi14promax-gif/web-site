import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!supabaseConfigured) {
  console.error('Supabase env variables are missing: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
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
  | 'teachers' | 'projects' | 'galleryList' | 'videoLessons'
  | 'announcements' | 'birthdays' | 'gpaList';

export async function getSiteData<T>(key: SiteDataKey, fallback: T): Promise<T> {
  if (!supabaseConfigured) return fallback;
  try {
    const request = supabase.from('site_data').select('data').eq('key', key).maybeSingle();
    const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Supabase request timeout')), 5000));
    const result = await Promise.race([request, timeout]);
    if (result.error || !result.data) return fallback;
    return (result.data.data as T) ?? fallback;
  } catch (error) {
    console.error(`Supabase getSiteData(${key}) failed:`, error);
    return fallback;
  }
}

export async function saveSiteData<T>(key: SiteDataKey, value: T) {
  if (!supabaseConfigured) throw new Error('Supabase sozlanmagan. Vercel environment variablesni tekshiring.');
  const { error } = await supabase.from('site_data').upsert({ key, data: value, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function signInAdmin(email: string, password: string) {
  if (!supabaseConfigured) throw new Error('Supabase sozlanmagan.');
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
