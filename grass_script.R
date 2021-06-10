library(rgrass7)

initGRASS('/usr/lib/grass74/',gisDbase = '/home/glaroc/Monarques/GRASS',location = 'CEC',mapset = 'PERMANENT',override = TRUE)


library(rgrass7)
initGRASS('/usr/lib/grass74/',gisDbase = '/home/ubuntu/data/GRASS',location = 'monarques',mapset = 'PERMANENT',override = TRUE)

##CREATION OF THE BASE LAND COVER LAYER WITH ROADS, RAILS AND TRANSMISSION LINES
execGRASS('r.in.gdal',input = '/home/glaroc/Monarques/Cartes_GIS/CEC_land_cover/CAN_NALCMS_2015_LC_30m_LAEA_mmu5pix_.tif',output = 'CEC', memory=10000)
execGRASS('g.region',raster='CEC')
execGRASS('v.in.ogr',input='/home/ubuntu/data/Monarques/Cartes_GIS/Roads/canada_hwy.shp', output= 'Roads', flags=c('overwrite'))
execGRASS('v.in.ogr',input='/home/ubuntu/data/Monarques/Cartes_GIS/Rail/canada_rails_cec.shp', output= 'Rails', flags=c('overwrite'))
execGRASS('v.in.ogr',input='/home/ubuntu/data/Monarques/Cartes_GIS/transmission_lines_OSM_CEC.gpkg', output= 'Transmission', flags=c('overwrite'))
execGRASS('v.in.ogr',input='/home/ubuntu/data/Monarques/Cartes_GIS/protected_areas_canada_qc.shp', output= 'Protected', snap='1e-09', flags=c('overwrite'))
execGRASS('v.to.rast',input= 'Roads',output = 'Roads', use='val',value=20, memory=150000, flags=c('overwrite'))
execGRASS('v.to.rast',input= 'Rails',output = 'Rails', use='val',value=21, memory=150000, flags=c('overwrite'))
execGRASS('v.to.rast',input= 'Transmission',output = 'Transmission', use='val',value=22, memory=150000, flags=c('overwrite'))
execGRASS('v.to.rast',input= 'Protected',output = 'Protected', use='val',value=100, memory=150000, flags=c('overwrite'))
execGRASS('r.patch',input='Roads, Rails, Transmission, CEC',output='CEC2', flags=c('overwrite'))
execGRASS('r.null',null=0,map='CEC2')
execGRASS('r.null',null=0,map='Protected')
execGRASS('r.mapcalc',expression='CEC_pa = CEC2+Protected', flags=c('overwrite'))
execGRASS('r.out.gdal', input='CEC_pa',output='/home/ubuntu/data/Monarques/cec_pa_lines.tif', format='GTiff',createopt="COMPRESS=DEFLATE")
##LAND COVER SUITABLE FOR MONARCHS
execGRASS('r.reclass', input = 'CEC_pa', output='CEC_suitable', rules='/home/ubuntu/data/Monarques/cec_reclass.txt', flags=c('overwrite'))
##EXTRACT LAND COVERS FOR EACH GTRS ZONE
execGRASS('v.in.ogr',input='/home/ubuntu/data/Monarques/canada_mastersample_in_range_poly_cec.shp', output='gtrs_10', flags=c('overwrite'))
execGRASS('v.to.rast',input='gtrs_10', output='CEC_suitable', use='attr',attribute_column='GTRS_ID',memory=150000, flags=c('overwrite'))
execGRASS('r.stats.zonal',base='gtrs_10', cover='CEC_suitable',method='sum',output='gtrs_suitable_zonal', flags=c('overwrite'))
execGRASS('r.out.gdal',input='gtrs_suitable_zonal',output='/home/ubuntu/data/Monarques/gtrs_suitable_zonal.tif', format='GTiff',createopt="COMPRESS=DEFLATE")
execGRASS('r.to.vec',input='gtrs_suitable_zonal', output='gtrs_suitable_zonal',type='area',column='suitable', flags=c('overwrite'))
execGRASS('v.out.ogr',input='gtrs_suitable_zonal', type='area',output='/home/ubuntu/data/Monarques/gtrs_suitable_zonal.gpkg')
