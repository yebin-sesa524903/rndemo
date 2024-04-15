import React, { Component } from 'react';
import { InteractionManager, Platform, NativeModules, Alert, Keyboard } from 'react-native';
import { connect } from 'react-redux';
import privilegeHelper from "../../utils/privilegeHelper";
import trackApi from "../../utils/trackApi";
import backHelper from "../../utils/backHelper";
import PropTypes from 'prop-types';
import SwitchBoxEditView from "../../components/assets/SwitchBoxEditView";
import { switchBoxInfoChanged, loadTextFromImage } from '../../actions/assetsAction';
import ImagePicker from "../ImagePicker";
import { compressImages } from "../../utils/imageCompress";
import ImagePicker1, { } from 'react-native-image-crop-picker';
import RNFetchBlob from 'react-native-fetch-blob';
var { ImagePickerManager } = NativeModules;
import Toast from 'react-native-root-toast';
import Permissions, { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import CameraRoll from "@react-native-community/cameraroll";
class SwitchBoxEdit extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  static contextTypes = {
    showSpinner: PropTypes.func,
    hideHud: PropTypes.func
  };

  componentDidMount() {
    trackApi.onPageBegin(this.props.route.id);
    backHelper.init(this.props.navigator, this.props.route.id);
    this.props.switchBoxInfoChanged({
      isCreate: this.props.isCreate,
      type: 'init',
      boxData: this.props.boxData
    })
  }

  componentWillUnmount() {
    trackApi.onPageEnd(this.props.route.id);
    backHelper.destroy(this.props.route.id);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isAddPosting !== this.props.isAddPosting) {
      if (nextProps.isAddPosting !== 1) this.context.hideHud();
      if (nextProps.isAddPosting === 0) {
        InteractionManager.runAfterInteractions(() => {
          this.props.navigation.pop();
        });
      }
      return;
    }
    if (nextProps.isUpdatePosting !== this.props.isUpdatePosting) {
      if (nextProps.isUpdatePosting !== 1) this.context.hideHud();
      if (nextProps.isUpdatePosting === 0) {
        InteractionManager.runAfterInteractions(() => {
          this.props.navigation.pop();
        });
      }
      return;
    }

    if (!nextProps.isFetching && this.props.isFetching) {
      if (nextProps.ocrData && !this.props.ocrData) {
        try {
          var resGeneral = nextProps.ocrData;
          var objGene = JSON.parse(resGeneral);
          console.warn('resGeneral..', objGene.success);
          var strRes = '';
          if (objGene.success) {
            strRes = objGene.ret.map((item, index) => {
              return item.word;
            }).join('');
          }
          //这里处理赋值
          this._changeInput(this._type, strRes);
        } catch (e) {
          //识别识别，给出一个提示
          Toast.show('识别失败，请重试', {
            duration: Toast.durations.LONG,
            position: Toast.positions.BOTTOM,
          });
        }
        this.context.hideHud();
      }
    }
  }

  async _cameraPhoto(type) {
    let lastClickTakePhoto = this._lastClickTakePhoto || 0;
    if (Date.now() - lastClickTakePhoto < 1500) {
      console.log('拍照点击太快');
      return;
    }
    this._lastClickTakePhoto = Date.now();
    let cameraPermission = Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
    try {
      let response = await check(cameraPermission);
      if (!(response === RESULTS.GRANTED || response === RESULTS.LIMITED)) {
        response = await request(cameraPermission);
        if (!(response === RESULTS.GRANTED || response === RESULTS.LIMITED)) {
          Alert.alert('', '请在手机的' + '"' + '设置' + '"' + '中，允许EnergyHub访问您的摄像头',
            [
              {
                text: '取消', onPress: () => {
                  return;
                }
              },
              {
                text: '允许', onPress: () => {
                  if (Permissions.openSettings()) {
                    Permissions.openSettings();
                  }
                  return;
                }
              }
            ]
          )
          return;
        }
      }
      //如果是android，为了兼容低版本，还需要判断权限
      if (Platform.OS === 'android') {
        response = await check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
        if (!(response === RESULTS.GRANTED || response === RESULTS.LIMITED)) {
          response = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
          if (!(response === RESULTS.GRANTED || response === RESULTS.LIMITED)) {
            Alert.alert('', '请在手机的' + '"' + '设置' + '"' + '中，允许EnergyHub读写您的存储空间',
              [
                {
                  text: '取消', onPress: () => {
                    return;
                  }
                },
                {
                  text: '允许', onPress: () => {
                    if (Permissions.openSettings()) {
                      Permissions.openSettings();
                    }
                    return;
                  }
                }
              ]
            )
            return;
          }
        }
      }
    } catch (err) {
      return;
    }

    let options = {
      title: '', // specify null or empty string to remove the title
      cancelButtonTitle: '取消',
      takePhotoButtonTitle: '打开照相机', // specify null or empty string to remove this button
      chooseFromLibraryButtonTitle: '从手机相册获取', // specify null or empty string to remove this button
      cameraType: 'back', // 'front' or 'back'
      mediaType: 'photo', // 'photo' or 'video'
      // aspectX: 2, // android only - aspectX:aspectY, the cropping image's ratio of width to height
      // aspectY: 1, // android only - aspectX:aspectY, the cropping image's ratio of width to height
      quality: 0.5, // 0 to 1, photos only
      angle: 0, // android only, photos only
      allowsEditing: false,
      noData: true,
      includeBase64: false,
      maxHeight: 1920,
      maxWidth: 1080,
      saveToPhotos: false,
      durationLimit: 10,

    };
    launchCamera(options, (response) => {
      if (response.didCancel) {
      }
      else if (response.error || response.errorCode) {
        console.warn('ImagePickerManager Error: ', response);
      }
      else if (response.customButton) {
      }
      else {
        var fileName = '';
        // uri (on iOS)
        var source;
        if (Platform.OS === 'ios') {
          source = { name: fileName, uri: response.uri.replace('file://', ''), isStatic: true };
          CameraRoll.saveToCameraRoll(source.uri);
          // this.props.done([source]);
          this._takeFinish(type, source);
        }
        else {
          RNFetchBlob.fs.stat(response.uri).then((fileData) => {
            source = { name: fileName, uri: response.uri, isStatic: true, filename: fileData.filename };
            CameraRoll.saveToCameraRoll(source.uri);
            // this.props.done([source]);
            this._takeFinish(type, source);
          }).catch(err => {
            console.warn(err);
            source = { name: fileName, uri: response.uri, isStatic: true, filename: response.filename };
            this._takeFinish(type, source);
          });
        }
      }
    });
  }

  _takeFinish(type, img) {
    this._dataChanged(type, 'add', [img])
  }

  _takePhoto(type) {
    Keyboard.dismiss();
    if (type === 'logo' || type === 'image') {
      this._cameraPhoto(type);
      return;
    }
    this._type = type;
    ImagePicker1.openCamera({
      width: 300,
      height: 100,
      cropping: true,
      includeBase64: true,
      cropperChooseText: '完成',
      cropperCancelText: '取消'
    }).then(async image => {
      this.context.showSpinner('detecting');
      this.props.loadTextFromImage(image.data);
    });
  }

  _pickImage(type) {
    let max = 5 - this.props.images.size;
    if (type === 'logo') max = 1;
    this.props.navigation.push('PageWarpper', {
      id: 'imagePicker',
      component: ImagePicker,
      passProps: {
        max: max,
        dataChanged: (chosenImages) => this._dataChanged(type, 'add', chosenImages)
      }
    });
  }

  _dataChanged(type, action, value) {
    //需要判断是选择图片时，才进行压缩处理，否则走原来流程
    let next = (nextValue) => {
      this.props.switchBoxInfoChanged({
        userId: this.props.user.get('Id'),
        type, action, value: nextValue
      });
    }
    if (type === 'image' && action === 'add') {//只有选择添加图片时，才做图片压缩
      //首先调用图片压缩，然后在把压缩后的结果传递过来
      compressImages(value, res => {
        console.warn(value, res);
        next(res);
      });
    } else {
      next(value);
    }
  }

  _changeInput(type, text) {
    this._dataChanged(type, '', text);
  }

  _submit() {
    this.context.showSpinner();
    let images = this.props.images.map(item => item.get('PictureId'));
    let logo = this.props.logo.get('PictureId');
    this.props.submit({
      Name: this.props.name,
      Number: this.props.number,
      Location: this.props.location,
      LocationImages: images,
      LogoKey: logo
    });
  }

  render() {
    let title = this.props.isCreate ? '新建配电箱' : '编辑配电箱';
    return (
      <SwitchBoxEditView takePhoto={this._takePhoto.bind(this)} title={title}
        name={this.props.name} number={this.props.number} images={this.props.images}
        changeInput={this._changeInput.bind(this)} logo={this.props.logo} submit={this._submit.bind(this)}
        canEdit={true} pickImage={this._pickImage.bind(this)} dataChanged={this._dataChanged.bind(this)}
        location={this.props.location} onBack={this.props.navigation.pop}
      />
    )
  }
}

function mapStateToProps(state, ownProps) {
  let hasLogbookPermission = privilegeHelper.hasAuth('RegDeviceFullPrivilegeCode');
  let editData = state.asset.switchBoxEdit;
  let ocrData = state.asset.ocrData;
  return {
    user: state.user.get('user'),
    hasLogbookPermission,
    name: editData.get('name'),
    location: editData.get('location'),
    number: editData.get('number'),
    logo: editData.get('logo'),
    images: editData.get('images'),
    isAddPosting: state.asset.buildHierarchyData.get('isAddSwitchBoxPosting'),
    isUpdatePosting: state.asset.buildHierarchyData.get('isUpdateSwitchBoxPosting'),
    ocrData: ocrData.get('data'),
    isFetching: ocrData.get('isFetching'),
  }
}

export default connect(mapStateToProps, { switchBoxInfoChanged, loadTextFromImage })(SwitchBoxEdit);
