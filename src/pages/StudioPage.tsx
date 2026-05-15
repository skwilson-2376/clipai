import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Tabs, Button, Tag, Space } from 'antd';
import { SettingOutlined, ThunderboltOutlined } from '@ant-design/icons';

import { Navbar }          from '../components/layout/Navbar';
import { LeftSidebar }     from '../components/sidebar/LeftSidebar';
import { RightSidebar }    from '../components/sidebar/RightSidebar';
import { PromptInput }     from '../components/studio/PromptInput';
import { VideoGrid }       from '../components/studio/VideoGrid';
import { VideoModal }      from '../components/studio/VideoModal';
import { StoryWriter }     from '../components/studio/StoryWriter';
import { CameraCapture }   from '../components/studio/CameraCapture';
import { CharacterPanel }  from '../components/people/CharacterPanel';
import { PostModal }       from '../components/studio/PostModal';
import { ShortFilmCreator } from '../components/studio/ShortFilmCreator';
import { AnimeCreator }    from '../components/studio/AnimeCreator';
import { ThreeDCreator }   from '../components/studio/ThreeDCreator';
import { SettingsDrawer }  from '../components/studio/SettingsDrawer';

import { useGenerationSettings } from '../hooks/useGenerationSettings';
import { useGenerations }        from '../hooks/useGenerations';
import { useCharacters }         from '../hooks/useCharacters';
import { useIsMobile }           from '../hooks/useIsMobile';

import type { FilmStory, GenerationMode, UserPlan, VideoGeneration } from '../types';

type MobileTab = 'studio' | 'videos' | 'people' | 'style' | 'output';

const MOCK_PLAN: UserPlan = {
  name: 'Pro Plan',
  creditsTotal: 100,
  creditsUsed: 58,
};

// ── Mobile bottom nav ────────────────────────────────────────────────────────

const MOBILE_TABS: { id: MobileTab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'studio', label: 'Studio',
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden><path d="M10.5 2.5L4 11h6l-.5 6.5L17 9h-6.5l.5-6.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/></svg>,
  },
  {
    id: 'videos', label: 'Videos',
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden><rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/></svg>,
  },
  {
    id: 'people', label: 'People',
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden><circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5"/><path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  },
  {
    id: 'style', label: 'Style',
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden><path d="M10 2a8 8 0 100 16c1.1 0 2-.9 2-2s-.3-1.4-.7-2c-.4-.5-.7-1-.7-1.7 0-1.1.9-2 2-2h1.3C16.4 10.3 18 8.3 18 6A8 8 0 0010 2z" stroke="currentColor" strokeWidth="1.5"/></svg>,
  },
  {
    id: 'output', label: 'Output',
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden><line x1="3" y1="5" x2="17" y2="5"/><line x1="3" y1="10" x2="17" y2="10"/><line x1="3" y1="15" x2="17" y2="15"/></svg>,
  },
];

const MobileBottomNav: React.FC<{ activeTab: MobileTab; onChange: (tab: MobileTab) => void }> = ({ activeTab, onChange }) => (
  <nav style={{ display: 'flex', alignItems: 'stretch', background: '#fff', borderTop: '1px solid #D8D6EE', paddingBottom: 'env(safe-area-inset-bottom)', height: 'var(--bottom-nav-height)' }}>
    {MOBILE_TABS.map(({ id, label, icon }) => {
      const active = activeTab === id;
      return (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', color: active ? '#7C5CFC' : '#8E8CA6', transition: 'color 0.15s' }}
        >
          {icon}
          <span style={{ fontSize: 9, fontFamily: 'var(--font-body)', fontWeight: active ? 600 : 400 }}>{label}</span>
        </button>
      );
    })}
  </nav>
);

// ── Desktop mode tab items ────────────────────────────────────────────────────

const MODE_LABELS: Record<string, string> = {
  shortfilm: '🎬 Short Film',
  anime:     '✨ Anime',
  '3dfilm':  '🎮 3D Animation',
  camera:    '📷 Camera',
  people:    '👥 People',
  prompt:    '⚡ Prompt',
  story:     '📖 Story',
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default function StudioPage() {
  const location = useLocation();

  const [playingGeneration, setPlayingGeneration] = useState<VideoGeneration | null>(null);
  const [sharingGeneration, setSharingGeneration] = useState<VideoGeneration | null>(null);
  const [mobileTab,    setMobileTab]    = useState<MobileTab>('videos');
  const [mobileMode,   setMobileMode]   = useState<GenerationMode>('prompt');
  const [desktopMode,  setDesktopMode]  = useState<GenerationMode | 'people'>('shortfilm');
  const [drawerOpen,   setDrawerOpen]   = useState(false);

  const isMobile = useIsMobile();

  const {
    settings,
    updateStyle, updateAspectRatio, updatePlatform,
    updateResolution, updateDuration, updateMotion, updateCreativity,
    toggleCharacter,
  } = useGenerationSettings();

  const { generations, isGenerating, addGeneration, deleteGeneration } = useGenerations();
  const { characters, addCharacter, removeCharacter }                  = useCharacters();

  useEffect(() => {
    const tpl = (location.state as { template?: { style: string } } | null)?.template;
    if (!tpl) return;
    const styleMap: Record<string, Parameters<typeof updateStyle>[0]> = {
      'Realistic': 'realistic', 'Anime': 'anime', '3D Animation': '3d',
    };
    if (styleMap[tpl.style]) updateStyle(styleMap[tpl.style]);
    if (isMobile) setMobileMode('prompt');
    else setDesktopMode('prompt');
  }, [location.state]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGenerate = (prompt: string, story?: FilmStory) => {
    addGeneration(prompt, settings, story, undefined);
    if (isMobile) setMobileTab('videos');
  };

  const handleCapture = (gen: VideoGeneration) => {
    addGeneration(gen.prompt, settings, undefined, gen.videoUrl);
    if (isMobile) setMobileTab('videos');
  };

  const sharedSidebarProps = {
    settings,
    onStyleChange:    updateStyle,
    onRatioChange:    updateAspectRatio,
    onPlatformChange: updatePlatform,
    onDurationChange: updateDuration,
  };

  const sharedRightProps = {
    settings,
    onResolutionChange: updateResolution,
    onMotionChange:     updateMotion,
    onCreativityChange: updateCreativity,
    generations,
    plan: MOCK_PLAN,
  };

  const drawerProps = {
    settings,
    plan: MOCK_PLAN,
    onStyleChange:      updateStyle,
    onRatioChange:      updateAspectRatio,
    onDurationChange:   updateDuration,
    onPlatformChange:   updatePlatform,
    onResolutionChange: updateResolution,
    onMotionChange:     updateMotion,
    onCreativityChange: updateCreativity,
  };

  const videoGridProps = {
    generations,
    isGenerating,
    onDelete: deleteGeneration,
    onPlay:   (gen: VideoGeneration) => setPlayingGeneration(gen),
    onShare:  (gen: VideoGeneration) => setSharingGeneration(gen),
    onNewClick: () => setDesktopMode('prompt'),
  };

  const characterPanelProps = {
    characters,
    selectedIds:    settings.selectedCharacters,
    onAdd:          addCharacter,
    onRemove:       removeCharacter,
    onToggleSelect: toggleCharacter,
  };

  // ── Film creator two-panel layout ─────────────────────────────────────────
  const filmPanel = (creator: React.ReactNode) => (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: '100%' }}>
      <div style={{ width: 340, flexShrink: 0, borderRight: '1px solid #D8D6EE', overflowY: 'auto', background: '#fff' }}>
        {creator}
      </div>
      <VideoGrid {...videoGridProps} onNewClick={() => {}} />
    </div>
  );

  // ── Mobile ────────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <div style={{ display: 'grid', gridTemplateRows: 'var(--nav-height) 1fr var(--bottom-nav-height)', height: '100dvh', overflow: 'hidden' }}>
          <Navbar mobile />
          <main style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#F7F6FF' }}>
            {mobileTab === 'studio' && (
              <>
                <PromptInput
                  isGenerating={isGenerating}
                  characters={characters}
                  selectedCharacterIds={settings.selectedCharacters}
                  onToggleCharacter={toggleCharacter}
                  mode={mobileMode}
                  onModeChange={setMobileMode}
                  onGenerate={p => handleGenerate(p)}
                />
                {mobileMode === 'story'  && <StoryWriter characters={characters} onGenerate={(p, s) => handleGenerate(p, s)} isGenerating={isGenerating} />}
                {mobileMode === 'camera' && <CameraCapture settings={settings} onCapture={handleCapture} />}
              </>
            )}
            {mobileTab === 'videos' && <VideoGrid {...videoGridProps} onNewClick={() => { setMobileTab('studio'); setMobileMode('prompt'); }} />}
            {mobileTab === 'people' && <CharacterPanel mobile {...characterPanelProps} />}
            {mobileTab === 'style'  && <LeftSidebar  mobile {...sharedSidebarProps} />}
            {mobileTab === 'output' && <RightSidebar mobile {...sharedRightProps} />}
          </main>
          <MobileBottomNav activeTab={mobileTab} onChange={setMobileTab} />
        </div>
        {playingGeneration && <VideoModal generation={playingGeneration} onClose={() => setPlayingGeneration(null)} />}
        {sharingGeneration && <PostModal  generation={sharingGeneration} onClose={() => setSharingGeneration(null)} />}
      </>
    );
  }

  // ── Desktop ───────────────────────────────────────────────────────────────
  const creditsLeft = MOCK_PLAN.creditsTotal - MOCK_PLAN.creditsUsed;

  // Tabs that appear as primary navigation
  const visibleModes: (GenerationMode | 'people')[] = ['shortfilm', 'anime', '3dfilm', 'camera', 'people'];
  // If desktopMode is prompt/story (set by template nav), include it too
  if (desktopMode === 'prompt' || desktopMode === 'story') {
    visibleModes.push(desktopMode);
  }

  const tabItems = visibleModes.map(id => ({ key: id, label: MODE_LABELS[id] ?? id }));

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#F7F6FF' }}>
        <Navbar />

        {/* Mode tab bar */}
        <div style={{ background: '#fff', borderBottom: '1px solid #D8D6EE', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 24px' }}>
            <div style={{ flex: 1 }}>
              <Tabs
                activeKey={desktopMode}
                onChange={key => setDesktopMode(key as GenerationMode | 'people')}
                items={tabItems}
                tabBarStyle={{ marginBottom: 0, border: 'none' }}
                style={{ marginBottom: -1 }}
              />
            </div>
            <Space size="small" style={{ flexShrink: 0, paddingBottom: 2 }}>
              <Tag
                icon={<ThunderboltOutlined />}
                color="purple"
                style={{ cursor: 'default', margin: 0 }}
              >
                {creditsLeft} credits
              </Tag>
              <Button
                icon={<SettingOutlined />}
                size="small"
                onClick={() => setDrawerOpen(true)}
              >
                Settings
              </Button>
            </Space>
          </div>
        </div>

        {/* Content */}
        <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {desktopMode === 'shortfilm' && filmPanel(
            <ShortFilmCreator settings={settings} characters={characters} isGenerating={isGenerating} onStyleChange={updateStyle} onGenerate={(p, s) => handleGenerate(p, s)} />
          )}
          {desktopMode === 'anime' && filmPanel(
            <AnimeCreator settings={settings} characters={characters} isGenerating={isGenerating} onStyleChange={updateStyle} onGenerate={(p, s) => handleGenerate(p, s)} />
          )}
          {desktopMode === '3dfilm' && filmPanel(
            <ThreeDCreator settings={settings} characters={characters} isGenerating={isGenerating} onStyleChange={updateStyle} onGenerate={(p, s) => handleGenerate(p, s)} />
          )}
          {desktopMode === 'prompt' && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <PromptInput
                isGenerating={isGenerating}
                characters={characters}
                selectedCharacterIds={settings.selectedCharacters}
                onToggleCharacter={toggleCharacter}
                mode="prompt"
                onModeChange={m => setDesktopMode(m)}
                onGenerate={p => handleGenerate(p)}
              />
              <VideoGrid {...videoGridProps} />
            </div>
          )}
          {desktopMode === 'story' && (
            <StoryWriter characters={characters} onGenerate={(p, s) => handleGenerate(p, s)} isGenerating={isGenerating} />
          )}
          {desktopMode === 'camera' && (
            <CameraCapture settings={settings} onCapture={handleCapture} />
          )}
          {desktopMode === 'people' && (
            <CharacterPanel {...characterPanelProps} />
          )}
        </main>
      </div>

      <SettingsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} {...drawerProps} />
      {playingGeneration && <VideoModal generation={playingGeneration} onClose={() => setPlayingGeneration(null)} />}
      {sharingGeneration && <PostModal  generation={sharingGeneration} onClose={() => setSharingGeneration(null)} />}
    </>
  );
}
