import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import PageTitle from '../components/PageTitle';
import EmptyState from '../components/EmptyState';
import Skeleton from '../components/Skeleton';
import { useAuth } from '../features/auth/AuthProvider';
import { getSupabase } from '../lib/supabase/client';
import { authErrorMessage } from '../features/auth/errors';
import { loginSchema, registrationSchema, recoverySchema, passwordSchema } from '../lib/validation/auth';

function Messages({ error, message }: { error: string; message: string }) {
  return <><div role="alert" className={error ? 'form-error mb-4' : ''}>{error}</div><div role="status" className={message ? 'form-message mb-4' : ''}>{message}</div></>;
}
function Credentials({ registerAccount }: { registerAccount: boolean }) {
  const navigate = useNavigate();
  const [error, setError] = useState(''); const [message, setMessage] = useState('');
  const form = useForm<z.infer<typeof loginSchema>>({ resolver: zodResolver(registerAccount ? registrationSchema : loginSchema) });
  const submit = form.handleSubmit(async values => {
    setError(''); setMessage('');
    try {
      const client = await getSupabase();
      const result = registerAccount
        ? await client.auth.signUp({ ...values, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } })
        : await client.auth.signInWithPassword(values);
      if (result.error) throw result.error;
      form.reset();
      if (result.data.session) navigate('/profile', { replace: true });
      else setMessage('Check your email for a confirmation link. If your address is already registered, sign in or use password recovery.');
    } catch (cause) { setError(authErrorMessage(cause, registerAccount ? 'We could not create your account. Check your details and try again.' : 'We could not sign you in. Check your connection and try again.')); }
  });
  return <form onSubmit={submit} noValidate className="auth-form">
    <Messages error={error} message={message} />
    <label className="field-label" htmlFor="auth-email">Email address</label>
    <input className="input" id="auth-email" type="email" autoComplete="email" {...form.register('email')} aria-invalid={!!form.formState.errors.email} aria-describedby="email-error" />
    <p className="field-error" id="email-error">{form.formState.errors.email?.message}</p>
    <label className="field-label" htmlFor="auth-password">Password</label>
    <input className="input" id="auth-password" type="password" autoComplete={registerAccount ? 'new-password' : 'current-password'} {...form.register('password')} aria-invalid={!!form.formState.errors.password} aria-describedby="password-error password-hint" />
    <p id="password-hint" className="muted mt-2">{registerAccount ? 'Use at least 12 characters. Never share your password.' : 'Enter the password for your ALAGA account.'}</p>
    <p className="field-error" id="password-error">{form.formState.errors.password?.message}</p>
    <button className="button w-full" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? 'Please wait…' : registerAccount ? 'Create account' : 'Sign in'}</button>
    <div className="auth-links"><Link to={registerAccount ? '/auth/login' : '/auth/register'}>{registerAccount ? 'Already registered? Sign in' : 'Create a resident account'}</Link><Link to="/auth/recover">Forgot your password?</Link></div>
  </form>;
}
function Recovery() {
  const [error, setError] = useState(''); const [message, setMessage] = useState('');
  const form = useForm<z.infer<typeof recoverySchema>>({ resolver: zodResolver(recoverySchema) });
  return <form noValidate className="auth-form" onSubmit={form.handleSubmit(async values => {
    setError(''); setMessage('');
    try {
      const client = await getSupabase();
      const { error } = await client.auth.resetPasswordForEmail(values.email, { redirectTo: `${window.location.origin}/auth/callback` });
      if (error) throw error;
      form.reset(); setMessage('If this address has an account, a recovery link will arrive by email. Open it in this same browser.');
    } catch (cause) { setError(authErrorMessage(cause, 'We could not send the recovery request. Check your connection and try again.')); }
  })}>
    <Messages error={error} message={message} />
    <p className="muted mb-5">Enter your account email address. The recovery link must be opened in this browser.</p>
    <label className="field-label" htmlFor="recovery-email">Email address</label>
    <input id="recovery-email" className="input" type="email" autoComplete="email" {...form.register('email')} aria-invalid={!!form.formState.errors.email} aria-describedby="recovery-email-error" />
    <p className="field-error" id="recovery-email-error">{form.formState.errors.email?.message}</p>
    <button className="button w-full" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? 'Sending…' : 'Send recovery link'}</button>
    <Link to="/auth/login" className="inline-flex items-center min-h-11 mt-4">Back to sign in</Link>
  </form>;
}
function UpdatePassword() {
  const navigate = useNavigate(); const auth = useAuth();
  const [error, setError] = useState('');
  const form = useForm<z.infer<typeof passwordSchema>>({ resolver: zodResolver(passwordSchema) });
  if (!auth.recovery || !auth.user) return <EmptyState title="Open your recovery link first" action={<Link to="/auth/recover" className="button">Request a new link</Link>}><p>The recovery link may have expired or was opened in another browser.</p></EmptyState>;
  return <form noValidate className="auth-form" onSubmit={form.handleSubmit(async values => {
    setError('');
    try { const client = await getSupabase(); const { error } = await client.auth.updateUser({ password: values.password }); if (error) throw error; form.reset(); navigate('/auth/password-updated', { replace: true, state: { passwordUpdated: true } }); }
    catch (cause) { setError(authErrorMessage(cause, 'We could not change your password. Request a new recovery link and try again.')); }
  })}>
    <Messages error={error} message="" />
    <label className="field-label" htmlFor="new-password">New password</label>
    <input id="new-password" className="input" type="password" autoComplete="new-password" {...form.register('password')} aria-invalid={!!form.formState.errors.password} aria-describedby="new-password-error new-password-hint" />
    <p id="new-password-hint" className="muted mt-2">Use at least 12 characters.</p><p className="field-error" id="new-password-error">{form.formState.errors.password?.message}</p>
    <label className="field-label" htmlFor="confirm-password">Confirm new password</label>
    <input id="confirm-password" className="input" type="password" autoComplete="new-password" {...form.register('confirmPassword')} aria-invalid={!!form.formState.errors.confirmPassword} aria-describedby="confirm-password-error" />
    <p className="field-error" id="confirm-password-error">{form.formState.errors.confirmPassword?.message}</p>
    <button className="button w-full" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? 'Saving…' : 'Save new password'}</button>
  </form>;
}
export default function Auth({ mode }: { mode: 'login' | 'register' | 'recover' | 'update-password' | 'password-updated' }) {
  const auth = useAuth(); const location = useLocation();
  const passwordUpdated = location.state?.passwordUpdated === true;
  const title = { login: 'Resident Sign In', register: 'Create a Resident Account', recover: 'Recover Your Account', 'update-password': 'Choose a New Password', 'password-updated': passwordUpdated ? 'Password Updated' : 'Password Recovery' }[mode];
  return <div className="page"><PageTitle>{title}</PageTitle><section className="panel auth-panel">
    {auth.status === 'loading' ? <Skeleton kind="profile" /> : auth.status !== 'ready' ? <EmptyState title="Resident sign-in is not yet available"><p>Account services could not be connected. Please try again later.</p></EmptyState>
      : mode === 'password-updated' ? <EmptyState title={passwordUpdated ? 'Your password has been saved' : 'Return to your account'} action={<Link className="button" to="/profile">View profile</Link>}><p>{passwordUpdated ? 'Use your new password for your next sign-in.' : 'To change your password, request a recovery link first.'}</p></EmptyState>
      : mode === 'update-password' ? <UpdatePassword />
      : mode === 'recover' ? <Recovery /> : auth.user ? <EmptyState title="You are signed in" action={<Link className="button" to="/profile">View profile</Link>}><p>Your resident account is ready.</p></EmptyState>
      : <Credentials key={mode} registerAccount={mode === 'register'} />}
  </section></div>;
}
