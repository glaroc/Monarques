import { useEffect, useState, useRef, useCallback } from "react";
import {
  Grid,
  Card,
  CardContent,
  Box,
  Select,
  OutlinedInput,
  Chip,
  Typography,
  MenuItem,
  FilledInput,
  InputLabel,
  Input,
  TextField,
} from "@mui/material";

export default function TreeBar2(props: any) {
  const { data, treeColors, lang, t } = props;
  const [bars, setBars] = useState([]);

  useEffect(() => {
    let w = 0;
    let i = 0;
    let allBars = data.filter((f: any) => {
      i++;
      return i <= 8;
    });

    allBars = allBars.map((d: any) => {
      w = w == 0 ? d.count : w;
      return (
        <Grid container sx={{ marginBottom: "5px" }}>
          <Grid item xs={12}>
            <Typography sx={{ fontSize: 15, color: "white" }}>
              {d[`essence_${lang}`]}
            </Typography>
          </Grid>
          <Grid item xs={10}>
            <Grid container>
              <Grid
                item
                xs={(11 * d.count) / w}
                sx={{
                  background: "#cccccc",
                  height: "13px",
                  border: "1px solid white",
                  borderRadius: "0 4px 0 0",
                  boxShadow: "2px 2px 2px #777777",
                }}
              >
                {" "}
                <Typography
                  sx={{
                    fontSize: 12,
                    float: "right",
                    color: "black",
                    lineHeight: 1,
                    marginRight: "4px",
                  }}
                >
                  {d.count}
                </Typography>
              </Grid>
              <Grid item xs={11 - (10 * d.count) / w} sx={{ height: "15px" }}>
                <Box
                  sx={{
                    background: treeColors[d[`essence_${lang}`]],
                    marginLeft: "8px",
                    borderRadius: "10px",
                    height: "15px",
                    width: "15px",
                  }}
                ></Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      );
    });
    setBars(allBars);
  }, [data]);
  return <>{bars}</>;
}
