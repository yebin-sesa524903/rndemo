import React from "react";
import {ImageBackground, StyleProp, View, Text, ViewStyle} from "react-native";
import storage from "../../../utils/storage";

export enum UploadType {
  gas = 19001,///气瓶上传图片
  factory,///厂务相关上传图片c
  callIn, ///callIn 工单上传图片
}

enum ImageUploadStatus {
  initial,///初始状态
  uploading,///上传中
  success,///上传成功
  error ///上传失败
}

export interface UploadImageProps {
  uploadType: UploadType,///上传图片类型
  uri: string,  ///图片本地地址
  name: string, ///图片名称
  deviceId?: string,  ///厂务相关上传 需要参数
  subOrderId?: string,///call in图片上传需传
  loadComplete?: (response: any, success: boolean) => void, ///上传完成的回调
  imageWidth?: number,
  imageHeight?: number,
  style?: StyleProp<ViewStyle>, ///样式
}

export default function UploadImage(props: UploadImageProps) {

  const defaultProps = React.useMemo(() => {
    return Object.assign({}, props, {
      imageWidth: 80,
      imageHeight: 80,
    })
  }, [props]);

  ///图片上传进度
  const [percent, setPercent] = React.useState(0);
  ///图片上传状态
  const [uploadStatus, setUploadStatus] = React.useState(ImageUploadStatus.initial)

  React.useEffect(() => {
    uploadImageRequest().then();
  }, []);

  /**
   * 图片上传
   */
  const uploadImageRequest = async () => {
    let xhr = new XMLHttpRequest();
    ///formData构建
    let formData = new FormData();
    formData.append("fileType", 0);
    formData.append('file', {uri: props.uri, name: props.name, key: props.name, type: 'image/jpg'});

    let baseUrl = await storage.getOssBucket();
    let postUri = '';

    if (defaultProps.uploadType == UploadType.gas) {
      ///气瓶
      postUri = baseUrl + '/lego-bff/bff/fmcs/rest/commonUploadFile';
    } else if (defaultProps.uploadType == UploadType.factory) {
      ///厂务
      postUri = baseUrl + '/lego-bff/bff/ledger/rest/fileUpload';
      formData.append('deviceId', props.deviceId);
    } else if (defaultProps.uploadType == UploadType.callIn) {
      ///call in 工单
      postUri = 'http://175.6.34.241:8989' + '/inf/api/order/upload' + `?subOrderId=${props.subOrderId}&token=${await storage.getItem("CALLINTOKEN")}`;
    }
    ///设置图片上传中状态
    setUploadStatus(ImageUploadStatus.uploading);
    xhr.open('POST', postUri);

    xhr.onload = () => {
      if (xhr.status == 200 && xhr.responseText) {
        ///上传成功
        let response = JSON.parse(xhr.responseText)
        props.loadComplete && props.loadComplete(response, true);
        setUploadStatus(ImageUploadStatus.success);
      } else {
        ///上传失败
        props.loadComplete && props.loadComplete(xhr.responseText, false);
        setUploadStatus(ImageUploadStatus.error);
      }
    }

    ///发生错误,上传失败
    xhr.onerror = () => {
      props.loadComplete && props.loadComplete(xhr.responseText, false);
      setUploadStatus(ImageUploadStatus.error);
    }

    if (xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          ///设置上传进度
          setPercent(Number((event.loaded / event.total).toFixed(0)));
        }
      };
    }
    xhr.send(formData);
  }

  return (
    <View style={[{
      borderRadius: 3,
      overflow: 'hidden',
      width: defaultProps.imageWidth,
      height: defaultProps.imageHeight,
    }, props.style]}>
      <ImageBackground source={{uri: defaultProps.uri}}
                       resizeMode="cover"
                       style={{
                         width: defaultProps.imageWidth,
                         height: defaultProps.imageHeight,
                         margin: 0,
                         padding: 0
                       }}>
        {
          (percent < 1) &&
          <View style={{
            height: defaultProps.imageHeight * (1 - percent),
            width: defaultProps.imageWidth,
            position: 'absolute',
            left: 0,
            bottom: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Text style={{textAlign: 'center', color: uploadStatus == ImageUploadStatus.error ? 'red' : 'white'}}>
              {
                (
                  uploadStatus == ImageUploadStatus.uploading ||
                  uploadStatus == ImageUploadStatus.success
                ) ?
                  (percent * 100 + '%')
                  :
                  (uploadStatus == ImageUploadStatus.error ? '上传失败' : '')}</Text>
          </View>
        }
      </ImageBackground>
    </View>
  )
}
