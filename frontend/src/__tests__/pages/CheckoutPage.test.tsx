import React from "react";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CheckoutPage from "../../pages/CheckoutPage";
import { renderWithProviders } from "../test-utils";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const mockTokenizeCard = jest.fn();
jest.mock("../../utils/wompi.util", () => ({
  ...jest.requireActual("../../utils/wompi.util"),
  tokenizeCard: (...args: any[]) => mockTokenizeCard(...args),
}));

const mockProduct = {
  id: "prod-1",
  name: "Test Product",
  priceInCents: 5000000,
  imageUrl: "https://example.com/img.jpg",
};

const checkoutState = {
  checkout: {
    selectedProduct: mockProduct,
    card: null,
    delivery: null,
    transaction: null,
    currentStep: 1,
  },
};

describe("CheckoutPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const fillCardFields = () => {
    fireEvent.change(screen.getByLabelText("Card number"), {
      target: { value: "4111 1111 1111 1111" },
    });
    fireEvent.change(screen.getByLabelText("Cardholder name"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText("Month"), {
      target: { value: "12" },
    });
    fireEvent.change(screen.getByLabelText("Year"), {
      target: { value: "30" },
    });
    fireEvent.change(screen.getByLabelText("CVC"), {
      target: { value: "123" },
    });
  };

  const fillDeliveryFields = () => {
    fireEvent.change(screen.getByLabelText("Address"), {
      target: { value: "123 Main Street" },
    });
    fireEvent.change(screen.getByLabelText("City"), {
      target: { value: "Bogota" },
    });
    fireEvent.change(screen.getByLabelText("State / Department"), {
      target: { value: "Cundinamarca" },
    });
  };

  it("should render payment form with product", () => {
    renderWithProviders(<CheckoutPage />, { preloadedState: checkoutState });

    expect(screen.getByText("Payment information")).toBeInTheDocument();
    expect(screen.getByText("Credit card")).toBeInTheDocument();
    expect(screen.getByText("Delivery address")).toBeInTheDocument();
    expect(screen.getByText("Test Product")).toBeInTheDocument();
  });

  it("should render card input fields", () => {
    renderWithProviders(<CheckoutPage />, { preloadedState: checkoutState });

    expect(screen.getByLabelText("Card number")).toBeInTheDocument();
    expect(screen.getByLabelText("Cardholder name")).toBeInTheDocument();
    expect(screen.getByLabelText("Month")).toBeInTheDocument();
    expect(screen.getByLabelText("Year")).toBeInTheDocument();
    expect(screen.getByLabelText("CVC")).toBeInTheDocument();
  });

  it("should render delivery input fields", () => {
    renderWithProviders(<CheckoutPage />, { preloadedState: checkoutState });

    expect(screen.getByLabelText("Address")).toBeInTheDocument();
    expect(screen.getByLabelText("City")).toBeInTheDocument();
    expect(screen.getByLabelText("State / Department")).toBeInTheDocument();
    expect(screen.getByLabelText("Postal code (optional)")).toBeInTheDocument();
  });

  it("should render installment options", () => {
    renderWithProviders(<CheckoutPage />, { preloadedState: checkoutState });

    expect(screen.getByText("Full")).toBeInTheDocument();
    expect(screen.getByText("3x")).toBeInTheDocument();
    expect(screen.getByText("6x")).toBeInTheDocument();
    expect(screen.getByText("12x")).toBeInTheDocument();
    expect(screen.getByText("24x")).toBeInTheDocument();
    expect(screen.getByText("36x")).toBeInTheDocument();
  });

  it("should show error when submitting with invalid card", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CheckoutPage />, { preloadedState: checkoutState });

    await user.click(screen.getByText("Continue"));

    expect(
      screen.getByText("Please fill in the card details correctly"),
    ).toBeInTheDocument();
  });

  it("should show error for invalid month", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CheckoutPage />, { preloadedState: checkoutState });

    await user.type(screen.getByLabelText("Card number"), "4111111111111111");
    await user.type(screen.getByLabelText("Cardholder name"), "John Doe");
    await user.type(screen.getByLabelText("Month"), "13");
    await user.type(screen.getByLabelText("Year"), "30");
    await user.type(screen.getByLabelText("CVC"), "123");

    await user.click(screen.getByText("Continue"));

    expect(
      screen.getByText("Invalid month. Must be between 01 and 12"),
    ).toBeInTheDocument();
  });

  it("should show error for expired card", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CheckoutPage />, { preloadedState: checkoutState });

    await user.type(screen.getByLabelText("Card number"), "4111111111111111");
    await user.type(screen.getByLabelText("Cardholder name"), "John Doe");
    await user.type(screen.getByLabelText("Month"), "01");
    await user.type(screen.getByLabelText("Year"), "20");
    await user.type(screen.getByLabelText("CVC"), "123");

    await user.click(screen.getByText("Continue"));

    expect(screen.getByText("Your card is expired")).toBeInTheDocument();
  });

  it("should show error for invalid delivery", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CheckoutPage />, { preloadedState: checkoutState });

    fillCardFields();

    await user.click(screen.getByText("Continue"));

    expect(
      screen.getByText("Please fill in the delivery details"),
    ).toBeInTheDocument();
  });

  it("should navigate to summary on successful submit", async () => {
    const user = userEvent.setup();
    mockTokenizeCard.mockResolvedValue({
      token: "tok_test_123",
      brand: "VISA",
      lastFour: "1111",
    });

    renderWithProviders(<CheckoutPage />, { preloadedState: checkoutState });

    fillCardFields();
    fillDeliveryFields();

    await user.click(screen.getByText("Continue"));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/summary");
    });
  });

  it("should show error when tokenization fails", async () => {
    const user = userEvent.setup();
    mockTokenizeCard.mockRejectedValue(new Error("Tokenization failed"));

    renderWithProviders(<CheckoutPage />, { preloadedState: checkoutState });

    fillCardFields();
    fillDeliveryFields();

    await user.click(screen.getByText("Continue"));

    await waitFor(() => {
      expect(screen.getByText("Tokenization failed")).toBeInTheDocument();
    });
  });

  it("should show non-Error tokenization error", async () => {
    const user = userEvent.setup();
    mockTokenizeCard.mockRejectedValue("string error");

    renderWithProviders(<CheckoutPage />, { preloadedState: checkoutState });

    fillCardFields();
    fillDeliveryFields();

    await user.click(screen.getByText("Continue"));

    await waitFor(() => {
      expect(screen.getByText("Error processing the card")).toBeInTheDocument();
    });
  });

  it("should navigate back when clicking back button", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CheckoutPage />, { preloadedState: checkoutState });

    await user.click(screen.getByText("← Back"));

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("should show card brand badge for VISA", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CheckoutPage />, { preloadedState: checkoutState });

    await user.type(screen.getByLabelText("Card number"), "4111");

    await waitFor(() => {
      expect(screen.getByText("VISA")).toBeInTheDocument();
    });
  });
});
