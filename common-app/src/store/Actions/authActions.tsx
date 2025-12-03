import { authenticate, getData } from "../../api/auth/authService";
import authStore from "../configureStore";

export const SET_TOKEN = "SET_TOKEN";
export const GET_TOKEN = "GET_TOKEN";

export const setToken = (token: any) => ({
  type: SET_TOKEN,
  payload: token,
});

export const getToken = () => ({
  type: GET_TOKEN,
});

// Helper to reduce duplication in column definitions
const baseColumn = {
  aggregateFunction: "",
  sortType: "",
  groupBy: false,
  index: 0,
  isEditable: false,
};

export const buildColumn = (
  dboName: string,
  columnName: string,
  aliasName: string,
  dataType: string = "string",
  output: boolean = true
) => ({
  ...baseColumn,
  dboName,
  columnName,
  aliasName,
  dataType,
  output,
});

export const getAuthenticate = () => {
  return authenticate();
}

export const getTableData = () => {
  const columns = [
    buildColumn("Date_Mapping20", "_id", "Select"),
    buildColumn("Date_Mapping20", "BillDate", "Bill Date", "Date"),
    buildColumn("Date_Mapping20", "MappedDate", "Mapped Date", "Date"),
    buildColumn("Date_Mapping20", "Comments", "Comments"),
    buildColumn("Date_Mapping20", "Fiscal", "Fiscal", "string", false),
    buildColumn("Date_Mapping20", "Season_Name", "Season_Name", "string", false),
    buildColumn("Date_Mapping20", "Season_Type3", "Season_Type3", "string", false),
  ];

  const requestPayload = {
    executeInParallel: true,
    sqlQueries: [
      {
        name: "first",
        query: {
          databaseId: "09d8e037-0005-4887-abde-112a529de2b8",
          options: {
            isDistinct: true,
            top: {
              value: 0,
              isPercent: true,
            },
          },
          columns: columns,
          caseStatements: [],
          tables: ["Date_Mapping20"],
          searchFilter: {
            conditionOperator: 0,
            filters: [
              {
                propertyName: "Fiscal",
                operator: 0,
                value: "FY20",
                dataType: 1,
                caseSensitive: true,
              },
            ],
          },
          joins: [],
          orderBy: [
            {
              columnName: "string",
              sortType: 0,
            },
          ],
          page: 0,
          pageSize: 0,
        },
        includeRecordsCount: true,
      },
    ],
  };

  return getData(requestPayload, authStore.getState().authStore.token);
};
