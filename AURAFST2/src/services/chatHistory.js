
import { supabase } from '../config/supabase';

// Membuat percakapan baru
export async function createConversation(userId, title = 'Percakapan Baru') {
  const { data, error } = await supabase
    .from('conversations')
    .insert([
      {
        user_id: userId,
        title: title
      }
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Mengambil daftar percakapan pengguna
export async function getConversations(userId) {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

// Menyimpan pesan pengguna
export async function saveUserMessage(conversationId, userId, content) {
  const { data, error } = await supabase
    .from('messages')
    .insert([
      {
        conversation_id: conversationId,
        user_id: userId,
        role: 'user',
        content: content
      }
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Mengambil pesan dalam suatu percakapan
export async function getMessages(conversationId) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

// Memperbarui waktu percakapan
export async function updateConversationTime(conversationId) {
  const { error } = await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  if (error) {
    throw error;
  }
}

// Memperbarui judul percakapan
export async function updateConversationTitle(conversationId, title) {
  const { error } = await supabase
    .from('conversations')
    .update({ title })
    .eq('id', conversationId);

  if (error) throw error;
}


// Menyimpan jawaban AI ke Supabase
export async function saveAssistantMessage(
  conversationId,
  userId,
  content
) {
  const { data, error } = await supabase
    .from('messages')
    .insert([
      {
        conversation_id: conversationId,
        user_id: userId,
        role: 'assistant',
        content: content
      }
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Menghapus percakapan
export async function deleteConversation(conversationId) {
  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId);

  if (error) throw error;
}