import React from 'react';
import { Box, Typography } from '@mui/material';

interface ListHeaderProps {
  title: string;
  count: number;
  total: number;
}

const ListHeader: React.FC<ListHeaderProps> = ({ title, count, total }) => (
  <Box sx={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    mb: 2,
    pb: 1,
    borderBottom: "1px solid #e0e0e0"
  }}>
    <Typography variant="h6" sx={{
      fontWeight: 500,
      color: "#4A4E52",
      fontSize: "12px",
      paddingLeft: "10px"
    }}>
      {title}
    </Typography>
    <Typography sx={{
      color: "#666",
      fontSize: "14px",
      fontWeight: 500,
      paddingRight: "10px"
    }}>
      {count}/{total}
    </Typography>
  </Box>
);

export default ListHeader;
