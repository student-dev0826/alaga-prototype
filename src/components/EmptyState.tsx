import type { ReactNode } from 'react';
import { InfoIcon } from './icons';
export default function EmptyState({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return <div className="empty-state">
    <div className="empty-icon"><InfoIcon size={28} /></div>
    <h2>{title}</h2><div className="muted">{children}</div>{action && <div className="mt-5">{action}</div>}
  </div>;
}
