import React, { useRef, useState } from 'react';
import './styles/globals.css';

import { Navbar }       from './components/layout/Navbar';
import { LeftSidebar }  from './components/sidebar/LeftSidebar';
import { RightSidebar } from './components/sidebar/RightSidebar';
import { PromptInput }  from './components/studio/PromptInput';
import { VideoGrid }    from './components/studio/VideoGrid';
import { VideoModal }   from './components/studio/VideoModal';

import { useGenerationSettings } from './hooks/useGenerationSettings';
import { useGenerations }        from './hooks/useGenerations';
import { useIsMobile }           from './hooks/useIsMobile';

import type { UserPlan, VideoGeneration } from './types';

type MobileTab = 'generate' | 'videos' | 'style' | 'settings';

const MOCK_PLAN: UserPlan = {
  name: 'Pro Plan',
  creditsTotal: 100,
  creditsUsed: 58,
};

const TAB_CONFIG: { id: MobileTab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'generate',
    label: 'Generate',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path d="M10.5 2.5L4 11h6l-.5 6.5L17 9h-6.5l.5-6.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'videos',
    label: 'Videos',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
        <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    id: 'style',
    label: 'Style',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path d="M10 2a8 8 0 100 16c1.1 0 2-.9 2-2s-.3-1.4-.7-2c-.4-.5-.7-1-.7-1.7 0-1.1.9-2 2-2h1.3C16.4 10.3 18 8.3 18 6A8 8 0 0010 2z" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="6.5" cy="9" r="1.25" fill="currentColor"/>
        <circle cx="8.5" cy="5.5" r="1.25" fill="currentColor"/>
        <circle cx="12.5" cy="5" r="1.25" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Output',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
        <line x1="3" y1="5" x2="17" y2="5"/>
        <line x1="3" y1="10" x2="17" y2="10"/>
        <line x1="3" y1="15" x2="17" y2="15"/>
        <circle cx="7" cy="5" r="2" fill="var(--bg)"/>
        <circle cx="13" cy="10" r="2" fill="var(--bg)"/>
        <circle cx="7" cy="15" r="2" fill="var(--bg)"/>
      </svg>
    ),
  },
];

const MobileBottomNav: React.FC<{ activeTab: MobileTab; onChange: (tab: MobileTab) => void }> = ({ activeTab, onChange }) => (
  <nav
    style={{
      display: 'flex',
      alignItems: 'stretch',
      background: 'var(--surface)',
      borderTop: '1px solid var(--border)',
      paddingBottom: 'env(safe-area-inset-bottom)',
      height: 'var(--bottom-nav-height)',
    }}
  >
    {TAB_CONFIG.map(({ id, label, icon }) => {
      const active = activeTab === id;
      return (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: active ? 'var(--accent)' : 'var(--text-muted)',
            transition: 'color 0.15s',
          }}
        >
          {icon}
          <span style={{ fontSize: 10, fontFamily: 'var(--font-body)', fontWeight: active ? 600 : 400 }}>
            {label}
          </span>
        </button>
      );
    })}
  </nav>
);

export default function App() {
  const promptRef = useRef<HTMLDivElement>(null);
  const [playingGeneration, setPlayingGeneration] = useState<VideoGeneration | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>('videos');
  const isMobile = useIsMobile();

  const {
    settings,
    updateStyle,
    updateAspectRatio,
    updatePlatform,
    updateResolution,
    updateDuration,
    updateMotion,
    updateCreativity,
  } = useGenerationSettings();

  const { generations, isGenerating, addGeneration, deleteGeneration } = useGenerations();

  const handleGenerate = (prompt: string) => {
    addGeneration(prompt, settings);
    if (isMobile) setMobileTab('videos');
  };

  const sharedSidebarProps = {
    settings,
    onStyleChange: updateStyle,
    onRatioChange: updateAspectRatio,
    onPlatformChange: updatePlatform,
    onDurationChange: updateDuration,
  };

  const sharedRightProps = {
    settings,
    onResolutionChange: updateResolution,
    onMotionChange: updateMotion,
    onCreativityChange: updateCreativity,
    generations,
    plan: MOCK_PLAN,
  };

  if (isMobile) {
    return (
      <>
        <div
          style={{
            display: 'grid',
            gridTemplateRows: 'var(--nav-height) 1fr var(--bottom-nav-height)',
            height: '100dvh',
            overflow: 'hidden',
          }}
        >
          <Navbar mobile />

          <main style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
            {mobileTab === 'generate' && (
              <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                <PromptInput onGenerate={handleGenerate} isGenerating={isGenerating} />
              </div>
            )}
            {mobileTab === 'videos' && (
              <VideoGrid
                generations={generations}
                isGenerating={isGenerating}
                onDelete={deleteGeneration}
                onPlay={gen => setPlayingGeneration(gen)}
                onNewClick={() => setMobileTab('generate')}
              />
            )}
            {mobileTab === 'style' && (
              <LeftSidebar mobile {...sharedSidebarProps} />
            )}
            {mobileTab === 'settings' && (
              <RightSidebar mobile {...sharedRightProps} />
            )}
          </main>

          <MobileBottomNav activeTab={mobileTab} onChange={setMobileTab} />
        </div>

        {playingGeneration && (
          <VideoModal generation={playingGeneration} onClose={() => setPlayingGeneration(null)} />
        )}
      </>
    );
  }

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateRows: 'var(--nav-height) 1fr',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <Navbar />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'var(--sidebar-width) 1fr var(--sidebar-right-width)',
            overflow: 'hidden',
          }}
        >
          <LeftSidebar {...sharedSidebarProps} />

          <main
            style={{
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              background: 'var(--bg)',
            }}
          >
            <div ref={promptRef}>
              <PromptInput onGenerate={handleGenerate} isGenerating={isGenerating} />
            </div>

            <VideoGrid
              generations={generations}
              isGenerating={isGenerating}
              onDelete={deleteGeneration}
              onPlay={gen => setPlayingGeneration(gen)}
              onNewClick={() => promptRef.current?.scrollIntoView({ behavior: 'smooth' })}
            />
          </main>

          <RightSidebar {...sharedRightProps} />
        </div>
      </div>

      {playingGeneration && (
        <VideoModal generation={playingGeneration} onClose={() => setPlayingGeneration(null)} />
      )}
    </>
  );
}
