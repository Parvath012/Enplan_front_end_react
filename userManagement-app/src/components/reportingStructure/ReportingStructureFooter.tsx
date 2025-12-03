import React, { useState, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { ViewByType, DEFAULT_EDGE_COLOR, DOTTED_LINE_EDGE_COLOR } from '../../constants/reportingStructureConstants';
import { Node } from 'reactflow';
import DepartmentLegendDropdown from './DepartmentLegendDropdown';

interface ReportingStructureFooterProps {
  viewType?: ViewByType;
  nodes?: Node[];
}

const ReportingStructureFooter: React.FC<ReportingStructureFooterProps> = ({ 
  viewType = 'organizational',
  nodes = []
}) => {
  const [departmentAnchorEl, setDepartmentAnchorEl] = useState<HTMLElement | null>(null);
  const departmentButtonRef = useRef<HTMLDivElement>(null);

  const handleDepartmentClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (departmentButtonRef.current) {
      setDepartmentAnchorEl(departmentButtonRef.current);
    } else {
      setDepartmentAnchorEl(event.currentTarget);
    }
  };

  const handleDepartmentClose = () => {
    setDepartmentAnchorEl(null);
  };

  const showDepartmentLegend = viewType === 'departmental'; // Only show for departmental view, not dotted-line
  const showDottedLineLegend = viewType === 'dotted-line'; // Show legend for dotted-line view

  return (
    <>
      <Box
        sx={{
          position: 'relative',
          height: '46px',
          background: 'inherit',
          backgroundColor: 'rgba(247, 247, 246, 1)',
          boxSizing: 'border-box',
          borderWidth: '1px 0 0 0',
          borderStyle: 'solid',
          borderColor: 'rgba(240, 239, 239, 1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: showDottedLineLegend ? 'space-between' : 'flex-end',
          px: 2,
          fontFamily: "'Inter Tight', -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif",
          fontWeight: 400,
          fontSize: '12px',
          color: '#5B6061',
          flexShrink: 0,
        }}
      >
        {/* Dotted-line Reporting Legend */}
        {showDottedLineLegend && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                sx={{
                  fontFamily: "'Inter Tight', -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif",
                  fontWeight: 400,
                  fontSize: '12px',
                  color: '#5B6061',
                  textAlign: 'left',
                }}
              >
                Direct Reporting:
              </Typography>
              <Box
                sx={{
                  width: '40px',
                  height: '1px',
                  backgroundColor: DEFAULT_EDGE_COLOR,
                  border: 'none',
                  marginTop: '4.75px',
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                sx={{
                  fontFamily: "'Inter Tight', -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif",
                  fontWeight: 400,
                  fontSize: '12px',
                  color: '#5B6061',
                  textAlign: 'left',
                }}
              >
                Dotted-line Reporting:
              </Typography>
              <Box
                sx={{
                  width: '40px',
                  height: '0px',
                  borderTop: `1px dashed ${DOTTED_LINE_EDGE_COLOR}`,
                  marginTop: '4.75px',
                }}
              />
            </Box>
          </Box>
        )}
        {showDepartmentLegend && (
          <Box
          ref={departmentButtonRef}
          onClick={handleDepartmentClick}
          sx={{
            padding: '4px 12px',
            borderRadius: '4px',
            border: departmentAnchorEl ? '1px solid #e0e0e0' : '1px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.2s ease',
            position: 'relative',
            zIndex: 1000,
            marginRight: 15, // Move button slightly left from the right edge
            '&:hover': {
              border: '1px solid #e0e0e0',
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
            },
          }}
          >
            <Typography
              sx={{
                fontFamily: "'Inter Tight', -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif",
                fontSize: '12px',
                fontWeight: 400,
                color: '#5F6368',
              }}
            >
              Department
            </Typography>
          </Box>
        )}
      </Box>
      {showDepartmentLegend && (
        <DepartmentLegendDropdown
          anchorEl={departmentAnchorEl}
          open={Boolean(departmentAnchorEl)}
          onClose={handleDepartmentClose}
          nodes={nodes}
        />
      )}
    </>
  );
};

export default ReportingStructureFooter;

