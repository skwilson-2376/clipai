import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer, Segmented, Slider, Progress,
  Typography, Divider, Button, Space,
} from 'antd';
import { RocketOutlined } from '@ant-design/icons';
import type {
  Resolution, VideoStyle, AspectRatio, Platform, UserPlan,
} from '../../types';
import type { GenerationSettings } from '../../types';

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
}

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
    {children}
  </Text>
);

const Row: React.FC<{ label: string; value: string | number; children: React.ReactNode }> = ({ label, value, children }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
      <Label>{label}</Label>
      <Text style={{ color: '#7C5CFC', fontSize: 13, fontWeight: 600 }}>{value}</Text>
    </div>
    {children}
  </div>
);

export const SettingsDrawer: React.FC<Props> = ({
  open, onClose, settings, plan,
  onStyleChange, onRatioChange, onDurationChange,
  onPlatformChange, onResolutionChange, onMotionChange, onCreativityChange,
}) => {
  const navigate    = useNavigate();
  const creditsLeft = plan.creditsTotal - plan.creditsUsed;
  const creditsPct  = Math.round((plan.creditsUsed / plan.creditsTotal) * 100);

  return (
    <Drawer
      title="Generation Settings"
      placement="right"
      width={320}
      open={open}
      onClose={onClose}
      styles={{ body: { paddingTop: 20 } }}
    >
      {/* Credits */}
      <div style={{ background: 'linear-gradient(135deg, rgba(124,92,252,0.08), rgba(252,92,173,0.05))', border: '1px solid rgba(124,92,252,0.2)', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <Text strong style={{ color: '#7C5CFC' }}>{plan.name}</Text>
          <Text style={{ fontSize: 18, fontWeight: 700, color: '#1A1829' }}>
            {creditsLeft} <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>credits left</Text>
          </Text>
        </div>
        <Progress
          percent={creditsPct}
          strokeColor={{ '0%': '#7C5CFC', '100%': '#FC5CAD' }}
          size="small"
          showInfo={false}
          style={{ marginBottom: 4 }}
        />
        <Text type="secondary" style={{ fontSize: 11 }}>{plan.creditsUsed} of {plan.creditsTotal} used this month</Text>
        <Button
          type="primary"
          size="small"
          icon={<RocketOutlined />}
          block
          style={{ marginTop: 10, background: 'linear-gradient(135deg,#7C5CFC,#FC5CAD)', border: 'none' }}
          onClick={() => { onClose(); navigate('/pricing'); }}
        >
          Upgrade to Unlimited
        </Button>
      </div>

      <Divider style={{ margin: '16px 0' }} />

      {/* Style */}
      <div style={{ marginBottom: 20 }}>
        <Label>Video Style</Label>
        <Segmented
          block
          style={{ marginTop: 10 }}
          options={[
            { label: '🎬 Real', value: 'realistic' },
            { label: '✨ Anime', value: 'anime' },
            { label: '🎮 3D', value: '3d' },
          ]}
          value={settings.style}
          onChange={v => onStyleChange(v as VideoStyle)}
        />
      </div>

      {/* Aspect Ratio */}
      <div style={{ marginBottom: 20 }}>
        <Label>Aspect Ratio</Label>
        <Segmented
          block
          style={{ marginTop: 10 }}
          options={[
            { label: '9:16', value: '9:16' },
            { label: '1:1', value: '1:1' },
            { label: '16:9', value: '16:9' },
          ]}
          value={settings.aspectRatio}
          onChange={v => onRatioChange(v as AspectRatio)}
        />
      </div>

      {/* Duration */}
      <Row label="Duration" value={`${settings.duration}s`}>
        <Slider
          min={3} max={30}
          value={settings.duration}
          onChange={onDurationChange}
          tooltip={{ formatter: v => `${v}s` }}
        />
      </Row>

      <Divider style={{ margin: '16px 0' }} />

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
        <Slider
          min={0} max={100}
          value={settings.motionIntensity}
          onChange={onMotionChange}
        />
      </Row>

      {/* Creativity */}
      <Row label="Creativity" value={settings.creativity}>
        <Slider
          min={1} max={10}
          value={settings.creativity}
          onChange={onCreativityChange}
        />
      </Row>

      <Divider style={{ margin: '16px 0' }} />

      {/* Platform share links */}
      <div>
        <Label>Share to Platform</Label>
        <Space wrap style={{ marginTop: 10 }}>
          {([
            { id: 'TikTok' as Platform,  url: 'https://www.tiktok.com/upload'             },
            { id: 'Reels'  as Platform,  url: 'https://www.instagram.com/reels/create/'   },
            { id: 'Shorts' as Platform,  url: 'https://studio.youtube.com/'               },
            { id: 'Twitter'as Platform,  url: 'https://twitter.com/intent/tweet'          },
          ]).map(({ id, url }) => (
            <Button
              key={id}
              size="small"
              type={settings.platform === id ? 'primary' : 'default'}
              onClick={() => { onPlatformChange(id); window.open(url, '_blank', 'noopener,noreferrer'); }}
            >
              {id}
            </Button>
          ))}
        </Space>
      </div>
    </Drawer>
  );
};
