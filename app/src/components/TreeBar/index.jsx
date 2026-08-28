import { useEffect, useState, useRef, useCallback } from "react";
import * as Plot from "@observablehq/plot";

export default function TreeBar(props) {
  const { data } = props;
  const ref = useRef();

  useEffect(() => {
    const barChart = Plot.plot({
      marginLeft: 0,
      marginRight: 30,
      height: 600,
      x: { axis: null, label: null },
      y: { label: null, padding: 0.4 },
      marks: [
        Plot.barX(data, {
          x: "count",
          y: "essence_latin",
          //dy: 6,
          //padding: 4,
          dx: -3,
          inset: 4.5,
          fill: "#bbbbbb",
          sort: { y: "x", reverse: true, limit: 10 },
        }),

        Plot.text(data, {
          text: (d) => d.essence_latin,
          x: 0,
          y: "essence_latin",
          textAnchor: "start",
          dy: -24,
          fill: "black",
          fontSize: 24,
        }),

        Plot.text(data, {
          text: (d) => d.count,
          x: "count",
          y: "essence_latin",
          textAnchor: "start",
          dx: 0,
          fill: "black",
          fontSize: 24,
        }),
      ],
    });
    ref.current.append(barChart);
    return () => barChart.remove();
  }, [data]);
  return (
    <>
      <div ref={ref} style={{ height: "400px" }}></div>
    </>
  );
}
