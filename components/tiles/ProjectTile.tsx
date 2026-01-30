import React from 'react';
import { BlockData } from '../Block';

interface ProjectTileProps {
    data: BlockData;
    isEditMode: boolean;
    isDebugMode: boolean;
}

export const ProjectTile: React.FC<ProjectTileProps> = ({ data, isEditMode, isDebugMode }) => {
    return (
        <div className="absolute inset-0 overflow-hidden">
            {/* Background Image */}
            {data.showcaseBackground && (
                <div className="absolute inset-0">
                    <img 
                        src={data.showcaseBackground} 
                        alt="" 
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    />
                </div>
            )}
            
            {/* Parent Background Overlay */}
            <div className="absolute inset-0 bg-[#fafafa]" />
            
            {/* Header Text */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                <p className="font-['Inter'] text-sm sm:text-base text-[#1e1e1e] font-normal">
                    {data.category} - {data.title}
                </p>
            </div>
            
            {/* Red Border Container - Responsive */}
            <div 
                className="absolute rounded-t-[1px] inset-x-4 bottom-4 top-16 sm:inset-x-6 sm:bottom-6 sm:top-20"
                style={{ backgroundColor: data.showcaseBorderColor || '#cc2727' }}
            >
                {/* Main Project Image */}
                <div className="absolute inset-1 rounded-t-[4px] overflow-hidden">
                    {data.imageUrl ? (
                        <img 
                            src={data.imageUrl} 
                            alt={data.title || 'Project showcase'} 
                            className="w-full h-full object-cover pointer-events-none"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-xs uppercase tracking-widest">Add Project Image</span>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Click overlay for links */}
            {data.link && (
                <a 
                    href={data.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 z-10 pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                />
            )}
        </div>
    );
};