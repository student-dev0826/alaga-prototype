import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';

const projectFolder = fileURLToPath(new URL('../', import.meta.url));
const plainFolder = fileURLToPath(new URL('./', import.meta.url));

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, projectFolder, 'VITE_'), ...process.env };
  const url = env.VITE_SUPABASE_URL || '';
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

  // Stop before bundling if someone accidentally supplies a privileged key.
  if (url || key) {
    const address = new URL(url);
    const local = ['localhost', '127.0.0.1'].includes(address.hostname);
    let publicKey = key.startsWith('sb_publishable_');
    try { publicKey ||= JSON.parse(atob(key.split('.')[1])).role === 'anon'; } catch { /* Not a legacy key. */ }
    if (!publicKey || address.username || address.password || address.search || address.hash || address.pathname !== '/' || (address.protocol !== 'https:' && !(local && address.protocol === 'http:'))) {
      throw new Error('Use only the Supabase project URL and public publishable/anon key.');
    }
  }

  return {
    root: plainFolder,
    envDir: projectFolder,
    server: { host: '127.0.0.1', port: 5173, strictPort: true },
    preview: { host: '127.0.0.1', port: 5173, strictPort: true },
    build: { outDir: '../plain-dist', emptyOutDir: true },
  };
});
