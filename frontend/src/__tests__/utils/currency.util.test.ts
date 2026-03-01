import { formatCOP } from "../../utils/currency.util";

describe("formatCOP", () => {
  it("should format cents to COP currency string", () => {
    const result = formatCOP(10000000);
    expect(result).toContain("100.000");
  });

  it("should format zero cents", () => {
    const result = formatCOP(0);
    expect(result).toContain("0");
  });

  it("should format small amounts", () => {
    const result = formatCOP(100);
    expect(result).toContain("1");
  });

  it("should format large amounts", () => {
    const result = formatCOP(99999900);
    expect(result).toContain("999.999");
  });

  it("should handle negative amounts", () => {
    const result = formatCOP(-50000);
    expect(result).toContain("500");
  });

  it("should not include decimal fractions", () => {
    const result = formatCOP(150);
    expect(result).not.toContain(",5");
  });
});
