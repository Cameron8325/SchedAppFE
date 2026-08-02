import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#B33A24',
      dark: '#862718',
      light: '#D96A4D',
      contrastText: '#FFFDF7',
    },
    secondary: {
      main: '#173F36',
      dark: '#0D2923',
      light: '#4E746A',
      contrastText: '#FFFDF7',
    },
    background: {
      default: '#F3F0E8',
      paper: '#FFFDF7',
    },
    text: {
      primary: '#17201D',
      secondary: '#58625E',
    },
    divider: '#D7D1C4',
  },
  shape: {
    borderRadius: 3,
  },
  typography: {
    fontFamily: '"Avenir Next", "Segoe UI", sans-serif',
    h1: {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontWeight: 400,
      letterSpacing: 0,
    },
    h2: {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontWeight: 400,
      letterSpacing: 0,
    },
    h3: {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontWeight: 400,
      letterSpacing: 0,
    },
    h4: {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontWeight: 400,
      letterSpacing: 0,
    },
    button: {
      fontWeight: 700,
      letterSpacing: 0,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F3F0E8',
          color: '#17201D',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          minHeight: 44,
          borderRadius: 2,
          paddingInline: 20,
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #D7D1C4',
          boxShadow: 'none',
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #D7D1C4',
        },
        indicator: {
          height: 3,
          backgroundColor: '#B33A24',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: '#58625E',
          fontWeight: 700,
          '&.Mui-selected': {
            color: '#17201D',
          },
        },
      },
    },
  },
});

export default theme;
