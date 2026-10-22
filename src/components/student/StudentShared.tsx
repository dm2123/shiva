// ============================================================
// THE SHIVA — Student Shared UI Components
// Reusable building blocks for the student portal
// ============================================================

import React from 'react';
import Link from 'next/link';
import { IconArrowRight } from './StudentIcons';

// ── Page Header ──────────────────────────────────────────────
interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    text: string;
    href: string;
  };
  children?: React.ReactNode;
}

export function StudentPageHeader({ title, description, action, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--student-text)] tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-[var(--student-text-muted)] mt-1.5 max-w-xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {action && (
          <Link href={action.href} className="btn-primary text-xs">
            {action.text}
            <IconArrowRight size={14} />
          </Link>
        )}
        {children}
      </div>
    </div>
  );
}

// ── Glass Panel ──────────────────────────────────────────────
interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export function StudentGlassPanel({ children, className = '', padding = 'md' }: GlassPanelProps) {
  const paddingMap = { sm: 'p-4', md: 'p-6', lg: 'p-8 md:p-10' };
  return (
    <div className={`glass-panel rounded-2xl ${paddingMap[padding]} ${className}`}>
      {children}
    </div>
  );
}

// ── Section ──────────────────────────────────────────────────
interface SectionProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: { text: string; href: string };
  className?: string;
}

export function StudentSection({ title, subtitle, children, action, className = '' }: SectionProps) {
  return (
    <section className={`space-y-5 ${className}`}>
      {(title || action) && (
        <div className="flex items-end justify-between gap-4">
          <div>
            {title && <h2 className="text-xl font-bold text-[var(--student-text)] tracking-tight">{title}</h2>}
            {subtitle && <p className="text-xs text-[var(--student-text-faint)] mt-1 font-medium uppercase tracking-widest">{subtitle}</p>}
          </div>
          {action && (
            <Link href={action.href} className="btn-ghost text-xs text-[var(--student-primary)] hover:text-[var(--student-primary-hover)]">
              {action.text}
              <IconArrowRight size={14} />
            </Link>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

// ── Stat Card ────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export function StudentStatCard({ label, value, icon, trend, trendValue, className = '' }: StatCardProps) {
  return (
    <div className={`student-card p-5 flex items-start gap-4 ${className}`}>
      {icon && (
        <div className="w-10 h-10 rounded-xl bg-[var(--student-primary-light)] flex items-center justify-center text-[var(--student-primary)] flex-shrink-0">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-[var(--student-text-faint)] uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-bold text-[var(--student-text)] tracking-tight">{value}</p>
        {trendValue && (
          <p className={`text-[11px] font-semibold mt-1 ${
            trend === 'up' ? 'text-[var(--student-success)]' :
            trend === 'down' ? 'text-[var(--student-danger)]' :
            'text-[var(--student-text-faint)]'
          }`}>
            {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}{trendValue}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Capsule ──────────────────────────────────────────────────
interface CapsuleProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  className?: string;
}

export function StudentCapsule({ children, variant = 'neutral', className = '' }: CapsuleProps) {
  return (
    <span className={`capsule capsule-${variant} ${className}`}>
      {children}
    </span>
  );
}

// ── Badge ────────────────────────────────────────────────────
interface BadgeProps {
  count?: number;
  dot?: boolean;
  children: React.ReactNode;
}

export function StudentBadge({ count, dot, children }: BadgeProps) {
  return (
    <span className="relative inline-flex">
      {children}
      {dot && (
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[var(--student-danger)] rounded-full border border-white" />
      )}
      {count !== undefined && count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-[var(--student-danger)] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </span>
  );
}

// ── Blob Background ──────────────────────────────────────────
interface BlobBackgroundProps {
  className?: string;
  variant?: 'primary' | 'secondary';
}

export function StudentBlobBackground({ className = '', variant = 'primary' }: BlobBackgroundProps) {
  if (variant === 'secondary') {
    return (
      <>
        <div className={`liquid-blob w-[400px] h-[400px] bg-indigo-400/10 -top-40 -right-40 ${className}`} />
        <div className={`liquid-blob-secondary w-[300px] h-[300px] bg-violet-400/8 top-1/3 -left-32 ${className}`} />
      </>
    );
  }
  return (
    <>
      <div className={`liquid-blob w-[600px] h-[600px] bg-indigo-500/10 -top-60 -right-60 ${className}`} style={{ '--blob-duration': '14s' } as React.CSSProperties} />
      <div className={`liquid-blob-secondary w-[400px] h-[400px] bg-violet-500/8 bottom-[-200px] left-[-200px] ${className}`} />
    </>
  );
}

// ── Loading State ────────────────────────────────────────────
interface LoadingSkeletonProps {
  rows?: number;
  className?: string;
}

export function StudentLoadingState({ rows = 3, className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`space-y-4 ${className}`} role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="student-card p-5 space-y-3">
          <div className="skeleton h-4 w-2/3" />
          <div className="skeleton h-3 w-full" />
          <div className="skeleton h-3 w-4/5" />
        </div>
      ))}
      <span className="sr-only">Loading content...</span>
    </div>
  );
}

// ── Tabs ─────────────────────────────────────────────────────
interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function StudentTabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--student-surface-hover)] border border-[var(--student-border-light)] w-fit" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
            activeTab === tab.id
              ? 'bg-[var(--student-surface)] text-[var(--student-text)] shadow-sm border border-[var(--student-border)]'
              : 'text-[var(--student-text-muted)] hover:text-[var(--student-text)]'
          }`}
          role="tab"
          aria-selected={activeTab === tab.id}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-1.5 text-[10px] text-[var(--student-text-faint)]">({tab.count})</span>
          )}
        </button>
      ))}
    </div>
  );
}

// ── Filter ───────────────────────────────────────────────────
interface FilterOption {
  id: string;
  label: string;
}

interface FilterBarProps {
  options: FilterOption[];
  selected: string;
  onSelect: (id: string) => void;
}

export function StudentFilterBar({ options, selected, onSelect }: FilterBarProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Filter options">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect(option.id)}
          className={`capsule transition-all duration-200 cursor-pointer ${
            selected === option.id
              ? 'capsule-primary border-[var(--student-primary)]'
              : 'capsule-neutral hover:border-[var(--student-border-strong)]'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
