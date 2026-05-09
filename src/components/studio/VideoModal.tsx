import React, { useEffect } from 'react';
import type { VideoGeneration } from '../../types';
import { StyleBadge, StatusBadge } from '../shared/Badge';
import { THUMB_GRADIENTS } from '../../constants/thumbnailGradients';

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
  const gradient = generation.thumbnailGradient ?? THUMB_GRADIENTS[generation.style];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
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
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Preview area */}
        <div
          style={{
            height: 220,
            background: generation.videoUrl ? '#000' : gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Actual video when available */}
          {generation.videoUrl && (
            <video
              src={generation.videoUrl}
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
              }}
            />
          )}

          {/* Style badge — always on top */}
          <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 1 }}>
            <StyleBadge style={generation.style} />
          </div>

          {/* Close button — always on top */}
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

          {/* Placeholder play icon when no video yet */}
          {!generation.videoUrl && (
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
              }}
            >
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderTop: '11px solid transparent',
                  borderBottom: '11px solid transparent',
                  borderLeft: '18px solid rgba(255,255,255,0.9)',
                  marginLeft: 3,
                }}
              />
            </div>
          )}
        </div>

        {/* Metadata */}
        <div style={{ padding: '16px 20px 20px' }}>
          <p
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--text)',
              lineHeight: 1.5,
              marginBottom: 14,
            }}
          >
            {generation.prompt}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px 16px',
              fontSize: 12,
            }}
          >
            {META_ROWS.map(([label, getValue]) => (
              <div key={label}>
                <span style={{ color: 'var(--text-faint)' }}>{label}: </span>
                <span style={{ color: 'var(--text)' }}>{getValue(generation)}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <StatusBadge status={generation.status} />
            <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>
              {generation.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
