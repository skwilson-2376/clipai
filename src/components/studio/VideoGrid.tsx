import React, { useState } from 'react';
import type { VideoGeneration, VideoStyle } from '../../types';
import { VideoCard, NewVideoCard } from './VideoCard';

type FilterTab = 'All' | VideoStyle;

const TABS: FilterTab[] = ['All', 'realistic', 'anime', '3d'];
const TAB_LABELS: Record<FilterTab, string> = {
  All: 'All Videos',
  realistic: 'Realistic',
  anime: 'Anime',
  '3d': '3D Animation',
};

interface VideoGridProps {
  generations: VideoGeneration[];
  isGenerating: boolean;
  onDelete: (id: string) => void;
  onPlay: (gen: VideoGeneration) => void;
  onNewClick: () => void;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  generations,
  isGenerating,
  onDelete,
  onPlay,
  onNewClick,
}) => {
  const [activeTab, setActiveTab] = useState<FilterTab>('All');

  const filtered = activeTab === 'All'
    ? generations
    : generations.filter(g => g.style === activeTab);

  const inProgress = filtered.filter(g => g.status === 'processing' || g.status === 'pending');
  const recent     = filtered.filter(g => g.status === 'done' || g.status === 'failed');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Filter by style"
        style={{ display: 'flex', padding: '0 24px', borderBottom: '1px solid var(--border)' }}
      >
        {TABS.map(tab => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            style={{
              fontSize: 13,
              color: activeTab === tab ? 'var(--text)' : 'var(--text-muted)',
              padding: '12px 16px',
              cursor: 'pointer',
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${activeTab === tab ? 'var(--accent)' : 'transparent'}`,
              fontFamily: 'var(--font-body)',
              transition: 'all 0.15s',
            }}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Scrollable grid area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

        {/* In-progress banner */}
        {isGenerating && (
          <div
            className="animate-slide-up"
            style={{
              background: 'rgba(124,92,252,0.1)',
              border: '1px solid rgba(124,92,252,0.3)',
              borderRadius: 'var(--radius-lg)',
              padding: '12px 16px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                border: '2px solid rgba(124,92,252,0.3)',
                borderTopColor: 'var(--accent)',
                borderRadius: '50%',
                flexShrink: 0,
              }}
              className="animate-spin"
            />
            <div>
              <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>Generating your video…</div>
              <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>Usually takes 20–40 seconds</div>
            </div>
          </div>
        )}

        {/* In progress cards */}
        {inProgress.length > 0 && (
          <section style={{ marginBottom: 28 }}>
            <SectionHeader title="In Progress" />
            <div style={gridStyle}>
              {inProgress.map(gen => (
                <VideoCard key={gen.id} generation={gen} onDelete={onDelete} onPlay={onPlay} />
              ))}
            </div>
          </section>
        )}

        {/* Recent generations */}
        <section style={{ marginBottom: 28 }}>
          <SectionHeader
            title="Recent Generations"
            actionLabel={activeTab !== 'All' ? 'See all' : undefined}
            onAction={() => setActiveTab('All')}
          />
          <div style={gridStyle}>
            {recent.map(gen => (
              <VideoCard key={gen.id} generation={gen} onDelete={onDelete} onPlay={onPlay} />
            ))}
            <NewVideoCard onClick={onNewClick} />
          </div>
        </section>

        {/* Empty state */}
        {generations.length === 0 && !isGenerating && (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'var(--text-faint)',
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎬</div>
            <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6 }}>No videos yet</div>
            <div style={{ fontSize: 13 }}>Write a prompt above and hit Generate to create your first video</div>
          </div>
        )}
      </div>
    </div>
  );
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
  gap: 14,
};

const SectionHeader: React.FC<{ title: string; actionLabel?: string; onAction?: () => void }> = ({ title, actionLabel, onAction }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
    <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
      {title}
    </span>
    {actionLabel && (
      <button
        type="button"
        onClick={onAction}
        style={{
          fontSize: 12,
          color: 'var(--accent)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
        }}
      >
        {actionLabel} →
      </button>
    )}
  </div>
);
