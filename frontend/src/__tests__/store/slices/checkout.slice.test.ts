import {
  checkoutSlice,
  selectProduct,
  setCardAndDelivery,
  setTransaction,
  resetCheckout,
  selectCheckout,
  selectSelectedProduct,
  selectTransaction,
  selectCurrentStep,
} from "../../../store/slices/checkout.slice";

const { reducer } = checkoutSlice;

const mockProduct = {
  id: "prod-1",
  name: "Test Product",
  priceInCents: 5000000,
  imageUrl: "https://example.com/img.jpg",
};

const mockCard = {
  token: "tok_test_123",
  installments: 3,
  lastFour: "1111",
  brand: "VISA",
};

const mockDelivery = {
  addressLine: "123 Main St",
  city: "Bogotá",
  department: "Cundinamarca",
  postalCode: "110111",
};

const mockTransaction = {
  id: "tx-1",
  reference: "REF-001",
  wompiTransactionId: "wompi-123",
  status: "APPROVED",
  totalAmountInCents: 10000000,
  baseFeeInCents: 3000000,
  deliveryFeeInCents: 2000000,
  productAmountInCents: 5000000,
  installments: 3,
};

describe("checkout slice", () => {
  const initialState = {
    selectedProduct: null,
    card: null,
    delivery: null,
    transaction: null,
    currentStep: 0,
  };

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe("selectProduct", () => {
    it("should set the selected product and step to 1", () => {
      const state = reducer(initialState, selectProduct(mockProduct));

      expect(state.selectedProduct).toEqual(mockProduct);
      expect(state.currentStep).toBe(1);
    });

    it("should save to localStorage", () => {
      reducer(initialState, selectProduct(mockProduct));
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "checkout",
        expect.any(String),
      );
    });
  });

  describe("setCardAndDelivery", () => {
    it("should set card and delivery and step to 2", () => {
      const state = reducer(
        { ...initialState, selectedProduct: mockProduct, currentStep: 1 },
        setCardAndDelivery({ card: mockCard, delivery: mockDelivery }),
      );

      expect(state.card).toEqual(mockCard);
      expect(state.delivery).toEqual(mockDelivery);
      expect(state.currentStep).toBe(2);
    });

    it("should save to localStorage", () => {
      reducer(
        { ...initialState, selectedProduct: mockProduct, currentStep: 1 },
        setCardAndDelivery({ card: mockCard, delivery: mockDelivery }),
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "checkout",
        expect.any(String),
      );
    });
  });

  describe("setTransaction", () => {
    it("should set transaction and step to 3", () => {
      const stateWithCard = {
        ...initialState,
        selectedProduct: mockProduct,
        card: mockCard,
        delivery: mockDelivery,
        currentStep: 2,
      };
      const state = reducer(stateWithCard, setTransaction(mockTransaction));

      expect(state.transaction).toEqual(mockTransaction);
      expect(state.currentStep).toBe(3);
    });

    it("should save to localStorage", () => {
      const stateWithCard = {
        ...initialState,
        selectedProduct: mockProduct,
        card: mockCard,
        delivery: mockDelivery,
        currentStep: 2,
      };
      reducer(stateWithCard, setTransaction(mockTransaction));
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "checkout",
        expect.any(String),
      );
    });
  });

  describe("resetCheckout", () => {
    it("should reset all state to initial values", () => {
      const fullState = {
        selectedProduct: mockProduct,
        card: mockCard,
        delivery: mockDelivery,
        transaction: mockTransaction,
        currentStep: 3,
      };
      const state = reducer(fullState, resetCheckout());

      expect(state.selectedProduct).toBeNull();
      expect(state.card).toBeNull();
      expect(state.delivery).toBeNull();
      expect(state.transaction).toBeNull();
      expect(state.currentStep).toBe(0);
    });

    it("should remove checkout from localStorage", () => {
      const fullState = {
        selectedProduct: mockProduct,
        card: mockCard,
        delivery: mockDelivery,
        transaction: mockTransaction,
        currentStep: 3,
      };
      reducer(fullState, resetCheckout());
      expect(localStorage.removeItem).toHaveBeenCalledWith("checkout");
    });
  });

  describe("selectors", () => {
    const rootState = {
      checkout: {
        selectedProduct: mockProduct,
        card: mockCard,
        delivery: mockDelivery,
        transaction: mockTransaction,
        currentStep: 2,
      },
    } as any;

    it("selectCheckout should return entire checkout state", () => {
      expect(selectCheckout(rootState)).toEqual(rootState.checkout);
    });

    it("selectSelectedProduct should return selected product", () => {
      expect(selectSelectedProduct(rootState)).toEqual(mockProduct);
    });

    it("selectTransaction should return transaction", () => {
      expect(selectTransaction(rootState)).toEqual(mockTransaction);
    });

    it("selectCurrentStep should return current step", () => {
      expect(selectCurrentStep(rootState)).toBe(2);
    });

    it("selectSelectedProduct should return null when none selected", () => {
      const emptyState = {
        checkout: { ...rootState.checkout, selectedProduct: null },
      } as any;
      expect(selectSelectedProduct(emptyState)).toBeNull();
    });

    it("selectTransaction should return null when no transaction", () => {
      const emptyState = {
        checkout: { ...rootState.checkout, transaction: null },
      } as any;
      expect(selectTransaction(emptyState)).toBeNull();
    });
  });
});
