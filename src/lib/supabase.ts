import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

const PROJECT_SUPABASE_URL = 'https://tljecpmgfwpwajwkkock.supabase.co';
const resolvedSupabaseUrl = supabaseUrl || PROJECT_SUPABASE_URL;
export const supabaseConfigured = Boolean(supabaseAnonKey);

if (!supabaseAnonKey) console.error('Supabase env variable is missing: VITE_SUPABASE_ANON_KEY');

export const supabase = createClient(resolvedSupabaseUrl, supabaseAnonKey || 'placeholder-anon-key', {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

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
  if (!supabaseConfigured) throw new Error('Supabase sozlanmagan. Netlify environment variablesni tekshiring.');
  const { error } = await supabase.from('site_data').upsert({ key, data: value, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function signInAdmin(email: string, password: string) {
  if (!supabaseConfigured) throw new Error('Supabase sozlanmagan.');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (data.user?.app_metadata?.role !== 'admin') {
    await supabase.auth.signOut({ scope: 'local' });
    throw new Error('Bu akkaunt admin huquqiga ega emas.');
  }
  return data;
}

export async function ensureStudentAuthSession() {
  if (!supabaseConfigured) throw new Error('Supabase sozlanmagan.');
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (sessionData.session) {
    if (!sessionData.session.user.is_anonymous) {
      throw new Error('Avval joriy admin sessiyasidan chiqing.');
    }
    return sessionData.session;
  }
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  if (!data.session?.user?.is_anonymous) throw new Error('Student sessiyasi yaratilmadi.');
  return data.session;
}

export async function bindStudent(code: string, pin: string) {
  const { data, error } = await supabase.rpc('schoolcoin_bind_student', {
    p_code: code.trim().toUpperCase(),
    p_pin: pin,
  });
  if (error) throw error;
  return data as { id: string; student_code: string; full_name: string; class_name: string };
}

export async function getCurrentStudent() {
  const { data, error } = await supabase.rpc('schoolcoin_current_student');
  if (error) throw error;
  return data as { id: string; student_code: string; full_name: string; class_name: string; balance: number } | null;
}

export async function signOutLocal() {
  const { error } = await supabase.auth.signOut({ scope: 'local' });
  if (error) throw error;
}

export async function signOutAdmin() { await signOutLocal(); }
