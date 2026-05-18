import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer, Segmented, Slider, Progress,
  Typography, Divider, Button, Space,
} from 'antd';
import { RocketOutlined } from '@ant-design/icons';
import type { Resolution, VideoStyle, AspectRatio, Platform, UserPlan, CameraMotion } from '../../types';
import type { GenerationSettings } from '../../types';
import { ANIMATION_STYLE_META, CAMERA_MOTION_META } from '../../constants/thumbnailGradients';

const { Text } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
  settings: GenerationSettings;
  plan: UserPlan;
  onStyleChange: (s: VideoStyle) => void;
  onRatioChange: (r: AspectRatio) => void;
  onDurationChange: (d: number) => void;
  onPlatformChange: (p: Platform) => void;
  onResolutionChange: (r: Resolution) => void;
  onMotionChange: (v: number) => void;
  onCreativityChange: (v: number) => void;
  onCameraMotionChange: (m: CameraMotion) => void;
}

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, color: '#6A8898' }}>
    {children}
  </Text>
);

const Row: React.FC<{ label: string; value: string | number; children: React.ReactNode }> = ({ label, value, children }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
      <Label>{label}</Label>
      <Text style={{ color: '#7AABB8', fontSize: 13, fontWeight: 700 }}>{value}</Text>
    </div>
    {children}
  </div>
);

export const SettingsDrawer: React.FC<Props> = ({
  open, onClose, settings, plan,
  onStyleChange, onRatioChange, onDurationChange,
  onPlatformChange, onResolutionChange, onMotionChange,
  onCreativityChange, onCameraMotionChange,
}) => {
  const navigate    = useNavigate();
  const creditsLeft = plan.creditsTotal - plan.creditsUsed;
  const creditsPct  = Math.round((plan.creditsUsed / plan.creditsTotal) * 100);

  const styleOptions = Object.entries(ANIMATION_STYLE_META).map(([value, meta]) => ({
    label: `${meta.icon} ${meta.label}`,
    value,
  }));

  const cameraOptions = Object.entries(CAMERA_MOTION_META).map(([value, meta]) => ({
    label: `${meta.icon} ${meta.label}`,
    value,
  }));

  return (
    <Drawer
      title="Generation Settings"
      placement="right"
      open={open}
      onClose={onClose}
      styles={{ wrapper: { width: 320 }, body: { paddingTop: 20, background: 'var(--surface)', overflowY: 'auto' } }}
    >
      {/* Credits */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(122,171,184,0.08), rgba(90,112,72,0.08))',
        border: '1px solid rgba(122,171,184,0.20)',
        borderRadius: 12, padding: '14px 16px', marginBottom: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <Text style={{ fontWeight: 700, color: '#7AABB8' }}>{plan.name}</Text>
          <Text style={{ fontSize: 18, fontWeight: 700, color: '#C8D8E4' }}>
            {creditsLeft} <Text style={{ fontSize: 12, fontWeight: 400, color: '#6A8898' }}>credits left</Text>
          </Text>
        </div>
        <Progress
          percent={creditsPct}
          strokeColor={{ '0%': '#3A6070', '100%': '#7AABB8' }}
          size="small"
          showInfo={false}
          style={{ marginBottom: 4 }}
        />
        <Text style={{ fontSize: 11, color: '#6A8898' }}>{plan.creditsUsed} of {plan.creditsTotal} used this month</Text>
        <Button
          type="primary"
          size="small"
          icon={<RocketOutlined />}
          block
          style={{ marginTop: 10, background: 'var(--grad-primary)', border: 'none' }}
          onClick={() => { onClose(); navigate('/pricing'); }}
        >
          Upgrade to Unlimited
        </Button>
      </div>

      <Divider />

      {/* Animation Style */}
      <div style={{ marginBottom: 20 }}>
        <Label>Animation Style</Label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginTop: 10 }}>
          {styleOptions.map(({ value, label }) => {
            const active = settings.style === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onStyleChange(value as VideoStyle)}
                style={{
                  padding: '8px 6px',
                  borderRadius: 8,
                  border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  background: active ? 'rgba(122,171,184,0.12)' : 'var(--surface2)',
                  color: active ? '#7AABB8' : '#6A8898',
                  fontSize: 11, fontWeight: active ? 700 : 400,
                  cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'var(--font-body)',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Camera Motion */}
      <div style={{ marginBottom: 20 }}>
        <Label>Camera Motion</Label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginTop: 10 }}>
          {cameraOptions.map(({ value, label }) => {
            const active = settings.cameraMotion === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onCameraMotionChange(value as CameraMotion)}
                style={{
                  padding: '8px 6px',
                  borderRadius: 8,
                  border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  background: active ? 'rgba(122,171,184,0.12)' : 'var(--surface2)',
                  color: active ? '#7AABB8' : '#6A8898',
                  fontSize: 11, fontWeight: active ? 700 : 400,
                  cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'var(--font-body)',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Aspect Ratio */}
      <div style={{ marginBottom: 20 }}>
        <Label>Aspect Ratio</Label>
        <Segmented
          block
          style={{ marginTop: 10 }}
          options={[
            { label: '9:16', value: '9:16' },
            { label: '1:1',  value: '1:1'  },
            { label: '16:9', value: '16:9' },
          ]}
          value={settings.aspectRatio}
          onChange={v => onRatioChange(v as AspectRatio)}
        />
      </div>

      {/* Duration */}
      <Row label="Duration" value={`${settings.duration}s`}>
        <Slider min={3} max={30} value={settings.duration} onChange={onDurationChange} tooltip={{ formatter: v => `${v}s` }} />
      </Row>

      <Divider />

      {/* Resolution */}
      <div style={{ marginBottom: 20 }}>
        <Label>Resolution</Label>
        <Segmented
          block
          style={{ marginTop: 10 }}
          options={['720p', '1080p', '4K', 'Auto']}
          value={settings.resolution}
          onChange={v => onResolutionChange(v as Resolution)}
        />
      </div>

      {/* Motion */}
      <Row label="Motion Intensity" value={`${settings.motionIntensity}%`}>
        <Slider min={0} max={100} value={settings.motionIntensity} onChange={onMotionChange} />
      </Row>

      {/* Creativity */}
      <Row label="Creativity" value={settings.creativity}>
        <Slider min={1} max={10} value={settings.creativity} onChange={onCreativityChange} />
      </Row>

      <Divider />

      {/* Platform share links */}
      <div>
        <Label>Share to Platform</Label>
        <Space wrap style={{ marginTop: 10 }}>
          {([
            { id: 'TikTok'  as Platform, url: 'https://www.tiktok.com/upload'           },
            { id: 'Reels'   as Platform, url: 'https://www.instagram.com/reels/create/' },
            { id: 'Shorts'  as Platform, url: 'https://studio.youtube.com/'             },
            { id: 'Twitter' as Platform, url: 'https://twitter.com/intent/tweet'        },
          ]).map(({ id, url }) => (
            <Button
              key={id}
              size="small"
              type={settings.platform === id ? 'primary' : 'default'}
              onClick={() => { onPlatformChange(id); window.open(url, '_blank', 'noopener,noreferrer'); }}
              style={settings.platform === id ? { background: 'var(--grad-primary)', border: 'none' } : {}}
            >
              {id}
            </Button>
          ))}
        </Space>
      </div>
    </Drawer>
  );
};
