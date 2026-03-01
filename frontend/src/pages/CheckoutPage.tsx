import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  selectSelectedProduct,
  setCardAndDelivery,
} from "../store/slices/checkout.slice";
import AppLayout from "../components/layout/AppLayout";
import {
  tokenizeCard,
  detectCardBrand,
  formatCardNumber,
} from "../utils/wompi.util";
import { formatCOP } from "../utils/currency.util";
import {
  BASE_FEE_IN_CENTS,
  DELIVERY_FEE_IN_CENTS,
} from "../shared/constants/fees.constants";

const INSTALLMENT_OPTIONS = [1, 3, 6, 12, 24, 36];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const product = useSelector(selectSelectedProduct);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [card, setCard] = useState({
    number: "",
    cardHolder: "",
    expMonth: "",
    expYear: "",
    cvc: "",
    installments: 1,
  });

  const [delivery, setDelivery] = useState({
    addressLine: "",
    city: "",
    department: "",
    postalCode: "",
  });

  const cardBrand = detectCardBrand(card.number);

  const handleCardChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;
      if (field === "number") {
        value = formatCardNumber(value);
      } else if (["expMonth", "expYear", "cvc"].includes(field)) {
        value = value.replace(/\D/g, "");
      }
      setCard((prev) => ({ ...prev, [field]: value }));
    };

  const handleDeliveryChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setDelivery((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const isCardValid = (): boolean => {
    const month = parseInt(card.expMonth, 10);
    const year = parseInt(card.expYear, 10);
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;

    const isMonthValid =
      card.expMonth.length === 2 && month >= 1 && month <= 12;
    const isYearValid = card.expYear.length === 2 && year >= currentYear;
    const isNotExpired =
      isYearValid && (year > currentYear || month >= currentMonth);

    return (
      card.number.replace(/\s/g, "").length >= 13 &&
      card.cardHolder.length >= 2 &&
      isMonthValid &&
      isNotExpired &&
      card.cvc.length >= 3
    );
  };

  const isDeliveryValid = (): boolean => {
    return (
      delivery.addressLine.length >= 5 &&
      delivery.city.length >= 2 &&
      delivery.department.length >= 2
    );
  };

  const handleContinue = async () => {
    if (!isCardValid()) {
      const month = parseInt(card.expMonth, 10);
      const year = parseInt(card.expYear, 10);
      const now = new Date();
      const currentYear = now.getFullYear() % 100;
      const currentMonth = now.getMonth() + 1;

      if (card.expMonth.length === 2 && (month < 1 || month > 12)) {
        setError("Invalid month. Must be between 01 and 12");
      } else if (
        card.expYear.length === 2 &&
        card.expMonth.length === 2 &&
        month >= 1 &&
        month <= 12 &&
        (year < currentYear || (year === currentYear && month < currentMonth))
      ) {
        setError("Your card is expired");
      } else {
        setError("Please fill in the card details correctly");
      }
      return;
    }
    if (!isDeliveryValid()) {
      setError("Please fill in the delivery details");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const tokenized = await tokenizeCard({
        number: card.number,
        cvc: card.cvc,
        expMonth: card.expMonth,
        expYear: card.expYear,
        cardHolder: card.cardHolder,
      });
      dispatch(
        setCardAndDelivery({
          card: {
            token: tokenized.token,
            installments: card.installments,
            lastFour: tokenized.lastFour,
            brand: tokenized.brand,
          },
          delivery: {
            addressLine: delivery.addressLine,
            city: delivery.city,
            department: delivery.department,
            postalCode: delivery.postalCode,
          },
        }),
      );
      navigate("/summary");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error processing the card",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <Button
        variant="text"
        onClick={() => navigate("/")}
        sx={{ mb: 2, pl: 0 }}
      >
        ← Back
      </Button>

      <Typography variant="h3" gutterBottom>
        Payment information
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError("")} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
              >
                <CreditCardIcon />
                <Typography variant="h5">Credit card</Typography>
                {cardBrand !== "UNKNOWN" && (
                  <Box
                    sx={{
                      ml: "auto",
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 2,
                      backgroundColor:
                        cardBrand === "VISA" ? "#1a1f71" : "#eb001b",
                      color: "white",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                    }}
                  >
                    {cardBrand}
                  </Box>
                )}
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Card number"
                  fullWidth
                  value={card.number}
                  onChange={handleCardChange("number")}
                  inputProps={{ maxLength: 19 }}
                  placeholder="1234 5678 9012 3456"
                />
                <TextField
                  label="Cardholder name"
                  fullWidth
                  value={card.cardHolder}
                  onChange={handleCardChange("cardHolder")}
                  placeholder="As it appears on the card"
                />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      label="Month"
                      fullWidth
                      value={card.expMonth}
                      onChange={handleCardChange("expMonth")}
                      inputProps={{ maxLength: 2 }}
                      placeholder="MM"
                    />
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      label="Year"
                      fullWidth
                      value={card.expYear}
                      onChange={handleCardChange("expYear")}
                      inputProps={{ maxLength: 2 }}
                      placeholder="YY"
                    />
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      label="CVC"
                      fullWidth
                      value={card.cvc}
                      onChange={handleCardChange("cvc")}
                      inputProps={{ maxLength: 4 }}
                      placeholder="123"
                    />
                  </Grid>
                </Grid>

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Installments
                  </Typography>
                  <ToggleButtonGroup
                    value={card.installments}
                    exclusive
                    onChange={(_, value) =>
                      value &&
                      setCard((prev) => ({ ...prev, installments: value }))
                    }
                    sx={{ flexWrap: "wrap", gap: 1 }}
                  >
                    {INSTALLMENT_OPTIONS.map((opt) => (
                      <ToggleButton
                        key={opt}
                        value={opt}
                        sx={{
                          borderRadius: "8px !important",
                          border: "1px solid #d2d2d7 !important",
                          px: 2,
                          "&.Mui-selected": {
                            backgroundColor: "primary.main",
                            color: "white",
                            "&:hover": { backgroundColor: "primary.light" },
                          },
                        }}
                      >
                        {opt === 1 ? "Full" : `${opt}x`}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                  {card.installments > 1 && (
                    <Box
                      sx={{
                        mt: 2,
                        p: 2,
                        backgroundColor: "#f5f5f7",
                        borderRadius: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Estimated amount per installment
                      </Typography>
                      <Typography variant="body1" fontWeight={700}>
                        {formatCOP(
                          Math.ceil(
                            ((product?.priceInCents ?? 0) +
                              BASE_FEE_IN_CENTS +
                              DELIVERY_FEE_IN_CENTS) /
                              card.installments,
                          ),
                        )}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
              >
                <LocationOnIcon />
                <Typography variant="h5">Delivery address</Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Address"
                  fullWidth
                  value={delivery.addressLine}
                  onChange={handleDeliveryChange("addressLine")}
                  placeholder="123 Main St"
                />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      label="City"
                      fullWidth
                      value={delivery.city}
                      onChange={handleDeliveryChange("city")}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      label="State / Department"
                      fullWidth
                      value={delivery.department}
                      onChange={handleDeliveryChange("department")}
                    />
                  </Grid>
                </Grid>
                <TextField
                  label="Postal code (optional)"
                  fullWidth
                  value={delivery.postalCode}
                  onChange={handleDeliveryChange("postalCode")}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ position: { md: "sticky" }, top: { md: 24 } }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Summary
              </Typography>
              <Box
                component="img"
                src={product?.imageUrl}
                alt={product?.name}
                sx={{
                  width: "100%",
                  height: 140,
                  objectFit: "contain",
                  backgroundColor: "#f5f5f7",
                  borderRadius: 2,
                  mb: 2,
                }}
              />
              <Typography variant="body1" fontWeight={600}>
                {product?.name}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2" color="text.secondary">
                  Product
                </Typography>
                <Typography variant="body2">
                  {formatCOP(product?.priceInCents ?? 0)}
                </Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2" color="text.secondary">
                  Base fee
                </Typography>
                <Typography variant="body2">
                  {formatCOP(BASE_FEE_IN_CENTS)}
                </Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Typography variant="body2" color="text.secondary">
                  Shipping
                </Typography>
                <Typography variant="body2">
                  {formatCOP(DELIVERY_FEE_IN_CENTS)}
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
              >
                <Typography variant="h6" fontWeight={700}>
                  Total
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {formatCOP(
                    (product?.priceInCents ?? 0) +
                      BASE_FEE_IN_CENTS +
                      DELIVERY_FEE_IN_CENTS,
                  )}
                </Typography>
              </Box>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleContinue}
                disabled={isLoading}
              >
                {isLoading ? (
                  <CircularProgress size={22} color="inherit" />
                ) : (
                  "Continue"
                )}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AppLayout>
  );
};

export default CheckoutPage;
