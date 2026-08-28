import { useState } from "react";
import "./styles.css";
import { LayersOutlined } from "@mui/icons-material";
import Tooltip from "@mui/material/Tooltip";
import carto from "./carto.png";
import cartoDark from "./cartoDark.png";
import googleHybrid from "./googleHybrid.png";
import googleMaps from "./googleMaps.png";
import esriSatellite from "./esriSatellite.png";

const LayerItem = ({ layer, onSelectLayer, ...rest }) => {
  return (
    <Tooltip title={layer.title}>
      <div
        {...rest}
        className="layer-item"
        onClick={() => {
          if (onSelectLayer) onSelectLayer(layer);
        }}
      >
        {!layer.layer_snapshot && layer.title}
        {layer.layer_snapshot && (
          <div style={{ position: "relative" }}>
            <img
              src={layer.layer_snapshot}
              style={{
                display: "block",
                width: "100px",
                height: "100px",
                borderRadius: "0.5rem",
              }}
            />
            <div
              style={{
                position: "absolute",
                display: "flex",
                justifyContent: "center",
                justifyItems: "center",
                zIndex: 100,
                bottom: "0px",
                width: "100%",
                backgroundColor: "rgba(0,0,0,0.6)",
                borderRadius: "0 0 0.5rem 0.5rem",
                paddingBottom: "6px",
                paddingTop: "6px",
              }}
            >
              <span
                style={{
                  textAlign: "center",
                  maxWidth: "90px",
                  color: "white",
                  fontSize: "10px",
                  fontWeight: "bold",
                }}
              >
                {layer.title}
              </span>
            </div>
          </div>
        )}
      </div>
    </Tooltip>
  );
};

export const LayerSelector = ({ notifyLayerChange }) => {
  const [expand, setExpand] = useState(false);

  const layers = [
    {
      layer_source_url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
      layer_snapshot: googleHybrid,
      layer_title: "Google Hybrid",
    },
    {
      layer_source_url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
      layer_snapshot: googleMaps,
      layer_title: "Google Maps",
    },
    {
      layer_source_url:
        "https://01.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      layer_snapshot: cartoDark,
      layer_title: "Dark basemap",
    },
    {
      layer_source_url:
        "https://01.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png",
      layer_snapshot: carto,
      layer_title: "Light basemap",
    },
    {
      layer_source_url:
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      layer_snapshot: esriSatellite,
      layer_title: "ESRI satellite",
    },
  ];

  const onClick = () => {
    setExpand(!expand);
  };

  const onLayerClick = (layer) => {
    setExpand(false);
    if (notifyLayerChange) notifyLayerChange(layer);
  };

  return (
    <div className="selector-frame">
      <Tooltip title={"Sélectionnez un couche de fond"}>
        <div className="selector-container">
          <div className="selector-btn" onClick={onClick}>
            <LayersOutlined />
          </div>
          <div className={`layers-container  ${!expand ? "collapsed" : ""}`}>
            {layers?.map((layer, index) => {
              return (
                <LayerItem
                  key={`${layer.title}-${index}`}
                  layer={layer}
                  onSelectLayer={onLayerClick}
                />
              );
            })}
          </div>
        </div>
      </Tooltip>
    </div>
  );
};
