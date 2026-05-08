import { ref, computed } from 'vue';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

const ADMIN_EMAIL = 'admin@glamandgo.com';

const session = ref<Session | null>(null);
const user = ref<User | null>(null);
const role = ref<string | null>(null);
const loading = ref(true);

export function useAuth() {
  const isAdmin = computed(() => role.value === 'admin' || user.value?.email === ADMIN_EMAIL);

  const initAuth = async () => {
    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, s) => {
      session.value = s;
      user.value = s?.user ?? null;
      if (s?.user) {
        const { data } = await supabase
          .from('users')
          .select('role')
          .eq('email', s.user.email)
          .single();
        role.value = data?.role ?? 'customer';
      } else {
        // Check for mock session
        const mock = localStorage.getItem('glam_go_mock_user');
        if (mock) {
          const { user: u, role: r } = JSON.parse(mock);
          user.value = u;
          role.value = r;
        } else {
          role.value = null;
        }
      }
    });

    const { data } = await supabase.auth.getSession();
    session.value = data.session;
    user.value = data.session?.user ?? null;
    
    if (data.session?.user) {
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('email', data.session.user.email)
        .single();
      role.value = userData?.role ?? 'customer';
    } else {
      const mock = localStorage.getItem('glam_go_mock_user');
      if (mock) {
        const { user: u, role: r } = JSON.parse(mock);
        user.value = u;
        role.value = r;
      }
    }

    loading.value = false;

    return () => sub.subscription.unsubscribe();
  };

  const signIn = async (identifier: string, password: string) => {
    console.log('[Auth] Attempting login for:', identifier);
    
    // 1. Try Supabase Auth if it looks like an email
    if (identifier.includes('@')) {
      const { error } = await supabase.auth.signInWithPassword({ email: identifier, password });
      if (!error) return { error: null };
    }

    // 2. Try custom users table via RPC (to bypass RLS for seed users)
    const cleanIdentifier = identifier.trim();
    console.log('[Auth] Calling RPC check_user_credentials with:', cleanIdentifier);

    const { data, error: rpcError } = await supabase.rpc('check_user_credentials', {
      identifier: cleanIdentifier,
      pass: password
    });

    if (rpcError) {
      console.error('[Auth] RPC error during login:', rpcError.message, rpcError.details);
      // If the function doesn't exist, it means the migration wasn't applied
      if (rpcError.message.includes('does not exist')) {
        return { error: 'Database setup incomplete. Please apply the latest migration in Supabase.' };
      }
      return { error: rpcError.message };
    }

    console.log('[Auth] RPC result:', data);

    if (data && data.length > 0) {
      const u = data[0];
      console.log('[Auth] Login successful for:', u.user_full_name);
      // Create a mock user object compatible with the app's expectations
      user.value = { 
        id: u.user_id.toString(), 
        email: u.user_email || identifier,
        user_metadata: { full_name: u.user_full_name }
      } as any;
      role.value = u.user_role;
      
      localStorage.setItem('glam_go_mock_user', JSON.stringify({ user: user.value, role: role.value }));
      return { error: null };
    }

    console.warn('[Auth] Login failed: No matching user found in custom table');
    return { error: 'Invalid email/username or password' };
  };

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        emailRedirectTo: `${window.location.origin}/reset-password`,
        data: {
          full_name: fullName,
          phone: phone,
        }
      },
    });
    return { error: error?.message ?? null };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error?.message ?? null };
  };

  const updatePassword = async (password: string) => {
    // 1. Update Supabase Auth password
    const { error } = await supabase.auth.updateUser({ password });
    
    if (!error && user.value?.email) {
      // 2. Sync with custom users table if they exist there
      await supabase
        .from('users')
        .update({ password: password })
        .eq('email', user.value.email);
        
      console.log('[Auth] Password synced to custom users table');
    }
    
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    localStorage.removeItem('glam_go_mock_user');
    user.value = null;
    role.value = null;
    await supabase.auth.signOut();
  };

  return {
    user,
    session,
    loading,
    isAdmin,
    initAuth,
    signIn,
    signUp,
    resetPassword,
    updatePassword,
    signOut,
  };
}
