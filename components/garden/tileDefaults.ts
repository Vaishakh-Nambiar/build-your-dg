import { BlockType } from '../Block';

export interface TileDefaults {
    w: number;
    h: number;
    category: string;
    color?: string;
    imageUrl?: string;
    videoUrl?: string;
    isLooping?: boolean;
    isMuted?: boolean;
    showcaseBorderColor?: string;
    isTransparent?: boolean;
    videoShape?: 'rectangle' | 'circle';
}

export const getTileDefaults = (type: BlockType): TileDefaults => {
    switch (type) {
        case 'thought':
            return {
                w: 2,
                h: 2,
                category: 'Ideas',
                color: '#fbf8cc'
            };
        case 'quote':
            return {
                w: 3,
                h: 3,
                category: 'Quotes'
            };
        case 'text':
            return {
                w: 3,
                h: 2,
                category: 'Notes',
                isTransparent: false
            };
        case 'image':
            return {
                w: 3,
                h: 3,
                category: 'Photography',
                imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            };
        case 'video':
            return {
                w: 4,
                h: 3,
                category: 'Media',
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                isLooping: true,
                isMuted: true,
                videoShape: 'rectangle'
            };
        case 'project':
            return {
                w: 6,
                h: 4,
                category: 'Projects',
                showcaseBorderColor: '#cc2727'
            };
        case 'status':
            return {
                w: 2,
                h: 1,
                category: 'Status'
            };
        default:
            return {
                w: 2,
                h: 2,
                category: 'Misc'
            };
    }
};

export const getTypeChangeUpdates = (newType: BlockType, currentTileData: any) => {
    const defaults = getTileDefaults(newType);
    
    return {
        type: newType,
        w: defaults.w,
        h: defaults.h,
        category: defaults.category,
        color: defaults.color || currentTileData.color || '#ffffff',
        // Only set type-specific properties if they're defined in defaults
        ...(defaults.imageUrl && { imageUrl: defaults.imageUrl }),
        ...(defaults.videoUrl && { videoUrl: defaults.videoUrl }),
        ...(defaults.isLooping !== undefined && { isLooping: defaults.isLooping }),
        ...(defaults.isMuted !== undefined && { isMuted: defaults.isMuted }),
        ...(defaults.showcaseBorderColor && { showcaseBorderColor: defaults.showcaseBorderColor })
    };
};