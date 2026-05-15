import React, { useState } from 'react';
import { Tabs, Empty } from 'antd';
import type { VideoGeneration, VideoStyle } from '../../types';
import { VideoCard, NewVideoCard } from './VideoCard';

type FilterTab = 'All' | VideoStyle;

const TAB_ITEMS = [
  { key: 'All',       label: 'All Videos'   },
  { key: 'realistic', label: 'Realistic'     },
  { key: 'anime',     label: 'Anime'         },
  { key: '3d',        label: '3D Animation'  },
];

interface VideoGridProps {
  generations: VideoGeneration[];
  isGenerating: boolean;
  onDelete: (id: string) => void;
  onPlay: (gen: VideoGeneration) => void;
  onShare: (gen: VideoGeneration) => void;
  onNewClick: () => void;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  generations,
  isGenerating,
  onDelete,
  onPlay,
  onShare,
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
      <Tabs
        activeKey={activeTab}
        onChange={k => setActiveTab(k as FilterTab)}
        size="small"
        items={TAB_ITEMS}
        style={{ background: '#fff' }}
        tabBarStyle={{ padding: '0 24px', marginBottom: 0, borderBottom: '1px solid #D8D6EE' }}
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

        {/* Generating banner */}
        {isGenerating && (
          <div
            className="animate-slide-up"
            style={{
              background: 'rgba(124,92,252,0.08)',
              border: '1px solid rgba(124,92,252,0.25)',
              borderRadius: 10,
              padding: '12px 16px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(124,92,252,0.3)', borderTopColor: '#7C5CFC', flexShrink: 0 }}
              className="animate-spin"
            />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1829' }}>Generating your video…</div>
              <div style={{ fontSize: 11, color: '#8E8CA6' }}>Usually takes 20–40 seconds</div>
            </div>
          </div>
        )}

        {/* In-progress cards */}
        {inProgress.length > 0 && (
          <section style={{ marginBottom: 28 }}>
            <SectionHeader title="In Progress" />
            <div style={gridStyle}>
              {inProgress.map(gen => (
                <VideoCard key={gen.id} generation={gen} onDelete={onDelete} onPlay={onPlay} onShare={onShare} />
              ))}
            </div>
          </section>
        )}

        {/* Recent */}
        <section style={{ marginBottom: 28 }}>
          {recent.length > 0 && <SectionHeader title="Recent Generations" />}
          <div style={gridStyle}>
            {recent.map(gen => (
              <VideoCard key={gen.id} generation={gen} onDelete={onDelete} onPlay={onPlay} onShare={onShare} />
            ))}
            <NewVideoCard onClick={onNewClick} />
          </div>
        </section>

        {/* Empty state */}
        {generations.length === 0 && !isGenerating && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span style={{ color: '#8E8CA6' }}>
                No videos yet — create your first one above
              </span>
            }
            style={{ padding: '60px 0' }}
          />
        )}
      </div>
    </div>
  );
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(168px, 1fr))',
  gap: 14,
};

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ marginBottom: 14 }}>
    <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: '#1A1829' }}>
      {title}
    </span>
  </div>
);
