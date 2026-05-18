import React, { useState } from 'react';
import { Tabs, Empty } from 'antd';
import type { VideoGeneration, VideoStyle } from '../../types';
import { VideoCard, NewVideoCard } from './VideoCard';

type FilterTab = 'all' | VideoStyle;

const TAB_ITEMS = [
  { key: 'all',           label: 'All'          },
  { key: 'parallax-3d',   label: '🌊 Parallax 3D' },
  { key: 'smooth-cinema', label: '🎞️ Cinema'      },
  { key: 'clay-motion',   label: '🏺 Clay'        },
  { key: 'cel-animation', label: '✒️ Cel'         },
  { key: 'ken-burns',     label: '📽️ Ken Burns'   },
  { key: 'watercolor',    label: '🖌️ Watercolor'  },
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
  generations, isGenerating, onDelete, onPlay, onShare, onNewClick,
}) => {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const filtered = activeTab === 'all'
    ? generations
    : generations.filter(g => g.style === activeTab);

  const inProgress = filtered.filter(g => g.status === 'processing' || g.status === 'pending');
  const recent     = filtered.filter(g => g.status === 'done' || g.status === 'failed');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', background: 'var(--bg)' }}>
      <Tabs
        activeKey={activeTab}
        onChange={k => setActiveTab(k as FilterTab)}
        size="small"
        items={TAB_ITEMS}
        style={{ background: 'var(--surface)' }}
        tabBarStyle={{ padding: '0 24px', marginBottom: 0, borderBottom: '1px solid var(--border)' }}
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

        {/* Generating banner */}
        {isGenerating && (
          <div
            className="animate-slide-up"
            style={{
              background: 'rgba(122,171,184,0.07)',
              border: '1px solid rgba(122,171,184,0.20)',
              borderRadius: 10,
              padding: '12px 16px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(122,171,184,0.3)', borderTopColor: '#7AABB8', flexShrink: 0 }}
              className="animate-spin"
            />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Generating your animation…</div>
              <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>Applying depth estimation &amp; motion synthesis</div>
            </div>
          </div>
        )}

        {/* In-progress cards */}
        {inProgress.length > 0 && (
          <section style={{ marginBottom: 28 }}>
            <SectionHeader title="Rendering" />
            <div style={gridStyle}>
              {inProgress.map(gen => (
                <VideoCard key={gen.id} generation={gen} onDelete={onDelete} onPlay={onPlay} onShare={onShare} />
              ))}
            </div>
          </section>
        )}

        {/* Recent */}
        <section style={{ marginBottom: 28 }}>
          {recent.length > 0 && <SectionHeader title="Your Animations" />}
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
              <span style={{ color: 'var(--text-faint)' }}>
                No animations yet — upload a photo and create your first one
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
    <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
      {title}
    </span>
  </div>
);
