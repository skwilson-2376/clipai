import { useState, useCallback } from 'react';
import type { Character, CharacterSource } from '../types';

const GRADIENTS = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#fa709a,#fee140)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
];

const SEED_CHARACTERS: Character[] = [
  {
    id: 'char-1',
    name: 'Emma Chen',
    source: 'ai',
    description: 'Young woman, East Asian features, modern streetwear, expressive eyes',
    gradient: GRADIENTS[0],
  },
  {
    id: 'char-2',
    name: 'Marcus Rivera',
    source: 'ai',
    description: 'Athletic man, Latino, 30s, confident posture, dark hair',
    gradient: GRADIENTS[2],
  },
];

export function useCharacters() {
  const [characters, setCharacters] = useState<Character[]>(SEED_CHARACTERS);

  const addCharacter = useCallback((
    name: string,
    source: CharacterSource,
    imageUrlOrDescription: string,
  ) => {
    const gradient = GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)];
    const char: Character = {
      id: `char-${Date.now()}`,
      name: name.trim(),
      source,
      gradient,
      ...(source === 'uploaded'
        ? { imageUrl: imageUrlOrDescription }
        : { description: imageUrlOrDescription }),
    };
    setCharacters(prev => [char, ...prev]);
    return char.id;
  }, []);

  const removeCharacter = useCallback((id: string) => {
    setCharacters(prev => prev.filter(c => c.id !== id));
  }, []);

  return { characters, addCharacter, removeCharacter };
}
