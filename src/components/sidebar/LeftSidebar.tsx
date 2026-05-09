import React from 'react';
import type { VideoStyle, AspectRatio, Platform } from '../../types';
import type { GenerationSettings } from '../../types';

interface LeftSidebarProps {
  settings: GenerationSettings;
  onStyleChange: (style: VideoStyle) => void;
  onRatioChange: (ratio: AspectRatio) => void;
  onPlatformChange: (platform: Platform) => void;
  onDurationChange: (duration: number) => void;
  mobile?: boolean;
}

const STYLES: { id: VideoStyle; label: string; sub: string; emoji: string; gradient: string }[] = [
  { id: 'realistic', label: 'Realistic',    sub: 'Cinematic, lifelike', emoji: '🎬', gradient: 'linear-gradient(135deg,#1a1a2e,#3a3a5e)' },
  { id: 'anime',     label: 'Anime',        sub: 'Japanese animation',  emoji: '✨', gradient: 'linear-gradient(135deg,#2e1a2e,#5e3a5e)' },
  { id: '3d',        label: '3D Animation', sub: 'CGI rendered',        emoji: '🎮', gradient: 'linear-gradient(135deg,#1a2e2e,#1a5e5e)' },
];

const RATIOS: { value: AspectRatio; label: string }[] = [
  { value: '9:16', label: 'TikTok' },
  { value: '1:1',  label: 'Square' },
  { value: '16:9', label: 'YouTube' },
];

const PLATFORMS: Platform[] = ['TikTok', 'Reels', 'Shorts', 'Twitter'];

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      fontSize: 10,
      fontWeight: 500,
      letterSpacing: '1.5px',
      color: 'var(--text-faint)',
      textTransform: 'uppercase',
      padding: '0 8px',
      marginBottom: 6,
      fontFamily: 'var(--font-display)',
    }}
  >
    {children}
  </div>
);

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  settings,
  onStyleChange,
  onRatioChange,
  onPlatformChange,
  onDurationChange,
  mobile = false,
}) => {
  return (
    <aside
      style={{
        width: mobile ? '100%' : 'var(--sidebar-width)',
        background: 'var(--surface)',
        borderRight: mobile ? 'none' : '1px solid var(--border)',
        padding: '20px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        overflowY: 'auto',
        flexShrink: 0,
      }}
    >
      {/* Style picker */}
      <section>
        <SectionLabel>Video Style</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {STYLES.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => onStyleChange(s.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${settings.style === s.id ? 'rgba(124,92,252,0.4)' : 'transparent'}`,
                background: settings.style === s.id ? 'rgba(124,92,252,0.1)' : 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: s.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                {s.emoji}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{s.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.sub}</div>
              </div>
              {settings.style === s.id && (
                <div
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Aspect ratio */}
      <section>
        <SectionLabel>Aspect Ratio</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
          {RATIOS.map(r => (
            <button
              key={r.value}
              type="button"
              onClick={() => onRatioChange(r.value)}
              style={{
                padding: '8px 0',
                borderRadius: 8,
                border: `1px solid ${settings.aspectRatio === r.value ? 'var(--accent)' : 'var(--border)'}`,
                background: settings.aspectRatio === r.value ? 'var(--pill-bg)' : 'transparent',
                color: settings.aspectRatio === r.value ? '#A98BFC' : 'var(--text-muted)',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                textAlign: 'center',
                transition: 'all 0.15s',
              }}
            >
              {r.value}
              <span style={{ display: 'block', fontSize: 10, color: 'var(--text-faint)', marginTop: 2 }}>
                {r.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Duration */}
      <section>
        <SectionLabel>Duration</SectionLabel>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
          <span>Length</span>
          <span style={{ color: 'var(--accent)', fontWeight: 500 }}>{settings.duration}s</span>
        </div>
        <input
          type="range"
          min={3}
          max={30}
          step={1}
          value={settings.duration}
          onChange={e => onDurationChange(Number(e.target.value))}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-faint)', marginTop: 4 }}>
          <span>3s</span><span>30s</span>
        </div>
      </section>

      {/* Platform */}
      <section>
        <SectionLabel>Platform</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {PLATFORMS.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => onPlatformChange(p)}
              style={{
                padding: '8px 0',
                borderRadius: 8,
                border: `1px solid ${settings.platform === p ? 'var(--accent3)' : 'var(--border)'}`,
                background: settings.platform === p ? 'rgba(92,244,252,0.08)' : 'transparent',
                color: settings.platform === p ? 'var(--accent3)' : 'var(--text-muted)',
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                textAlign: 'center',
                transition: 'all 0.15s',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
};
