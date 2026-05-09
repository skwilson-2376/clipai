export type VideoStyle      = 'realistic' | 'anime' | '3d';
export type AspectRatio     = '9:16' | '1:1' | '16:9';
export type Platform        = 'TikTok' | 'Reels' | 'Shorts' | 'Twitter';
export type Resolution      = '720p' | '1080p' | '4K' | 'Auto';
export type GenerationStatus = 'pending' | 'processing' | 'done' | 'failed';
export type VideoFilter     = 'none' | 'cinematic' | 'vintage' | 'neon' | 'noir' | 'warm' | 'cool' | 'dramatic';
export type CharacterSource = 'ai' | 'uploaded';
export type GenerationMode  = 'prompt' | 'story' | 'camera';

export interface Character {
  id: string;
  name: string;
  source: CharacterSource;
  imageUrl?: string;      // data URL for uploaded photos
  description?: string;  // AI character description
  gradient: string;       // fallback thumbnail
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
  status: GenerationStatus;
  createdAt: Date;
  thumbnailGradient?: string;
  videoUrl?: string;
  progress?: number;
  characters?: string[];   // character IDs used
  story?: FilmStory;
  isUploaded?: boolean;    // true for camera-captured/uploaded videos
}

export interface GenerationSettings {
  style: VideoStyle;
  aspectRatio: AspectRatio;
  platform: Platform;
  resolution: Resolution;
  duration: number;
  motionIntensity: number;
  creativity: number;
  selectedCharacters: string[];
}

export interface UserPlan {
  name: string;
  creditsTotal: number;
  creditsUsed: number;
}
