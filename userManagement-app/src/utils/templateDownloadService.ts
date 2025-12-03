import * as XLSX from "xlsx";

/**
 * Template column definitions for bulk user upload
 * These columns match the UserFormData interface fields and API requirements
 */
export const TEMPLATE_COLUMNS = [
  // Basic Details - Required fields
  "First Name",
  "Last Name",
  "Phone Number",
  "Role",
  "Department",
  "Email ID",

  // Reporting Details
  "Self Reporting", // Yes/No (or True/False)
  "Reporting Manager",
  "Dotted Line Manager",

  // Permissions - Multi-select fields (comma-separated values)
  "Regions", // e.g., "Region1,Region2"
  "Countries", // e.g., "Country1,Country2"
  "Divisions", // e.g., "Division1,Division2"
  "Groups", // e.g., "Group1,Group2"
  "Permissions Departments", // e.g., "Dept1,Dept2" (different from single Department field)
  "Classes", // e.g., "Class1,Class2"
  "SubClasses", // e.g., "SubClass1,SubClass2"
];

/**
 * Downloads the user bulk upload template as an Excel file
 * Creates a raw template with headers only (no sample data)
 */
export const downloadUserTemplate = (): void => {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Create worksheet data with only header row (raw template)
    const worksheetData = [
      TEMPLATE_COLUMNS, // Header row only
    ];

    // Create worksheet from data
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths for better readability
    const columnWidths = TEMPLATE_COLUMNS.map(() => ({ wch: 25 }));
    worksheet["!cols"] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "User Template");

    // Generate file name with date
    const fileName = "Employee_Upload_Sheet.xlsx";

    // Write file and trigger download
    XLSX.writeFile(workbook, fileName);

    console.log("Template downloaded successfully:", fileName);
  } catch (error) {
    console.error("Error downloading template:", error);
    throw error;
  }
};
