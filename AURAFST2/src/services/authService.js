
import { supabase } from '../config/supabase';

export async function getOrCreateUserSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  if (!data.session) {
    throw new Error('Sesi login tidak ditemukan. Silakan login kembali.');
  }

  return data.session;
}
