import React, { useState, memo, useEffect } from "react";
import { 
  Help, 
  DataCollection, 
  MacCommand, 
  Currency, 
  InventoryManagement, 
  Categories, 
  Connect, 
  Money, 
  Notification 
} from "@carbon/icons-react";
import { useNavigate, useLocation } from "react-router-dom";
import "./LeftSidebar.scss";
import { Avatar } from "@mui/material";

interface TooltipProps {
  text: string;
  visible: boolean;
}

const Tooltip = memo(({ text, visible }: TooltipProps) => {
  if (!visible) return null;
  return (
    <div className="left-sidebar__tooltip">
      {text}
    </div>
  );
});

Tooltip.displayName = "Tooltip";


// Move NavIcon outside of LeftSidebar
interface NavIconProps {
  icon: React.ReactNode;
  tooltip: string;
  active?: boolean;
  onClick?: () => void;
}

// AdminIcon component outside of LeftSidebar
const AdminIcon = () => (
  <img
    src="/icons/manage_accounts_24dp_666666.svg"
    alt="Admin"
    width={18}
    height={18}
    className="left-sidebar__admin-icon"
  />
);

const NavIcon = memo(function NavIcon({ icon, tooltip, active = false, onClick }: NavIconProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <button
      type="button"
      className={`left-sidebar__nav-item ${active ? 'left-sidebar__nav-item--active' : ''}`}
      aria-pressed={active}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={onClick}
      tabIndex={onClick ? 0 : -1}
      style={{ background: 'none', border: 'none', padding: 0, margin: 0 }}
    >
      <div className="left-sidebar__icon-container">
        {icon}
      </div>
      <Tooltip text={tooltip} visible={showTooltip} />
    </button>
  );
});

const LeftSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeIcon, setActiveIcon] = useState<string | null>(null);
  const [hasNotifications] = useState(true); // This would be controlled by your app's notification system

  // Store icon details as a constant array
  const navIcons = [
  { navId: "admin", icon: <AdminIcon />, tooltip: "Admin" },
    { navId: "help", icon: <Help size={18} />, tooltip: "Help" },
    { navId: "dataManagement", icon: <DataCollection size={18} />, tooltip: "Data Management" },
    { navId: "masters", icon: <MacCommand size={18} />, tooltip: "Masters" },
    { navId: "budgeting", icon: <Currency size={18} />, tooltip: "Budgeting" },
    { navId: "inventory", icon: <InventoryManagement size={18} />, tooltip: "Inventory / OTB" },
    { navId: "assortment", icon: <Categories size={18} />, tooltip: "Assortment" },
    { navId: "allocation", icon: <Connect size={18} />, tooltip: "Allocation & Replenishment" },
    { navId: "fpAndA", icon: <Money size={18} />, tooltip: "FP & A" }
  ];

  // Notification icon details
  const notificationIcon = {
    navId: "notifications",
    icon: <>
      <Notification size={18} />
      {hasNotifications && <span className="left-sidebar__notification-indicator"></span>}
    </>,
    tooltip: "Notifications"
  };

  // Set active icon based on current route (refactored to avoid duplication)
  useEffect(() => {
    const routes = [
      { path: '/admin', icon: 'admin' },
      { path: '/help', icon: 'help' },
      { path: '/admin/data-management', icon: 'dataManagement' },
      { path: '/masters', icon: 'masters' },
      { path: '/budgeting', icon: 'budgeting' },
      { path: '/inventory', icon: 'inventory' },
      { path: '/assortment', icon: 'assortment' },
      { path: '/allocation', icon: 'allocation' },
      { path: '/fp-and-a', icon: 'fpAndA' },
      { path: '/notifications', icon: 'notifications' }
    ];
    const match = routes.find(r => location.pathname.startsWith(r.path));
    setActiveIcon(match ? match.icon : null);
  }, [location.pathname]);

  const handleNavClick = (navId: string) => {
    setActiveIcon(navId);
    // Navigate to the appropriate route based on the clicked icon
    switch(navId) {
      case 'admin':
        navigate('/admin');
        break;
      case 'help':
        navigate('/help');
        break;
      case 'dataManagement':
        navigate('/data-management');
        break;
      case 'masters':
        navigate('/masters');
        break;
      case 'budgeting':
        navigate('/budgeting');
        break;
      case 'inventory':
        navigate('/inventory');
        break;
      case 'assortment':
        navigate('/assortment');
        break;
      case 'allocation':
        navigate('/allocation');
        break;
      case 'fpAndA':
        navigate('/fp-and-a');
        break;
      case 'notifications':
        navigate('/notifications');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <aside className="left-sidebar">
      <div className="left-sidebar__container">
        <div className="left-sidebar__logo">
          <img 
            src={"/ENPLAN_Logo.svg"} 
            alt="EnPlan Logo" 
            width="24" 
            height="24" 
          />
        </div>
        <div className="left-sidebar__divider"></div>
        <div className="left-sidebar__top">
          {navIcons.map(({ navId, icon, tooltip }) => (
            <NavIcon
              key={navId}
              icon={icon}
              tooltip={tooltip}
              active={activeIcon === navId}
              onClick={() => handleNavClick(navId)}
            />
          ))}
        </div>
        <div className="left-sidebar__bottom">
          <div className="left-sidebar__notification-container">
            <NavIcon
              key={notificationIcon.navId}
              icon={notificationIcon.icon}
              tooltip={notificationIcon.tooltip}
              active={activeIcon === notificationIcon.navId}
              onClick={() => handleNavClick(notificationIcon.navId)}
            />
          </div>
          <div className="left-sidebar__divider"></div>
          <div className="left-sidebar__avatar">
            <Avatar sx={{ width: 28, height: 28, cursor: 'pointer' }} />
          </div>
        </div>
      </div>
    </aside>
  );
}

export default LeftSidebar;
