import React, { useState } from 'react';
import type { VideoGeneration, Platform } from '../../types';
import { THUMB_GRADIENTS } from '../../constants/thumbnailGradients';

interface PostModalProps {
  generation: VideoGeneration;
  onClose: () => void;
}

const ALL_PLATFORMS: Platform[] = ['TikTok', 'Reels', 'Shorts', 'Twitter'];

const PLATFORM_ICONS: Record<Platform, string> = {
  TikTok: '🎵',
  Reels: '📸',
  Shorts: '▶️',
  Twitter: '𝕏',
};

type PostState = 'idle' | 'posting' | 'done';

export const PostModal: React.FC<PostModalProps> = ({ generation, onClose }) => {
  const [platforms, setPlatforms] = useState<Platform[]>([generation.platform]);
  const [caption, setCaption]     = useState(`${generation.prompt.slice(0, 80)} #AI #ClipAI #ShortFilm`);
  const [postState, setPostState] = useState<PostState>('idle');

  const toggle = (p: Platform) =>
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const handlePost = async () => {
    if (platforms.length === 0) return;
    setPostState('posting');
    await new Promise(r => setTimeout(r, 1800));
    setPostState('done');
  };

  const gradient = generation.thumbnailGradient ?? THUMB_GRADIENTS[generation.style];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="animate-slide-up"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          width: 400,
          maxWidth: 'calc(100vw - 32px)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
            Share Video
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: 20, lineHeight: 1, padding: 0 }}
          >
            ×
          </button>
        </div>

        {postState === 'done' ? (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
              Posted successfully!
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
              Shared to {platforms.join(', ')}
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 28px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: 'var(--grad-primary)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Thumbnail preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', background: gradient, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {generation.prompt}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>
                  {generation.aspectRatio} · {generation.duration}s
                </div>
              </div>
            </div>

            {/* Platform selection */}
            <div>
              <div style={{ fontSize: 10, letterSpacing: '1px', color: 'var(--text-faint)', fontFamily: 'var(--font-display)', marginBottom: 8 }}>
                POST TO
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {ALL_PLATFORMS.map(p => {
                  const active = platforms.includes(p);
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
                        border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                        background: active ? 'var(--pill-bg)' : 'transparent',
                        color: active ? 'var(--accent)' : 'var(--text-muted)',
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                        transition: 'all 0.15s',
                        textAlign: 'left',
                      }}
                    >
                      <span>{PLATFORM_ICONS[p]}</span>
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Caption */}
            <div>
              <div style={{ fontSize: 10, letterSpacing: '1px', color: 'var(--text-faint)', fontFamily: 'var(--font-display)', marginBottom: 8 }}>
                CAPTION
              </div>
              <textarea
                rows={3}
                value={caption}
                onChange={e => setCaption(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  fontSize: 13,
                  fontFamily: 'var(--font-body)',
                  outline: 'none',
                  resize: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>
                {caption.length}/280 characters
              </div>
            </div>

            {/* Post button */}
            <button
              type="button"
              onClick={handlePost}
              disabled={platforms.length === 0 || postState === 'posting'}
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
              {postState === 'posting' ? (
                <>
                  <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} className="animate-spin" />
                  Posting…
                </>
              ) : (
                `Post to ${platforms.length > 0 ? platforms.join(' + ') : '…'}`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
