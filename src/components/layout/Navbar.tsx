import React from 'react';
import { Button } from '../shared/Button';

const NAV_LINKS = ['Studio', 'Library', 'Templates', 'Pricing'] as const;

interface NavbarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab = 'Studio',
  onTabChange,
}) => {
  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
        height: 'var(--nav-height)',
        gap: 32,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 20,
          letterSpacing: '-0.5px',
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          userSelect: 'none',
        }}
      >
        <span
          style={{
            background: 'var(--grad-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Clip
        </span>
        <span style={{ color: 'var(--accent3)' }}>AI</span>
      </div>

      {/* Nav links */}
      <ul style={{ display: 'flex', listStyle: 'none', gap: 4, flex: 1 }}>
        {NAV_LINKS.map(link => (
          <li key={link}>
            <button
              type="button"
              onClick={() => onTabChange?.(link)}
              style={{
                fontSize: 13,
                color: activeTab === link ? 'var(--text)' : 'var(--text-muted)',
                background: activeTab === link ? 'var(--surface2)' : 'transparent',
                border: 'none',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'color 0.15s, background 0.15s',
              }}
            >
              {link}
            </button>
          </li>
        ))}
      </ul>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
        <span
          style={{
            fontSize: 11,
            padding: '3px 8px',
            borderRadius: 20,
            background: 'var(--pill-bg)',
            border: '1px solid var(--pill-border)',
            color: '#A98BFC',
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
          }}
        >
          Beta
        </span>
        <Button variant="ghost" size="sm">Log in</Button>
        <Button variant="primary" size="sm">Sign up free</Button>
      </div>
    </nav>
  );
};
