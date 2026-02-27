import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a dummy client if credentials are missing (for VPS deployment without Supabase)
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not configured. Using fallback mode for VPS deployment.');
    // Return a mock client to prevent errors
    return {
      auth: { 
        signUp: async () => ({ data: null, error: new Error('Supabase not configured') }),
        signIn: async () => ({ data: null, error: new Error('Supabase not configured') }),
        getUser: async () => ({ data: null, error: new Error('Supabase not configured') })
      },
      from: () => ({ 
        select: async () => ({ data: [], error: null }), 
        insert: async () => ({ data: null, error: null }), 
        delete: async () => ({ data: null, error: null }),
        update: async () => ({ data: null, error: null })
      })
    } as any;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
};

export const supabase = createSupabaseClient();

// Auth helper functions
export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// User role helper
export async function getUserRole(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user role:', error);
    return null;
  }

  return data?.role;
}

// Update user role
export async function updateUserRole(userId: string, role: 'user' | 'business' | 'super_admin') {
  const { data, error } = await supabase
    .from('users')
    .update({ role })
    .eq('user_id', userId);

  return { data, error };
}
