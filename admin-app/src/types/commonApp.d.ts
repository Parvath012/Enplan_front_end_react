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