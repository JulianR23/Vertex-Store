import {
  Box,
  Typography,
  Button,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Skeleton,
  Alert,
  Grid,
} from "@mui/material";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import InventoryIcon from "@mui/icons-material/Inventory";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useGetProductsQuery } from "../store/api/products.api";
import { selectProduct } from "../store/slices/checkout.slice";
import { selectIsAuthenticated } from "../store/slices/auth.slice";
import type { ProductResponse } from "../store/api/products.api";
import AppLayout from "../components/layout/AppLayout";
import LoginModal from "../components/auth/LoginModal";
import RegisterModal from "../components/auth/RegisterModal";
import { formatCOP } from "../utils/currency.util";

const ProductPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { data, isLoading, isError } = useGetProductsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  console.log("Products data:", data);
  console.log("Products isLoading:", isLoading);
  console.log("Products isError:", isError);

  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<ProductResponse | null>(
    null,
  );

  const handleBuy = (product: ProductResponse) => {
    if (product.stock === 0) return;
    if (!isAuthenticated) {
      setPendingProduct(product);
      setLoginOpen(true);
      return;
    }
    dispatch(
      selectProduct({
        id: product.id,
        name: product.name,
        priceInCents: product.priceInCents,
        imageUrl: product.imageUrl,
      }),
    );
    navigate("/checkout");
  };

  const handleAuthSuccess = () => {
    setLoginOpen(false);
    setRegisterOpen(false);
    if (pendingProduct) {
      dispatch(
        selectProduct({
          id: pendingProduct.id,
          name: pendingProduct.name,
          priceInCents: pendingProduct.priceInCents,
          imageUrl: pendingProduct.imageUrl,
        }),
      );
      navigate("/checkout");
    }
  };

  return (
    <AppLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" gutterBottom>
          Store
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Products available for immediate purchase
        </Typography>
      </Box>

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading products. Please try again.
        </Alert>
      )}

      <Grid container spacing={3}>
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <Card>
                  <Skeleton variant="rectangular" height={220} />
                  <CardContent>
                    <Skeleton variant="text" width="80%" height={32} />
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" />
                  </CardContent>
                </Card>
              </Grid>
            ))
          : data?.data.map((product) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      transform:
                        product.stock > 0 ? "translateY(-4px)" : "none",
                      boxShadow:
                        product.stock > 0
                          ? "0 8px 40px rgba(0,0,0,0.12)"
                          : undefined,
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="220"
                    image={product.imageUrl}
                    alt={product.name}
                    sx={{
                      objectFit: "contain",
                      backgroundColor: "#f5f5f7",
                      p: 3,
                      filter: product.stock === 0 ? "grayscale(100%)" : "none",
                      opacity: product.stock === 0 ? 0.6 : 1,
                    }}
                  />
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Typography
                        variant="h5"
                        fontWeight={600}
                        sx={{ flex: 1, mr: 1 }}
                      >
                        {product.name}
                      </Typography>
                      <Chip
                        icon={
                          <InventoryIcon
                            sx={{ fontSize: "0.75rem !important" }}
                          />
                        }
                        label={
                          product.stock > 0
                            ? `${product.stock} in stock`
                            : "Out of stock"
                        }
                        size="small"
                        color={product.stock > 0 ? "default" : "error"}
                        variant="outlined"
                        sx={{ flexShrink: 0 }}
                      />
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {product.description}
                    </Typography>

                    <Box sx={{ mt: "auto", pt: 1 }}>
                      <Typography
                        variant="h4"
                        fontWeight={700}
                        sx={{ mb: 1.5 }}
                      >
                        {formatCOP(product.priceInCents)}
                      </Typography>
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        startIcon={<ShoppingBagIcon />}
                        onClick={() => handleBuy(product)}
                        disabled={product.stock === 0}
                      >
                        {product.stock === 0 ? "Out of stock" : "Buy"}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
      </Grid>

      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToRegister={() => {
          setLoginOpen(false);
          setRegisterOpen(true);
        }}
        onSuccess={handleAuthSuccess}
      />
      <RegisterModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSwitchToLogin={() => {
          setRegisterOpen(false);
          setLoginOpen(true);
        }}
        onSuccess={handleAuthSuccess}
      />
    </AppLayout>
  );
};

export default ProductPage;
