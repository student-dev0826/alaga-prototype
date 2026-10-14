export function authErrorMessage(error: unknown, fallback: string) {
  const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : null;
  if (code === 'invalid_credentials' || code === 'invalid_login_credentials') return 'Email or password is incorrect. Please check both and try again.';
  if (code === 'email_not_confirmed') return 'Confirm your email address using the link we sent before signing in.';
  if (code === 'over_request_rate_limit' || code === 'over_email_send_rate_limit') return 'Too many attempts. Please wait a few minutes before trying again.';
  if (code === 'weak_password') return 'Choose a stronger password and try again.';
  return fallback;
}
