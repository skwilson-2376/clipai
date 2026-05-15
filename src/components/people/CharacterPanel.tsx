import React, { useRef, useState, useCallback, useEffect } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Avatar from 'boring-avatars';
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

// ── Avatar style catalogue ────────────────────────────────────────────────────
// boring-avatars: 100% client-side, no API, truly unlimited.
// DiceBear: free open-source CDN (https://github.com/dicebear/dicebear), unlimited.

const PALETTE = ['#7C5CFC', '#FC5CAD', '#0BC4CC', '#FFD93D', '#4facfe'];

type BoringVariant = 'marble' | 'beam' | 'pixel' | 'sunset' | 'ring' | 'bauhaus' | 'geometric' | 'abstract';

interface AvatarStyle {
  id: string;
  label: string;
  provider: 'boring' | 'dicebear';
}

const STYLES: AvatarStyle[] = [
  // boring-avatars — rendered entirely in-browser, never hits the network
  { id: 'marble',   label: 'Marble',    provider: 'boring' },
  { id: 'beam',     label: 'Beam',      provider: 'boring' },
  { id: 'geometric',label: 'Geometric', provider: 'boring' },
  { id: 'abstract', label: 'Abstract',  provider: 'boring' },
  { id: 'pixel',    label: 'Pixel',     provider: 'boring' },
  { id: 'bauhaus',  label: 'Bauhaus',   provider: 'boring' },
  { id: 'ring',     label: 'Ring',      provider: 'boring' },
  { id: 'sunset',   label: 'Sunset',    provider: 'boring' },
  // DiceBear — open-source (MIT), free CDN, 30+ styles
  { id: 'adventurer',  label: 'Adventure',  provider: 'dicebear' },
  { id: 'avataaars',   label: 'Cartoon',    provider: 'dicebear' },
  { id: 'bottts',      label: 'Robot',      provider: 'dicebear' },
  { id: 'fun-emoji',   label: 'Emoji',      provider: 'dicebear' },
  { id: 'lorelei',     label: 'Elegant',    provider: 'dicebear' },
  { id: 'micah',       label: 'Flat',       provider: 'dicebear' },
  { id: 'open-peeps',  label: 'Peeps',      provider: 'dicebear' },
  { id: 'pixel-art',   label: 'Pixel Art',  provider: 'dicebear' },
  { id: 'big-smile',   label: 'Happy',      provider: 'dicebear' },
  { id: 'croodles',    label: 'Doodle',     provider: 'dicebear' },
  { id: 'personas',    label: 'Profile',    provider: 'dicebear' },
  { id: 'notionists',  label: 'Notion',     provider: 'dicebear' },
];

function randomSeed(): string {
  return Math.random().toString(36).slice(2, 14);
}

function buildDiceBearUrl(style: string, seed: string, size = 200): string {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}&size=${size}&radius=50`;
}

// Convert a boring-avatars React component to an SVG data URL (synchronous, no DOM needed)
function boringToDataUrl(variant: BoringVariant, seed: string, size = 200): string {
  const svg = renderToStaticMarkup(
    <Avatar name={seed} size={size} variant={variant} colors={PALETTE} />
  );
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function buildAvatarUrl(styleId: string, provider: 'boring' | 'dicebear', seed: string): string {
  if (provider === 'boring') return boringToDataUrl(styleId as BoringVariant, seed);
  return buildDiceBearUrl(styleId, seed);
}

// ── Mini preview for style picker ────────────────────────────────────────────
const StyleThumb: React.FC<{ style: AvatarStyle; seed: string; selected: boolean; onClick: () => void }> = ({
  style, seed, selected, onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    title={style.label}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      padding: '6px 4px',
      borderRadius: 10,
      border: `2px solid ${selected ? '#7C5CFC' : 'transparent'}`,
      background: selected ? 'rgba(124,92,252,0.08)' : 'transparent',
      cursor: 'pointer',
      transition: 'all 0.15s',
      minWidth: 56,
    }}
    onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
    onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
  >
    {style.provider === 'boring' ? (
      <Avatar name={seed} size={42} variant={style.id as BoringVariant} colors={PALETTE} />
    ) : (
      <img
        src={buildDiceBearUrl(style.id, seed, 84)}
        alt={style.label}
        width={42}
        height={42}
        style={{ borderRadius: '50%' }}
        loading="lazy"
      />
    )}
    <span style={{ fontSize: 9, color: selected ? '#7C5CFC' : '#8E8CA6', fontWeight: selected ? 700 : 400, lineHeight: 1 }}>
      {style.label}
    </span>
  </button>
);

// ── Main component ────────────────────────────────────────────────────────────
export const CharacterPanel: React.FC<CharacterPanelProps> = ({
  characters,
  selectedIds = [],
  onAdd,
  onRemove,
  onToggleSelect,
  mobile = false,
}) => {
  const [showForm, setShowForm]         = useState(false);
  const [addTab, setAddTab]             = useState<AddTab>('ai');
  const [name, setName]                 = useState('');
  const [description, setDescription]   = useState('');
  const [previewUrl, setPreviewUrl]     = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<AvatarStyle>(STYLES[0]);
  const [seed, setSeed]                 = useState(() => randomSeed());
  const [avatarUrl, setAvatarUrl]       = useState<string>('');
  const fileRef = useRef<HTMLInputElement>(null);

  // Rebuild avatar URL whenever style or seed changes
  useEffect(() => {
    if (addTab !== 'ai') return;
    setAvatarUrl(buildAvatarUrl(selectedStyle.id, selectedStyle.provider, seed));
  }, [selectedStyle, seed, addTab]);

  const reset = () => {
    setShowForm(false);
    setName('');
    setDescription('');
    setPreviewUrl('');
    setSelectedStyle(STYLES[0]);
    setSeed(randomSeed());
    setAvatarUrl('');
    setAddTab('ai');
  };

  const handleNewLook    = () => setSeed(randomSeed());
  const handleRandomStyle = () => {
    const next = STYLES[Math.floor(Math.random() * STYLES.length)];
    setSelectedStyle(next);
    setSeed(randomSeed());
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPreviewUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSave = useCallback(() => {
    if (!name.trim()) return;
    if (addTab === 'ai') {
      if (!avatarUrl) return;
      onAdd(name, 'ai', description || name, avatarUrl);
    } else {
      if (!previewUrl) return;
      onAdd(name, 'uploaded', previewUrl);
    }
    reset();
  }, [name, addTab, avatarUrl, description, previewUrl, onAdd]); // eslint-disable-line react-hooks/exhaustive-deps

  const canSave = addTab === 'ai' ? (name.trim().length > 0 && !!avatarUrl) : !!previewUrl;

  const tabBtn = (id: AddTab, label: string) => (
    <button
      key={id}
      type="button"
      onClick={() => setAddTab(id)}
      style={{
        flex: 1, padding: '7px 0', fontSize: 12, fontWeight: 500,
        background: addTab === id ? '#7C5CFC' : 'transparent',
        color: addTab === id ? '#fff' : '#5C5A74',
        border: 'none', borderRadius: 6, cursor: 'pointer',
        transition: 'all 0.15s', fontFamily: 'var(--font-body)',
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{
      width: mobile ? '100%' : 'auto', flex: mobile ? 1 : undefined,
      overflowY: 'auto', padding: '20px 16px',
      display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--bg)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
          Characters
        </div>
        <button
          type="button"
          onClick={() => setShowForm(v => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 6, background: '#7C5CFC', color: '#fff', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
        >
          + Add
        </button>
      </div>

      {/* ── Form ─────────────────────────────────────────────────────────────── */}
      {showForm && (
        <div className="animate-slide-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Source tabs */}
          <div style={{ display: 'flex', background: 'var(--surface2)', borderRadius: 6, padding: 3, gap: 2 }}>
            {tabBtn('ai', '🤖 AI Generated')}
            {tabBtn('uploaded', '📷 Upload Photo')}
          </div>

          {/* Name */}
          <input
            type="text"
            placeholder="Character name"
            value={name}
            onChange={e => setName(e.target.value)}
            style={inputStyle}
          />

          {addTab === 'ai' ? (
            <>
              {/* Description (optional) */}
              <textarea
                placeholder="Describe appearance or personality (optional)…"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                style={{ ...inputStyle, resize: 'none' } as React.CSSProperties}
              />

              {/* ── Style gallery ─────────────────────────────────────────── */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#8E8CA6', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
                  Choose a style — {STYLES.length} available
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, maxHeight: 260, overflowY: 'auto' }}>
                  {STYLES.map(s => (
                    <StyleThumb
                      key={s.id}
                      style={s}
                      seed={name.trim() || seed}
                      selected={selectedStyle.id === s.id}
                      onClick={() => setSelectedStyle(s)}
                    />
                  ))}
                </div>
              </div>

              {/* ── Large preview ─────────────────────────────────────────── */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 14px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                {/* Avatar */}
                <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid #7C5CFC' }}>
                  {selectedStyle.provider === 'boring' ? (
                    <Avatar name={name.trim() || seed} size={64} variant={selectedStyle.id as BoringVariant} colors={PALETTE} />
                  ) : (
                    <img src={buildDiceBearUrl(selectedStyle.id, name.trim() || seed, 128)} alt="preview" width={64} height={64} style={{ borderRadius: '50%' }} />
                  )}
                </div>

                {/* Info + actions */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                    {name.trim() || 'Your character'}
                  </div>
                  <div style={{ fontSize: 11, color: '#8E8CA6', marginBottom: 8 }}>
                    {selectedStyle.label} · {selectedStyle.provider === 'boring' ? 'Client-side' : 'DiceBear'}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button type="button" onClick={handleNewLook}
                      style={{ fontSize: 11, padding: '3px 10px', borderRadius: 12, border: '1px solid var(--border)', background: 'transparent', color: '#5C5A74', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                      ↻ New look
                    </button>
                    <button type="button" onClick={handleRandomStyle}
                      style={{ fontSize: 11, padding: '3px 10px', borderRadius: 12, border: '1px solid var(--border)', background: 'transparent', color: '#5C5A74', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                      🎲 Random style
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Upload tab */
            <div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  height: previewUrl ? 120 : 80, borderRadius: 10,
                  border: '2px dashed var(--border)', background: 'var(--bg)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#7C5CFC')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <>
                    <span style={{ fontSize: 24 }}>📷</span>
                    <span style={{ fontSize: 12, color: '#5C5A74', marginTop: 4 }}>Click to upload photo</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Footer buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={reset}
              style={{ flex: 1, padding: '8px 0', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: '#5C5A74', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              Cancel
            </button>
            <button type="button" onClick={handleSave} disabled={!canSave}
              style={{ flex: 2, padding: '8px 0', borderRadius: 6, border: 'none', background: 'linear-gradient(135deg,#7C5CFC,#FC5CAD)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: canSave ? 'pointer' : 'default', fontFamily: 'var(--font-body)', opacity: canSave ? 1 : 0.4 }}>
              Save Character
            </button>
          </div>
        </div>
      )}

      {/* ── Character list ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {characters.length === 0 && !showForm && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#8E8CA6', fontSize: 13 }}>
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
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 10,
                background: isSelected ? 'rgba(124,92,252,0.06)' : 'var(--surface)',
                border: `1px solid ${isSelected ? 'rgba(124,92,252,0.3)' : 'var(--border)'}`,
                cursor: onToggleSelect ? 'pointer' : 'default', transition: 'all 0.15s',
              }}
            >
              <CharAvatar char={char} size={44} selected={isSelected} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{char.name}</div>
                <div style={{ fontSize: 11, color: '#8E8CA6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {char.source === 'ai' ? `AI · ${char.description ?? ''}` : 'Uploaded photo'}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 10, background: char.source === 'ai' ? 'rgba(124,92,252,0.12)' : 'rgba(92,244,252,0.12)', color: char.source === 'ai' ? '#7C5CFC' : '#0BC4CC', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  {char.source === 'ai' ? 'AI' : 'Photo'}
                </span>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); onRemove(char.id); }}
                  aria-label={`Remove ${char.name}`}
                  style={{ width: 22, height: 22, borderRadius: '50%', border: 'none', background: 'transparent', color: '#8E8CA6', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#FC5C5C')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#8E8CA6')}
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

// ── Character avatar renderer — handles both boring-avatars data URLs and regular URLs
const CharAvatar: React.FC<{ char: Character; size: number; selected: boolean }> = ({ char, size, selected }) => {
  const ring: React.CSSProperties = {
    width: size, height: size, borderRadius: '50%',
    flexShrink: 0, overflow: 'hidden',
    border: `2px solid ${selected ? '#7C5CFC' : 'transparent'}`,
    transition: 'border-color 0.15s',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: char.imageUrl ? 'transparent' : char.gradient,
    fontSize: size * 0.4,
  };

  if (!char.imageUrl) return <div style={ring}>🧑</div>;

  return (
    <div style={ring}>
      <img src={char.imageUrl} alt={char.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 6,
  border: '1px solid var(--border)', background: 'var(--bg)',
  color: 'var(--text)', fontSize: 13, fontFamily: 'var(--font-body)',
  outline: 'none', boxSizing: 'border-box',
};
