import React from 'react';
import { BlockData } from '../Block';

interface StatusTileProps {
    data: BlockData;
    isEditMode: boolean;
    isDebugMode: boolean;
}

export const StatusTile: React.FC<StatusTileProps> = ({ data, isEditMode, isDebugMode }) => {
    return (
        <div className="flex flex-col h-full w-full text-left">
            <div className="flex gap-2 mb-2 sm:mb-3">
                {data.status && (
                    <span className="inline-flex items-center rounded-sm bg-orange-100 px-1.5 py-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-wide text-orange-600">
                        {data.status}
                    </span>
                )}
            </div>
            <h3 className="font-serif-display text-2xl sm:text-3xl lg:text-4xl font-normal leading-none tracking-tight text-black">
                {data.title}
            </h3>
            {data.content && <p className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-gray-500">{data.content}</p>}
        </div>
    );
};