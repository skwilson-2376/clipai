import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';

interface PlatformInfo {
  id: string;
  name: string;
  description: string;
  uploadUrl: string;
  tweetUrl?: string;
  bg: string;
  color: string;
  icon: React.ReactNode;
  steps: string[];
}

const TikTokIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.17a8.27 8.27 0 004.84 1.55V7.3a4.85 4.85 0 01-1.07-.61z"/>
  </svg>
);
const InstagramIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);
const YouTubeIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.5 6.19a3.02 3.02 0 00-2.12-2.12C19.54 3.58 12 3.58 12 3.58s-7.54 0-9.38.49A3.02 3.02 0 00.5 6.19C0 8.03 0 12 0 12s0 3.97.5 5.81a3.02 3.02 0 002.12 2.12c1.84.5 9.38.5 9.38.5s7.54 0 9.38-.5a3.02 3.02 0 002.12-2.12C24 15.97 24 12 24 12s0-3.97-.5-5.81zM9.54 15.57V8.43L15.82 12l-6.28 3.57z"/>
  </svg>
);
const TwitterIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const PLATFORMS: PlatformInfo[] = [
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Upload your video directly to TikTok. Log in with your creator account, then upload the downloaded file.',
    uploadUrl: 'https://www.tiktok.com/upload',
    bg: '#010101',
    color: '#ffffff',
    icon: <TikTokIcon />,
    steps: ['Click "Open TikTok Upload"', 'Log in if prompted', 'Drag & drop your downloaded video', 'Add caption (already copied)', 'Tap Post'],
  },
  {
    id: 'reels',
    name: 'Instagram Reels',
    description: 'Share your video as an Instagram Reel. Open the create page, upload your file, add the caption and post.',
    uploadUrl: 'https://www.instagram.com/reels/create/',
    bg: 'linear-gradient(135deg,#833AB4,#FD1D1D,#F77737)',
    color: '#ffffff',
    icon: <InstagramIcon />,
    steps: ['Click "Open Instagram"', 'Tap the + button', 'Select your video file', 'Choose "Reel"', 'Paste caption & share'],
  },
  {
    id: 'shorts',
    name: 'YouTube Shorts',
    description: 'Upload to YouTube and it automatically becomes a Short if it\'s under 60 seconds in vertical format.',
    uploadUrl: 'https://studio.youtube.com/channel/CHANNEL_ID/videos/upload',
    bg: '#FF0000',
    color: '#ffffff',
    icon: <YouTubeIcon />,
    steps: ['Click "Open YouTube Studio"', 'Click "Create → Upload videos"', 'Select your downloaded file', 'Set title & description', 'Publish'],
  },
  {
    id: 'twitter',
    name: 'Twitter / X',
    description: 'Post a tweet with your video. We pre-fill the caption using the tweet intent URL — no API key needed.',
    uploadUrl: 'https://twitter.com/intent/tweet',
    bg: '#000000',
    color: '#ffffff',
    icon: <TwitterIcon />,
    steps: ['Click "Open Twitter"', 'Caption is pre-filled automatically', 'Attach your downloaded video', 'Click Tweet'],
  },
];

export default function ConnectPage() {
  const navigate = useNavigate();

  const openPlatform = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <PageLayout>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13, fontFamily: 'var(--font-body)', marginBottom: 20, padding: 0 }}
          >
            ← Back
          </button>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
            Share to Social Media
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 580 }}>
            No API keys needed. When you share from the Studio, we copy your caption and open each platform's upload page — just paste and post.
          </p>
        </div>

        {/* How it works banner */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 40 }}>
          {[
            { step: '1', icon: '✂️', label: 'Select platforms', desc: 'Pick where to share in the Share dialog' },
            { step: '2', icon: '📋', label: 'Caption copied', desc: 'Your caption goes to clipboard automatically' },
            { step: '3', icon: '📥', label: 'Video downloaded', desc: 'Your video file saves locally (if available)' },
            { step: '4', icon: '↗️', label: 'Tabs open', desc: 'Each platform opens ready for upload' },
          ].map(({ step, icon, label, desc }) => (
            <div key={step} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>{desc}</div>
            </div>
          ))}
        </div>

        {/* Platform cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {PLATFORMS.map(p => (
            <div
              key={p.id}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}
            >
              <div style={{ display: 'flex', alignItems: 'stretch', flexWrap: 'wrap' }}>
                {/* Branding strip */}
                <div style={{ background: p.bg, width: 90, minHeight: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', color: p.color, flexShrink: 0, alignSelf: 'stretch' }}>
                  {p.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, padding: '18px 20px', minWidth: 180 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 5 }}>{p.name}</div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 10 }}>{p.description}</p>
                  {/* Steps */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {p.steps.map((s, i) => (
                      <span key={i} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: 'var(--surface2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                        {i + 1}. {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Open button */}
                <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => openPlatform(p.uploadUrl)}
                    style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 'var(--radius-md)', border: 'none', background: p.bg, color: p.color, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', transition: 'opacity 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    Open {p.name} ↗
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Go to studio CTA */}
        <div style={{ marginTop: 40, textAlign: 'center', padding: '32px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🎬</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Ready to create?</div>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>Generate a video in the Studio, then hit the share button — it handles everything automatically.</p>
          <button
            type="button"
            onClick={() => navigate('/studio')}
            style={{ padding: '12px 28px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--grad-primary)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
          >
            Open Studio
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
