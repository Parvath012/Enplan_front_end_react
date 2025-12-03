import React from 'react';

// Search utilities
export const highlightSearchTerm = (text: string, searchTerm: string): React.ReactNode[] => {
  if (!searchTerm) return [text];
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => {
    if (regex.test(part)) {
      return React.createElement('span', { key: `highlight-${index}-${part}`, style: { backgroundColor: 'yellow' } }, part);
    }
    return part;
  });
};

export const containsSearchTerm = (text: string, searchTerm: string): boolean => {
  if (!searchTerm.trim()) return true;
  return text.toLowerCase().includes(searchTerm.toLowerCase());
};

export const highlightSearchTermHTML = (text: string, searchTerm: string): string => {
  if (!searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};
