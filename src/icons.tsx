import type { ReactNode, SVGProps } from 'react';

type IconName = 'grid' | 'trend' | 'swap' | 'wallet' | 'user' | 'arrow' | 'plus' | 'search' | 'bell' | 'chevron' | 'logout' | 'shield' | 'download' | 'close' | 'check' | 'alert' | 'refresh' | 'calendar' | 'eye' | 'lock' | 'filter' | 'menu' | 'building' | 'bank' | 'spark' | 'sun' | 'moon';

const paths: Record<IconName, ReactNode> = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  trend: <><path d="M3 17 9 11l4 4 8-9"/><path d="M15 6h6v6"/></>,
  swap: <><path d="M7 7h13l-3-3"/><path d="M17 17H4l3 3"/></>,
  wallet: <><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H20v16H6.5A2.5 2.5 0 0 1 4 17.5z"/><path d="M4 7h16v4H4"/><path d="M16 14h2"/></>,
  user: <><circle cx="12" cy="8" r="3.5"/><path d="M4.5 20c.8-3.2 3.3-5 7.5-5s6.7 1.8 7.5 5"/></>,
  arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></>,
  bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
  chevron: <path d="m7 10 5 5 5-5"/>,
  logout: <><path d="M10 4H5v16h5"/><path d="M14 8l4 4-4 4M18 12H9"/></>,
  shield: <><path d="M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6z"/><path d="m8.5 12 2.3 2.3 4.7-5"/></>,
  download: <><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 20h16"/></>,
  close: <><path d="m6 6 12 12M18 6 6 18"/></>,
  check: <path d="m5 12 4.5 4.5L19 7"/>,
  alert: <><path d="M12 4 21 20H3z"/><path d="M12 9v5M12 17h.01"/></>,
  refresh: <><path d="M20 11a8 8 0 0 0-14.7-3L3 11"/><path d="M3 5v6h6M4 13a8 8 0 0 0 14.7 3L21 13"/><path d="M21 19v-6h-6"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
  eye: <><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
  filter: <path d="M4 6h16M7 12h10M10 18h4"/>,
  menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
  building: <><path d="M4 21V5l8-2 8 2v16M2 21h20"/><path d="M8 8h1M15 8h1M8 12h1M15 12h1M8 16h1M15 16h1"/></>,
  bank: <><path d="m3 10 9-6 9 6H3Z"/><path d="M5 10v8M9 10v8M15 10v8M19 10v8M3 21h18"/></>,
  spark: <><path d="m12 2 1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5z"/><path d="m19 17 .6 2.4L22 20l-2.4.6L19 23l-.6-2.4L16 20l2.4-.6z"/></>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"/></>,
  moon: <path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z"/>,
};

export function Icon({ name, size = 20, strokeWidth = 1.8, ...props }: { name: IconName; size?: number; strokeWidth?: number } & SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
