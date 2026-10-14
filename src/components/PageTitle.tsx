import { useEffect, useRef } from 'react';
export default function PageTitle({ children, className = '' }: { children: string; className?: string }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    document.title = `${children} — ALAGA`;
    heading.current?.focus({ preventScroll: true });
  }, [children]);
  return <h1 ref={heading} tabIndex={-1} className={`page-title ${className}`}>{children}</h1>;
}
