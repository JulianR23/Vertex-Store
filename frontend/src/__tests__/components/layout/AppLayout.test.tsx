import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AppLayout from "../../../components/layout/AppLayout";
import { renderWithProviders } from "../../test-utils";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("AppLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render children", () => {
    renderWithProviders(
      <AppLayout>
        <div data-testid="child">Content</div>
      </AppLayout>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("should show store name in header", () => {
    renderWithProviders(
      <AppLayout>
        <div>Content</div>
      </AppLayout>,
    );

    expect(screen.getByText("Vertex Store")).toBeInTheDocument();
  });

  it("should not show logout when not authenticated", () => {
    renderWithProviders(
      <AppLayout>
        <div>Content</div>
      </AppLayout>,
    );

    expect(screen.queryByLabelText(/logout/i)).not.toBeInTheDocument();
  });

  it("should show customer name and logout when authenticated", () => {
    renderWithProviders(
      <AppLayout>
        <div>Content</div>
      </AppLayout>,
      {
        preloadedState: {
          auth: {
            accessToken: "token-123",
            customer: {
              id: "1",
              fullName: "John Doe",
              email: "john@test.com",
              phoneNumber: "123",
              documentNumber: "456",
            },
            isAuthenticated: true,
          },
        },
      },
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("should navigate home when clicking store name", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <AppLayout>
        <div>Content</div>
      </AppLayout>,
    );

    await user.click(screen.getByText("Vertex Store"));
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("should handle logout", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <AppLayout>
        <div>Content</div>
      </AppLayout>,
      {
        preloadedState: {
          auth: {
            accessToken: "token-123",
            customer: {
              id: "1",
              fullName: "John Doe",
              email: "john@test.com",
              phoneNumber: "123",
              documentNumber: "456",
            },
            isAuthenticated: true,
          },
        },
      },
    );

    const logoutButton = screen.getByRole("button");
    await user.click(logoutButton);

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
