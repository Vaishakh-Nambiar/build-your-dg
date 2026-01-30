import React from 'react';
import { BlockData } from '../Block';

interface TextTileProps {
    data: BlockData;
    isEditMode: boolean;
    isDebugMode: boolean;
}

export const TextTile: React.FC<TextTileProps> = ({ data, isEditMode, isDebugMode }) => {
    return (
        <div className="flex flex-col h-full justify-center w-full text-left">
            <h3 className="font-serif-display text-lg sm:text-xl lg:text-2xl font-medium leading-tight text-gray-900 mb-2 sm:mb-3">
                {data.title}
            </h3>
            <p className="line-clamp-6 text-xs sm:text-sm leading-relaxed text-gray-500 font-sans">
                {data.content}
            </p>
            {data.meta && <div className="mt-3 sm:mt-4 text-[9px] sm:text-[10px] text-gray-400">{data.meta}</div>}
        </div>
    );
};