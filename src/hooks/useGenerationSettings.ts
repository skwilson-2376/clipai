import { useState, useCallback } from 'react';
import type { GenerationSettings, VideoStyle, AspectRatio, Platform, Resolution } from '../types';

const DEFAULT_SETTINGS: GenerationSettings = {
  style: 'realistic',
  aspectRatio: '1:1',
  platform: 'TikTok',
  resolution: '1080p',
  duration: 8,
  motionIntensity: 65,
  creativity: 7,
};

export function useGenerationSettings() {
  const [settings, setSettings] = useState<GenerationSettings>(DEFAULT_SETTINGS);

  const updateStyle         = useCallback((style: VideoStyle)       => setSettings(s => ({ ...s, style })), []);
  const updateAspectRatio   = useCallback((aspectRatio: AspectRatio) => setSettings(s => ({ ...s, aspectRatio })), []);
  const updatePlatform      = useCallback((platform: Platform)       => setSettings(s => ({ ...s, platform })), []);
  const updateResolution    = useCallback((resolution: Resolution)   => setSettings(s => ({ ...s, resolution })), []);
  const updateDuration      = useCallback((duration: number)         => setSettings(s => ({ ...s, duration })), []);
  const updateMotion        = useCallback((motionIntensity: number)  => setSettings(s => ({ ...s, motionIntensity })), []);
  const updateCreativity    = useCallback((creativity: number)       => setSettings(s => ({ ...s, creativity })), []);

  return {
    settings,
    updateStyle,
    updateAspectRatio,
    updatePlatform,
    updateResolution,
    updateDuration,
    updateMotion,
    updateCreativity,
  };
}
