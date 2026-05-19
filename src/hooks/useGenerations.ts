import { useState, useCallback, useEffect, useRef } from 'react';
import type React from 'react';
import type {
  FilmStory, VideoGeneration, GenerationSettings,
  VideoStyle, AspectRatio, Platform, Resolution, GenerationStatus,
} from '../types';
import { THUMB_GRADIENTS } from '../constants/thumbnailGradients';
import { deleteVideoBlob } from '../lib/videoDB';

const STORAGE_KEY = 'clipai_generations';
// For mobile (Capacitor) builds set VITE_API_URL=http://your-server:8080 in .env
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '';

// ── DB sync helpers ───────────────────────────────────────────────────────────

interface DbGeneration {
  id: string; prompt: string; style: string; aspectRatio: string;
  platform: string; resolution: string; duration: number;
  motionIntensity: number; creativity: number; status: string;
  progress: number; videoUrl: string | null;
  thumbnailGradient: string | null; isUploaded: number; createdAt: string;
}

function getStoredToken(): string | null {
  try {
    const raw = localStorage.getItem('clipai_auth');
    if (raw) return (JSON.parse(raw) as { token?: string }).token ?? null;
  } catch {}
  return null;
}

function dbToGeneration(db: DbGeneration): VideoGeneration {
  return {
    id: db.id, prompt: db.prompt,
    style: db.style as VideoStyle, aspectRatio: db.aspectRatio as AspectRatio,
    platform: db.platform as Platform, resolution: db.resolution as Resolution,
    duration: db.duration, motionIntensity: db.motionIntensity, creativity: db.creativity,
    status: db.status as GenerationStatus, progress: db.progress,
    videoUrl: db.videoUrl ?? undefined, thumbnailGradient: db.thumbnailGradient ?? undefined,
    isUploaded: Boolean(db.isUploaded), createdAt: new Date(db.createdAt),
    cameraMotion: 'parallax',
  };
}

function mergeWithDb(local: VideoGeneration[], dbItems: DbGeneration[]): VideoGeneration[] {
  const dbMap = new Map(dbItems.map(d => [d.id, d]));
  // Update existing local items where DB has newer state
  const updated = local.map(g => {
    const db = dbMap.get(g.id);
    if (!db) return g;
    return { ...g, status: db.status as GenerationStatus, progress: db.progress, videoUrl: db.videoUrl ?? g.videoUrl };
  });
  // Add items from DB that are missing from localStorage (e.g., generated elsewhere)
  const localIds = new Set(local.map(g => g.id));
  const newFromDb = dbItems.filter(d => !localIds.has(d.id)).map(dbToGeneration);
  return [...newFromDb, ...updated].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

// Free Google sample videos used for demo playback
const SAMPLE_VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
];

function pickSampleVideo(seed?: string): string {
  const idx = seed
    ? seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % SAMPLE_VIDEOS.length
    : Math.floor(Math.random() * SAMPLE_VIDEOS.length);
  return SAMPLE_VIDEOS[idx];
}

function loadFromStorage(): VideoGeneration[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as (Omit<VideoGeneration, 'createdAt'> & { createdAt: string })[];
      return parsed.map(g => ({
        ...g,
        createdAt: new Date(g.createdAt),
        // Backfill videoUrl for done items that were saved before sample videos were added
        videoUrl: g.videoUrl ?? (g.status === 'done' ? pickSampleVideo(g.id) : undefined),
      }));
    }
  } catch { /* fall through to seed */ }
  return SEED_GENERATIONS;
}

const SEED_GENERATIONS: VideoGeneration[] = [
  {
    id: '1',
    prompt: 'Ancient lighthouse on a rocky cliff — parallax depth reveals crashing waves below',
    style: 'parallax-3d',
    aspectRatio: '16:9',
    platform: 'Shorts',
    resolution: '1080p',
    duration: 8,
    motionIntensity: 65,
    creativity: 7,
    cameraMotion: 'parallax',
    status: 'done',
    createdAt: new Date(Date.now() - 2 * 60 * 1000),
    thumbnailGradient: 'linear-gradient(145deg, #080E18, #0E2540, #1A3A52)',
    videoUrl: SAMPLE_VIDEOS[0],
  },
  {
    id: '2',
    prompt: 'Autumn forest path at golden hour — watercolor pigment bleeds through falling leaves',
    style: 'watercolor',
    aspectRatio: '9:16',
    platform: 'Reels',
    resolution: '1080p',
    duration: 6,
    motionIntensity: 50,
    creativity: 8,
    cameraMotion: 'pan-right',
    status: 'done',
    createdAt: new Date(Date.now() - 18 * 60 * 1000),
    thumbnailGradient: 'linear-gradient(145deg, #041018, #0A2030, #1A3A3A)',
    videoUrl: SAMPLE_VIDEOS[1],
  },
  {
    id: '3',
    prompt: 'Deep ocean trench flythrough — smooth cinema reveals bioluminescent creatures',
    style: 'smooth-cinema',
    aspectRatio: '16:9',
    platform: 'Shorts',
    resolution: '4K',
    duration: 12,
    motionIntensity: 80,
    creativity: 9,
    cameraMotion: 'dolly-out',
    status: 'done',
    createdAt: new Date(Date.now() - 60 * 60 * 1000),
    thumbnailGradient: 'linear-gradient(145deg, #0A0E0A, #1A2A20, #2A3A2E)',
    videoUrl: SAMPLE_VIDEOS[2],
  },
  {
    id: '4',
    prompt: 'Clay warrior figure emerging from raw earth — stop-motion hands moulding the form',
    style: 'clay-motion',
    aspectRatio: '1:1',
    platform: 'TikTok',
    resolution: '1080p',
    duration: 10,
    motionIntensity: 70,
    creativity: 8,
    cameraMotion: 'orbit',
    status: 'done',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    thumbnailGradient: 'linear-gradient(145deg, #1A0E08, #3A2010, #5A3820)',
    videoUrl: SAMPLE_VIDEOS[3],
  },
];

// Progress steps in ms from generation start — mirrors backend simulate_generation timing
const SIM_STEPS = [
  { progress: 8,  ms: 1500 },
  { progress: 20, ms: 4000 },
  { progress: 38, ms: 7000 },
  { progress: 55, ms: 10500 },
  { progress: 70, ms: 14000 },
  { progress: 85, ms: 17000 },
  { progress: 95, ms: 19500 },
  { progress: 100, ms: 22000, done: true },
];

function runClientSimulation(
  id: string,
  mountedRef: React.MutableRefObject<boolean>,
  setGenerations: React.Dispatch<React.SetStateAction<VideoGeneration[]>>,
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>,
) {
  const videoUrl = pickSampleVideo(id);
  SIM_STEPS.forEach(({ progress, ms, done }) => {
    setTimeout(() => {
      if (!mountedRef.current) return;
      setGenerations(prev =>
        prev.map(g =>
          g.id === id
            ? { ...g, progress, status: done ? 'done' : 'processing', ...(done ? { videoUrl } : {}) }
            : g
        )
      );
      if (done && mountedRef.current) setIsGenerating(false);
    }, ms);
  });
}

export function useGenerations() {
  const [generations, setGenerations] = useState<VideoGeneration[]>(loadFromStorage);
  const [isGenerating, setIsGenerating] = useState(false);
  const mountedRef = useRef(true);
  const eventSourcesRef = useRef<Map<string, EventSource>>(new Map());

  useEffect(() => () => {
    mountedRef.current = false;
    eventSourcesRef.current.forEach(es => es.close());
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(generations));
  }, [generations]);

  // Fetch from backend DB on mount and merge — so videos created in previous
  // sessions (or on another device) are retrieved and shown.
  useEffect(() => {
    const token = getStoredToken();
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    fetch(`${API_BASE}/api/generations`, { headers })
      .then(r => r.ok ? r.json() as Promise<DbGeneration[]> : Promise.reject())
      .then(dbItems => {
        if (!mountedRef.current) return;
        setGenerations(prev => mergeWithDb(prev, dbItems));
      })
      .catch(() => {}); // backend may be unreachable in demo/offline mode
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addGeneration = useCallback(
    async (
      prompt: string,
      settings: GenerationSettings,
      story?: FilmStory,
      uploadedVideoUrl?: string,
      sourcePhotoUrl?: string,
    ): Promise<void> => {
      if (!prompt.trim()) return;

      // Uploaded/captured video — add directly as done, skip API
      if (uploadedVideoUrl) {
        const gen: VideoGeneration = {
          id: `upload-${Date.now()}`,
          prompt,
          ...settings,
          status: 'done',
          createdAt: new Date(),
          thumbnailGradient: THUMB_GRADIENTS[settings.style],
          videoUrl: uploadedVideoUrl,
          isUploaded: true,
          story,
        };
        setGenerations(prev => [gen, ...prev]);
        return;
      }

      const tempId = `pending-${Date.now()}`;
      const newGen: VideoGeneration = {
        id: tempId,
        prompt,
        ...settings,
        status: 'pending',
        createdAt: new Date(),
        thumbnailGradient: THUMB_GRADIENTS[settings.style],
        sourcePhotoUrl,
        story,
      };

      setIsGenerating(true);
      setGenerations(prev => [newGen, ...prev]);

      // Submit generation job — 30s timeout to accommodate large base64 photo uploads
      let jobId: string;
      const ctrl = new AbortController();
      const abortTimer = setTimeout(() => ctrl.abort(), 30000);
      try {
        const res = await fetch(`${API_BASE}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            ...settings,
            sourcePhotoUrl: sourcePhotoUrl ?? null,
          }),
          signal: ctrl.signal,
        });
        clearTimeout(abortTimer);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        ({ id: jobId } = await res.json());
      } catch {
        clearTimeout(abortTimer);
        if (!mountedRef.current) return;
        // Backend unreachable — simulate progress client-side so the demo still works
        const simId = `sim-${Date.now()}`;
        setGenerations(prev =>
          prev.map(g => g.id === tempId ? { ...g, id: simId, status: 'processing' } : g)
        );
        runClientSimulation(simId, mountedRef, setGenerations, setIsGenerating);
        return;
      }

      if (!mountedRef.current) return;

      setGenerations(prev =>
        prev.map(g => g.id === tempId ? { ...g, id: jobId, status: 'processing' } : g)
      );

      const es = new EventSource(`${API_BASE}/api/status/${jobId}`);
      eventSourcesRef.current.set(jobId, es);

      es.onmessage = ({ data }) => {
        if (!mountedRef.current) { es.close(); return; }
        const update: Pick<VideoGeneration, 'status' | 'progress' | 'videoUrl'> = JSON.parse(data);
        setGenerations(prev => prev.map(g => g.id === jobId ? { ...g, ...update } : g));
        if (update.status === 'done' || update.status === 'failed') {
          es.close();
          eventSourcesRef.current.delete(jobId);
          if (mountedRef.current) setIsGenerating(false);
        }
      };

      es.onerror = () => {
        es.close();
        eventSourcesRef.current.delete(jobId);
        if (!mountedRef.current) return;
        setGenerations(prev => prev.map(g => g.id === jobId ? { ...g, status: 'failed' } : g));
        setIsGenerating(false);
      };
    },
    []
  );

  const deleteGeneration = useCallback((id: string) => {
    eventSourcesRef.current.get(id)?.close();
    eventSourcesRef.current.delete(id);
    setGenerations(prev => {
      const gen = prev.find(g => g.id === id);
      if (gen?.videoUrl?.startsWith('idb://')) {
        deleteVideoBlob(gen.videoUrl.slice(6)).catch(() => {});
      }
      return prev.filter(g => g.id !== id);
    });
  }, []);

  return { generations, isGenerating, addGeneration, deleteGeneration };
}
