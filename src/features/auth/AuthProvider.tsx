import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabase } from '../../lib/supabase/client';
import { supabaseConfiguration } from '../../lib/supabase/config';
import { queryClient } from '../../lib/queryClient';
interface AuthState { status: 'unconfigured' | 'invalid' | 'loading' | 'ready' | 'error'; user: User | null; recovery: boolean }
const initial: AuthState = { status: supabaseConfiguration.status === 'ready' ? 'loading' : supabaseConfiguration.status, user: null, recovery: false };
const Context = createContext<AuthState>(initial);
export function useAuth() { return useContext(Context); }
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initial);
  useEffect(() => {
    if (supabaseConfiguration.status !== 'ready') return;
    let active = true; let revision = 0; let unsubscribe: (() => void) | undefined;
    let owner: string | undefined;
    const timeout = window.setTimeout(() => { if (active) setState({ status: 'error', user: null, recovery: false }); }, 12_000);
    const apply = (user: User | null, recovery?: boolean) => {
      if (!active) return;
      window.clearTimeout(timeout);
      if (owner !== user?.id) { queryClient.clear(); owner = user?.id; }
      setState(previous => ({ status: 'ready', user, recovery: user ? recovery ?? previous.recovery : false }));
    };
    void getSupabase().then(async client => {
      if (!active) return;
      const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
        revision += 1;
        apply(session?.user ?? null, event === 'PASSWORD_RECOVERY' ? true : undefined);
      });
      unsubscribe = () => subscription.unsubscribe();
      const started = revision;
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      if (revision === started) apply(data.session?.user ?? null);
    }).catch(() => { if (active) { window.clearTimeout(timeout); queryClient.clear(); setState({ status: 'error', user: null, recovery: false }); } });
    return () => { active = false; window.clearTimeout(timeout); unsubscribe?.(); };
  }, []);
  return <Context.Provider value={state}>{children}</Context.Provider>;
}
