library(rgrass7)
library(stringr)
initGRASS('/usr/lib/grass74/',gisDbase = '/home/ubuntu/data/GRASS',location = 'monarques',mapset = 'PERMANENT',override = TRUE)

execGRASS('r.reclass',input='CEC_pa',output='CEC_5cats',rules='/home/ubuntu/data/Monarques/cec_reclass_5cats.txt',c('overwrite'))
fids=execGRASS('v.db.select',map='selected_blocks',columns='fid',flags=c("c","v"))
fids=attr(fids,"resOut")
ii=0
for (i in fids) {
  execGRASS('v.extract',input='selected_blocks',output='block_temp',where=paste0("fid=",i),flags = c('overwrite'))
  execGRASS('g.region', vector='block_temp')
  execGRASS('r.mask',vector='block_temp', flags = c("overwrite"))
  execGRASS('r.to.vect',input='CEC_5cats', output='temp', type='point',flags = c('overwrite'))
  for (j in (1:5)) {
    execGRASS('v.extract',input='temp', output='temp2', where=paste0("value=",j),flags = c('overwrite'))
    tt=execGRASS('v.info',map='temp2',flags=c('t'))
    npoints=as.numeric(str_replace(attr(tt,"resOut")[2],'points=',''))
    if(npoints > 1){
      npoints=min(npoints-1,20)
      execGRASS('v.extract',input='temp2', output='temp3', random=npoints, flags = c('overwrite'))
      if(i==fids[1] && j==1){
        execGRASS('v.patch',input='temp3', output='all30',flags = c('overwrite'))
      }else{
        execGRASS('v.patch',input='temp3', output='all30',flags = c('a','overwrite'))
      }
    }
  }
  ii=ii+1
  print(ii/length(fids))
}
execGRASS('v.db.addtable',map='all30')
execGRASS('v.what.rast',map='all30',raster='CEC_pa',column='cover_type')
execGRASS('v.out.ogr', input='all30', type='point', output='/home/ubuntu/data/Monarques/all30.gpkg',flags=c('overwrite'))

#GENERATE POINT IDS

all30<-read.csv(file.choose())
for (i in unique(all30$block_id)) {
  all30[all30$block_id==i,'point_id'] <- seq(1,sum(all30$block_id==i))
}
all30$point_id_full=paste0('CA-',str_pad(all30$block_id,4,side='left',pad=0),'-',all30$point_id)

write.csv(all30,'all30_with_ids.csv')
