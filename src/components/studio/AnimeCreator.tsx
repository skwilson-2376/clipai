import React, { useState, useEffect } from 'react';
import type { Character, FilmStory, GenerationSettings } from '../../types';
import { Opt, GenBtn, label, input, pill } from './ShortFilmCreator';

interface Props {
  settings: GenerationSettings;
  characters: Character[];
  isGenerating: boolean;
  onStyleChange: (style: 'anime') => void;
  onGenerate: (prompt: string, story?: FilmStory) => void;
}

type AnimeGenre    = 'Shonen' | 'Shojo' | 'Mecha' | 'Isekai' | 'Slice of Life' | 'Fantasy' | 'Cyberpunk';
type ArtStyle      = 'Classic' | 'Ghibli' | 'Detailed' | 'Modern' | 'Retro 80s';
type SceneType     = 'Action' | 'Dialogue' | 'Training' | 'Romance' | 'Battle' | 'Emotional';
type Mood          = 'Determined' | 'Melancholic' | 'Hopeful' | 'Intense' | 'Comedic';

const GENRE_META: Record<AnimeGenre, { icon: string; desc: string }> = {
  Shonen:         { icon: '⚡', desc: 'Young hero, friendship, growth, battles' },
  Shojo:          { icon: '🌸', desc: 'Romance, emotions, coming-of-age' },
  Mecha:          { icon: '🤖', desc: 'Giant robots, pilots, epic battles' },
  Isekai:         { icon: '🌀', desc: 'Another world, fantasy, power fantasy' },
  'Slice of Life': { icon: '☕', desc: 'Everyday moments, calm, relatable' },
  Fantasy:        { icon: '🏯', desc: 'Magic, quests, epic world-building' },
  Cyberpunk:      { icon: '🌆', desc: 'Neon dystopia, hackers, future noir' },
};

const ART_META: Record<ArtStyle, string> = {
  Classic:   'Clean lines, cel-shading, Toei/early Sunrise style',
  Ghibli:    'Painterly backgrounds, soft light, Studio Ghibli aesthetic',
  Detailed:  'High detail, Madhouse/Ufotable quality, lush environments',
  Modern:    'Sharp, vibrant, KyoAni fluid animation feel',
  'Retro 80s': 'Bold outlines, limited palette, VHS-era OVA style',
};

const SCENE_META: Record<SceneType, string> = {
  Action:    'Fast cuts, dynamic poses, speed lines',
  Dialogue:  'Expressive faces, reaction shots, talking scene',
  Training:  'Montage, effort, sweat and determination',
  Romance:   'Soft lighting, close-ups, cherry blossoms',
  Battle:    'Epic clash, power beams, dramatic stances',
  Emotional: 'Tears, silence, inner monologue moments',
};

export const AnimeCreator: React.FC<Props> = ({
  characters, isGenerating, onStyleChange, onGenerate,
}) => {
  const [title, setTitle]       = useState('');
  const [genre, setGenre]       = useState<AnimeGenre>('Shonen');
  const [artStyle, setArtStyle] = useState<ArtStyle>('Modern');
  const [sceneType, setSceneType] = useState<SceneType>('Action');
  const [mood, setMood]         = useState<Mood>('Determined');
  const [description, setDesc]  = useState('');
  const [setting, setSetting]   = useState('');
  const [cast, setCast]         = useState<string[]>([]);

  useEffect(() => { onStyleChange('anime'); }, [onStyleChange]);

  const canGenerate = description.trim().length > 5;

  const buildPrompt = () => [
    `${genre} anime, ${artStyle.toLowerCase()} art style`,
    title ? `episode: "${title}"` : '',
    `${sceneType.toLowerCase()} scene, ${mood.toLowerCase()} mood`,
    description,
    setting ? `Setting: ${setting}` : '',
    'high quality anime animation, vibrant colors, detailed character expressions',
    artStyle === 'Ghibli'    ? 'painterly Studio Ghibli style, lush watercolor backgrounds' : '',
    artStyle === 'Retro 80s' ? 'retro OVA aesthetic, bold outlines, limited color palette' : '',
    artStyle === 'Detailed'  ? 'Ufotable quality rendering, fluid motion, cinematic lighting' : '',
    genre === 'Mecha'        ? 'mecha robot designs, metallic sheen, cockpit shots' : '',
    genre === 'Cyberpunk'    ? 'neon-lit streets, holographic interfaces, rain-soaked city' : '',
    sceneType === 'Action'   ? 'speed lines, dynamic camera angles, impact frames' : '',
    sceneType === 'Romance'  ? 'cherry blossoms, golden hour lighting, soft bokeh' : '',
  ].filter(Boolean).join(', ');

  const handleGenerate = () => {
    if (!canGenerate) return;
    const story: FilmStory | undefined = title ? {
      title,
      scenes: [{ id: 's1', narration: description, characterId: cast[0] ?? '', dialogue: '', duration: 8 }],
    } : undefined;
    onGenerate(buildPrompt(), story);
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header */}
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 3 }}>
          Anime Creator
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Produce anime scenes with authentic genre styles and art direction.
        </div>
      </div>

      {/* Episode title */}
      <div>
        <label style={label}>Episode / Title <Opt /></label>
        <input value={title} onChange={e => setTitle(e.target.value)}
          placeholder="e.g. The Awakening" style={input} />
      </div>

      {/* Genre */}
      <div>
        <label style={label}>Genre</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(Object.keys(GENRE_META) as AnimeGenre[]).map(g => (
            <button key={g} type="button" onClick={() => setGenre(g)} title={GENRE_META[g].desc}
              style={pill(genre === g)}>
              {GENRE_META[g].icon} {g}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 5 }}>{GENRE_META[genre].desc}</div>
      </div>

      {/* Art Style */}
      <div>
        <label style={label}>Animation Style</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(Object.keys(ART_META) as ArtStyle[]).map(s => (
            <button key={s} type="button" onClick={() => setArtStyle(s)} title={ART_META[s]}
              style={pill(artStyle === s)}>
              {s}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 5 }}>{ART_META[artStyle]}</div>
      </div>

      {/* Scene type + Mood row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <label style={label}>Scene Type</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {(Object.keys(SCENE_META) as SceneType[]).map(s => (
              <button key={s} type="button" onClick={() => setSceneType(s)}
                style={{ ...pill(sceneType === s), textAlign: 'left', padding: '5px 10px' }}>
                {s}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 5 }}>{SCENE_META[sceneType]}</div>
        </div>
        <div>
          <label style={label}>Character Mood</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {(['Determined', 'Melancholic', 'Hopeful', 'Intense', 'Comedic'] as Mood[]).map(m => (
              <button key={m} type="button" onClick={() => setMood(m)}
                style={{ ...pill(mood === m), textAlign: 'left', padding: '5px 10px' }}>
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scene description */}
      <div>
        <label style={label}>Scene Description</label>
        <textarea value={description} onChange={e => setDesc(e.target.value)} rows={3}
          placeholder="Describe what happens in this scene — action, emotion, key moment…"
          style={{ ...input, resize: 'none', lineHeight: 1.5 }} />
      </div>

      {/* Setting */}
      <div>
        <label style={label}>Setting / Location <Opt /></label>
        <input value={setting} onChange={e => setSetting(e.target.value)}
          placeholder="e.g. rooftop at sunset, ancient shrine, mecha hangar…" style={input} />
      </div>

      {/* Cast */}
      {characters.length > 0 && (
        <div>
          <label style={label}>Characters <Opt /></label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {characters.map(c => {
              const on = cast.includes(c.id);
              return (
                <button key={c.id} type="button"
                  onClick={() => setCast(p => on ? p.filter(id => id !== c.id) : [...p, c.id])}
                  style={{ ...pill(on), display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: c.gradient }} />
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <GenBtn disabled={!canGenerate || isGenerating} loading={isGenerating} onClick={handleGenerate} label="Generate Anime Scene" icon="✨" />
    </div>
  );
};
