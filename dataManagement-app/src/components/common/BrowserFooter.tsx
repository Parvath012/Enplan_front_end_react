import React from 'react';

interface BrowserFooterProps {
  onClose: () => void;
  onAdd: () => void;
  isAddDisabled: boolean;
  cancelButtonClassName: string;
  addButtonClassName: string;
  footerClassName: string;
}

const BrowserFooter: React.FC<BrowserFooterProps> = ({
  onClose,
  onAdd,
  isAddDisabled,
  cancelButtonClassName,
  addButtonClassName,
  footerClassName
}) => {
  return (
    <div className={footerClassName}>
      <button
        onClick={onClose}
        className={cancelButtonClassName}
      >
        Cancel
      </button>
      <button
        onClick={onAdd}
        disabled={isAddDisabled}
        className={addButtonClassName}
      >
        Add
      </button>
    </div>
  );
};

export default BrowserFooter;

