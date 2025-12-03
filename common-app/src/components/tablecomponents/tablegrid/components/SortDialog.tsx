import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton,
  Typography,
  Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SettingsIcon from "@mui/icons-material/Settings";
import CloseIcon from "@mui/icons-material/Close";
import { useSelector } from "react-redux";

// Use sort type values that match the grid's logic
const sortOnOptions = [
  { value: "alphanumeric", label: "Alphanumeric" },
  { value: "numeric", label: "Numeric" },
  { value: "date", label: "Date" },
  { value: "fontColor", label: "Font Color" },
  { value: "fillColor", label: "Fill Color" },
];

// Function to get order options based on sort type
// This function returns the correct order options based on the sort type
const getOrderOptions = (sortOn: string) => {
  switch (sortOn) {
    case "alphanumeric":
      return [
        { value: "asc", label: "A to Z, 1 to 9" },
        { value: "desc", label: "Z to A, 9 to 1" },
      ];
    case "numeric":
      return [
        { value: "asc", label: "Smallest to Largest" },
        { value: "desc", label: "Largest to Smallest" },
      ];
    case "date":
      return [
        { value: "asc", label: "Earliest to Latest" },
        { value: "desc", label: "Latest to Earliest" },
      ];
    case "fontColor":
    case "fillColor":
    default:
      return [
        { value: "asc", label: "Ascending" },
        { value: "desc", label: "Descending" },
      ];
  }
};

// SortDialog component
// This component allows users to configure multi-level sorting for the grid
const SortDialog = ({
  open,
  onClose,
  sortLevels,
  onApplySort,
  columns: propColumns,
}: {
  open: boolean;
  onClose: () => void;
  sortLevels?: Array<{ sortBy: string; sortOn: string; order: "asc" | "desc" }>;
  onApplySort: (
    levels: Array<{ sortBy: string; sortOn: string; order: "asc" | "desc" }>
  ) => void;
  columns?: Array<{ field: string; headerName: string; hide?: boolean }>;
}) => {
  // Always call hooks unconditionally
  const reduxColumns = useSelector((state: any) => state.dataStore?.columns ?? []);
  const columns = propColumns ?? reduxColumns;
  const columnOptions = columns
    .filter((col: any) => col.field !== "__action__" && !col.hide)
    .map((col: any) => ({
      value: col.field,
      label: col.headerName ?? col.field,
    }));

  // Extract nested ternary for levels initialization
  let initialLevels: Array<{ sortBy: string; sortOn: string; order: "asc" | "desc" }> = [];
  if (sortLevels?.length) {
    initialLevels = sortLevels;
  } else if (columns.length > 0) {
    initialLevels = [
      {
        sortBy: columns[0]?.field ?? "",
        sortOn: "alphanumeric",
        order: "asc",
      },
    ];
  }
  const [levels, setLevels] = useState(initialLevels);

  React.useEffect(() => {
    if (
      columns.length > 0 &&
      (levels.length === 0 ||
        !columns.some((col: { field: string; headerName: string; hide?: boolean }) => col.field === levels[0]?.sortBy))
    ) {
      setLevels([
        {
          sortBy: columns[0]?.field ?? "",
          sortOn: "alphanumeric",
          order: "asc",
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns]);

  // Handle changes to sort levels
  // This function updates the sort levels based on user input
  const handleChange = (idx: number, field: string, value: string) => {
    setLevels((prev) => {
      const updated = [...prev];
      if (field === "sortBy" && typeof value === "string") {
        updated[idx].sortBy = value;
      } else if (field === "sortOn" && typeof value === "string") {
        updated[idx].sortOn = value;
      } else if (field === "order" && (value === "asc" || value === "desc")) {
        updated[idx].order = value;
      }
      return updated;
    });
  };

  // Handlers for adding, deleting, and copying sort levels
  // These functions manage the sort levels in the dialog
  const handleAddLevel = () => {
    setLevels((prev) => [
      ...prev,
      { sortBy: columns[0]?.field || "", sortOn: "alphanumeric", order: "asc" },
    ]);
  };

  // Delete the last sort level if there are multiple levels
  // This prevents the dialog from having no levels
  const handleDeleteLevel = () => {
    if (levels.length > 1) {
      setLevels((prev) => prev.slice(0, -1));
    }
  };

  // Copy the last sort level and add it as a new level
  // This allows users to quickly duplicate sort configurations
  const handleCopyLevel = () => {
    setLevels((prev) => [...prev, { ...prev[prev.length - 1] }]);
  };

  // Handle the sort action
  // This function applies the sorting levels and closes the dialog
  const handleSort = () => {
    onApplySort(levels);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        Sort
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddLevel}
            variant="outlined"
          >
            Add Level
          </Button>
          <Button
            startIcon={<DeleteIcon />}
            onClick={handleDeleteLevel}
            variant="outlined"
          >
            Delete Level
          </Button>
          <Button
            startIcon={<ContentCopyIcon />}
            onClick={handleCopyLevel}
            variant="outlined"
          >
            Copy Level
          </Button>
          <Button startIcon={<SettingsIcon />} variant="outlined">
            Options...
          </Button>
        </Box>
        <Grid container spacing={2} alignItems="center">
          <Grid sx={{ flex: 1 }}>
            <Typography fontWeight={500}>Sort by</Typography>
          </Grid>
          <Grid sx={{ flex: 1 }}>
            <Typography fontWeight={500}>Sort On</Typography>
          </Grid>
          <Grid sx={{ flex: 1 }}>
            <Typography fontWeight={500}>Order</Typography>
          </Grid>
        </Grid>
        {levels.map((level, idx) => {
          // Use a more stable key if possible
          const key = `${level.sortBy}-${level.sortOn}-${level.order}-${idx}`;
          return (
            <Grid
              container
              spacing={2}
              alignItems="center"
              key={key}
              sx={{ mt: 1 }}
            >
              <Grid sx={{ flex: 1 }}>
                <FormControl fullWidth>
                  <InputLabel>Sort by</InputLabel>
                  <Select
                    value={level.sortBy}
                    label="Sort by"
                    onChange={(e) => handleChange(idx, "sortBy", e.target.value)}
                  >
                    {columnOptions.map((col: { value: string; label: string }) => (
                      <MenuItem key={col.value} value={col.value}>
                        {col.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid sx={{ flex: 1 }}>
                <FormControl fullWidth>
                  <InputLabel>Sort On</InputLabel>
                  <Select
                    value={level.sortOn}
                    label="Sort On"
                    onChange={(e) => handleChange(idx, "sortOn", e.target.value)}
                  >
                    {sortOnOptions.map((opt: { value: string; label: string }) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid sx={{ flex: 1 }}>
                <FormControl fullWidth>
                  <InputLabel>Order</InputLabel>
                  <Select
                    value={level.order}
                    label="Order"
                    onChange={(e) => handleChange(idx, "order", e.target.value)}
                  >
                    {getOrderOptions(level.sortOn).map((opt: { value: string; label: string }) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          );
        })}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSort}>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SortDialog;
