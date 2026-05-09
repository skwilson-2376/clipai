import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';

interface Plan {
  id: string;
  name: string;
  monthlyPrice: number | null;
  annualPrice: number | null;
  description: string;
  cta: string;
  ctaVariant: 'primary' | 'outline' | 'gradient';
  badge?: string;
  features: string[];
  limits: { credits: string; resolution: string; duration: string; watermark: string };
}

const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Perfect for exploring AI video generation.',
    cta: 'Get started free',
    ctaVariant: 'outline',
    limits: { credits: '10 credits / month', resolution: 'Up to 720p', duration: '5s max', watermark: 'ClipAI watermark' },
    features: ['10 generations per month', '720p resolution', 'Up to 5 seconds', 'Prompt & Story modes', 'Access to 3 video styles', 'Community support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 19,
    annualPrice: 15,
    description: 'For creators who want more power and quality.',
    cta: 'Start Pro trial',
    ctaVariant: 'gradient',
    badge: 'Most Popular',
    limits: { credits: '100 credits / month', resolution: 'Up to 1080p', duration: '30s max', watermark: 'No watermark' },
    features: ['100 generations per month', '1080p HD resolution', 'Up to 30 seconds', 'All generation modes', 'All video styles & filters', 'Character studio', 'Post to social directly', 'Priority queue', 'Email support'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: null,
    annualPrice: null,
    description: 'Custom solutions for teams and businesses.',
    cta: 'Contact sales',
    ctaVariant: 'outline',
    limits: { credits: 'Unlimited', resolution: 'Up to 4K', duration: 'Unlimited', watermark: 'Custom branding' },
    features: ['Unlimited generations', '4K resolution', 'Unlimited duration', 'Custom AI model training', 'Dedicated infrastructure', 'White-label export', 'Team collaboration', 'SLA & 24/7 support', 'API access'],
  },
];

const FAQ = [
  { q: 'What is a credit?', a: 'One credit = one video generation. Credits refresh monthly on your billing date.' },
  { q: 'Can I upgrade or downgrade anytime?', a: 'Yes. Changes take effect immediately. Unused credits from higher plans are prorated.' },
  { q: 'Does the Starter plan really have a watermark?', a: 'Yes, free videos include a small ClipAI watermark. Upgrade to Pro or above to remove it.' },
  { q: 'Is there a free trial for Pro?', a: 'Yes — 7 days free, no credit card required. Cancel anytime before the trial ends.' },
];

export default function PricingPage() {
  const navigate = useNavigate();
  const [annual, setAnnual] = useState(true);

  const price = (p: Plan) => {
    if (p.monthlyPrice === null) return 'Custom';
    if (p.monthlyPrice === 0) return 'Free';
    return `$${annual ? p.annualPrice : p.monthlyPrice}`;
  };

  return (
    <PageLayout>
      {/* Hero */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '56px 24px 48px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 20, background: 'var(--pill-bg)', border: '1px solid var(--pill-border)', marginBottom: 16 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Pricing</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 800, color: 'var(--text)', marginBottom: 12 }}>
          Simple, transparent pricing
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' }}>
          Start free. Scale as you create. No hidden fees.
        </p>
        {/* Annual toggle */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'var(--surface2)', borderRadius: 20, padding: '4px 6px', border: '1px solid var(--border)' }}>
          <button
            type="button"
            onClick={() => setAnnual(false)}
            style={{ padding: '6px 16px', borderRadius: 16, border: 'none', background: !annual ? 'var(--surface)' : 'transparent', color: !annual ? 'var(--text)' : 'var(--text-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', boxShadow: !annual ? 'var(--shadow-sm)' : 'none', transition: 'all 0.15s' }}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setAnnual(true)}
            style={{ padding: '6px 16px', borderRadius: 16, border: 'none', background: annual ? 'var(--surface)' : 'transparent', color: annual ? 'var(--text)' : 'var(--text-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', boxShadow: annual ? 'var(--shadow-sm)' : 'none', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            Annual
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10, background: 'linear-gradient(135deg,#7C5CFC,#FC5CAD)', color: '#fff' }}>-20%</span>
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 80px' }}>
        {/* Pricing cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 80 }}>
          {PLANS.map(p => (
            <div
              key={p.id}
              style={{
                borderRadius: 'var(--radius-xl)',
                background: p.id === 'pro' ? 'var(--accent)' : 'var(--surface)',
                border: p.id === 'pro' ? 'none' : '1px solid var(--border)',
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                boxShadow: p.id === 'pro' ? '0 8px 32px rgba(124,92,252,0.35)' : 'var(--shadow-sm)',
              }}
            >
              {p.badge && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', padding: '4px 16px', borderRadius: 20, background: 'var(--grad-primary)', color: '#fff', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {p.badge}
                </div>
              )}
              <div style={{ marginBottom: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: p.id === 'pro' ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{p.name}</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 800, color: p.id === 'pro' ? '#fff' : 'var(--text)', lineHeight: 1 }}>
                    {price(p)}
                  </span>
                  {p.monthlyPrice !== null && p.monthlyPrice > 0 && (
                    <span style={{ fontSize: 14, color: p.id === 'pro' ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)', marginBottom: 6 }}>/ mo</span>
                  )}
                </div>
                {annual && p.monthlyPrice !== null && p.monthlyPrice > 0 && (
                  <div style={{ fontSize: 12, color: p.id === 'pro' ? 'rgba(255,255,255,0.6)' : 'var(--text-faint)', marginBottom: 4 }}>
                    Billed ${(p.annualPrice! * 12)} / year
                  </div>
                )}
                <p style={{ fontSize: 13, color: p.id === 'pro' ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>{p.description}</p>
              </div>

              {/* CTA */}
              <button
                type="button"
                onClick={() => navigate(p.id === 'enterprise' ? '#' : '/signup')}
                style={{
                  width: '100%',
                  padding: '12px 0',
                  borderRadius: 'var(--radius-md)',
                  border: p.id === 'pro' ? 'none' : `1.5px solid ${p.id === 'enterprise' ? 'var(--border2)' : 'var(--accent)'}`,
                  background: p.id === 'pro' ? '#fff' : p.id === 'starter' ? 'transparent' : 'var(--surface)',
                  color: p.id === 'pro' ? 'var(--accent)' : p.id === 'starter' ? 'var(--accent)' : 'var(--text)',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  marginBottom: 24,
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                {p.cta}
              </button>

              {/* Limits */}
              <div style={{ marginBottom: 20, padding: '14px', borderRadius: 'var(--radius-md)', background: p.id === 'pro' ? 'rgba(255,255,255,0.12)' : 'var(--surface2)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {Object.values(p.limits).map((val, i) => (
                  <div key={i} style={{ fontSize: 12, color: p.id === 'pro' ? 'rgba(255,255,255,0.85)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 16, height: 16, borderRadius: '50%', background: p.id === 'pro' ? 'rgba(255,255,255,0.2)' : 'var(--pill-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 9 }}>✓</span>
                    {val}
                  </div>
                ))}
              </div>

              {/* Features */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                {p.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: p.id === 'pro' ? 'rgba(255,255,255,0.85)' : 'var(--text-muted)' }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                      <path d="M3 8l3.5 3.5L13 4" stroke={p.id === 'pro' ? '#fff' : '#7C5CFC'} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--text)', textAlign: 'center', marginBottom: 32 }}>Frequently asked questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {FAQ.map((item, i) => (
              <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{item.q}</div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
