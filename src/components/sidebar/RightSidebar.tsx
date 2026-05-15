import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Resolution, VideoGeneration, UserPlan } from '../../types';
import type { GenerationSettings } from '../../types';
import { StatusBadge } from '../shared/Badge';
import { Button } from '../shared/Button';
import { THUMB_GRADIENTS } from '../../constants/thumbnailGradients';

interface RightSidebarProps {
  settings: GenerationSettings;
  onResolutionChange: (res: Resolution) => void;
  onMotionChange: (val: number) => void;
  onCreativityChange: (val: number) => void;
  generations: VideoGeneration[];
  plan: UserPlan;
  mobile?: boolean;
}

const RESOLUTIONS: Resolution[] = ['720p', '1080p', '4K', 'Auto'];

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      fontFamily: 'var(--font-display)',
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--text)',
      marginBottom: 12,
    }}
  >
    {children}
  </div>
);

const SliderRow: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
  onChange: (v: number) => void;
}> = ({ label, value, min, max, suffix = '', onChange }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
      <span>{label}</span>
      <span style={{ color: 'var(--accent)', fontWeight: 500 }}>{value}{suffix}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={1}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
    />
  </div>
);

function formatTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  if (mins < 1)    return 'just now';
  if (mins < 60)   return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}


export const RightSidebar: React.FC<RightSidebarProps> = ({
  settings,
  onResolutionChange,
  onMotionChange,
  onCreativityChange,
  generations,
  plan,
  mobile = false,
}) => {
  const navigate    = useNavigate();
  const creditsLeft = plan.creditsTotal - plan.creditsUsed;
  const creditsPct  = (plan.creditsUsed / plan.creditsTotal) * 100;

  return (
    <aside
      style={{
        width: mobile ? '100%' : 'var(--sidebar-right-width)',
        background: 'var(--surface)',
        borderLeft: mobile ? 'none' : '1px solid var(--border)',
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        overflowY: 'auto',
        flexShrink: 0,
      }}
    >
      {/* Plan card */}
      <div
        style={{
          background: 'var(--grad-subtle)',
          border: '1px solid rgba(124,92,252,0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: 14,
        }}
      >
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: '#A98BFC', marginBottom: 4 }}>
          {plan.name}
        </div>
        <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>
          {creditsLeft}{' '}
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>credits left</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{plan.creditsTotal} credits / month</div>
        <div style={{ height: 4, background: 'var(--border)', borderRadius: 4, overflow: 'hidden', margin: '10px 0 6px' }}>
          <div
            style={{
              height: '100%',
              width: `${creditsPct}%`,
              background: 'var(--grad-primary)',
              borderRadius: 4,
              transition: 'width 0.5s ease',
            }}
          />
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{plan.creditsUsed} used this month</div>
        <Button
          variant="primary"
          size="sm"
          fullWidth
          style={{ marginTop: 10 }}
          onClick={() => navigate('/pricing')}
        >
          Upgrade to Unlimited
        </Button>
      </div>

      {/* Output settings */}
      <section>
        <SectionLabel>Output Settings</SectionLabel>

        {/* Resolution */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Resolution</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {RESOLUTIONS.map(r => (
              <button
                key={r}
                onClick={() => onResolutionChange(r)}
                style={{
                  padding: '7px 0',
                  borderRadius: 8,
                  border: `1px solid ${settings.resolution === r ? 'var(--accent3)' : 'var(--border)'}`,
                  background: settings.resolution === r ? 'rgba(92,244,252,0.08)' : 'transparent',
                  color: settings.resolution === r ? 'var(--accent3)' : 'var(--text-muted)',
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  textAlign: 'center',
                  transition: 'all 0.15s',
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <SliderRow label="Motion Intensity" value={settings.motionIntensity} min={0} max={100} suffix="%" onChange={onMotionChange} />
        <SliderRow label="Creativity"       value={settings.creativity}       min={1} max={10}  onChange={onCreativityChange} />
      </section>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--border)' }} />

      {/* History */}
      <section>
        <SectionLabel>Generation History</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {generations.slice(0, 6).map(gen => (
            <div
              key={gen.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: 'var(--surface2)',
                cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(124,92,252,0.3)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 6,
                  background: gen.thumbnailGradient ?? THUMB_GRADIENTS[gen.style],
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'var(--text)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {gen.prompt.slice(0, 36)}…
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-faint)' }}>
                  {formatTimeAgo(gen.createdAt)} · {gen.duration}s
                </div>
              </div>
              <StatusBadge status={gen.status} />
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
};
