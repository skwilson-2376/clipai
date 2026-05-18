import React from 'react';
import type { VideoStyle, GenerationStatus } from '../../types';
import { ANIMATION_STYLE_META } from '../../constants/thumbnailGradients';

interface StyleBadgeProps {
  style: VideoStyle;
}

export const StyleBadge: React.FC<StyleBadgeProps> = ({ style }) => {
  const meta = ANIMATION_STYLE_META[style];
  const label = meta?.label ?? style;
  const icon  = meta?.icon  ?? '🎬';
  return (
    <span
      style={{
        fontSize: 10,
        padding: '3px 7px',
        borderRadius: 20,
        fontWeight: 600,
        background: 'rgba(7,12,20,0.65)',
        color: 'rgba(200,216,228,0.90)',
        border: '1px solid rgba(122,171,184,0.25)',
        backdropFilter: 'blur(4px)',
        fontFamily: 'var(--font-body)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        whiteSpace: 'nowrap',
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  );
};

interface StatusBadgeProps {
  status: GenerationStatus;
}

const statusConfig: Record<GenerationStatus, { label: string; bg: string; color: string; border: string }> = {
  done:       { label: 'Done',       bg: 'rgba(90,150,90,0.15)',  color: '#7ABB7A', border: 'rgba(90,150,90,0.30)'  },
  processing: { label: 'Processing', bg: 'rgba(171,148,80,0.15)', color: '#BBAA5C', border: 'rgba(171,148,80,0.30)' },
  pending:    { label: 'Pending',    bg: 'rgba(90,112,130,0.15)', color: '#7A9AAA', border: 'rgba(90,112,130,0.30)' },
  failed:     { label: 'Failed',     bg: 'rgba(180,60,60,0.15)',  color: '#CC5050', border: 'rgba(180,60,60,0.30)'  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const cfg = statusConfig[status];
  return (
    <span
      style={{
        fontSize: 10,
        padding: '2px 7px',
        borderRadius: 20,
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        fontFamily: 'var(--font-body)',
        whiteSpace: 'nowrap',
        fontWeight: 600,
      }}
    >
      {cfg.label}
    </span>
  );
};
