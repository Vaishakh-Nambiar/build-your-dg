import React from 'react';
import { BlockData } from '../Block';

interface ThoughtTileProps {
    data: BlockData;
    isEditMode: boolean;
    isDebugMode: boolean;
}

export const ThoughtTile: React.FC<ThoughtTileProps> = ({ data, isEditMode, isDebugMode }) => {
    return (
        <div className="flex flex-col h-full items-center justify-center text-center p-1 sm:p-2">
            <p className="font-hand text-lg sm:text-2xl lg:text-3xl leading-snug text-gray-800 rotate-[-1deg]">
                {data.content || data.title}
            </p>
        </div>
    );
};