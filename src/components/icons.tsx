interface IconProps { size?: number; className?: string }

const I = ({ d, size = 24, className = "" }: { d: string; size?: number; className?: string }) => (
  <svg width={size} height={size} aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const Paths = ({ children, size = 24, className = "" }: { children: React.ReactNode; size?: number; className?: string }) => (
  <svg width={size} height={size} aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {children}
  </svg>
);

export const HomeIcon = ({ size, className }: IconProps) => <Paths size={size} className={className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></Paths>;
export const MapPinIcon = ({ size, className }: IconProps) => <Paths size={size} className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></Paths>;
export const CalendarIcon = ({ size, className }: IconProps) => <Paths size={size} className={className}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></Paths>;
export const BookOpenIcon = ({ size, className }: IconProps) => <Paths size={size} className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></Paths>;
export const UserIcon = ({ size, className }: IconProps) => <Paths size={size} className={className}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Paths>;
export const BellIcon = ({ size, className }: IconProps) => <Paths size={size} className={className}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></Paths>;
export const ArrowLeftIcon = ({ size, className }: IconProps) => <I d="m15 18-6-6 6-6" size={size} className={className} />;
export const ArrowRightIcon = ({ size, className }: IconProps) => <I d="m9 18 6-6-6-6" size={size} className={className} />;
export const CheckIcon = ({ size, className }: IconProps) => <I d="M20 6 9 17l-5-5" size={size} className={className} />;
export const XIcon = ({ size, className }: IconProps) => <Paths size={size} className={className}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Paths>;
export const SearchIcon = ({ size, className }: IconProps) => <Paths size={size} className={className}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></Paths>;
export const PhoneIcon = ({ size, className }: IconProps) => <I d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 14 19.79 19.79 0 0 1 1.93 5.49 2 2 0 0 1 3.9 3.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 10a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" size={size} className={className} />;
export const ClockIcon = ({ size, className }: IconProps) => <Paths size={size} className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Paths>;
export const ChevronRightIcon = ({ size, className }: IconProps) => <I d="m9 18 6-6-6-6" size={size} className={className} />;
export const ChevronDownIcon = ({ size, className }: IconProps) => <I d="m6 9 6 6 6-6" size={size} className={className} />;
export const SettingsIcon = ({ size, className }: IconProps) => <Paths size={size} className={className}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></Paths>;
export const HelpIcon = ({ size, className }: IconProps) => <Paths size={size} className={className}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></Paths>;
export const LogOutIcon = ({ size, className }: IconProps) => <Paths size={size} className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></Paths>;
export const HeartIcon = ({ size, className }: IconProps) => <I d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" size={size} className={className} />;
export const ActivityIcon = ({ size, className }: IconProps) => <I d="M22 12h-4l-3 9L9 3l-3 9H2" size={size} className={className} />;
export const ShieldIcon = ({ size, className }: IconProps) => <I d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" size={size} className={className} />;
export const InfoIcon = ({ size, className }: IconProps) => <Paths size={size} className={className}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></Paths>;
export const StarIcon = ({ size, className }: IconProps) => <I d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" size={size} className={className} />;
export const PlusIcon = ({ size, className }: IconProps) => <Paths size={size} className={className}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></Paths>;
export const NavigationIcon = ({ size, className }: IconProps) => <I d="M3 11l19-9-9 19-2-8-8-2z" size={size} className={className} />;
export const EditIcon = ({ size, className }: IconProps) => <Paths size={size} className={className}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></Paths>;
export const BookmarkIcon = ({ size, className }: IconProps) => <I d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" size={size} className={className} />;
export const CheckCircleIcon = ({ size, className }: IconProps) => <Paths size={size} className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></Paths>;
export const AlertCircleIcon = ({ size, className }: IconProps) => <Paths size={size} className={className}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></Paths>;
export const GridIcon = ({ size, className }: IconProps) => <Paths size={size} className={className}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></Paths>;
export const ListIcon = ({ size, className }: IconProps) => <Paths size={size} className={className}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></Paths>;

export function ServiceIcon({ name, size = 20 }: { name: string; size?: number }) {
  const map: Record<string, React.ReactNode> = {
    stethoscope: <ActivityIcon size={size} />,
    heart: <HeartIcon size={size} />,
    baby: <StarIcon size={size} />,
    syringe: <ShieldIcon size={size} />,
    activity: <ActivityIcon size={size} />,
    droplets: <InfoIcon size={size} />,
    smile: <CheckCircleIcon size={size} />,
    info: <InfoIcon size={size} />,
    apple: <HeartIcon size={size} />,
    user: <UserIcon size={size} />,
    shield: <ShieldIcon size={size} />,
    plus: <PlusIcon size={size} />,
    star: <StarIcon size={size} />,
  };
  return <>{map[name] ?? <InfoIcon size={size} />}</>;
}
