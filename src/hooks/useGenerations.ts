import { useState, useCallback, useEffect, useRef } from 'react';
import type { FilmStory, VideoGeneration, GenerationSettings } from '../types';
import { THUMB_GRADIENTS } from '../constants/thumbnailGradients';

const SEED_GENERATIONS: VideoGeneration[] = [
  {
    id: '1',
    prompt: 'Futuristic city at sunset with flying cars, neon lights reflecting on rain-soaked streets',
    style: 'realistic',
    aspectRatio: '1:1',
    platform: 'TikTok',
    resolution: '1080p',
    duration: 8,
    motionIntensity: 65,
    creativity: 7,
    status: 'done',
    createdAt: new Date(Date.now() - 2 * 60 * 1000),
    thumbnailGradient: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
  },
  {
    id: '2',
    prompt: 'Cherry blossoms falling in the wind, soft pink petals swirling',
    style: 'anime',
    aspectRatio: '9:16',
    platform: 'Reels',
    resolution: '1080p',
    duration: 6,
    motionIntensity: 50,
    creativity: 8,
    status: 'done',
    createdAt: new Date(Date.now() - 18 * 60 * 1000),
    thumbnailGradient: 'linear-gradient(135deg, #1f0036, #6a0057, #c60092)',
  },
  {
    id: '3',
    prompt: 'Abstract crystal cave fly-through with glowing formations and reflective surfaces',
    style: '3d',
    aspectRatio: '16:9',
    platform: 'Shorts',
    resolution: '4K',
    duration: 12,
    motionIntensity: 80,
    creativity: 9,
    status: 'done',
    createdAt: new Date(Date.now() - 60 * 60 * 1000),
    thumbnailGradient: 'linear-gradient(135deg, #004d7a, #008793, #00bf72)',
  },
  {
    id: '4',
    prompt: 'Mecha robot battle in a futuristic arena, sparks flying, dramatic lighting',
    style: 'anime',
    aspectRatio: '9:16',
    platform: 'TikTok',
    resolution: '1080p',
    duration: 10,
    motionIntensity: 90,
    creativity: 8,
    status: 'processing',
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
    thumbnailGradient: 'linear-gradient(135deg, #1f0036, #6a0057, #c60092)',
  },
];

export function useGenerations() {
  const [generations, setGenerations] = useState<VideoGeneration[]>(SEED_GENERATIONS);
  const [isGenerating, setIsGenerating] = useState(false);
  const mountedRef = useRef(true);
  const eventSourcesRef = useRef<Map<string, EventSource>>(new Map());

  useEffect(() => () => {
    mountedRef.current = false;
    eventSourcesRef.current.forEach(es => es.close());
  }, []);

  const addGeneration = useCallback(
    async (
      prompt: string,
      settings: GenerationSettings,
      story?: FilmStory,
      uploadedVideoUrl?: string,
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
        story,
      };

      setIsGenerating(true);
      setGenerations(prev => [newGen, ...prev]);

      // Submit generation job
      let jobId: string;
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, ...settings }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        ({ id: jobId } = await res.json());
      } catch {
        if (!mountedRef.current) return;
        setGenerations(prev => prev.map(g => g.id === tempId ? { ...g, status: 'failed' } : g));
        setIsGenerating(false);
        return;
      }

      if (!mountedRef.current) return;

      setGenerations(prev =>
        prev.map(g => g.id === tempId ? { ...g, id: jobId, status: 'processing' } : g)
      );

      const es = new EventSource(`/api/status/${jobId}`);
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
    setGenerations(prev => prev.filter(g => g.id !== id));
  }, []);

  return { generations, isGenerating, addGeneration, deleteGeneration };
}
