// src/components/TableFooterComponent.tsx

import React from 'react';
import '../styles.scss';
import StatsDisplay from './StatsDisplay';
import LegendDisplay from './LegendDisplay';
import DataRefreshButton from './DataRefresh';
import ZoomControls from './ZoomControls';
import { legendConfig, statsConfig } from '../../../../config/tableFooterConfig';

import { useDispatch, useSelector } from 'react-redux';
import toggleGridMode from '../../../../store/Actions/gridModeActions';

type FooterProps = {
  statsData: Record<string, number | string>;
  legendItems?: typeof legendConfig;
  onRefresh?: () => void;
  zoomPercentage?: number;
  minZoom?: number;
  maxZoom?: number;
  onZoomChange?: (zoom: number) => void;
};

const TableFooterComponent: React.FC<FooterProps> = ({
  statsData,
  legendItems = legendConfig,
  onRefresh,
  zoomPercentage = 100,
  minZoom = 50,
  maxZoom = 150,
  onZoomChange,
}) => {
  const dispatch = useDispatch();
  const gridMode = useSelector((state: any) => state.gridModeStore);

  const handleToggle = () => {
    dispatch<any>(toggleGridMode());
  };

  return (
    <footer className="footer">
      <div className="footer-section left">
        <StatsDisplay statsConfig={statsConfig} statsData={statsData} />
      </div>

      <div className="footer-section center">
        <button className="center-button" onClick={handleToggle}>
          {gridMode === 'muiDataGrid' ? 'AG Grid' : 'MUI Data Grid'}
        </button>
      </div>

      <div className="footer-section right">
        <LegendDisplay legendItems={legendItems} />
        <span className="separator">|</span>
        <DataRefreshButton onRefresh={onRefresh} />
        <span className="separator">|</span>
        <ZoomControls
          zoomPercentage={zoomPercentage}
          minZoom={minZoom}
          maxZoom={maxZoom}
          onZoomChange={onZoomChange}
        />
      </div>
    </footer>
  );
};

export default TableFooterComponent;
