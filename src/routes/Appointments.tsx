import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageTitle from '../components/PageTitle';
import EmptyState from '../components/EmptyState';
import ResidentGate from '../features/auth/ResidentGate';
export default function Appointments({ detail = false }: { detail?: boolean }) {
  const [status, setStatus] = useState('Upcoming');
  return <div className="page"><PageTitle>{detail ? 'Appointment Details' : 'My Appointments'}</PageTitle>
    {!detail && <fieldset className="tab-filters"><legend className="sr-only">Filter appointments by status</legend>
      {['Upcoming', 'Completed', 'Cancelled'].map(value => <label key={value} className={status === value ? 'selected' : ''}>
        <input className="sr-only" type="radio" name="appointment-status" checked={status === value} onChange={() => setStatus(value)} />{value}</label>)}
    </fieldset>}
    <section className="panel"><ResidentGate><div role="status"><EmptyState title={detail ? 'Appointment details are not yet connected' : 'Appointment history is not yet connected'}>
      <p>Secure online booking is being prepared. Appointment history will be connected with the scheduling service.</p>
    </EmptyState></div></ResidentGate><Link className="button secondary mt-5" to={detail ? '/appointments' : '/health-centers'}>{detail ? 'View appointments' : 'Find a health center'}</Link></section>
  </div>;
}
