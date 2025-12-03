import React from "react";
import { render } from "@testing-library/react";
import { tableHeaderConfig } from "../../src/config/tableHeaderConfig";

// filepath: d:/Enplan/EnPlan-2.O_React_FE/enplan-front-end-react/common-app/tests/config/tableHeaderConfig.test.tsx

describe("tableHeaderConfig", () => {
    it("should export an object", () => {
        expect(typeof tableHeaderConfig).toBe("object");
    });

    it("should have all main menu keys", () => {
        const keys = [
            "filterLock",
            "searchBar",
            "font",
            "alignment",
            "color",
            "numberFormat",
            "scale",
            "sort",
            "freeze",
            "formatMenu",
            "transpose",
            "importExport",
            "pivotMenu",
        ];
        keys.forEach((key) => {
            expect(tableHeaderConfig).toHaveProperty(key);
        });
    });

    describe("filterLock", () => {
        it("should have filter and lock configs", () => {
            expect(tableHeaderConfig.filterLock).toHaveProperty("filter");
            expect(tableHeaderConfig.filterLock).toHaveProperty("lock");
            expect(tableHeaderConfig.filterLock.filter).toMatchObject({
                label: "Filter",
                tooltip: "Filter",
            });
            expect(tableHeaderConfig.filterLock.lock).toHaveProperty("tooltip");
            expect(tableHeaderConfig.filterLock.lock.locked).toHaveProperty("icon");
            expect(tableHeaderConfig.filterLock.lock.unlocked).toHaveProperty("icon");
        });
    });

    describe("searchBar", () => {
        it("should have icon, searchIcon, label, tooltip", () => {
            expect(tableHeaderConfig.searchBar).toHaveProperty("icon");
            expect(tableHeaderConfig.searchBar).toHaveProperty("searchIcon");
            expect(tableHeaderConfig.searchBar.label).toBe("Search");
            expect(tableHeaderConfig.searchBar.tooltip).toBe("Search By");
        });

        it("should render icon as React element", () => {
            const { container } = render(tableHeaderConfig.searchBar.icon as React.ReactElement);
            expect(container.querySelector("span")).toBeInTheDocument();
        });
    });

    describe("font", () => {
        it("should have icon, label, tooltip, expanded", () => {
            expect(tableHeaderConfig.font.icon).toBeTruthy();
            expect(tableHeaderConfig.font.label).toBe("Font");
            expect(tableHeaderConfig.font.tooltip).toBe("Fonts");
            expect(tableHeaderConfig.font.expanded).toBeTruthy();
        });

        it("should have fontOptions and fontSizeOptions", () => {
            const expanded = tableHeaderConfig.font.expanded;
            expect(Array.isArray(expanded.fontOptions)).toBe(true);
            expect(Array.isArray(expanded.fontSizeOptions)).toBe(true);
        });

        it("should have formatting menu items", () => {
            const formatting = tableHeaderConfig.font.expanded.formatting;
            expect(Array.isArray(formatting)).toBe(true);
            expect(formatting[0]).toHaveProperty("key");
            expect(formatting[0]).toHaveProperty("icon");
        });
    });

    describe("alignment", () => {
        it("should have expanded array with alignment options", () => {
            const expanded = tableHeaderConfig.alignment.expanded;
            expect(Array.isArray(expanded)).toBe(true);
            expect(expanded.some((item) => item.key === "left")).toBe(true);
            expect(expanded.some((item) => item.key === "center")).toBe(true);
            expect(expanded.some((item) => item.key === "right")).toBe(true);
            expect(expanded.some((item) => item.key === "justify")).toBe(true);
        });
    });

    describe("color", () => {
        it("should have expanded array with textColor and fillColor", () => {
            const expanded = tableHeaderConfig.color.expanded;
            expect(expanded.find((item) => item.key === "textColor")).toBeTruthy();
            expect(expanded.find((item) => item.key === "fillColor")).toBeTruthy();
        });
    });

    describe("numberFormat", () => {
        it("should have expanded array with increaseDecimal, decreaseDecimal, comma", () => {
            const expanded = tableHeaderConfig.numberFormat.expanded;
            expect(expanded.find((item) => item.key === "increaseDecimal")).toBeTruthy();
            expect(expanded.find((item) => item.key === "decreaseDecimal")).toBeTruthy();
            expect(expanded.find((item) => item.key === "comma")).toBeTruthy();
            expect(expanded.find((item) => item.key === "comma")?.dividerBefore).toBe(true);
        });
    });

    describe("scale", () => {
        it("should have icon.default and icon.selected", () => {
            expect(tableHeaderConfig.scale.icon.default).toBeTruthy();
            expect(tableHeaderConfig.scale.icon.selected).toBeTruthy();
        });

        it("should have expanded items for thousand, million, billion, trillion", () => {
            const expanded = tableHeaderConfig.scale.expanded;
            ["thousand", "million", "billion", "trillion"].forEach((key) => {
                expect(expanded.find((item: any) => item.key === key)).toBeTruthy();
            });
        });
    });

    describe("sort", () => {
        it("should have icon.default and icon.selected", () => {
            expect(tableHeaderConfig.sort.icon.default).toBeTruthy();
            expect(tableHeaderConfig.sort.icon.selected).toBeTruthy();
        });

        it("should have expanded items for asc, desc, none, remove", () => {
            const expanded = tableHeaderConfig.sort.expanded;
            ["asc", "desc", "sortby", "remove"].forEach((key) => {
                expect(expanded.find((item: any) => item.key === key)).toBeTruthy();
            });
        });
    });

    describe("freeze", () => {
        it("should have icon.default and icon.selected", () => {
            expect(tableHeaderConfig.freeze.icon.default).toBeTruthy();
            expect(tableHeaderConfig.freeze.icon.selected).toBeTruthy();
        });

        it("should have expanded items for freezeRow, freezeCol, freezePanes", () => {
            const expanded = tableHeaderConfig.freeze.expanded;
            ["freezeRow", "freezeCol", "freezePanes"].forEach((key) => {
                expect(expanded.find((item: any) => item.key === key)).toBeTruthy();
            });
        });
    });

    describe("formatMenu", () => {
        it("should have icon.default and icon.selected", () => {
            expect(tableHeaderConfig.formatMenu.icon.default).toBeTruthy();
            expect(tableHeaderConfig.formatMenu.icon.selected).toBeTruthy();
        });

        it("should have expanded items for highlight, topbottom, databars, colorscales, newrule, clearrules, managerules", () => {
            const expanded = tableHeaderConfig.formatMenu.expanded;
            [
                "highlight",
                "topbottom",
                "databars",
                "colorscales",
                "newrule",
                "clearrules",
                "managerules",
            ].forEach((key) => {
                expect(expanded.find((item: any) => item.key === key)).toBeTruthy();
            });
        });
    });

    describe("transpose", () => {
        it("should have icon.default and icon.selected", () => {
            expect(tableHeaderConfig.transpose.icon.default).toBeTruthy();
            expect(tableHeaderConfig.transpose.icon.selected).toBeTruthy();
        });

        it("should have expanded item for switch", () => {
            const expanded = tableHeaderConfig.transpose.expanded;
            expect(expanded.find((item: any) => item.key === "switch")).toBeTruthy();
        });
    });

    describe("importExport", () => {
        it("should have icon, label, tooltip, expanded", () => {
            expect(tableHeaderConfig.importExport.icon).toBeTruthy();
            expect(tableHeaderConfig.importExport.label).toBe("Import/Export");
            expect(tableHeaderConfig.importExport.tooltip).toBe("Import / Export");
            expect(Array.isArray(tableHeaderConfig.importExport.expanded)).toBe(true);
        });

        it("should have expanded items for upload, download, share, run", () => {
            const expanded = tableHeaderConfig.importExport.expanded;
            ["upload", "download", "share", "run"].forEach((key) => {
                expect(expanded.find((item: any) => item.key === key)).toBeTruthy();
            });
        });
    });

    describe("pivotMenu", () => {
        it("should have icon.default and icon.selected", () => {
            expect(tableHeaderConfig.pivotMenu.icon.default).toBeTruthy();
            expect(tableHeaderConfig.pivotMenu.icon.selected).toBeTruthy();
        });

        it("should have expanded items for subtotals, grandTotals, fieldList", () => {
            const expanded = tableHeaderConfig.pivotMenu.expanded;
            ["subtotals", "grandTotals", "fieldList"].forEach((key) => {
                expect(expanded.find((item: any) => item.key === key)).toBeTruthy();
            });
            expect(expanded.find((item: any) => item.key === "grandTotals")?.dividerAfter).toBe(true);
        });
    });
});