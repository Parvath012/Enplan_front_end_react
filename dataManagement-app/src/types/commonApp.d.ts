declare module "commonApp/shared" {
  export interface IconItem {
    src?: string;
    component?: React.ReactNode;
    alt: string;
    tooltip?: string;
    divider?: boolean;
  }

  export interface TooltipProps {
    text: string;
    visible: boolean;
  }

  export const HeaderIcons: React.FC<{
    iconItems?: IconItem[];
    className?: string;
  }>;

  export const Tooltip: React.FC<TooltipProps>;
}

declare module "commonApp/HeaderIcons" {
  export interface IconItem {
    src?: string;
    component?: React.ReactNode;
    alt: string;
    tooltip?: string;
    divider?: boolean;
  }

  const HeaderIcons: React.FC<{
    iconItems?: IconItem[];
    className?: string;
  }>;

  export default HeaderIcons;
}

declare module "commonApp/Panel" {
  export interface PanelProps {
    /** Whether the panel is open */
    isOpen: boolean;
    /** Callback when panel closes */
    onClose: () => void;
    /** Header title text */
    title: string;
    /** Content to display in the middle area */
    children: React.ReactNode;
    /** Label for the reset/cancel button (default: "Reset") */
    resetButtonLabel?: string;
    /** Label for the submit/save button (default: "Submit") */
    submitButtonLabel?: string;
    /** Callback when reset button is clicked */
    onReset?: () => void;
    /** Callback when submit button is clicked */
    onSubmit?: () => void;
    /** Whether to show the reset button (default: true) */
    showResetButton?: boolean;
    /** Whether to show the submit button (default: true) */
    showSubmitButton?: boolean;
    /** Whether the submit button is disabled (default: false) */
    submitButtonDisabled?: boolean;
    /** Custom CSS class name for the panel */
    className?: string;
    /** Custom CSS class name for the backdrop blur effect (default: "panel-blur") */
    blurClass?: string;
    /** Whether to enable blur effect on sidebar/headers (default: true) */
    enableBlur?: boolean;
    /** Additional selectors to blur when panel is open */
    additionalBlurSelectors?: string[];
  }

  const Panel: React.FC<PanelProps>;
  export default Panel;
  export type { PanelProps };
}

declare module "commonApp/Card" {
  import { ReactNode } from 'react';

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

  const Card: <T = any>(props: CardProps<T>) => React.ReactElement;
  export default Card;
  export type { CardProps, CardAction, CardSection };
  export const MenuIcon: React.FC;
}