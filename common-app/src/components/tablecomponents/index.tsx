import React, { useMemo, useState, useEffect } from "react";
import { Edit, TrashCan, View } from "@carbon/icons-react";
import { parseCSVToRows } from "../../utils/gridParser";
import ReusableExcelGrid from "./tablegrid";
import TableFooter from "./tablefooter";
import { useDispatch, useSelector } from "react-redux";
import {
  getAuthenticate,
  getTableData,
  setToken,
} from "../../store/Actions/authActions";
import { setTableData } from "../../store/Actions/dataActions";
import TableHeaderComponent from "./tableheader";
import { resetFooterValues } from "../../store/Actions/gridActions";
import AgGrid from "../../ag grid/AgGrid";

const Table = () => {
  // Select table data and configuration from Redux store
  const tableData = useSelector((state: any) => state.dataStore.tableData);

  const gridMode = useSelector((state: any) => state.gridModeStore);
  console.log('gridata', gridMode)
  const tableConfiguration = useSelector(
    (state: any) => state.dataStore.tableConfiguration
  );

  // Destructure CSV data and table schema
  const { csvData = [], tableSchema = [] } = tableData ?? {};

  // Memoized rows parsing to optimize performance
  const rows = useMemo(() => parseCSVToRows(csvData), [csvData]);

  // Select various grid-related states from Redux store
  const selectedNumCellValues = useSelector(
    (state: any) => state.gridStore.numericCellValues
  );
  const selectedCells = useSelector(
    (state: any) => state.gridStore.selectedCells
  );
  const totalSelectedRows = useSelector(
    (state: any) => state.gridStore.selectedRows
  );
  const token = useSelector((state: any) => state.authStore.token);

  // State for managing grid zoom level
  const [zoom, setZoom] = useState(100);

  const [internalRows, setInternalRows] = useState(rows);
  // State for managing sort model
  const [sortModel, setSortModel] = useState<
    Array<{ field: string; sort: "asc" | "desc"; type: import("./tablegrid/types").SortType; priority: number }>
  >([]);

  useEffect(() => {
    setInternalRows(rows);
  }, [rows]);

  // Redux dispatch hook
  const dispatch = useDispatch();

  // Handle data refresh and authentication
  const handleRefresh = async () => {
    // Check and obtain authentication token if not present
    if (!token) {
      const token = await getAuthenticate();
      dispatch(setToken(token));
    }

    // Fetch and update table data
    const res = await getTableData();
    dispatch(setTableData(res?.data?.[0]?.value));
    dispatch(resetFooterValues()); // Reset footer values on refresh
  };

  const handleProcessRowUpdate = (updatedData: any) => {
    if (!updatedData) {
      // Handle null or undefined data
      return updatedData;
    }

    if (Array.isArray(updatedData)) {
      // Handle bulk updates ( array of rows)
      setInternalRows(updatedData);
      return updatedData;
    } else {
      // Handle single cell update (single row object)
      const newRows = internalRows.map(row =>
        row.id === updatedData.id ? updatedData : row
      );
      setInternalRows(newRows);
      return updatedData;
    }
  };

  // Define action menu items with icons and labels
  const actionItems = [
    {
      label: "Edit",
      action: "edit",
      icon: <Edit fontSize="small" />,
    },
    {
      label: "Delete",
      action: "delete",
      icon: <TrashCan fontSize="small" />,
    },
    {
      label: "View Details",
      action: "view",
      icon: <View fontSize="small" />,
    },
  ];

  // Handle different action types for grid rows
  const handleActionClick = (actionType: string, rowData: any) => {
    // Implement different actions based on the clicked menu item
    switch (actionType) {
      case "edit":
        console.log("Editing row:", rowData);
        // Implement edit logic
        break;
      case "delete":
        console.log("Deleting row:", rowData);
        // Implement delete logic
        break;
      case "view":
        console.log("Viewing row details:", rowData);
        // Implement view details logic
        break;
      default:
        console.log(`Action "${actionType}" clicked for:`, rowData);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Table header with selectors and controls */}
      <TableHeaderComponent
        selectedCells={selectedCells}
        sortModel={sortModel}
        setSortModel={setSortModel}
      />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          overflow: "auto",
          height: "calc(100vh - 48px - 32px)", // header: 48px, footer: 32px
        }}
      >
        {/* Reusable Excel-like grid component */}

        {gridMode === 'muiDataGrid' ? (
          <ReusableExcelGrid rows={internalRows}
            schema={tableSchema}
            tableConfiguration={tableConfiguration}
            processRowUpdate={handleProcessRowUpdate}
            enableActionsColumn={true}
            onActionClick={handleActionClick}
            actionMenuItems={actionItems}
            actionsColumnWidth={60}
            zoom={zoom}
            setRows={setInternalRows}
            sortModel={sortModel}
            setSortModel={setSortModel}
          />
        ) : (
          <AgGrid />
        )}
      </div>
      {/* Table footer with statistical information and controls */}
      <TableFooter
        data={selectedNumCellValues}
        numOfSelectedRows={totalSelectedRows.length}
        selectedCells={selectedCells}
        zoom={zoom}
        onRefresh={handleRefresh}
        onZoomChange={setZoom}
      />
    </div>
  );
};

export default Table;
