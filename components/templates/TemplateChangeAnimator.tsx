/**
 * Template Change Animator Component
 * 
 * This component provides smooth animations when templates are changed on existing tiles.
 * It handles the visual transition between different template configurations.
 * 
 * Requirements: 6.2 - Add template change animations
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TileTemplate } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TemplateChangeAnimatorProps {
  children: React.ReactNode;
  currentTemplate: TileTemplate;
  previousTemplate?: TileTemplate;
  isChanging?: boolean;
  onAnimationComplete?: () => void;
  className?: string;
}

export const TemplateChangeAnimator: React.FC<TemplateChangeAnimatorProps> = ({
  children,
  currentTemplate,
  previousTemplate,
  isChanging = false,
  onAnimationComplete,
  className
}) => {
  const [animationState, setAnimationState] = useState<'idle' | 'changing' | 'complete'>('idle');

  useEffect(() => {
    if (isChanging && previousTemplate && previousTemplate.id !== currentTemplate.id) {
      setAnimationState('changing');
      
      // Complete animation after duration
      const timer = setTimeout(() => {
        setAnimationState('complete');
        onAnimationComplete?.();
      }, 800);

      return () => clearTimeout(timer);
    } else {
      setAnimationState('idle');
    }
  }, [isChanging, currentTemplate, previousTemplate, onAnimationComplete]);

  // Animation variants for different template change types
  const getAnimationVariants = () => {
    if (!previousTemplate) return {};

    const sizeChanged = 
      previousTemplate.dimensions.w !== currentTemplate.dimensions.w ||
      previousTemplate.dimensions.h !== currentTemplate.dimensions.h;

    const categoryChanged = previousTemplate.category !== currentTemplate.category;

    if (categoryChanged) {
      // Category change (e.g., square to circle) - more dramatic animation
      return {
        initial: { 
          scale: 1, 
          rotate: 0, 
          opacity: 1,
          borderRadius: previousTemplate.category === 'circle' ? '50%' : '8px'
        },
        changing: { 
          scale: [1, 0.8, 1.1, 1], 
          rotate: [0, -5, 5, 0], 
          opacity: [1, 0.7, 0.9, 1],
          borderRadius: currentTemplate.category === 'circle' ? '50%' : '8px'
        },
        complete: { 
          scale: 1, 
          rotate: 0, 
          opacity: 1,
          borderRadius: currentTemplate.category === 'circle' ? '50%' : '8px'
        }
      };
    } else if (sizeChanged) {
      // Size change - smooth scaling animation
      return {
        initial: { scale: 1, opacity: 1 },
        changing: { 
          scale: [1, 0.95, 1.05, 1], 
          opacity: [1, 0.8, 1]
        },
        complete: { scale: 1, opacity: 1 }
      };
    } else {
      // Style change only - subtle animation
      return {
        initial: { opacity: 1 },
        changing: { opacity: [1, 0.7, 1] },
        complete: { opacity: 1 }
      };
    }
  };

  const variants = getAnimationVariants();

  return (
    <motion.div
      className={cn("relative", className)}
      variants={variants}
      initial="initial"
      animate={animationState === 'changing' ? 'changing' : 'complete'}
      transition={{
        duration: 0.8,
        ease: [0.23, 1, 0.32, 1],
        times: [0, 0.3, 0.7, 1]
      }}
    >
      {/* Template change indicator overlay */}
      <AnimatePresence>
        {animationState === 'changing' && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                duration: 0.8,
                ease: "easeInOut"
              }}
            />
            
            {/* Pulse overlay */}
            <motion.div
              className="absolute inset-0 bg-blue-500/10 rounded-lg"
              animate={{
                opacity: [0, 0.3, 0]
              }}
              transition={{
                duration: 0.8,
                ease: "easeInOut"
              }}
            />

            {/* Template change label */}
            <motion.div
              className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: 0.1 }}
            >
              Template Updated
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content with template-aware styling */}
      <motion.div
        className="w-full h-full"
        layout
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

/**
 * Hook for managing template change animations
 */
export function useTemplateChangeAnimation() {
  const [isChanging, setIsChanging] = useState(false);
  const [previousTemplate, setPreviousTemplate] = useState<TileTemplate | null>(null);

  const triggerTemplateChange = (oldTemplate: TileTemplate, newTemplate: TileTemplate) => {
    if (oldTemplate.id !== newTemplate.id) {
      setPreviousTemplate(oldTemplate);
      setIsChanging(true);
    }
  };

  const completeTemplateChange = () => {
    setIsChanging(false);
    setPreviousTemplate(null);
  };

  return {
    isChanging,
    previousTemplate,
    triggerTemplateChange,
    completeTemplateChange
  };
}

/**
 * Higher-order component for adding template change animations
 */
export function withTemplateChangeAnimation<P extends object>(
  Component: React.ComponentType<P>
) {
  return React.forwardRef<any, P & { 
    template?: TileTemplate; 
    previousTemplate?: TileTemplate;
    onTemplateChange?: (oldTemplate: TileTemplate, newTemplate: TileTemplate) => void;
  }>((props, ref) => {
    const { template, previousTemplate, onTemplateChange, ...componentProps } = props;
    const { isChanging, triggerTemplateChange, completeTemplateChange } = useTemplateChangeAnimation();

    React.useEffect(() => {
      if (template && previousTemplate && template.id !== previousTemplate.id) {
        triggerTemplateChange(previousTemplate, template);
        onTemplateChange?.(previousTemplate, template);
      }
    }, [template, previousTemplate, onTemplateChange]);

    if (!template) {
      return <Component ref={ref} {...(componentProps as P)} />;
    }

    return (
      <TemplateChangeAnimator
        currentTemplate={template}
        previousTemplate={previousTemplate}
        isChanging={isChanging}
        onAnimationComplete={completeTemplateChange}
      >
        <Component ref={ref} {...(componentProps as P)} />
      </TemplateChangeAnimator>
    );
  });
}