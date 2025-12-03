import React from "react";
import { Box, Typography } from "@mui/material";
import {
  Search,
  Play,
  Stop,
  Flash,
  FlashOff,
  WatsonHealthSaveSeries,
  TrashCan,
  Copy,
  Paste,
  GroupObjects,
  ColorPalette,
  SettingsServices,
  Compass,
  DocumentProcessor,
  PortInput,
  PortOutput,
  Template,
  Notebook,
  IbmCloudVpcEndpoints,
  IbmUnstructuredDataProcessor,
  ChevronRight,
} from "@carbon/icons-react";
import CustomTooltip from "commonApp/CustomTooltip";
import "./TabNavigation.scss";

interface TabNavigationProps {
  activeTab: number;
  onTabChange: (tabIndex: number) => void;
  breadcrumb?: {
    flow?: string;
    processGroup?: string;
    id?: string;
  };
  onBreadcrumbClick?: () => void;
  onToolbarAction?: (action: string) => void;
  isInsideProcessGroup?: boolean;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  breadcrumb,
  onBreadcrumbClick,
  onToolbarAction,
  isInsideProcessGroup = false,
}) => {
  const tabs = [
    { label: "Navigate", index: 0, icon: <Compass size={12} />, disabled: isInsideProcessGroup },
    { label: "Processor", index: 1, icon: <DocumentProcessor size={12} />, disabled: !isInsideProcessGroup },
    { label: "Input Port", index: 2, icon: <PortInput size={12} />, disabled: true },
    { label: "Output Port", index: 3, icon: <PortOutput size={12} />, disabled: true },
    { label: "Process Group", index: 4, icon: <GroupObjects size={12} />, disabled: false },
    {
      label: "Remote Process Group",
      index: 5,
      icon: <IbmCloudVpcEndpoints size={12} />,
      disabled: false,
    },
    {
      label: "Funnel",
      index: 6,
      icon: <IbmUnstructuredDataProcessor size={12} />,
      disabled: true,
    },
    { label: "Template", index: 7, icon: <Template size={12} />, disabled: true },
    { label: "Label", index: 8, icon: <Notebook size={12} />, disabled: true },
  ];

  const toolbarIcons = [
    { icon: <Play size={14} />, label: "Start", action: "Start", disabled: false },
    { icon: <Stop size={14} />, label: "Stop", action: "Stop", disabled: false },
    { icon: <Flash size={14} />, label: "Enable", action: "Enable", disabled: false },
    { icon: <FlashOff size={14} />, label: "Disable", action: "Disable", disabled: false },
    {
      icon: <WatsonHealthSaveSeries size={14} />,
      label: "Save Template",
      action: "save-template",
      disabled: true,
    },
    {
      icon: (
        <img
          src="icons/Name=Upload Template.svg"
          alt="Upload Template"
          style={{ width: "14px", height: "14px" }}
        />
      ),
      label: "Upload Template",
      action: "upload-template",
      disabled: true,
    },
    { icon: <Copy size={14} />, label: "Copy", action: "copy", disabled: false },
    { icon: <Paste size={14} />, label: "Paste", action: "paste", disabled: false },
    { icon: <GroupObjects size={14} />, label: "Group", action: "group", disabled: true },
    { icon: <TrashCan size={14} />, label: "Delete", action: "delete", disabled: false },
    {
      icon: <ColorPalette size={14} />,
      label: "Change Color",
      action: "change-color",
      disabled: true,
    },
    {
      icon: <SettingsServices size={14} />,
      label: "Configuration",
      action: "configuration",
      disabled: false,
    },
  ];

  const handleToolbarAction = (action: string) => {
    console.log(`Toolbar action: ${action}`);
    
    if (onToolbarAction) {
      // Pass all toolbar actions to parent, including configuration
      onToolbarAction(action);
    }
  };

  return (
    <Box className="tab-navigation">
      {/* Title Section */}
      <Box className="tab-navigation-header">
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
               height: "30px",
          }}
        >
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '0px',
                marginBottom: "8px",
              }}
            >
              <Typography
                component="h1"
                className="tab-navigation-title"
                sx={{
                  color: onBreadcrumbClick && breadcrumb?.flow ? "#5F6368" : "#006fe6",
                  fontSize: "14px",
                  fontWeight: 500,
                  position: "relative",
                  paddingBottom: "4px",
                  textDecoration: "none",
                  cursor: onBreadcrumbClick ? 'pointer' : 'default',
                  transition: "color 0.2s ease",
                  '&:hover': {
                    color: "#006fe6",
                    textDecoration: onBreadcrumbClick ? 'underline' : 'none',
                  },
                  "&::after": !onBreadcrumbClick || !breadcrumb?.flow ? {
                    content: '""',
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: "2px",
                    backgroundColor: "#006fe6",
                  } : {},
                }}
                onClick={onBreadcrumbClick}
              >
                Data Management Flow
              </Typography>
              {onBreadcrumbClick && breadcrumb?.flow && (
                <>
                  <ChevronRight size={23} style={{ color: '#818586', marginTop: '-2px', strokeWidth:5  }} />
                  <Typography
                    sx={{
                      color: "rgb(0, 111, 230)",
                      fontSize: "14px",
                      fontWeight: 600,
                      position: "relative",
                      paddingBottom: "4px",
                      width: "150px",
                      textAlign: "center",
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        width: "150px",
                        height: "2px",
                        backgroundColor: "#006fe6",
                      },
                    }}
                  >
                    {breadcrumb.flow}
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Tab Container with Right Icons */}
      <Box className="tab-row">
        <Box className="tab-container">
          {tabs.map((tab, index) => (
            <React.Fragment key={tab.index}>
              <Box
                className={`tab-item ${activeTab === tab.index ? "active" : ""} ${tab.disabled ? "disabled" : ""}`}
                onClick={() => !tab.disabled && onTabChange(tab.index)}
                sx={{
                  position: "relative",
                  cursor: tab.disabled ? "not-allowed" : "pointer",
                  padding: "4px 6px",
                  margin: "0 2px",
                  fontSize: "10px",
                  fontWeight: 400,
                  color: tab.disabled ? "#a0a0a0" : "#5B6061",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  borderRadius: "4px",
                  minWidth: "fit-content",
                  whiteSpace: "nowrap",
                  "&.active": {
                    fontWeight: 400,
                  },
                  "&:hover": {
                    color: tab.disabled ? "#a0a0a0" : "#5B6061",
                    backgroundColor: tab.disabled ? "transparent" : "rgba(0, 0, 0, 0.04)",
                  },
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: "2px",
                    backgroundColor: "transparent",
                  },
                }}
              >
                {tab.label}
                {tab.icon}
              </Box>
              {/* Add vertical divider between tabs except between Process Group (index 4) and Remote Process Group (index 5) */}
              {index < tabs.length - 1 && !(tab.index === 4 && tabs[index + 1]?.index === 5) && (
                <Box
                  sx={{
                    width: "1px",
                    height: "16px",
                    backgroundColor: "#e5e7eb",
                    margin: "0 0px",
                    display: "flex",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </Box>

        {/* Right Header Icons */}
        <Box className="right-header-icons">
          <CustomTooltip title="Search" placement="bottom">
            <Box className="header-icon">
              <Search size={12} />
            </Box>
          </CustomTooltip>
          <CustomTooltip title="Add" placement="bottom">
            <Box className="header-icon">
              <img
                src="icons/medical_services.svg"
                alt="Add"
                style={{
                  width: "16px",
                  height: "16px",
                }}
              />
            </Box>
          </CustomTooltip>
          <CustomTooltip title="Paste" placement="bottom">
            <Box className="header-icon">
              <img
                src="icons/draft.svg"
                alt="Paste"
                style={{
                  width: "16px",
                  height: "16px",
                  transform: "rotate(180deg) scaleX(-1)",
                }}
              />
            </Box>
          </CustomTooltip>
        </Box>
      </Box>

      {/* Secondary Toolbar */}
      <Box className="secondary-toolbar" sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
        {/* Left side - Breadcrumb - Only show when NOT inside process group */}
        {!onBreadcrumbClick && breadcrumb?.flow && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: "'InterTight-Regular', 'Inter Tight', sans-serif",
              fontWeight: 400,
              fontStyle: 'normal',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              marginLeft: '19px',
              marginRight: 'auto',
            }}
          >
            <span style={{ color: '#5B6061' }}>{breadcrumb.flow}</span>
            {breadcrumb.processGroup && (
              <>
                <span style={{ color: '#818586' }}>|</span>
                <span style={{ color: '#818586' }}>{breadcrumb.processGroup}</span>
              </>
            )}
            {breadcrumb.id && (
              <>
                <span style={{ color: '#A9ACAD' }}>|</span>
                <span style={{ color: '#A9ACAD' }}>{breadcrumb.id}</span>
              </>
            )}
          </Box>
        )}
        
        {/* Right side - Toolbar Icons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
        {toolbarIcons.map((item, index) => (
          <React.Fragment key={item.action}>
            <CustomTooltip title={item.label} placement="bottom">
              <Box
                className={`toolbar-icon ${item.disabled ? 'disabled' : ''}`}
                onClick={() => !item.disabled && handleToolbarAction(item.action)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "10px",
                  height: "11px",
                  cursor: item.disabled ? "not-allowed" : "pointer",
                  borderRadius: "4px",
                  transition: "background-color 0.2s ease, opacity 0.2s ease",
                  opacity: item.disabled ? 0.4 : 1,
                  pointerEvents: item.disabled ? "none" : "auto",
                  "&:hover": {
                    backgroundColor: item.disabled ? "transparent" : "rgba(0, 0, 0, 0.04)",
                  },
                }}
              >
                {item.icon}
              </Box>
            </CustomTooltip>
            {/* Add vertical divider after every two icons (indices 1, 3, 5, 7, 9, etc.) */}
            {index % 2 === 1 && index < toolbarIcons.length - 1 && (
              <Box
                sx={{
                  width: "1px",
                  height: "16px",
                  backgroundColor: "#e5e7eb",
                  margin: "0 0px",
                  display: "flex",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              />
            )}
          </React.Fragment>
        ))}
        </Box>
      </Box>
    </Box>
  );
};

export default TabNavigation;
