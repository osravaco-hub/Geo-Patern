import { PatternConfig } from './patterns';
import { CanvasRatio } from './export';

export interface SavedPattern {
  id: string;
  name: string;
  createdAt: number;
  config: PatternConfig;
  seed: number;
  ratio: CanvasRatio;
}

// Se guardan en el navegador (localStorage). El formato permite migrarlo a la nube después.
const KEY = 'geopattern_saved';
const MAX_SAVED = 60;

export function listSaved(): SavedPattern[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as SavedPattern[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function write(list: SavedPattern[]): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

export function savePattern(name: string, config: PatternConfig, seed: number, ratio: CanvasRatio): SavedPattern | null {
  const item: SavedPattern = {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    name,
    createdAt: Date.now(),
    config,
    seed,
    ratio,
  };
  const list = [item, ...listSaved()].slice(0, MAX_SAVED);
  return write(list) ? item : null;
}

export function deleteSaved(id: string): SavedPattern[] {
  const list = listSaved().filter(p => p.id !== id);
  write(list);
  return list;
}
