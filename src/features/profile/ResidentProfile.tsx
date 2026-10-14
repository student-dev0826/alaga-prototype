import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { useAuth } from '../auth/AuthProvider';
import { getSupabase } from '../../lib/supabase/client';
import { profileSchema } from '../../lib/validation/auth';
import Skeleton from '../../components/Skeleton';

export default function ResidentProfile() {
  const { user } = useAuth(); const cache = useQueryClient();
  const [signOutError, setSignOutError] = useState(''); const [signingOut, setSigningOut] = useState(false);
  const queryKey = ['private', 'profile', user?.id];
  const profile = useQuery({ queryKey, enabled: !!user, queryFn: async ({ signal }) => {
    const client = await getSupabase(); const { data, error } = await client.from('profiles').select('id, display_name, created_at, updated_at').eq('id', user!.id).abortSignal(signal).single();
    if (error) throw new Error('Profile unavailable'); return data;
  } });
  const form = useForm<z.infer<typeof profileSchema>>({ resolver: zodResolver(profileSchema) });
  const save = useMutation({ mutationFn: async (values: z.infer<typeof profileSchema>) => {
    const client = await getSupabase(); const { data, error } = await client.from('profiles').update(values).eq('id', user!.id).select('id, display_name, created_at, updated_at').single();
    if (error) throw new Error('Profile update failed'); return data;
  }, onSuccess: data => {
    // A late mutation must not recreate a private cache entry cleared by logout.
    if (!cache.getQueryState(queryKey)) return;
    cache.setQueryData(queryKey, data); form.reset({ display_name: data.display_name ?? '' });
  } });
  if (profile.isPending) return <Skeleton kind="profile" />;
  if (profile.isError) return <div role="alert"><p>Your profile could not load. Please try again.</p><button className="button mt-4" onClick={() => void profile.refetch()}>Try again</button></div>;
  return <>
    <h2 className="mb-3">{profile.data.display_name ? `Welcome, ${profile.data.display_name}` : 'Welcome, resident'}</h2>
    <p className="muted break-words mb-5">Signed in as {user?.email}</p>
    <form noValidate onSubmit={form.handleSubmit(values => { save.mutate(values); })}>
      <label htmlFor="display-name" className="field-label">Display name</label>
      <input id="display-name" className="input" defaultValue={profile.data.display_name ?? ''} autoComplete="nickname" {...form.register('display_name')} aria-invalid={!!form.formState.errors.display_name} aria-describedby="display-name-error" />
      <p id="display-name-error" className="field-error">{form.formState.errors.display_name?.message}</p>
      <button className="button" disabled={save.isPending}>{save.isPending ? 'Saving…' : 'Save profile'}</button>
      <p role="status" className="mt-3">{save.isSuccess ? 'Your profile has been saved.' : ''}</p>
      <p role="alert" className="form-error">{save.isError ? 'Your profile was not saved. Check your connection and try again.' : ''}</p>
    </form>
    <button className="button secondary mt-5" disabled={signingOut} onClick={async () => {
      setSigningOut(true); setSignOutError('');
      try { const client = await getSupabase(); const { error } = await client.auth.signOut({ scope: 'local' }); if (error) throw error; }
      catch { setSignOutError('We could not sign you out. Try again.'); }
      finally { setSigningOut(false); }
    }}>{signingOut ? 'Signing out…' : 'Sign out of this browser'}</button><p role="alert" className="form-error mt-3">{signOutError}</p>
  </>;
}
