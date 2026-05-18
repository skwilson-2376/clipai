import React, { useRef, useState } from 'react';
import { Button, Slider, Tooltip } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import type { GenerationSettings, CameraMotion, VideoStyle } from '../../types';
import { ANIMATION_STYLE_META, CAMERA_MOTION_META, THUMB_GRADIENTS } from '../../constants/thumbnailGradients';

interface Props {
  settings: GenerationSettings;
  isGenerating: boolean;
  onStyleChange: (s: VideoStyle) => void;
  onCameraMotionChange: (m: CameraMotion) => void;
  onDurationChange: (d: number) => void;
  onMotionChange: (v: number) => void;
  onGenerate: (prompt: string) => void;
}

const ANIMATION_STYLES = Object.keys(ANIMATION_STYLE_META) as VideoStyle[];
const CAMERA_MOTIONS   = Object.keys(CAMERA_MOTION_META)   as CameraMotion[];

export const PhotoAnimateCreator: React.FC<Props> = ({
  settings, isGenerating,
  onStyleChange, onCameraMotionChange, onDurationChange, onMotionChange,
  onGenerate,
}) => {
  const fileRef         = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl]       = useState('');
  const [description, setDescription] = useState('');

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => setPhotoUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleGenerate = () => {
    const base = photoUrl
      ? `Animate this photo with ${ANIMATION_STYLE_META[settings.style]?.label ?? settings.style} style`
      : 'Create an animated short film';
    const desc = description.trim();
    onGenerate(desc ? `${base}: ${desc}` : base);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', padding: '24px 20px', gap: 24 }}>

      {/* Header */}
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
          Photo to 3D Animation
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Upload a photo and transform it into a cinematic 3D animated short film.
          Inspired by DepthFlow, CogVideoX &amp; Open-Sora techniques.
        </div>
      </div>

      {/* Photo drop zone */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>
          Source Photo
        </div>
        <div
          onClick={() => !photoUrl && fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--accent)'; }}
          onDragLeave={e => { e.currentTarget.style.borderColor = photoUrl ? 'var(--border2)' : 'var(--border)'; }}
          onDrop={e => { handleDrop(e); e.currentTarget.style.borderColor = 'var(--border2)'; }}
          style={{
            width: '100%',
            aspectRatio: '16/9',
            maxHeight: 180,
            borderRadius: 'var(--radius-lg)',
            border: `2px dashed ${photoUrl ? 'var(--accent)' : 'var(--border)'}`,
            background: photoUrl ? 'transparent' : 'var(--surface2)',
            overflow: 'hidden',
            position: 'relative',
            cursor: photoUrl ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'border-color 0.15s',
          }}
        >
          {photoUrl ? (
            <>
              <img src={photoUrl} alt="Source" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                type="button"
                onClick={e => { e.stopPropagation(); setPhotoUrl(''); }}
                style={{
                  position: 'absolute', top: 8, right: 8,
                  width: 26, height: 26, borderRadius: '50%',
                  background: 'rgba(7,12,20,0.75)', border: '1px solid var(--border2)',
                  color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                ×
              </button>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}
                style={{
                  position: 'absolute', bottom: 8, right: 8,
                  padding: '4px 10px', borderRadius: 6,
                  background: 'rgba(7,12,20,0.75)', border: '1px solid var(--border2)',
                  color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                }}
              >
                Change
              </button>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: 16 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🖼️</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 4 }}>
                Drop a photo here or click to upload
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>JPG, PNG, WEBP — no photo uses text-to-animation</div>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} style={{ display: 'none' }} />
      </div>

      {/* Description */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
          Scene Description <span style={{ color: 'var(--text-faint)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
        </div>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="e.g. Misty forest at dawn, camera slowly orbiting a ancient oak tree…"
          rows={2}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            background: 'var(--surface2)',
            color: 'var(--text)',
            fontSize: 13,
            fontFamily: 'var(--font-body)',
            resize: 'none',
            outline: 'none',
            lineHeight: 1.5,
          }}
          onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
        />
      </div>

      {/* Animation Style grid */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>
          Animation Style
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {ANIMATION_STYLES.map(style => {
            const meta    = ANIMATION_STYLE_META[style];
            const active  = settings.style === style;
            const gradient = THUMB_GRADIENTS[style];
            return (
              <Tooltip key={style} title={meta.desc} placement="top">
                <button
                  type="button"
                  onClick={() => onStyleChange(style)}
                  style={{
                    padding: 0,
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                    background: gradient,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    transition: 'border-color 0.15s, transform 0.15s',
                    transform: active ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: active ? '0 0 14px rgba(122,171,184,0.30)' : 'none',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = 'var(--border2)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <div style={{
                    height: 52,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: 4,
                    padding: '8px 4px',
                  }}>
                    <span style={{ fontSize: 18 }}>{meta.icon}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: active ? '#fff' : 'rgba(200,216,228,0.8)',
                      textAlign: 'center', lineHeight: 1.2, letterSpacing: '0.3px',
                    }}>{meta.label}</span>
                  </div>
                </button>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* Camera Motion */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>
          Camera Motion
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {CAMERA_MOTIONS.map(motion => {
            const meta   = CAMERA_MOTION_META[motion];
            const active = settings.cameraMotion === motion;
            return (
              <button
                key={motion}
                type="button"
                onClick={() => onCameraMotionChange(motion)}
                style={{
                  padding: '8px 4px',
                  borderRadius: 'var(--radius-md)',
                  border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  background: active ? 'rgba(122,171,184,0.12)' : 'var(--surface2)',
                  color: active ? 'var(--accent)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: 11,
                  fontWeight: active ? 700 : 400,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  transition: 'all 0.15s',
                  fontFamily: 'var(--font-body)',
                }}
              >
                <span style={{ fontSize: 16 }}>{meta.icon}</span>
                <span>{meta.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Duration + Motion sliders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Duration</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{settings.duration}s</span>
          </div>
          <Slider min={3} max={30} value={settings.duration} onChange={onDurationChange} tooltip={{ formatter: v => `${v}s` }} />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Motion Intensity</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{settings.motionIntensity}%</span>
          </div>
          <Slider min={0} max={100} value={settings.motionIntensity} onChange={onMotionChange} />
        </div>
      </div>

      {/* Generate button */}
      <Button
        type="primary"
        size="large"
        icon={<ThunderboltOutlined />}
        block
        loading={isGenerating}
        onClick={handleGenerate}
        style={{
          background: 'var(--grad-primary)',
          border: 'none',
          height: 48,
          fontSize: 15,
          fontWeight: 700,
          fontFamily: 'var(--font-display)',
          letterSpacing: '0.5px',
          boxShadow: '0 0 20px rgba(122,171,184,0.20)',
        }}
      >
        {isGenerating ? 'Generating…' : (photoUrl ? 'Animate Photo' : 'Create Animation')}
      </Button>

    </div>
  );
};
