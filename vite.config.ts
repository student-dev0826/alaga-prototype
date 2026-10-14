import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';
import { parseSupabaseConfiguration } from './src/lib/supabase/validation.ts';

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), 'VITE_'), ...process.env };
  if (parseSupabaseConfiguration(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY).status === 'invalid') {
    throw new Error('Invalid Supabase browser configuration. Use a project URL and public publishable/anon key only.');
  }
  return {
    plugins: [react(), tailwindcss()],
    test: { environment: 'jsdom', setupFiles: ['./tests/setup.ts'], include: ['tests/**/*.test.{ts,tsx}'] },
  };
});
