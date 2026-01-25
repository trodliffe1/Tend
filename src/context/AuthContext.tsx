import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AuthContextType, AuthState } from '../types/auth';
import { getAuthErrorMessage } from '../utils/authErrors';

const initialState: AuthState = {
  user: null,
  session: null,
  loading: false,
  initialized: false,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setState({
          user: session?.user ?? null,
          session,
          loading: false,
          initialized: true,
        });
      } catch (error) {
        console.error('Error getting session:', error);
        setState(prev => ({ ...prev, initialized: true }));
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setState(prev => ({
          ...prev,
          user: session?.user ?? null,
          session,
          loading: false,
        }));
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { error: getAuthErrorMessage(error) };
      }

      return { error: null };
    } catch (error) {
      return { error: getAuthErrorMessage(error) };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: getAuthErrorMessage(error) };
      }

      return { error: null };
    } catch (error) {
      return { error: getAuthErrorMessage(error) };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        return { error: getAuthErrorMessage(error) };
      }

      return { error: null };
    } catch (error) {
      return { error: getAuthErrorMessage(error) };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const deleteAccount = useCallback(async () => {
    try {
      console.log('Calling delete-user-account function...');

      const { data, error } = await supabase.functions.invoke('delete-user-account', {
        method: 'POST',
      });

      console.log('Response data:', data);
      console.log('Response error:', error);

      if (error) {
        // Try to get more details from the error
        console.log('Error name:', error.name);
        console.log('Error context:', (error as any).context);

        // If it's a FunctionsHttpError, try to get the response body
        if (error.name === 'FunctionsHttpError') {
          const errorData = await (error as any).context?.json?.();
          console.log('Error response body:', errorData);
          return { error: errorData?.error || error.message || 'Failed to delete account' };
        }

        return { error: error.message || 'Failed to delete account' };
      }

      if (data?.error) {
        return { error: data.error };
      }

      // Sign out locally after successful deletion
      await supabase.auth.signOut();
      return { error: null };
    } catch (error: any) {
      console.error('Delete account error:', error);
      return { error: `Failed to delete account: ${error.message}` };
    }
  }, []);

  const value: AuthContextType = {
    ...state,
    signUp,
    signIn,
    signOut,
    resetPassword,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
