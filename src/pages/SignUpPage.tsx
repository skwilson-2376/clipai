import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function SignUpPage() {
  const navigate = useNavigate();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed]     = useState(false);
  const [loading, setLoading]   = useState(false);

  const valid = name.trim() && email.trim() && password.length >= 8 && agreed;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); navigate('/studio'); }, 1400);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      {/* Background decoration */}
      <div style={{ position: 'fixed', top: -200, left: -200, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,92,252,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: -200, right: -200, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(252,92,173,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div
          onClick={() => navigate('/studio')}
          style={{ textAlign: 'center', marginBottom: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}
        >
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Clip</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--accent3)' }}>AI</span>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '36px 32px', boxShadow: '0 4px 32px rgba(0,0,0,0.08)' }}>
          {/* Badge */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: 'var(--pill-bg)', border: '1px solid var(--pill-border)', color: 'var(--accent)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Free — No credit card required
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 6, textAlign: 'center' }}>Create your account</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 28 }}>Start generating AI videos for free</p>

          {/* Google */}
          <button
            type="button"
            style={{ width: '100%', padding: '11px 0', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20, transition: 'border-color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border2)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Full name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Jane Smith"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Password
                <span style={{ fontWeight: 400, color: 'var(--text-faint)', marginLeft: 4 }}>(8+ characters)</span>
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Create a strong password"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
              {/* Password strength */}
              {password.length > 0 && (
                <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 4, background: password.length >= (i + 1) * 2 ? (password.length >= 8 ? '#4CAF50' : 'var(--accent2)') : 'var(--border)', transition: 'background 0.2s' }} />
                  ))}
                </div>
              )}
            </div>

            {/* Terms */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                style={{ marginTop: 2, accentColor: 'var(--accent)', width: 15, height: 15, cursor: 'pointer' }}
              />
              <span style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                I agree to ClipAI's{' '}
                <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Terms of Service</a>
                {' '}and{' '}
                <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Privacy Policy</a>
              </span>
            </label>

            <button
              type="submit"
              disabled={!valid || loading}
              style={{ width: '100%', padding: '12px 0', borderRadius: 'var(--radius-md)', border: 'none', background: !valid || loading ? 'var(--border2)' : 'var(--grad-primary)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: !valid || loading ? 'default' : 'pointer', fontFamily: 'var(--font-body)', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'opacity 0.15s' }}
            >
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff' }} className="animate-spin" />
                  Creating account…
                </>
              ) : 'Create free account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 20 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Log in</Link>
          </p>
        </div>

        {/* Trust badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 24 }}>
          {['🔒 SSL Secured', '🚫 No spam', '✓ Cancel anytime'].map(badge => (
            <span key={badge} style={{ fontSize: 12, color: 'var(--text-faint)' }}>{badge}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
