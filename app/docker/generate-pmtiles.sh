#!/bin/bash

printf -v date '%(%Y-%m-%d)T' -1 

#date='2024-01-24'

echo -e "== Generating GeoParquets =="
rm -rif /results/jan2023/selected_blocks.parquet
ogr2ogr -f Parquet -s_srs EPSG:4326 -t_srs EPSG:4326 /data/selected_blocks.parquet /results/jan2023/selected_blocks_2023c_with_provinces.gpkg

echo -e "== Generating GeoJSON =="
rm -rif /data/selected_blocks.geojson
# -nln pins the layer name: without it the layer inherits the source gpkg's name
# ("output"), which the label query below has to reference.
ogr2ogr -overwrite -f GeoJSON -t_srs EPSG:4326 -nln selected_blocks /data/selected_blocks.geojson /results/jan2023/selected_blocks_2023c_with_provinces.gpkg && chmod 777 /data/selected_blocks.geojson
rm -rif /data/final_points_selection_2023_with_all_cats.gpkg
ogr2ogr -overwrite -f GeoJSON -t_srs EPSG:4326 /data/final_points.geojson /results/jan2023/final_points_selection_2023_with_all_cats.gpkg && chmod 777 /data/final_points.geojson

echo -e "== Generating block label points =="
# One point per block, guaranteed inside the polygon, so the map labels each
# block exactly once instead of once per tile-clipped piece.
# block_id mirrors the prefix of the point ids inside the block: a block labelled
# CA-62106 contains the points CA-62106-1, CA-62106-2, ...
rm -rif /data/selected_blocks_labels.geojson
ogr2ogr -overwrite -f GeoJSON -t_srs EPSG:4326 -nlt POINT \
  -dialect SQLITE -sql "SELECT ST_PointOnSurface(geometry) AS geometry, 'CA-' || grts_id AS block_id, grts_id FROM selected_blocks" \
  /data/selected_blocks_labels.geojson /data/selected_blocks.geojson \
  && chmod 777 /data/selected_blocks_labels.geojson


#echo -e "== Sending files to cloud =="
#s5cmd cp -acl 'public-read' /tmp/arbres_publics_mtl.parquet s3://arbres/mtl/parquet/

echo -e "== Generating PMTiles file =="
tippecanoe -Z8 -zg --no-feature-limit --no-tile-size-limit -o /data/final_points.pmtiles -l final_points --force /data/final_points.geojson
tippecanoe  -zg -l selected_blocks --force /data/selected_blocks.geojson -o /data/selected_blocks.pmtiles
# -r1 keeps every label point: the default drop rate thins points below the max
# zoom, which would silently delete labels at the zooms where they are shown.
tippecanoe -Z8 -zg -r1 -l selected_blocks_labels --force /data/selected_blocks_labels.geojson -o /data/selected_blocks_labels.pmtiles

s5cmd cp -acl 'public-read' "/data/*" s3://monarques/pmtiles/


#echo -e "== Sending files to cloud =="
#s5cmd cp -acl 'public-read' /data/final_points.pmtiles s3://arbres/mtl/pmtiles/

#echo -e "== Generate Species and number of observations table =="
#./duckdb :memory: "COPY (SELECT SIGLE as sigle,  string_agg(DISTINCT essence_latin) as essence_latin, string_agg(DISTINCT essence_fr,',') as essence_fr, string_agg(DISTINCT essence_en,',') as essence_en, count(*) as n_trees FROM read_parquet('/tmp/arbres_publics_mtl.parquet') GROUP BY sigle ORDER BY n_trees DESC) TO '/tmp/arbres_publics_mtl_freq.json' (ARRAY true);"

#echo -e "== Sending files to cloud =="
#s5cmd cp -acl 'public-read' /tmp/arbres_publics_mtl_freq.json s3://arbres/mtl/pmtiles/

#echo -e "== Sending file to cloud =="
#docker compose run --rm  spatial s5cmd cp -acl public-read /tmp/atlas_datasets_${date}.json s3://bq-io/atlas/parquet/
#docker compose run --rm  spatial s5cmd cp -acl public-read /tmp/atlas_datasets_public_${date}.json s3://bq-io/atlas/parquet/

#echo -e "== Generating PMTiles file =="
#docker compose run --rm spatial tippecanoe -zg -o /tmp/atlas_${date}.pmtiles --drop-densest-as-needed --extend-zooms-if-still-dropping -l atlas -P --force /tmp/atlas_${date}.csv

#echo -e "== Sending file to cloud =="
#docker compose run --rm spatial s5cmd cp -acl acl-public /tmp/atlas_${date}.pmtiles s3://bq-io/atlas-pmtiles/
