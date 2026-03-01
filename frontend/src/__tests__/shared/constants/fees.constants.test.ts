import {
  BASE_FEE_IN_CENTS,
  DELIVERY_FEE_IN_CENTS,
} from "../../../shared/constants/fees.constants";

describe("fees constants", () => {
  it("should export BASE_FEE_IN_CENTS as 3000000", () => {
    expect(BASE_FEE_IN_CENTS).toBe(3000000);
  });

  it("should export DELIVERY_FEE_IN_CENTS as 2000000", () => {
    expect(DELIVERY_FEE_IN_CENTS).toBe(2000000);
  });

  it("should be numbers", () => {
    expect(typeof BASE_FEE_IN_CENTS).toBe("number");
    expect(typeof DELIVERY_FEE_IN_CENTS).toBe("number");
  });
});
