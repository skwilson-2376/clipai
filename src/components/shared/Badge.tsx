import React from 'react';
import type { VideoStyle, GenerationStatus } from '../../types';

interface StyleBadgeProps {
  style: VideoStyle;
}

const styleConfig: Record<VideoStyle, { label: string; bg: string; color: string }> = {
  realistic: { label: 'Realistic', bg: 'rgba(124,92,252,0.7)', color: '#E0D4FF' },
  anime:     { label: 'Anime',     bg: 'rgba(252,92,173,0.7)', color: '#FFD4EC' },
  '3d':      { label: '3D',        bg: 'rgba(92,244,252,0.7)', color: '#003A3C' },
};

export const StyleBadge: React.FC<StyleBadgeProps> = ({ style }) => {
  const cfg = styleConfig[style];
  return (
    <span
      style={{
        fontSize: 10,
        padding: '3px 7px',
        borderRadius: 20,
        fontWeight: 500,
        background: cfg.bg,
        color: cfg.color,
        backdropFilter: 'blur(4px)',
        fontFamily: 'var(--font-display)',
      }}
    >
      {cfg.label}
    </span>
  );
};

interface StatusBadgeProps {
  status: GenerationStatus;
}

const statusConfig: Record<GenerationStatus, { label: string; bg: string; color: string; border: string }> = {
  done:       { label: 'Done',       bg: 'rgba(92,252,152,0.12)', color: '#5CFC98', border: 'rgba(92,252,152,0.25)' },
  processing: { label: 'Processing', bg: 'rgba(252,188,92,0.12)', color: '#FCBC5C', border: 'rgba(252,188,92,0.25)' },
  pending:    { label: 'Pending',    bg: 'rgba(150,150,200,0.12)', color: '#9897B0', border: 'rgba(150,150,200,0.25)' },
  failed:     { label: 'Failed',     bg: 'rgba(252,92,92,0.12)',  color: '#FC5C5C', border: 'rgba(252,92,92,0.25)' },
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
      }}
    >
      {cfg.label}
    </span>
  );
};
