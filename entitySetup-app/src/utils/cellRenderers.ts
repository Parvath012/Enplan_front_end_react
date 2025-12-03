// Cell renderer utilities for entitySetup-app

export const createHighlightedCellRenderer = (searchValue: string, maxLength: number = 50) => {
  return (params: any) => {
    if (!params.value) return '';
    
    const value = String(params.value);
    const truncatedValue = value.length > maxLength ? value.substring(0, maxLength) + '...' : value;
    
    if (!searchValue) {
      return `<span>${truncatedValue}</span>`;
    }
    
    // Simple highlighting - in a real implementation, you'd want more sophisticated highlighting
    const highlightedValue = truncatedValue.replace(
      new RegExp(searchValue, 'gi'),
      `<mark>${searchValue}</mark>`
    );
    
    return `<span>${highlightedValue}</span>`;
  };
};

export const createCellStyles = (params: any) => {
  return {
    color: params.value ? 'inherit' : '#999',
    fontStyle: params.value ? 'normal' : 'italic',
  };
};

export const createDefaultCellRenderer = () => {
  return (params: any) => {
    return params.value || '';
  };
};
