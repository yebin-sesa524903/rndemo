import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { InteractionManager, View, Text, ScrollView, Platform } from "react-native";
import Colors from "../../../../../utils/const/Colors";
// @ts-ignore
import Toolbar from "../../../../../components/Toolbar";
import HeaderSwitch from "../../../../../components/fmcs/gasClass/airBottle/list/HeaderSwitch";
import {
  MaintainContainerView
} from "../../../../../components/fmcs/plantOperation/maintain/detail/MaintainContainerView";


import {
  loadAssetDetail, updateAssetDetailLogo,
} from "./action";

import ImageView from "../../../../../components/imageview";
import storage from "../../../../../utils/storage";
import DeviceDetailView from '../../../../../components/fmcs/plantOperation/device/detail/DeviceDetail'
// @ts-ignore
import FileOpener from 'react-native-file-opener'
import RNFS, { DocumentDirectoryPath } from "react-native-fs";

import { localStr } from "../../../../../utils/Localizations/localization";
import AssetDetail from "../../../../../components/fmcs/plantOperation/device/detail/AssetDetail";
import { uploadImages } from "./util";
import ImagePicker from "../../../../../components/ImagePicker";
import { getImageUrlByKey } from "../../utils/Utils";



function Detail(props: any) {
  /**
   * 返回按钮点击
   */
  const onPopBack=() => {
    InteractionManager.runAfterInteractions(() => {
      props.navigation.pop();
    });
  }

  const [showImagePreview, setImagePreview]=useState(false)
  const [showIndex, setShowIndex]=useState(-1)
  const [isManualPull, setIsManualPull]=useState(false);

  const [logo, setLogo]=useState({
    logo: props.data.logo,
    loading: false
  })


  useEffect(() => {
    //加载详情
    props.loadAssetDetail({
      id: props.id,
      objectType: props.objectType
    })
  }, [])

  useEffect(() => {
    // @ts-ignore
    setLogo({ logo: props.data.logo })
  }, [props.data.logo])

  /**
   * 头部切换点击
   * @param headerObj
   */
  const onHeaderSwitch=(headerObj: { title: string, value: number }) => {
    if (headerObj.value==1||headerObj.value==2) {

    }

  }

  const mimetype={
    'txt': 'text/plain',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.ms-powerpoint',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.ms-excel',
    'doc': 'application/msword',
    'docx': 'application/msword',
    'pdf': 'application/pdf',
  }

  function isImageFile(ext: string) {
    return ['png', 'jpg', 'jpeg', 'bmp', 'webp'].includes(ext)
  }

  const onPressFile=async (file: any) => {
    let name=file.name;
    let type=name.substr(name.lastIndexOf('.')+1).toLowerCase();
    if (isImageFile(type)) {
      //预览大图
      setShowIndex(props.data.allImages.indexOf(file))
      setImagePreview(true)
    }
    //return;

    // @ts-ignore
    type=mimetype[type];
    //需要先下载文件，在传递文件路径
    try {
      let filePath=`${DocumentDirectoryPath}/${file.key}`;
      let ret=await RNFS.exists(filePath);
      let openFile=(filePath, type) => {
        if (Platform.OS==='ios') {
          FileOpener.open(filePath, type, {}).then(() => {
            console.log('success!!');
          }, (e: any) => {
            console.log('e', e);
          });
        } else {
          FileOpener.open(filePath, type).then(() => {
            console.log('success!!');
          }, (e: any) => {
            console.log('e', e);
          });
        }
      }

      if (ret) {
        openFile(filePath, type);
        return;
      }
      //开始下载文件了
      await RNFS.downloadFile({
        fromUrl: getImageUrlByKey(file.key),//storage.getOssBucket()+`/lego-bff/bff/ledger/rest/downloadFile?id=${file.key}`,
        toFile: filePath,
      }).promise;
      openFile(filePath, type);
    } catch (err) {
      //文件下载失败
      console.log('download error', err);
      return false;
    }


  }

  const _openImagePicker=() => {
    props.navigation.push('PageWarpper', {
      id: 'imagePicker',
      component: ImagePicker,
      passProps: {
        max: 1,
        onBack: () => props.navigation.pop(),
        done: (data: any) => {
          props.navigation.pop();
          uploadImages(data[0], (ret: any) => {
            if (ret.loading) {
              // @ts-ignore
              setLogo({ loading: true })
              return;
            }
            if (ret.error) {
              // @ts-ignore
              setLogo({ loading: false })
              //toast
              return;
            }
            //到这里表示上传成功了
            setLogo({ loading: false, logo: ret.key });
            let edit=props.data.logoEdit;
            edit.value=JSON.stringify([{ key: ret.key, name: ret.name }])
            props.updateAssetDetailLogo(props.data.dataInfo)
          })
        },
      },
    });
  };

  /**
   * 放大图片
   */
  const onPressImage=(index: number) => {
    setImagePreview(true);
  }


  const renderImageViewing=() => {
    if (!showImagePreview)
      return null;
    let images=props.data.allImages.map((item: any) => {

      return {
        uri: getImageUrlByKey(item.key),
        headers: { Cookie: storage.getOssToken() }
      }
    });

    const ErrorView=() => (
      <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <Text style={{ color: Colors.text.white }}>{localStr('lang_asset_image_loading_exception')}</Text>
      </View>
    )

    return (
      <ImageView ErrorComponent={ErrorView}
        images={images}
        imageIndex={showIndex}
        visible={showImagePreview}
        onRequestClose={() => setImagePreview(false)}
      />
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.seBgColor }}>
      <Toolbar title={props.name} borderColor={Colors.seBorderSplit} navIcon="back" onIconClicked={onPopBack} color={Colors.seBrandNomarl} />
      <AssetDetail {...props.data} addImage={_openImagePicker} logo={logo} onPressFile={onPressFile} />
      {renderImageViewing()}
    </View>
  )
}

const mapStateToProps=(state: any, props: any) => {
  let data=state.device.assetDetail;
  return {
    data
  }
}

export default connect(mapStateToProps, {
  loadAssetDetail, updateAssetDetailLogo
})(Detail)

