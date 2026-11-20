import { supabase } from '../config/supabase';

// Membuat percakapan baru
export async function createConversation(userId, title = 'Percakapan Baru') {
  const { data, error } = await supabase
    .from('conversations')
    .insert([
      {
        user_id: userId,
        title: title,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Gagal membuat percakapan di Supabase:', error);
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
    console.error('Gagal mengambil daftar percakapan dari Supabase:', error);
    throw error;
  }

  return data;
}

// Menyimpan pesan pengguna (mendukung 2 atau 3 argumen agar aman dari salah urutan)
export async function saveUserMessage(conversationId, userIdOrContent, maybeContent) {
  const hasThreeArgs = maybeContent !== undefined;
  const userId = hasThreeArgs ? userIdOrContent : null;
  const content = hasThreeArgs ? maybeContent : userIdOrContent;

  const payload = {
    conversation_id: conversationId,
    role: 'user',
    content: content,
  };
  if (userId) {
    payload.user_id = userId;
  }

  const { data, error } = await supabase
    .from('messages')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('Gagal menyimpan pesan user ke Supabase:', error);
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
    console.error('Gagal mengambil pesan dari Supabase:', error);
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
    console.error('Gagal memperbarui waktu percakapan di Supabase:', error);
    throw error;
  }
}

// Memperbarui judul percakapan
export async function updateConversationTitle(conversationId, title) {
  const { error } = await supabase
    .from('conversations')
    .update({ title })
    .eq('id', conversationId);

  if (error) {
    console.error('Gagal memperbarui judul percakapan di Supabase:', error);
    throw error;
  }
}

// Menyimpan jawaban AI ke Supabase (mendukung 2 atau 3 argumen)
export async function saveAssistantMessage(
  conversationId,
  userIdOrContent,
  maybeContent
) {
  const hasThreeArgs = maybeContent !== undefined;
  const userId = hasThreeArgs ? userIdOrContent : null;
  const content = hasThreeArgs ? maybeContent : userIdOrContent;

  const payload = {
    conversation_id: conversationId,
    role: 'assistant',
    content: content,
  };
  if (userId) {
    payload.user_id = userId;
  }

  const { data, error } = await supabase
    .from('messages')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('Gagal menyimpan pesan AI ke Supabase:', error);
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

  if (error) {
    console.error('Gagal menghapus percakapan di Supabase:', error);
    throw error;
  }
}
