import { useEffect, useState, useRef, useCallback, memo } from "react";
import "../../styles.css";
import { Map, Popup, Layer, Source, useMap } from "react-map-gl";
import maplibregl, { setWorkerCount } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";
//import duckdb_init from "../../helpers/duckdb";
import randomcolor from "randomcolor";
import chroma from "chroma-js";
import _ from "lodash";

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

  const pointsLayer = {
    id: "points",
    source: "points",
    "source-layer": "final_points",
    type: "circle",
    filter: filter,
    paint: {
      "circle-color": "#33aaff",
      "circle-radius": 3,
      "circle-opacity": 0.7,
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
      "fill-opacity": 0.3,
      "fill-color": "#33aaff",
    },
  };

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
        id="points"
        type="vector"
        url={`pmtiles://https://object-arbutus.alliancecan.ca/09f4ffc6879c42029e6126b269cf6560:monarques/pmtiles/final_points.pmtiles`}
      >
        <Layer {...pointsLayer} />
      </Source>
      <Source
        id="blocks"
        type="vector"
        url={`pmtiles://https://object-arbutus.alliancecan.ca/09f4ffc6879c42029e6126b269cf6560:monarques/pmtiles/selected_blocks.pmtiles`}
      >
        <Layer {...blocksLayer} />
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
        onMoveEnd={() => {}}
        onLoad={() => {
          setMapLoaded(true);
          mapRef.current.on("mouseenter", "points", () => {
            if (mapRef.current.getZoom() > 15) {
              mapRef.current.getCanvas().style.cursor = "pointer";
            }
          });
          mapRef.current.on("mouseleave", "points", () => {
            mapRef.current.getCanvas().style.cursor = "";
          });
        }}
        onClick={(e) => {
          if (mapRef.current.getZoom() > 14) {
            const feat = mapRef.current.queryRenderedFeatures(e.point);
            const popupText = feat.map((f) => `Popup`);
            if (feat.length === 0) {
              setShowPopup(false);
            } else {
              setShowPopup(true);
            }
            setPopup(
              <Popup
                latitude={e.lngLat.lat}
                longitude={e.lngLat.lng}
                closeOnClick={false}
                onClose={() => setShowPopup(false)}
                closeButton={true}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: popupText.join("<hr>"),
                  }}
                ></div>
              </Popup>,
            );
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
        <PMTilesMMX />
        {showPopup && <> {popup} </>}
      </Map>
    </div>
  );
};

export default MMXMap;
