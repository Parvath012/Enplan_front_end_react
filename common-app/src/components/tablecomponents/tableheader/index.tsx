import React, { useState } from "react";
import "./styles.scss";
import FilterAndLock from "./components/FilterAndLock";
import FontSelector from "./components/FontSelector";
import AlignmentSelector from "./components/AlignmentSelector";
import ColorSelector from "./components/ColorSelector";
import ImportExportSelector from "./components/ImportExportSelector";
import NumberFormatSelector from "./components/NumberFormatSelector";
import ScaleSelector from "./components/ScaleSelector";
import FreezeSelector from "./components/FreezeSelector";
import FormatMenu from "./components/FormatMenu";
import TransposeSelector from "./components/TransposeSelector";
import SortSelector from "./components/SortSelector";
import PivotMenu from "./components/PivotMenu";
import { handleCellFormattingAction } from "../../../utils/cellFormattingHandlers";
import { useSelector, useDispatch } from "react-redux";
import DateFormatSelector from "./components/DateFormatSelector";
import CurrencyFormatSelector from "./components/CurrencyFormatSelector";
import BulkEditButton from '../tablegrid/components/BulkEditButton';

type ExpandedSection =
  | "font"
  | "alignment"
  | "color"
  | "numberformat"
  | "scale"
  | "sort"
  | "freeze"
  | "formatmenu"
  | "transpose"
  | "pivot"
  | "dateformat"
  | "currencyFormat"
  | null;

// Config for selectors in the header
const selectorConfig = [
  { key: "font", Component: FontSelector },
  { key: "alignment", Component: AlignmentSelector },
  { key: "color", Component: ColorSelector },
  { divider: true },
  { key: "numberformat", Component: NumberFormatSelector },
  { key: "scale", Component: ScaleSelector },
  { divider: true },
  { key: "freeze", Component: FreezeSelector },
  { key: "formatmenu", Component: FormatMenu },
  { key: "transpose", Component: TransposeSelector },
  { key: "sort", Component: SortSelector },
  { divider: true },
  { key: "pivot", Component: PivotMenu },
  { key: "dateformat", Component: DateFormatSelector },
  { key: "currencyFormat", Component: CurrencyFormatSelector },
];

interface TableHeaderComponentProps {
  selectedCells?: any[];
  sortModel: any;
  setSortModel: (model: any) => void;
}

const TableHeaderComponent: React.FC<TableHeaderComponentProps> = ({
  selectedCells,
  sortModel,
  setSortModel,
}) => {
  // Track which selector (if any) is currently expanded
  const [expanded, setExpanded] = useState<ExpandedSection>(null);
  const formattingConfig = useSelector(
    (state: any) => state.dataStore.formattingConfig
  );
  const tableConfiguration = useSelector(
    (state: any) => state.dataStore.tableConfiguration
  );
  const dispatch = useDispatch();
  const safeSelectedCells = selectedCells || [];

  // Helper to add extra props for selectors that need them (DRY, no duplication)
  const addSelectorProps = (item: any, commonProps: any) => {
    if (["numberformat", "dateformat", "currencyFormat"].includes(item.key)) {
      commonProps.selectedCells = safeSelectedCells;
      commonProps.onFormat = (
        action: string,
        _payload: any,
        cells: any[],
        dispatch: any
      ) =>
        handleCellFormattingAction(action, cells, dispatch, formattingConfig);
      if (["dateformat", "currencyFormat"].includes(item.key)) {
        commonProps.dispatch = dispatch;
      }
    }
    if (item.key === "color") {
      commonProps.selectedCells = safeSelectedCells;
      commonProps.onFormat = (
        key: string,
        payload: any,
        cells: any[],
        dispatch: any,
        formattingConfig: any
      ) => {
        return require("../../../utils/cellFormattingHandlers").handleColorFormattingAction(
          key,
          payload,
          cells,
          dispatch,
          { ...formattingConfig, tableConfiguration }
        );
      };
    }
  };

  // Map expanded section to its expanded component instance
  const expandedMap: Record<string, React.ReactNode> = {};
  selectorConfig.forEach((item) => {
    if (item.key && item.Component) {
      const commonProps: any = {
        expanded: true,
        onExpand: () => setExpanded(null),
        onRequestExpand: () => setExpanded(item.key as ExpandedSection),
      };
      addSelectorProps(item, commonProps);
      // Pass sortModel and setSortModel to SortSelector
      if (item.key === "sort") {
        commonProps.sortModel = sortModel;
        commonProps.setSortModel = setSortModel;
      }
      expandedMap[item.key] = React.createElement(item.Component, commonProps);
    }
  });

  let dividerCount = 0;
  let lastKey = "";
  // Render either the expanded component or the collapsed row of selectors
  const leftmost =
    expanded && expandedMap[expanded] ? (
      expandedMap[expanded]
    ) : (
      <>
        {selectorConfig.map((item) => {
          let element: React.ReactNode = null;
          if (item.divider) {
            element = (
              <div
                className="table-header-divider"
                key={`divider-${lastKey}-${dividerCount++}`}
              />
            );
          } else if (item.Component && item.key) {
            // Generalize: always pass expanded, onExpand, onRequestExpand
            const commonProps: any = {
              key: item.key,
              expanded: item.key === expanded,
              onExpand: () => setExpanded(null),
              onRequestExpand: () => setExpanded(item.key as ExpandedSection),
            };
            // Add extra props for selectors that need them (DRY, no duplication)
            addSelectorProps(item, commonProps);
            // Pass sortModel and setSortModel to SortSelector
            if (item.key === "sort") {
              commonProps.sortModel = sortModel;
              commonProps.setSortModel = setSortModel;
            }
            element = <item.Component {...commonProps} />;
            lastKey = item.key;
          }
          return element;
        })}
      </>
    );

  return (
    <header className="table-header">
      <div
        className="header-section left"
        style={{ display: "flex", alignItems: "center", gap: 5 }}
      >
        {/* Filter and lock controls (always visible at the left) */}
        <FilterAndLock />
        {/* Divider between filter/lock and selectors */}
        <div className="table-header-divider" />
        {/* Selector buttons and dividers (collapsed or expanded) */}
        {leftmost}
      </div>
      <div className="header-section right">
        {/* BulkEditButton */}
        <BulkEditButton />
        {/* Import/export/search controls (right side of header) */}
        <ImportExportSelector />
      </div>
    </header>
  );
};

export default TableHeaderComponent;
