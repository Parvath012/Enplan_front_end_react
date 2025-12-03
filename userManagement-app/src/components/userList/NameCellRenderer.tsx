import React from 'react';
import UserInitials from '../UserInitials';
import { ConditionalTooltipText } from 'commonApp/cellRenderers';
import { StatusInfoTooltip } from 'commonApp/common';
import SharedIcon from './SharedIcon';
import CustomTransferIcon from './CustomTransferIcon';

interface NameCellRendererProps {
  params: any;
  searchTerm: string;
}

/**
 * Name Cell Renderer Component
 * Displays user initials, name, and transfer/shared icon for inactive users
 */
const NameCellRenderer: React.FC<NameCellRendererProps> = ({ params, searchTerm }) => {
  const user = params.data;
  const fullName = `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'N/A';
  const isInactive = !user.isenabled || user.status === 'Inactive';
  
  // Use transferedby column to determine icon type
  const hasTransferedBy = user.transferedby && user.transferedby.trim() !== '';
  
  // Get row index and total rows for tooltip positioning
  const rowIndex = params.rowIndex ?? 0;
  const totalRows = params.api?.getDisplayedRowCount() ?? 0;
  
  // Debug logging
  console.log('nameCellRenderer - User ID:', user.id, 'transferedby:', user.transferedby, 'hasTransferedBy:', hasTransferedBy, 'isInactive:', isInactive);
  
  // Icon button component (extracted for tooltip wrapping)
  const iconButton = (
    <button 
      type="button"
      style={{ 
        width: '26px',
        height: '22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        cursor: 'pointer',
        borderRadius: '4px',
        transition: 'background-color 0.2s ease',
        backgroundColor: 'transparent',
        marginLeft: '-4px',  // Move icon a little to the left
        border: 'none',
        padding: 0,
        outline: 'none',
        fontFamily: 'Inter Tight, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.04)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {hasTransferedBy ? (
        <SharedIcon 
          size={14} 
          color="#5B6061"
        />
      ) : (
        <CustomTransferIcon 
          size={14} 
          color="#5B6061"
        />
      )}
    </button>
  );
  
  return (
    <div style={{ 
      display: 'flex',
      alignItems: 'center',
      height: '100%',
      width: '100%',
      position: 'relative',
      boxSizing: 'border-box',
      fontFamily: "'InterTight-Regular', 'Inter Tight', sans-serif"
    }}>
      {/* UserInitials - 24px width, left aligned */}
      <div style={{
        width: '24px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginRight: '8px'
      }}>
        <UserInitials 
          firstName={user.firstname || ''} 
          lastName={user.lastname || ''} 
          size={24}
          fontSize={10}
        />
      </div>
      
      {/* Middle div - flexible width, takes remaining space with text truncation */}
      <div style={{
        flex: 1,
        minWidth: 0,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        marginRight: isInactive ? '8px' : '0'
      }}>
        <ConditionalTooltipText
          text={fullName}
          maxChars={15}
          searchTerm={searchTerm}
        />
      </div>
      
      {/* Inactive div - 26px width, right aligned within 173px container */}
      {isInactive ? (
        <StatusInfoTooltip
          transfereddate={user.transfereddate}
          transferedto={user.transferedto}
          rowIndex={rowIndex}
          totalRows={totalRows}
        >
          {iconButton}
        </StatusInfoTooltip>
      ) : null}
    </div>
  );
};

/**
 * Factory function to create name cell renderer with search term
 */
export const createNameCellRenderer = (searchTerm: string) => {
  return (params: any) => <NameCellRenderer params={params} searchTerm={searchTerm} />;
};

export default NameCellRenderer;

