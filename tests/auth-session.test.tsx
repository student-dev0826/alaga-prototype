import { beforeEach, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import AuthProvider, { useAuth } from '../src/features/auth/AuthProvider';
import { queryClient } from '../src/lib/queryClient';
const mock = vi.hoisted(() => ({ onAuthStateChange: vi.fn(), getSession: vi.fn(), unsubscribe: vi.fn() }));
vi.mock('../src/lib/supabase/config', () => ({ supabaseConfiguration: { status: 'ready', url: 'https://demo.supabase.co', key: 'DEMO_PUBLIC_ONLY' } }));
vi.mock('../src/lib/supabase/client', () => ({ getSupabase: async () => ({ auth: mock }) }));
function Consumer() { const auth = useAuth(); return <div>{auth.user?.id ?? auth.status}</div>; }
beforeEach(() => { vi.clearAllMocks(); queryClient.clear(); });
it('clears private cached data when accounts change or sign out and cleans up listeners', async () => {
  let emit: (event: string, session: { user: { id: string } } | null) => void = () => {};
  mock.onAuthStateChange.mockImplementation(callback => { emit = callback; return { data: { subscription: { unsubscribe: mock.unsubscribe } } }; });
  mock.getSession.mockResolvedValue({ data: { session: { user: { id: 'DEMO-alice' } } }, error: null });
  const view = render(<AuthProvider><Consumer /></AuthProvider>);
  await screen.findByText('DEMO-alice');
  queryClient.setQueryData(['private', 'profile', 'DEMO-alice'], 'DEMO_PRIVATE_DATA');
  act(() => emit('SIGNED_IN', { user: { id: 'DEMO-bob' } }));
  await waitFor(() => expect(queryClient.getQueryData(['private', 'profile', 'DEMO-alice'])).toBeUndefined());
  queryClient.setQueryData(['private', 'profile', 'DEMO-bob'], 'DEMO_PRIVATE_DATA');
  act(() => emit('SIGNED_OUT', null));
  expect(queryClient.getQueryData(['private', 'profile', 'DEMO-bob'])).toBeUndefined();
  expect(screen.getByText('ready')).toBeInTheDocument();
  view.unmount(); expect(mock.unsubscribe).toHaveBeenCalledOnce();
});
