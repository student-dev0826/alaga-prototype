import PageTitle from '../components/PageTitle';
import { Link } from 'react-router-dom';
export default function Help() {
  return <div className="page"><PageTitle>Help & Support</PageTitle><section className="panel space-y-4">
    <h2>Frequently Asked Questions</h2>
    <details><summary>How do I find a health center?</summary><p>Use the home search to describe the service you need or enter a facility name. Verified facility information is not yet connected.</p><Link to="/health-centers">Open Health Centers</Link></details>
    <details><summary>How do I book an appointment?</summary><p>Online booking is not yet available. When connected, you will select a facility, service, date and available time, then review your details before confirming. Contact your known healthcare provider directly for scheduling now.</p></details>
    <details><summary>How can I make the text easier to read?</summary><p>Choose a larger text size or high contrast in Accessibility Settings. Browser zoom and keyboard navigation are supported.</p><Link to="/accessibility">Open Accessibility Settings</Link></details>
    <details><summary>How do I contact support or report a problem?</summary><p>A verified ALAGA support contact has not yet been provided. Please contact the project owner through your existing communication channel. For facility scheduling, contact your known provider directly.</p></details>
  </section></div>;
}
