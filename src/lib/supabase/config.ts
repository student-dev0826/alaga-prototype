import { parseSupabaseConfiguration } from './validation';
export { parseSupabaseConfiguration } from './validation';
export const supabaseConfiguration = parseSupabaseConfiguration(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
