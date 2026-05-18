import React, { useEffect, useState } from 'react';
import type { VideoFilter, VideoGeneration } from '../../types';
import { StyleBadge, StatusBadge } from '../shared/Badge';
import { THUMB_GRADIENTS } from '../../constants/thumbnailGradients';
import { FilterPicker, FILTER_CSS } from './FilterPicker';
import { PostModal } from './PostModal';
import { getVideoBlob } from '../../lib/videoDB';

interface VideoModalProps {
  generation: VideoGeneration;
  onClose: () => void;
}

const META_ROWS: Array<[string, (g: VideoGeneration) => string]> = [
  ['Platform',     g => g.platform],
  ['Resolution',   g => g.resolution],
  ['Aspect Ratio', g => g.aspectRatio],
  ['Duration',     g => `${g.duration}s`],
  ['Motion',       g => `${g.motionIntensity}%`],
  ['Creativity',   g => `${g.creativity}/10`],
];

export const VideoModal: React.FC<VideoModalProps> = ({ generation, onClose }) => {
  const [filter, setFilter]           = useState<VideoFilter>('none');
  const [showPost, setShowPost]       = useState(false);
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const gradient = generation.thumbnailGradient ?? THUMB_GRADIENTS[generation.style];

  // Resolve idb:// URLs stored in IndexedDB into a temporary object URL
  useEffect(() => {
    const raw = generation.videoUrl;
    if (!raw) { setResolvedUrl(null); return; }
    if (!raw.startsWith('idb://')) { setResolvedUrl(raw); return; }
    let objUrl = '';
    getVideoBlob(raw.slice(6)).then(blob => {
      if (blob) { objUrl = URL.createObjectURL(blob); setResolvedUrl(objUrl); }
    });
    return () => { if (objUrl) URL.revokeObjectURL(objUrl); };
  }, [generation.videoUrl]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      <div
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="Video preview"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            width: 460,
            maxWidth: 'calc(100vw - 48px)',
            maxHeight: 'calc(100dvh - 48px)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {/* Preview area */}
          <div
            style={{
              height: 220,
              background: resolvedUrl ? '#000' : gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            {resolvedUrl && (
              <video
                src={resolvedUrl}
                controls
                autoPlay
                muted
                loop
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: FILTER_CSS[filter],
                  transition: 'filter 0.3s ease',
                }}
              />
            )}

            {/* Gradient overlay with filter */}
            {!resolvedUrl && filter !== 'none' && (
              <div style={{ position: 'absolute', inset: 0, background: gradient, filter: FILTER_CSS[filter], transition: 'filter 0.3s ease' }} />
            )}

            <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 1 }}>
              <StyleBadge style={generation.style} />
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                zIndex: 1,
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                fontSize: 16,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
              }}
            >
              ×
            </button>

            {!resolvedUrl && (
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)',
                  border: '2px solid rgba(255,255,255,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(4px)',
                  zIndex: 1,
                  position: 'relative',
                }}
              >
                <div style={{ width: 0, height: 0, borderTop: '11px solid transparent', borderBottom: '11px solid transparent', borderLeft: '18px solid rgba(255,255,255,0.9)', marginLeft: 3 }} />
              </div>
            )}
          </div>

          {/* Filter picker */}
          <FilterPicker value={filter} onChange={setFilter} />

          {/* Metadata */}
          <div style={{ padding: '14px 20px 20px', overflowY: 'auto' }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', lineHeight: 1.5, marginBottom: 14 }}>
              {generation.prompt}
            </p>

            {/* Story info */}
            {generation.story && (
              <div style={{ marginBottom: 14, padding: '10px 12px', background: 'var(--surface2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-display)', marginBottom: 4 }}>
                  🎬 {generation.story.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {generation.story.scenes.length} scene{generation.story.scenes.length !== 1 ? 's' : ''}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: 12, marginBottom: 14 }}>
              {META_ROWS.map(([label, getValue]) => (
                <div key={label}>
                  <span style={{ color: 'var(--text-faint)' }}>{label}: </span>
                  <span style={{ color: 'var(--text)' }}>{getValue(generation)}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <StatusBadge status={generation.status} />
              <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                {generation.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <div style={{ marginLeft: 'auto' }}>
                <button
                  type="button"
                  onClick={() => setShowPost(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '7px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: 'var(--grad-primary)',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1v7M3 5l3-4 3 4M1 9h10v2H1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPost && (
        <PostModal generation={generation} onClose={() => setShowPost(false)} />
      )}
    </>
  );
};
