export type ThemeId = 'neural-wave' | 'aurora-universe' | 'cybernetic-grid';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  description: string;
  badge: string;
  previewColors: string[];
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'neural-wave',
    name: 'Digital Neural Wave',
    description: 'Flowing interconnected mesh with organic waves and glowing neural nodes.',
    badge: 'Default',
    previewColors: ['#786BFA', '#35C6D8', '#6355EE'],
  },
  {
    id: 'aurora-universe',
    name: 'Aurora Universe',
    description: 'Ethereal plasma curtains with cosmic dust and floating radiant stars.',
    badge: 'Cosmic',
    previewColors: ['#35C6D8', '#786BFA', '#42D6A4'],
  },
  {
    id: 'cybernetic-grid',
    name: 'Cybernetic Grid',
    description: 'Perspective 3D digital grid with pulsating light trails and neon intersections.',
    badge: 'Cyber',
    previewColors: ['#35C6D8', '#42D6A4', '#1E293B'],
  },
];

export const STORAGE_KEY = 'polyskill_home_bg';
export const DEFAULT_THEME: ThemeId = 'neural-wave';
