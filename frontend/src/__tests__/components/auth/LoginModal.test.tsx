import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginModal from "../../../components/auth/LoginModal";
import { renderWithProviders } from "../../test-utils";

const mockLogin = jest.fn();
jest.mock("../../../store/api/auth.api", () => ({
  __esModule: true,
  useLoginMutation: () => [mockLogin, { isLoading: false }],
}));

describe("LoginModal", () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onSwitchToRegister: jest.fn(),
    onSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render login form when open", () => {
    renderWithProviders(<LoginModal {...defaultProps} />);

    expect(
      screen.getByRole("heading", { name: "Sign in" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("should not render when closed", () => {
    renderWithProviders(<LoginModal {...defaultProps} open={false} />);

    expect(screen.queryByText("Sign in")).not.toBeInTheDocument();
  });

  it("should show error when submitting empty fields", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginModal {...defaultProps} />);

    const signInButton = screen.getByRole("button", { name: "Sign in" });
    await user.click(signInButton);

    expect(screen.getByText("Please fill in all fields")).toBeInTheDocument();
  });

  it("should call login mutation on valid submit", async () => {
    const user = userEvent.setup();
    mockLogin.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          data: {
            accessToken: "token-123",
            customer: {
              id: "1",
              fullName: "Test User",
              email: "test@test.com",
              phoneNumber: "123",
              documentNumber: "456",
            },
          },
        }),
    });

    renderWithProviders(<LoginModal {...defaultProps} />);

    await user.type(screen.getByLabelText("Email"), "test@test.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "test@test.com",
        password: "password123",
      });
    });
  });

  it("should show error on login failure", async () => {
    const user = userEvent.setup();
    mockLogin.mockReturnValue({
      unwrap: () => Promise.reject(new Error("Unauthorized")),
    });

    renderWithProviders(<LoginModal {...defaultProps} />);

    await user.type(screen.getByLabelText("Email"), "test@test.com");
    await user.type(screen.getByLabelText("Password"), "wrongpass");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  it("should call onSwitchToRegister when clicking sign up link", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginModal {...defaultProps} />);

    await user.click(screen.getByText("Sign up"));

    expect(defaultProps.onSwitchToRegister).toHaveBeenCalled();
  });

  it("should call onSuccess after successful login", async () => {
    const user = userEvent.setup();
    mockLogin.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          data: {
            accessToken: "token-123",
            customer: {
              id: "1",
              fullName: "Test User",
              email: "test@test.com",
              phoneNumber: "123",
              documentNumber: "456",
            },
          },
        }),
    });

    renderWithProviders(<LoginModal {...defaultProps} />);

    await user.type(screen.getByLabelText("Email"), "test@test.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(defaultProps.onSuccess).toHaveBeenCalled();
    });
  });
});
