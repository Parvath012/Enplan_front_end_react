import React from "react";
import { render, fireEvent } from "@testing-library/react";
import GenericFormatSelector from "../../../../../src/components/tablecomponents/tableheader/components/GenericFormatSelector";

const mockConfig = {
  tooltip: "Test Tooltip",
  expanded: [
    { key: "a", label: "A", tooltip: "A" },
    { key: "b", label: "B", tooltip: "B" },
  ],
};
const mockOptions = [
  { key: "a", label: "A", tooltip: "A" },
  { key: "b", label: "B", tooltip: "B" },
];

describe("GenericFormatSelector", () => {
  it("renders without crashing", () => {
    const { container } = render(
      <GenericFormatSelector
        expanded={false}
        onExpand={jest.fn()}
        config={mockConfig}
        options={mockOptions}
        selectedValue=""
        onChange={jest.fn()}
        icon={<span>icon</span>}
      />
    );
    expect(container.querySelector(".font-selector-root")).toBeInTheDocument();
  });

  it("renders expanded options when expanded", () => {
    const { container } = render(
      <GenericFormatSelector
        expanded={true}
        onExpand={jest.fn()}
        config={mockConfig}
        options={mockOptions}
        selectedValue=""
        onChange={jest.fn()}
        icon={<span>icon</span>}
      />
    );
    expect(container.querySelector(".font-selector-divider")).toBeInTheDocument();
  });
});
