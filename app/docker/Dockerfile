FROM ghcr.io/osgeo/gdal:ubuntu-full-latest

RUN apt update \
  && apt -y install build-essential libsqlite3-dev zlib1g-dev wget git

WORKDIR "/app/"

RUN git clone https://github.com/felt/tippecanoe.git

WORKDIR "/app/tippecanoe/"

RUN make

CMD make test

RUN make install

WORKDIR "/tmp/"

RUN wget https://github.com/peak/s5cmd/releases/download/v2.2.2/s5cmd_2.2.2_linux_amd64.deb

RUN dpkg -i s5cmd_2.2.2_linux_amd64.deb

WORKDIR "/app/"

RUN wget https://github.com/duckdb/duckdb/releases/download/v0.9.2/duckdb_cli-linux-amd64.zip 

RUN unzip duckdb_cli-linux-amd64.zip 