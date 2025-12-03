import React from 'react';
import { Box, Typography } from '@mui/material';
import CustomCheckbox from '../common/CustomCheckbox';

interface ListItemProps {
  item: any;
  index: number;
  totalItems: number;
  idField: string;
  displayField: string;
  selectedItems: string[];
  isEditMode: boolean;
  onToggle: (id: string) => void;
  isPrePopulated: boolean;
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
  // For currencies, compare by name instead of ID
  const isChecked = displayField === 'currencyName' 
    ? selectedItems.some((selectedName: string) => {
        // Currency name is now stored directly without prefix
        const itemName = item[displayField];
        return itemName === selectedName || 
               itemName === selectedName.replace(/\)([A-Z])/g, ') $1') ||
               selectedName === itemName?.replace(/\)([A-Z])/g, ') $1');
      })
    : selectedItems.includes(item[idField]);

  // For currencies, check if this is a non-deletable currency (defaultCurrency or isDefault)
  const isNonDeletableCurrency = displayField === 'currencyName' && (() => {
    // Currency name is now stored directly without prefix
    const itemName = item[displayField];
    return (defaultCurrency?.includes(itemName)) || 
           (isDefault === itemName);
  })();

  const handleToggle = () => {
    if (displayField === 'currencyName') {
      // For currencies, pass the currency name (now stored directly without prefix)
      const itemName = item[displayField];
      onToggle(itemName);
    } else {
      // For countries, pass the ID
      onToggle(item[idField]);
    }
  };

  return (
    <Box
      onClick={() => isEditMode && !isPrePopulated && !isNonDeletableCurrency && handleToggle()}
      sx={{
        display: "flex",
        alignItems: "center",
        px: 2,
        py: 1.5,
        height: 32,
        width: 216,
        backgroundColor: "#fff",
        paddingLeft: "10px",
        borderBottom: index < totalItems - 1 ? "1px solid #e8e8e8" : "none",
        "&:last-child": {
          borderBottom: "none"
        },
        opacity: (isPrePopulated || isNonDeletableCurrency) ? 0.8 : 1,
        cursor: isEditMode && !isPrePopulated && !isNonDeletableCurrency ? 'pointer' : 'default'
      }}
    >
      <Box onClick={(e) => e.stopPropagation()}>
        <CustomCheckbox
          checked={isChecked}
          disabled={!isEditMode || isPrePopulated || !!isNonDeletableCurrency}
          onChange={handleToggle}
        />
      </Box>
      <Typography sx={{
        fontSize: "12px",
        fontWeight: 400,
        color: "#5F6368",
        ml: 1,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        maxWidth: "180px"
      }}>
        {item[displayField]}
      </Typography>
    </Box>
  );
};

export default ListItem;
