export const ASSET_DETAIL_REQUEST = 'ASSET_DETAIL_REQUEST';
export const ASSET_DETAIL_SUCCESS = 'ASSET_DETAIL_SUCCESS';
export const ASSET_DETAIL_FAILURE = 'ASSET_DETAIL_FAILURE';


//bff/xiot/rest/eh/hierarchyInstantiationDetail?id=600&objectType=
export function loadAssetDetail(data) {
  return (dispatch) => {
    return dispatch({
      types: [ASSET_DETAIL_REQUEST, ASSET_DETAIL_SUCCESS, ASSET_DETAIL_FAILURE],
      url: `/bff/xiot/rest/eh/hierarchyInstantiationDetail?id=${data.id}&objectType=${data.objectType || ''}`,
    });
  }
}

export const ASSET_DETAILUPDATE_LOGO_REQUEST = 'ASSET_DETAILUPDATE_LOGO_REQUEST';
export const ASSET_DETAILUPDATE_LOGO_SUCCESS = 'ASSET_DETAILUPDATE_LOGO_SUCCESS';
export const ASSET_DETAILUPDATE_LOGO_FAILURE = 'ASSET_DETAILUPDATE_LOGO_FAILURE';


//bff/xiot/rest/eh/hierarchyInstantiationDetail?id=600&objectType=
export function updateAssetDetailLogo(data) {
  return (dispatch) => {
    return dispatch({
      types: [ASSET_DETAILUPDATE_LOGO_REQUEST, ASSET_DETAILUPDATE_LOGO_SUCCESS, ASSET_DETAILUPDATE_LOGO_FAILURE],
      url: `/bff/xiot/rest/eh/hierarchyInstantiationEdit`,
      body: data
    });
  }
}

