import { Link } from 'react-router-dom';
import PageTitle from '../components/PageTitle';
import EmptyState from '../components/EmptyState';
export default function Facility() {
  return <div className="page"><PageTitle>Health Center Details</PageTitle><section className="panel">
    <EmptyState title="Facility information is unavailable" action={<Link to="/health-centers" className="button">Find a health center</Link>}>
      <p>No verified record is available for this facility. Services, contact details, operating hours and booking support cannot be confirmed.</p>
    </EmptyState></section></div>;
}
