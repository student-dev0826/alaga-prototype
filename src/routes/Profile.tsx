import PageTitle from '../components/PageTitle';
import { Link } from 'react-router-dom';
import { UserIcon } from '../components/icons';
import { usePreferences, defaultPreferences, type Preferences } from '../features/accessibility/Preferences';
import ResidentGate from '../features/auth/ResidentGate';
import ResidentProfile from '../features/profile/ResidentProfile';
export default function Profile({ accessibilityOnly = false }: { accessibilityOnly?: boolean }) {
  const { preferences, update } = usePreferences();
  return <div className="page"><PageTitle>{accessibilityOnly ? 'Accessibility Settings' : 'Resident Profile'}</PageTitle>
    <div className="profile-grid">
      {!accessibilityOnly && <section className="panel"><div className="tile-icon green"><UserIcon size={28} /></div>
        <ResidentGate><ResidentProfile /></ResidentGate>
        <Link to="/help" className="button secondary mt-5">Help & Support</Link>
      </section>}
      <section className="panel"><h2 className="mb-4">Accessibility Preferences</h2><p className="muted mb-6">Choose what makes ALAGA easier to read. These settings are saved in this browser when storage is available.</p>
        <label className="field-label" htmlFor="text-size">Text Size</label>
        <select id="text-size" className="input mb-5" value={preferences.textSize} onChange={event => update({ textSize: event.target.value as Preferences['textSize'] })}>
          <option value="standard">Standard</option><option value="large">Large</option><option value="extra-large">Extra large</option>
        </select>
        <label className="preference-row"><span><strong>High Contrast</strong><span className="muted block">Increase text and interface contrast</span></span><input type="checkbox" checked={preferences.highContrast} onChange={event => update({ highContrast: event.target.checked })} /></label>
        <label className="preference-row"><span><strong>Reduce Motion</strong><span className="muted block">Disable animations and transitions</span></span><input type="checkbox" checked={preferences.reduceMotion} onChange={event => update({ reduceMotion: event.target.checked })} /></label>
        <p className="muted mt-5">Screen-reader and keyboard support are always enabled. Your device’s reduced-motion preference is also respected.</p>
        <div className="my-5"><h3 className="font-bold">Language</h3><p>English · Filipino translations planned</p></div>
        <button className="button secondary" onClick={() => update(defaultPreferences)}>Reset preferences</button>
        <p role="status" className="sr-only">Current preferences: {preferences.textSize} text, high contrast {preferences.highContrast ? 'on' : 'off'}, reduced motion {preferences.reduceMotion ? 'on' : 'off'}.</p>
      </section>
    </div>
  </div>;
}
