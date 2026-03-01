import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  selectTransaction,
  resetCheckout,
} from "../store/slices/checkout.slice";
import { useGetTransactionQuery } from "../store/api/transactions.api";
import AppLayout from "../components/layout/AppLayout";
import { formatCOP } from "../utils/currency.util";

const POLLING_INTERVAL = 3000;
const MAX_POLLS = 20;

const ResultPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const transaction = useSelector(selectTransaction);
  const [pollCount, setPollCount] = useState(0);
  const [shouldPoll, setShouldPoll] = useState(true);

  const { data, refetch } = useGetTransactionQuery(transaction?.id ?? "", {
    skip: !transaction?.id,
  });

  const currentStatus = data?.data?.status ?? transaction?.status ?? "PENDING";
  const isFinal = [
    "APPROVED",
    "FAILED",
    "DECLINED",
    "VOIDED",
    "ERROR",
  ].includes(currentStatus);
  const isApproved = currentStatus === "APPROVED";

  const installments = transaction?.installments ?? 1;
  const nextInstallmentDate = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  })();

  useEffect(() => {
    if (isFinal || !shouldPoll) return;
    if (pollCount >= MAX_POLLS) {
      setShouldPoll(false);
      return;
    }
    const timer = setTimeout(() => {
      refetch();
      setPollCount((prev) => prev + 1);
    }, POLLING_INTERVAL);
    return () => clearTimeout(timer);
  }, [pollCount, isFinal, shouldPoll, refetch]);

  useEffect(() => {
    if (isFinal) setShouldPoll(false);
  }, [isFinal]);

  const handleGoHome = () => {
    dispatch(resetCheckout());
    navigate("/");
  };

  return (
    <AppLayout>
      <Box sx={{ maxWidth: 480, mx: "auto", textAlign: "center" }}>
        {!isFinal ? (
          <Box sx={{ py: 8 }}>
            <CircularProgress
              size={64}
              thickness={2}
              sx={{ color: "primary.main", mb: 3 }}
            />
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Processing payment
            </Typography>
            <Typography variant="body1" color="text.secondary">
              We're confirming your transaction. This may take a few seconds...
            </Typography>
          </Box>
        ) : (
          <Box sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
              {isApproved ? (
                <CheckCircleIcon
                  sx={{ fontSize: 80, color: "success.main", mb: 2 }}
                />
              ) : (
                <CancelIcon sx={{ fontSize: 80, color: "error.main", mb: 2 }} />
              )}
              <Typography variant="h3" fontWeight={700} gutterBottom>
                {isApproved ? "Payment successful!" : "Payment failed"}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {isApproved
                  ? "Your order has been confirmed and is being prepared."
                  : "We couldn't process your payment. Please try another card."}
              </Typography>
            </Box>

            <Card sx={{ textAlign: "left", mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Transaction details
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Reference
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace">
                    {data?.data?.reference ?? transaction?.reference}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={currentStatus}
                    size="small"
                    color={isApproved ? "success" : "error"}
                  />
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Product
                  </Typography>
                  <Typography variant="body2">
                    {formatCOP(transaction?.productAmountInCents ?? 0)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Base fee
                  </Typography>
                  <Typography variant="body2">
                    {formatCOP(transaction?.baseFeeInCents ?? 0)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Shipping
                  </Typography>
                  <Typography variant="body2">
                    {formatCOP(transaction?.deliveryFeeInCents ?? 0)}
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: installments > 1 ? 2 : 0,
                  }}
                >
                  <Typography variant="h6" fontWeight={700}>
                    Total
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {formatCOP(transaction?.totalAmountInCents ?? 0)}
                  </Typography>
                </Box>
                {isApproved && installments > 1 && (
                  <Box
                    sx={{
                      backgroundColor: "#f0f7ff",
                      borderRadius: 2,
                      p: 2,
                      border: "1px solid #c2daf5",
                    }}
                  >
                    <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
                      Upcoming payments
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Remaining installments
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {installments - 1} of {installments}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Amount per installment
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatCOP(
                          Math.ceil(
                            (transaction?.totalAmountInCents ?? 0) /
                              installments,
                          ),
                        )}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Next installment
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {nextInstallmentDate}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleGoHome}
              sx={{ py: 2 }}
            >
              {isApproved ? "Back to store" : "Try again"}
            </Button>
          </Box>
        )}
      </Box>
    </AppLayout>
  );
};

export default ResultPage;
