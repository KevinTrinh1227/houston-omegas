'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';

export interface AuthMember {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'president' | 'vpi' | 'vpx' | 'treasurer' | 'secretary' | 'junior_active' | 'active' | 'alumni' | 'inactive';
  chair_position: 'recruitment' | 'alumni' | 'social' | 'social_media' | 'brotherhood' | null;
  phone: string | null;
  class_year: string | null;
  major: string | null;
  instagram: string | null;
  discord_id: string | null;
  avatar_url: string | null;
  created_at: string;
  last_login_at: string | null;
  needs_phone: boolean;
  needs_onboarding: boolean;
}

interface AuthContextType {
  member: AuthMember | null;
  loading: boolean;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  member: null,
  loading: true,
  logout: async () => {},
  refresh: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [member, setMember] = useState<AuthMember | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const lastLoggedPath = useRef<string>('');

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMember(data);
      } else {
        setMember(null);
      }
    } catch {
      setMember(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Log page views for analytics
  useEffect(() => {
    if (!member || !pathname || pathname === lastLoggedPath.current) return;
    lastLoggedPath.current = pathname;
    fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'page_view', page: pathname }),
    }).catch(() => {});
  }, [member, pathname]);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // Ignore
    }
    setMember(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ member, loading, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}
