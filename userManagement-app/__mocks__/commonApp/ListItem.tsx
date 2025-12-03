import React from 'react';

export default function MockListItem({ item, idField, displayField, selectedItems, isEditMode, onToggle, isPrePopulated }) {
  return (
    <div data-testid="list-item" data-id={item[idField]} data-selected={selectedItems.includes(item[idField])} data-edit-mode={isEditMode} data-pre-populated={isPrePopulated}>
      {item[displayField]}
      <button onClick={() => onToggle(item[idField])}>Toggle</button>
    </div>
  );
}
