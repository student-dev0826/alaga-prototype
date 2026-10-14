import { useEffect, useRef, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { HeartIcon, HomeIcon, MapPinIcon, CalendarIcon, BookOpenIcon, UserIcon, BellIcon, SettingsIcon, HelpIcon } from './icons';
import SearchForm from '../features/search/SearchForm';
const navigation = [
  { to: '/', label: 'Dashboard', mobile: 'Home', Icon: HomeIcon },
  { to: '/health-centers', label: 'Health Centers', mobile: 'Centers', Icon: MapPinIcon },
  { to: '/appointments', label: 'Appointments', mobile: 'Appts', Icon: CalendarIcon },
  { to: '/health-guide', label: 'Health Guide', mobile: 'Guide', Icon: BookOpenIcon },
  { to: '/profile', label: 'Profile', mobile: 'Profile', Icon: UserIcon },
];
export default function Shell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const scrollContainer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollContainer.current?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return <>
    <a href="#main-content" className="skip-link">Skip to content</a>
    <div className="app-shell" ref={scrollContainer}>
      <aside className="sidebar">
        <Link to="/" className="brand" aria-label="ALAGA home"><span className="brand-icon"><HeartIcon size={20} /></span>
          <span><strong>ALAGA</strong><span className="brand-subtitle">Healthcare Platform</span></span></Link>
        <nav aria-label="Main navigation" className="side-nav">
          {navigation.map(({ to, label, Icon }) => <NavLink key={to} to={to} end={to === '/'} className="nav-link"><Icon size={20} />{label}</NavLink>)}
          <NavLink to="/notifications" className="nav-link"><BellIcon size={20} />Notifications</NavLink>
        </nav>
        <nav aria-label="Support and settings" className="side-nav border-t border-gray-200">
          <NavLink to="/accessibility" className="nav-link"><SettingsIcon size={20} />Settings</NavLink>
          <NavLink to="/help" className="nav-link"><HelpIcon size={20} />Help & Support</NavLink>
        </nav>
      </aside>
      <div className="main-column">
        <header className="topbar">
          <Link to="/" className="mobile-brand"><span className="brand-icon"><HeartIcon size={20} /></span><strong>ALAGA</strong></Link>
          <div className="header-search"><SearchForm compact /></div>
          <div className="flex items-center gap-2 ml-auto">
            <Link to="/notifications" className="icon-button" aria-label="Notifications"><BellIcon size={22} /></Link>
            <Link to="/profile" className="icon-button" aria-label="Resident profile"><UserIcon size={22} /></Link>
            <Link to="/help" className="icon-button" aria-label="Help and support"><HelpIcon size={22} /></Link>
          </div>
        </header>
        <div className="foundation-notice">Service information and online booking are not yet available.</div>
        <main id="main-content" tabIndex={-1}>{children}</main>
        <footer>ALAGA · Accessible Local Appointment and Guide App <span>Philippines · Asia/Manila</span></footer>
      </div>
    </div>
    <nav aria-label="Mobile navigation" className="bottom-nav">
      {navigation.map(({ to, label, mobile, Icon }) => <NavLink key={to} to={to} end={to === '/'} aria-label={label} className="bottom-link"><Icon size={22} /><span>{mobile}</span></NavLink>)}
    </nav>
  </>;
}
