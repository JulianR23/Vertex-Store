import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectCheckout, setTransaction } from "../store/slices/checkout.slice";
import { selectCustomer } from "../store/slices/auth.slice";
import { useCreateTransactionMutation } from "../store/api/transactions.api";
import AppLayout from "../components/layout/AppLayout";
import { formatCOP } from "../utils/currency.util";

const SummaryPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const checkout = useSelector(selectCheckout);
  const customer = useSelector(selectCustomer);
  const [createTransaction, { isLoading }] = useCreateTransactionMutation();
  const [error, setError] = useState("");

  const handlePay = async () => {
    if (!checkout.selectedProduct || !checkout.card || !checkout.delivery)
      return;
    setError("");
    try {
      const customerIp = await fetch("https://api.ipify.org?format=json")
        .then((r) => r.json())
        .then((d) => d.ip)
        .catch(() => "127.0.0.1");

      const result = await createTransaction({
        productId: checkout.selectedProduct.id,
        card: {
          token: checkout.card.token,
          installments: checkout.card.installments,
        },
        delivery: checkout.delivery,
        customerIp,
      }).unwrap();

      dispatch(
        setTransaction({
          id: result.data.id,
          reference: result.data.reference,
          wompiTransactionId: result.data.wompiTransactionId,
          status: result.data.status,
          totalAmountInCents: result.data.totalAmountInCents,
          baseFeeInCents: result.data.baseFeeInCents,
          deliveryFeeInCents: result.data.deliveryFeeInCents,
          productAmountInCents: result.data.productAmountInCents,
          installments: checkout.card?.installments ?? 1,
        }),
      );
      navigate("/result");
    } catch {
      setError("Error processing payment. Please try again.");
    }
  };

  return (
    <AppLayout>
      <Button
        variant="text"
        onClick={() => navigate("/checkout")}
        sx={{ mb: 2, pl: 0 }}
      >
        ← Back
      </Button>

      <Typography variant="h3" gutterBottom>
        Order summary
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError("")} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          maxWidth: 540,
          mx: "auto",
        }}
      >
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Box
                component="img"
                src={checkout.selectedProduct?.imageUrl}
                alt={checkout.selectedProduct?.name}
                sx={{
                  width: 80,
                  height: 80,
                  objectFit: "contain",
                  backgroundColor: "#f5f5f7",
                  borderRadius: 2,
                }}
              />
              <Box>
                <Typography variant="h5" fontWeight={600}>
                  {checkout.selectedProduct?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {checkout.card?.installments === 1
                    ? "Full payment"
                    : `${checkout.card?.installments} installments`}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <CreditCardIcon fontSize="small" />
              <Typography variant="h6">Payment method</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={checkout.card?.brand}
                size="small"
                sx={{
                  backgroundColor:
                    checkout.card?.brand === "VISA" ? "#1a1f71" : "#eb001b",
                  color: "white",
                  fontWeight: 700,
                }}
              />
              <Typography variant="body1">
                •••• •••• •••• {checkout.card?.lastFour}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <LocationOnIcon fontSize="small" />
              <Typography variant="h6">Shipping to</Typography>
            </Box>
            <Typography variant="body1">{customer?.fullName}</Typography>
            <Typography variant="body2" color="text.secondary">
              {checkout.delivery?.addressLine}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {checkout.delivery?.city}, {checkout.delivery?.department}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Payment details
            </Typography>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body2" color="text.secondary">
                Product
              </Typography>
              <Typography variant="body2">
                {formatCOP(checkout.selectedProduct?.priceInCents ?? 0)}
              </Typography>
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body2" color="text.secondary">
                Base fee
              </Typography>
              <Typography variant="body2">{formatCOP(300000)}</Typography>
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Typography variant="body2" color="text.secondary">
                Shipping
              </Typography>
              <Typography variant="body2">{formatCOP(200000)}</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb:
                  checkout.card?.installments && checkout.card.installments > 1
                    ? 2
                    : 0,
              }}
            >
              <Typography variant="h6" fontWeight={700}>
                Total
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {formatCOP(
                  (checkout.selectedProduct?.priceInCents ?? 0) +
                    300000 +
                    200000,
                )}
              </Typography>
            </Box>
            {checkout.card?.installments &&
              checkout.card.installments > 1 &&
              (() => {
                const totalCents =
                  (checkout.selectedProduct?.priceInCents ?? 0) +
                  300000 +
                  200000;
                const installments = checkout.card!.installments;
                const perInstallment = Math.ceil(totalCents / installments);
                const nextDate = new Date();
                nextDate.setMonth(nextDate.getMonth() + 1);
                const nextDateStr = nextDate.toLocaleDateString("es-CO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });
                return (
                  <Box
                    sx={{
                      backgroundColor: "#f0f7ff",
                      borderRadius: 2,
                      p: 2,
                      border: "1px solid #c2daf5",
                    }}
                  >
                    <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
                      Detalles de cuotas
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Valor por cuota
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatCOP(perInstallment)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Próxima cuota
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {nextDateStr}
                      </Typography>
                    </Box>
                  </Box>
                );
              })()}
          </CardContent>
        </Card>

        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={handlePay}
          disabled={isLoading}
          sx={{ py: 2 }}
        >
          {isLoading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={20} color="inherit" />
              <span>Processing payment...</span>
            </Box>
          ) : checkout.card?.installments && checkout.card.installments > 1 ? (
            `Pay ${formatCOP(Math.ceil(((checkout.selectedProduct?.priceInCents ?? 0) + 300000 + 200000) / checkout.card.installments))} · ${checkout.card.installments}x cuotas`
          ) : (
            `Pay ${formatCOP((checkout.selectedProduct?.priceInCents ?? 0) + 300000 + 200000)}`
          )}
        </Button>
      </Box>
    </AppLayout>
  );
};

export default SummaryPage;
