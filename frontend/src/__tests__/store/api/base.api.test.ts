import { baseApi } from "../../../store/api/base.api";

describe("Base API", () => {
  it("should have the correct reducer path", () => {
    expect(baseApi.reducerPath).toBe("api");
  });

  it("should export a valid API object", () => {
    expect(baseApi).toBeDefined();
    expect(baseApi.reducer).toBeDefined();
    expect(baseApi.middleware).toBeDefined();
  });

  it("should have the correct configuration", () => {
    expect(baseApi.reducerPath).toBe("api");
  });
});
