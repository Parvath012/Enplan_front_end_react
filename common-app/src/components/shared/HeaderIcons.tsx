import React from "react";
import { Chat, VolumeBlockStorage } from "@carbon/icons-react";
import CustomTooltip from "../common/CustomTooltip";
import "./HeaderIcons.scss";

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
    component: <VolumeBlockStorage size={18} color="rgba(0, 0, 0, 0.54)" />,
    alt: "Asset Library",
    tooltip: "Asset Library",
  },
  {
    component: <Chat size={18} color="rgba(0, 0, 0, 0.54)" />,
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
  return (
    <div className={className}>
      {iconItems.map((icon, idx) => {
        let renderedIcon;
        if (icon.divider) {
          renderedIcon = (
            <div className="header-divider" key={"divider-" + idx}></div>
          );
        } else if (icon.component) {
          const button = (
            <button
              className="icon-item"
              key={icon.alt}
              type="button"
              aria-label={icon.alt}
            >
              {icon.component}
            </button>
          );
          
          renderedIcon = icon.tooltip ? (
            <CustomTooltip title={icon.tooltip} key={icon.alt} placement="bottom">
              {button}
            </CustomTooltip>
          ) : button;
        } else {
          const button = (
            <button
              className="icon-item"
              key={icon.alt}
              type="button"
              aria-label={icon.alt}
            >
              <img src={icon.src} alt={icon.alt} />
            </button>
          );
          
          renderedIcon = icon.tooltip ? (
            <CustomTooltip title={icon.tooltip} key={icon.alt} placement="bottom">
              {button}
            </CustomTooltip>
          ) : button;
        }
        return renderedIcon;
      })}
    </div>
  );
};

export default HeaderIcons;