import axios from "axios";

export const getObsDatasetSummaryAPI = async ({
  taxa_group_key = null,
  taxa_keys = null,
  max_year = 9999,
  min_year = 0,
  region_type = null,
  region_fid = null,
}: any) => {
  const dataSummaryParamObj = {
    baseURL: import.meta.env.VITE_APP_ATLAS_API_URL,
    responseType: JSON,
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_APP_ATLAS_API_TOKEN}`,
      "Content-Profile": "atlas_api",
    },
    params: {
      taxa_group_key,
      taxa_keys,
      max_year,
      min_year,
      region_type,
      region_fid,
    },
  };

  const result: any = await makePostRequest(
    "/rpc/obs_dataset_summary",
    dataSummaryParamObj,
  );
  return result.data || [];
};

export const getSources = async (parquet_date: string) => {
  let result;
  try {
    result = await axios.get(
      `https://object-arbutus.cloud.computecanada.ca/bq-io/atlas/parquet/atlas_datasets_${parquet_date}.json`,
      {},
    );
  } catch (error) {
    const { message, response } = error as any;
    const { details, message: respMessage } = response.data;
    const msg = `request: ${message} \n ${details} \n ${respMessage}`;
    throw new Error(msg);
  }
  return result.data || [];
};

export const getTreesCount = async (
  minx: number,
  maxx: number,
  miny: number,
  maxy: number,
) => {
  let result;
  const params = {
    minx,
    maxx,
    miny,
    maxy,
  };
  try {
    result = await axios.get(
      `https://geoio.biodiversite-quebec.ca/trees_mtl/count/`,
      /*`http://localhost:7788/trees_mtl/count/`,*/
      { params: params, withCredentials: false },
    );
  } catch (error) {
    const { message, response } = error as any;
    const { details, message: respMessage } = response?.data;
    const msg = `request: ${message} \n ${details} \n ${respMessage}`;
    throw new Error(msg);
  }
  return result.data || [];
};

export const getTreesSpeciesCount = async (
  minx: number,
  maxx: number,
  miny: number,
  maxy: number,
  limit: number = 10,
  species_name: string = "",
) => {
  let result;
  const params = {
    minx,
    maxx,
    miny,
    maxy,
    limit,
    species_name,
  };
  try {
    result = await axios.get(
      `https://geoio.biodiversite-quebec.ca/trees_mtl/species_count/`,
      /*`http://localhost:7788/trees_mtl/count/`,*/
      { params: params, withCredentials: false },
    );
  } catch (error) {
    const { message, response } = error as any;
    if (response) {
      const { details, message: respMessage } = response?.data;
      const msg = `request: ${message} \n ${details} \n ${respMessage}`;
      throw new Error(msg);
    } else {
      throw new Error("Error getting tree species count");
    }
  }
  return (
    result.data.map((s: any) => ({
      essence_latin: s[0],
      essence_fr: s[1],
      essence_en: s[2],
      count: s[3],
    })) || []
  );
};

export const getTreesGeoJSON = async (species_name: string) => {
  let result;
  const params = {
    species_name: species_name,
  };
  try {
    result = await axios.get(
      `https://geoio.biodiversite-quebec.ca/trees_mtl/species_geojson/`,
      { params: params, withCredentials: false },
    );
  } catch (error) {
    const { message, response } = error as any;
    const { details, message: respMessage } = response?.data;
    const msg = `request: ${message} \n ${details} \n ${respMessage}`;
    throw new Error(msg);
  }
  return result.data || [];
};

export const getTreesNamesCount = async () => {
  let result;
  try {
    result = await axios.get(import.meta.env.VITE_FREQUENCY_JSON, {});
  } catch (error) {
    const { message, response } = error as any;
    const { details, message: respMessage } = response?.data;
    const msg = `request: ${message} \n ${details} \n ${respMessage}`;
    throw new Error(msg);
  }
  return result.data || [];
};

/**
 * functhion used to make any custom request
 * @param {*} url
 * @param {*} paramObj
 * @param obj
 * @returns
 */
export const makePostRequest = async (url: string, obj: any) => {
  const { params, baseURL, headers, signal } = obj;
  let result;
  try {
    result = await axios.post(
      baseURL + url,
      { ...params },
      {
        headers,
        signal,
      },
    );
  } catch (error) {
    const { message, response } = error as any;
    const { details, message: respMessage } = response.data;
    const msg = `request: ${url}\n ${message} \n ${details} \n ${respMessage}`;
    throw new Error(msg);
  }

  return result;
};
