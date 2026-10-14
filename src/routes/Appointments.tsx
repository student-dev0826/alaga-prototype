import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageTitle from '../components/PageTitle';
import EmptyState from '../components/EmptyState';
export default function Appointments({ detail = false }: { detail?: boolean }) {
  const [status, setStatus] = useState('Upcoming');
  return <div className="page"><PageTitle>{detail ? 'Appointment Details' : 'My Appointments'}</PageTitle>
    {!detail && <fieldset className="tab-filters"><legend className="sr-only">Filter appointments by status</legend>
      {['Upcoming', 'Completed', 'Cancelled'].map(value => <label key={value} className={status === value ? 'selected' : ''}>
        <input className="sr-only" type="radio" name="appointment-status" checked={status === value} onChange={() => setStatus(value)} />{value}</label>)}
    </fieldset>}
    <section className="panel"><div role="status"><EmptyState title={detail ? 'Appointment unavailable' : `No ${status.toLowerCase()} appointments to show`}>
      <p>Resident sign-in and secure appointment storage are not yet connected. No appointment has been booked or confirmed.</p>
    </EmptyState></div><Link className="button secondary mt-5" to={detail ? '/appointments' : '/health-centers'}>{detail ? 'View appointments' : 'Find a health center'}</Link></section>
  </div>;
}
