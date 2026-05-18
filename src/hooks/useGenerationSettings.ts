import { useState, useCallback } from 'react';
import type { GenerationSettings, VideoStyle, AspectRatio, Platform, Resolution, CameraMotion } from '../types';

const DEFAULT_SETTINGS: GenerationSettings = {
  style:              'parallax-3d',
  aspectRatio:        '1:1',
  platform:           'TikTok',
  resolution:         '1080p',
  duration:           8,
  motionIntensity:    65,
  creativity:         7,
  cameraMotion:       'parallax',
  selectedCharacters: [],
};

export function useGenerationSettings() {
  const [settings, setSettings] = useState<GenerationSettings>(DEFAULT_SETTINGS);

  const updateStyle         = useCallback((style: VideoStyle)          => setSettings(s => ({ ...s, style })), []);
  const updateAspectRatio   = useCallback((aspectRatio: AspectRatio)    => setSettings(s => ({ ...s, aspectRatio })), []);
  const updatePlatform      = useCallback((platform: Platform)          => setSettings(s => ({ ...s, platform })), []);
  const updateResolution    = useCallback((resolution: Resolution)      => setSettings(s => ({ ...s, resolution })), []);
  const updateDuration      = useCallback((duration: number)            => setSettings(s => ({ ...s, duration })), []);
  const updateMotion        = useCallback((motionIntensity: number)     => setSettings(s => ({ ...s, motionIntensity })), []);
  const updateCreativity    = useCallback((creativity: number)          => setSettings(s => ({ ...s, creativity })), []);
  const updateCameraMotion  = useCallback((cameraMotion: CameraMotion)  => setSettings(s => ({ ...s, cameraMotion })), []);
  const toggleCharacter     = useCallback((id: string) => setSettings(s => ({
    ...s,
    selectedCharacters: s.selectedCharacters.includes(id)
      ? s.selectedCharacters.filter(c => c !== id)
      : [...s.selectedCharacters, id],
  })), []);

  return {
    settings,
    updateStyle,
    updateAspectRatio,
    updatePlatform,
    updateResolution,
    updateDuration,
    updateMotion,
    updateCreativity,
    updateCameraMotion,
    toggleCharacter,
  };
}
