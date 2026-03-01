import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./slices/auth.slice";
import { checkoutSlice } from "./slices/checkout.slice";
import { baseApi } from "./api/base.api";

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    checkout: checkoutSlice.reducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
