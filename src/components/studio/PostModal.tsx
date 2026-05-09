import React, { useState } from 'react';
import type { VideoGeneration, Platform } from '../../types';
import { THUMB_GRADIENTS } from '../../constants/thumbnailGradients';

interface PostModalProps {
  generation: VideoGeneration;
  onClose: () => void;
}

const ALL_PLATFORMS: Platform[] = ['TikTok', 'Reels', 'Shorts', 'Twitter'];

// Direct upload / share URLs for each platform — no credentials needed
const PLATFORM_UPLOAD_URL: Record<Platform, (caption: string) => string> = {
  TikTok:  ()         => 'https://www.tiktok.com/upload',
  Reels:   ()         => 'https://www.instagram.com/reels/create/',
  Shorts:  ()         => 'https://studio.youtube.com/channel/CHANNEL_ID/videos/upload',
  Twitter: (caption)  => `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}`,
};

const PLATFORM_META: Record<Platform, { color: string; bg: string; icon: React.ReactNode }> = {
  TikTok: {
    color: '#fff',
    bg: '#010101',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.17a8.27 8.27 0 004.84 1.55V7.3a4.85 4.85 0 01-1.07-.61z"/>
      </svg>
    ),
  },
  Reels: {
    color: '#fff',
    bg: 'linear-gradient(135deg,#833AB4,#FD1D1D,#F77737)',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    ),
  },
  Shorts: {
    color: '#fff',
    bg: '#FF0000',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.5 6.19a3.02 3.02 0 00-2.12-2.12C19.54 3.58 12 3.58 12 3.58s-7.54 0-9.38.49A3.02 3.02 0 00.5 6.19C0 8.03 0 12 0 12s0 3.97.5 5.81a3.02 3.02 0 002.12 2.12c1.84.5 9.38.5 9.38.5s7.54 0 9.38-.5a3.02 3.02 0 002.12-2.12C24 15.97 24 12 24 12s0-3.97-.5-5.81zM9.54 15.57V8.43L15.82 12l-6.28 3.57z"/>
      </svg>
    ),
  },
  Twitter: {
    color: '#fff',
    bg: '#000000',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
};

type PostState = 'idle' | 'sharing' | 'done';

async function copyToClipboard(text: string) {
  try { await navigator.clipboard.writeText(text); } catch { /* silent */ }
}

function downloadVideo(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}

export const PostModal: React.FC<PostModalProps> = ({ generation, onClose }) => {
  const [platforms, setPlatforms] = useState<Platform[]>([generation.platform]);
  const [caption, setCaption]     = useState(`${generation.prompt.slice(0, 120)} #AI #ClipAI #ShortFilm`);
  const [postState, setPostState] = useState<PostState>('idle');
  const [copied, setCopied]       = useState(false);
  const [openedTabs, setOpenedTabs] = useState<Platform[]>([]);

  const toggle = (p: Platform) =>
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const handleShare = async () => {
    if (platforms.length === 0) return;
    setPostState('sharing');

    // 1. Try native Web Share API first (works great on mobile)
    const hasVideo = !!generation.videoUrl;
    if (navigator.share && !hasVideo) {
      try {
        await navigator.share({ text: caption });
        setPostState('done');
        return;
      } catch {
        // user cancelled or not supported — fall through
      }
    }

    // 2. Copy caption to clipboard
    await copyToClipboard(caption);
    setCopied(true);

    // 3. Download video if it exists (camera-captured or uploaded)
    if (generation.videoUrl && generation.isUploaded) {
      downloadVideo(generation.videoUrl, `clipai-${generation.id.slice(0, 8)}.mp4`);
      await new Promise(r => setTimeout(r, 600));
    }

    // 4. Open each platform in a new tab
    const opened: Platform[] = [];
    for (const p of platforms) {
      const url = PLATFORM_UPLOAD_URL[p](caption);
      window.open(url, '_blank', 'noopener,noreferrer');
      opened.push(p);
      await new Promise(r => setTimeout(r, 300)); // slight delay between tabs
    }
    setOpenedTabs(opened);
    setPostState('done');
  };

  const gradient = generation.thumbnailGradient ?? THUMB_GRADIENTS[generation.style];
  const hasRealVideo = generation.isUploaded && !!generation.videoUrl;

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="animate-slide-up"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', width: 420, maxWidth: 'calc(100vw - 32px)', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Share Video</span>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: 20, lineHeight: 1, padding: 0 }}>×</button>
        </div>

        {/* Done state */}
        {postState === 'done' ? (
          <div style={{ padding: '32px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🚀</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
              Platforms opened!
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
              {copied && 'Caption copied to clipboard. '}
              {hasRealVideo && 'Video downloaded. '}
              Paste the caption and upload your video on each platform.
            </div>

            {/* Opened platform chips */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
              {openedTabs.map(p => {
                const meta = PLATFORM_META[p];
                return (
                  <a
                    key={p}
                    href={PLATFORM_UPLOAD_URL[p](caption)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 20, background: meta.bg, color: meta.color, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}
                  >
                    {meta.icon} {p}
                  </a>
                );
              })}
            </div>

            {/* Caption copy pill */}
            {copied && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--surface2)', border: '1px solid var(--border)', marginBottom: 16, textAlign: 'left' }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 4" stroke="#22C55E" strokeWidth="2" strokeLinecap="round"/></svg>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{caption}</span>
              </div>
            )}

            <button type="button" onClick={onClose} style={{ padding: '10px 28px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--grad-primary)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              Done
            </button>
          </div>
        ) : (
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Thumbnail preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', background: gradient, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{generation.prompt}</div>
                <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>{generation.aspectRatio} · {generation.duration}s</div>
              </div>
            </div>

            {/* How it works hint */}
            <div style={{ display: 'flex', gap: 8, padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--surface2)', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: 16 }}>💡</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                No login needed. We'll copy your caption, {hasRealVideo ? 'download your video, ' : ''}and open each platform's upload page in a new tab.
              </span>
            </div>

            {/* Platform selection */}
            <div>
              <div style={{ fontSize: 10, letterSpacing: '1px', color: 'var(--text-faint)', fontFamily: 'var(--font-display)', marginBottom: 8 }}>POST TO</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {ALL_PLATFORMS.map(p => {
                  const isSelected = platforms.includes(p);
                  const meta       = PLATFORM_META[p];
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => toggle(p)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '9px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                        background: isSelected ? 'var(--pill-bg)' : 'transparent',
                        color: isSelected ? 'var(--accent)' : 'var(--text-muted)',
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                        transition: 'all 0.15s',
                        textAlign: 'left',
                      }}
                    >
                      <span style={{
                        width: 22, height: 22,
                        borderRadius: 6,
                        background: isSelected ? meta.bg : 'var(--surface2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: isSelected ? meta.color : 'var(--text-faint)',
                        flexShrink: 0,
                        transition: 'all 0.15s',
                      }}>
                        {meta.icon}
                      </span>
                      <span style={{ flex: 1 }}>{p}</span>
                      {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l2.5 2.5L10 3" stroke="var(--accent)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Caption */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 10, letterSpacing: '1px', color: 'var(--text-faint)', fontFamily: 'var(--font-display)' }}>CAPTION</div>
                <button
                  type="button"
                  onClick={async () => { await copyToClipboard(caption); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  style={{ fontSize: 11, color: copied ? '#22C55E' : 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', padding: 0, fontWeight: 600 }}
                >
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
              <textarea
                rows={3}
                value={caption}
                onChange={e => setCaption(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, fontFamily: 'var(--font-body)', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
              />
              <div style={{ fontSize: 11, color: caption.length > 280 ? '#FC5C5C' : 'var(--text-faint)', marginTop: 4 }}>
                {caption.length}/280 characters
              </div>
            </div>

            {/* Share button */}
            <button
              type="button"
              onClick={handleShare}
              disabled={platforms.length === 0 || postState === 'sharing'}
              style={{
                width: '100%',
                padding: '12px 0',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: platforms.length > 0 ? 'var(--grad-primary)' : 'var(--surface2)',
                color: platforms.length > 0 ? '#fff' : 'var(--text-faint)',
                fontSize: 14,
                fontWeight: 600,
                cursor: platforms.length > 0 ? 'pointer' : 'not-allowed',
                fontFamily: 'var(--font-body)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {postState === 'sharing' ? (
                <>
                  <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} className="animate-spin" />
                  Opening platforms…
                </>
              ) : platforms.length > 0 ? (
                `Share to ${platforms.join(' + ')} ↗`
              ) : (
                'Select a platform above'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
