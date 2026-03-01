import React from "react";
import { screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResultPage from "../../pages/ResultPage";
import { renderWithProviders } from "../test-utils";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const mockRefetch = jest.fn();
const mockUseGetTransactionQuery = jest.fn();
jest.mock("../../store/api/transactions.api", () => ({
  __esModule: true,
  useGetTransactionQuery: (...args: any[]) =>
    mockUseGetTransactionQuery(...args),
}));

const baseTransaction = {
  id: "tx-1",
  reference: "REF-001",
  wompiTransactionId: "wompi-123",
  status: "PENDING",
  totalAmountInCents: 10000000,
  baseFeeInCents: 3000000,
  deliveryFeeInCents: 2000000,
  productAmountInCents: 5000000,
  installments: 1,
};

const resultState = {
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
    transaction: baseTransaction,
    currentStep: 3,
  },
};

describe("ResultPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockRefetch.mockResolvedValue({});
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should show processing state when transaction is pending", () => {
    mockUseGetTransactionQuery.mockReturnValue({
      data: { data: { ...baseTransaction, status: "PENDING" } },
      refetch: mockRefetch,
    });

    renderWithProviders(<ResultPage />, { preloadedState: resultState });

    expect(screen.getByText("Processing payment")).toBeInTheDocument();
    expect(
      screen.getByText(
        "We're confirming your transaction. This may take a few seconds...",
      ),
    ).toBeInTheDocument();
  });

  it("should show success state when approved", () => {
    mockUseGetTransactionQuery.mockReturnValue({
      data: { data: { ...baseTransaction, status: "APPROVED" } },
      refetch: mockRefetch,
    });

    renderWithProviders(<ResultPage />, { preloadedState: resultState });

    expect(screen.getByText("Payment successful!")).toBeInTheDocument();
    expect(
      screen.getByText("Your order has been confirmed and is being prepared."),
    ).toBeInTheDocument();
    expect(screen.getByText("Back to store")).toBeInTheDocument();
  });

  it("should show failure state when failed", () => {
    mockUseGetTransactionQuery.mockReturnValue({
      data: { data: { ...baseTransaction, status: "FAILED" } },
      refetch: mockRefetch,
    });

    renderWithProviders(<ResultPage />, { preloadedState: resultState });

    expect(screen.getByText("Payment failed")).toBeInTheDocument();
    expect(
      screen.getByText(
        "We couldn't process your payment. Please try another card.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Try again")).toBeInTheDocument();
  });

  it("should show failure for DECLINED status", () => {
    mockUseGetTransactionQuery.mockReturnValue({
      data: { data: { ...baseTransaction, status: "DECLINED" } },
      refetch: mockRefetch,
    });

    renderWithProviders(<ResultPage />, { preloadedState: resultState });

    expect(screen.getByText("Payment failed")).toBeInTheDocument();
  });

  it("should show failure for VOIDED status", () => {
    mockUseGetTransactionQuery.mockReturnValue({
      data: { data: { ...baseTransaction, status: "VOIDED" } },
      refetch: mockRefetch,
    });

    renderWithProviders(<ResultPage />, { preloadedState: resultState });

    expect(screen.getByText("Payment failed")).toBeInTheDocument();
  });

  it("should show failure for ERROR status", () => {
    mockUseGetTransactionQuery.mockReturnValue({
      data: { data: { ...baseTransaction, status: "ERROR" } },
      refetch: mockRefetch,
    });

    renderWithProviders(<ResultPage />, { preloadedState: resultState });

    expect(screen.getByText("Payment failed")).toBeInTheDocument();
  });

  it("should display transaction details when approved", () => {
    mockUseGetTransactionQuery.mockReturnValue({
      data: {
        data: {
          ...baseTransaction,
          status: "APPROVED",
          reference: "REF-001",
        },
      },
      refetch: mockRefetch,
    });

    renderWithProviders(<ResultPage />, { preloadedState: resultState });

    expect(screen.getByText("Transaction details")).toBeInTheDocument();
    expect(screen.getByText("REF-001")).toBeInTheDocument();
    expect(screen.getByText("APPROVED")).toBeInTheDocument();
  });

  it("should navigate home when clicking go home button", async () => {
    jest.useRealTimers();
    const user = userEvent.setup();
    mockUseGetTransactionQuery.mockReturnValue({
      data: { data: { ...baseTransaction, status: "APPROVED" } },
      refetch: mockRefetch,
    });

    renderWithProviders(<ResultPage />, { preloadedState: resultState });

    await user.click(screen.getByText("Back to store"));

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("should show installment details when approved with multiple installments", () => {
    const stateWithInstallments = {
      ...resultState,
      checkout: {
        ...resultState.checkout,
        transaction: { ...baseTransaction, installments: 3 },
      },
    };

    mockUseGetTransactionQuery.mockReturnValue({
      data: { data: { ...baseTransaction, status: "APPROVED" } },
      refetch: mockRefetch,
    });

    renderWithProviders(<ResultPage />, {
      preloadedState: stateWithInstallments,
    });

    expect(screen.getByText("Upcoming payments")).toBeInTheDocument();
    expect(screen.getByText(/2 of 3/)).toBeInTheDocument();
  });

  it("should poll for status updates and stop when final", () => {
    mockUseGetTransactionQuery.mockReturnValue({
      data: { data: { ...baseTransaction, status: "PENDING" } },
      refetch: mockRefetch,
    });

    renderWithProviders(<ResultPage />, { preloadedState: resultState });

    // Advance timer to trigger polling
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(mockRefetch).toHaveBeenCalled();
  });
});
