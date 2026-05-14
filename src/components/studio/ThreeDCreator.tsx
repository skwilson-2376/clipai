import React, { useState, useEffect } from 'react';
import type { Character, FilmStory, GenerationSettings } from '../../types';
import { Opt, GenBtn, label, input, pill } from './ShortFilmCreator';

interface Props {
  settings: GenerationSettings;
  characters: Character[];
  isGenerating: boolean;
  onStyleChange: (style: '3d') => void;
  onGenerate: (prompt: string, story?: FilmStory) => void;
}

type CGIStyle     = 'Pixar / Disney' | 'Realistic CGI' | 'Stylized' | 'Cinematic VFX' | 'Low-Poly';
type Environment  = 'Fantasy World' | 'Urban City' | 'Nature' | 'Space' | 'Abstract' | 'Underwater' | 'Post-Apocalyptic';
type Lighting     = 'Golden Hour' | 'Studio' | 'Night / Neon' | 'Dramatic' | 'Sci-Fi Blue' | 'Warm Sunset';
type CameraMove   = 'Orbit' | 'Dolly Push-In' | 'Aerial Crane' | 'Static Wide' | 'Dynamic Chase' | 'Macro Close-Up';

const STYLE_META: Record<CGIStyle, { icon: string; desc: string }> = {
  'Pixar / Disney': { icon: '🎠', desc: 'Rounded forms, expressive characters, warm palette' },
  'Realistic CGI':  { icon: '🎥', desc: 'Photorealistic rendering, subsurface scattering, lifelike' },
  'Stylized':       { icon: '🎨', desc: 'Exaggerated proportions, bold colors, artistic' },
  'Cinematic VFX':  { icon: '💫', desc: 'Hollywood blockbuster quality, VFX compositing' },
  'Low-Poly':       { icon: '💎', desc: 'Geometric, faceted surfaces, modern minimalist' },
};

const ENV_META: Record<Environment, string> = {
  'Fantasy World':      'Magic, castles, mythical creatures, enchanted forests',
  'Urban City':         'Skyscrapers, streets, modern architecture',
  'Nature':             'Forests, mountains, rivers, open landscapes',
  'Space':              'Stars, nebulae, planets, zero-gravity',
  'Abstract':           'Geometric, surreal, non-representational forms',
  'Underwater':         'Ocean depths, coral, bioluminescence, marine life',
  'Post-Apocalyptic':   'Ruins, overgrown, dystopian, survival setting',
};

const CAMERA_META: Record<CameraMove, string> = {
  'Orbit':           '360° rotation around subject',
  'Dolly Push-In':   'Slow move toward subject, reveals detail',
  'Aerial Crane':    'Rise up and pull back, reveals scale',
  'Static Wide':     'Fixed wide shot, environmental storytelling',
  'Dynamic Chase':   'Fast movement, action-forward tracking',
  'Macro Close-Up':  'Extreme close-up, surface detail, texture',
};

export const ThreeDCreator: React.FC<Props> = ({
  characters, isGenerating, onStyleChange, onGenerate,
}) => {
  const [title, setTitle]       = useState('');
  const [cgiStyle, setCgiStyle] = useState<CGIStyle>('Cinematic VFX');
  const [env, setEnv]           = useState<Environment>('Fantasy World');
  const [lighting, setLighting] = useState<Lighting>('Golden Hour');
  const [camera, setCamera]     = useState<CameraMove>('Dolly Push-In');
  const [description, setDesc]  = useState('');
  const [subject, setSubject]   = useState('');
  const [cast, setCast]         = useState<string[]>([]);

  useEffect(() => { onStyleChange('3d'); }, [onStyleChange]);

  const canGenerate = description.trim().length > 5;

  const buildPrompt = () => [
    `3D CGI animation, ${cgiStyle.toLowerCase()} rendering style`,
    title ? `"${title}"` : '',
    description,
    subject ? `Main subject: ${subject}` : '',
    `Environment: ${env.toLowerCase()} setting`,
    `Lighting: ${lighting.toLowerCase()}`,
    `Camera: ${CAMERA_META[camera]}`,
    'ultra-high detail, professional 3D render, 4K resolution, cinematic quality',
    cgiStyle === 'Pixar / Disney'  ? 'warm color grading, subsurface scattering skin, appealing character design' : '',
    cgiStyle === 'Realistic CGI'   ? 'photorealism, ray-traced reflections, PBR materials, depth of field' : '',
    cgiStyle === 'Cinematic VFX'   ? 'motion blur, lens flare, film grain, Hollywood VFX compositing' : '',
    cgiStyle === 'Low-Poly'        ? 'faceted geometry, clean topology, pastel palette' : '',
    env === 'Space'                ? 'volumetric nebulae, star fields, planet surfaces, zero-G debris' : '',
    env === 'Underwater'           ? 'caustic light patterns, particle effects, bioluminescent creatures' : '',
    lighting === 'Night / Neon'    ? 'neon rim lighting, bloom effects, wet surface reflections' : '',
    lighting === 'Sci-Fi Blue'     ? 'cool blue tones, holographic interfaces, ambient occlusion' : '',
  ].filter(Boolean).join(', ');

  const handleGenerate = () => {
    if (!canGenerate) return;
    const story: FilmStory | undefined = title ? {
      title,
      scenes: [{ id: 's1', narration: description, characterId: cast[0] ?? '', dialogue: '', duration: 10 }],
    } : undefined;
    onGenerate(buildPrompt(), story);
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header */}
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 3 }}>
          3D Animation Creator
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Create stunning 3D CGI scenes with full control over style and cinematography.
        </div>
      </div>

      {/* Title */}
      <div>
        <label style={label}>Scene Title <Opt /></label>
        <input value={title} onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Dawn of the Crystal Realm" style={input} />
      </div>

      {/* CGI Style */}
      <div>
        <label style={label}>Render Style</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
          {(Object.keys(STYLE_META) as CGIStyle[]).map(s => (
            <button key={s} type="button" onClick={() => setCgiStyle(s)} title={STYLE_META[s].desc}
              style={pill(cgiStyle === s)}>
              {STYLE_META[s].icon} {s}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{STYLE_META[cgiStyle].desc}</div>
      </div>

      {/* Environment + Lighting row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <label style={label}>Environment</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {(Object.keys(ENV_META) as Environment[]).map(e => (
              <button key={e} type="button" onClick={() => setEnv(e)}
                style={{ ...pill(env === e), textAlign: 'left', padding: '5px 10px', fontSize: 11 }}>
                {e}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label style={label}>Lighting</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {(['Golden Hour', 'Studio', 'Night / Neon', 'Dramatic', 'Sci-Fi Blue', 'Warm Sunset'] as Lighting[]).map(l => (
              <button key={l} type="button" onClick={() => setLighting(l)}
                style={{ ...pill(lighting === l), textAlign: 'left', padding: '5px 10px', fontSize: 11 }}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Camera Movement */}
      <div>
        <label style={label}>Camera Movement</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(Object.keys(CAMERA_META) as CameraMove[]).map(c => (
            <button key={c} type="button" onClick={() => setCamera(c)} title={CAMERA_META[c]}
              style={pill(camera === c)}>
              {c}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 5 }}>{CAMERA_META[camera]}</div>
      </div>

      {/* Main subject */}
      <div>
        <label style={label}>Main Subject <Opt /></label>
        <input value={subject} onChange={e => setSubject(e.target.value)}
          placeholder="e.g. armored knight, alien spacecraft, crystal dragon…" style={input} />
      </div>

      {/* Scene description */}
      <div>
        <label style={label}>Scene Description</label>
        <textarea value={description} onChange={e => setDesc(e.target.value)} rows={3}
          placeholder="Describe what's happening in the scene — action, mood, key visual moments…"
          style={{ ...input, resize: 'none', lineHeight: 1.5 }} />
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

      <GenBtn disabled={!canGenerate || isGenerating} loading={isGenerating} onClick={handleGenerate} label="Generate 3D Animation" icon="🎮" />
    </div>
  );
};
