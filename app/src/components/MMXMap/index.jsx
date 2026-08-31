import { useEffect, useState, useRef, useMemo } from "react";
import "../../styles.css";
import {
  Map,
  Popup,
  Layer,
  Source,
  NavigationControl,
  useControl,
} from "react-map-gl/maplibre";
import {
  GlobeControl,
  addProtocol,
  removeProtocol,
  setWorkerCount,
  setWorkerUrl,
} from "maplibre-gl";
// maplibre v6 resolves its worker at runtime from import.meta.url, i.e. next to
// the hashed bundle in dist/assets, where the build emits no worker file. The
// request then falls through to index.html and the browser blocks it on MIME
// type, leaving the map with no tiles. Letting Vite bundle and emit the worker
// itself gives us a URL that is correct under any base path.
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";
import { Typography, Box } from "@mui/material";
import "./style.css";
import { categories } from "./variables";
import _ from "lodash";

setWorkerUrl(maplibreWorkerUrl);

const buildPointsLayer = (filter) => ({
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
});

const blocksLayer = {
  id: "blocks",
  source: "blocks",
  "source-layer": "selected_blocks",
  type: "fill",
  paint: {
    "fill-outline-color": "#e57233",
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
    "line-color": "#e57233",
  },
};

// Labels come from a dedicated point-on-surface layer rather than from
// selected_blocks: tippecanoe clips polygons at tile boundaries, so labelling
// the polygons directly repeats a block's id once per clipped piece.
const blocksLabelLayer = {
  id: "blocksLabels",
  type: "symbol",
  source: "blockLabels",
  "source-layer": "selected_blocks_labels",
  minzoom: 8,
  layout: {
    // "CA-62106", the block-level prefix of the point ids it contains.
    // point_id_full is a points attribute and does not exist on blocks.
    "text-field": ["get", "block_id"],
    // A single font: the glyphs endpoint serves one directory per font, and
    // MapLibre requests the whole text-font array as one comma-joined path.
    "text-font": ["Open Sans Regular"],
    "text-size": ["interpolate", ["linear"], ["zoom"], 10, 13, 16, 18],
  },
  paint: {
    "text-color": "#fafafa",
    "text-halo-color": "#363636",
    "text-halo-width": 2,
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

function LegendControl() {
  useControl(() => new MapLibreLegendControl(), { position: "top-left" });
  return null;
}

const PMTilesMMX = ({ pointsLayer }) => (
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
    <Source
      id="blockLabels"
      type="vector"
      url={`pmtiles://https://object-arbutus.alliancecan.ca/09f4ffc6879c42029e6126b269cf6560:monarques/pmtiles/selected_blocks_labels.pmtiles`}
    >
      <Layer {...blocksLabelLayer} />
    </Source>
  </>
);

const MMXMap = (props) => {
  const { baseLayer, setPointStats, lang, t } = props;
  const [popupInfo, setPopupInfo] = useState(null);
  const [filter, setFilter] = useState(["all"]);
  const mapRef = useRef();

  const pointsLayer = useMemo(() => buildPointsLayer(filter), [filter]);

  // Must keep a stable identity: react-map-gl compares mapStyle by reference
  // and calls map.setStyle() whenever it changes, which tears down and re-adds
  // every source added by the <Source> components below.
  const mapStyle = useMemo(
    () => ({
      version: 8,
      // Required for any symbol/text layer. Uploaded by docker/upload-fonts.sh.
      glyphs:
        "https://object-arbutus.alliancecan.ca/09f4ffc6879c42029e6126b269cf6560:monarques/fonts/{fontstack}/{range}.pbf",
      sources: {
        background:
          baseLayer.type == "tiles"
            ? {
                type: "raster",
                tiles: [baseLayer.layer_source_url],
                tileSize: 256,
              }
            : {
                type: "raster",
                url: baseLayer.layer_source_url,
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
    }),
    [baseLayer],
  );

  useEffect(() => {
    let protocol = new Protocol();
    addProtocol("pmtiles", protocol.tile);
    setWorkerCount(2);
    return () => {
      removeProtocol("pmtiles");
    };
  }, []);

  return (
    <div id="App" className="App" style={{ width: "100%", height: "100%" }}>
      <Map
        ref={mapRef}
        //reuseMaps
        style={{ width: "100%", height: "100%" }}
        initialViewState={{
          longitude: -93,
          latitude: 55,
          zoom: 3.8,
        }}
        projection={{
          type: "globe",
        }}
        interactiveLayerIds={["points"]}
        onMoveEnd={() => {
          if (!mapRef.current) return;
          const visiblePoints = mapRef.current.queryRenderedFeatures({
            layers: ["points"],
          });
          setPointStats({
            visible: visiblePoints.length,
            categories: _(visiblePoints)
              .groupBy("properties.cec_landcover_sector_long")
              .map((items, cat) => ({
                category: cat,
                count: items.length,
              }))
              .value(),
          });
        }}
        onLoad={() => {
          mapRef.current.addControl(new GlobeControl());
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
              setPopupInfo(null);
            } else {
              setPopupInfo({
                latitude: e.lngLat.lat,
                longitude: e.lngLat.lng,
                properties: feat[0].properties,
              });
            }
          }
        }}
        mapStyle={mapStyle}
      >
        <NavigationControl position="bottom-right" />
        <LegendControl />
        <PMTilesMMX pointsLayer={pointsLayer} />
        {popupInfo && (
          <Popup
            latitude={popupInfo.latitude}
            longitude={popupInfo.longitude}
            closeOnClick={false}
            onClose={() => setPopupInfo(null)}
            closeButton={true}
          >
            <div className="popup-content">
              <Box
                sx={{
                  margin: "0px 0 0px 0",
                  backgroundColor:
                    categories[popupInfo.properties.cec_landcover_sector_long],
                  padding: "18px 18px 15px 18px",
                  "font-weight": "bold",
                  borderRadius: "10px 10px 0px 0px",
                }}
              >
                <Typography sx={{ color: "#dfdfdf", fontSize: "0.7rem" }}>
                  POINT ID
                </Typography>
                <Typography
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    "font-size": "1.2rem",
                  }}
                >
                  {popupInfo.properties.point_id_full}
                </Typography>
              </Box>
              <div className="popup-details">
                <Typography variant="h5">Land cover</Typography>
                <Typography className="popup-item">
                  {popupInfo.properties.cec_landcover_sector_long}
                </Typography>
                <Typography variant="h5">Province</Typography>
                <Typography className="popup-item">
                  {popupInfo.properties.province}
                </Typography>
                <Typography variant="h5">Latitude</Typography>
                <Typography className="popup-item">
                  {Math.round(popupInfo.properties.latitude * 100000) / 100000}
                </Typography>
                <Typography variant="h5">Longitude</Typography>
                <Typography className="popup-item">
                  {Math.round(popupInfo.properties.longitude * 100000) / 100000}
                </Typography>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};

export default MMXMap;
