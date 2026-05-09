import { useState } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { useNavigate } from 'react-router-dom';

type FilterTab = 'All' | 'Realistic' | 'Anime' | '3D Animation';
type SortOption = 'Recent' | 'Oldest' | 'A–Z';

interface MockVideo {
  id: string;
  prompt: string;
  style: string;
  ratio: string;
  duration: number;
  status: 'done' | 'processing';
  gradient: string;
  ago: string;
}

const MOCK_VIDEOS: MockVideo[] = [
  { id: '1', prompt: 'Futuristic city at sunset with flying cars', style: 'Realistic', ratio: '16:9', duration: 8,  status: 'done',       gradient: 'linear-gradient(135deg,#1a1a2e,#7C5CFC)', ago: '2m ago' },
  { id: '2', prompt: 'Cherry blossoms falling in slow motion', style: 'Anime', ratio: '9:16', duration: 6,  status: 'done',       gradient: 'linear-gradient(135deg,#FC5CAD,#FFD3E8)', ago: '18m ago' },
  { id: '3', prompt: 'Abstract crystal cave with glowing minerals', style: '3D Animation', ratio: '1:1',  duration: 12, status: 'done',       gradient: 'linear-gradient(135deg,#0BC4CC,#7C5CFC)', ago: '1h ago' },
  { id: '4', prompt: 'Mecha robot battle in a futuristic cityscape', style: 'Anime', ratio: '9:16', duration: 10, status: 'processing', gradient: 'linear-gradient(135deg,#FC5C5C,#FC5CAD)', ago: '5m ago' },
  { id: '5', prompt: 'Ocean waves crashing at golden hour beach', style: 'Realistic', ratio: '16:9', duration: 15, status: 'done',       gradient: 'linear-gradient(135deg,#FFD93D,#FF6B6B)', ago: '3h ago' },
  { id: '6', prompt: 'Neon city rain puddle reflections at midnight', style: 'Realistic', ratio: '9:16', duration: 8,  status: 'done',       gradient: 'linear-gradient(135deg,#7C5CFC,#0BC4CC)', ago: '5h ago' },
  { id: '7', prompt: 'Cute anime character dancing in cherry blossom park', style: 'Anime', ratio: '1:1',  duration: 6,  status: 'done',       gradient: 'linear-gradient(135deg,#FF9A9E,#FECFEF)', ago: '1d ago' },
  { id: '8', prompt: 'Space station orbiting alien planet with twin moons', style: '3D Animation', ratio: '16:9', duration: 20, status: 'done',       gradient: 'linear-gradient(135deg,#0F2027,#2C5364)', ago: '2d ago' },
];

const STYLE_COLORS: Record<string, string> = {
  Realistic: '#7C5CFC',
  Anime:     '#FC5CAD',
  '3D Animation': '#0BC4CC',
};

export default function LibraryPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterTab>('All');
  const [sort, setSort]     = useState<SortOption>('Recent');

  const filtered = MOCK_VIDEOS.filter(v => filter === 'All' || v.style === filter);
  const inProgress = filtered.filter(v => v.status === 'processing');
  const done       = filtered.filter(v => v.status === 'done');

  const VideoCard = ({ v }: { v: MockVideo }) => (
    <div
      style={{
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
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
      <div style={{ position: 'relative', background: v.gradient, aspectRatio: '16/10', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {v.status === 'processing' ? (
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 1s linear infinite' }} className="animate-spin" />
        ) : (
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="white"><path d="M6 4l6 4-6 4V4z"/></svg>
          </div>
        )}
        <span style={{ position: 'absolute', top: 8, left: 8, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: v.status === 'processing' ? 'rgba(252,92,173,0.9)' : 'rgba(0,0,0,0.5)', color: '#fff', backdropFilter: 'blur(4px)' }}>
          {v.status === 'processing' ? 'Processing' : v.style}
        </span>
        <span style={{ position: 'absolute', bottom: 8, right: 8, fontSize: 10, fontWeight: 600, padding: '3px 7px', borderRadius: 8, background: 'rgba(0,0,0,0.5)', color: '#fff' }}>
          {v.ratio} · {v.duration}s
        </span>
      </div>
      {/* Info */}
      <div style={{ padding: '10px 12px' }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', lineHeight: 1.4, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {v.prompt}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-faint)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: STYLE_COLORS[v.style] ?? 'var(--accent)', fontWeight: 600 }}>{v.style}</span>
          <span>{v.ago}</span>
        </div>
      </div>
    </div>
  );

  return (
    <PageLayout>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>My Library</h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>{MOCK_VIDEOS.length} videos · {inProgress.length} processing</p>
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
              {inProgress.map(v => <VideoCard key={v.id} v={v} />)}
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
              {done.map(v => <VideoCard key={v.id} v={v} />)}
            </div>
          </section>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
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
