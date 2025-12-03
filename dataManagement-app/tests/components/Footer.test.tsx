import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Footer from '../../src/components/Footer';

// Create a mock store
const mockStore = configureStore([]);

jest.mock('../../src/config/footerConfig', () => ({
  footerData: {
    '': [
      {
        key: 'rootItem',
        icon: '/icons/root.svg',
        text: 'Root',
        tooltip: 'Root tooltip',
      },
      {
        key: 'activeThreads',
        icon: '/icons/thread.svg',
        text: '0',
        tooltip: 'Active Threads',
      },
      {
        key: 'queuedBytes',
        icon: '/icons/bytes.svg',
        text: '0/0 bytes',
        tooltip: 'Queued Bytes',
      },
      {
        key: 'startCount',
        icon: '/icons/start.svg',
        text: '0',
        tooltip: 'Running Components',
      },
      {
        key: 'stopCount',
        icon: '/icons/stop.svg',
        text: '0',
        tooltip: 'Stopped Components',
      },
      {
        key: 'queuedItems1',
        icon: '/icons/queue1.svg',
        text: '0',
        tooltip: 'Queue Item 1',
      },
      {
        key: 'queuedItems2',
        icon: '/icons/queue2.svg',
        text: '0',
        tooltip: 'Queue Item 2',
      },
      {
        key: 'queuedItems3',
        icon: '/icons/queue3.svg',
        text: '0',
        tooltip: 'Queue Item 3',
      },
      {
        key: 'queuedItems4',
        icon: '/icons/queue4.svg',
        text: '0',
        tooltip: 'Queue Item 4',
      },
      {
        key: 'queuedItems5',
        icon: '/icons/queue5.svg',
        text: '0',
        tooltip: 'Queue Item 5',
      },
      {
        key: 'queuedItems6',
        icon: '/icons/queue6.svg',
        text: '0',
        tooltip: 'Queue Item 6',
      },
      {
        key: 'queuedItems7',
        icon: '/icons/queue7.svg',
        text: '0',
        tooltip: 'Queue Item 7',
      },
      {
        key: 'queuedItems8',
        icon: '/icons/queue8.svg',
        text: '0',
        tooltip: 'Queue Item 8',
      },
      {
        key: 'queuedItems9',
        icon: '/icons/queue9.svg',
        text: '0',
        tooltip: 'Queue Item 9',
      },
    ],
    home: [
      {
        key: 'search',
        icon: '/icons/search.svg',
        text: 'Search',
        tooltip: 'Search tooltip',
      },
      {
        key: 'home',
        icon: '/icons/home.svg',
        text: 'Home',
        tooltip: 'Home tooltip',
      },
      {
        key: 'lastUpdated',
        icon: '/icons/profile.svg',
        text: '16:06 IST',
      },
    ],
    custom: [
      {
        key: 'customIcon',
        icon: <span data-testid="custom-icon">C</span>,
        text: 'Custom',
        tooltip: 'Custom tooltip',
      },
      {
        key: 'noTooltip',
        icon: '/icons/noTooltip.svg',
        text: 'NoTooltip',
      },
    ],
  },
}));

jest.mock("commonApp/CustomTooltip", () => {
  return ({ children }: { children: React.ReactNode }) => <>{children}</>;
});

jest.mock('commonApp/timeUtils', () => ({
  formatTime: jest.fn(() => '16:06 IST'),
}));

// Mock the useNifiStatus hook
jest.mock('../../src/hooks/useNifiStatus', () => ({
  useNifiStatus: jest.fn(() => ({
    getFormattedValue: jest.fn((key) => {
      switch (key) {
        case 'activeThreads':
          return '10';
        case 'queuedBytes':
          return '5/100 bytes';
        case 'startCount':
          return '8';
        case 'stopCount':
          return '2';
        case 'queuedItems1':
          return '3';
        case 'queuedItems2':
          return '1';
        case 'queuedItems3':
          return '0';
        case 'queuedItems4':
          return '1';
        case 'queuedItems5':
          return '4';
        case 'queuedItems6':
          return '2';
        case 'queuedItems7':
          return '0';
        case 'queuedItems8':
          return '0';
        case 'queuedItems9':
          return '0';
        default:
          return '0';
      }
    }),
    status: {
      activeThreadCount: 10,
      terminatedThreadCount: 5,
      queued: '5/100 bytes',
      flowFilesQueued: 5,
      bytesQueued: 100,
      runningCount: 8,
      stoppedCount: 2,
      invalidCount: 0,
      disabledCount: 1,
      activeRemotePortCount: 3,
      inactiveRemotePortCount: 1,
      upToDateCount: 4,
      locallyModifiedCount: 2,
      staleCount: 0,
      locallyModifiedAndStaleCount: 0,
      syncFailureCount: 0
    },
    loading: false,
    error: null,
    lastUpdated: '2023-09-23T10:00:00.000Z'
  }))
}));

let mockPathname = '/home';

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useLocation: jest.fn(() => ({ pathname: mockPathname })),
  };
});

const { footerData } = require('../../src/config/footerConfig');
const { formatTime } = require('commonApp/timeUtils');

describe('Footer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname = '/home'; // default for most tests
  });

  it('renders footer items based on route and handles clicks', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    render(
      <MemoryRouter initialEntries={['/home']}>
        <Footer />
      </MemoryRouter>
    );

    const footerItems = screen.getAllByAltText('icon');
    expect(footerItems.length).toBe(3);

    fireEvent.click(footerItems[1]);
    expect(logSpy).toHaveBeenCalledWith('Clicked on: home');

    logSpy.mockRestore();
  });

  it('displays formatted time for item with key lastUpdated', async () => {
    render(
      <MemoryRouter initialEntries={['/home']}>
        <Footer />
      </MemoryRouter>
    );

    const timeText = await screen.findByText('16:06 IST');
    expect(timeText).toBeInTheDocument();
  });

  it('cleans up interval on unmount', () => {
    jest.useFakeTimers();
    const clearIntervalSpy = jest.spyOn(window, 'clearInterval');

    const { unmount } = render(
      <MemoryRouter initialEntries={['/home']}>
        <Footer />
      </MemoryRouter>
    );

    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();

    jest.useRealTimers();
    clearIntervalSpy.mockRestore();
  });

  it('renders nothing when no footer items for route', () => {
    mockPathname = '/unknown'; // set to a route with no items
    render(
      <MemoryRouter initialEntries={['/unknown']}>
        <Footer />
      </MemoryRouter>
    );
    expect(screen.queryAllByAltText('icon')).toHaveLength(0);
  });

  it('renders footer items for the root path "/"', () => {
    mockPathname = '/'; // root path
    render(
      <MemoryRouter initialEntries={['/']}>
        <Footer />
      </MemoryRouter>
    );
    expect(screen.getAllByAltText('icon').length).toBeGreaterThan(0);
  });

  it('renders custom React element icon and handles tooltip logic', () => {
    mockPathname = '/custom';
    render(
      <MemoryRouter initialEntries={['/custom']}>
        <Footer />
      </MemoryRouter>
    );
    // Should render the custom icon
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    // Should render the image icon for noTooltip
    expect(screen.getByAltText('icon')).toBeInTheDocument();
    // Should render both items
    expect(screen.getAllByRole('button').length).toBe(2);
  });

  it('applies with-border class to all but the first item', () => {
    mockPathname = '/home';
    render(
      <MemoryRouter initialEntries={['/home']}>
        <Footer />
      </MemoryRouter>
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons[0].className).not.toContain('with-border');
    expect(buttons[1].className).toContain('with-border');
    expect(buttons[2].className).toContain('with-border');
  });

  it('uses index as key if key is missing', () => {
    // Add a footer item without a key
    footerData.test = [{ icon: '/icons/test.svg', text: 'Test' }];
    mockPathname = '/test';
    render(
      <MemoryRouter initialEntries={['/test']}>
        <Footer />
      </MemoryRouter>
    );
    // Should render the item
    expect(screen.getByAltText('icon')).toBeInTheDocument();
  });

  it('does not break if icon is not string or React element', () => {
    // Add a footer item with icon as number (invalid)
    footerData.invalid = [{ key: 'bad', icon: 123, text: 'Bad' }];
    mockPathname = '/invalid';
    render(
      <MemoryRouter initialEntries={['/invalid']}>
        <Footer />
      </MemoryRouter>
    );
    // Should render the text even if icon is invalid
    expect(screen.getByText('Bad')).toBeInTheDocument();
  });

  it('renders text if icon is undefined', () => {
    footerData.noicon = [{ key: 'noicon', text: 'NoIcon' }];
    mockPathname = '/noicon';
    render(
      <MemoryRouter initialEntries={['/noicon']}>
        <Footer />
      </MemoryRouter>
    );
    expect(screen.getByText('NoIcon')).toBeInTheDocument();
  });

  it('renders empty footer if items is empty array', () => {
    footerData.empty = [];
    mockPathname = '/empty';
    render(
      <MemoryRouter initialEntries={['/empty']}>
        <Footer />
      </MemoryRouter>
    );
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('renders tooltip if tooltip prop is present', () => {
    mockPathname = '/';
    render(
      <MemoryRouter initialEntries={['/']}>
        <Footer />
      </MemoryRouter>
    );
    // Tooltip is mocked as passthrough, but we can check the text is present
    expect(screen.getByText('Root')).toBeInTheDocument();
  });

  it('calls formatTime on interval', () => {
    jest.useFakeTimers();
    render(
      <MemoryRouter initialEntries={['/home']}>
        <Footer />
      </MemoryRouter>
    );
    jest.advanceTimersByTime(2000);
    expect(formatTime).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('renders footer items for empty pathname (fallback to root)', () => {
    mockPathname = '';
    render(
      <MemoryRouter initialEntries={['']}>
        <Footer />
      </MemoryRouter>
    );
    // Should render the root item
    expect(screen.getByText('Root')).toBeInTheDocument();
  });

  describe('NiFi Status Integration', () => {
    const { useNifiStatus } = require('../../src/hooks/useNifiStatus');

    beforeEach(() => {
      mockPathname = '/';
    });

    it('renders NiFi status values for activeThreads', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <Footer />
        </MemoryRouter>
      );
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('renders NiFi status values for queuedBytes', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <Footer />
        </MemoryRouter>
      );
      expect(screen.getByText('5/100 bytes')).toBeInTheDocument();
    });

    it('renders NiFi status values for startCount and stopCount', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <Footer />
        </MemoryRouter>
      );
      
      // Find buttons by their keys
      const startCountButton = container.querySelector('button[key="startCount"]') || 
                              Array.from(container.querySelectorAll('button')).find(btn => 
                                btn.innerHTML.includes('/icons/start.svg'));
      
      const stopCountButton = container.querySelector('button[key="stopCount"]') || 
                             Array.from(container.querySelectorAll('button')).find(btn => 
                               btn.innerHTML.includes('/icons/stop.svg'));
      
      expect(startCountButton).toBeTruthy();
      expect(stopCountButton).toBeTruthy();
      
      // Verify the text content
      expect(screen.getByText('8')).toBeInTheDocument(); // startCount
      const stopCountValues = screen.getAllByText('2');
      expect(stopCountValues.length).toBeGreaterThan(0);
    });

    it('renders NiFi status values for all queuedItems', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <Footer />
        </MemoryRouter>
      );
      expect(screen.getByText('3')).toBeInTheDocument(); // queuedItems1
      const queuedItems2Values = screen.getAllByText('1');
      expect(queuedItems2Values.length).toBeGreaterThan(0);
      expect(screen.getAllByText('0').length).toBeGreaterThan(0); // multiple items with value '0'
      expect(screen.getByText('4')).toBeInTheDocument(); // queuedItems5
      expect(screen.getAllByText('2').length).toBeGreaterThan(0); // queuedItems6 and stopCount
    });

    it('calls useNifiStatus with the correct polling interval', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <Footer />
        </MemoryRouter>
      );
      expect(useNifiStatus).toHaveBeenCalledWith(10000);
    });

    it('uses default value for unknown NiFi status keys', () => {
      // Add a footer item with an unknown NiFi status key
      footerData.unknown = [{ key: 'unknownKey', text: 'Unknown', icon: '/icons/unknown.svg' }];
      mockPathname = '/unknown';
      
      const { getFormattedValue } = useNifiStatus();
      // Before rendering, confirm mock will return '0' for unknown key
      expect(getFormattedValue('unknownKey')).toBe('0');
      
      render(
        <MemoryRouter initialEntries={['/unknown']}>
          <Footer />
        </MemoryRouter>
      );
      
      // Should use the text from config for unknown keys
      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });
  });
});
