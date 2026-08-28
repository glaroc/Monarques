import React from "react";
import { createTheme } from "@mui/material/styles";
import { Box, autocompleteClasses } from "@mui/material/";
import { outlinedInputClasses } from "@mui/material/OutlinedInput";

// A custom theme for this app
const theme = {
  palette: {
    color: "white",
    primary: {
      main: "#fff",
      contrastText: "#bbb",
      light: "#8cc63f",
      dark: "#333",
    },
    secondary: {
      main: "#22e6d2",
      light: "#aaa",
      contrastText: "#bbb",
      dark: "#333",
    },
    background: {
      paper: "white",
    },
    info: {
      main: "#aaa",
    },
    error: {
      main: "#aaa",
      contrastText: "#bbb",
      dark: "#bbb",
    },
    success: {
      main: "#1d7368",
    },
  },
  typography: {
    fontFamily: "Montserrat",
    color: "white",
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 700,
      color: "#aaa",
    },
  },
  sidebarWidth: 240,
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderColor: "white",
        },
        root: {
          [`&:hover .${outlinedInputClasses.notchedOutline}`]: {
            border: "1px solid white",
          },
          [`&.Mui-focused .${outlinedInputClasses.notchedOutline}`]: {
            border: "1px solid white",
          },
        },
      },
    },
  },
};

/*type CustomTheme = {
  [Key in keyof typeof theme]: (typeof theme)[Key];
};

declare module '@mui/material/styles/createTheme' {
  interface Theme extends CustomTheme {}
  interface ThemeOptions extends CustomTheme {}
}*/

export default createTheme(theme);
