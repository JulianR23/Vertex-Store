import {
  authSlice,
  setCredentials,
  clearCredentials,
  selectAuth,
  selectIsAuthenticated,
  selectCustomer,
} from "../../../store/slices/auth.slice";

const { reducer } = authSlice;

const mockCustomer = {
  id: "cust-1",
  fullName: "John Doe",
  email: "john@example.com",
  phoneNumber: "+57300123456",
  documentNumber: "1234567890",
};

describe("auth slice", () => {
  const initialState = {
    accessToken: null,
    customer: null,
    isAuthenticated: false,
  };

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe("setCredentials", () => {
    it("should set access token, customer and mark as authenticated", () => {
      const state = reducer(
        initialState,
        setCredentials({ accessToken: "token-123", customer: mockCustomer }),
      );

      expect(state.accessToken).toBe("token-123");
      expect(state.customer).toEqual(mockCustomer);
      expect(state.isAuthenticated).toBe(true);
    });

    it("should persist credentials to localStorage", () => {
      reducer(
        initialState,
        setCredentials({ accessToken: "token-123", customer: mockCustomer }),
      );

      expect(localStorage.setItem).toHaveBeenCalledWith(
        "accessToken",
        "token-123",
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "customer",
        JSON.stringify(mockCustomer),
      );
    });
  });

  describe("clearCredentials", () => {
    it("should clear all auth state", () => {
      const authenticatedState = {
        accessToken: "token-123",
        customer: mockCustomer,
        isAuthenticated: true,
      };

      const state = reducer(authenticatedState, clearCredentials());

      expect(state.accessToken).toBeNull();
      expect(state.customer).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it("should remove credentials from localStorage", () => {
      const authenticatedState = {
        accessToken: "token-123",
        customer: mockCustomer,
        isAuthenticated: true,
      };

      reducer(authenticatedState, clearCredentials());

      expect(localStorage.removeItem).toHaveBeenCalledWith("accessToken");
      expect(localStorage.removeItem).toHaveBeenCalledWith("customer");
    });
  });

  describe("selectors", () => {
    const rootState = {
      auth: {
        accessToken: "token-123",
        customer: mockCustomer,
        isAuthenticated: true,
      },
    } as any;

    it("selectAuth should return auth state", () => {
      expect(selectAuth(rootState)).toEqual(rootState.auth);
    });

    it("selectIsAuthenticated should return isAuthenticated", () => {
      expect(selectIsAuthenticated(rootState)).toBe(true);
    });

    it("selectCustomer should return customer", () => {
      expect(selectCustomer(rootState)).toEqual(mockCustomer);
    });

    it("selectIsAuthenticated should return false when not authenticated", () => {
      const unauthState = {
        auth: { ...rootState.auth, isAuthenticated: false },
      } as any;
      expect(selectIsAuthenticated(unauthState)).toBe(false);
    });

    it("selectCustomer should return null when no customer", () => {
      const noCustomerState = {
        auth: { ...rootState.auth, customer: null },
      } as any;
      expect(selectCustomer(noCustomerState)).toBeNull();
    });
  });
});
