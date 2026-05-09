import { useRef, useState } from 'react';
import './styles/globals.css';

import { Navbar }       from './components/layout/Navbar';
import { LeftSidebar }  from './components/sidebar/LeftSidebar';
import { RightSidebar } from './components/sidebar/RightSidebar';
import { PromptInput }  from './components/studio/PromptInput';
import { VideoGrid }    from './components/studio/VideoGrid';
import { VideoModal }   from './components/studio/VideoModal';

import { useGenerationSettings } from './hooks/useGenerationSettings';
import { useGenerations }        from './hooks/useGenerations';

import type { UserPlan, VideoGeneration } from './types';

const MOCK_PLAN: UserPlan = {
  name: 'Pro Plan',
  creditsTotal: 100,
  creditsUsed: 58,
};

export default function App() {
  const promptRef = useRef<HTMLDivElement>(null);
  const [playingGeneration, setPlayingGeneration] = useState<VideoGeneration | null>(null);

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
  };

  const scrollToPrompt = () => {
    promptRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
          <LeftSidebar
            settings={settings}
            onStyleChange={updateStyle}
            onRatioChange={updateAspectRatio}
            onPlatformChange={updatePlatform}
            onDurationChange={updateDuration}
          />

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
              onNewClick={scrollToPrompt}
            />
          </main>

          <RightSidebar
            settings={settings}
            onResolutionChange={updateResolution}
            onMotionChange={updateMotion}
            onCreativityChange={updateCreativity}
            generations={generations}
            plan={MOCK_PLAN}
          />
        </div>
      </div>

      {playingGeneration && (
        <VideoModal
          generation={playingGeneration}
          onClose={() => setPlayingGeneration(null)}
        />
      )}
    </>
  );
}
