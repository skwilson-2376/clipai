import React, { useState, useEffect } from 'react';
import type { Character, FilmStory, GenerationSettings } from '../../types';

interface Props {
  settings: GenerationSettings;
  characters: Character[];
  isGenerating: boolean;
  onStyleChange: (style: 'realistic') => void;
  onGenerate: (prompt: string, story?: FilmStory) => void;
}

type Genre   = 'Drama' | 'Thriller' | 'Sci-Fi' | 'Comedy' | 'Horror' | 'Action';
type Tone    = 'Cinematic' | 'Dark & Gritty' | 'Intimate' | 'Epic' | 'Noir';

const GENRE_META: Record<Genre, { icon: string; hint: string }> = {
  Drama:    { icon: '🎭', hint: 'Character-driven emotional story' },
  Thriller: { icon: '🔦', hint: 'Suspense, tension, twists' },
  'Sci-Fi': { icon: '🚀', hint: 'Futuristic worlds and ideas' },
  Comedy:   { icon: '😄', hint: 'Light, humorous storytelling' },
  Horror:   { icon: '👻', hint: 'Fear, dread, the unknown' },
  Action:   { icon: '💥', hint: 'High stakes, fast-paced sequences' },
};

const TONE_META: Record<Tone, string> = {
  Cinematic:       'Wide lens, sweeping shots, film score',
  'Dark & Gritty': 'Handheld, desaturated, raw emotion',
  Intimate:        'Close-ups, natural light, quiet moments',
  Epic:            'Grand scale, orchestral, slow-motion',
  Noir:            'High contrast, shadows, moody atmosphere',
};

export const ShortFilmCreator: React.FC<Props> = ({
  characters, isGenerating, onStyleChange, onGenerate,
}) => {
  const [title, setTitle]         = useState('');
  const [genre, setGenre]         = useState<Genre>('Drama');
  const [tone, setTone]           = useState<Tone>('Cinematic');
  const [synopsis, setSynopsis]   = useState('');
  const [setup, setSetup]         = useState('');
  const [conflict, setConflict]   = useState('');
  const [resolution, setResolution] = useState('');
  const [cast, setCast]           = useState<string[]>([]);

  useEffect(() => { onStyleChange('realistic'); }, [onStyleChange]);

  const canGenerate = synopsis.trim().length > 10;

  const buildPrompt = () => [
    `${genre} short film, ${tone.toLowerCase()} tone`,
    title ? `titled "${title}"` : '',
    synopsis,
    setup        ? `Opening act: ${setup}` : '',
    conflict     ? `Rising conflict: ${conflict}` : '',
    resolution   ? `Resolution: ${resolution}` : '',
    'cinematic quality, professional cinematography, dramatic lighting, film grain',
    genre === 'Sci-Fi' ? 'futuristic VFX, concept art quality' : '',
    tone === 'Noir'    ? 'high contrast shadows, 1940s aesthetic' : '',
    tone === 'Epic'    ? 'sweeping camera movements, large scale' : '',
  ].filter(Boolean).join('. ');

  const handleGenerate = () => {
    if (!canGenerate) return;
    const scenes = [
      setup      && { id: 's1', narration: setup,      characterId: cast[0] ?? '', dialogue: '', duration: 8  },
      conflict   && { id: 's2', narration: conflict,    characterId: cast[1] ?? cast[0] ?? '', dialogue: '', duration: 10 },
      resolution && { id: 's3', narration: resolution,  characterId: cast[0] ?? '', dialogue: '', duration: 8  },
    ].filter(Boolean) as FilmStory['scenes'];

    const story: FilmStory | undefined = scenes.length
      ? { title: title || 'Untitled', scenes }
      : undefined;

    onGenerate(buildPrompt(), story);
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 3 }}>
          Short Film Creator
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Craft a cinematic short film with a 3-act structure.
        </div>
      </div>

      {/* Title */}
      <div>
        <label style={label}>Film Title <Opt /></label>
        <input value={title} onChange={e => setTitle(e.target.value)}
          placeholder="e.g. The Last Signal" style={input} />
      </div>

      {/* Genre */}
      <div>
        <label style={label}>Genre</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(Object.keys(GENRE_META) as Genre[]).map(g => (
            <button key={g} type="button" onClick={() => setGenre(g)} title={GENRE_META[g].hint}
              style={pill(genre === g)}>
              {GENRE_META[g].icon} {g}
            </button>
          ))}
        </div>
      </div>

      {/* Tone */}
      <div>
        <label style={label}>Visual Tone</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(Object.keys(TONE_META) as Tone[]).map(t => (
            <button key={t} type="button" onClick={() => setTone(t)} title={TONE_META[t]}
              style={pill(tone === t)}>
              {t}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 5 }}>{TONE_META[tone]}</div>
      </div>

      {/* Synopsis */}
      <div>
        <label style={label}>Synopsis</label>
        <textarea value={synopsis} onChange={e => setSynopsis(e.target.value)} rows={3}
          placeholder="Describe the core story — who, what's at stake, and what happens..."
          style={{ ...input, resize: 'none', lineHeight: 1.5 }} />
      </div>

      {/* 3-Act Structure */}
      <div>
        <label style={label}>3-Act Structure <Opt /></label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {([
            { val: setup,      set: setSetup,      act: 'ACT I',   sub: 'Setup',         ph: 'Introduce characters, world, and inciting incident…' },
            { val: conflict,   set: setConflict,   act: 'ACT II',  sub: 'Confrontation', ph: 'Rising tension, obstacles, turning point…' },
            { val: resolution, set: setResolution, act: 'ACT III', sub: 'Resolution',    ph: 'Climax and how the story ends…' },
          ] as const).map(({ val, set, act, sub, ph }) => (
            <div key={act}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4 }}>
                {act} — {sub}
              </div>
              <textarea value={val} onChange={e => set(e.target.value)} rows={2}
                placeholder={ph}
                style={{ ...input, resize: 'none', lineHeight: 1.5, fontSize: 12 }} />
            </div>
          ))}
        </div>
      </div>

      {/* Cast */}
      {characters.length > 0 && (
        <div>
          <label style={label}>Cast <Opt /></label>
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

      <GenBtn disabled={!canGenerate || isGenerating} loading={isGenerating} onClick={handleGenerate} label="Generate Short Film" icon="🎬" />
    </div>
  );
};

// ── shared sub-components & styles ─────────────────────────────────────────

export const Opt = () => (
  <span style={{ fontWeight: 400, color: 'var(--text-faint)', marginLeft: 4, fontSize: 11 }}>(optional)</span>
);

export const GenBtn: React.FC<{ disabled: boolean; loading: boolean; onClick: () => void; label: string; icon: string }> =
  ({ disabled, loading, onClick, label, icon }) => (
    <button type="button" onClick={onClick} disabled={disabled}
      style={{
        padding: '13px 0', borderRadius: 'var(--radius-md)', border: 'none',
        background: disabled ? 'var(--border2)' : 'var(--grad-primary)',
        color: '#fff', fontSize: 14, fontWeight: 700,
        cursor: disabled ? 'default' : 'pointer', fontFamily: 'var(--font-body)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'opacity 0.15s', marginTop: 4,
      }}>
      {loading
        ? <><div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff' }} className="animate-spin" />Generating…</>
        : <>{icon} {label}</>}
    </button>
  );

export const label: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 700,
  color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.2px',
};

export const input: React.CSSProperties = {
  width: '100%', padding: '9px 12px',
  borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
  background: 'var(--surface)', color: 'var(--text)',
  fontSize: 13, fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box',
};

export const pill = (active: boolean): React.CSSProperties => ({
  padding: '5px 12px', borderRadius: 20,
  border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
  background: active ? 'rgba(124,92,252,0.15)' : 'transparent',
  color: active ? 'var(--accent)' : 'var(--text-muted)',
  fontSize: 12, fontWeight: active ? 600 : 400,
  cursor: 'pointer', fontFamily: 'var(--font-body)',
  transition: 'all 0.15s', whiteSpace: 'nowrap' as const,
});
