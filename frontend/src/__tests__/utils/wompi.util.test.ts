import {
  tokenizeCard,
  detectCardBrand,
  formatCardNumber,
} from "../../utils/wompi.util";

describe("detectCardBrand", () => {
  it("should detect VISA cards starting with 4", () => {
    expect(detectCardBrand("4111111111111111")).toBe("VISA");
  });

  it("should detect VISA with spaces", () => {
    expect(detectCardBrand("4111 1111 1111 1111")).toBe("VISA");
  });

  it("should detect MASTERCARD cards starting with 51-55", () => {
    expect(detectCardBrand("5111111111111111")).toBe("MASTERCARD");
    expect(detectCardBrand("5211111111111111")).toBe("MASTERCARD");
    expect(detectCardBrand("5311111111111111")).toBe("MASTERCARD");
    expect(detectCardBrand("5411111111111111")).toBe("MASTERCARD");
    expect(detectCardBrand("5511111111111111")).toBe("MASTERCARD");
  });

  it("should detect MASTERCARD cards starting with 22-27", () => {
    expect(detectCardBrand("2211111111111111")).toBe("MASTERCARD");
    expect(detectCardBrand("2711111111111111")).toBe("MASTERCARD");
  });

  it("should return UNKNOWN for unrecognized cards", () => {
    expect(detectCardBrand("6011111111111111")).toBe("UNKNOWN");
    expect(detectCardBrand("9999999999999999")).toBe("UNKNOWN");
    expect(detectCardBrand("")).toBe("UNKNOWN");
  });
});

describe("formatCardNumber", () => {
  it("should format card number in groups of 4", () => {
    expect(formatCardNumber("4111111111111111")).toBe("4111 1111 1111 1111");
  });

  it("should remove non-digit characters", () => {
    expect(formatCardNumber("4111-1111-1111-1111")).toBe("4111 1111 1111 1111");
  });

  it("should handle partial card numbers", () => {
    expect(formatCardNumber("4111")).toBe("4111");
    expect(formatCardNumber("41111")).toBe("4111 1");
  });

  it("should limit to 19 characters (16 digits + 3 spaces)", () => {
    const result = formatCardNumber("41111111111111119999");
    expect(result.length).toBeLessThanOrEqual(19);
  });

  it("should handle empty string", () => {
    expect(formatCardNumber("")).toBe("");
  });

  it("should handle string with only non-digit characters", () => {
    expect(formatCardNumber("abcd")).toBe("");
  });
});

describe("tokenizeCard", () => {
  const mockInput = {
    number: "4111 1111 1111 1111",
    cvc: "123",
    expMonth: "12",
    expYear: "30",
    cardHolder: "John Doe",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should tokenize card successfully", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          status: "CREATED",
          data: {
            id: "tok_test_123",
            brand: "VISA",
            last_four: "1111",
          },
        }),
    });

    const result = await tokenizeCard(mockInput);

    expect(result).toEqual({
      token: "tok_test_123",
      brand: "VISA",
      lastFour: "1111",
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "https://sandbox.wompi.co/v1/tokens/cards",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer pub_test_key_123",
        },
        body: JSON.stringify({
          number: "4111111111111111",
          cvc: "123",
          exp_month: "12",
          exp_year: "30",
          card_holder: "John Doe",
        }),
      }),
    );
  });

  it("should throw error when response is not ok", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () =>
        Promise.resolve({
          error: { reason: "Invalid card number" },
        }),
    });

    await expect(tokenizeCard(mockInput)).rejects.toThrow(
      "Invalid card number",
    );
  });

  it("should throw default error when response not ok and no reason", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({}),
    });

    await expect(tokenizeCard(mockInput)).rejects.toThrow(
      "Error tokenizing the card",
    );
  });

  it("should throw when status is not CREATED", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          status: "ERROR",
          data: { id: "tok_test", brand: "VISA", last_four: "1111" },
        }),
    });

    await expect(tokenizeCard(mockInput)).rejects.toThrow(
      "Could not tokenize the card",
    );
  });
});
