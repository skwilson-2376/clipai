import React, { useState, useRef } from 'react';
import { Button } from '../shared/Button';

const QUICK_TAGS = [
  'cinematic', 'slow motion', '4K quality', 'vibrant colors',
  'dramatic lighting', 'aerial view', 'close-up', 'epic scale',
];

interface PromptInputProps {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = ({ onGenerate, isGenerating }) => {
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleGenerate = () => {
    if (prompt.trim() && !isGenerating) {
      onGenerate(prompt.trim());
    }
  };

  const addTag = (tag: string) => {
    const sep = prompt.trimEnd().endsWith(',') || prompt === '' ? ' ' : ', ';
    const next = prompt === '' ? tag : `${prompt.trimEnd()}${sep}${tag}`;
    setPrompt(next);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
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

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, gap: 8 }}>
          {/* Quick tags */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
            {QUICK_TAGS.slice(0, 4).map(tag => (
              <button
                key={tag}
                type="button"
                aria-label={`Add tag: ${tag}`}
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
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.color = 'var(--text)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                + {tag}
              </button>
            ))}
          </div>

          {/* Generate button */}
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
  );
};
