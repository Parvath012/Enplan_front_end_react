import React, { useRef, useState } from "react";
import {
  Box,
  Button,
  IconButton,
} from "@mui/material";
import { Search, Filter, Upload } from "@carbon/icons-react";
import CustomTooltip from 'commonApp/CustomTooltip';
import { getActionButtonStyles, getButtonContentStyles, getButtonTextStyles } from '../userManagement/PermissionTableConstants';
import ViewByDropdown from './ViewByDropdown';
import { ViewByType, DEFAULT_VIEW_TYPE } from '../../constants/reportingStructureConstants';


// Custom Sort Icon Component
const CustomSortIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = '#1f1f1f' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height={`${size}px`}
    viewBox="0 -960 960 960"
    width={`${size}px`}
    fill={color}
  >
    <path d="m80-280 150-400h86l150 400h-82l-34-96H196l-32 96H80Zm140-164h104l-48-150h-6l-50 150Zm328 164v-76l202-252H556v-72h282v76L638-352h202v72H548ZM360-760l120-120 120 120H360ZM480-80 360-200h240L480-80Z"/>
  </svg>
);

// View By Icon Component - from View By.svg
const ViewByIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = '#667085' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height={`${size}px`}
    viewBox="0 0 32 32"
    width={`${size}px`}
    fill={color}
  >
    <path d="M23,23v6c0,1.1.9,2,2,2h4c1.1,0,2-.9,2-2v-6c0-1.1-.9-2-2-2h-1v-10h1c1.1,0,2-.9,2-2V3c0-1.1-.9-2-2-2h-4c-1.1,0-2,.9-2,2v6c0,1.1.9,2,2,2h1v4H6c-1.1,0-2,.9-2,2v4h-1c-1.1,0-2,.9-2,2v6c0,1.1.9,2,2,2h4c1.1,0,2-.9,2-2v-6c0-1.1-.9-2-2-2h-1v-4h9v4h-1c-1.1,0-2,.9-2,2v6c0,1.1.9,2,2,2h4c1.1,0,2-.9,2-2v-6c0-1.1-.9-2-2-2h-1v-4h9v4h-1c-1.1,0-2,.9-2,2ZM29,23v6h-4v-6h4ZM25,9V3h4v6h-4ZM7,23v6H3v-6h4ZM18,23v6h-4v-6h4Z"/>
    <g>
      <circle cx="14" cy="6" r="1.62"/>
      <path d="M20.32,5.58c-1.03-2.61-3.51-4.36-6.32-4.45-2.81.09-5.29,1.84-6.32,4.45l-.18.42.18.42c1.03,2.61,3.51,4.36,6.32,4.45,2.81-.09,5.29-1.84,6.32-4.45l.18-.42-.18-.42ZM14,9.25c-1.79,0-3.25-1.45-3.25-3.25s1.45-3.25,3.25-3.25,3.25,1.45,3.25,3.25-1.46,3.25-3.25,3.25Z"/>
    </g>
  </svg>
);

type ReportingStructureToolbarProps = {
  onSearchClick: () => void;
  onFilterToggle?: () => void;
  onSortToggle?: () => void;
  onViewByClick?: () => void;
  onBulkUploadClick?: () => void;
  isSearchActive?: boolean;
  onSearchChange?: (value: string) => void;
  searchValue?: string;
  onSearchClose?: () => void;
  selectedViewBy?: ViewByType;
  onViewByChange?: (view: ViewByType) => void;
};

const ReportingStructureToolbar: React.FC<ReportingStructureToolbarProps> = ({
  onSearchClick,
  onFilterToggle,
  onSortToggle,
  onViewByClick,
  onBulkUploadClick,
  isSearchActive = false,
  onSearchChange,
  searchValue = "",
  onSearchClose,
  selectedViewBy = DEFAULT_VIEW_TYPE,
  onViewByChange,
}) => {
  const [viewByAnchorEl, setViewByAnchorEl] = useState<HTMLElement | null>(null);
  const viewByButtonRef = useRef<HTMLButtonElement>(null);


  const handleViewByClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (onViewByClick) {
      onViewByClick();
    }
    // Always use the button ref for consistent positioning
    if (viewByButtonRef.current) {
      setViewByAnchorEl(viewByButtonRef.current);
    } else {
      // Fallback to currentTarget if ref is not available
      setViewByAnchorEl(event.currentTarget);
    }
  };

  const handleViewByClose = () => {
    setViewByAnchorEl(null);
  };

  const handleViewBySelect = (view: ViewByType) => {
    onViewByChange?.(view);
    handleViewByClose();
  };


  return (
    <Box sx={{ display: "flex", gap: { xs: 0.5, sm: 1 }, alignItems: "center", justifyContent: "flex-start" }}>
      {/* Search Icon - Non-clickable but with hover effect */}
      <CustomTooltip title="Search" placement="bottom">
        <span>
          <IconButton
            size="small"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            sx={{
              padding: "4px",
              width: "22px",
              height: "22px",
              borderRadius: 1,
              color: "#bdbdbd",
              backgroundColor: "transparent",
              cursor: "default",
              "&:hover": {
                backgroundColor: "transparent",
                width: "22px",
                height: "22px",
                borderRadius: 1,
              },
              "&:active": {
                backgroundColor: "transparent",
              }
            }}
          >
            <Search size={16} />
          </IconButton>
        </span>
      </CustomTooltip>

      {/* Filter Icon */}
      <CustomTooltip title="Filter" placement="bottom">
        <span>
          <IconButton
            disabled
            size="small"
            onClick={onFilterToggle}
            sx={{ padding: { xs: "4px", sm: "8px" } }}
          >
            <Filter size={16} />
          </IconButton>
        </span>
      </CustomTooltip>

      {/* Sort Icon - Disabled (non-clickable) */}
      <CustomTooltip title="Sort" placement="bottom">
        <span>
          <IconButton
            disabled
            size="small"
            onClick={onSortToggle}
            sx={{
              padding: { xs: "4px", sm: "8px" },
              color: "#bdbdbd",
              "&:disabled": {
                color: "#bdbdbd"
              }
            }}
          >
            <CustomSortIcon size={16} color="#bdbdbd" />
          </IconButton>
        </span>
      </CustomTooltip>

      {/* Horizontal Divider between Sort and View By */}
      <Box
        sx={{
          width: "1px",
          height: "16px",
          backgroundColor: "rgba(242, 242, 240, 1)",
          margin: 0,
        }}
      />

      {/* View By Icon (Hierarchy/Structure) */}
      {onViewByClick && (
        <>
          <CustomTooltip title="View By" placement="bottom">
            <IconButton
              ref={viewByButtonRef}
              size="small"
              onClick={handleViewByClick}
              sx={{ 
                padding: 0,
                width: "22px",
                height: "22px",
                minWidth: "22px",
                minHeight: "22px",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "&:hover": {
                  backgroundColor: "rgba(242, 242, 240, 1)",
                  borderRadius: "4px",
                }
              }}
            >
              <ViewByIcon size={16} color="#1f1f1f" />
            </IconButton>
          </CustomTooltip>
          <ViewByDropdown
            anchorEl={viewByAnchorEl}
            open={Boolean(viewByAnchorEl)}
            onClose={handleViewByClose}
            selectedView={selectedViewBy}
            onSelect={handleViewBySelect}
          />
        </>
      )}

      {/* Vertical Separator */}
      <Box
        sx={{
          width: "1px",
          height: "16px",
          backgroundColor: "rgba(242, 242, 240, 1)",
          margin: 0,
        }}
      />

      {/* Bulk Upload Button */}
      {onBulkUploadClick && (
        <Button
          sx={{
            ...getActionButtonStyles(),
            cursor: 'default', // Change from pointer (hand) to default cursor
            '&:hover': {
              backgroundColor: 'rgba(0, 81, 171, 1)',
              boxShadow: 'none',
              cursor: 'default' // Keep default cursor on hover
            }
          }}
          onClick={onBulkUploadClick}
        >
          <Box sx={getButtonContentStyles()}>
            <Upload size={16} color="#ffffff" style={{ marginRight: '8px' }} />
            <Box component="span" sx={getButtonTextStyles()}>Bulk Upload</Box>
          </Box>
        </Button>
      )}
    </Box>
  );
};

export default ReportingStructureToolbar;

