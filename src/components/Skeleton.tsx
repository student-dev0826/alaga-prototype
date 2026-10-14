export type SkeletonKind = 'page' | 'search' | 'facility-card' | 'facility-details' | 'appointments' | 'slots' | 'profile' | 'articles';
export default function Skeleton({ kind }: { kind: SkeletonKind }) {
  const count = kind === 'slots' ? 6 : kind === 'facility-details' || kind === 'profile' ? 2 : 3;
  return <div role="status" aria-busy="true" className="page" data-skeleton={kind}>
    <span className="sr-only">Loading {kind.replaceAll('-', ' ')}…</span>
    <div aria-hidden="true" className="space-y-4"><div className="skeleton h-9 w-2/3" />
      <div className="skeleton h-12" /><div className="cards-grid">{Array.from({ length: count }, (_, i) =>
        <div className="panel space-y-4" key={i}><div className="skeleton h-12 w-12" /><div className="skeleton h-6" /><div className="skeleton h-6 w-2/3" /></div>)}</div>
    </div>
  </div>;
}
