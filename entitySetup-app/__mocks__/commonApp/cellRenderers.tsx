// Mock for commonApp/cellRenderers
import React from 'react';

export const ConditionalTooltipText = ({ text, maxChars = 50, searchTerm }: any) => {
  if (!text) return <span></span>;
  
  if (text.length <= maxChars) {
    return <span>{text}</span>;
  }
  
  return (
    <span title={text}>
      {text.substring(0, maxChars)}...
    </span>
  );
};

export const createHighlightedCellRenderer = (searchTerm?: string, maxChars?: number) => {
  return (params: any) => {
    const value = params.value || '';
    return <ConditionalTooltipText text={value} maxChars={maxChars} searchTerm={searchTerm} />;
  };
};

export default {
  ConditionalTooltipText,
  createHighlightedCellRenderer,
};
