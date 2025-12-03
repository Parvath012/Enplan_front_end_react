// Mock for commonApp/apiServiceUtils
// Simulate axios-like responses and CSV handling to satisfy tests
export const makeDataApiCall = jest.fn(async (_payload: any) => {
  // This mock will be intercepted at axios level in tests; here just return empty by default
  return [] as any;
});

export const parseCsvToDtos = jest.fn((csvData: any[], headerMapping: Record<string, string>, mapRow: (row: any) => any) => {
  if (!Array.isArray(csvData) || csvData.length <= 1) return [];
  const header = csvData[0];
  const sep = header.includes('|') ? '|' : ',';
  const headers = header.split(sep);

  const rows = csvData.slice(1);
  return rows.map(line => {
    const parts = line.split(sep).map(part => part.trim());
    const rowObj: any = {};
    headers.forEach((h, idx) => {
      const key = h;
      let val = parts[idx] ?? '';
      // strip outer quotes if present
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.substring(1, val.length - 1);
      }
      // basic parse booleans
      if (/^(true|false)$/i.test(val)) {
        val = /^true$/i.test(val);
      }
      rowObj[headerMapping[key] ?? key] = val;
    });

    // coerce specific fields expected as JSON
    const coerceJson = (v: any) => {
      try { return JSON.parse(v); } catch { return v; }
    };
    if (rowObj.AssignedEntity) rowObj.AssignedEntity = coerceJson(rowObj.AssignedEntity);
    if (rowObj.Countries) rowObj.Countries = coerceJson(rowObj.Countries);
    if (rowObj.Currencies) rowObj.Currencies = coerceJson(rowObj.Currencies);

    return mapRow(rowObj);
  });
});
export const createSqlQueryConfig = jest.fn(() => ({}));
export const createApiPayload = jest.fn((configs: any[]) => ({ queries: configs }));

export default {
  makeDataApiCall,
  parseCsvToDtos,
  createSqlQueryConfig,
  createApiPayload,
};
