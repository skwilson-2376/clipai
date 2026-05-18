// Metallic thumbnail gradients — deep sea, silver, dark olive palette
export const THUMB_GRADIENTS: Record<string, string> = {
  'parallax-3d':   'linear-gradient(145deg, #080E18, #0E2540, #1A3A52)',
  'smooth-cinema': 'linear-gradient(145deg, #0A0E0A, #1A2A20, #2A3A2E)',
  'clay-motion':   'linear-gradient(145deg, #1A0E08, #3A2010, #5A3820)',
  'cel-animation': 'linear-gradient(145deg, #080E18, #142030, #3A5A6A)',
  'ken-burns':     'linear-gradient(145deg, #100E04, #28260A, #444016)',
  'watercolor':    'linear-gradient(145deg, #041018, #0A2030, #1A3A3A)',

  // Legacy aliases
  realistic: 'linear-gradient(145deg, #080E18, #0E2540, #1A3A52)',
  anime:     'linear-gradient(145deg, #0A0408, #200A14, #3A1228)',
  '3d':      'linear-gradient(145deg, #041018, #0A2540, #1A4060)',
};

export const ANIMATION_STYLE_META: Record<string, { label: string; icon: string; desc: string }> = {
  'parallax-3d':   { label: 'Parallax 3D',   icon: '🌊', desc: 'Depth-based 3D parallax — photo layers separate into a living scene' },
  'smooth-cinema': { label: 'Smooth Cinema',  icon: '🎞️', desc: 'CogVideoX-style fluid motion with cinematic camera movement' },
  'clay-motion':   { label: 'Clay Motion',    icon: '🏺', desc: 'Stop-motion claymation with tactile hand-crafted aesthetic' },
  'cel-animation': { label: 'Cel Animation',  icon: '✒️', desc: 'Traditional hand-drawn 2D animation with ink-wash outlines' },
  'ken-burns':     { label: 'Ken Burns',       icon: '📽️', desc: 'Documentary-style slow zoom & pan across your photo' },
  'watercolor':    { label: 'Watercolor',      icon: '🖌️', desc: 'Painterly watercolor effect with flowing pigment motion' },
};

export const CAMERA_MOTION_META: Record<string, { label: string; icon: string }> = {
  'parallax':   { label: 'Parallax',   icon: '↔️' },
  'orbit':      { label: 'Orbit',      icon: '🔄' },
  'zoom-in':    { label: 'Zoom In',    icon: '🔍' },
  'pan-left':   { label: 'Pan Left',   icon: '⬅️' },
  'pan-right':  { label: 'Pan Right',  icon: '➡️' },
  'dolly-out':  { label: 'Dolly Out',  icon: '🔭' },
};
