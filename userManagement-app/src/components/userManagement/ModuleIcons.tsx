import React from 'react';
import { 
  DataCollection, 
  MacCommand, 
  Currency, 
  InventoryManagement, 
  Categories, 
  Connect, 
  Money
} from "@carbon/icons-react";

interface ModuleIconProps {
  moduleName: string;
  size?: number;
  className?: string;
}

const ModuleIcon: React.FC<ModuleIconProps> = ({ 
  moduleName, 
  size = 20, 
  className = '' 
}) => {
  const iconStyle = {
    width: `${size}px`,
    height: `${size - 1}px`, // 13px for 14px size
    ...(className && { className })
  };

  switch (moduleName) {
    case 'Data Management':
      return <DataCollection {...iconStyle} />;
    case 'Master':
      return <MacCommand {...iconStyle} />;
    case 'Budgeting':
      return <Currency {...iconStyle} />;
    case 'Inventory / OTB':
      return <InventoryManagement {...iconStyle} />;
    case 'Assortment':
      return <Categories {...iconStyle} />;
    case 'Allocation & Replenishment':
      return <Connect {...iconStyle} />;
    case 'FP & A':
      return <Money {...iconStyle} />;
    case 'Admin':
      return (
        <img
          src="/icons/manage_accounts_24dp_666666.svg"
          alt="Admin"
          width={iconStyle.width}
          height={iconStyle.height}
          className={iconStyle.className}
        />
      );
    default:
      return null;
  }
};

export default ModuleIcon;

