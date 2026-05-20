import { useCallback, useEffect, useState } from 'react';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '';

export type SocialPlatform = 'tiktok' | 'reels' | 'shorts' | 'twitter';

export interface SocialConnections {
  connected: Set<SocialPlatform>;
  loading: boolean;
  lastConnected: SocialPlatform | null;
  connect: (platform: SocialPlatform) => void;
  disconnect: (platform: SocialPlatform) => Promise<void>;
  refresh: () => void;
}

export function useSocialConnections(): SocialConnections {
  const [connected, setConnected] = useState<Set<SocialPlatform>>(new Set());
  const [loading, setLoading]     = useState(true);
  const [lastConnected, setLastConnected] = useState<SocialPlatform | null>(null);

  const fetchConnections = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/connections`);
      if (!res.ok) return;
      const platforms: string[] = await res.json();
      setConnected(new Set(platforms as SocialPlatform[]));
    } catch {
      // backend not running or not configured — fail silently in dev
    } finally {
      setLoading(false);
    }
  }, []);

  // Detect OAuth callback result in URL (?platform=tiktok&status=success)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const platform = params.get('platform') as SocialPlatform | null;
    const status   = params.get('status');

    if (platform && status === 'success') {
      setConnected(prev => new Set([...prev, platform]));
      setLastConnected(platform);
      // Remove query params so refresh doesn't re-trigger
      window.history.replaceState({}, '', '/connect');
    }

    fetchConnections();
  }, [fetchConnections]);

  const connect = useCallback((platform: SocialPlatform) => {
    window.location.href = `${API_BASE}/api/oauth/${platform}/start`;
  }, []);

  const disconnect = useCallback(async (platform: SocialPlatform) => {
    try {
      await fetch(`${API_BASE}/api/connections/${platform}`, { method: 'DELETE' });
    } catch {
      // ignore
    }
    setConnected(prev => {
      const next = new Set(prev);
      next.delete(platform);
      return next;
    });
    setLastConnected(null);
  }, []);

  return { connected, loading, lastConnected, connect, disconnect, refresh: fetchConnections };
}
