import { describe, it, expect } from 'vitest';
import { parseSupabaseConfiguration } from '../src/lib/supabase/config';
import { registrationSchema, loginSchema, passwordSchema } from '../src/lib/validation/auth';
import { authErrorMessage } from '../src/features/auth/errors';
describe('browser configuration and credential validation', () => {
  it('fails closed for missing, partial or privileged configuration', () => {
    expect(parseSupabaseConfiguration().status).toBe('unconfigured');
    expect(parseSupabaseConfiguration('https://demo.supabase.co').status).toBe('invalid');
    expect(parseSupabaseConfiguration('https://demo.supabase.co', 'sb_secret_DEMO_VALUE_NEVER_REAL').status).toBe('invalid');
    const token = `demo.${btoa(JSON.stringify({ role: 'service_role' }))}.demo`;
    expect(parseSupabaseConfiguration('https://demo.supabase.co', token).status).toBe('invalid');
  });
  it('accepts public keys but refuses unsafe URL configurations', () => {
    const key = 'sb_publishable_DEMO_TEST_VALUE_ONLY';
    expect(parseSupabaseConfiguration('https://demo.supabase.co', key).status).toBe('ready');
    expect(parseSupabaseConfiguration('http://demo.supabase.co', key).status).toBe('invalid');
    expect(parseSupabaseConfiguration('https://name:secret@demo.supabase.co', key).status).toBe('invalid');
    expect(parseSupabaseConfiguration('https://demo.supabase.co/?secret=value', key).status).toBe('invalid');
    expect(parseSupabaseConfiguration('http://127.0.0.1:54321', key).status).toBe('ready');
  });
  it('allows existing passwords on login but validates stronger new passwords and confirmation', () => {
    expect(loginSchema.safeParse({ email: 'resident@example.test', password: 'existing' }).success).toBe(true);
    expect(registrationSchema.safeParse({ email: 'resident@example.test', password: 'short' }).success).toBe(false);
    expect(passwordSchema.safeParse({ password: 'DEMO-long-password', confirmPassword: 'different' }).success).toBe(false);
  });
  it('never exposes raw provider messages or secrets in UI errors', () => {
    expect(authErrorMessage({ message: 'secret-token-value' }, 'Please try again.')).toBe('Please try again.');
    expect(authErrorMessage({ code: 'email_not_confirmed' }, 'Fallback')).toContain('Confirm your email');
  });
});
