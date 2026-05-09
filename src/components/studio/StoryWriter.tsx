import React, { useState } from 'react';
import type { StoryScene, FilmStory, Character } from '../../types';

interface StoryWriterProps {
  characters: Character[];
  onGenerate: (prompt: string, story: FilmStory) => void;
  isGenerating: boolean;
}

const newScene = (): StoryScene => ({
  id: `scene-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  narration: '',
  characterId: undefined,
  dialogue: '',
  duration: 5,
});

const field: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border)',
  background: 'var(--bg)',
  color: 'var(--text)',
  fontSize: 13,
  fontFamily: 'var(--font-body)',
  outline: 'none',
  boxSizing: 'border-box',
};

export const StoryWriter: React.FC<StoryWriterProps> = ({ characters, onGenerate, isGenerating }) => {
  const [title, setTitle]   = useState('');
  const [scenes, setScenes] = useState<StoryScene[]>([newScene()]);

  const updateScene = (id: string, patch: Partial<StoryScene>) =>
    setScenes(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));

  const addScene    = () => setScenes(prev => [...prev, newScene()]);
  const removeScene = (id: string) => setScenes(prev => prev.filter(s => s.id !== id));

  const handleGenerate = () => {
    if (!title.trim() || scenes.every(s => !s.narration.trim())) return;
    const story: FilmStory = { title: title.trim(), scenes };
    const prompt = [
      `Short film: "${title}"`,
      ...scenes.map((s, i) => {
        const char = characters.find(c => c.id === s.characterId);
        const parts = [`Scene ${i + 1}: ${s.narration.trim()}`];
        if (char) parts.push(`Character: ${char.name}`);
        if (s.dialogue?.trim()) parts.push(`Dialogue: "${s.dialogue.trim()}"`);
        return parts.join('. ');
      }),
    ].join(' | ');
    onGenerate(prompt, story);
  };

  const canGenerate = title.trim().length > 0 && scenes.some(s => s.narration.trim().length > 0);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Title */}
      <div>
        <label style={{ fontSize: 10, letterSpacing: '1px', color: 'var(--text-faint)', fontFamily: 'var(--font-display)', display: 'block', marginBottom: 6 }}>
          FILM TITLE
        </label>
        <input
          type="text"
          placeholder="e.g. City of Echoes"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ ...field, fontSize: 15, fontWeight: 500, padding: '10px 14px' }}
        />
      </div>

      {/* Scenes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {scenes.map((scene, idx) => (
          <div
            key={scene.id}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {/* Scene header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>
                Scene {idx + 1}
              </span>
              {scenes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeScene(scene.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: 16, lineHeight: 1, padding: 0 }}
                >
                  ×
                </button>
              )}
            </div>

            {/* Narration */}
            <div>
              <label style={{ fontSize: 10, letterSpacing: '1px', color: 'var(--text-faint)', fontFamily: 'var(--font-display)', display: 'block', marginBottom: 4 }}>
                NARRATION / ACTION
              </label>
              <textarea
                rows={2}
                placeholder="Describe what happens in this scene…"
                value={scene.narration}
                onChange={e => updateScene(scene.id, { narration: e.target.value })}
                style={{ ...field, resize: 'none' }}
              />
            </div>

            {/* Character */}
            {characters.length > 0 && (
              <div>
                <label style={{ fontSize: 10, letterSpacing: '1px', color: 'var(--text-faint)', fontFamily: 'var(--font-display)', display: 'block', marginBottom: 4 }}>
                  CHARACTER (optional)
                </label>
                <select
                  value={scene.characterId ?? ''}
                  onChange={e => updateScene(scene.id, { characterId: e.target.value || undefined })}
                  style={{ ...field }}
                >
                  <option value="">No character</option>
                  {characters.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Dialogue */}
            <div>
              <label style={{ fontSize: 10, letterSpacing: '1px', color: 'var(--text-faint)', fontFamily: 'var(--font-display)', display: 'block', marginBottom: 4 }}>
                DIALOGUE (optional)
              </label>
              <input
                type="text"
                placeholder='"What they say in this scene…"'
                value={scene.dialogue ?? ''}
                onChange={e => updateScene(scene.id, { dialogue: e.target.value })}
                style={field}
              />
            </div>

            {/* Duration */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                <span>Scene Duration</span>
                <span style={{ color: 'var(--accent)', fontWeight: 500 }}>{scene.duration}s</span>
              </div>
              <input
                type="range"
                min={2}
                max={30}
                step={1}
                value={scene.duration}
                onChange={e => updateScene(scene.id, { duration: Number(e.target.value) })}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, paddingBottom: 8 }}>
        <button
          type="button"
          onClick={addScene}
          style={{
            flex: 1,
            padding: '10px 0',
            borderRadius: 'var(--radius-md)',
            border: '1.5px dashed var(--border)',
            background: 'transparent',
            color: 'var(--text-muted)',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          + Add Scene
        </button>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!canGenerate || isGenerating}
          style={{
            flex: 2,
            padding: '10px 0',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: canGenerate && !isGenerating ? 'var(--grad-primary)' : 'var(--surface2)',
            color: canGenerate && !isGenerating ? '#fff' : 'var(--text-faint)',
            fontSize: 13,
            fontWeight: 600,
            cursor: canGenerate && !isGenerating ? 'pointer' : 'not-allowed',
            fontFamily: 'var(--font-body)',
            transition: 'all 0.2s',
          }}
        >
          {isGenerating ? 'Generating Film…' : '🎬 Generate Film'}
        </button>
      </div>
    </div>
  );
};
