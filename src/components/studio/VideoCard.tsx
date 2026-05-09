import React from 'react';
import type { VideoGeneration } from '../../types';
import { StyleBadge } from '../shared/Badge';
import { THUMB_GRADIENTS } from '../../constants/thumbnailGradients';

interface VideoCardProps {
  generation: VideoGeneration;
  onPlay?: (gen: VideoGeneration) => void;
  onDelete?: (id: string) => void;
  onShare?: (gen: VideoGeneration) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ generation, onPlay, onDelete, onShare }) => {
  const [hovered, setHovered] = React.useState(false);
  const gradient   = generation.thumbnailGradient ?? THUMB_GRADIENTS[generation.style];
  const isProcessing = generation.status === 'processing' || generation.status === 'pending';
  const isFailed     = generation.status === 'failed';
  const isPlayable   = generation.status === 'done';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        background: 'var(--surface)',
        border: `1px solid ${hovered && isPlayable ? 'rgba(124,92,252,0.4)' : isFailed ? 'rgba(252,92,92,0.3)' : 'var(--border)'}`,
        cursor: isPlayable ? 'pointer' : 'default',
        transform: hovered && isPlayable ? 'translateY(-2px)' : 'none',
        transition: 'all 0.2s ease',
        position: 'relative',
      }}
      onClick={() => isPlayable && onPlay?.(generation)}
    >
      {/* Thumbnail */}
      <div style={{ height: 120, background: gradient, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', top: 8, left: 8 }}>
          <StyleBadge style={generation.style} />
        </div>

        {/* Action buttons on hover */}
        {hovered && !isProcessing && (
          <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4 }}>
            {isPlayable && onShare && (
              <button
                type="button"
                onClick={e => { e.stopPropagation(); onShare(generation); }}
                aria-label="Share video"
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: 'rgba(124,92,252,0.8)',
                  border: 'none',
                  color: '#fff',
                  fontSize: 11,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ↑
              </button>
            )}
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onDelete?.(generation.id); }}
              aria-label="Delete video"
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'rgba(252,92,92,0.7)',
                border: 'none',
                color: '#fff',
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Progress bar */}
        {isProcessing && generation.progress !== undefined && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(0,0,0,0.3)' }}>
            <div style={{ height: '100%', width: `${generation.progress}%`, background: 'var(--grad-primary)', transition: 'width 0.5s ease', borderRadius: '0 2px 2px 0' }} />
          </div>
        )}

        {/* Play / Spinner / Error */}
        {isProcessing ? (
          <div style={{ width: 36, height: 36, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'rgba(255,255,255,0.8)', borderRadius: '50%' }} className="animate-spin" />
        ) : isFailed ? (
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(252,92,92,0.2)', border: '1.5px solid rgba(252,92,92,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FC5C5C', fontSize: 18, fontWeight: 700 }} aria-label="Generation failed">✕</div>
        ) : (
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', opacity: hovered ? 1 : 0.7, transition: 'opacity 0.2s' }}>
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
          {generation.isUploaded && <span style={{ marginLeft: 6, color: 'var(--accent3)' }}>Uploaded</span>}
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
        background: hovered ? 'rgba(124,92,252,0.04)' : 'transparent',
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
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: `1.5px dashed ${hovered ? 'var(--accent)' : 'var(--text-faint)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: hovered ? 'var(--accent)' : 'var(--text-faint)', fontSize: 20, transition: 'all 0.2s' }}>
        +
      </div>
      <div style={{ fontSize: 12, color: hovered ? 'var(--accent)' : 'var(--text-faint)', transition: 'color 0.2s' }}>
        New generation
      </div>
    </div>
  );
};
