import { MapPinIcon } from './icons';
export default function MapPanel() {
  return <aside className="map-panel"><MapPinIcon size={36} /><h2>Location</h2><p>Map information is not yet available.</p><p>Verified facility coordinates are needed before directions or distances can be shown.</p></aside>;
}
