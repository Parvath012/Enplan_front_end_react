declare module "commonApp/*" {
    const Component: React.ComponentType<any>;
    export default Component;
    // Named exports for utilities
    export function makeDataApiCall<T>(payload: any, apiUrl?: string): Promise<T[]>;
    export function parseCsvToDtos<T>(csvData: string[], headerMapping: Record<string, string>, dtoFactory: (rowData: Record<string, any>) => T): T[];
    export function createSqlQueryConfig(name: string, tableName: string, columns: any[], searchFilter?: any, orderBy?: any[], page?: number, pageSize?: number): any;
    export function createApiPayload(queries: any[]): any;
    export function createHighlightedCellRenderer(searchValue: string, maxChars: number): (params: any) => React.ReactElement;
    export const ConditionalTooltipText: React.FC<{ text: string; maxChars: number; searchTerm?: string }>;
}

declare module "commonApp" {
    export * from "commonApp/*";
}
