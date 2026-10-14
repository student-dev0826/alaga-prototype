import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import EmptyState from '../../components/EmptyState';
import Skeleton from '../../components/Skeleton';
export default function ResidentGate({ children }: { children: ReactNode }) {
  const auth = useAuth();
  if (auth.status === 'loading') return <Skeleton kind="profile" />;
  if (auth.status === 'error') return <div role="alert"><p>We could not check your sign-in. Reload to try again.</p><button className="button mt-4" onClick={() => window.location.reload()}>Try again</button></div>;
  if (auth.status !== 'ready') return <EmptyState title="Resident sign-in is not yet available"><p>Account services are being prepared. Public browsing and accessibility settings remain available.</p></EmptyState>;
  if (!auth.user) return <EmptyState title="Sign in to continue" action={<Link className="button" to="/auth/login">Sign in</Link>}><p>Your personal information is available only to your signed-in account.</p></EmptyState>;
  return <>{children}</>;
}
