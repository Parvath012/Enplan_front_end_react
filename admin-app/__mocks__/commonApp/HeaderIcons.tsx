import React, { useState } from 'react';

export interface TooltipProps {
  text: string;
  visible: boolean;
}

export const Tooltip = ({ text, visible }: TooltipProps) => {
  if (!visible) return null;
  return <div className="header__tooltip">{text}</div>;
};

export interface IconItem {
  src?: string;
  component?: React.ReactNode;
  alt: string;
  tooltip?: string;
  divider?: boolean;
}

const defaultIconItems: IconItem[] = [
  {
    src: "/icons/calendar_month_24dp_5B6061.svg",
    alt: "Calendar",
    tooltip: "Calendar",
  },
  {
    component: <svg data-testid="volume-block-storage" />,
    alt: "Asset Library",
    tooltip: "Asset Library",
  },
  {
    component: <svg data-testid="chat-icon" />,
    alt: "Chat",
    tooltip: "Chat",
  },
  { divider: true, alt: "divider" },
  {
    src: "/icons/fullscreen_24dp_5B6061.svg",
    alt: "Fullscreen",
    tooltip: "Fullscreen",
  },
];

interface HeaderIconsProps {
  iconItems?: IconItem[];
  className?: string;
}

const HeaderIcons: React.FC<HeaderIconsProps> = ({ 
  iconItems = defaultIconItems, 
  className = "header-icons" 
}) => {
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

  return (
    <div className={className}>
      {iconItems.map((icon, idx) => {
        let renderedIcon;
        if (icon.divider) {
          renderedIcon = (
            <div className="header-divider" key={"divider-" + idx}></div>
          );
        } else if (icon.component) {
          renderedIcon = (
            <button
              className="icon-item"
              key={icon.alt}
              type="button"
              aria-label={icon.alt}
              onMouseEnter={() => setHoveredIcon(icon.alt)}
              onMouseLeave={() => setHoveredIcon(null)}
            >
              {icon.component}
              {icon.tooltip && (
                <Tooltip
                  text={icon.tooltip}
                  visible={hoveredIcon === icon.alt}
                />
              )}
            </button>
          );
        } else {
          renderedIcon = (
            <button
              className="icon-item"
              key={icon.alt}
              type="button"
              aria-label={icon.alt}
              onMouseEnter={() => setHoveredIcon(icon.alt)}
              onMouseLeave={() => setHoveredIcon(null)}
            >
              <img src={icon.src} alt={icon.alt} />
              {icon.tooltip && (
                <Tooltip
                  text={icon.tooltip}
                  visible={hoveredIcon === icon.alt}
                />
              )}
            </button>
          );
        }
        return renderedIcon;
      })}
    </div>
  );
};

export default HeaderIcons;
