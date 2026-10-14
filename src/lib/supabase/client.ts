import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { supabaseConfiguration } from './config';
let clientPromise: Promise<SupabaseClient<Database>> | undefined;
export function getSupabase(): Promise<SupabaseClient<Database>> {
  if (supabaseConfiguration.status !== 'ready') return Promise.reject(new Error('Resident services are not configured'));
  const { url, key } = supabaseConfiguration;
  clientPromise ??= import('@supabase/supabase-js').then(({ createClient }) => createClient<Database>(url, key, {
    auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    global: { fetch: (input, options) => fetch(input, { ...options, signal: options?.signal ? AbortSignal.any([options.signal, AbortSignal.timeout(15_000)]) : AbortSignal.timeout(15_000) }) },
  }));
  return clientPromise;
}
