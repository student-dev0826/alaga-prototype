import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Auth from '../src/routes/Auth';
import ResidentGate from '../src/features/auth/ResidentGate';
const api = vi.hoisted(() => ({ signInWithPassword: vi.fn(), signUp: vi.fn(), resetPasswordForEmail: vi.fn(), updateUser: vi.fn() }));
vi.mock('../src/lib/supabase/client', () => ({ getSupabase: async () => ({ auth: api }) }));
vi.mock('../src/features/auth/AuthProvider', () => ({ useAuth: () => ({ status: 'ready', user: null, recovery: false }) }));
beforeEach(() => vi.clearAllMocks());
function renderAuth(mode: 'login' | 'register' | 'recover' | 'update-password' | 'password-updated') {
  render(<MemoryRouter initialEntries={['/auth']}><Routes><Route path="/auth" element={<Auth mode={mode} />} /><Route path="/profile" element={<h1>Private Profile</h1>} /></Routes></MemoryRouter>);
}
describe('resident authentication UI with explicit provider mocks', () => {
  it('validates input without contacting the provider', async () => {
    renderAuth('register');
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'invalid' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'short' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument();
    expect(screen.getByText('Use at least 12 characters. Never share your password.')).toBeInTheDocument();
    expect(api.signUp).not.toHaveBeenCalled();
  });
  it('keeps rejected sign-in on the login form and shows recovery guidance', async () => {
    api.signInWithPassword.mockResolvedValue({ data: { session: null }, error: { code: 'invalid_credentials', message: 'DEMO sensitive provider detail' } });
    renderAuth('login');
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'resident@example.test' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'DEMO-password' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('Email or password is incorrect. Please check both and try again.')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Private Profile' })).not.toBeInTheDocument();
    expect(screen.queryByText('DEMO sensitive provider detail')).not.toBeInTheDocument();
  });
  it('does not imply signed-in success when registration requires email confirmation', async () => {
    api.signUp.mockResolvedValue({ data: { session: null }, error: null });
    renderAuth('register');
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'resident@example.test' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'DEMO-strong-password' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByText(/Check your email for a confirmation link/)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Private Profile' })).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText('Password')).toHaveValue(''));
  });
  it('protects private content when signed out', () => {
    render(<MemoryRouter><ResidentGate><p>DEMO private record</p></ResidentGate></MemoryRouter>);
    expect(screen.queryByText('DEMO private record')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/auth/login');
  });
  it('refuses a password reset without a recovery session and avoids direct-route success claims', () => {
    renderAuth('update-password');
    expect(screen.getByRole('heading', { name: 'Open your recovery link first' })).toBeInTheDocument();
    expect(api.updateUser).not.toHaveBeenCalled();
  });
});
