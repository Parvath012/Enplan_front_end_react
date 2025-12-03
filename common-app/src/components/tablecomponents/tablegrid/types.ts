import { GridRenderCellParams } from '@mui/x-data-grid';

export interface ColumnSchema {
  columnName: string;
  aliasName: string;
  dataType?: string;
}

export interface ColumnConfiguration {
  type: string;
  isEditable: boolean | undefined;
  columnName: string;
  aliasName: string;
}

// Represents the type of sorting that can be applied to a column
export type SortType = 'alphanumeric' | 'numeric' | 'date' | 'fillColor' | 'fontColor';

// Represents the sorting direction for a column
export interface SortModel {
  field: string;
  type: SortType;
  sort: 'asc' | 'desc';
  priority: number;
}

export interface ExcelGridProps {
  rows: any[];
  schema: ColumnSchema[];
  tableConfiguration?: ColumnConfiguration[];
  enableCheckboxSelection?: boolean;
  showToolbar?: boolean;
  onCellEditStop?: (params: any) => void;
  processRowUpdate?: (updatedRow: any) => any;
  rowStyleResolver?: (params: GridRenderCellParams) => React.CSSProperties;
  enableActionsColumn?: boolean;
  onActionClick?: (actionType: string, rowData: any) => void;
  actionMenuItems?: Array<{
    label: string;
    action: string;
    icon?: React.ReactNode;
  }>;
  actionsColumnWidth?: number;
  zoom?: number;
  setRows?: React.Dispatch<React.SetStateAction<any[]>>;
  sortModel?: SortModel[];
  setSortModel?: (model: SortModel[]) => void;
}