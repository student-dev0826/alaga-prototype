import { loadEnv } from 'vite';
import { createClient } from '@supabase/supabase-js';
const env = { ...loadEnv('production', process.cwd(), 'VITE_'), ...process.env };
if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_PUBLISHABLE_KEY?.startsWith('sb_publishable_')) throw new Error('Public configuration is missing or invalid.');
const client = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
const { data, error, status } = await client.from('facilities').select('id').limit(1).abortSignal(AbortSignal.timeout(15_000));
const privateResult = await client.from('profiles').select('id').limit(1).abortSignal(AbortSignal.timeout(15_000));
console.log(JSON.stringify({ status, reachable: status > 0, facilitiesSchemaReadable: !error, returnedRows: data?.length ?? 0, errorCode: error?.code ?? null, anonymousProfileReadDenied: privateResult.error?.code === '42501' }));
