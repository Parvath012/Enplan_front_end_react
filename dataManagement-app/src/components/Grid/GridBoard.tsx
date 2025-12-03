import React from "react";
import ProcessGroupBox from "../ProcessGroupBox";
import "./Grid.css";

interface ProcessGroup {
  id: string;
  name: string;
  parameterContext: string;
  position: { x: number; y: number };
  runningCount: number;
  stoppedCount: number;
  invalidCount: number;
  disabledCount: number;
  activeRemotePortCount: number;
  inactiveRemotePortCount: number;
  queued: string;
  input: string;
  read: string;
  written: string;
  output: string;
  upToDateCount: number;
  locallyModifiedCount: number;
  staleCount: number;
  locallyModifiedAndStaleCount: number;
  syncFailureCount: number;
}

interface GridBoardProps {
  processGroups: ProcessGroup[];
  onBoxClick?: (boxId: string, boxName: string) => void;
  onBoxDoubleClick?: (boxId: string, boxName: string) => void;
  onDelete?: () => void;
  onCopy?: () => void;
  onConfigure?: () => void;
  parentGroupId?: string;
  selectedBoxId?: string;
  triggerConfigure?: number;
}

const GridBoard: React.FC<GridBoardProps> = ({ processGroups, onBoxClick, onBoxDoubleClick, onDelete, onCopy, onConfigure, parentGroupId, selectedBoxId, triggerConfigure }) => {
  // Debug logging
  React.useEffect(() => {
    console.log('GridBoard - Process Groups:', processGroups);
    console.log('GridBoard - Number of groups:', processGroups.length);
  }, [processGroups]);

  return (
    <div className="grid-container">
      {processGroups.map((group) => {
        return (
          <ProcessGroupBox
            key={group.id}
            id={group.id}
            name={group.name}
            position={group.position}
            runningCount={group.runningCount}
            stoppedCount={group.stoppedCount}
            invalidCount={group.invalidCount}
            disabledCount={group.disabledCount}
            activeRemotePortCount={group.activeRemotePortCount}
            inactiveRemotePortCount={group.inactiveRemotePortCount}
            queued={group.queued}
            input={group.input}
            read={group.read}
            written={group.written}
            output={group.output}
            upToDateCount={group.upToDateCount}
            locallyModifiedCount={group.locallyModifiedCount}
            staleCount={group.staleCount}
            locallyModifiedAndStaleCount={group.locallyModifiedAndStaleCount}
            syncFailureCount={group.syncFailureCount}
            onMouseDown={(e) => {
              e.stopPropagation();
              // Handle drag if needed, but don't set selection here
            }}
            onClick={(id, name) => {
              if (onBoxClick) {
                onBoxClick(id, name);
              }
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              if (onBoxDoubleClick) {
                onBoxDoubleClick(group.id, group.name);
              }
            }}
            isDragging={false}
            onDelete={onDelete}
            onCopy={onCopy}
            onConfigure={onConfigure}
            parentGroupId={parentGroupId}
            isSelected={selectedBoxId === group.id}
            triggerConfigure={selectedBoxId === group.id ? triggerConfigure : undefined}
          />
        );
      })}
    </div>
  );
};

export default GridBoard;
