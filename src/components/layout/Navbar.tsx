import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Tag, Space } from 'antd';

const NAV_LINKS = [
  { label: 'Studio',    path: '/studio'    },
  { label: 'Library',   path: '/library'   },
  { label: 'Templates', path: '/templates' },
  { label: 'Pricing',   path: '/pricing'   },
] as const;

interface NavbarProps {
  mobile?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ mobile = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const active   = NAV_LINKS.find(l => location.pathname.startsWith(l.path))?.label ?? '';

  return (
    <header
      style={{
        height: 'var(--nav-height)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        background: '#4A6880',
        borderBottom: '1px solid rgba(122,171,184,0.25)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        gap: 8,
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Logo */}
      <div
        onClick={() => navigate('/studio')}
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 20,
          letterSpacing: '-0.5px',
          cursor: 'pointer',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          marginRight: 8,
          flexShrink: 0,
        }}
      >
        {/* Silver metallic logo text */}
        <span style={{ background: 'var(--metal-silver)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          AnimFilm
        </span>
      </div>

      <Tag
        style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.8px',
          marginRight: 8, background: 'rgba(122,171,184,0.12)',
          borderColor: 'rgba(122,171,184,0.28)', color: '#7AABB8',
        }}
      >
        BETA
      </Tag>

      {/* Nav links */}
      {!mobile && (
        <nav style={{ display: 'flex', gap: 2, flex: 1 }}>
          {NAV_LINKS.map(({ label, path }) => (
            <button
              key={label}
              type="button"
              onClick={() => navigate(path)}
              style={{
                padding: '5px 12px',
                borderRadius: 8,
                border: 'none',
                background: active === label ? 'rgba(122,171,184,0.10)' : 'transparent',
                color: active === label ? '#7AABB8' : '#6A8898',
                fontSize: 13,
                fontWeight: active === label ? 600 : 400,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (active !== label) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { if (active !== label) e.currentTarget.style.background = 'transparent'; }}
            >
              {label}
            </button>
          ))}
        </nav>
      )}

      {/* Actions */}
      <Space style={{ marginLeft: 'auto' }}>
        {mobile ? (
          <Button
            type="primary"
            size="small"
            onClick={() => navigate('/signup')}
            style={{ background: 'var(--grad-primary)', border: 'none' }}
          >
            Sign up
          </Button>
        ) : (
          <>
            <Button
              type="text"
              onClick={() => navigate('/login')}
              style={{ color: '#6A8898' }}
            >
              Log in
            </Button>
            <Button
              type="primary"
              onClick={() => navigate('/signup')}
              style={{ background: 'var(--grad-primary)', border: 'none' }}
            >
              Sign up free
            </Button>
          </>
        )}
      </Space>
    </header>
  );
};
