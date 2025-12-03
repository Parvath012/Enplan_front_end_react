import React from 'react';
import { render, screen } from '@testing-library/react';
import NoResultsFound from '../../../src/components/common/NoResultsFound';

describe('NoResultsFound', () => {
  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      render(<NoResultsFound />);
      expect(screen.getByText('No Results Found')).toBeInTheDocument();
    });

    it('should render with default message', () => {
      render(<NoResultsFound />);
      const messageElement = screen.getByText('No Results Found');
      expect(messageElement).toBeInTheDocument();
      expect(messageElement).toHaveStyle({
        fontFamily: 'Inter Tight, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#5B6061',
        textAlign: 'center'
      });
    });

    it('should render with default height', () => {
      const { container } = render(<NoResultsFound />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '200px',
        width: '100%',
        backgroundColor: 'transparent'
      });
    });
  });

  describe('Custom Props', () => {
    it('should render with custom message', () => {
      render(<NoResultsFound message="Custom no results message" />);
      expect(screen.getByText('Custom no results message')).toBeInTheDocument();
      expect(screen.queryByText('No Results Found')).not.toBeInTheDocument();
    });

    it('should render with custom height as string', () => {
      const { container } = render(<NoResultsFound height="300px" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({
        height: '300px'
      });
    });

    it('should render with custom height as number', () => {
      const { container } = render(<NoResultsFound height={400} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({
        height: '400px'
      });
    });

    it('should render with empty message', () => {
      const { container } = render(<NoResultsFound message="" />);
      const messageDiv = container.querySelector('div[style*="text-align: center"]');
      expect(messageDiv).toBeInTheDocument();
      expect(messageDiv?.textContent).toBe('');
    });

    it('should render with zero height', () => {
      const { container } = render(<NoResultsFound height={0} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({
        height: '0px'
      });
    });
  });

  describe('Structure and Layout', () => {
    it('should have correct container structure', () => {
      const { container } = render(<NoResultsFound />);
      const wrapper = container.firstChild as HTMLElement;
      const messageDiv = wrapper.firstChild as HTMLElement;
      
      expect(wrapper.tagName).toBe('DIV');
      expect(messageDiv.tagName).toBe('DIV');
      expect(messageDiv.textContent).toBe('No Results Found');
    });

    it('should apply correct flexbox styles to container', () => {
      const { container } = render(<NoResultsFound />);
      const wrapper = container.firstChild as HTMLElement;
      
      expect(wrapper).toHaveStyle({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      });
    });

    it('should apply correct typography styles to message', () => {
      render(<NoResultsFound message="Test message" />);
      const messageElement = screen.getByText('Test message');
      
      expect(messageElement).toHaveStyle({
        fontFamily: 'Inter Tight, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#5B6061',
        textAlign: 'center'
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long message', () => {
      const longMessage = 'A'.repeat(1000);
      render(<NoResultsFound message={longMessage} />);
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('should handle special characters in message', () => {
      const specialMessage = 'No Results Found! @#$%^&*()';
      render(<NoResultsFound message={specialMessage} />);
      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });

    it('should handle negative height number', () => {
      const { container } = render(<NoResultsFound height={-100} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({
        height: '-100px'
      });
    });

    it('should handle very large height number', () => {
      const { container } = render(<NoResultsFound height={9999} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({
        height: '9999px'
      });
    });
  });
});

