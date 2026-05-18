import React from 'react';
import type { VideoGeneration } from '../../types';
import { THUMB_GRADIENTS, ANIMATION_STYLE_META } from '../../constants/thumbnailGradients';

interface VideoCardProps {
  generation: VideoGeneration;
  onPlay?: (gen: VideoGeneration) => void;
  onDelete?: (id: string) => void;
  onShare?: (gen: VideoGeneration) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ generation, onPlay, onDelete, onShare }) => {
  const [hovered, setHovered] = React.useState(false);
  const gradient     = generation.thumbnailGradient ?? THUMB_GRADIENTS[generation.style] ?? THUMB_GRADIENTS['parallax-3d'];
  const isProcessing = generation.status === 'processing' || generation.status === 'pending';
  const isFailed     = generation.status === 'failed';
  const isPlayable   = generation.status === 'done';
  const styleMeta    = ANIMATION_STYLE_META[generation.style];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        background: 'var(--surface)',
        border: `1px solid ${
          hovered && isPlayable  ? 'rgba(122,171,184,0.45)' :
          isFailed               ? 'rgba(220,80,80,0.30)'   :
          'var(--border)'
        }`,
        cursor: isPlayable ? 'pointer' : 'default',
        transform: hovered && isPlayable ? 'translateY(-2px)' : 'none',
        transition: 'all 0.2s ease',
        position: 'relative',
        boxShadow: hovered && isPlayable ? '0 4px 20px rgba(122,171,184,0.12)' : 'none',
      }}
      onClick={() => isPlayable && onPlay?.(generation)}
    >
      {/* Thumbnail */}
      <div style={{ height: 120, background: gradient, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        {/* Style badge */}
        {styleMeta && (
          <div style={{
            position: 'absolute', top: 8, left: 8,
            background: 'rgba(7,12,20,0.65)', backdropFilter: 'blur(4px)',
            border: '1px solid rgba(122,171,184,0.20)',
            borderRadius: 20, padding: '2px 8px',
            fontSize: 10, color: 'rgba(200,216,228,0.85)', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <span>{styleMeta.icon}</span>
            <span>{styleMeta.label}</span>
          </div>
        )}

        {/* Action buttons on hover */}
        {hovered && !isProcessing && (
          <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4 }}>
            {isPlayable && onShare && (
              <button
                type="button"
                onClick={e => { e.stopPropagation(); onShare(generation); }}
                aria-label="Share"
                style={iconBtn('rgba(122,171,184,0.75)')}
              >
                ↑
              </button>
            )}
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onDelete?.(generation.id); }}
              aria-label="Delete"
              style={iconBtn('rgba(200,60,60,0.70)')}
            >
              ×
            </button>
          </div>
        )}

        {/* Progress bar */}
        {isProcessing && generation.progress !== undefined && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(0,0,0,0.5)' }}>
            <div style={{
              height: '100%',
              width: `${generation.progress}%`,
              background: 'var(--grad-primary)',
              transition: 'width 0.5s ease',
              borderRadius: '0 2px 2px 0',
            }} />
          </div>
        )}

        {/* Centre icon — spinner / play / error */}
        {isProcessing ? (
          <div style={spinnerStyle} className="animate-spin" />
        ) : isFailed ? (
          <div style={failedStyle} aria-label="Failed">✕</div>
        ) : (
          <div style={{ ...playStyle, opacity: hovered ? 1 : 0.6, transition: 'opacity 0.2s' }}>
            <div style={{ width: 0, height: 0, borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: '13px solid rgba(255,255,255,0.9)', marginLeft: 2 }} />
          </div>
        )}
      </div>

      {/* Meta */}
      <div style={{ padding: '10px 12px' }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={generation.prompt}>
          {generation.story ? `🎬 ${generation.story.title}` : generation.prompt}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>
          {generation.aspectRatio} · {generation.duration}s · {generation.resolution}
          {generation.isUploaded && <span style={{ marginLeft: 6, color: 'var(--accent)' }}>Recorded</span>}
        </div>
      </div>
    </div>
  );
};

/* New generation placeholder card */
export const NewVideoCard: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        borderRadius: 'var(--radius-lg)',
        border: `2px dashed ${hovered ? 'var(--accent)' : 'var(--border)'}`,
        background: hovered ? 'rgba(122,171,184,0.05)' : 'transparent',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        minHeight: 170,
        transition: 'all 0.2s',
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: `1.5px dashed ${hovered ? 'var(--accent)' : 'var(--text-faint)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: hovered ? 'var(--accent)' : 'var(--text-faint)',
        fontSize: 20, transition: 'all 0.2s',
      }}>
        +
      </div>
      <div style={{ fontSize: 12, color: hovered ? 'var(--accent)' : 'var(--text-faint)', transition: 'color 0.2s' }}>
        New animation
      </div>
    </div>
  );
};

// ── Shared small styles ────────────────────────────────────────────────────────

const iconBtn = (bg: string): React.CSSProperties => ({
  width: 24, height: 24, borderRadius: '50%',
  background: bg, border: 'none', color: '#fff',
  fontSize: 14, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
});

const spinnerStyle: React.CSSProperties = {
  width: 32, height: 32, borderRadius: '50%',
  border: '2px solid rgba(255,255,255,0.15)',
  borderTopColor: 'rgba(255,255,255,0.75)',
};

const failedStyle: React.CSSProperties = {
  width: 38, height: 38, borderRadius: '50%',
  background: 'rgba(200,60,60,0.18)',
  border: '1.5px solid rgba(200,60,60,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: '#DC5050', fontSize: 18, fontWeight: 700,
};

const playStyle: React.CSSProperties = {
  width: 40, height: 40, borderRadius: '50%',
  background: 'rgba(255,255,255,0.12)',
  border: '1.5px solid rgba(255,255,255,0.25)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  backdropFilter: 'blur(4px)',
};
