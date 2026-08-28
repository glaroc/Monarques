import { styled } from "@mui/material/styles";
import MenuItem from "@mui/material/MenuItem";
import { Autocomplete, Button, Paper } from "@mui/material";

export const CustomButton = styled(Button)(({ theme }) => ({
  color: theme.palette.primary.dark,
  border: `1px solid ${theme.palette.primary.main}`,
  background: theme.palette.primary.main,
  ":hover": {
    background: theme.palette.primary.light,
    color: theme.palette.primary.dark,
    fontWeight: 800,
  },
}));

export const CustomAutocomplete = styled(Autocomplete)(({ theme }) => ({
  "label + &": {
    marginTop: theme.spacing(1),
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.dark,
    fontSize: 14,
  },
  "& .MuiFormLabel-root": {
    color: theme.palette.primary.light,
    backgroundColor: theme.palette.primary.dark,
    fontSize: 14,
  },
  "& .MuiInputBase-input": {
    color: theme.palette.primary.light,
    fontSize: 14,
    backgroundColor: theme.palette.primary.dark,
  },
  "& .MuiMenu": {
    color: theme.palette.primary.light,
    backgroundColor: theme.palette.primary.dark,
    fontSize: 8,
  },
  "& .MuiInputPopper-root": {
    color: theme.palette.primary.dark,
    backgroundColor: theme.palette.primary.dark,
    fontSize: 8,
  },
  "& .MuiInputBase-root": {
    //border: `1px solid ${theme.palette.primary.main}`,
  },
  "& .Mui-focused .MuiInputBase-root": {
    border: `1px solid ${theme.palette.primary.main}`,
  },
}));

export const CustomPaper = styled(Paper)(({ theme }) => ({
  //background: theme.palette.primary.light,
  color: theme.palette.primary.dark,
  fontSize: "14px !important",
  lineHeight: "0em",
  "& li": {
    lineHeight: "1.2em",
  },
}));
