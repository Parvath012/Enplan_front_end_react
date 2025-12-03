import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Header.scss";
import HeaderIcons from "commonApp/HeaderIcons";

interface NavItem {
  id: string;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { id: "entity-setup", label: "Entity Setup", path: "/admin/entity-setup" },
  { id: "template", label: "Template", path: "/admin/template" },
  { id: "settings", label: "Settings", path: "/admin/settings" },
  { id: "infrastructure", label: "Infrastructure", path: "/admin/infrastructure" },
  { id: "user-management", label: "User Management", path: "/admin/user-management" },
  { id: "workflows", label: "Workflows", path: "/admin/workflows" },
  { id: "dashboards", label: "Dashboards", path: "/admin/dashboards" },
];



const Header: React.FC = () => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState<string>("");

  useEffect(() => {
    const found = navItems.find(item => location.pathname.includes(item.path));
    setActiveItem(found ? found.id : "");
  }, [location.pathname]);

  return (
    <div className="header">
      <div className="header-left">
        {/* <div className="header-logo">
          <img 
            src={"/logo.svg"} 
            alt="EnPlan Logo" 
            width="136" 
            height="36" 
          />
        </div> */}
        <nav className="header-nav">
          <ul className="nav-list">
            {navItems.map(item => (
              <li
                key={item.id}
                className={`nav-item${activeItem === item.id ? " active" : ""}`}
              >
                <Link to={item.path} onClick={() => setActiveItem(item.id)}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="header-right">
        <HeaderIcons />
      </div>
    </div>
  );
};

export default Header;
