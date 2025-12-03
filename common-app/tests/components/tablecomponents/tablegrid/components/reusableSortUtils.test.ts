import {
  getSortAscModel,
  getSortDescModel,
  getClearSortModel,
  preprocessRows,
  getComparator,
  applyMultiColumnSort
} from '../../../../../src/components/tablecomponents/tablegrid/components/reusableSortUtils';
import { SortType, SortModel } from '../../../../../src/components/tablecomponents/tablegrid/types';

describe('reusableSortUtils', () => {
  const sortTypeAlphanumeric: SortType = 'alphanumeric';
  const sortTypeNumeric: SortType = 'numeric';
  const sortTypeDate: SortType = 'date';
  const sortTypeFill: SortType = 'fillColor';
  const sortTypeFont: SortType = 'fontColor';

  describe('getSortAscModel', () => {
    it('adds ascending sort for field', () => {
      const model: SortModel[] = [{ field: 'a', sort: 'desc', type: sortTypeAlphanumeric, priority: 1 }];
      const result = getSortAscModel(model, 'b', sortTypeNumeric);
      expect(result).toEqual([
        { field: 'a', sort: 'desc', type: sortTypeAlphanumeric, priority: 1 },
        { field: 'b', sort: 'asc', type: sortTypeNumeric, priority: 2 }
      ]);
    });
    it('replaces sort for field', () => {
      const model: SortModel[] = [{ field: 'a', sort: 'desc', type: sortTypeAlphanumeric, priority: 1 }];
      const result = getSortAscModel(model, 'a', sortTypeNumeric);
      expect(result).toEqual([{ field: 'a', sort: 'asc', type: sortTypeNumeric, priority: 1 }]);
    });
  });

  describe('getSortDescModel', () => {
    it('adds descending sort for field', () => {
      const model: SortModel[] = [{ field: 'a', sort: 'asc', type: sortTypeAlphanumeric, priority: 1 }];
      const result = getSortDescModel(model, 'b', sortTypeNumeric);
      expect(result).toEqual([
        { field: 'a', sort: 'asc', type: sortTypeAlphanumeric, priority: 1 },
        { field: 'b', sort: 'desc', type: sortTypeNumeric, priority: 2 }
      ]);
    });
    it('replaces sort for field', () => {
      const model: SortModel[] = [{ field: 'a', sort: 'asc', type: sortTypeAlphanumeric, priority: 1 }];
      const result = getSortDescModel(model, 'a', sortTypeNumeric);
      expect(result).toEqual([{ field: 'a', sort: 'desc', type: sortTypeNumeric, priority: 1 }]);
    });
  });

  describe('getClearSortModel', () => {
    it('removes field from sort model', () => {
      const model: SortModel[] = [
        { field: 'a', sort: 'asc', type: sortTypeAlphanumeric, priority: 1 },
        { field: 'b', sort: 'desc', type: sortTypeNumeric, priority: 2 }
      ];
      expect(getClearSortModel(model, 'a')).toEqual([
        { field: 'b', sort: 'desc', type: sortTypeNumeric, priority: 2 }
      ]);
    });
    it('returns same array if field not present', () => {
      const model: SortModel[] = [
        { field: 'a', sort: 'asc', type: sortTypeAlphanumeric, priority: 1 }
      ];
      expect(getClearSortModel(model, 'b')).toEqual(model);
    });
  });

  describe('preprocessRows', () => {
    it('adds color fields from formattingConfig', () => {
      const rows = [{ id: 1, name: 'A' }];
      const formattingConfig = { '1:name': { fillColor: 'red', textColor: 'blue' } };
      const result = preprocessRows(rows, formattingConfig);
      expect(result[0]).toMatchObject({ __bgColor_name: 'red', __fontColor_name: 'blue' });
    });
    it('returns original rows if no formattingConfig', () => {
      const rows = [{ id: 1, name: 'A' }];
      expect(preprocessRows(rows, {})).toEqual(rows);
    });
  });

  describe('preprocessRows edge cases', () => {
    it('handles missing formatting for cell', () => {
      const rows = [{ id: 1, name: 'A' }];
      const formattingConfig = { '1:name': {} };
      const result = preprocessRows(rows, formattingConfig);
      expect(result[0]).not.toHaveProperty('__bgColor_name');
      expect(result[0]).not.toHaveProperty('__fontColor_name');
    });
    it('handles formattingConfig as null', () => {
      const rows = [{ id: 1, name: 'A' }];
      // @ts-expect-error test null
      const result = preprocessRows(rows, null);
      expect(result).toEqual(rows);
    });
  });

  describe('getComparator', () => {
    it('numeric asc/desc', () => {
      const cmpAsc = getComparator('numeric', 'asc', 'val');
      const cmpDesc = getComparator('numeric', 'desc', 'val');
      expect(cmpAsc({ val: 1 }, { val: 2 })).toBeLessThan(0);
      expect(cmpDesc({ val: 1 }, { val: 2 })).toBeGreaterThan(0);
    });
    it('date asc/desc', () => {
      const cmpAsc = getComparator('date', 'asc', 'date');
      const cmpDesc = getComparator('date', 'desc', 'date');
      expect(cmpAsc({ date: '2020-01-01' }, { date: '2021-01-01' })).toBeLessThan(0);
      expect(cmpDesc({ date: '2020-01-01' }, { date: '2021-01-01' })).toBeGreaterThan(0);
    });
    it('fillColor/fontColor asc/desc', () => {
      const cmpFillAsc = getComparator('fillColor', 'asc', 'field');
      const cmpFillDesc = getComparator('fillColor', 'desc', 'field');
      const cmpFontAsc = getComparator('fontColor', 'asc', 'field');
      const cmpFontDesc = getComparator('fontColor', 'desc', 'field');
      expect(cmpFillAsc({ __bgColor_field: 'a' }, { __bgColor_field: 'b' })).toBeLessThan(0);
      expect(cmpFillDesc({ __bgColor_field: 'a' }, { __bgColor_field: 'b' })).toBeGreaterThan(0);
      expect(cmpFontAsc({ __fontColor_field: 'a' }, { __fontColor_field: 'b' })).toBeLessThan(0);
      expect(cmpFontDesc({ __fontColor_field: 'a' }, { __fontColor_field: 'b' })).toBeGreaterThan(0);
    });
    it('alphanumeric asc/desc', () => {
      const cmpAsc = getComparator('alphanumeric', 'asc', 'field');
      const cmpDesc = getComparator('alphanumeric', 'desc', 'field');
      expect(cmpAsc({ field: 'a' }, { field: 'b' })).toBeLessThan(0);
      expect(cmpDesc({ field: 'a' }, { field: 'b' })).toBeGreaterThan(0);
    });
    it('alphanumeric handles undefined/null', () => {
      const cmpAsc = getComparator('alphanumeric', 'asc', 'field');
      expect(cmpAsc({ field: undefined }, { field: undefined })).toBe(0);
      expect(cmpAsc({ field: undefined }, { field: 'a' })).toBe(1);
      expect(cmpAsc({ field: 'a' }, { field: undefined })).toBe(-1);
    });
    it('alphanumeric handles object values', () => {
      const cmpAsc = getComparator('alphanumeric', 'asc', 'field');
      expect(cmpAsc({ field: 'a' }, { field: 'b' })).toBeLessThan(0);
      expect(cmpAsc({ field: { value: 'a' } }, { field: { value: 'b' } })).toBeLessThan(0);
      expect(cmpAsc({ field: { label: 'a' } }, { field: { label: 'b' } })).toBeLessThan(0);
      expect(cmpAsc({ field: { other: 'a' } }, { field: { other: 'b' } })).toBe(0);
    });
  });

  describe('getComparator edge cases', () => {
    it('alphanumeric: field is object without value/label', () => {
      const cmpAsc = getComparator('alphanumeric', 'asc', 'field');
      // Both objects lack value/label, so both become '' and compare as equal
      expect(cmpAsc({ field: { foo: 'bar' } }, { field: { bar: 'baz' } })).toBe(0);
      // One object lacks value/label, the other is a string
      expect(cmpAsc({ field: { foo: 'bar' } }, { field: 'a' })).toBeLessThan(0);
      expect(cmpAsc({ field: 'a' }, { field: { foo: 'bar' } })).toBeGreaterThan(0);
    });
    it('alphanumeric: object without field/value/label', () => {
      const cmpAsc = getComparator('alphanumeric', 'asc', 'field');
      expect(cmpAsc({ other: 'x' }, { other: 'y' })).toBe(0);
    });
    it('alphanumeric: field is object', () => {
      const cmpAsc = getComparator('alphanumeric', 'asc', 'field');
      expect(cmpAsc({ field: { value: 'a' } }, { field: { value: 'b' } })).toBeLessThan(0);
    });
    it('alphanumeric: field is null', () => {
      const cmpAsc = getComparator('alphanumeric', 'asc', 'field');
      expect(cmpAsc({ field: null }, { field: 'a' })).toBeGreaterThan(0);
      expect(cmpAsc({ field: 'a' }, { field: null })).toBeLessThan(0);
    });
  });

  describe('applyMultiColumnSort', () => {
    it('sorts by multiple columns', () => {
      const rows = [
        { a: 1, b: 'x' },
        { a: 2, b: 'y' },
        { a: 1, b: 'y' }
      ];
      const sortLevels = [
        { sortBy: 'a', sortOn: 'numeric', order: 'asc' as 'asc' },
        { sortBy: 'b', sortOn: 'alphanumeric', order: 'desc' as 'desc' }
      ];
      const sorted = applyMultiColumnSort(rows, sortLevels);
      expect(sorted).toEqual([
        { a: 1, b: 'y' },
        { a: 1, b: 'x' },
        { a: 2, b: 'y' }
      ]);
    });
    it('returns original rows if no sortLevels', () => {
      const rows = [{ a: 1 }, { a: 2 }];
      expect(applyMultiColumnSort(rows, [])).toEqual(rows);
    });
  });

  describe('applyMultiColumnSort edge cases', () => {
    it('returns 0 if all comparators return 0', () => {
      const rows = [{ a: 1 }, { a: 1 }];
      const sortLevels = [
        { sortBy: 'a', sortOn: 'numeric', order: 'asc' as 'asc' }
      ];
      const sorted = applyMultiColumnSort(rows, sortLevels);
      expect(sorted).toEqual(rows);
    });
  });
});
