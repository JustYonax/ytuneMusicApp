import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { UserProfile, UserSettings } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'light',
    autoplay: true,
    quality: 'auto'
  });
  const [loading, setLoading] = useState(true);
  const [verificationSent, setVerificationSent] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
        fetchUserSettings(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
        await fetchUserSettings(session.user.id);
      } else {
        setProfile(null);
        setSettings({
          theme: 'light',
          autoplay: true,
          quality: 'auto'
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return;
    }

    setProfile(data);
  };

  const fetchUserSettings = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user settings:', error);
      return;
    }

    if (data) {
      setSettings(data.settings);
    }
  };

  const validatePassword = (password: string): { isValid: boolean; error?: string } => {
    if (password.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters long' };
    }
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one number' };
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one special character (!@#$%^&*)' };
    }
    return { isValid: true };
  };

  const signUp = async (email: string, password: string, username: string) => {
    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.error);
    }

    // Check if username is available
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single();

    if (existingUser) {
      throw new Error('Username is already taken');
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No user data returned');

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          username,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ]);

    if (profileError) {
      // Cleanup: delete the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    // Create default settings
    const { error: settingsError } = await supabase
      .from('user_settings')
      .insert([
        {
          user_id: authData.user.id,
          settings: {
            theme: 'light',
            autoplay: true,
            quality: 'auto'
          }
        }
      ]);

    if (settingsError) {
      console.error('Error creating user settings:', settingsError);
    }

    setVerificationSent(true);
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Please verify your email before signing in');
      }
      throw error;
    }

    if (!data.user?.email_confirmed_at) {
      throw new Error('Please verify your email before signing in');
    }
  };

  const signInWithProvider = async (provider: 'google' | 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) throw error;
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) throw new Error('No user logged in');

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.error);
    }

    // First verify the current password
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (verifyError) {
      throw new Error('Current password is incorrect');
    }

    // Update the password
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');

    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) throw error;
    await fetchUserProfile(user.id);
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) throw new Error('No user logged in');

    const { error } = await supabase
      .from('user_settings')
      .update({
        settings: { ...settings, ...newSettings },
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (error) throw error;
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return {
    user,
    profile,
    settings,
    loading,
    verificationSent,
    signUp,
    signIn,
    signInWithProvider,
    signOut,
    resetPassword,
    updateProfile,
    updatePassword,
    updateSettings,
  };
}