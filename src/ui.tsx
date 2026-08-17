import { useEffect, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './icons';

export function Button({ children, variant = 'primary', icon, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'outline' | 'danger'; icon?: Parameters<typeof Icon>[0]['name'] }) {
  return <button className={`button button-${variant}`} {...props}>{icon && <Icon name={icon} size={17} />}{children}</button>;
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'purple' }) {
  return <span className={`badge badge-${tone}`}><span className="badge-dot" />{children}</span>;
}

export function SectionHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="section-header"><div><div className="eyebrow">{eyebrow}</div><h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</div>;
}

export function Metric({ label, value, helper, trend, icon }: { label: string; value: string; helper?: string; trend?: string; icon: Parameters<typeof Icon>[0]['name'] }) {
  return <div className="metric-card"><div className="metric-top"><span className="metric-icon"><Icon name={icon} size={18} /></span>{trend && <span className="metric-trend">{trend}</span>}</div><div className="metric-label">{label}</div><div className="metric-value">{value}</div>{helper && <div className="metric-helper">{helper}</div>}</div>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-icon"><Icon name="spark" size={24} /></div><h3>{title}</h3><p>{description}</p>{action}</div>;
}

export function Modal({ title, eyebrow, onClose, children }: { title: string; eyebrow?: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  return createPortal(<div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="modal" role="dialog" aria-modal="true" aria-label={title}><button className="icon-button modal-close" onClick={onClose} aria-label="Fermer"><Icon name="close" /></button>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h2>{title}</h2>{children}</div></div>, document.body);
}

export function Spinner() { return <span className="spinner" aria-label="Chargement" />; }
