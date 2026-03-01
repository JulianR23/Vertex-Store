import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SummaryPage from "../../pages/SummaryPage";
import { renderWithProviders } from "../test-utils";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const mockCreateTransaction = jest.fn();
jest.mock("../../store/api/transactions.api", () => ({
  __esModule: true,
  useCreateTransactionMutation: () => [
    mockCreateTransaction,
    { isLoading: false },
  ],
}));

const fullCheckoutState = {
  auth: {
    accessToken: "token-123",
    customer: {
      id: "cust-1",
      fullName: "John Doe",
      email: "john@test.com",
      phoneNumber: "3001234567",
      documentNumber: "1234567890",
    },
    isAuthenticated: true,
  },
  checkout: {
    selectedProduct: {
      id: "prod-1",
      name: "Test Product",
      priceInCents: 5000000,
      imageUrl: "https://example.com/img.jpg",
    },
    card: {
      token: "tok_test_123",
      installments: 1,
      lastFour: "1111",
      brand: "VISA",
    },
    delivery: {
      addressLine: "123 Main St",
      city: "Bogotá",
      department: "Cundinamarca",
      postalCode: "110111",
    },
    transaction: null,
    currentStep: 2,
  },
};

describe("SummaryPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({ ip: "1.2.3.4" }),
    });
  });

  it("should render order summary", () => {
    renderWithProviders(<SummaryPage />, { preloadedState: fullCheckoutState });

    expect(screen.getByText("Order summary")).toBeInTheDocument();
    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText("Full payment")).toBeInTheDocument();
  });

  it("should display card info", () => {
    renderWithProviders(<SummaryPage />, { preloadedState: fullCheckoutState });

    expect(screen.getByText("Payment method")).toBeInTheDocument();
    expect(screen.getByText("VISA")).toBeInTheDocument();
    expect(screen.getByText("•••• •••• •••• 1111")).toBeInTheDocument();
  });

  it("should display delivery info", () => {
    renderWithProviders(<SummaryPage />, { preloadedState: fullCheckoutState });

    expect(screen.getByText("Shipping to")).toBeInTheDocument();
    expect(screen.getAllByText("John Doe").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("123 Main St")).toBeInTheDocument();
  });

  it("should display payment details", () => {
    renderWithProviders(<SummaryPage />, { preloadedState: fullCheckoutState });

    expect(screen.getByText("Payment details")).toBeInTheDocument();
    expect(screen.getByText("Product")).toBeInTheDocument();
    expect(screen.getByText("Base fee")).toBeInTheDocument();
    expect(screen.getByText("Shipping")).toBeInTheDocument();
    expect(screen.getByText("Total")).toBeInTheDocument();
  });

  it("should show installment text for multi-installment", () => {
    const stateWithInstallments = {
      ...fullCheckoutState,
      checkout: {
        ...fullCheckoutState.checkout,
        card: { ...fullCheckoutState.checkout.card, installments: 3 },
      },
    };

    renderWithProviders(<SummaryPage />, {
      preloadedState: stateWithInstallments,
    });

    expect(screen.getByText("3 installments")).toBeInTheDocument();
  });

  it("should navigate to result on successful payment", async () => {
    const user = userEvent.setup();
    mockCreateTransaction.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          data: {
            id: "tx-1",
            reference: "REF-001",
            wompiTransactionId: "wompi-123",
            status: "PENDING",
            totalAmountInCents: 10000000,
            baseFeeInCents: 3000000,
            deliveryFeeInCents: 2000000,
            productAmountInCents: 5000000,
          },
        }),
    });

    renderWithProviders(<SummaryPage />, { preloadedState: fullCheckoutState });

    const payButton = screen
      .getAllByRole("button")
      .find((btn) => btn.textContent?.includes("Pay"))!;
    await user.click(payButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/result");
    });
  });

  it("should show error on payment failure", async () => {
    const user = userEvent.setup();
    mockCreateTransaction.mockReturnValue({
      unwrap: () => Promise.reject(new Error("Payment failed")),
    });

    renderWithProviders(<SummaryPage />, { preloadedState: fullCheckoutState });

    const payButton = screen
      .getAllByRole("button")
      .find((btn) => btn.textContent?.includes("Pay"))!;
    await user.click(payButton);

    await waitFor(() => {
      expect(
        screen.getByText("Error processing payment. Please try again."),
      ).toBeInTheDocument();
    });
  });

  it("should navigate back when clicking back button", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SummaryPage />, { preloadedState: fullCheckoutState });

    await user.click(screen.getByText("← Back"));

    expect(mockNavigate).toHaveBeenCalledWith("/checkout");
  });

  it("should fallback to 127.0.0.1 if IP fetch fails", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network error"),
    );
    mockCreateTransaction.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          data: {
            id: "tx-1",
            reference: "REF-001",
            wompiTransactionId: "wompi-123",
            status: "PENDING",
            totalAmountInCents: 10000000,
            baseFeeInCents: 3000000,
            deliveryFeeInCents: 2000000,
            productAmountInCents: 5000000,
          },
        }),
    });

    renderWithProviders(<SummaryPage />, { preloadedState: fullCheckoutState });

    const payButton = screen
      .getAllByRole("button")
      .find((btn) => btn.textContent?.includes("Pay"))!;
    await user.click(payButton);

    await waitFor(() => {
      expect(mockCreateTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ customerIp: "127.0.0.1" }),
      );
    });
  });

  it("should not proceed if checkout data is incomplete", async () => {
    const user = userEvent.setup();
    const incompleteState = {
      ...fullCheckoutState,
      checkout: {
        ...fullCheckoutState.checkout,
        selectedProduct: null,
      },
    };

    renderWithProviders(<SummaryPage />, { preloadedState: incompleteState });

    const payButton = screen
      .getAllByRole("button")
      .find((btn) => btn.textContent?.includes("Pay"));
    if (payButton) {
      await user.click(payButton);
      expect(mockCreateTransaction).not.toHaveBeenCalled();
    }
  });
});
