import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductPage from "../../pages/ProductPage";
import { renderWithProviders } from "../test-utils";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const mockUseGetProductsQuery = jest.fn();
jest.mock("../../store/api/products.api", () => ({
  __esModule: true,
  useGetProductsQuery: (...args: any[]) => mockUseGetProductsQuery(...args),
}));

jest.mock("../../components/auth/LoginModal", () => ({
  __esModule: true,
  default: ({ open, onClose, onSwitchToRegister, onSuccess }: any) =>
    open ? (
      <div data-testid="login-modal">
        <button onClick={onClose}>close-login</button>
        <button onClick={onSwitchToRegister}>switch-register</button>
        <button onClick={onSuccess}>login-success</button>
      </div>
    ) : null,
}));

jest.mock("../../components/auth/RegisterModal", () => ({
  __esModule: true,
  default: ({ open, onClose, onSwitchToLogin, onSuccess }: any) =>
    open ? (
      <div data-testid="register-modal">
        <button onClick={onClose}>close-register</button>
        <button onClick={onSwitchToLogin}>switch-login</button>
        <button onClick={onSuccess}>register-success</button>
      </div>
    ) : null,
}));

const mockProducts = [
  {
    id: "prod-1",
    name: "Product A",
    description: "Description A",
    imageUrl: "https://example.com/a.jpg",
    priceInCents: 5000000,
    stock: 10,
    isActive: true,
    createdAt: "2025-01-01",
  },
  {
    id: "prod-2",
    name: "Product B",
    description: "Description B",
    imageUrl: "https://example.com/b.jpg",
    priceInCents: 3000000,
    stock: 0,
    isActive: true,
    createdAt: "2025-01-01",
  },
];

describe("ProductPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render loading skeletons when loading", () => {
    mockUseGetProductsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    renderWithProviders(<ProductPage />);

    expect(screen.getByText("Store")).toBeInTheDocument();
    expect(
      screen.getByText("Products available for immediate purchase"),
    ).toBeInTheDocument();
  });

  it("should render error alert on error", () => {
    mockUseGetProductsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    renderWithProviders(<ProductPage />);

    expect(
      screen.getByText("Error loading products. Please try again."),
    ).toBeInTheDocument();
  });

  it("should render products when loaded", () => {
    mockUseGetProductsQuery.mockReturnValue({
      data: { data: mockProducts },
      isLoading: false,
      isError: false,
    });

    renderWithProviders(<ProductPage />);

    expect(screen.getByText("Product A")).toBeInTheDocument();
    expect(screen.getByText("Product B")).toBeInTheDocument();
    expect(screen.getByText("10 in stock")).toBeInTheDocument();
    expect(screen.getAllByText("Out of stock").length).toBeGreaterThanOrEqual(
      1,
    );
  });

  it("should disable buy button for out of stock products", () => {
    mockUseGetProductsQuery.mockReturnValue({
      data: { data: mockProducts },
      isLoading: false,
      isError: false,
    });

    renderWithProviders(<ProductPage />);

    const buttons = screen.getAllByRole("button");
    const outOfStockButton = buttons.find(
      (btn) => btn.textContent === "Out of stock",
    );
    expect(outOfStockButton).toBeDisabled();
  });

  it("should open login modal when unauthenticated user clicks buy", async () => {
    const user = userEvent.setup();
    mockUseGetProductsQuery.mockReturnValue({
      data: { data: mockProducts },
      isLoading: false,
      isError: false,
    });

    renderWithProviders(<ProductPage />);

    const buyButton = screen.getByRole("button", { name: "Buy" });
    await user.click(buyButton);

    expect(screen.getByTestId("login-modal")).toBeInTheDocument();
  });

  it("should navigate to checkout when authenticated user clicks buy", async () => {
    const user = userEvent.setup();
    mockUseGetProductsQuery.mockReturnValue({
      data: { data: mockProducts },
      isLoading: false,
      isError: false,
    });

    renderWithProviders(<ProductPage />, {
      preloadedState: {
        auth: {
          accessToken: "token",
          customer: {
            id: "1",
            fullName: "Test",
            email: "test@test.com",
            phoneNumber: "123",
            documentNumber: "456",
          },
          isAuthenticated: true,
        },
      },
    });

    const buyButton = screen.getByRole("button", { name: "Buy" });
    await user.click(buyButton);

    expect(mockNavigate).toHaveBeenCalledWith("/checkout");
  });

  it("should navigate to checkout after login success with pending product", async () => {
    const user = userEvent.setup();
    mockUseGetProductsQuery.mockReturnValue({
      data: { data: mockProducts },
      isLoading: false,
      isError: false,
    });

    renderWithProviders(<ProductPage />);

    // Click buy to open login modal
    const buyButton = screen.getByRole("button", { name: "Buy" });
    await user.click(buyButton);

    // Simulate successful login
    await user.click(screen.getByText("login-success"));

    expect(mockNavigate).toHaveBeenCalledWith("/checkout");
  });

  it("should switch from login to register modal", async () => {
    const user = userEvent.setup();
    mockUseGetProductsQuery.mockReturnValue({
      data: { data: mockProducts },
      isLoading: false,
      isError: false,
    });

    renderWithProviders(<ProductPage />);

    const buyButton = screen.getByRole("button", { name: "Buy" });
    await user.click(buyButton);

    await user.click(screen.getByText("switch-register"));

    expect(screen.getByTestId("register-modal")).toBeInTheDocument();
  });

  it("should switch from register to login modal", async () => {
    const user = userEvent.setup();
    mockUseGetProductsQuery.mockReturnValue({
      data: { data: mockProducts },
      isLoading: false,
      isError: false,
    });

    renderWithProviders(<ProductPage />);

    // Open login modal first
    const buyButton = screen.getByRole("button", { name: "Buy" });
    await user.click(buyButton);
    // Switch to register
    await user.click(screen.getByText("switch-register"));
    // Switch back to login
    await user.click(screen.getByText("switch-login"));

    expect(screen.getByTestId("login-modal")).toBeInTheDocument();
  });
});
