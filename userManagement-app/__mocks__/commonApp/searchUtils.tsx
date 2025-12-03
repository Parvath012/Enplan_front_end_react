// Mock for commonApp/searchUtils
export const highlightSearchTerm = jest.fn((text: string, searchTerm: string) => text);
export const highlightSearchTermHTML = jest.fn((text: string, searchTerm: string) => text);
export const containsSearchTerm = jest.fn((text: string, searchTerm: string) => true);

