import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

type UserRole = 'student' | 'admin';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Refs to prevent race conditions and track current operation
  const currentFetchIdRef = useRef<number>(0);
  const roleLoadedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    let fetchId = 0;

    const fetchUserRole = async (userId: string, myFetchId: number) => {
      // Check if this fetch is still the current one
      if (myFetchId !== currentFetchIdRef.current) {
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();
        
        // Check again if this fetch is still valid
        if (!isMounted || myFetchId !== currentFetchIdRef.current) {
          return;
        }
        
        if (error) throw error;
        setRole(data?.role as UserRole);
        roleLoadedRef.current = true;
      } catch (error: any) {
        console.error('AuthContext: Error fetching user role:', error);
        // Only set default role if this is still the current fetch
        if (isMounted && myFetchId === currentFetchIdRef.current) {
          setRole('student');
          roleLoadedRef.current = true;
        }
      } finally {
        // Only set loading to false if this is still the current fetch
        if (isMounted && myFetchId === currentFetchIdRef.current) {
          setLoading(false);
        }
      }
    };

    // Safety timeout - only triggers if we haven't loaded the role yet
    const safetyTimeout = setTimeout(() => {
      if (isMounted && !roleLoadedRef.current) {
        setLoading(false);
      }
    }, 10000);

    // Use ONLY onAuthStateChange as the single source of truth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!isMounted) return;
      
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      if (newSession?.user) {
        // Increment fetch ID to cancel any pending fetches
        fetchId = ++currentFetchIdRef.current;
        
        // Only fetch role on meaningful events
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // For INITIAL_SESSION with existing role, skip fetch
          if (event === 'INITIAL_SESSION' && roleLoadedRef.current) {
            setLoading(false);
            return;
          }
          fetchUserRole(newSession.user.id, fetchId);
        } else {
          // For other events, just ensure loading is false
          setLoading(false);
        }
      } else {
        // User signed out - reset everything
        currentFetchIdRef.current++;  // Cancel any pending fetch
        roleLoadedRef.current = false;
        setRole(null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      currentFetchIdRef.current++;  // Cancel any pending fetch
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user,
    role,
    loading,
    isAdmin: role === 'admin',
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
