/**
 * Template-Aware Block Component
 * 
 * This component wraps the existing Block component with template-aware styling,
 * providing enhanced circle template shape preservation and responsive scaling.
 * 
 * Requirements 5.5: Circle templates maintain their circular appearance at all sizes
 * Requirements 5.2: Implement responsive circle scaling
 */

import React from 'react';
import { Block, BlockData, BlockProps } from '../Block';
import { TileTemplate } from './types';
import { useTemplateStyles } from './useTemplateStyles';
import { getTemplateById } from './validation';

interface TemplateAwareBlockProps extends Omit<BlockProps, 'data'> {
  data: BlockData & {
    templateId?: string;
    template?: TileTemplate;
  };
}

/**
 * Enhanced Block component with template-aware styling
 */
export const TemplateAwareBlock = React.forwardRef<HTMLDivElement, TemplateAwareBlockProps>(({
  data,
  style,
  className,
  ...props
}, ref) => {
  // Get template from data or fallback to default
  const template = React.useMemo(() => {
    if (data.template) return data.template;
    if (data.templateId) return getTemplateById(data.templateId);
    return null;
  }, [data.template, data.templateId]);

  // Get template-aware styles
  const templateStyles = useTemplateStyles({
    template: template || {
      id: 'default',
      name: 'Default',
      category: 'square',
      dimensions: { w: data.w, h: data.h },
      aspectRatio: data.w / data.h,
      allowedTileTypes: [data.type],
      responsiveScaling: {
        breakpoints: {
          mobile: { minWidth: 0, maxWidth: 768, scaleFactor: 0.8 },
          tablet: { minWidth: 769, maxWidth: 1024, scaleFactor: 0.9 },
          desktop: { minWidth: 1025, maxWidth: Infinity, scaleFactor: 1.0 }
        }
      }
    },
    gridDimensions: { w: data.w, h: data.h },
    enableResponsive: true
  });

  // Merge template styles with existing styles
  const mergedStyle: React.CSSProperties = {
    ...style,
    ...templateStyles.containerStyle
  };

  const mergedClassName = `${className || ''} ${templateStyles.containerClassName}`.trim();

  // For circle templates, we need to wrap the content differently
  if (templateStyles.isCircle) {
    return (
      <div
        ref={ref}
        className={mergedClassName}
        style={mergedStyle}
        {...props}
      >
        {/* Circle template wrapper */}
        <div 
          className={templateStyles.contentClassName}
          style={templateStyles.contentStyle}
        >
          <Block
            data={data}
            style={{}}
            className="w-full h-full"
            {...props}
          />
        </div>
        
        {/* Inject responsive CSS if needed */}
        {templateStyles.responsiveCSS && (
          <style>
            {`:root { ${templateStyles.responsiveCSS} }`}
          </style>
        )}
      </div>
    );
  }

  // For non-circle templates, use standard Block
  return (
    <Block
      ref={ref}
      data={data}
      style={mergedStyle}
      className={mergedClassName}
      {...props}
    />
  );
});

TemplateAwareBlock.displayName = 'TemplateAwareBlock';

/**
 * Hook for converting legacy BlockData to template-aware format
 */
export function useTemplateAwareBlockData(
  blockData: BlockData,
  template?: TileTemplate
): BlockData & { templateId?: string; template?: TileTemplate } {
  return React.useMemo(() => {
    if (template) {
      return {
        ...blockData,
        templateId: template.id,
        template,
        // Update dimensions to match template
        w: template.dimensions.w,
        h: template.dimensions.h
      };
    }
    return blockData;
  }, [blockData, template]);
}

/**
 * Utility component for applying circle template styling to any content
 */
export const CircleTemplateWrapper: React.FC<{
  template: TileTemplate;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ template, children, className, style }) => {
  const templateStyles = useTemplateStyles({
    template,
    enableResponsive: true
  });

  if (!templateStyles.isCircle) {
    return <>{children}</>;
  }

  return (
    <div 
      className={`${templateStyles.containerClassName} ${className || ''}`.trim()}
      style={{ ...templateStyles.containerStyle, ...style }}
    >
      <div 
        className={templateStyles.contentClassName}
        style={templateStyles.contentStyle}
      >
        {children}
      </div>
      
      {/* Inject responsive CSS */}
      {templateStyles.responsiveCSS && (
        <style>
          {`:root { ${templateStyles.responsiveCSS} }`}
        </style>
      )}
    </div>
  );
};

/**
 * Higher-order component for adding template awareness to any component
 */
export function withTemplateAwareness<P extends object>(
  Component: React.ComponentType<P>
) {
  return React.forwardRef<any, P & { template?: TileTemplate }>((props, ref) => {
    const { template, ...componentProps } = props;
    
    if (!template || template.category !== 'circle') {
      return <Component ref={ref} {...(componentProps as P)} />;
    }

    return (
      <CircleTemplateWrapper template={template}>
        <Component ref={ref} {...(componentProps as P)} />
      </CircleTemplateWrapper>
    );
  });
}