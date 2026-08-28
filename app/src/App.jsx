import { useEffect, useState, useRef, useCallback } from "react";
import "./styles.css";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";
import { useSearchParams } from "react-router-dom";
import {
  Grid,
  Card,
  CardContent,
  Box,
  Typography,
  SwipeableDrawer,
} from "@mui/material";
import { LayerSelector } from "./components/LayerSelector";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import theme from "./styles/theme";
import SearchBar from "./components/SearchBar";
import { t } from "./helpers/translations";
import MMXMap from "./components/MMXMap";
import { styled } from "@mui/material";

export default function App(props) {
  const mapRef = useRef();
  const popupRef = useRef();
  const [baseLayer, setBaseLayer] = useState(
    "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const [lang, setLang] = useState("fr");
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let lan = "fr";
    if (window.location.href.includes("/fr/")) {
      lan = "fr";
    }
    if (window.location.href.includes("/en/")) {
      lan = "en";
    }
    if (searchParams.get("lang")) {
      lan = searchParams.get("lang");
    }
    if (lan === "fr" || lan === "en") {
      setLang(lan);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.matchMedia("(max-width: 767px)").matches);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {}, [lang]);

  const notifyLayerChange = (layer) => {
    setBaseLayer(layer.layer_source_url);
  };

  const Puller = styled("div")(({ theme }) => ({
    width: 30,
    height: 8,
    backgroundColor: "#fff",
    borderRadius: 3,
    position: "absolute",
    top: 0,
    left: "calc(50% - 30px)",
    marginTop: 4,
    ...theme.applyStyles("dark", {
      backgroundColor: "#fff",
    }),
  }));

  return (
    <ThemeProvider theme={theme}>
      {!isMobile && (
        <Grid container>
          <Grid xs={6} md={7} lg={9} item>
            <MMXMap baseLayer={baseLayer} lang={lang} t={t} />
            <LayerSelector notifyLayerChange={notifyLayerChange} />
          </Grid>
          <Grid
            xs={6}
            md={5}
            lg={3}
            item
            sx={{ background: "#333333", padding: "20px", zIndex: 99 }}
          ></Grid>
        </Grid>
      )}
      {isMobile && (
        <Box
          sx={{
            position: "relative",
            overflow: "visible",
            backghroundColor: "#333",
          }}
        >
          <SwipeableDrawer
            anchor="bottom"
            open={open}
            onClose={() => {
              setOpen(false);
            }}
            onOpen={() => {
              setOpen(true);
            }}
            swipeAreaWidth={56}
            disableSwipeToOpen={false}
            keepMounted
            sx={{ overflow: "visible" }}
          >
            <Box
              sx={{
                position: "relative",
                overflow: "visible",
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
                visibility: "visible",
                right: 0,
                left: 0,
                top: -56,
                backgroundColor: "#333",
                marginTop: "10px",
              }}
            >
              <Puller />
            </Box>
          </SwipeableDrawer>
          <Grid container>
            <Grid xs={12} item>
              <>
                <MMXMap baseLayer={baseLayer} lang={lang} t={t} />
                <LayerSelector notifyLayerChange={notifyLayerChange} />
              </>
            </Grid>
          </Grid>
        </Box>
      )}
    </ThemeProvider>
  );
}
