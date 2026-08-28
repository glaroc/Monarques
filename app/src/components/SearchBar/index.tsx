import { useEffect, useState } from "react";
import { TextField, ButtonGroup, Chip, Grid } from "@mui/material";
import {
  CustomButton,
  CustomAutocomplete,
  CustomPaper,
} from "../../styles/customMUI";
import Search from "@mui/icons-material/Search";
import theme from "../../styles/theme";

export default function SearchBar(props: any) {
  const {
    searchBarValue,
    setSearchBarValue,
    searchButtonClicked,
    treeColors,
    options,
    t,
    lang,
  } = props;

  return (
    <ButtonGroup>
      <CustomAutocomplete
        multiple
        id="size-small-filled-multi"
        size="small"
        options={options}
        getOptionLabel={(option: any) => option.label}
        sx={{
          width: { xs: "150px", md: "200px", lg: "250px" },
          "& .MuiSvgIcon-root": {
            color: "#aaa",
          },
        }}
        value={searchBarValue}
        PaperComponent={CustomPaper}
        onChange={(e, value) => setSearchBarValue(value)}
        renderTags={(value, getTagProps) =>
          value.map((option: any, index) => (
            <Chip
              variant="outlined"
              label={option.label}
              size="small"
              sx={{
                color: "white",
                "& .MuiSvgIcon-root": {
                  color: "white",
                },
              }}
              {...getTagProps({ index })}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            label={t("Rechercher par espèce", lang)}
            placeholder={
              searchBarValue.length === 0
                ? t("Entrer le nom de l'espèce", lang)
                : ""
            }
          />
        )}
      />
      <CustomButton onClick={searchButtonClicked}>
        <Search></Search>
      </CustomButton>
    </ButtonGroup>
  );
}
