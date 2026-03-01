const WOMPI_API_URL = import.meta.env.VITE_WOMPI_API_URL;
const WOMPI_PUBLIC_KEY = import.meta.env.VITE_WOMPI_PUBLIC_KEY;

export interface TokenizedCard {
  readonly token: string;
  readonly brand: string;
  readonly lastFour: string;
}

interface TokenizeCardInput {
  readonly number: string;
  readonly cvc: string;
  readonly expMonth: string;
  readonly expYear: string;
  readonly cardHolder: string;
}

export const tokenizeCard = async (
  input: TokenizeCardInput,
): Promise<TokenizedCard> => {
  console.log("WOMPI_PUBLIC_KEY:", WOMPI_PUBLIC_KEY);
  console.log("WOMPI_API_URL:", WOMPI_API_URL);
  const response = await fetch(`${WOMPI_API_URL}/tokens/cards`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${WOMPI_PUBLIC_KEY}`,
    },
    body: JSON.stringify({
      number: input.number.replace(/\s/g, ""),
      cvc: input.cvc,
      exp_month: input.expMonth,
      exp_year: input.expYear,
      card_holder: input.cardHolder,
    }),
  });

  if (!response.ok) {
    const error = (await response.json()) as { error?: { reason?: string } };
    throw new Error(error.error?.reason ?? "Error tokenizing the card");
  }

  const body = (await response.json()) as {
    status: string;
    data: {
      id: string;
      brand: string;
      last_four: string;
    };
  };

  if (body.status !== "CREATED") {
    throw new Error("Could not tokenize the card");
  }

  return {
    token: body.data.id,
    brand: body.data.brand,
    lastFour: body.data.last_four,
  };
};

export const detectCardBrand = (cardNumber: string): string => {
  const sanitized = cardNumber.replace(/\s/g, "");
  if (/^4/.test(sanitized)) return "VISA";
  if (/^5[1-5]|^2[2-7]/.test(sanitized)) return "MASTERCARD";
  return "UNKNOWN";
};

export const formatCardNumber = (value: string): string => {
  const sanitized = value.replace(/\D/g, "");
  const groups = sanitized.match(/.{1,4}/g) ?? [];
  return groups.join(" ").substring(0, 19);
};
