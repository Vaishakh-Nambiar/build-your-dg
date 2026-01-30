import React from 'react';
import { clsx } from 'clsx';
import { BlockData } from '../Block';

interface ImageTileProps {
    data: BlockData;
    isEditMode: boolean;
    isDebugMode: boolean;
}

export const ImageTile: React.FC<ImageTileProps> = ({ data, isEditMode, isDebugMode }) => {
    if (!data.imageUrl) return null;

    return (
        <div className={clsx(
            "absolute inset-0 z-0 transition-transform duration-700 hover:scale-105 overflow-hidden flex flex-col items-center justify-center",
            data.isPolaroid
                ? "bg-white shadow-xl rotate-1 p-4 pb-12"
                : "rounded-t-lg"
        )}>
            <img
                src={data.imageUrl}
                alt={data.title || "Gallery Image"}
                className={clsx(
                    "w-full h-full",
                    data.objectFit === 'contain' ? "object-contain bg-gray-50" : "object-cover",
                    data.isPolaroid && "border-[8px] border-white shadow-inner"
                )}
            />
            {data.isPolaroid && (
                <div className="absolute bottom-0 left-0 right-0 h-10 w-full bg-white flex items-center justify-between px-4 pb-1">
                    <span className="font-hand text-lg text-gray-600 truncate">
                        {data.title || 'Untitled'}
                    </span>
                    <span className="text-[8px] uppercase tracking-widest text-gray-400 shrink-0">
                        {data.imageTag || 'Photo'}
                    </span>
                </div>
            )}
            {!data.isPolaroid && data.imageTag && (
                <div className="absolute bottom-4 left-4 rounded-md bg-black/30 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-md">
                    {data.imageTag}
                </div>
            )}
        </div>
    );
};