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

    // 2. Try custom users table (supporting the provided AdminPam credentials)
    // Using ilike for case-insensitive matching and trimming spaces
    const cleanIdentifier = identifier.trim();
    const { data, error: dbError } = await supabase
      .from('users')
      .select('*')
      .or(`email.ilike.${cleanIdentifier},full_name.ilike.${cleanIdentifier}`)
      .eq('password', password)
      .maybeSingle();

    if (dbError) {
      console.error('[Auth] Database error during custom login:', dbError);
    }

    if (data) {
      console.log('[Auth] Custom login successful for:', data.full_name);
      user.value = { id: data.id.toString(), email: data.email || identifier } as any;
      role.value = data.role;
      localStorage.setItem('glam_go_mock_user', JSON.stringify({ user: user.value, role: role.value }));
      return { error: null };
    }

    console.warn('[Auth] Custom login failed: No matching user found or wrong password');
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
