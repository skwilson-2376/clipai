export type AnimationStyle =
  | 'parallax-3d'    // DepthFlow-style depth + parallax camera movement
  | 'smooth-cinema'  // CogVideoX / Open-Sora style fluid motion
  | 'clay-motion'    // Stop-motion claymation aesthetic
  | 'cel-animation'  // Traditional 2D hand-drawn cell animation
  | 'ken-burns'      // Documentary slow camera sweep
  | 'watercolor';    // Watercolor painting brought to life

// Legacy aliases kept for backward compat with stored data
export type VideoStyle = AnimationStyle | 'realistic' | 'anime' | '3d';

export type CameraMotion = 'parallax' | 'orbit' | 'zoom-in' | 'pan-left' | 'pan-right' | 'dolly-out';

export type AspectRatio     = '9:16' | '1:1' | '16:9';
export type Platform        = 'TikTok' | 'Reels' | 'Shorts' | 'Twitter';
export type Resolution      = '720p' | '1080p' | '4K' | 'Auto';
export type GenerationStatus = 'pending' | 'processing' | 'done' | 'failed';
export type VideoFilter     = 'none' | 'cinematic' | 'vintage' | 'neon' | 'noir' | 'warm' | 'cool' | 'dramatic';
export type CharacterSource = 'ai' | 'uploaded';
export type GenerationMode  = 'photo-animate' | 'shortfilm' | '3dfilm' | 'camera' | 'people' | 'story' | 'prompt';

export interface Character {
  id: string;
  name: string;
  source: CharacterSource;
  imageUrl?: string;
  description?: string;
  gradient: string;
}

export interface StoryScene {
  id: string;
  narration: string;
  characterId?: string;
  dialogue?: string;
  duration: number;
}

export interface FilmStory {
  title: string;
  scenes: StoryScene[];
}

export interface VideoGeneration {
  id: string;
  prompt: string;
  style: VideoStyle;
  aspectRatio: AspectRatio;
  platform: Platform;
  resolution: Resolution;
  duration: number;
  motionIntensity: number;
  creativity: number;
  cameraMotion?: CameraMotion;
  sourcePhotoUrl?: string;   // original photo for photo-animate mode
  status: GenerationStatus;
  createdAt: Date;
  thumbnailGradient?: string;
  videoUrl?: string;
  progress?: number;
  characters?: string[];
  story?: FilmStory;
  isUploaded?: boolean;
}

export interface GenerationSettings {
  style: VideoStyle;
  aspectRatio: AspectRatio;
  platform: Platform;
  resolution: Resolution;
  duration: number;
  motionIntensity: number;
  creativity: number;
  cameraMotion: CameraMotion;
  selectedCharacters: string[];
}

export interface UserPlan {
  name: string;
  creditsTotal: number;
  creditsUsed: number;
}
