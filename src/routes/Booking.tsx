import PageTitle from '../components/PageTitle';
import EmptyState from '../components/EmptyState';
import { Link } from 'react-router-dom';
export default function Booking() {
  return <div className="page"><PageTitle>Book an Appointment</PageTitle>
    <ol className="booking-steps" aria-label="Appointment booking steps">{['Health Center', 'Service', 'Date & Time', 'Patient Details', 'Review'].map((step, i) => <li key={step}><span>{i + 1}</span>{step}</li>)}</ol>
    <section className="panel"><EmptyState title="Online booking is not yet available" action={<Link to="/health-centers" className="button">Find a health center</Link>}>
      <p>Booking needs verified facility services, real appointment slots and a secure resident account. ALAGA cannot reserve or confirm appointments yet.</p>
      <p className="mt-3">Please contact your known healthcare provider directly to arrange care.</p>
    </EmptyState></section>
  </div>;
}
