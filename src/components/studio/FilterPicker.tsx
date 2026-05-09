import React from 'react';
import type { VideoFilter } from '../../types';

export const FILTER_CSS: Record<VideoFilter, string> = {
  none:      'none',
  cinematic: 'contrast(1.1) saturate(0.8) brightness(0.95)',
  vintage:   'sepia(0.5) contrast(1.1) brightness(0.9) saturate(0.85)',
  neon:      'saturate(1.8) brightness(1.1) hue-rotate(10deg)',
  noir:      'grayscale(1) contrast(1.3) brightness(0.85)',
  warm:      'sepia(0.25) saturate(1.2) brightness(1.05)',
  cool:      'saturate(0.9) brightness(1.05) hue-rotate(195deg)',
  dramatic:  'contrast(1.5) saturate(1.2) brightness(0.8)',
};

const FILTER_LABELS: Record<VideoFilter, string> = {
  none:      'None',
  cinematic: 'Cinematic',
  vintage:   'Vintage',
  neon:      'Neon',
  noir:      'Noir',
  warm:      'Warm',
  cool:      'Cool',
  dramatic:  'Dramatic',
};

const FILTER_PREVIEW_GRADIENT = 'linear-gradient(135deg, #667eea, #764ba2, #f5576c)';

const FILTERS = Object.keys(FILTER_CSS) as VideoFilter[];

interface FilterPickerProps {
  value: VideoFilter;
  onChange: (filter: VideoFilter) => void;
}

export const FilterPicker: React.FC<FilterPickerProps> = ({ value, onChange }) => (
  <div
    style={{
      display: 'flex',
      gap: 10,
      overflowX: 'auto',
      padding: '12px 16px',
      borderTop: '1px solid var(--border)',
      scrollbarWidth: 'none',
    }}
  >
    {FILTERS.map(f => {
      const active = value === f;
      return (
        <button
          key={f}
          type="button"
          onClick={() => onChange(f)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 5,
            flexShrink: 0,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 'var(--radius-md)',
              background: FILTER_PREVIEW_GRADIENT,
              filter: FILTER_CSS[f],
              border: active ? '2.5px solid var(--accent)' : '2.5px solid transparent',
              transition: 'border-color 0.15s',
              boxSizing: 'border-box',
            }}
          />
          <span style={{
            fontSize: 10,
            color: active ? 'var(--accent)' : 'var(--text-muted)',
            fontFamily: 'var(--font-body)',
            fontWeight: active ? 600 : 400,
            whiteSpace: 'nowrap',
          }}>
            {FILTER_LABELS[f]}
          </span>
        </button>
      );
    })}
  </div>
);
