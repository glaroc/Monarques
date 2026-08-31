import { useEffect, useState, useRef, useCallback, memo } from "react";
import "../../styles.css";
import {
  Map,
  Popup,
  Layer,
  Source,
  useMap,
  NavigationControl,
  useControl,
} from "react-map-gl";
import maplibregl, { setWorkerCount } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";
//import duckdb_init from "../../helpers/duckdb";
import randomcolor from "randomcolor";
import chroma from "chroma-js";
import _ from "lodash";
import { Typography } from "@mui/material";
import "./style.css";

const MMXMap = (props) => {
  const { baseLayer, lang, t } = props;
  const popupRef = useRef();
  const [showPopup, setShowPopup] = useState(true);
  const [popup, setPopup] = useState(<></>);
  const [opacity, setOpacity] = useState(0);
  const defaultCircleRadius = [
    "interpolate",
    ["linear"],
    ["zoom"],
    5,
    0.1,
    18,
    6,
  ];
  const [filter, setFilter] = useState(["all"]);
  const mapRef = useRef();

  const categories = {
    "Grassland or shrubland": "#0f9973",
    Wetland: "#1d7cb4",
    Developed: "#e459fc",
    "Right-of-way": "#8718b4",
    Cropland: "#b95b00",
    "Protected wetland": "#9bd9ff",
    "Protected cropland": "#fcc101",
    "Protected grassland": "#0aff81",
    Others: "#ccc",
  };

  const pointsLayer = {
    id: "points",
    source: "points",
    "source-layer": "final_points",
    type: "circle",
    filter: filter,
    paint: {
      "circle-color": [
        "match",
        ["get", "cec_landcover_sector_long"],
        ...Object.entries(categories).flatMap(([name, color]) => [name, color]),
        "#ccc",
      ],
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 4, 14, 8],
      "circle-opacity": 1,
      "circle-stroke-opacity": 0.7,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#333333",
    },
  };

  const blocksLayer = {
    id: "blocks",
    source: "blocks",
    "source-layer": "selected_blocks",
    type: "fill",
    paint: {
      "fill-outline-color": "#fff",
      "fill-opacity": 0.1,
      "fill-color": "#fff",
    },
  };

  const blocksOutlineLayer = {
    id: "blocksLine",
    source: "blocks",
    "source-layer": "selected_blocks",
    type: "line",
    paint: {
      "line-width": 3,
      "line-opacity": 0.8,
      "line-color": "#fff",
    },
  };

  class MapLibreLegendControl {
    onAdd(map) {
      this._map = map;
      this._container = document.createElement("div");
      this._container.className =
        "maplibregl-ctrl maplibregl-ctrl-group legend-control";
      this._container.innerHTML = `<div style="text-align: left;padding: 20px; background: white; border-radius: 4px; font-family: sans-serif; font-size: 12px; line-height: 18px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
          <h4 style="margin: 0 0 5px;">Land cover categories</h4>
              ${Object.entries(categories)
                .map(
                  ([name, color]) =>
                    `<div><span style="text-align: left; background-color: ${color}; display: inline-block; width: 12px; height: 12px; margin-right: 5px; border-radius: 50%;"></span>${name}</div>`,
                )
                .join("")}
        </div>`;

      return this._container;
    }
    onRemove() {
      this._container.parentNode.removeChild(this._container);
      this._map = undefined;
    }
  }

  function LegendControl(props) {
    useControl(() => new MapLibreLegendControl(), { position: "top-left" });
    return null;
  }

  useEffect(() => {
    let protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);
    setWorkerCount(2);
    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  const PMTilesMMX = () => (
    <>
      <Source
        id="blocks"
        type="vector"
        url={`pmtiles://https://object-arbutus.alliancecan.ca/09f4ffc6879c42029e6126b269cf6560:monarques/pmtiles/selected_blocks.pmtiles`}
      >
        <Layer {...blocksLayer} />
        <Layer {...blocksOutlineLayer} />
      </Source>
      <Source
        id="points"
        type="vector"
        url={`pmtiles://https://object-arbutus.alliancecan.ca/09f4ffc6879c42029e6126b269cf6560:monarques/pmtiles/final_points.pmtiles`}
      >
        <Layer {...pointsLayer} />
      </Source>
    </>
  );

  return (
    <div id="App" className="App">
      <Map
        ref={mapRef}
        //reuseMaps
        style={{ width: "100vw", height: "100vh" }}
        initialViewState={{
          longitude: -90,
          latitude: 45,
          zoom: 4,
        }}
        interactiveLayerIds={["points"]}
        onMoveEnd={() => {}}
        onLoad={() => {
          setMapLoaded(true);
          mapRef.current.on("mouseleave", "points", () => {
            mapRef.current.getCanvas().style.cursor = "";
          });
        }}
        onMouseEnter={(e) => {
          if (mapRef.current.getZoom() > 10) {
            mapRef.current.getCanvas().style.cursor = "pointer";
          }
        }}
        onMouseLeave={(e) => {
          mapRef.current.getCanvas().style.cursor = "";
        }}
        onClick={(e) => {
          if (mapRef.current.getZoom() > 10) {
            const feat = mapRef.current
              .queryRenderedFeatures(e.point)
              .filter((f) => ["points"].includes(f.layer.id));
            if (feat.length === 0) {
              setShowPopup(false);
            } else {
              setShowPopup(true);
              setPopup(
                <Popup
                  latitude={e.lngLat.lat}
                  longitude={e.lngLat.lng}
                  closeOnClick={false}
                  onClose={() => setShowPopup(false)}
                  closeButton={true}
                >
                  <div class="popup-content">
                    <Typography variant="h3" class="popup-title">
                      {feat[0].properties.point_id_full}
                    </Typography>
                    <Typography variant="h5">Latitude</Typography>
                    <Typography class="popup-item">
                      {feat[0].properties.latitude}
                    </Typography>
                    <Typography variant="h5">Longitude</Typography>
                    <Typography class="popup-item">
                      {feat[0].properties.longitude}
                    </Typography>
                    <Typography variant="h5">Province</Typography>
                    <Typography class="popup-item">
                      {feat[0].properties.province}
                    </Typography>
                    <Typography variant="h5">Land cover</Typography>
                    <Typography class="popup-item">
                      {feat[0].properties.cec_landcover_sector_long}
                    </Typography>
                  </div>
                </Popup>,
              );
            }
          }
        }}
        mapStyle={{
          version: 8,
          sources: {
            background: {
              type: "raster",
              tiles: [baseLayer],
              tileSize: 256,
            },
          },
          layers: [
            {
              id: "google-sat",
              source: "background",
              type: "raster",
              minzoom: 0,
              maxzoom: 22,
            },
          ],
        }}
        mapLib={maplibregl}
      >
        <NavigationControl position="bottom-left" />
        <LegendControl />
        <PMTilesMMX />
        {showPopup && <> {popup} </>}
      </Map>
    </div>
  );
};

export default MMXMap;
