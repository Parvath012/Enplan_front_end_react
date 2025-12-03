export function parseCSVToRows(csvData: string[]): any[] {
  const [headerRow, ...dataRows] = csvData;
  const headers = headerRow.split('|');

  return dataRows.map((row, idx) => {
    const values = row.split('|');
    const rowObj: any = { id: idx };

    headers.forEach((header, colIdx) => {
      let cleaned = values[colIdx];
      // Safely remove leading single quotes
      while (cleaned?.startsWith("'")) {
        cleaned = cleaned.slice(1);
      }
      // Safely remove trailing single quotes
      while (cleaned?.endsWith("'")) {
        cleaned = cleaned.slice(0, -1);
      }
      rowObj[header] = cleaned?.trim();
    });

    return rowObj;
  });
}  