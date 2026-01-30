export interface TileSize {
    w: number;
    h: number;
    label: string;
    desc: string;
}

export const STANDARD_TILE_SIZES: TileSize[] = [
    { w: 2, h: 2, label: '2×2', desc: 'Small square' },
    { w: 3, h: 2, label: '3×2', desc: 'Wide card' },
    { w: 4, h: 2, label: '4×2', desc: 'Banner' },
    { w: 3, h: 3, label: '3×3', desc: 'Medium square' },
    { w: 4, h: 3, label: '4×3', desc: 'Standard' },
    { w: 6, h: 2, label: '6×2', desc: 'Wide banner' },
    { w: 6, h: 3, label: '6×3', desc: 'Large card' },
    { w: 6, h: 4, label: '6×4', desc: 'Showcase' },
    { w: 8, h: 3, label: '8×3', desc: 'Extra wide' }
];

export const COMPACT_TILE_SIZES: TileSize[] = [
    { w: 2, h: 2, label: '2×2', desc: 'Small' },
    { w: 3, h: 2, label: '3×2', desc: 'Wide' },
    { w: 4, h: 2, label: '4×2', desc: 'Banner' },
    { w: 3, h: 3, label: '3×3', desc: 'Square' },
    { w: 4, h: 3, label: '4×3', desc: 'Standard' },
    { w: 6, h: 2, label: '6×2', desc: 'Wide' },
    { w: 6, h: 3, label: '6×3', desc: 'Large' },
    { w: 6, h: 4, label: '6×4', desc: 'XL' },
    { w: 8, h: 3, label: '8×3', desc: 'Ultra' }
];