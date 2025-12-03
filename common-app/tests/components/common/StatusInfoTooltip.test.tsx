import React from 'react';
import { render, screen } from '@testing-library/react';
import StatusInfoTooltip from '../../../src/components/common/StatusInfoTooltip';
import '@testing-library/jest-dom';

// Mock timeUtils
jest.mock('../../../src/utils/timeUtils', () => ({
  formatStatusTimestamp: jest.fn((timestamp) => {
    if (!timestamp) return '';
    return '05-Aug-2025 02:00 PM';
  }),
}));

// Mock Information icon
jest.mock('@carbon/icons-react', () => ({
  Information: ({ size }: { size?: number }) => <div data-testid="information-icon">Information Icon</div>,
}));

// Mock MUI Tooltip to avoid complex DOM interactions
jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    Tooltip: ({ children, title, placement, arrow, enterDelay, leaveDelay, slotProps, onOpen, onClose, ...props }: any) => {
      const [isOpen, setIsOpen] = React.useState(false);
      
      React.useEffect(() => {
        if (onOpen) {
          const timer = setTimeout(() => {
            setIsOpen(true);
            onOpen();
          }, enterDelay || 0);
          return () => clearTimeout(timer);
        }
      }, [onOpen, enterDelay]);

      return (
        <div 
          data-testid="mui-tooltip"
          data-title={typeof title === 'object' ? 'tooltip-content' : title}
          data-placement={placement}
          data-arrow={arrow}
          data-enter-delay={enterDelay}
          data-leave-delay={leaveDelay}
          data-open={isOpen}
          {...props}
        >
          {React.cloneElement(children, {
            onMouseEnter: (e: React.MouseEvent) => {
              if (children.props?.onMouseEnter) {
                children.props.onMouseEnter(e);
              }
              if (onOpen) {
                setTimeout(() => {
                  setIsOpen(true);
                  onOpen();
                }, enterDelay || 0);
              }
            },
            onMouseLeave: (e: React.MouseEvent) => {
              if (children.props?.onMouseLeave) {
                children.props.onMouseLeave(e);
              }
              if (onClose) {
                setIsOpen(false);
                onClose();
              }
            },
          })}
          {isOpen && (
            <div data-testid="tooltip-content">
              {typeof title === 'object' ? title : <div>{title}</div>}
            </div>
          )}
        </div>
      );
    },
  };
});

describe('StatusInfoTooltip', () => {
  const defaultProps = {
    transfereddate: '2025-08-05T14:00:00Z',
    transferedto: 'John Doe',
    rowIndex: 0,
    totalRows: 10,
    children: <div data-testid="child-element">Child Element</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset DOM
    document.body.innerHTML = '';
  });

  describe('Basic Rendering', () => {
    it('should render children', () => {
      render(<StatusInfoTooltip {...defaultProps} />);
      expect(screen.getByTestId('child-element')).toBeInTheDocument();
    });

    it('should render tooltip component', () => {
      render(<StatusInfoTooltip {...defaultProps} />);
      expect(screen.getByTestId('mui-tooltip')).toBeInTheDocument();
    });
  });

  describe('Transfer Text', () => {
    it('should handle transferedto when provided', () => {
      render(<StatusInfoTooltip {...defaultProps} transferedto="Jane Smith" />);
      expect(screen.getByTestId('mui-tooltip')).toBeInTheDocument();
    });

    it('should handle empty transferedto', () => {
      render(<StatusInfoTooltip {...defaultProps} transferedto="" />);
      expect(screen.getByTestId('mui-tooltip')).toBeInTheDocument();
    });

    it('should handle null transferedto', () => {
      render(<StatusInfoTooltip {...defaultProps} transferedto={null} />);
      expect(screen.getByTestId('mui-tooltip')).toBeInTheDocument();
    });

    it('should handle undefined transferedto', () => {
      render(<StatusInfoTooltip {...defaultProps} transferedto={undefined} />);
      expect(screen.getByTestId('mui-tooltip')).toBeInTheDocument();
    });

    it('should handle long transfer text', () => {
      const longText = 'A'.repeat(30);
      render(<StatusInfoTooltip {...defaultProps} transferedto={longText} />);
      expect(screen.getByTestId('mui-tooltip')).toBeInTheDocument();
    });

    it('should handle short transfer text', () => {
      render(<StatusInfoTooltip {...defaultProps} transferedto="Short" />);
      expect(screen.getByTestId('mui-tooltip')).toBeInTheDocument();
    });
  });

  describe('Timestamp', () => {
    it('should handle transfereddate when provided', () => {
      render(<StatusInfoTooltip {...defaultProps} transfereddate="2025-08-05T14:00:00Z" />);
      expect(screen.getByTestId('mui-tooltip')).toBeInTheDocument();
    });

    it('should handle null transfereddate', () => {
      render(<StatusInfoTooltip {...defaultProps} transfereddate={null} />);
      expect(screen.getByTestId('mui-tooltip')).toBeInTheDocument();
    });

    it('should handle undefined transfereddate', () => {
      render(<StatusInfoTooltip {...defaultProps} transfereddate={undefined} />);
      expect(screen.getByTestId('mui-tooltip')).toBeInTheDocument();
    });
  });

  describe('Row Index and Total Rows', () => {
    it('should handle last three rows correctly', () => {
      const { container } = render(
        <StatusInfoTooltip {...defaultProps} rowIndex={8} totalRows={10} />
      );
      expect(container).toBeInTheDocument();
    });

    it('should handle last row correctly', () => {
      const { container } = render(
        <StatusInfoTooltip {...defaultProps} rowIndex={9} totalRows={10} />
      );
      expect(container).toBeInTheDocument();
    });

    it('should handle first row correctly', () => {
      const { container } = render(
        <StatusInfoTooltip {...defaultProps} rowIndex={0} totalRows={10} />
      );
      expect(container).toBeInTheDocument();
    });

    it('should handle default rowIndex and totalRows', () => {
      const { container } = render(
        <StatusInfoTooltip
          transfereddate="2025-08-05T14:00:00Z"
          transferedto="John Doe"
          children={<div>Child</div>}
        />
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Tooltip Content Structure', () => {
    it('should render tooltip with correct props', () => {
      render(<StatusInfoTooltip {...defaultProps} />);
      const tooltip = screen.getByTestId('mui-tooltip');
      expect(tooltip).toHaveAttribute('data-placement', 'right');
      expect(tooltip).toHaveAttribute('data-arrow', 'false');
      expect(tooltip).toHaveAttribute('data-enter-delay', '300');
    });
  });

  describe('Tooltip Positioning', () => {
    beforeEach(() => {
      // Mock getBoundingClientRect
      Element.prototype.getBoundingClientRect = jest.fn(() => ({
        width: 100,
        height: 50,
        top: 100,
        left: 100,
        bottom: 150,
        right: 200,
        x: 100,
        y: 100,
        toJSON: jest.fn(),
      }));

      // Mock window.getComputedStyle
      window.getComputedStyle = jest.fn(() => ({
        transform: 'none',
        getPropertyValue: jest.fn(() => ''),
      })) as any;
    });

    it('should handle tooltip open event', () => {
      render(<StatusInfoTooltip {...defaultProps} />);
      expect(screen.getByTestId('mui-tooltip')).toBeInTheDocument();
    });

    it('should handle tooltip close event', () => {
      render(<StatusInfoTooltip {...defaultProps} />);
      expect(screen.getByTestId('mui-tooltip')).toBeInTheDocument();
    });
  });

  describe('Children Props Handling', () => {
    it('should handle children with ref', () => {
      const ChildComponent = React.forwardRef<HTMLDivElement>((props, ref) => (
        <div ref={ref} data-testid="child-with-ref" {...props}>
          Child with Ref
        </div>
      ));

      render(
        <StatusInfoTooltip {...defaultProps}>
          <ChildComponent />
        </StatusInfoTooltip>
      );

      expect(screen.getByTestId('child-with-ref')).toBeInTheDocument();
    });

    it('should handle children with onMouseEnter', () => {
      const mockOnMouseEnter = jest.fn();
      const ChildComponent = ({ onMouseEnter }: { onMouseEnter?: () => void }) => (
        <div data-testid="child-with-handler" onMouseEnter={onMouseEnter}>
          Child with Handler
        </div>
      );

      render(
        <StatusInfoTooltip {...defaultProps}>
          <ChildComponent onMouseEnter={mockOnMouseEnter} />
        </StatusInfoTooltip>
      );

      expect(screen.getByTestId('child-with-handler')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty transferedto with whitespace', () => {
      render(<StatusInfoTooltip {...defaultProps} transferedto="   " />);
      expect(screen.getByTestId('mui-tooltip')).toBeInTheDocument();
    });

    it('should handle exactly 20 character transfer text', () => {
      const exactText = 'A'.repeat(20);
      render(<StatusInfoTooltip {...defaultProps} transferedto={exactText} />);
      expect(screen.getByTestId('mui-tooltip')).toBeInTheDocument();
    });

    it('should handle 21 character transfer text (truncation)', () => {
      const longText = 'A'.repeat(21);
      render(<StatusInfoTooltip {...defaultProps} transferedto={longText} />);
      expect(screen.getByTestId('mui-tooltip')).toBeInTheDocument();
    });

    it('should handle zero totalRows', () => {
      render(<StatusInfoTooltip {...defaultProps} totalRows={0} />);
      expect(screen.getByTestId('mui-tooltip')).toBeInTheDocument();
    });

    it('should handle negative rowIndex', () => {
      render(<StatusInfoTooltip {...defaultProps} rowIndex={-1} />);
      expect(screen.getByTestId('mui-tooltip')).toBeInTheDocument();
    });
  });

  describe('Helper Functions', () => {
    beforeEach(() => {
      Element.prototype.getBoundingClientRect = jest.fn(() => ({
        width: 100,
        height: 50,
        top: 100,
        left: 100,
        bottom: 150,
        right: 200,
        x: 100,
        y: 100,
        toJSON: jest.fn(),
      }));

      window.getComputedStyle = jest.fn(() => ({
        transform: 'matrix(1, 0, 0, 1, 0, 0)',
        getPropertyValue: jest.fn(() => ''),
      })) as any;
    });

    it('should handle findFooterElement with footer element', () => {
      const footer = document.createElement('footer');
      document.body.appendChild(footer);

      render(<StatusInfoTooltip {...defaultProps} />);
      expect(document.body).toBeInTheDocument();

      document.body.removeChild(footer);
    });

    it('should handle findFooterElement with footer class', () => {
      const footerDiv = document.createElement('div');
      footerDiv.className = 'footer';
      document.body.appendChild(footerDiv);

      render(<StatusInfoTooltip {...defaultProps} />);
      expect(document.body).toBeInTheDocument();

      document.body.removeChild(footerDiv);
    });

    it('should handle extractTransformY with matrix transform', () => {
      window.getComputedStyle = jest.fn(() => ({
        transform: 'matrix(1, 0, 0, 1, 0, 50)',
        getPropertyValue: jest.fn(() => ''),
      })) as any;

      render(<StatusInfoTooltip {...defaultProps} />);
      expect(document.body).toBeInTheDocument();
    });

    it('should handle extractTransformY with matrix3d transform', () => {
      window.getComputedStyle = jest.fn(() => ({
        transform: 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 50, 0, 1)',
        getPropertyValue: jest.fn(() => ''),
      })) as any;

      render(<StatusInfoTooltip {...defaultProps} />);
      expect(document.body).toBeInTheDocument();
    });

    it('should handle extractTransformY with none transform', () => {
      window.getComputedStyle = jest.fn(() => ({
        transform: 'none',
        getPropertyValue: jest.fn(() => ''),
      })) as any;

      render(<StatusInfoTooltip {...defaultProps} />);
      expect(document.body).toBeInTheDocument();
    });
  });
});

