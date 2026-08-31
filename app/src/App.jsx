import { useEffect, useState, useRef, useCallback } from "react";
import "./styles.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";
import { useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  Box,
  Typography,
  SwipeableDrawer,
  LinearProgress,
} from "@mui/material";
import { LayerSelector } from "./components/LayerSelector";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import theme from "./styles/theme";
import SearchBar from "./components/SearchBar";
import { t } from "./helpers/translations";
import MMXMap from "./components/MMXMap";
import { styled } from "@mui/material";
import { categories } from "./components/MMXMap/variables";

export default function App(props) {
  const mapRef = useRef();
  const popupRef = useRef();
  const [baseLayer, setBaseLayer] = useState({
    layer_source_url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    type: "tiles",
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [lang, setLang] = useState("fr");
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState(false);
  const [pointStats, setPointStats] = useState({
    visible: 0,
    categories: [],
  });

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
    setBaseLayer(layer);
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
        <Box sx={{ display: "flex", width: "100%", height: "100vh" }}>
          <Box sx={{ position: "relative", flex: "0 0 75%", minWidth: 0 }}>
            <MMXMap
              baseLayer={baseLayer}
              setPointStats={setPointStats}
              lang={lang}
              t={t}
            />
            <LayerSelector notifyLayerChange={notifyLayerChange} />
          </Box>
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              overflowY: "auto",
              background: "#fff",
              padding: "20px",
              zIndex: 99,
            }}
          >
            <Box
              sx={{
                width: "90%",
                height: "140px",
                background: "url('logo_mmx_en.png')",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
              }}
            />
            {pointStats.visible > 0 && (
              <>
                <Card
                  sx={{
                    marginTop: "40px",
                    border: "1px solid #c5c3c3",
                    borderRadius: "8px",
                  }}
                >
                  <CardContent>
                    <Typography
                      sx={{
                        fontSize: "1rem",
                        fontWeight: "normal",
                        color: "#7e7e7e",
                      }}
                      gutterBottom
                    >
                      {"Number of points on screen"}
                    </Typography>
                    <Typography
                      gutterBottom
                      sx={{
                        color: "#e57233",
                        fontSize: "36px",
                        fontWeight: "bold",
                        mb: 0,
                      }}
                    >
                      {pointStats.visible}
                    </Typography>
                  </CardContent>
                </Card>
                <Card
                  sx={{
                    marginTop: "40px",
                    border: "1px solid #c5c3c3",
                    padding: "20px",
                    borderRadius: "8px",
                  }}
                >
                  <Box sx={{ mb: 2 }}>
                    {pointStats.categories.map((cat, idx) => (
                      <Box sx={{ mb: 2 }} key={idx}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 0.5,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 700, color: "#11221C" }}
                          >
                            {cat.category}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 800, color: "#64748B" }}
                          >
                            {cat.count} points
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={
                            (cat.count /
                              pointStats.categories.reduce(
                                (acc, c) => acc + c.count,
                                0,
                              )) *
                            100
                          }
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: "#E2ECE5",
                            "& .MuiLinearProgress-bar": {
                              backgroundColor:
                                categories[cat.category] || "#2f302f",
                              borderRadius: 5,
                            },
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Card>
              </>
            )}
            {pointStats.visible == 0 && (
              <Box sx={{ mt: 4, textAlign: "center" }}>
                <Typography>
                  Zoom in on the blocks to see the sampling points.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}
      {isMobile && (
        <Box
          sx={{
            position: "relative",
            overflow: "visible",
            width: "100%",
            height: "100vh",
            backgroundColor: "#333",
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
          <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
            <MMXMap baseLayer={baseLayer} lang={lang} t={t} />
            <LayerSelector notifyLayerChange={notifyLayerChange} />
          </Box>
        </Box>
      )}
    </ThemeProvider>
  );
}
