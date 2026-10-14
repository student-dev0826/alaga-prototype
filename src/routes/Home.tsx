import { Link, useNavigate } from 'react-router-dom';
import PageTitle from '../components/PageTitle';
import EmptyState from '../components/EmptyState';
import { CalendarIcon, MapPinIcon, ActivityIcon, BookOpenIcon, ChevronRightIcon, ServiceIcon } from '../components/icons';
import SearchForm from '../features/search/SearchForm';
import { suggestions, suggestionQueries } from '../features/search/suggestions';
import { useSearch } from '../features/search/SearchContext';
import { categories } from './guideData';
export default function Home() {
  const { setQuery } = useSearch(); const navigate = useNavigate();
  const actions = [
    { to: '/appointments', label: 'Upcoming Appointments', Icon: CalendarIcon, color: 'green' },
    { to: '/health-centers', label: 'Health Centers', Icon: MapPinIcon, color: 'blue' },
    { to: '/services', label: 'Healthcare Services', Icon: ActivityIcon, color: 'purple' },
    { to: '/health-guide', label: 'Health Guide Topics', Icon: BookOpenIcon, color: 'orange' },
  ];
  return <>
    <section className="search-hero">
      <p className="mb-2">Welcome to ALAGA</p>
      <PageTitle>What healthcare do you need?</PageTitle>
      <p className="hero-description">Tell ALAGA what you need — we'll help you find the right local facility.</p>
      <SearchForm />
      <div className="service-chips" aria-label="Example healthcare searches">{suggestions.map(label =>
        <button key={label} onClick={() => { setQuery(suggestionQueries[label] ?? label); navigate('/search'); }}>{label}</button>)}</div>
    </section>
    <div className="page">
      <div className="quick-grid">{actions.map(({ to, label, Icon, color }) =>
        <Link to={to} className="panel quick-card" key={to}><span className={`tile-icon ${color}`}><Icon size={24} /></span>
          <span className="font-bold">{label}</span><span className="muted mt-1">Explore <ChevronRightIcon size={16} /></span></Link>)}</div>
      <div className="dashboard-grid">
        <section className="panel"><div className="section-heading"><h2>Upcoming Appointment</h2><Link to="/appointments">View all</Link></div>
          <EmptyState title="No appointments to show"><p>Your appointments will appear here when secure online booking is available.</p></EmptyState>
        </section>
        <section className="panel"><div className="section-heading"><h2>Health Guide</h2><Link to="/health-guide">See all</Link></div>
          <div className="space-y-2">{categories.slice(0, 4).map(category => <Link to={`/health-guide?category=${category.id}`} className="category-row" key={category.id}>
            <ServiceIcon name={category.icon} size={20} /><span>{category.name}</span><ChevronRightIcon size={18} /></Link>)}</div>
        </section>
      </div>
      <section className="panel mt-6"><div className="section-heading"><h2>Health Centers</h2><Link to="/health-centers">Find more</Link></div>
        <EmptyState title="Verified health centers are coming"><p>Facility information will appear after it has been verified. Location and appointment availability are not yet connected.</p></EmptyState>
      </section>
    </div>
  </>;
}
