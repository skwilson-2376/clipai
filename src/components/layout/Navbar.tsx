import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Studio',    path: '/studio'    },
  { label: 'Library',   path: '/library'   },
  { label: 'Templates', path: '/templates' },
  { label: 'Pricing',   path: '/pricing'   },
  { label: 'Connect',   path: '/connect'   },
] as const;

interface NavbarProps {
  mobile?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ mobile = false }) => {
  const navigate  = useNavigate();
  const location  = useLocation();

  const active = NAV_LINKS.find(l => location.pathname.startsWith(l.path))?.label ?? '';

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
        onClick={() => navigate('/studio')}
        style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: 0, userSelect: 'none', cursor: 'pointer' }}
      >
        <span style={{ background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Clip</span>
        <span style={{ color: 'var(--accent3)' }}>AI</span>
      </div>

      {/* Nav links — hidden on mobile */}
      {!mobile && (
        <ul style={{ display: 'flex', listStyle: 'none', gap: 4, flex: 1 }}>
          {NAV_LINKS.map(({ label, path }) => (
            <li key={label}>
              <button
                type="button"
                onClick={() => navigate(path)}
                style={{
                  fontSize: 13,
                  color: active === label ? 'var(--text)' : 'var(--text-muted)',
                  background: active === label ? 'var(--surface2)' : 'transparent',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontWeight: active === label ? 600 : 400,
                  transition: 'color 0.15s, background 0.15s',
                }}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      )}

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
        {mobile ? (
          <button
            type="button"
            onClick={() => navigate('/signup')}
            style={{ padding: '6px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--grad-primary)', color: '#fff', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
          >
            Sign up
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{ padding: '6px 14px', borderRadius: 'var(--radius-sm)', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'border-color 0.15s, color 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => navigate('/signup')}
              style={{ padding: '6px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--grad-primary)', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'opacity 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Sign up free
            </button>
          </>
        )}
      </div>
    </nav>
  );
};
