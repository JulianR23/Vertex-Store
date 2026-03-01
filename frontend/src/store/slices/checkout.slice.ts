import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

interface ProductSnapshot {
  readonly id: string;
  readonly name: string;
  readonly priceInCents: number;
  readonly imageUrl: string;
}

interface CardSnapshot {
  readonly token: string;
  readonly installments: number;
  readonly lastFour: string;
  readonly brand: string;
}

interface DeliverySnapshot {
  readonly addressLine: string;
  readonly city: string;
  readonly department: string;
  readonly postalCode: string;
}

interface TransactionSnapshot {
  readonly id: string;
  readonly reference: string;
  readonly wompiTransactionId: string | null;
  readonly status: string;
  readonly totalAmountInCents: number;
  readonly baseFeeInCents: number;
  readonly deliveryFeeInCents: number;
  readonly productAmountInCents: number;
}

interface CheckoutState {
  readonly selectedProduct: ProductSnapshot | null;
  readonly card: CardSnapshot | null;
  readonly delivery: DeliverySnapshot | null;
  readonly transaction: TransactionSnapshot | null;
  readonly currentStep: number;
}

const loadCheckoutFromStorage = (): CheckoutState => {
  try {
    const saved = localStorage.getItem("checkout");
    if (saved) {
      return JSON.parse(saved) as CheckoutState;
    }
  } catch {
    localStorage.removeItem("checkout");
  }
  return {
    selectedProduct: null,
    card: null,
    delivery: null,
    transaction: null,
    currentStep: 0,
  };
};

const saveCheckoutToStorage = (state: CheckoutState): void => {
  localStorage.setItem("checkout", JSON.stringify(state));
};

const initialState: CheckoutState = loadCheckoutFromStorage();

export const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    selectProduct: (state, action: PayloadAction<ProductSnapshot>) => {
      state.selectedProduct = action.payload;
      state.currentStep = 1;
      saveCheckoutToStorage({ ...state });
    },
    setCardAndDelivery: (
      state,
      action: PayloadAction<{ card: CardSnapshot; delivery: DeliverySnapshot }>,
    ) => {
      state.card = action.payload.card;
      state.delivery = action.payload.delivery;
      state.currentStep = 2;
      saveCheckoutToStorage({ ...state });
    },
    setTransaction: (state, action: PayloadAction<TransactionSnapshot>) => {
      state.transaction = action.payload;
      state.currentStep = 3;
      saveCheckoutToStorage({ ...state });
    },
    resetCheckout: (state) => {
      state.selectedProduct = null;
      state.card = null;
      state.delivery = null;
      state.transaction = null;
      state.currentStep = 0;
      localStorage.removeItem("checkout");
    },
  },
});

export const {
  selectProduct,
  setCardAndDelivery,
  setTransaction,
  resetCheckout,
} = checkoutSlice.actions;

export const selectCheckout = (state: RootState) => state.checkout;
export const selectSelectedProduct = (state: RootState) =>
  state.checkout.selectedProduct;
export const selectTransaction = (state: RootState) =>
  state.checkout.transaction;
export const selectCurrentStep = (state: RootState) =>
  state.checkout.currentStep;
