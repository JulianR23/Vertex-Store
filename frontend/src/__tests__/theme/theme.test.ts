import theme from "../../theme/theme";

describe("theme", () => {
  it("should export a valid MUI theme object", () => {
    expect(theme).toBeDefined();
    expect(theme.palette).toBeDefined();
    expect(theme.typography).toBeDefined();
    expect(theme.components).toBeDefined();
  });

  it("should have light mode palette", () => {
    expect(theme.palette.mode).toBe("light");
  });

  it("should have black primary color", () => {
    expect(theme.palette.primary.main).toBe("#000000");
  });

  it("should have the correct background colors", () => {
    expect(theme.palette.background.default).toBe("#f5f5f7");
    expect(theme.palette.background.paper).toBe("#ffffff");
  });

  it("should have border radius of 12", () => {
    expect(theme.shape.borderRadius).toBe(12);
  });

  it("should have custom component styles", () => {
    expect(theme.components?.MuiButton).toBeDefined();
    expect(theme.components?.MuiCard).toBeDefined();
    expect(theme.components?.MuiTextField).toBeDefined();
    expect(theme.components?.MuiDialog).toBeDefined();
    expect(theme.components?.MuiAppBar).toBeDefined();
  });

  it("should have sans-serif font family", () => {
    expect(theme.typography.fontFamily).toContain("sans-serif");
  });

  it("should have custom error and success colors", () => {
    expect(theme.palette.error.main).toBe("#ff3b30");
    expect(theme.palette.success.main).toBe("#34c759");
  });
});
