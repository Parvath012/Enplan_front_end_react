import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  extractDescription,
  createHighlightedText,
  createListIconLine,
  ListIcon,
  getCommonCellStyle,
  getCommonColumnDef,
  createIconWithTooltip,
  generateTags,
  getDefaultColDef,
  getRowHeight,
  hasValidDescription,
  normalizeId
} from '../../../src/components/common/browserUtils';

describe('browserUtils', () => {
  describe('extractDescription', () => {
    it('should extract description from description field', () => {
      const serviceType = { description: 'Test Description' };
      expect(extractDescription(serviceType)).toBe('Test Description');
    });

    it('should extract description from descriptionDetail field', () => {
      const serviceType = { descriptionDetail: 'Test Description Detail' };
      expect(extractDescription(serviceType)).toBe('Test Description Detail');
    });

    it('should extract description from documentation field', () => {
      const serviceType = { documentation: 'Test Documentation' };
      expect(extractDescription(serviceType)).toBe('Test Documentation');
    });

    it('should extract description from documentationDetail field', () => {
      const serviceType = { documentationDetail: 'Test Documentation Detail' };
      expect(extractDescription(serviceType)).toBe('Test Documentation Detail');
    });

    it('should extract description from description.text field', () => {
      const serviceType = { description: { text: 'Test Description Text' } };
      expect(extractDescription(serviceType)).toBe('Test Description Text');
    });

    it('should return empty string when no description is available', () => {
      const serviceType = {};
      expect(extractDescription(serviceType)).toBe('');
    });

    it('should trim whitespace from description', () => {
      const serviceType = { description: '  Test Description  ' };
      expect(extractDescription(serviceType)).toBe('Test Description');
    });

    it('should prioritize description over other fields', () => {
      const serviceType = {
        description: 'Primary Description',
        descriptionDetail: 'Secondary Description',
        documentation: 'Tertiary Documentation'
      };
      expect(extractDescription(serviceType)).toBe('Primary Description');
    });
  });

  describe('createHighlightedText', () => {
    it('should return text as-is when search term is empty', () => {
      const result = createHighlightedText('Test Text', '');
      expect(result).toBe('Test Text');
    });

    it('should return text as-is when search term is whitespace only', () => {
      const result = createHighlightedText('Test Text', '   ');
      expect(result).toBe('Test Text');
    });

    it('should return text as-is when text is null', () => {
      const result = createHighlightedText(null as any, 'test');
      expect(result).toBeNull();
    });

    it('should highlight matching text (case insensitive)', () => {
      const result = createHighlightedText('Test Text', 'test');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should escape special regex characters', () => {
      const specialChars = '.*+?^${}()|[\\';
      const result = createHighlightedText('Test .*+?^${}()|[\\ Text', specialChars);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle multiple matches', () => {
      const result = createHighlightedText('Test Test Text', 'test');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(1);
    });

    it('should handle partial matches', () => {
      const result = createHighlightedText('Testing Text', 'test');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('createListIconLine', () => {
    it('should create a line element with correct attributes', () => {
      const line = createListIconLine(5, 'test-key');
      expect(line).toBeDefined();
      expect(line.key).toBe('test-key');
    });
  });

  describe('ListIcon', () => {
    it('should render without errors', () => {
      const { container } = render(<ListIcon />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should have correct SVG attributes', () => {
      const { container } = render(<ListIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '16');
      expect(svg).toHaveAttribute('height', '16');
      expect(svg).toHaveAttribute('viewBox', '0 0 16 16');
    });
  });

  describe('getCommonCellStyle', () => {
    it('should return base cell style with display flex and alignItems center', () => {
      const style = getCommonCellStyle();
      expect(style).toEqual({
        display: 'flex',
        alignItems: 'center'
      });
    });

    it('should merge additional styles', () => {
      const additionalStyles = { padding: '10px', margin: '5px' };
      const style = getCommonCellStyle(additionalStyles);
      expect(style).toEqual({
        display: 'flex',
        alignItems: 'center',
        padding: '10px',
        margin: '5px'
      });
    });

    it('should override base styles with additional styles', () => {
      const additionalStyles = { display: 'block' };
      const style = getCommonCellStyle(additionalStyles);
      expect(style.display).toBe('block');
    });
  });

  describe('getCommonColumnDef', () => {
    it('should return column definition with required fields', () => {
      const colDef = getCommonColumnDef('type', 'Type', 30);
      expect(colDef).toMatchObject({
        field: 'type',
        headerName: 'Type',
        flex: 30,
        sortable: true,
        filter: false,
        resizable: true
      });
    });

    it('should include additional properties', () => {
      const additionalProps = { cellStyle: { color: 'red' } };
      const colDef = getCommonColumnDef('type', 'Type', 30, additionalProps);
      expect(colDef.cellStyle).toEqual({ color: 'red' });
    });

    it('should have correct default header and cell classes', () => {
      const colDef = getCommonColumnDef('type', 'Type', 30);
      expect(colDef.headerClass).toBe('ag-header-cell-custom');
      expect(colDef.cellClass).toBe('ag-cell-custom');
    });
  });

  describe('createIconWithTooltip', () => {
    it('should create icon wrapper with tooltip', () => {
      const icon = React.createElement('div', { 'data-testid': 'test-icon' }, 'Icon');
      const result = createIconWithTooltip(icon, 'Test Tooltip');
      expect(result).toBeDefined();
    });
  });

  describe('generateTags', () => {
    it('should return provided tags when available', () => {
      const serviceType = { tags: ['tag1', 'tag2', 'tag3'] };
      const tags = generateTags(serviceType, 'TestType', {});
      expect(tags).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('should generate tags from type name when tags are not provided', () => {
      const serviceType = {};
      const tags = generateTags(serviceType, 'DBCPConnectionPool', {});
      expect(tags.length).toBeGreaterThan(0);
    });

    it('should include artifact in tags when bundle is provided', () => {
      const serviceType = {};
      const bundle = { artifact: 'nifi-dbcp-service-nar' };
      const tags = generateTags(serviceType, 'TestType', bundle);
      expect(tags.some(tag => tag.includes('dbcp'))).toBe(true);
    });

    it('should filter out short words', () => {
      const serviceType = {};
      const tags = generateTags(serviceType, 'AB', {});
      expect(tags.every(tag => tag.length > 2)).toBe(true);
    });

    it('should limit tags to 10', () => {
      const serviceType = { tags: Array(20).fill('tag').map((t, i) => `${t}${i}`) };
      const tags = generateTags(serviceType, 'TestType', {});
      expect(tags.length).toBeLessThanOrEqual(10);
    });

    it('should remove duplicates', () => {
      const serviceType = { tags: ['tag1', 'tag1', 'tag2'] };
      const tags = generateTags(serviceType, 'TestType', {});
      const uniqueTags = Array.from(new Set(tags));
      expect(tags.length).toBe(uniqueTags.length);
    });
  });

  describe('getDefaultColDef', () => {
    it('should return default column definition', () => {
      const colDef = getDefaultColDef();
      expect(colDef).toMatchObject({
        suppressHeaderClickSorting: false,
        sortable: true,
        filter: true,
        resizable: true
      });
    });

    it('should have correct header class', () => {
      const colDef = getDefaultColDef();
      expect(colDef.headerClass).toBe('ag-header-cell-custom');
    });

    it('should have correct sorting order', () => {
      const colDef = getDefaultColDef();
      expect(colDef.sortingOrder).toEqual(['asc', 'desc', null]);
    });
  });

  describe('getRowHeight', () => {
    it('should return base height for empty tags', () => {
      const params = { data: { tags: [] } };
      const height = getRowHeight(params);
      expect(height).toBeGreaterThanOrEqual(32);
    });

    it('should calculate height based on tags length', () => {
      const params = { data: { tags: Array(10).fill('tag') } };
      const height = getRowHeight(params);
      expect(height).toBeGreaterThan(32);
    });

    it('should handle missing tags', () => {
      const params = { data: {} };
      const height = getRowHeight(params);
      expect(height).toBeGreaterThanOrEqual(32);
    });

    it('should handle null data', () => {
      const params = { data: null };
      const height = getRowHeight(params);
      expect(height).toBeGreaterThanOrEqual(32);
    });

    it('should calculate correct height for long tags', () => {
      const longTags = Array(5).fill('very long tag name that should wrap');
      const params = { data: { tags: longTags } };
      const height = getRowHeight(params);
      expect(height).toBeGreaterThan(32);
    });
  });

  describe('hasValidDescription', () => {
    it('should return true for service with valid description', () => {
      const service = { description: 'Valid description' };
      expect(hasValidDescription(service)).toBe(true);
    });

    it('should return false for service with empty description', () => {
      const service = { description: '' };
      expect(hasValidDescription(service)).toBe(false);
    });

    it('should return false for service with whitespace-only description', () => {
      const service = { description: '   ' };
      expect(hasValidDescription(service)).toBe(false);
    });

    it('should return false for null service', () => {
      expect(hasValidDescription(null)).toBe(false);
    });

    it('should return false for service without description', () => {
      const service = {};
      expect(hasValidDescription(service)).toBe(false);
    });

    it('should return false for service with non-string description', () => {
      const service = { description: { text: 'test' } };
      expect(hasValidDescription(service)).toBe(false);
    });
  });

  describe('normalizeId', () => {
    it('should normalize string ID to lowercase', () => {
      expect(normalizeId('TEST-ID')).toBe('test-id');
    });

    it('should trim whitespace', () => {
      expect(normalizeId('  test-id  ')).toBe('test-id');
    });

    it('should convert number to string', () => {
      expect(normalizeId(123)).toBe('123');
    });

    it('should return empty string for null', () => {
      expect(normalizeId(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(normalizeId(undefined)).toBe('');
    });

    it('should return empty string for empty string', () => {
      expect(normalizeId('')).toBe('');
    });

    it('should handle mixed case', () => {
      expect(normalizeId('Test-ID-123')).toBe('test-id-123');
    });
  });
});

