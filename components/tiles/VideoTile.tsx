import React from 'react';
import { Volume2, VolumeX, Repeat } from 'lucide-react';
import { clsx } from 'clsx';
import { BlockData } from '../Block';

interface VideoTileProps {
    data: BlockData;
    isEditMode: boolean;
    isDebugMode: boolean;
    onUpdate: (id: string, updates: Partial<BlockData>) => void;
}

export const VideoTile: React.FC<VideoTileProps> = ({ data, isEditMode, isDebugMode, onUpdate }) => {
    if (!data.videoUrl) return null;

    return (
        <div className="absolute inset-0 z-0 overflow-hidden rounded-lg bg-black">
            <video
                src={data.videoUrl}
                className="w-full h-full object-cover"
                loop={data.isLooping !== false}
                muted={data.isMuted !== false}
                autoPlay
                playsInline
            />
            {!isEditMode && (
                <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onUpdate(data.id, { isLooping: !data.isLooping });
                        }}
                        className={clsx(
                            "flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all shadow-lg border pointer-events-auto",
                            data.isLooping !== false ? "bg-white/90 text-black" : "bg-black/50 text-white"
                        )}
                        title={data.isLooping !== false ? "Loop On" : "Loop Off"}
                    >
                        <Repeat size={14} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onUpdate(data.id, { isMuted: !data.isMuted });
                        }}
                        className={clsx(
                            "flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all shadow-lg border pointer-events-auto",
                            data.isMuted !== false ? "bg-black/50 text-white" : "bg-white/90 text-black"
                        )}
                        title={data.isMuted !== false ? "Unmute" : "Mute"}
                    >
                        {data.isMuted !== false ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    </button>
                </div>
            )}
        </div>
    );
};