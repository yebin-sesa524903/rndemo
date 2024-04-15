import { ASSET_DETAILUPDATE_LOGO_SUCCESS, ASSET_DETAIL_REQUEST, ASSET_DETAIL_SUCCESS } from "../../containers/fmcs/plantOperation/device/detail/action";

let initState = {
  isFetching: true,
}

function loadDetailData(state, action) {
  let res = action.response.datas;
  let logo = null;
  let logoEdit = null;
  let allImages = [];
  //显示PropertyGroups，里面包括了安装信息，可能还会有其他信息
  let groups = [];
  if (res.fieldGroupEntityList && res.fieldGroupEntityList.length > 0) {
    //这里进行排序
    let list = res.fieldGroupEntityList.sort((a, b) => a.order - b.order)
    groups = list.map(item => {
      let isFiles = item.fieldGroupName === '资产文档';
      let data = item.fieldValueEntityList.map(f => {
        let file = null;
        if (isFiles) {
          let arr = JSON.parse(f.value);
          if (Array.isArray(arr) && arr.length > 0) {
            file = arr;
            allImages = allImages.concat(arr)
          }
        }
        return {
          name: f.fieldTemplateLabel,
          value: f.value,
          code: f.code,
          file
        }
      })
      if (item.fieldGroupName === '基本信息') {
        let findIndex = data.findIndex(_ => _.name === '图片' || _.code === 'logo');
        if (data[findIndex] && data[findIndex].value) {
          logo = JSON.parse(data[findIndex].value)[0].key;
          logoEdit = item.fieldValueEntityList[findIndex];
        }
        data.splice(findIndex, 1);

      }
      return {
        name: item.fieldGroupName,
        isFiles,
        data
      }
    })
  }
  allImages = allImages.filter(img => {
    let ext = img.key.substr(img.key.lastIndexOf('.') + 1).toLowerCase();
    return ['png', 'jpg', 'jpeg', 'bmp', 'webp'].includes(ext);
  })
  if (!logo && res.iconKey) logo = res.iconKey;
  console.log('logo', logo, groups, logoEdit, allImages)
  state.logo = logo;

  state.logoEdit = logoEdit;
  state.allImages = allImages;
  state.dataInfo = res;
  state.groups = groups;
  state.isFetching = false;
  return state;
}

export default function (state = initState, action) {
  let newState = { ...state };
  switch (action.type) {
    case ASSET_DETAIL_REQUEST:
      return initState;
    case ASSET_DETAIL_SUCCESS:
      loadDetailData(newState, action)
      break;

    case ASSET_DETAILUPDATE_LOGO_SUCCESS:
      break;
  }
  return newState;
}
