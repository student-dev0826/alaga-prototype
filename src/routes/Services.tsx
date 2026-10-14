import PageTitle from '../components/PageTitle';
import EmptyState from '../components/EmptyState';
import { Link } from 'react-router-dom';
export default function Services() {
  return <div className="page"><PageTitle>Healthcare Services</PageTitle><section className="panel">
    <EmptyState title="Verified services are not yet listed" action={<Link className="button" to="/">Search for a healthcare service</Link>}>
      <p>Facility-specific services will appear when the service directory is connected. Example searches are not confirmation that a service is available.</p>
    </EmptyState></section></div>;
}
