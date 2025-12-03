export const ZOOM_STEPS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
export const DEFAULT_ZOOM_INDEX = 3;
export const DEFAULT_ZOOM_LEVEL = ZOOM_STEPS[DEFAULT_ZOOM_INDEX];

export const REACT_FLOW_CONFIG = {
  nodeTypes: {},
  edgeTypes: {},
  defaultViewport: { x: 0, y: 0, zoom: DEFAULT_ZOOM_LEVEL },
};

export const fitViewToContainer = () => ({ x: 0, y: 0, zoom: 1 });