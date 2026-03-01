import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterModal from "../../../components/auth/RegisterModal";
import { renderWithProviders } from "../../test-utils";

const mockRegister = jest.fn();
jest.mock("../../../store/api/auth.api", () => ({
  __esModule: true,
  useRegisterMutation: () => [mockRegister, { isLoading: false }],
}));

describe("RegisterModal", () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onSwitchToLogin: jest.fn(),
    onSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render register form when open", () => {
    renderWithProviders(<RegisterModal {...defaultProps} />);

    expect(
      screen.getByRole("heading", { name: "Create account" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Full name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Phone number")).toBeInTheDocument();
    expect(screen.getByLabelText("Document number")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("should not render when closed", () => {
    renderWithProviders(<RegisterModal {...defaultProps} open={false} />);

    expect(
      screen.queryByRole("heading", { name: "Create account" }),
    ).not.toBeInTheDocument();
  });

  it("should show error when submitting with empty fields", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterModal {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(screen.getByText("Please fill in all fields")).toBeInTheDocument();
  });

  it("should show error for short password", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterModal {...defaultProps} />);

    await user.type(screen.getByLabelText("Full name"), "John Doe");
    await user.type(screen.getByLabelText("Email"), "john@example.com");
    await user.type(screen.getByLabelText("Phone number"), "3001234567");
    await user.type(screen.getByLabelText("Document number"), "123456789");
    await user.type(screen.getByLabelText("Password"), "short");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(
      screen.getByText("Password must be at least 8 characters"),
    ).toBeInTheDocument();
  });

  it("should call register mutation on valid submit", async () => {
    const user = userEvent.setup();
    mockRegister.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          data: {
            accessToken: "token-123",
            customer: {
              id: "1",
              fullName: "John Doe",
              email: "john@example.com",
              phoneNumber: "3001234567",
              documentNumber: "123456789",
            },
          },
        }),
    });

    renderWithProviders(<RegisterModal {...defaultProps} />);

    await user.type(screen.getByLabelText("Full name"), "John Doe");
    await user.type(screen.getByLabelText("Email"), "john@example.com");
    await user.type(screen.getByLabelText("Phone number"), "3001234567");
    await user.type(screen.getByLabelText("Document number"), "123456789");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalled();
    });
  });

  it("should show error on registration failure", async () => {
    const user = userEvent.setup();
    mockRegister.mockReturnValue({
      unwrap: () => Promise.reject(new Error("Conflict")),
    });

    renderWithProviders(<RegisterModal {...defaultProps} />);

    await user.type(screen.getByLabelText("Full name"), "John Doe");
    await user.type(screen.getByLabelText("Email"), "john@example.com");
    await user.type(screen.getByLabelText("Phone number"), "3001234567");
    await user.type(screen.getByLabelText("Document number"), "123456789");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(
        screen.getByText("Email is already registered"),
      ).toBeInTheDocument();
    });
  });

  it("should call onSwitchToLogin when clicking sign in link", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterModal {...defaultProps} />);

    await user.click(screen.getByText("Sign in"));

    expect(defaultProps.onSwitchToLogin).toHaveBeenCalled();
  });

  it("should call onSuccess after successful registration", async () => {
    const user = userEvent.setup();
    mockRegister.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          data: {
            accessToken: "token-123",
            customer: {
              id: "1",
              fullName: "John Doe",
              email: "john@example.com",
              phoneNumber: "3001234567",
              documentNumber: "123456789",
            },
          },
        }),
    });

    renderWithProviders(<RegisterModal {...defaultProps} />);

    await user.type(screen.getByLabelText("Full name"), "John Doe");
    await user.type(screen.getByLabelText("Email"), "john@example.com");
    await user.type(screen.getByLabelText("Phone number"), "3001234567");
    await user.type(screen.getByLabelText("Document number"), "123456789");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(defaultProps.onSuccess).toHaveBeenCalled();
    });
  });
});
