import React from 'react';
import { Quote } from 'lucide-react';
import { BlockData } from '../Block';

interface QuoteTileProps {
    data: BlockData;
    isEditMode: boolean;
    isDebugMode: boolean;
}

export const QuoteTile: React.FC<QuoteTileProps> = ({ data, isEditMode, isDebugMode }) => {
    return (
        <>
            {/* Background Quote Icon */}
            <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center opacity-[0.03]">
                <Quote size={200} className="text-black" />
            </div>
            
            {/* Quote Content */}
            <div className="flex flex-col h-full items-center justify-center text-center relative z-10">
                <p className="font-serif-display text-lg sm:text-xl lg:text-2xl xl:text-3xl italic leading-tight text-black mb-4 sm:mb-6">
                    "{data.content}"
                </p>
                {data.author && (
                    <div className="absolute bottom-0 right-0 text-[9px] sm:text-[10px] uppercase tracking-widest text-gray-500">
                        — {data.author}
                    </div>
                )}
            </div>
        </>
    );
};