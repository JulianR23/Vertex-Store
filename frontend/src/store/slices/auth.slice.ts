import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

interface CustomerState {
  readonly id: string;
  readonly fullName: string;
  readonly email: string;
  readonly phoneNumber: string;
  readonly documentNumber: string;
}

interface AuthState {
  readonly accessToken: string | null;
  readonly customer: CustomerState | null;
  readonly isAuthenticated: boolean;
}

const loadFromStorage = (): AuthState => {
  try {
    const token = localStorage.getItem("accessToken");
    const customer = localStorage.getItem("customer");
    if (token && customer) {
      return {
        accessToken: token,
        customer: JSON.parse(customer) as CustomerState,
        isAuthenticated: true,
      };
    }
  } catch {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("customer");
  }
  return { accessToken: null, customer: null, isAuthenticated: false };
};

const initialState: AuthState = loadFromStorage();

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ accessToken: string; customer: CustomerState }>,
    ) => {
      state.accessToken = action.payload.accessToken;
      state.customer = action.payload.customer;
      state.isAuthenticated = true;
      localStorage.setItem("accessToken", action.payload.accessToken);
      localStorage.setItem("customer", JSON.stringify(action.payload.customer));
    },
    clearCredentials: (state) => {
      state.accessToken = null;
      state.customer = null;
      state.isAuthenticated = false;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("customer");
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export const selectAuth = (state: RootState) => state.auth;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectCustomer = (state: RootState) => state.auth.customer;
