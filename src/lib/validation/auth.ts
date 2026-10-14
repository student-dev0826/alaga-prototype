import { z } from 'zod';
export const loginSchema = z.object({ email: z.string().trim().email('Enter a valid email address.').max(254), password: z.string().min(1, 'Enter your password.').max(128, 'Password is too long.') });
export const registrationSchema = loginSchema.extend({ password: z.string().min(12, 'Use at least 12 characters.').max(128, 'Use no more than 128 characters.') });
export const recoverySchema = z.object({ email: loginSchema.shape.email });
export const passwordSchema = z.object({ password: registrationSchema.shape.password, confirmPassword: z.string() }).refine(value => value.password === value.confirmPassword, { path: ['confirmPassword'], message: 'Passwords must match.' });
export const profileSchema = z.object({ display_name: z.string().trim().min(1, 'Enter a name.').max(100, 'Use no more than 100 characters.') });
