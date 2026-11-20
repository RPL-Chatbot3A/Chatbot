
import { supabase } from '../config/supabase';

export async function getOrCreateUserSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.warn('Gagal mengecek sesi Supabase:', error.message);
    return null;
  }

  // Jika belum login / mode tamu, kembalikan null secara aman tanpa melempar error
  return data?.session ?? null;
}
