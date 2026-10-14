import { expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ResidentProfile from '../src/features/profile/ResidentProfile';
const fixture = vi.hoisted(() => ({ profile: { id: 'DEMO-alice', display_name: 'DEMO Resident', created_at: '2026-10-14T00:00:00Z', updated_at: '2026-10-14T00:00:00Z' }, save: vi.fn() }));
vi.mock('../src/features/auth/AuthProvider', () => ({ useAuth: () => ({ status: 'ready', user: { id: 'DEMO-alice', email: 'resident@example.test' }, recovery: false }) }));
vi.mock('../src/lib/supabase/client', () => ({ getSupabase: async () => ({ from: () => ({
  select: () => ({ eq: () => ({ abortSignal: () => ({ single: async () => ({ data: fixture.profile, error: null }) }) }) }),
  update: () => ({ eq: () => ({ select: () => ({ single: fixture.save }) }) }),
}) }) }));
it('does not restore private profile cache when a pending save completes after logout', async () => {
  let finish: (value: unknown) => void = () => {};
  fixture.save.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  const cache = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const setData = vi.spyOn(cache, 'setQueryData');
  const view = render(<QueryClientProvider client={cache}><ResidentProfile /></QueryClientProvider>);
  await screen.findByLabelText('Display name');
  fireEvent.change(screen.getByLabelText('Display name'), { target: { value: 'DEMO Edited' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save profile' }));
  await waitFor(() => expect(fixture.save).toHaveBeenCalledOnce());
  view.unmount(); cache.clear();
  await act(async () => { finish({ data: { ...fixture.profile, display_name: 'DEMO Edited' }, error: null }); await new Promise(resolve => setTimeout(resolve, 20)); });
  expect(setData).not.toHaveBeenCalled();
  expect(cache.getQueryData(['private', 'profile', 'DEMO-alice'])).toBeUndefined();
});
