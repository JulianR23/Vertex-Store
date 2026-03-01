import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#000000",
      light: "#333333",
      dark: "#000000",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#6e6e73",
      light: "#86868b",
      dark: "#1d1d1f",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f5f5f7",
      paper: "#ffffff",
    },
    text: {
      primary: "#1d1d1f",
      secondary: "#6e6e73",
    },
    error: {
      main: "#ff3b30",
    },
    success: {
      main: "#34c759",
    },
    divider: "#d2d2d7",
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      "SF Pro Display",
      "SF Pro Text",
      "Helvetica Neue",
      "Arial",
      "sans-serif",
    ].join(","),
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      letterSpacing: "-0.02em",
      color: "#1d1d1f",
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 700,
      letterSpacing: "-0.02em",
      color: "#1d1d1f",
    },
    h3: {
      fontSize: "1.5rem",
      fontWeight: 600,
      letterSpacing: "-0.01em",
      color: "#1d1d1f",
    },
    h4: {
      fontSize: "1.25rem",
      fontWeight: 600,
      letterSpacing: "-0.01em",
    },
    h5: {
      fontSize: "1rem",
      fontWeight: 600,
    },
    h6: {
      fontSize: "0.875rem",
      fontWeight: 600,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
      color: "#1d1d1f",
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.5,
      color: "#6e6e73",
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
      letterSpacing: "-0.01em",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 980,
          padding: "12px 24px",
          fontSize: "1rem",
          fontWeight: 600,
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        containedPrimary: {
          background: "#000000",
          "&:hover": {
            background: "#333333",
          },
        },
        outlinedPrimary: {
          borderColor: "#000000",
          color: "#000000",
          "&:hover": {
            background: "rgba(0,0,0,0.04)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          boxShadow: "0 2px 20px rgba(0,0,0,0.08)",
          border: "none",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            backgroundColor: "#f5f5f7",
            "& fieldset": {
              borderColor: "transparent",
            },
            "&:hover fieldset": {
              borderColor: "#d2d2d7",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#000000",
              borderWidth: 1.5,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          padding: "8px",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          borderBottom: "1px solid #d2d2d7",
          backgroundColor: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(20px)",
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: "#e5e5ea",
        },
        bar: {
          borderRadius: 4,
          backgroundColor: "#000000",
        },
      },
    },
  },
});

export default theme;
