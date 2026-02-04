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
            <div 
                className="absolute inset-0 overflow-hidden group cursor-pointer"
                style={{
                    // CSS Variables for easy tuning
                    '--phone-rotation': '-8deg',
                    '--phone-offset-x': '15%',
                    '--phone-offset-y': '-10%',
                    '--phone-scale': '0.85',
                    '--phone-hover-scale': '0.95'
                } as React.CSSProperties}
            >
                {/* ============================= */}
                {/* BACKGROUND CONTENT LAYER */}
                {/* ============================= */}
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40">
                    {/* Content positioned to be visible around floating phone */}
                    <div className="absolute inset-6 flex flex-col justify-between">
                        {/* Top Content */}
                        <div className="space-y-2">
                            <div className="text-xs uppercase tracking-wider text-slate-500 font-medium">
                                {data.category || 'Mobile App'}
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 leading-tight">
                                {data.title || 'App Project'}
                            </h3>
                            {data.content && (
                                <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                                    {data.content}
                                </p>
                            )}
                        </div>
                        
                        {/* Bottom Content */}
                        <div className="space-y-2">
                            {data.platform && (
                                <div className="text-xs text-slate-500">
                                    Platform: {data.platform}
                                </div>
                            )}
                            {data.appStoreUrl && (
                                <div className="text-xs text-blue-600 font-medium">
                                    Available on App Store
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ============================= */}
                {/* FLOATING IMAGE LAYER */}
                {/* ============================= */}
                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                    <div 
                        className="relative transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:!translate-x-0 group-hover:!translate-y-0 group-hover:!rotate-0 group-hover:!scale-[0.95]"
                        style={{
                            transform: `
                                translate(var(--phone-offset-x), var(--phone-offset-y)) 
                                rotate(var(--phone-rotation)) 
                                scale(var(--phone-scale))
                            `,
                            width: '45%',
                            aspectRatio: '9/19.5'
                        }}
                    >
                        {/* Phone Frame */}
                        <div className="relative w-full h-full bg-slate-900 rounded-[24px] shadow-2xl shadow-slate-900/25">
                            {/* Screen */}
                            <div className="absolute inset-[3px] bg-white rounded-[21px] overflow-hidden">
                                {/* Notch */}
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-slate-900 rounded-full z-10" />
                                
                                {/* App Content */}
                                {data.imageUrl ? (
                                    <img 
                                        src={data.imageUrl} 
                                        alt={data.title || 'Mobile app preview'} 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-b from-blue-50 to-indigo-100 flex items-center justify-center">
                                        <div className="text-center space-y-2">
                                            <div className="w-12 h-12 bg-blue-200 rounded-xl mx-auto" />
                                            <div className="text-xs text-blue-600 font-medium">App Preview</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Phone Highlights */}
                            <div className="absolute top-8 right-1 w-0.5 h-6 bg-slate-700 rounded-full" />
                            <div className="absolute top-16 right-1 w-0.5 h-4 bg-slate-700 rounded-full" />
                            <div className="absolute top-12 left-1 w-0.5 h-8 bg-slate-700 rounded-full" />
                        </div>
                    </div>
                </div>

                {/* Click overlay */}
                {data.link && (
                    <a 
                        href={data.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 z-20 pointer-events-auto"
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