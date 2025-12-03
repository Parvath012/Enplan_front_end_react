import { statsConfig, legendConfig } from "../../src/config/tableFooterConfig";

describe("tableFooterConfig", () => {
  it("should have correct statsConfig", () => {
    expect(statsConfig).toEqual([
      { key: 'totalRows', label: 'Total rows' },
      {key: 'Count', label: 'Count'},
      { key: 'sum', label: 'Sum' },
      { key: 'avg', label: 'Avg' },
      { key: 'min', label: 'Min' },
      { key: 'max', label: 'Max' },
    ]);
  });

  it("should have correct legendConfig", () => {
    expect(legendConfig).toEqual([
      { label: 'Error:', color: '#E23636' },
      { label: 'Warning:', color: '#EDB95E' },
      { label: 'Info:', color: '#33B5E5' },
      { label: 'Editable:', color: '#E8F1FE' },
    ]);
  });
});