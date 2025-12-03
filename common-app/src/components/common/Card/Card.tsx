import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { Box, Typography, Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { MenuIcon } from './MenuIcon';
import './Card.scss';

export interface CardAction {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick?: (data?: any) => void;
  disabled?: boolean;
  divider?: boolean;
}

export interface CardSection {
  id: string;
  content: ReactNode;
  backgroundColor?: string;
  padding?: string;
  borderBottom?: boolean;
}

export interface CardProps<T = any> {
  // Data
  data?: T;
  id?: string;
  
  // Header
  title?: string | ReactNode;
  titleRenderer?: (data: T) => ReactNode;
  
  // Content sections
  sections?: CardSection[];
  content?: ReactNode | ((data: T) => ReactNode);
  
  // Footer
  footer?: ReactNode;
  actions?: CardAction[];
  showMenuButton?: boolean;
  
  // Sizing
  size?: 'small' | 'medium' | 'large' | 'custom';
  width?: string | number;
  height?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  minHeight?: string | number;
  maxHeight?: string | number;
  
  // Styling
  variant?: 'default' | 'outlined' | 'elevated';
  className?: string;
  headerBackgroundColor?: string;
  footerBackgroundColor?: string;
  
  // States
  selected?: boolean;
  disabled?: boolean;
  loading?: boolean;
  dragging?: boolean;
  
  // Events
  onClick?: (data: T, event: React.MouseEvent) => void;
  onDoubleClick?: (data: T, event: React.MouseEvent) => void;
  onMouseDown?: (data: T, event: React.MouseEvent) => void;
  onHover?: (data: T, isHovering: boolean) => void;
  
  // Menu
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

const SIZE_CONFIG = {
  small: { width: '280px', height: '160px' },
  medium: { width: '360px', height: '200px' },
  large: { width: '440px', height: '240px' },
  custom: { width: 'auto', height: 'auto' },
};

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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    setAnchorEl(null);
  };

  const handleMenuItemClick = (action: CardAction, event: React.MouseEvent) => {
    event.stopPropagation();
    if (action.onClick) {
      action.onClick(data);
    }
    handleMenuClose();
  };

  const handleBoxClick = (e: React.MouseEvent<HTMLDivElement>) => {
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
  };

  const handleBoxMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) {
      e.stopPropagation();
      return;
    }
    
    if (onMouseDown) {
      onMouseDown(data as T, e);
    }
  };

  const handleBoxDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) {
      e.stopPropagation();
      return;
    }
    
    if (onDoubleClick) {
      onDoubleClick(data as T, e);
    }
  };

  const getCardStyles = () => {
    const sizeConfig = SIZE_CONFIG[size];
    const baseStyles: React.CSSProperties = {
      width: width ?? sizeConfig.width,
      height: height ?? sizeConfig.height,
      minWidth: minWidth,
      maxWidth: maxWidth,
      minHeight: minHeight,
      maxHeight: maxHeight,
      borderRadius: '8px',
      userSelect: 'none',
      fontFamily: 'Inter Tight, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      overflow: 'hidden',
      flexShrink: 0,
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease, opacity 0.2s ease',
      position: 'relative',
    };

    const variantStyles = {
      default: {
        border: selected ? '1px solid #1976d2' : '1px solid #d0d0d0',
        boxShadow: selected 
          ? '0 0 0 1px #1976d2, 0 2px 4px rgba(0, 0, 0, 0.15)' 
          : '0 1px 3px rgba(0, 0, 0, 0.12)',
        backgroundColor: disabled ? '#f5f5f5' : '#ffffff',
      },
      outlined: {
        border: selected ? '2px solid #1976d2' : '1px solid #d0d0d0',
        boxShadow: selected 
          ? '0 0 0 1px #1976d2, 0 2px 4px rgba(0, 0, 0, 0.15)' 
          : 'none',
        backgroundColor: disabled ? '#f5f5f5' : '#ffffff',
      },
      elevated: {
        border: 'none',
        boxShadow: selected 
          ? '0 0 0 1px #1976d2, 0 4px 8px rgba(0, 0, 0, 0.2)' 
          : '0 2px 6px rgba(0, 0, 0, 0.15)',
        backgroundColor: disabled ? '#f5f5f5' : '#ffffff',
      },
    };

    // Determine cursor style
    let cursorStyle: string;
    if (disabled) {
      cursorStyle = 'not-allowed';
    } else if (dragging) {
      cursorStyle = 'grabbing';
    } else {
      cursorStyle = 'pointer';
    }

    return {
      ...baseStyles,
      ...variantStyles[variant],
      cursor: cursorStyle,
      opacity: disabled ? 0.6 : 1,
      transform: dragging ? 'scale(1.01)' : 'scale(1)',
    };
  };

  const getCardClassName = () => {
    const classes = ['common-card', className];
    if (dragging) classes.push('dragging');
    if (selected) classes.push('selected');
    if (disabled) classes.push('disabled');
    return classes.join(' ');
  };

  const hasTitleToRender = (): boolean => {
    if (title !== undefined && title !== null) return true;
    if (titleRenderer !== undefined && data !== undefined && data !== null) return true;
    return false;
  };

  const renderTitle = (): React.ReactElement | React.ReactElement[] | string | number | null => {
    if (titleRenderer && data) {
      const rendered = titleRenderer(data as T);
      // Ensure we return a valid ReactNode (not a function)
      if (typeof rendered === 'function') {
        return null;
      }
      return rendered as React.ReactElement | React.ReactElement[] | string | number | null;
    }
    if (title) {
      if (typeof title === 'string') {
        return (
          <Typography
            sx={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#262626',
              fontFamily: 'Roboto, Arial, sans-serif',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </Typography>
        );
      }
      // If title is already a ReactNode (but not a function), return it
      if (typeof title !== 'function') {
        return title as React.ReactElement | React.ReactElement[] | string | number;
      }
    }
    return null;
  };


  const renderContent = () => {
    if (sections.length > 0) {
      return sections.map((section) => (
        <Box
          key={section.id}
          sx={{
            padding: section.padding ?? '6px 12px',
            backgroundColor: section.backgroundColor ?? '#ffffff',
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

  return (
    <Box
      className={getCardClassName()}
      data-selected={selected}
      data-card-id={id}
      data-box-id={id} // For compatibility with ProcessGroupBox CSS
      data-disabled={disabled}
      onMouseDown={handleBoxMouseDown}
      onClick={handleBoxClick}
      onDoubleClick={handleBoxDoubleClick}
      onMouseEnter={() => onHover && onHover(data as T, true)}
      onMouseLeave={() => onHover && onHover(data as T, false)}
      sx={getCardStyles()}
    >
      {/* Header */}
      {(hasTitleToRender() ? (
        <Box
          component="div"
          sx={{
            backgroundColor: headerBackgroundColor,
            padding: '6px 12px',
            borderBottom: '1px solid #e8e8e8',
          }}
        >
          {renderTitle()}
        </Box>
      ) : null) as any}

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

          {/* Actions Menu Button */}
          {showMenuButton && actions.length > 0 && (
            <Box
              onClick={handleMenuClick}
              sx={{
                marginLeft: 'auto',
                cursor: 'pointer',
                padding: '2px 4px',
                pointerEvents: 'auto',
                opacity: 1,
                '&:hover': { backgroundColor: '#f5f5f5', borderRadius: '2px' },
              }}
            >
              <MenuIcon />
            </Box>
          )}
        </Box>
      )}

      {/* Actions Menu */}
      {actions.length > 0 && (
        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={(event: any) => handleMenuClose(event)}
          onClick={(e) => e.stopPropagation()}
          className={`common-card-menu ${menuClassName}`}
          anchorOrigin={menuAnchorOrigin}
          transformOrigin={menuTransformOrigin}
          slotProps={{
            list: {
              className: 'common-card-menu__list',
            },
            paper: {
              className: 'common-card-menu__paper',
            }
          }}
        >
          {actions.map((action, index) => {
            const menuItem = (
              <MenuItem
                key={action.id}
                disableRipple
                disabled={action.disabled}
                className="common-card-menu__item"
                onClick={(e) => handleMenuItemClick(action, e)}
              >
                {action.icon && (
                  <ListItemIcon className="common-card-menu__icon">
                    {action.icon}
                  </ListItemIcon>
                )}
                <ListItemText
                  primary={action.label}
                  className="common-card-menu__text"
                />
              </MenuItem>
            );

            // Return array of elements instead of Fragment
            if (action.divider && index > 0) {
              return [
                <Divider key={`divider-${action.id}`} className="common-card-menu__divider" />,
                menuItem
              ];
            }
            return menuItem;
          })}
        </Menu>
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
          <Typography sx={{ fontSize: '12px', color: '#666' }}>Loading...</Typography>
        </Box>
      )}
    </Box>
  );
};

export default Card;

