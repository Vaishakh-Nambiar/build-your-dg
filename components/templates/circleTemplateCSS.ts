/**
 * Circle Template CSS Injection Utility
 * 
 * This utility provides functions to inject circle template CSS styles
 * into the document for maintaining circular appearance across all screen sizes.
 * 
 * Requirements 5.5: Circle templates maintain their circular appearance at all sizes
 * Requirements 5.2: Implement responsive circle scaling
 */

// CSS styles as a string for injection
const CIRCLE_TEMPLATE_CSS = `
/* CSS Custom Properties for Circle Template Responsive Scaling */
:root {
  --circle-size-xs: clamp(60px, 15vw, 120px);
  --circle-size-sm: clamp(80px, 12vw, 150px);
  --circle-size-md: clamp(100px, 10vw, 200px);
  --circle-size-lg: clamp(120px, 8vw, 250px);
  --circle-size-xl: clamp(150px, 6vw, 300px);
  --circle-scale-mobile: 0.8;
  --circle-scale-tablet: 0.9;
  --circle-scale-desktop: 1.0;
  --circle-transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}

.circle-template {
  border-radius: 50% !important;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  flex-shrink: 0;
  transition: var(--circle-transition);
  box-sizing: border-box;
  position: relative;
}

.circle-template-container {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1 / 1;
  width: 100%;
  height: 100%;
  min-width: 60px;
  min-height: 60px;
}

.circle-template-content {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--circle-transition);
}

@media (max-width: 575px) {
  .circle-template-responsive {
    width: var(--circle-size-xs);
    height: var(--circle-size-xs);
    transform: scale(var(--circle-scale-mobile));
  }
}

@media (min-width: 576px) and (max-width: 767px) {
  .circle-template-responsive {
    width: var(--circle-size-sm);
    height: var(--circle-size-sm);
    transform: scale(var(--circle-scale-mobile));
  }
}

@media (min-width: 768px) and (max-width: 991px) {
  .circle-template-responsive {
    width: var(--circle-size-md);
    height: var(--circle-size-md);
    transform: scale(var(--circle-scale-tablet));
  }
}

@media (min-width: 992px) and (max-width: 1199px) {
  .circle-template-responsive {
    width: var(--circle-size-lg);
    height: var(--circle-size-lg);
    transform: scale(var(--circle-scale-tablet));
  }
}

@media (min-width: 1200px) {
  .circle-template-responsive {
    width: var(--circle-size-xl);
    height: var(--circle-size-xl);
    transform: scale(var(--circle-scale-desktop));
  }
}

.circle-template-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  transition: var(--circle-transition);
}

.circle-template-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  transition: var(--circle-transition);
}

.circle-template-controls {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  gap: 8px;
  transition: var(--circle-transition);
}

.circle-template-text {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
  backdrop-filter: blur(8px);
  max-width: 80%;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.force-circular {
  border-radius: 50% !important;
  aspect-ratio: 1 / 1 !important;
  overflow: hidden !important;
}

.maintain-aspect-square {
  aspect-ratio: 1 / 1;
}

.circle-safe-content {
  max-width: 70%;
  max-height: 70%;
  text-align: center;
}

@keyframes circle-scale-in {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.circle-template-animate-in {
  animation: circle-scale-in 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}

@media (prefers-reduced-motion: reduce) {
  .circle-template,
  .circle-template-content,
  .circle-template-image,
  .circle-template-video,
  .circle-template-controls {
    transition: none;
  }
  
  .circle-template-animate-in {
    animation: none;
  }
}
`;

let isInjected = false;
let styleElement: HTMLStyleElement | null = null;

/**
 * Injects circle template CSS styles into the document head
 */
export function injectCircleTemplateCSS(): void {
  if (typeof document === 'undefined' || isInjected) {
    return;
  }

  styleElement = document.createElement('style');
  styleElement.id = 'circle-template-styles';
  styleElement.textContent = CIRCLE_TEMPLATE_CSS;
  
  document.head.appendChild(styleElement);
  isInjected = true;
}

/**
 * Removes circle template CSS styles from the document
 */
export function removeCircleTemplateCSS(): void {
  if (typeof document === 'undefined' || !isInjected || !styleElement) {
    return;
  }

  document.head.removeChild(styleElement);
  styleElement = null;
  isInjected = false;
}

/**
 * Checks if circle template CSS is currently injected
 */
export function isCircleTemplateCSSInjected(): boolean {
  return isInjected;
}

/**
 * Updates circle template CSS custom properties dynamically
 */
export function updateCircleTemplateProperties(properties: Record<string, string>): void {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  
  Object.entries(properties).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
}

/**
 * Gets current circle template CSS custom properties
 */
export function getCircleTemplateProperties(): Record<string, string> {
  if (typeof document === 'undefined') {
    return {};
  }

  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);
  
  return {
    '--circle-size-xs': computedStyle.getPropertyValue('--circle-size-xs'),
    '--circle-size-sm': computedStyle.getPropertyValue('--circle-size-sm'),
    '--circle-size-md': computedStyle.getPropertyValue('--circle-size-md'),
    '--circle-size-lg': computedStyle.getPropertyValue('--circle-size-lg'),
    '--circle-size-xl': computedStyle.getPropertyValue('--circle-size-xl'),
    '--circle-scale-mobile': computedStyle.getPropertyValue('--circle-scale-mobile'),
    '--circle-scale-tablet': computedStyle.getPropertyValue('--circle-scale-tablet'),
    '--circle-scale-desktop': computedStyle.getPropertyValue('--circle-scale-desktop'),
    '--circle-transition': computedStyle.getPropertyValue('--circle-transition'),
  };
}

/**
 * React hook for automatically injecting circle template CSS
 */
export function useCircleTemplateCSS(): {
  isInjected: boolean;
  inject: () => void;
  remove: () => void;
  updateProperties: (properties: Record<string, string>) => void;
} {
  const [injected, setInjected] = React.useState(isInjected);

  React.useEffect(() => {
    // Auto-inject on mount
    if (!isInjected) {
      injectCircleTemplateCSS();
      setInjected(true);
    }

    // Cleanup on unmount
    return () => {
      removeCircleTemplateCSS();
      setInjected(false);
    };
  }, []);

  return {
    isInjected: injected,
    inject: () => {
      injectCircleTemplateCSS();
      setInjected(true);
    },
    remove: () => {
      removeCircleTemplateCSS();
      setInjected(false);
    },
    updateProperties: updateCircleTemplateProperties
  };
}

// Import React for the hook
import React from 'react';