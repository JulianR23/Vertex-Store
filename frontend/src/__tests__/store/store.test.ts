import { store } from "../../store/store";

describe("Redux store", () => {
  it("should be created with auth slice", () => {
    const state = store.getState();
    expect(state).toHaveProperty("auth");
    expect(state.auth).toHaveProperty("isAuthenticated");
    expect(state.auth).toHaveProperty("accessToken");
    expect(state.auth).toHaveProperty("customer");
  });

  it("should be created with checkout slice", () => {
    const state = store.getState();
    expect(state).toHaveProperty("checkout");
    expect(state.checkout).toHaveProperty("selectedProduct");
    expect(state.checkout).toHaveProperty("card");
    expect(state.checkout).toHaveProperty("delivery");
    expect(state.checkout).toHaveProperty("transaction");
    expect(state.checkout).toHaveProperty("currentStep");
  });

  it("should be created with API slice", () => {
    const state = store.getState();
    expect(state).toHaveProperty("api");
  });

  it("should have correct initial auth state", () => {
    const state = store.getState();
    expect(state.auth.isAuthenticated).toBe(false);
    expect(state.auth.accessToken).toBeNull();
    expect(state.auth.customer).toBeNull();
  });
});
