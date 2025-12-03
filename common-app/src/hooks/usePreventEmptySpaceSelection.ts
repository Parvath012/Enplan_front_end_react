import { useRef, useEffect } from 'react';

export const usePreventEmptySpaceSelection = () => {
  const elementRef = useRef(null);

  useEffect(() => {
    const isClickOnEmptySpace = (target) => {
      const containerElements = ['DIV', 'SECTION', 'HEADER', 'NAV', 'MAIN', 'ARTICLE', 'ASIDE'];
      const hasDirectText = target.childNodes.length === 1 && target.childNodes[0].nodeType === Node.TEXT_NODE;
      
      return containerElements.includes(target.tagName) && !hasDirectText;
    };

    const handleMouseDown = (e) => {
      const target = e.target;
      
      if (isClickOnEmptySpace(target)) {
        if (window.getSelection) {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            selection.removeAllRanges();
          }
        }
        e.preventDefault();
      }
    };

    const handleSelectStart = (e) => {
      const target = e.target;
      
      if (isClickOnEmptySpace(target)) {
        e.preventDefault();
      }
    };

    const handleDoubleClick = (e) => {
      const target = e.target;
      
      if (isClickOnEmptySpace(target)) {
        if (window.getSelection) {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            selection.removeAllRanges();
          }
        }
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const element = elementRef.current;
    if (element) {
      element.addEventListener('mousedown', handleMouseDown);
      element.addEventListener('selectstart', handleSelectStart);
      element.addEventListener('dblclick', handleDoubleClick);
    }

    return () => {
      if (element) {
        element.removeEventListener('mousedown', handleMouseDown);
        element.removeEventListener('selectstart', handleSelectStart);
        element.removeEventListener('dblclick', handleDoubleClick);
      }
    };
  }, []);

  return elementRef;
};