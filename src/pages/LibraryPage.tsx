import { useState } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { useNavigate } from 'react-router-dom';
import { useGenerations } from '../hooks/useGenerations';
import type { VideoGeneration, VideoStyle } from '../types';

type FilterTab = 'All' | 'Realistic' | 'Anime' | '3D Animation';
type SortOption = 'Recent' | 'Oldest' | 'A–Z';

const STYLE_LABEL: Record<VideoStyle, FilterTab> = {
  realistic: 'Realistic',
  anime:     'Anime',
  '3d':      '3D Animation',
};

const STYLE_COLORS: Record<FilterTab, string> = {
  All:            'var(--accent)',
  Realistic:      '#7C5CFC',
  Anime:          '#FC5CAD',
  '3D Animation': '#0BC4CC',
};

function timeAgo(date: Date): string {
  const diff  = Date.now() - date.getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (days  > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins  > 0) return `${mins}m ago`;
  return 'just now';
}

export default function LibraryPage() {
  const navigate = useNavigate();
  const { generations, deleteGeneration } = useGenerations();
  const [filter, setFilter] = useState<FilterTab>('All');
  const [sort, setSort]     = useState<SortOption>('Recent');

  const mapped = generations.map(g => ({
    ...g,
    styleLabel: STYLE_LABEL[g.style],
  }));

  const filtered = mapped.filter(v =>
    filter === 'All' || v.styleLabel === filter
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'Recent') return b.createdAt.getTime() - a.createdAt.getTime();
    if (sort === 'Oldest') return a.createdAt.getTime() - b.createdAt.getTime();
    return a.prompt.localeCompare(b.prompt);
  });

  const inProgress = sorted.filter(v => v.status === 'processing' || v.status === 'pending');
  const done       = sorted.filter(v => v.status === 'done');

  return (
    <PageLayout>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>My Library</h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>{generations.length} videos · {inProgress.length} processing</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/studio')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 'var(--radius-md)', background: 'var(--grad-primary)', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
          >
            + Create New
          </button>
        </div>

        {/* Filter + Sort bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 4 }}>
            {(['All', 'Realistic', 'Anime', '3D Animation'] as FilterTab[]).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: filter === tab ? 'var(--accent)' : 'transparent',
                  color: filter === tab ? '#fff' : 'var(--text-muted)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortOption)}
            style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 12, fontFamily: 'var(--font-body)', cursor: 'pointer' }}
          >
            <option>Recent</option>
            <option>Oldest</option>
            <option>A–Z</option>
          </select>
        </div>

        {/* In Progress */}
        {inProgress.length > 0 && (
          <section style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 16 }}>In Progress</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {inProgress.map(v => (
                <VideoCard key={v.id} v={v} onDelete={deleteGeneration} />
              ))}
            </div>
          </section>
        )}

        {/* Done */}
        {done.length > 0 && (
          <section>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 16 }}>
              {inProgress.length > 0 ? 'Completed' : 'All Videos'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {done.map(v => (
                <VideoCard key={v.id} v={v} onDelete={deleteGeneration} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {sorted.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-faint)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>No videos yet</div>
            <div style={{ fontSize: 14, marginBottom: 24 }}>Generate your first video in the Studio</div>
            <button type="button" onClick={() => navigate('/studio')} style={{ padding: '10px 24px', borderRadius: 'var(--radius-md)', background: 'var(--grad-primary)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Open Studio
            </button>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

interface CardProps {
  v: VideoGeneration & { styleLabel: FilterTab };
  onDelete: (id: string) => void;
}

function VideoCard({ v, onDelete }: CardProps) {
  return (
    <div
      style={{
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        position: 'relative',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      {/* Thumbnail */}
      <div style={{ position: 'relative', background: v.thumbnailGradient ?? 'var(--surface2)', aspectRatio: '16/10', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {v.videoUrl ? (
          <video src={v.videoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : v.status === 'processing' || v.status === 'pending' ? (
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 1s linear infinite' }} className="animate-spin" />
        ) : (
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="white"><path d="M6 4l6 4-6 4V4z"/></svg>
          </div>
        )}
        <span style={{ position: 'absolute', top: 8, left: 8, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: (v.status === 'processing' || v.status === 'pending') ? 'rgba(252,92,173,0.9)' : 'rgba(0,0,0,0.5)', color: '#fff', backdropFilter: 'blur(4px)' }}>
          {(v.status === 'processing' || v.status === 'pending') ? 'Processing' : v.styleLabel}
        </span>
        <span style={{ position: 'absolute', bottom: 8, right: 8, fontSize: 10, fontWeight: 600, padding: '3px 7px', borderRadius: 8, background: 'rgba(0,0,0,0.5)', color: '#fff' }}>
          {v.aspectRatio} · {v.duration}s
        </span>
        {/* Delete button */}
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onDelete(v.id); }}
          style={{ position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
        >
          ×
        </button>
      </div>

      {/* Info */}
      <div style={{ padding: '10px 12px' }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', lineHeight: 1.4, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {v.prompt}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-faint)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: STYLE_COLORS[v.styleLabel], fontWeight: 600 }}>{v.styleLabel}</span>
          <span>{timeAgo(v.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
