import React, { useRef, useState, useCallback } from 'react';
import type { Character, CharacterSource } from '../../types';

interface CharacterPanelProps {
  characters: Character[];
  selectedIds?: string[];
  onAdd: (name: string, source: CharacterSource, imageUrlOrDescription: string, generatedAvatarUrl?: string) => void;
  onRemove: (id: string) => void;
  onToggleSelect?: (id: string) => void;
  mobile?: boolean;
}

type AddTab = 'ai' | 'uploaded';

// Pick a DiceBear style based on keywords in the description
function pickAvatarStyle(description: string): string {
  const d = description.toLowerCase();
  if (/anime|manga|kawaii|chibi|cute/.test(d))  return 'adventurer';
  if (/robot|mech|android|cyborg|ai/.test(d))   return 'bottts-neutral';
  if (/pixel|retro|8-bit/.test(d))              return 'pixel-art';
  if (/woman|girl|female|she|her/.test(d))      return 'lorelei';
  if (/man|boy|male|he|him/.test(d))            return 'notionists';
  return 'personas';
}

function buildAvatarUrl(name: string, description: string, variant: number): string {
  const style = pickAvatarStyle(description);
  const seed  = encodeURIComponent(`${name}-${description.slice(0, 30)}-v${variant}`);
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}&radius=50&size=200`;
}

export const CharacterPanel: React.FC<CharacterPanelProps> = ({
  characters,
  selectedIds = [],
  onAdd,
  onRemove,
  onToggleSelect,
  mobile = false,
}) => {
  const [showForm, setShowForm]       = useState(false);
  const [addTab, setAddTab]           = useState<AddTab>('ai');
  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');
  const [previewUrl, setPreviewUrl]   = useState<string>('');
  const [avatarUrl, setAvatarUrl]     = useState<string>('');
  const [generating, setGenerating]   = useState(false);
  const [variant, setVariant]         = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setShowForm(false);
    setName('');
    setDescription('');
    setPreviewUrl('');
    setAvatarUrl('');
    setGenerating(false);
    setVariant(0);
    setAddTab('ai');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPreviewUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleGenerate = useCallback(async (nextVariant = variant) => {
    if (!name.trim() || !description.trim()) return;
    setGenerating(true);
    setAvatarUrl('');
    // Simulate AI processing delay
    await new Promise(r => setTimeout(r, 1800));
    setAvatarUrl(buildAvatarUrl(name, description, nextVariant));
    setGenerating(false);
  }, [name, description, variant]);

  const handleRegenerate = () => {
    const next = variant + 1;
    setVariant(next);
    handleGenerate(next);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (addTab === 'ai') {
      if (!avatarUrl) return;
      onAdd(name, 'ai', description, avatarUrl);
    } else {
      if (!previewUrl) return;
      onAdd(name, 'uploaded', previewUrl);
    }
    reset();
  };

  const canGenerate = name.trim().length > 0 && description.trim().length > 5;
  const canSave = addTab === 'ai' ? !!avatarUrl : !!previewUrl;

  const tabBtn = (id: AddTab, label: string) => (
    <button
      key={id}
      type="button"
      onClick={() => setAddTab(id)}
      style={{
        flex: 1,
        padding: '7px 0',
        fontSize: 12,
        fontWeight: 500,
        background: addTab === id ? 'var(--accent)' : 'transparent',
        color: addTab === id ? '#fff' : 'var(--text-muted)',
        border: 'none',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        transition: 'all 0.15s',
        fontFamily: 'var(--font-body)',
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      style={{
        width: mobile ? '100%' : 'auto',
        flex: mobile ? 1 : undefined,
        overflowY: 'auto',
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        background: 'var(--bg)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
          Characters
        </div>
        <button
          type="button"
          onClick={() => setShowForm(v => !v)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
          }}
        >
          + Add
        </button>
      </div>

      {/* Add character form */}
      {showForm && (
        <div
          className="animate-slide-up"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {/* Source tabs */}
          <div style={{ display: 'flex', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', padding: 3, gap: 2 }}>
            {tabBtn('ai', '🤖 AI Generated')}
            {tabBtn('uploaded', '📷 Upload Photo')}
          </div>

          {/* Name */}
          <input
            type="text"
            placeholder="Character name"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              color: 'var(--text)',
              fontSize: 13,
              fontFamily: 'var(--font-body)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />

          {addTab === 'ai' ? (
            <>
              <textarea
                placeholder="Describe your character's appearance, personality, and style…"
                value={description}
                onChange={e => { setDescription(e.target.value); setAvatarUrl(''); }}
                rows={3}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  fontSize: 13,
                  fontFamily: 'var(--font-body)',
                  outline: 'none',
                  resize: 'none',
                  boxSizing: 'border-box',
                }}
              />

              {/* Avatar preview or generate button */}
              {avatarUrl ? (
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 12px', background: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <img src={avatarUrl} alt="Generated avatar" style={{ width: 56, height: 56, borderRadius: '50%', flexShrink: 0, border: '2px solid var(--accent)' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-faint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{description}</div>
                  </div>
                  <button type="button" onClick={handleRegenerate}
                    style={{ fontSize: 11, padding: '4px 10px', borderRadius: 12, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'var(--font-body)' }}>
                    ↻ New look
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => handleGenerate(variant)} disabled={!canGenerate || generating}
                  style={{
                    width: '100%', padding: '10px 0', borderRadius: 'var(--radius-sm)', border: 'none',
                    background: canGenerate && !generating ? 'linear-gradient(135deg,#7C5CFC,#FC5CAD)' : 'var(--border2)',
                    color: '#fff', fontSize: 13, fontWeight: 600,
                    cursor: canGenerate && !generating ? 'pointer' : 'default',
                    fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}>
                  {generating
                    ? <><div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff' }} className="animate-spin" />Generating character…</>
                    : '✨ Generate Character'}
                </button>
              )}
            </>
          ) : (
            <div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  height: previewUrl ? 120 : 80,
                  borderRadius: 'var(--radius-md)',
                  border: '2px dashed var(--border)',
                  background: 'var(--bg)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <>
                    <span style={{ fontSize: 24 }}>📷</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Click to upload photo</span>
                  </>
                )}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={reset}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text-muted)',
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              style={{
                flex: 2,
                padding: '8px 0',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: 'var(--grad-primary)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: canSave ? 'pointer' : 'default',
                fontFamily: 'var(--font-body)',
                opacity: canSave ? 1 : 0.45,
              }}
            >
              Save Character
            </button>
          </div>
        </div>
      )}

      {/* Character list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {characters.length === 0 && !showForm && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-faint)', fontSize: 13 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
            No characters yet. Add your first one!
          </div>
        )}
        {characters.map(char => {
          const isSelected = selectedIds.includes(char.id);
          return (
            <div
              key={char.id}
              onClick={() => onToggleSelect?.(char.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                background: isSelected ? 'var(--pill-bg)' : 'var(--surface)',
                border: `1px solid ${isSelected ? 'var(--pill-border)' : 'var(--border)'}`,
                cursor: onToggleSelect ? 'pointer' : 'default',
                transition: 'all 0.15s',
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: char.imageUrl ? 'transparent' : char.gradient,
                  flexShrink: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  border: isSelected ? '2px solid var(--accent)' : '2px solid transparent',
                  transition: 'border-color 0.15s',
                }}
              >
                {char.imageUrl
                  ? <img src={char.imageUrl} alt={char.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : '🧑'}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                  {char.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-faint)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {char.source === 'ai' ? `AI · ${char.description ?? ''}` : 'Uploaded photo'}
                </div>
              </div>

              {/* Source badge + delete */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <span style={{
                  fontSize: 9,
                  padding: '2px 6px',
                  borderRadius: 10,
                  background: char.source === 'ai' ? 'rgba(124,92,252,0.12)' : 'rgba(92,244,252,0.12)',
                  color: char.source === 'ai' ? 'var(--accent)' : 'var(--accent3)',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}>
                  {char.source === 'ai' ? 'AI' : 'Photo'}
                </span>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); onRemove(char.id); }}
                  aria-label={`Remove ${char.name}`}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text-faint)',
                    fontSize: 14,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#FC5C5C')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-faint)')}
                >
                  ×
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
