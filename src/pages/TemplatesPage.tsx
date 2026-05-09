import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';

type Category = 'All' | 'Social Media' | 'Cinematic' | 'Music & Art' | 'Business' | 'Tutorial';

interface Template {
  id: string;
  name: string;
  category: Category;
  style: string;
  description: string;
  gradient: string;
  ratio: string;
  duration: string;
  popular?: boolean;
}

const TEMPLATES: Template[] = [
  { id: '1',  name: 'TikTok Viral',        category: 'Social Media', style: 'Realistic',     description: 'Trending format with fast cuts and kinetic text overlays',           gradient: 'linear-gradient(135deg,#FF6B6B,#FFE66D)', ratio: '9:16', duration: '15s', popular: true },
  { id: '2',  name: 'Film Noir',            category: 'Cinematic',    style: 'Realistic',     description: 'Black and white atmospheric drama with deep shadows',               gradient: 'linear-gradient(135deg,#2C2C2C,#4A4A4A)', ratio: '16:9', duration: '30s' },
  { id: '3',  name: 'Anime Intro',          category: 'Social Media', style: 'Anime',         description: 'Japanese animation opening sequence with dynamic action',            gradient: 'linear-gradient(135deg,#FC5CAD,#7C5CFC)', ratio: '1:1',  duration: '15s', popular: true },
  { id: '4',  name: 'Sci-Fi Epic',          category: 'Cinematic',    style: '3D Animation',  description: 'Futuristic space exploration with stunning CGI visuals',             gradient: 'linear-gradient(135deg,#0BC4CC,#7C5CFC)', ratio: '16:9', duration: '30s' },
  { id: '5',  name: 'Product Showcase',     category: 'Business',     style: 'Realistic',     description: 'Clean, minimal product reveal for e-commerce and brands',           gradient: 'linear-gradient(135deg,#7C5CFC,#0BC4CC)', ratio: '1:1',  duration: '10s' },
  { id: '6',  name: 'Lyric Video',          category: 'Music & Art',  style: '3D Animation',  description: 'Animated text and abstract visuals synced to your music',           gradient: 'linear-gradient(135deg,#FFD93D,#FF6B6B)', ratio: '16:9', duration: '30s' },
  { id: '7',  name: 'Instagram Reel',       category: 'Social Media', style: 'Realistic',     description: 'Trendy Reel-first format built for maximum reach',                  gradient: 'linear-gradient(135deg,#FC5CAD,#FFD93D)', ratio: '9:16', duration: '15s' },
  { id: '8',  name: 'Nature Documentary',   category: 'Cinematic',    style: 'Realistic',     description: 'Sweeping landscapes and wildlife cinematography in 4K style',       gradient: 'linear-gradient(135deg,#4CAF50,#0BC4CC)', ratio: '16:9', duration: '30s' },
  { id: '9',  name: 'Abstract Art',         category: 'Music & Art',  style: '3D Animation',  description: 'Flowing geometric shapes and vibrant colors in hypnotic motion',    gradient: 'linear-gradient(135deg,#7C5CFC,#FC5CAD)', ratio: '1:1',  duration: '15s', popular: true },
  { id: '10', name: 'Brand Story',          category: 'Business',     style: 'Realistic',     description: 'Compelling narrative that brings your brand journey to life',       gradient: 'linear-gradient(135deg,#2C3E50,#3498DB)', ratio: '16:9', duration: '30s' },
  { id: '11', name: 'How-To Tutorial',      category: 'Tutorial',     style: 'Realistic',     description: 'Step-by-step explainer format that converts and educates',          gradient: 'linear-gradient(135deg,#00B09B,#96C93D)', ratio: '9:16', duration: '15s' },
  { id: '12', name: 'Chibi Reaction',       category: 'Social Media', style: 'Anime',         description: 'Cute chibi character emotes and reactions for community clips',     gradient: 'linear-gradient(135deg,#FF9A9E,#FECFEF)', ratio: '1:1',  duration: '5s'  },
  { id: '13', name: 'Corporate Promo',      category: 'Business',     style: 'Realistic',     description: 'Professional company overview with motion graphics and data',       gradient: 'linear-gradient(135deg,#141E30,#243B55)', ratio: '16:9', duration: '30s' },
  { id: '14', name: 'Concert Visuals',      category: 'Music & Art',  style: '3D Animation',  description: 'Pulsing neon stage backgrounds and particle effects',               gradient: 'linear-gradient(135deg,#12c2e9,#f64f59)', ratio: '16:9', duration: '15s' },
  { id: '15', name: 'YouTube Shorts',       category: 'Tutorial',     style: 'Realistic',     description: 'Viral Shorts format with hook, value, and strong CTA',             gradient: 'linear-gradient(135deg,#FF0000,#CC0000)', ratio: '9:16', duration: '15s' },
  { id: '16', name: 'Cyber Punk City',      category: 'Cinematic',    style: '3D Animation',  description: 'Dystopian neon-lit megacity with rain and holographic ads',         gradient: 'linear-gradient(135deg,#0f0c29,#302b63)', ratio: '16:9', duration: '30s', popular: true },
];

const STYLE_COLORS: Record<string, string> = {
  Realistic:     '#7C5CFC',
  Anime:         '#FC5CAD',
  '3D Animation': '#0BC4CC',
};

const CATEGORIES: Category[] = ['All', 'Social Media', 'Cinematic', 'Music & Art', 'Business', 'Tutorial'];

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category>('All');
  const [search, setSearch]     = useState('');

  const visible = TEMPLATES.filter(t => {
    const matchCat = category === 'All' || t.category === category;
    const matchQ   = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <PageLayout>
      {/* Hero */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '48px 24px 40px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 20, background: 'var(--pill-bg)', border: '1px solid var(--pill-border)', marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Templates</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color: 'var(--text)', marginBottom: 12, lineHeight: 1.2 }}>
            Start with a template
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 28, lineHeight: 1.6 }}>
            Professionally crafted starting points for every video format. Pick one and make it yours.
          </p>
          {/* Search */}
          <div style={{ position: 'relative', maxWidth: 440, margin: '0 auto' }}>
            <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} width="15" height="15" viewBox="0 0 20 20" fill="none">
              <circle cx="8.5" cy="8.5" r="5.75" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search templates…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '11px 14px 11px 38px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 80px' }}>
        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              style={{
                padding: '7px 16px',
                borderRadius: 20,
                border: `1px solid ${category === cat ? 'var(--accent)' : 'var(--border)'}`,
                background: category === cat ? 'var(--accent)' : 'var(--surface)',
                color: category === cat ? '#fff' : 'var(--text-muted)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.15s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Count */}
        <p style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 20 }}>
          {visible.length} template{visible.length !== 1 ? 's' : ''}
        </p>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {visible.map(t => (
            <div
              key={t.id}
              style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column' }}
            >
              {/* Preview */}
              <div style={{ background: t.gradient, aspectRatio: '16/9', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="white"><path d="M7 5l7 4-7 4V5z"/></svg>
                </div>
                <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: 'rgba(0,0,0,0.5)', color: '#fff', backdropFilter: 'blur(4px)' }}>
                    {t.style}
                  </span>
                  {t.popular && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: 'rgba(252,92,173,0.85)', color: '#fff', backdropFilter: 'blur(4px)' }}>
                      Popular
                    </span>
                  )}
                </div>
                <span style={{ position: 'absolute', bottom: 10, right: 10, fontSize: 10, fontWeight: 600, padding: '3px 7px', borderRadius: 8, background: 'rgba(0,0,0,0.5)', color: '#fff' }}>
                  {t.ratio} · {t.duration}
                </span>
              </div>
              {/* Content */}
              <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{t.name}</div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10, background: `${STYLE_COLORS[t.style] ?? '#7C5CFC'}18`, color: STYLE_COLORS[t.style] ?? '#7C5CFC', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    {t.category}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>{t.description}</p>
                <button
                  type="button"
                  onClick={() => navigate('/studio')}
                  style={{ marginTop: 8, width: '100%', padding: '9px 0', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--grad-primary)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'opacity 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </div>

        {visible.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-faint)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>No templates found</div>
            <div style={{ fontSize: 14 }}>Try a different search or category</div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
