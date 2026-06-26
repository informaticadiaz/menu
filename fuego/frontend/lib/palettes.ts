export interface Palette {
  id: string;
  name: string;
  brand: string;
  brandStrong: string;
  brandFocus: string;
  background: string;
}

export const PALETTES: Palette[] = [
  { id: 'classic-dark', name: 'Clásico naranja', brand: '#c2410c', brandStrong: '#9a3412', brandFocus: '#ea580c', background: '#fafaf9' },
  { id: 'warm-terracotta', name: 'Cálido terracota', brand: '#b45309', brandStrong: '#92400e', brandFocus: '#d97706', background: '#fffbeb' },
  { id: 'minimal-light', name: 'Minimal claro', brand: '#1c1917', brandStrong: '#000000', brandFocus: '#44403c', background: '#ffffff' },
  { id: 'natural-green', name: 'Verde natural', brand: '#15803d', brandStrong: '#166534', brandFocus: '#16a34a', background: '#f0fdf4' },
  { id: 'elegant-black-gold', name: 'Elegante negro y dorado', brand: '#ca8a04', brandStrong: '#854d0e', brandFocus: '#eab308', background: '#0c0a09' },
  { id: 'vibrant-pink', name: 'Vibrante', brand: '#be185d', brandStrong: '#9d174d', brandFocus: '#ec4899', background: '#fdf2f8' },
  { id: 'ocean-blue', name: 'Azul océano', brand: '#1d4ed8', brandStrong: '#1e3a8a', brandFocus: '#3b82f6', background: '#eff6ff' },
];

export const DEFAULT_PALETTE_ID = 'classic-dark';

export function getPalette(paletteId: string | null | undefined): Palette {
  return PALETTES.find((p) => p.id === paletteId) ?? PALETTES.find((p) => p.id === DEFAULT_PALETTE_ID)!;
}

export function paletteCssVars(paletteId: string | null | undefined): Record<string, string> {
  const palette = getPalette(paletteId);
  return {
    '--brand': palette.brand,
    '--brand-strong': palette.brandStrong,
    '--brand-focus': palette.brandFocus,
    '--background': palette.background,
  };
}
