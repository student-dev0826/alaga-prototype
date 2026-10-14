import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageTitle from '../components/PageTitle';
import { useAuth } from '../features/auth/AuthProvider';
export default function AuthCallback() {
  const auth = useAuth(); const navigate = useNavigate();
  useEffect(() => {
    if (auth.status === 'loading') return;
    // Remove one-time codes from browser history after SDK initialization.
    window.history.replaceState(window.history.state, '', window.location.pathname);
    if (auth.status === 'ready' && auth.user) navigate(auth.recovery ? '/auth/update-password' : '/profile', { replace: true });
  }, [auth.status, auth.user, auth.recovery, navigate]);
  return <div className="page"><PageTitle>Account Verification</PageTitle><section className="panel">
    {auth.status === 'loading' ? <p role="status">Checking your account link…</p> : <><p role="alert">This link could not be verified. It may have expired or was opened in another browser.</p><Link className="button mt-5" to="/auth/login">Return to sign in</Link></>}
  </section></div>;
}
