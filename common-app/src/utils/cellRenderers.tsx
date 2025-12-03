import React, { Suspense } from 'react';
import { highlightSearchTerm } from './searchUtils';

// Module Federation imports
import CustomTooltip from '../components/common/CustomTooltip';

// Render single-line with character-based truncation; show tooltip when text exceeds maxChars
export const ConditionalTooltipText: React.FC<{ text: string; maxChars: number; searchTerm?: string }> = ({ text, maxChars, searchTerm }) => {
  const actualText = text ?? '';
  const shouldShowTooltip = actualText.length > maxChars;
  
  // Truncate text if it exceeds maxChars and add ellipsis
  const truncatedText = shouldShowTooltip ? actualText.substring(0, maxChars) + '...' : actualText;
  
  // Highlight search terms if searchTerm is provided
  const content = searchTerm ? (
    <span style={{ display: 'inline-block', maxWidth: '100%', whiteSpace: 'nowrap' }}>
      {highlightSearchTerm(truncatedText, searchTerm)}
    </span>
  ) : (
    <span style={{ display: 'inline-block', maxWidth: '100%', whiteSpace: 'nowrap' }}>{truncatedText}</span>
  );
  
  return shouldShowTooltip ? (
    <Suspense fallback={<span>{content}</span>}>
      <CustomTooltip title={actualText} placement="bottom">
        {content}
      </CustomTooltip>
    </Suspense>
  ) : (
    content
  );
};

// AG Grid cell renderer for highlighted text with conditional tooltip - returns React component
export const createHighlightedCellRenderer = (searchValue: string, maxChars: number) => {
  return (params: any) => {
    const value = params.value ?? '';
    
    // Use the ConditionalTooltipText component which includes both highlighting and tooltip
    return (
      <ConditionalTooltipText 
        text={value} 
        maxChars={maxChars} 
        searchTerm={searchValue} 
      />
    );
  };
};
