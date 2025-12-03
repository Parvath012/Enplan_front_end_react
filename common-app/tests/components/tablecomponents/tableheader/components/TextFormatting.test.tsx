import React from "react";
import { render, screen } from "@testing-library/react";
import TextFormatting from "../../../../../src/components/tablecomponents/tableheader/components/TextFormatting";

// Mock tableHeaderConfig with formatting items matching the actual implementation
jest.mock(
  "../../../../../src/config/tableHeaderConfig",
  () => ({
    tableHeaderConfig: {
      font: {
        expanded: {
          formatting: [
            {
              key: "bold",
              tooltip: "Bold",
              icon: <svg data-testid="icon-bold" />,
            },
            {
              key: "italic",
              tooltip: "Italic",
              icon: <svg data-testid="icon-italic" />,
            },
            {
              key: "underline",
              tooltip: "Underline",
              icon: <svg data-testid="icon-underline" />,
            },
            {
              key: "strikethrough",
              tooltip: "Strikethrough",
              icon: <svg data-testid="icon-strikethrough" />,
            },
          ],
        },
      },
    },
  }),
  { virtual: true }
);

describe("TextFormatting", () => {
  it("renders root and divider", () => {
    const { container } = render(<TextFormatting />);
    expect(container.querySelector(".text-formatting-root")).toBeInTheDocument();
    expect(container.querySelector(".text-formatting-divider")).toBeInTheDocument();
  });

  it("renders all formatting icons with tooltips", () => {
    render(<TextFormatting />);
    // Testing library doesn't have getAllByClassName, use querySelectorAll instead
    const iconSpans = document.querySelectorAll(".text-formatting-icon");
    expect(iconSpans.length).toBe(4);

    // Check for the presence of all icons
    expect(screen.getByLabelText("Bold")).toBeInTheDocument();
    expect(screen.getByLabelText("Italic")).toBeInTheDocument();
    expect(screen.getByLabelText("Underline")).toBeInTheDocument();
    expect(screen.getByLabelText("Strikethrough")).toBeInTheDocument();
  });

  it("renders icon inside span with correct class", () => {
    render(<TextFormatting />);
    const iconSpans = Array.from(document.querySelectorAll(".text-formatting-icon"));
    expect(iconSpans.length).toBe(4);
    // Check that each icon has the correct class
    iconSpans.forEach(span => {
      expect(span).toHaveClass("text-formatting-icon");
    });
  });

  it("applies active class when activeFormatting is true for a key", () => {
    render(<TextFormatting onFormat={() => {}} activeFormatting={{ bold: true, italic: false, underline: false, strikethrough: false }} />);
    const boldButton = document.querySelector('.text-formatting-icon.active');
    expect(boldButton).toBeInTheDocument();
    expect(boldButton).toHaveAttribute('aria-label', 'Bold');
    // Other buttons should not have 'active' class
    const inactiveButtons = Array.from(document.querySelectorAll('.text-formatting-icon')).filter(btn => !btn.classList.contains('active'));
    expect(inactiveButtons.length).toBe(3);
  });
});