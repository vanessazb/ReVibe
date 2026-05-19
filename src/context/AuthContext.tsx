import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

const DEMO_PROFILES: Record<string, Profile> = {
  'comprador@revibe.co': {
    id: 'demo-buyer', email: 'comprador@revibe.co', full_name: 'Santiago Rodríguez',
    phone: '+57 310 111 2233', city: 'Bogotá', role: 'buyer',
    avatar_url: null, bio: null, created_at: '', updated_at: '',
  },
  'vendedor@revibe.co': {
    id: 'demo-seller', email: 'vendedor@revibe.co', full_name: 'Valentina Morales',
    phone: '+57 300 123 4567', city: 'Medellín', role: 'seller',
    avatar_url: null, bio: 'Apasionada por la moda sostenible.', created_at: '', updated_at: '',
  },
  'admin@revibe.co': {
    id: 'demo-admin', email: 'admin@revibe.co', full_name: 'Admin ReVibe',
    phone: null, city: 'Medellín', role: 'admin',
    avatar_url: null, bio: null, created_at: '', updated_at: '',
  },
};

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInDemo: (email: string) => void;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: 'buyer' | 'seller'
  ) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const DEMO_USER_KEY = 'revibe_demo_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      setProfile(data);
    } catch {
      // ignore in demo mode
    }
  };

  useEffect(() => {
    // Restore demo session from localStorage
    const savedDemo = localStorage.getItem(DEMO_USER_KEY);
    if (savedDemo) {
      const demoProfile = DEMO_PROFILES[savedDemo];
      if (demoProfile) {
        setProfile(demoProfile);
        setUser({ id: demoProfile.id, email: demoProfile.email } as User);
        setLoading(false);
        return;
      }
    }

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) fetchProfile(session.user.id);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInDemo = (email: string) => {
    const demoProfile = DEMO_PROFILES[email];
    if (!demoProfile) throw new Error('Usuario demo no encontrado');
    localStorage.setItem(DEMO_USER_KEY, email);
    setProfile(demoProfile);
    setUser({ id: demoProfile.id, email: demoProfile.email } as User);
  };

  const signIn = async (email: string, password: string) => {
    // Demo mode shortcut
    if (DEMO_PROFILES[email]) {
      signInDemo(email);
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: 'buyer' | 'seller'
  ) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        email,
        full_name: fullName,
        role,
      });
    }
  };

  const signOut = async () => {
    localStorage.removeItem(DEMO_USER_KEY);
    setUser(null);
    setProfile(null);
    await supabase.auth.signOut().catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signInDemo, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
