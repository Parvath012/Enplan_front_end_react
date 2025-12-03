import React from 'react';

/**
 * Highlights search terms in text by wrapping matched portions in styled spans
 * @param text - The original text to search in
 * @param searchTerm - The search term to highlight
 * @returns JSX element with highlighted text
 */
export const highlightSearchTerm = (text: string, searchTerm: string): React.ReactNode => {
  if (!searchTerm?.trim() || !text) {
    return text;
  }

  const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) => {
    // Check if this part matches the search term (case-insensitive)
    if (part.toLowerCase() === searchTerm.toLowerCase()) {
      return (
        <span
          key={`${part}-${index}`}
          style={{
            backgroundColor: 'rgba(255, 255, 0, 0.3)',
            fontWeight: 'bold',
            borderRadius: '2px',
            padding: '0 1px'
          }}
        >
          {part}
        </span>
      );
    }
    return part;
  });
};

/**
 * AG Grid compatible function that returns HTML string with highlighted text
 * @param text - The original text to search in
 * @param searchTerm - The search term to highlight
 * @returns HTML string with highlighted text
 */
export const highlightSearchTermHTML = (text: string, searchTerm: string): string => {
  if (!searchTerm?.trim() || !text) {
    return text;
  }

  const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
  
  return text.replace(regex, '<span style="background-color: rgba(255, 255, 0, 0.3); font-weight: bold; border-radius: 2px; padding: 0 1px;">$1</span>');
};

/**
 * Checks if text contains the search term (case-insensitive)
 * @param text - The text to search in
 * @param searchTerm - The search term to find
 * @returns boolean indicating if the search term is found
 */
export const containsSearchTerm = (text: string, searchTerm: string): boolean => {
  if (!searchTerm?.trim() || !text) {
    return false;
  }
  return text.toLowerCase().includes(searchTerm.toLowerCase());
};
