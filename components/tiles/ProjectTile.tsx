import React from 'react';
import { BlockData } from '../Block';
import { ensureValidArchetype, getArchetypeRenderer } from './archetype-utils';

interface ProjectTileProps {
    data: BlockData;
    isEditMode: boolean;
    isDebugMode: boolean;
}

export const ProjectTile: React.FC<ProjectTileProps> = ({ data, isEditMode, isDebugMode }) => {
    // Ensure the tile has a valid archetype
    const validatedData = ensureValidArchetype(data);
    const archetype = validatedData.projectArchetype || 'web-showcase';
    const renderer = getArchetypeRenderer(archetype);
    const renderConfig = renderer.render(validatedData, { w: data.w, h: data.h });

    // Render based on archetype
    if (archetype === 'mobile-app') {
        return (
            <div className="absolute inset-0 overflow-hidden">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100" />
                
                {/* Phone Mockup */}
                <div className="absolute inset-4 flex items-center justify-center">
                    <div 
                        className="relative bg-black rounded-[20px] shadow-2xl transform"
                        style={{ 
                            transform: `rotate(${(renderConfig as any).tiltAngle || 0}deg)`,
                            width: '60%',
                            aspectRatio: '9/19.5'
                        }}
                    >
                        {/* Phone Screen */}
                        <div className="absolute inset-2 bg-white rounded-[16px] overflow-hidden">
                            {data.imageUrl ? (
                                <img 
                                    src={data.imageUrl} 
                                    alt={data.title || 'Mobile app'} 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center">
                                    <span className="text-blue-400 text-xs">App Preview</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Title */}
                <div className="absolute bottom-4 left-4 right-4">
                    <p className="font-['Inter'] text-sm font-medium text-gray-800 text-center">
                        {data.title}
                    </p>
                </div>
                
                {/* Click overlay */}
                {data.link && (
                    <a 
                        href={data.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 z-10"
                        onClick={(e) => e.stopPropagation()}
                    />
                )}
            </div>
        );
    }

    if (archetype === 'concept-editorial') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-white">
                {/* Symbolic Image */}
                <div className="absolute top-4 left-4 right-4" style={{ height: '40%' }}>
                    {data.imageUrl ? (
                        <img 
                            src={data.imageUrl} 
                            alt={data.title || 'Concept'} 
                            className="w-full h-full object-cover rounded-lg opacity-80"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 text-xs">Symbolic Image</span>
                        </div>
                    )}
                </div>
                
                {/* Title */}
                <div className="absolute top-[50%] left-4 right-4">
                    <h3 className="font-['Inter'] text-lg font-bold text-gray-900 leading-tight">
                        {data.title}
                    </h3>
                </div>
                
                {/* Poetic Description */}
                <div className="absolute bottom-4 left-4 right-4">
                    <p className="font-['Inter'] text-sm text-gray-600 italic leading-relaxed">
                        {data.poeticDescription || data.content || data.category}
                    </p>
                </div>
                
                {/* Click overlay */}
                {data.link && (
                    <a 
                        href={data.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 z-10"
                        onClick={(e) => e.stopPropagation()}
                    />
                )}
            </div>
        );
    }

    // Default: Web Showcase (existing implementation with enhancements)
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
            
            {/* Soft Background Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/90 to-white/90" />
            
            {/* Header Text */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                <p className="font-['Inter'] text-sm sm:text-base text-gray-800 font-medium">
                    {data.category} - {data.title}
                </p>
            </div>
            
            {/* UI Preview Container */}
            <div 
                className="absolute rounded-lg inset-x-4 bottom-4 top-16 sm:inset-x-6 sm:bottom-6 sm:top-20 shadow-lg"
                style={{ backgroundColor: data.showcaseBorderColor || '#3b82f6' }}
            >
                {/* Main Project Image */}
                <div className="absolute inset-1 rounded-md overflow-hidden">
                    {data.imageUrl ? (
                        <img 
                            src={data.imageUrl} 
                            alt={data.title || 'Project showcase'} 
                            className="w-full h-full object-cover pointer-events-none"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                            <span className="text-blue-400 text-xs uppercase tracking-widest">Web Preview</span>
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