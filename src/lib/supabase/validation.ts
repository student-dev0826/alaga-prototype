export type SupabaseConfiguration = { status: 'unconfigured' | 'invalid'; url?: never; key?: never } | { status: 'ready'; url: string; key: string };
export function parseSupabaseConfiguration(urlValue?: string, keyValue?: string): SupabaseConfiguration {
  const url = urlValue?.trim(); const key = keyValue?.trim();
  if (!url && !key) return { status: 'unconfigured' };
  if (!url || !key) return { status: 'invalid' };
  try {
    const parsed = new URL(url);
    const local = ['localhost', '127.0.0.1'].includes(parsed.hostname);
    if ((parsed.protocol !== 'https:' && !(local && parsed.protocol === 'http:')) || parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== '/') return { status: 'invalid' };
    if (key.startsWith('sb_publishable_') && key.length > 20) return { status: 'ready', url: parsed.origin, key };
    // Legacy anon JWT keys remain supported; privileged JWTs are rejected.
    const payload = JSON.parse(atob(key.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/') ?? ''));
    if (payload.role === 'anon' && key.split('.').length === 3) return { status: 'ready', url: parsed.origin, key };
  } catch { /* Never print credential values. */ }
  return { status: 'invalid' };
}
