import { lazy, Suspense, useState } from 'react';
import { Link } from 'react-router-dom';
import PageTitle from '../components/PageTitle';
import EmptyState from '../components/EmptyState';
import Skeleton from '../components/Skeleton';
import SearchForm from '../features/search/SearchForm';
import { useSearch } from '../features/search/SearchContext';
const MapPanel = lazy(() => import('../components/MapPanel'));
export default function Directory({ search = false }: { search?: boolean }) {
  const { query, setQuery } = useSearch();
  const [showMap, setShowMap] = useState(false);
  return <div className="page">
    <PageTitle>{search && query ? `Results for “${query}”` : search ? 'Search Results' : 'Find a Health Center'}</PageTitle>
    <SearchForm key={query} initialQuery={search ? query : ''} />
    <p className="muted my-4">Search by the healthcare service you need or a facility name.</p>
    <div className="filter-row" aria-label="Facility filters">
      <label>Location<select disabled defaultValue=""><option value="">No verified locations yet</option></select></label>
      <label>Service<select disabled defaultValue=""><option value="">No verified services yet</option></select></label>
      <label className="check-label"><input type="checkbox" disabled />Available appointment</label>
    </div>
    <p className="muted mb-5">Filters and nearest-first sorting will become available with verified facility and scheduling data.</p>
    <div role="status" className="mb-4">0 verified facilities available.</div>
    <div className={showMap ? 'directory-grid' : ''}>
      <section className="panel"><EmptyState title="No verified facilities to show">
        <p>{search && query ? 'Your search has been received. Facility data is not yet connected, so ALAGA cannot verify matches.' : 'ALAGA is preparing its verified facility directory.'}</p>
        <p className="mt-3">If you need an appointment now, contact your known healthcare provider directly.</p>
      </EmptyState>{search && <Link className="button secondary mt-4" to="/" onClick={() => setQuery('')}>Clear search</Link>}</section>
      {showMap && <Suspense fallback={<Skeleton kind="facility-details" />}><MapPanel /></Suspense>}
    </div>
    <button className="button secondary mt-5" aria-expanded={showMap} onClick={() => setShowMap(value => !value)}>{showMap ? 'Hide location panel' : 'Show location panel'}</button>
  </div>;
}
