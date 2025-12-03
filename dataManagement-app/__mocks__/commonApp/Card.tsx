import React from 'react';
import { Box } from '@mui/material';

/**
 * Mock Card component for Jest tests
 * This mock provides a simple implementation of the Card component
 * to avoid module federation issues during testing
 */

export interface CardAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: (data?: any) => void;
  disabled?: boolean;
  divider?: boolean;
}

export interface CardSection {
  id: string;
  content: React.ReactNode;
  backgroundColor?: string;
  padding?: string;
  borderBottom?: boolean;
}

export interface CardProps<T = any> {
  data?: T;
  id?: string;
  title?: string | React.ReactNode;
  titleRenderer?: (data: T) => React.ReactNode;
  sections?: CardSection[];
  content?: React.ReactNode | ((data: T) => React.ReactNode);
  footer?: React.ReactNode;
  actions?: CardAction[];
  showMenuButton?: boolean;
  size?: 'small' | 'medium' | 'large' | 'custom';
  width?: string | number;
  height?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  minHeight?: string | number;
  maxHeight?: string | number;
  variant?: 'default' | 'outlined' | 'elevated';
  className?: string;
  headerBackgroundColor?: string;
  footerBackgroundColor?: string;
  selected?: boolean;
  disabled?: boolean;
  loading?: boolean;
  dragging?: boolean;
  onClick?: (data: T, event: React.MouseEvent) => void;
  onDoubleClick?: (data: T, event: React.MouseEvent) => void;
  onMouseDown?: (data: T, event: React.MouseEvent) => void;
  onHover?: (data: T, isHovering: boolean) => void;
  menuClassName?: string;
  menuAnchorOrigin?: {
    vertical: 'top' | 'center' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
  menuTransformOrigin?: {
    vertical: 'top' | 'center' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
}

const Card = <T = any,>({
  data,
  id,
  title,
  titleRenderer,
  sections = [],
  content,
  footer,
  actions = [],
  showMenuButton = false,
  size = 'medium',
  width,
  height,
  minWidth,
  maxWidth,
  minHeight,
  maxHeight,
  variant = 'default',
  className = '',
  headerBackgroundColor = '#ffffff',
  footerBackgroundColor = 'rgba(250, 250, 249, 1)',
  selected = false,
  disabled = false,
  loading = false,
  dragging = false,
  onClick,
  onDoubleClick,
  onMouseDown,
  onHover,
  menuClassName = '',
  menuAnchorOrigin = { vertical: 'bottom', horizontal: 'right' },
  menuTransformOrigin = { vertical: 'top', horizontal: 'right' },
}: CardProps<T>) => {
  const renderTitle = (): React.ReactElement | null => {
    if (titleRenderer && data) {
      const rendered = titleRenderer(data as T);
      if (typeof rendered === 'function') {
        return null;
      }
      return rendered as React.ReactElement;
    }
    if (title) {
      if (typeof title === 'string') {
        return <div className="card-title">{title}</div>;
      }
      if (typeof title !== 'function') {
        return title as React.ReactElement;
      }
    }
    return null;
  };

  const renderContent = () => {
    if (sections.length > 0) {
      return sections.map((section) => (
        <Box
          key={section.id}
          data-testid={`card-section-${section.id}`}
          sx={{
            padding: section.padding || '6px 12px',
            backgroundColor: section.backgroundColor || '#ffffff',
            borderBottom: section.borderBottom !== false ? '1px solid #e8e8e8' : 'none',
          }}
        >
          {section.content}
        </Box>
      ));
    }
    
    if (content) {
      return typeof content === 'function' && data ? content(data as T) : content;
    }
    
    return null;
  };

  const hasTitle = () => {
    if (title !== undefined && title !== null) return true;
    if (titleRenderer !== undefined && data !== undefined && data !== null) return true;
    return false;
  };

  return (
    <Box
      className={`common-card ${className} ${dragging ? 'dragging' : ''} ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
      data-selected={selected}
      data-card-id={id}
      data-box-id={id}
      data-disabled={disabled}
      onMouseDown={(e) => {
        if (disabled) {
          e.stopPropagation();
          return;
        }
        if (onMouseDown) {
          onMouseDown(data as T, e);
        }
      }}
      onClick={(e) => {
        if (disabled) {
          e.stopPropagation();
          return;
        }
        const target = e.target as HTMLElement;
        if (target.closest('.MuiMenu-root') || target.closest('.MuiMenuItem-root')) {
          return;
        }
        if (onClick) {
          onClick(data as T, e);
        }
      }}
      onDoubleClick={(e) => {
        if (disabled) {
          e.stopPropagation();
          return;
        }
        if (onDoubleClick) {
          onDoubleClick(data as T, e);
        }
      }}
      onMouseEnter={() => onHover && onHover(data as T, true)}
      onMouseLeave={() => onHover && onHover(data as T, false)}
      sx={{
        width: width || (size === 'small' ? '280px' : size === 'medium' ? '360px' : size === 'large' ? '440px' : 'auto'),
        height: height || (size === 'small' ? '160px' : size === 'medium' ? '200px' : size === 'large' ? '240px' : 'auto'),
        minWidth,
        maxWidth,
        minHeight,
        maxHeight,
        borderRadius: '8px',
        border: selected ? '1px solid #1976d2' : '1px solid #d0d0d0',
        backgroundColor: disabled ? '#f5f5f5' : '#ffffff',
        cursor: disabled ? 'not-allowed' : dragging ? 'grabbing' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        position: 'relative',
      }}
    >
      {/* Header */}
      {hasTitle() ? (
        <Box
          sx={{
            backgroundColor: headerBackgroundColor,
            padding: '6px 12px',
            borderBottom: '1px solid #e8e8e8',
          }}
        >
          {renderTitle()}
        </Box>
      ) : null}

      {/* Content Sections */}
      {renderContent()}

      {/* Footer */}
      {(footer || actions.length > 0 || showMenuButton) && (
        <Box
          data-menu-container
          sx={{
            display: 'flex',
            gap: '0px',
            padding: '6px 12px',
            backgroundColor: footerBackgroundColor,
            fontSize: '11px',
            color: '#5a5a5a',
            alignItems: 'center',
            pointerEvents: 'auto',
            marginTop: 'auto',
          }}
        >
          {footer && (
            <Box
              sx={{
                display: 'flex',
                gap: '0px',
                alignItems: 'center',
                opacity: disabled ? 0.6 : 1,
                pointerEvents: disabled ? 'none' : 'auto',
              }}
            >
              {footer}
            </Box>
          )}
        </Box>
      )}

      {/* Loading Overlay */}
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <div>Loading...</div>
        </Box>
      )}
    </Box>
  );
};

// MenuIcon component mock
export const MenuIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="9" cy="4" r="1.5" fill="#5a5a5a"/>
    <circle cx="9" cy="9" r="1.5" fill="#5a5a5a"/>
    <circle cx="9" cy="14" r="1.5" fill="#5a5a5a"/>
  </svg>
);

export default Card;

