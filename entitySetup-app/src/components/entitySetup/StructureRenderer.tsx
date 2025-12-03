import React, { Suspense } from 'react';
import { Box, Button } from '@mui/material';
// Module Federation imports
const CustomTooltip = React.lazy(() => import('commonApp/CustomTooltip'));
import { EntityModel } from '../../services/entitySetupService';
import { getIconUrl } from 'commonApp/iconUtils';

interface StructureRendererProps {
  entity: EntityModel;
  onViewStructure: (id: string | number | undefined) => void;
}

const StructureRenderer: React.FC<StructureRendererProps> = ({ entity, onViewStructure }) => {
  return (
    <Suspense fallback={<div></div>}>
      <CustomTooltip title="View Structure" placement="bottom">
        <Button
          size="small"
          variant="text"
          color="inherit"
          disabled={!!entity.isDeleted && !entity.isEnabled}
          onClick={() => onViewStructure(entity.id)}
          startIcon={
            <Box
              component="img"
              src={getIconUrl('family_history_24dp_5B6061.svg')}
              alt="Family History"
              onError={(e) => {
                console.error('Failed to load family history icon');
                e.currentTarget.style.display = 'none';
              }}
              sx={{
                width: 16,
                height: 16,
                transform: 'rotate(180deg)'
              }}
            />
          }
          sx={{
            textTransform: 'none',
            fontSize: '10px',
            fontWeight: 400,
            fontFamily: "'InterTight-Regular', 'Inter Tight', sans-serif",
            color: '#5B6061',
            width: '100px',
            marginRight: 7, // Adjusted for better alignment
            justifyContent: 'flex-start',
          }}
        >
          View Structure
        </Button>
      </CustomTooltip>
    </Suspense>
  );
};

export default StructureRenderer;
