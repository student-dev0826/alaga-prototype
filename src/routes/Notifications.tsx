import PageTitle from '../components/PageTitle';
import EmptyState from '../components/EmptyState';
import ResidentGate from '../features/auth/ResidentGate';
import { useAuth } from '../features/auth/AuthProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { getSupabase } from '../lib/supabase/client';
import Skeleton from '../components/Skeleton';
function ResidentNotifications() {
  const { user } = useAuth(); const cache = useQueryClient(); const [page, setPage] = useState(0);
  const queryKey = ['private', 'notifications', user?.id, page];
  const notifications = useQuery({ queryKey, enabled: !!user, queryFn: async ({ signal }) => {
    const client = await getSupabase(); const { data, error } = await client.from('notifications').select('id, user_id, title, message, read_at, created_at').eq('user_id', user!.id).order('created_at', { ascending: false }).order('id').range(page * 20, page * 20 + 19).abortSignal(signal);
    if (error) throw new Error('Notifications unavailable'); return data;
  } });
  const read = useMutation({ mutationFn: async (id: string) => {
    const client = await getSupabase(); const { error } = await client.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id).eq('user_id', user!.id).select('id').single();
    if (error) throw new Error('Notification update failed');
  }, onSuccess: () => cache.invalidateQueries({ queryKey: ['private', 'notifications', user?.id] }) });
  if (notifications.isPending) return <Skeleton kind="appointments" />;
  if (notifications.isError) return <div role="alert"><p>Notifications could not load.</p><button className="button mt-4" onClick={() => void notifications.refetch()}>Try again</button></div>;
  return <>
    {notifications.data.length === 0 ? <EmptyState title="No notifications to show"><p>Appointment updates and reminders will appear here when available.</p></EmptyState> : <ul className="space-y-4">{notifications.data.map(item => <li className="panel" key={item.id}>
      <div className="section-heading"><h2>{item.title}</h2><span>{item.read_at ? 'Read' : 'Unread'}</span></div>
      <p>{item.message}</p><p className="muted my-3">{new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Manila' }).format(new Date(item.created_at))}</p>
      {!item.read_at && <button className="button secondary" disabled={read.isPending} onClick={() => read.mutate(item.id)}>Mark as read</button>}
    </li>)}</ul>}
    <div className="flex flex-wrap gap-3 mt-5"><button className="button secondary" disabled={page === 0} onClick={() => setPage(value => value - 1)}>Previous</button><button className="button secondary" disabled={notifications.data.length < 20} onClick={() => setPage(value => value + 1)}>Next</button></div>
    <p role="alert" className="form-error mt-3">{read.isError ? 'The notification could not be updated. Please try again.' : ''}</p>
  </>;
}
export default function Notifications() {
  return <div className="page"><PageTitle>Notifications</PageTitle><section className="panel"><ResidentGate><ResidentNotifications /></ResidentGate></section></div>;
}
