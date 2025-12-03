import React, { useRef, useEffect } from "react";
import {
  Box,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Fade,
} from "@mui/material";
// Module Federation imports
import AddIcon from "@mui/icons-material/Add";
import { Search, Filter, Close } from "@carbon/icons-react";
// Support both direct import and lazy loading for CustomTooltip
const CustomTooltip = React.lazy(() => import('../common/CustomTooltip'));

// Custom Sort Icon Component
const CustomSortIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = '#1f1f1f' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height={`${size}px`}
    viewBox="0 -960 960 960"
    width={`${size}px`}
    fill={color}
  >
    <path d="m80-280 150-400h86l150 400h-82l-34-96H196l-32 96H80Zm140-164h104l-48-150h-6l-50 150Zm328 164v-76l202-252H556v-72h282v76L638-352h202v72H548ZM360-760l120-120 120 120H360ZM480-80 360-200h240L480-80Z" />
  </svg>
);

type ListToolbarProps = {
  onSearchClick: () => void;
  onFilterToggle?: () => void;
  onSortToggle?: () => void;
  onAddClick?: () => void;
  isSearchActive?: boolean;
  onSearchChange?: (value: string) => void;
  searchValue?: string;
  onSearchClose?: () => void;
  showFilter?: boolean;
  showAdd?: boolean;
};

const ListToolbar: React.FC<ListToolbarProps> = ({
  onSearchClick,
  onFilterToggle,
  onSortToggle,
  onAddClick,
  isSearchActive = false,
  onSearchChange,
  searchValue = "",
  onSearchClose,
  showFilter = true,
  showAdd = true,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchActive]);

  const handleSearchClick = () => {
    onSearchClick();
  };

  const handleSearchClose = () => {
    onSearchClose?.();
  };

  // New function to handle clearing search while maintaining focus
  const handleClearSearch = () => {
    onSearchChange?.("");
    // Ensure the input retains focus after clearing
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 0);
  };

  return (
    <Box sx={{ display: "flex", gap: { xs: 0.5, sm: 1 }, alignItems: "center" }}>
      {/* Search Bar - Only visible when active, with fade/slide transition */}
      <Fade in={isSearchActive} timeout={400}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            width: isSearchActive ? "auto" : 0,
            overflow: "hidden",
            transition: "all 0.3s cubic-bezier(.4,0,.2,1) 400ms",
            opacity: isSearchActive ? 1 : 0,
            transform: isSearchActive ? "translateX(0)" : "translateX(-20px)",
          }}
        >
          <TextField
            inputRef={searchInputRef}
            size="small"
            placeholder="Search"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            sx={{
              width: "150px",
              height: "22px",
              "& .MuiOutlinedInput-root": {
                height: "22px",
                padding: "2px 4px 2px 2px",
                fontSize: "12px",
                fontFamily: "'InterTight-Regular', 'Inter Tight', sans-serif",
                backgroundColor: "#ffffff",
                borderRadius: "4px",
                "& fieldset": {
                  border: "1px solid #e3f2fd",
                },
                "&.Mui-focused fieldset": {
                  border: "1px solid #2196f3",
                },
                "& input": {
                  padding: "0",
                  fontSize: "12px",
                  fontFamily: "'InterTight-Regular', 'Inter Tight', sans-serif",
                  color: "#666666",
                  "&::placeholder": {
                    color: "#999999",
                    opacity: 1,
                  },
                },
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} style={{ color: "#999999" }} />
                  </InputAdornment>
                ),
                endAdornment: searchValue && (
                  <InputAdornment position="end">
                    <CustomTooltip title="Clear" placement="bottom">
                      <IconButton
                        size="small"
                        onClick={handleClearSearch}
                        sx={{
                          padding: "2px",
                          width: "18px",
                          height: "18px",
                          "&:hover": {
                            backgroundColor: "rgba(242, 242, 240, 1)",
                            borderRadius: "4px",
                          },
                        }}
                      >
                        <Close size={12} style={{ color: "#5F6368" }} />
                      </IconButton>
                    </CustomTooltip>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Box
            sx={{
              width: "1px",
              height: "16px",
              backgroundColor: "rgba(242, 242, 240, 1)",
              margin: 0,
            }}
          />
        </Box>
      </Fade>

      {/* Search Icon - Always visible */}

      <CustomTooltip title="Search" placement="bottom">
        <span>
          <IconButton
            size="small"
            onClick={isSearchActive ? handleSearchClose : handleSearchClick}
            sx={{
              padding: "4px",
              width: "22px",
              height: "22px",
              borderRadius: 1,
              backgroundColor: isSearchActive
                ? "rgba(0, 111, 230, 1)"
                : "transparent",
              "&:hover": {
                backgroundColor: isSearchActive
                  ? "rgba(0, 111, 230, 1)"
                  : "rgba(242, 242, 240, 1)",
                width: "22px",
                height: "22px",
                borderRadius: 1,
              },
              "&:active": {
                backgroundColor: "rgba(0, 111, 230, 1)",
                borderRadius: 1,
              },
            }}
          >
            <Search size={16} color={isSearchActive ? "#D0F0FF" : undefined} />
          </IconButton>
        </span>
      </CustomTooltip>

      {/* Filter Icon - Only show if showFilter is true */}
      {showFilter && (
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
      )}
      {/* Sort Icon - Only show if onSortToggle is provided */}
      {onSortToggle && (

        <CustomTooltip title="Sort" placement="bottom">
          <span>
            <IconButton
              disabled
              size="small"
              onClick={onSortToggle}
              sx={{ padding: { xs: "4px", sm: "8px" } }}
            >
              <CustomSortIcon size={16} color="#bdbdbd" />
            </IconButton>
          </span>
        </CustomTooltip>

      )}
      {/* Add Button - Only show if showAdd is true */}
      {showAdd && (
        <Button
          variant="contained"
          onClick={onAddClick}
          sx={{
            width: "56px",
            height: "22px",
            background: "rgba(0, 111, 230, 1)",
            border: "none",
            borderRadius: "4px",
            fontFamily:
              'Inter Tight, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontWeight: 500,
            fontStyle: "normal",
            fontSize: "12px",
            color: "#D0F0FF",
            textAlign: "center",
            lineHeight: "20px",
            textTransform: "none",
            minWidth: "56px",
          }}
        >
          <AddIcon style={{ fontSize: "16px", marginLeft: "-6px" }} />
          Add
        </Button>
      )}
    </Box>
  );
};

export default ListToolbar;
