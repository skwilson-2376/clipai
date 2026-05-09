import React, { useState, useRef } from 'react';
import { Button } from '../shared/Button';
import type { Character, GenerationMode } from '../../types';

const QUICK_TAGS = [
  'cinematic', 'slow motion', '4K quality', 'vibrant colors',
  'dramatic lighting', 'aerial view', 'close-up', 'epic scale',
];

interface PromptInputProps {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
  characters?: Character[];
  selectedCharacterIds?: string[];
  onToggleCharacter?: (id: string) => void;
  mode: GenerationMode;
  onModeChange: (mode: GenerationMode) => void;
}

const MODE_TABS: { id: GenerationMode; label: string }[] = [
  { id: 'prompt', label: '✏️ Prompt' },
  { id: 'story',  label: '🎬 Story'  },
  { id: 'camera', label: '📷 Camera' },
];

export const PromptInput: React.FC<PromptInputProps> = ({
  onGenerate,
  isGenerating,
  characters = [],
  selectedCharacterIds = [],
  onToggleCharacter,
  mode,
  onModeChange,
}) => {
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleGenerate = () => {
    if (prompt.trim() && !isGenerating) onGenerate(prompt.trim());
  };

  const addTag = (tag: string) => {
    const sep  = prompt.trimEnd().endsWith(',') || prompt === '' ? ' ' : ', ';
    const next = prompt === '' ? tag : `${prompt.trimEnd()}${sep}${tag}`;
    setPrompt(next);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleGenerate(); }
  };

  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      {/* Mode tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 24px' }}>
        {MODE_TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onModeChange(tab.id)}
            style={{
              fontSize: 12,
              fontWeight: 500,
              padding: '10px 14px',
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${mode === tab.id ? 'var(--accent)' : 'transparent'}`,
              color: mode === tab.id ? 'var(--text)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              transition: 'all 0.15s',
              marginBottom: -1,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mode === 'prompt' && (
        <div style={{ padding: '16px 24px' }}>
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '14px 16px',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = 'rgba(124,92,252,0.5)';
              e.currentTarget.style.boxShadow   = '0 0 0 3px rgba(124,92,252,0.08)';
            }}
            onBlur={e => {
              if (!e.currentTarget.contains(e.relatedTarget)) {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow   = 'none';
              }
            }}
          >
            <div style={{ fontSize: 10, letterSpacing: '1px', color: 'var(--text-faint)', marginBottom: 6, fontFamily: 'var(--font-display)' }}>
              DESCRIBE YOUR VIDEO
            </div>

            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              placeholder="A futuristic city at sunset with flying cars, neon lights reflecting on rain-soaked streets, cinematic wide angle..."
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text)',
                fontSize: 14,
                fontFamily: 'var(--font-body)',
                resize: 'none',
                lineHeight: 1.6,
              }}
            />

            {/* Character chips */}
            {characters.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: 10, color: 'var(--text-faint)', alignSelf: 'center', marginRight: 2, fontFamily: 'var(--font-display)', letterSpacing: '0.5px' }}>
                  CAST:
                </span>
                {characters.map(char => {
                  const active = selectedCharacterIds.includes(char.id);
                  return (
                    <button
                      key={char.id}
                      type="button"
                      onClick={() => onToggleCharacter?.(char.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '3px 8px 3px 4px',
                        borderRadius: 20,
                        border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                        background: active ? 'var(--pill-bg)' : 'transparent',
                        color: active ? 'var(--accent)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: 11,
                        fontFamily: 'var(--font-body)',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ width: 16, height: 16, borderRadius: '50%', background: char.imageUrl ? 'transparent' : char.gradient, overflow: 'hidden', flexShrink: 0 }}>
                        {char.imageUrl && <img src={char.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      {char.name}
                    </button>
                  );
                })}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, gap: 8 }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
                {QUICK_TAGS.slice(0, 4).map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addTag(tag)}
                    style={{
                      fontSize: 11,
                      padding: '3px 10px',
                      borderRadius: 20,
                      background: 'var(--surface2)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >
                    + {tag}
                  </button>
                ))}
              </div>

              <Button
                variant="primary"
                size="md"
                loading={isGenerating}
                disabled={!prompt.trim()}
                onClick={handleGenerate}
                style={{ flexShrink: 0 }}
              >
                {!isGenerating && (
                  <svg width="10" height="12" viewBox="0 0 10 12" fill="none" style={{ marginRight: 2 }}>
                    <polygon points="0,0 10,6 0,12" fill="rgba(255,255,255,0.9)" />
                  </svg>
                )}
                {isGenerating ? 'Generating…' : 'Generate'}
              </Button>
            </div>

            <div style={{ marginTop: 6, fontSize: 10, color: 'var(--text-faint)' }}>
              Tip: Press Ctrl+Enter to generate quickly
            </div>
          </div>
        </div>
      )}

      {mode !== 'prompt' && (
        <div style={{ padding: '12px 24px', fontSize: 12, color: 'var(--text-faint)' }}>
          {mode === 'story' ? 'Use the Story Writer below to script your film.' : 'Use the Camera panel below to record or upload.'}
        </div>
      )}
    </div>
  );
};
