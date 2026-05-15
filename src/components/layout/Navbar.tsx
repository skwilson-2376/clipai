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
        background: '#fff',
        borderBottom: '1px solid #D8D6EE',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        gap: 8,
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
          marginRight: 8,
          flexShrink: 0,
        }}
      >
        <span style={{ background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Clip</span>
        <span style={{ color: 'var(--accent3)' }}>AI</span>
      </div>

      <Tag color="purple" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', marginRight: 8 }}>BETA</Tag>

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
                background: active === label ? 'rgba(124,92,252,0.08)' : 'transparent',
                color: active === label ? '#7C5CFC' : '#5C5A74',
                fontSize: 13,
                fontWeight: active === label ? 600 : 400,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (active !== label) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
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
          <Button type="primary" size="small" onClick={() => navigate('/signup')}>
            Sign up
          </Button>
        ) : (
          <>
            <Button type="text" onClick={() => navigate('/login')} style={{ color: '#5C5A74' }}>
              Log in
            </Button>
            <Button
              type="primary"
              onClick={() => navigate('/signup')}
              style={{ background: 'linear-gradient(135deg,#7C5CFC,#FC5CAD)', border: 'none' }}
            >
              Sign up free
            </Button>
          </>
        )}
      </Space>
    </header>
  );
};
