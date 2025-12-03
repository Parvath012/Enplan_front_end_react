import React from 'react';

interface ListItemProps {
  item: any;
  index: number;
  totalItems: number;
  idField: string;
  displayField: string;
  selectedItems: string[];
  isEditMode: boolean;
  onToggle: (id: string) => void;
  isPrePopulated?: boolean;
  defaultCurrency?: string[];
  isDefault?: string | null;
}

const ListItem: React.FC<ListItemProps> = ({ 
  item, 
  index, 
  totalItems, 
  idField, 
  displayField, 
  selectedItems, 
  isEditMode, 
  onToggle, 
  isPrePopulated, 
  defaultCurrency, 
  isDefault 
}) => {
  return (
    <div 
      data-testid="list-item"
      data-id={item[idField]}
      data-index={index}
      data-total={totalItems}
      data-selected={selectedItems.includes(item[idField])}
      data-edit-mode={isEditMode}
      data-pre-populated={isPrePopulated}
      data-default-currency={defaultCurrency?.includes(item[idField])}
      data-is-default={isDefault === item[idField]}
      onClick={() => onToggle(item[idField])}
    >
      {item[displayField]}
    </div>
  );
};

export default ListItem;

