import React, { useMemo } from 'react';
import { Menu, Box, Typography } from '@mui/material';
import { Node } from 'reactflow';
import { getDepartmentColorPair } from '../../constants/reportingStructureConstants';

interface DepartmentLegendDropdownProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  nodes?: Node[];
}

const DepartmentLegendDropdown: React.FC<DepartmentLegendDropdownProps> = ({
  anchorEl,
  open,
  onClose,
  nodes = [],
}) => {
  // Get unique departments that are actually used in the layout
  const departmentsInLayout = useMemo(() => {
    const departmentSet = new Set<string>();
    nodes.forEach((node) => {
      const nodeData = node.data as { department?: string };
      const department = nodeData?.department;
      if (department && department !== 'N/A') {
        departmentSet.add(department);
      }
    });
    return Array.from(departmentSet);
  }, [nodes]);

  // Get departments with their border colors (for legend indicator)
  const departments = useMemo(() => {
    return departmentsInLayout
      .map((deptName) => {
        const colorPair = getDepartmentColorPair(deptName);
        return {
          name: deptName,
          borderColor: colorPair.border, // Use border color for legend indicator
        };
      })
      .filter((dept) => dept.name !== 'Default' && dept.name !== 'N/A')
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [departmentsInLayout]);

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      slotProps={{
        paper: {
          sx: {
            minWidth: 220,
            borderRadius: '8px',
            boxShadow: '0px 2px 6px rgba(17, 17, 17, 0.15)',
            marginTop: '-20px', // Move dropdown higher above the button
            zIndex: 1500, // Higher than footer to appear above it
          },
        },
      }}
      MenuListProps={{
        sx: {
          padding: 0,
        },
      }}
      disableAutoFocusItem
    >
      <Box
        sx={{
          px: 2,
          py: 0.75,
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Typography
          sx={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#1f1f1f',
            fontFamily: "'Inter Tight', -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif",
          }}
        >
          Department
        </Typography>
      </Box>
      {departments.map((dept) => (
        <Box
          key={dept.name}
          sx={{
            minHeight: '24px',
            px: 2,
            py: 0.5,
            fontFamily: "'Inter Tight', -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif",
            fontSize: '12px',
            color: '#5F6368',
            fontWeight: 400,
            backgroundColor: 'transparent',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'default',
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Inter Tight', -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif",
              fontSize: '12px',
              color: '#5F6368',
              fontWeight: 400,
            }}
          >
            {dept.name}
          </Typography>
          <Box
            sx={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: dept.borderColor, // Use border color for the indicator
              border: '1px solid rgba(0, 0, 0, 0.1)',
              flexShrink: 0,
            }}
          />
        </Box>
      ))}
    </Menu>
  );
};

export default DepartmentLegendDropdown;

