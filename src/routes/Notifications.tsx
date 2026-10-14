import PageTitle from '../components/PageTitle';
import EmptyState from '../components/EmptyState';
export default function Notifications() {
  return <div className="page"><PageTitle>Notifications</PageTitle><section className="panel"><EmptyState title="No notifications to show">
    <p>Appointment reminders and updates will appear here after resident sign-in and secure notifications are connected.</p>
  </EmptyState></section></div>;
}
