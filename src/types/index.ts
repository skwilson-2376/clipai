export type VideoStyle = 'realistic' | 'anime' | '3d';
export type AspectRatio = '9:16' | '1:1' | '16:9';
export type Platform = 'TikTok' | 'Reels' | 'Shorts' | 'Twitter';
export type Resolution = '720p' | '1080p' | '4K' | 'Auto';
export type GenerationStatus = 'pending' | 'processing' | 'done' | 'failed';

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
}

export interface GenerationSettings {
  style: VideoStyle;
  aspectRatio: AspectRatio;
  platform: Platform;
  resolution: Resolution;
  duration: number;
  motionIntensity: number;
  creativity: number;
}

export interface UserPlan {
  name: string;
  creditsTotal: number;
  creditsUsed: number;
}
