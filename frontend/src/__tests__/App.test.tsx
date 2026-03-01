import React from "react";
import { screen } from "@testing-library/react";
import App from "../App";
import { renderWithProviders } from "./test-utils";

jest.mock("../pages/ProductPage", () => ({
  __esModule: true,
  default: () => <div data-testid="product-page">ProductPage</div>,
}));

jest.mock("../pages/CheckoutPage", () => ({
  __esModule: true,
  default: () => <div data-testid="checkout-page">CheckoutPage</div>,
}));

jest.mock("../pages/SummaryPage", () => ({
  __esModule: true,
  default: () => <div data-testid="summary-page">SummaryPage</div>,
}));

jest.mock("../pages/ResultPage", () => ({
  __esModule: true,
  default: () => <div data-testid="result-page">ResultPage</div>,
}));

describe("App", () => {
  it("should render product page on root route", () => {
    renderWithProviders(<App />, { route: "/" });

    expect(screen.getByTestId("product-page")).toBeInTheDocument();
  });

  it("should redirect to root when accessing checkout without product", () => {
    renderWithProviders(<App />, { route: "/checkout" });

    expect(screen.getByTestId("product-page")).toBeInTheDocument();
    expect(screen.queryByTestId("checkout-page")).not.toBeInTheDocument();
  });

  it("should render checkout page when product is selected", () => {
    renderWithProviders(<App />, {
      route: "/checkout",
      preloadedState: {
        checkout: {
          selectedProduct: {
            id: "prod-1",
            name: "Test",
            priceInCents: 5000000,
            imageUrl: "https://example.com/img.jpg",
          },
          card: null,
          delivery: null,
          transaction: null,
          currentStep: 1,
        },
      },
    });

    expect(screen.getByTestId("checkout-page")).toBeInTheDocument();
  });

  it("should redirect to root when accessing summary without card", () => {
    renderWithProviders(<App />, { route: "/summary" });

    expect(screen.getByTestId("product-page")).toBeInTheDocument();
    expect(screen.queryByTestId("summary-page")).not.toBeInTheDocument();
  });

  it("should render summary page when card is set", () => {
    renderWithProviders(<App />, {
      route: "/summary",
      preloadedState: {
        checkout: {
          selectedProduct: {
            id: "prod-1",
            name: "Test",
            priceInCents: 5000000,
            imageUrl: "https://example.com/img.jpg",
          },
          card: {
            token: "tok_test",
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
      },
    });

    expect(screen.getByTestId("summary-page")).toBeInTheDocument();
  });

  it("should redirect to root when accessing result without transaction", () => {
    renderWithProviders(<App />, { route: "/result" });

    expect(screen.getByTestId("product-page")).toBeInTheDocument();
    expect(screen.queryByTestId("result-page")).not.toBeInTheDocument();
  });

  it("should render result page when transaction exists", () => {
    renderWithProviders(<App />, {
      route: "/result",
      preloadedState: {
        checkout: {
          selectedProduct: {
            id: "prod-1",
            name: "Test",
            priceInCents: 5000000,
            imageUrl: "https://example.com/img.jpg",
          },
          card: {
            token: "tok_test",
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
          transaction: {
            id: "tx-1",
            reference: "REF-001",
            wompiTransactionId: "wompi-123",
            status: "APPROVED",
            totalAmountInCents: 10000000,
            baseFeeInCents: 3000000,
            deliveryFeeInCents: 2000000,
            productAmountInCents: 5000000,
            installments: 1,
          },
          currentStep: 3,
        },
      },
    });

    expect(screen.getByTestId("result-page")).toBeInTheDocument();
  });

  it("should redirect unknown routes to root", () => {
    renderWithProviders(<App />, { route: "/unknown-route" });

    expect(screen.getByTestId("product-page")).toBeInTheDocument();
  });
});
