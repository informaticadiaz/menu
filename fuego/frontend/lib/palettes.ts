export interface Palette {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
}

export const PALETTES: Palette[] = [
  { id: 'classic-dark', name: 'Clásico naranja', primary: '#c2410c', secondary: '#9a3412', accent: '#ea580c', background: '#fafaf9' },
  { id: 'warm-terracotta', name: 'Cálido terracota', primary: '#b45309', secondary: '#92400e', accent: '#d97706', background: '#fffbeb' },
  { id: 'minimal-light', name: 'Minimal claro', primary: '#1c1917', secondary: '#000000', accent: '#44403c', background: '#ffffff' },
  { id: 'natural-green', name: 'Verde natural', primary: '#15803d', secondary: '#166534', accent: '#16a34a', background: '#f0fdf4' },
  { id: 'elegant-black-gold', name: 'Elegante negro y dorado', primary: '#ca8a04', secondary: '#854d0e', accent: '#eab308', background: '#0c0a09' },
  { id: 'vibrant-pink', name: 'Vibrante', primary: '#be185d', secondary: '#9d174d', accent: '#ec4899', background: '#fdf2f8' },
  { id: 'ocean-blue', name: 'Azul océano', primary: '#1d4ed8', secondary: '#1e3a8a', accent: '#3b82f6', background: '#eff6ff' },
];

export const DEFAULT_PALETTE_ID = 'classic-dark';

export function getPalette(paletteId: string | null | undefined): Palette {
  return PALETTES.find((p) => p.id === paletteId) ?? PALETTES.find((p) => p.id === DEFAULT_PALETTE_ID)!;
}

export function paletteCssVars(paletteId: string | null | undefined): Record<string, string> {
  const palette = getPalette(paletteId);
  return {
    '--palette-primary': palette.primary,
    '--palette-secondary': palette.secondary,
    '--palette-accent': palette.accent,
    '--palette-background': palette.background,
  };
}
