import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const configuredKey = (
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)
  || (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined)
)?.trim();

// Supabase publishable keys are designed for browser use. RLS policies still
// control which rows anonymous visitors can read or modify.
const PROJECT_SUPABASE_URL = 'https://tljecpmgfwpwajwkkock.supabase.co';
const PROJECT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_F2lbYRZlDXr7jpomINo_cw_FpOV8FBZ';
const resolvedSupabaseUrl = supabaseUrl || PROJECT_SUPABASE_URL;
const supabaseAnonKey = configuredKey || PROJECT_SUPABASE_PUBLISHABLE_KEY;
export const supabaseConfigured = Boolean(supabaseAnonKey);

export const supabase = createClient(resolvedSupabaseUrl, supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });

export interface StudentProposal { id: string; ministry: string; full_name: string; class: string; title: string; description: string; status: string; created_at: string; }

export type SiteDataKey = 'teachers' | 'projects' | 'galleryList' | 'videoLessons' | 'announcements' | 'birthdays' | 'gpaList' | 'schoolLife';

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
  if (!supabaseConfigured) throw new Error('Supabase sozlanmagan. Environment variablesni tekshiring.');
  const { error } = await supabase.from('site_data').upsert({ key, data: value, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function signInAdmin(email: string, password: string) {
  if (!supabaseConfigured) throw new Error('Supabase sozlanmagan.');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error('Admin authentication failed:', error);
    throw error;
  }
  if (data.user?.app_metadata?.role !== 'admin') {
    await supabase.auth.signOut();
    throw new Error('Bu akkaunt admin huquqiga ega emas.');
  }
  return data;
}

export async function signOutAdmin() { await supabase.auth.signOut(); }
