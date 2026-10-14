import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Shell from './components/Shell';
import ErrorBoundary from './components/ErrorBoundary';
import Skeleton from './components/Skeleton';
import PreferencesProvider from './features/accessibility/Preferences';
import SearchProvider from './features/search/SearchContext';
import AuthProvider from './features/auth/AuthProvider';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';

const Home = lazy(() => import('./routes/Home'));
const Directory = lazy(() => import('./routes/Directory'));
const Facility = lazy(() => import('./routes/Facility'));
const Services = lazy(() => import('./routes/Services'));
const Appointments = lazy(() => import('./routes/Appointments'));
const Booking = lazy(() => import('./routes/Booking'));
const Guide = lazy(() => import('./routes/Guide'));
const Notifications = lazy(() => import('./routes/Notifications'));
const Profile = lazy(() => import('./routes/Profile'));
const Help = lazy(() => import('./routes/Help'));
const NotFound = lazy(() => import('./routes/NotFound'));
const Auth = lazy(() => import('./routes/Auth'));
const AuthCallback = lazy(() => import('./routes/AuthCallback'));

export default function App() {
  return <ErrorBoundary><QueryClientProvider client={queryClient}><AuthProvider><PreferencesProvider><BrowserRouter><SearchProvider><Shell>
    <Suspense fallback={<Skeleton kind="page" />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Directory search />} />
        <Route path="/health-centers" element={<Directory />} />
        <Route path="/health-centers/:id" element={<Facility />} />
        <Route path="/services" element={<Services />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/appointments/:id" element={<Appointments detail />} />
        <Route path="/book" element={<Booking />} />
        <Route path="/health-guide" element={<Guide />} />
        <Route path="/health-guide/:id" element={<Guide article />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/accessibility" element={<Profile accessibilityOnly />} />
        <Route path="/help" element={<Help />} />
        <Route path="/auth/login" element={<Auth mode="login" />} />
        <Route path="/auth/register" element={<Auth mode="register" />} />
        <Route path="/auth/recover" element={<Auth mode="recover" />} />
        <Route path="/auth/update-password" element={<Auth mode="update-password" />} />
        <Route path="/auth/password-updated" element={<Auth mode="password-updated" />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </Shell></SearchProvider></BrowserRouter></PreferencesProvider></AuthProvider></QueryClientProvider></ErrorBoundary>;
}
