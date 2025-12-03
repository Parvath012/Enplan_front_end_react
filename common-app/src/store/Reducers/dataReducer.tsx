import { ColumnConfiguration } from "../../components/tablecomponents/tablegrid/types";
import { SET_TABLEDATA } from "../Actions/dataActions";
import { UPDATE_CELL_FORMATTING, SET_COLUMNS } from "../Actions/gridActions";

export interface TableValue {
  tableSchema: {
    columnName: string;
    aliasName: string;
    dataType: string;
    isPrimaryKey: boolean;
    isNullable: boolean;
    isSequenceColumn: boolean;
  }[];
  csvData: string[];
  hasHeaders: boolean;
  recordsCount: number;
}

export interface DataState {
  tableData: any;
  tableConfiguration: any[];
  columns: any[]; 
}

export interface IData {
  tableData: TableValue | null;
  tableConfiguration: ColumnConfiguration[];
  columns: any[];
  formattingConfig?: Record<
    string,
    { decimalPlaces: number; rawValue: number }
  >; // key: rowId:field
}

const initialState: IData = {
  // to-do: tempararely having sample data this is data we should get from the .net the api has already declared please use that
  tableData: {
    // Reduce duplication in tableSchema
    tableSchema: [
      { columnName: "_id", aliasName: "Id", dataType: "Int32" },
      { columnName: "BillDate", aliasName: "Bill Date", dataType: "DateTime" },
      { columnName: "MappedDate", aliasName: "Mapped Date", dataType: "DateTime" },
      { columnName: "Comments", aliasName: "Comments", dataType: "String" },
      { columnName: "Status", aliasName: "Status", dataType: "String" },
    ].map(col => ({
      ...col,
      isPrimaryKey: false,
      isNullable: true,
      isSequenceColumn: false,
    })),
    csvData: [
      "Id|Bill Date|Mapped Date|Comments|Status",
      "2348|10/11/2019 12:00:00 AM|10/26/2018 12:00:00 AM|'99'|'coment'",
      "1005|10/11/2019 12:00:00 AM|5/12/2018 12:00:00 AM|'87'",
      "1692|7/31/2019 12:00:00 AM|8/1/2018 12:00:00 AM|'123'",
      "2346|10/1/2019 12:00:00 AM|10/16/2018 12:00:00 AM|'2323'",
      "2345|9/30/2019 12:00:00 AM|10/15/2018 12:00:00 AM|'23'",
      "712|10/28/2019 12:00:00 AM|9/3/2018 12:00:00 AM|'23'",
      "2365|2/10/2020 12:00:00 AM|2/11/2019 12:00:00 AM|'23'",
      "2036|10/26/2019 12:00:00 AM|11/10/2018 12:00:00 AM|'23'",
      "719|1/4/2020 12:00:00 AM|1/5/2019 12:00:00 AM|'23'",
      "719|10/22/2019 12:00:00 AM|11/6/2018 12:00:00 AM|'23'",
      "60|6/5/2019 12:00:00 AM|6/6/2018 12:00:00 AM|'875'",
      "82|12/12/2019 12:00:00 AM|12/13/2018 12:00:00 AM|'909'",
      "2011|12/12/2019 12:00:00 AM|4/5/2018 12:00:00 AM|'2023'",
      "2340|8/12/2019 12:00:00 AM|8/13/2018 12:00:00 AM|'64'",
      "420|3/7/2020 12:00:00 AM|3/9/2019 12:00:00 AM|'87'",
      "1701|10/3/2019 12:00:00 AM|10/18/2018 12:00:00 AM|''",
      "700|5/30/2019 12:00:00 AM|5/31/2018 12:00:00 AM|''",
      "726|2/21/2020 12:00:00 AM|2/22/2019 12:00:00 AM|''",
      "67|8/18/2019 12:00:00 AM|8/19/2018 12:00:00 AM|''",
      "1032|10/15/2019 12:00:00 AM|10/30/2018 12:00:00 AM|''",
      "1007|5/19/2019 12:00:00 AM|5/20/2018 12:00:00 AM|''",
      "2359|12/25/2019 12:00:00 AM|12/26/2018 12:00:00 AM|''",
      "2040|12/11/2019 12:00:00 AM|12/12/2018 12:00:00 AM|''",
      "388|6/9/2019 12:00:00 AM|6/10/2018 12:00:00 AM|''",
      "2361|1/20/2020 12:00:00 AM|1/21/2019 12:00:00 AM|''",
      "2012|4/24/2019 12:00:00 AM|4/25/2018 12:00:00 AM|''",
      "1676|4/4/2019 12:00:00 AM|4/5/2018 12:00:00 AM|'test'",
      "79|6/25/2019 12:00:00 AM|6/26/2018 12:00:00 AM|''",
      "79|11/7/2019 12:00:00 AM|9/13/2018 12:00:00 AM|''",
      "1012|6/20/2019 12:00:00 AM|6/21/2018 12:00:00 AM|''",
      "1366|12/8/2019 12:00:00 AM|12/9/2018 12:00:00 AM|''",
      "76|10/12/2019 12:00:00 AM|10/27/2018 12:00:00 AM|''",
      "2351|11/6/2019 12:00:00 AM|9/12/2018 12:00:00 AM|''",
      "2028|8/21/2019 12:00:00 AM|8/22/2018 12:00:00 AM|''",
      "1379|2/22/2020 12:00:00 AM|2/23/2019 12:00:00 AM|''",
      "1694|8/9/2019 12:00:00 AM|8/10/2018 12:00:00 AM|''",
      "727|2/25/2020 12:00:00 AM|2/26/2019 12:00:00 AM|''",
      "1040|11/30/2019 12:00:00 AM|12/1/2018 12:00:00 AM|''",
      "1330|4/11/2019 12:00:00 AM|4/12/2018 12:00:00 AM|''",
      "1034|11/15/2019 12:00:00 AM|11/16/2018 12:00:00 AM|''",
      "2015|5/17/2019 12:00:00 AM|5/18/2018 12:00:00 AM|''",
      "2339|8/4/2019 12:00:00 AM|8/5/2018 12:00:00 AM|''",
      "421|3/15/2020 12:00:00 AM|3/17/2019 12:00:00 AM|''",
      "1051|2/28/2020 12:00:00 AM|3/1/2019 12:00:00 AM|''",
      "1370|1/3/2020 12:00:00 AM|1/4/2019 12:00:00 AM|''",
      "1697|8/24/2019 12:00:00 AM|8/25/2018 12:00:00 AM|''",
      "707|9/6/2019 12:00:00 AM|9/21/2018 12:00:00 AM|''",
      "2023|7/3/2019 12:00:00 AM|7/4/2018 12:00:00 AM|''",
      "2032|9/29/2019 12:00:00 AM|10/14/2018 12:00:00 AM|''",
      "1689|7/7/2019 12:00:00 AM|7/8/2018 12:00:00 AM|''",
      "2014|5/1/2019 12:00:00 AM|5/2/2018 12:00:00 AM|''",
    ],
    hasHeaders: true,
    recordsCount: 366,
  },
  tableConfiguration: [
    {
    aliasName: 'Bill Date', 
    columnName: 'BillDate',
    isEditable: true,
    type: 'date',
    },
    {
      columnName: "Comments",
      aliasName: "Comments",
      isEditable: true,
      type: "",
    },
    {
      columnName: "Status",
      aliasName: "Status",
      isEditable: true,
      type: "select",
    },
  ],
  columns: [], // New property to store generated columns
  formattingConfig: {},
};

const dataReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case SET_TABLEDATA:
      return { ...state, tableData: action.payload };
    
    // Handle cell formatting update
    case UPDATE_CELL_FORMATTING: {
      // action.payload: { key: string, formatting: Record<string, any> }
      const newFormattingConfig = {
        ...state.formattingConfig,
        [action.payload.key]: {
          ...state.formattingConfig?.[action.payload.key],
          ...action.payload.formatting,
        },
      };
      return {
        ...state,
        formattingConfig: newFormattingConfig,
      };
    }
    
    // New action to store columns for BulkEditButton component
    case SET_COLUMNS:
      return {
        ...state,
        columns: action.payload
      };
      
    default:
      return state;
  }
};

export default dataReducer;