import React, { Component } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, InteractionManager } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { loadTextFromImage, getDeviceModels } from '../../actions/assetsAction';
import Toast from "react-native-root-toast";
import AssetNameEditView from '../../components/assets/AssetNameEditView';
import ImagePicker from 'react-native-image-crop-picker';
import trackApi from "../../utils/trackApi";
import backHelper from '../../utils/backHelper';
import { Keyboard } from 'react-native';
import DeviceEditView from "../../components/assets/DeviceEditView";
import PanelEditView from "../../components/assets/PanelEditView";

const PANEL_UPDATE_TIP = '修改柜型将导致相关预防性维护计划发生错误，请及时到EnergyHub网页修改！';

export class AssetNameEdit extends Component {

  static contextTypes = {
    showSpinner: PropTypes.func,
    hideHud: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      name: this.props.name
    };
  }

  componentDidMount() {
    backHelper.init(this.props.navigator, this.props.route.id);
    if (this.props.type === 'Device') {
      //如果是创建编辑设备，则需要加载设备厂家和设备型号信息
      this.props.getDeviceModels();
    }
  }

  componentWillUnmount() {
    backHelper.destroy(this.props.route.id);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isRoomPosting !== this.props.isRoomPosting) {
      if (nextProps.isRoomPosting !== 1) this.context.hideHud();
      if (nextProps.isRoomPosting === 0) {
        InteractionManager.runAfterInteractions(() => {
          this.props.navigation.pop();
        });
        // this.props.navigation.pop();
      }
    }
    if (nextProps.isPanelPosting !== this.props.isPanelPosting) {
      if (nextProps.isPanelPosting !== 1) this.context.hideHud();
      if (nextProps.isPanelPosting === 0) {
        if (this.props.panelType !== this._panelType && this.props.panelType) {
          Toast.show(PANEL_UPDATE_TIP, {
            duration: Toast.durations.LONG,
            position: Toast.positions.BOTTOM,
          });
        }
        InteractionManager.runAfterInteractions(() => {
          this.props.navigation.pop();
        });
      }
    }
    if (nextProps.isDevicePosting !== this.props.isDevicePosting) {
      if (nextProps.isDevicePosting !== 1) this.context.hideHud();
      if (nextProps.isDevicePosting === 0) {
        InteractionManager.runAfterInteractions(() => {
          this.props.navigation.pop();
        });
      }
    }
    if (nextProps.isAddCirclePosting !== this.props.isAddCirclePosting) {
      if (nextProps.isAddCirclePosting !== 1) this.context.hideHud();
      if (nextProps.isAddCirclePosting === 0) {
        InteractionManager.runAfterInteractions(() => {
          this.props.navigation.pop();
        });
      }
    }
    if (nextProps.isAddDevicePosting !== this.props.isAddDevicePosting) {
      if (nextProps.isAddDevicePosting !== 1) this.context.hideHud();
      if (nextProps.isAddDevicePosting === 0) {
        InteractionManager.runAfterInteractions(() => {
          this.props.navigation.pop();
        });
      }
    }
    if (nextProps.isAddPanelPosting !== this.props.isAddPanelPosting) {
      if (nextProps.isAddPanelPosting !== 1) this.context.hideHud();
      if (nextProps.isAddPanelPosting === 0) {
        InteractionManager.runAfterInteractions(() => {
          this.props.navigation.pop();
        });
      }
    }
    if (nextProps.isAddRoomPosting !== this.props.isAddRoomPosting) {
      if (nextProps.isAddRoomPosting !== 1) this.context.hideHud();
      if (nextProps.isAddRoomPosting === 0) {
        InteractionManager.runAfterInteractions(() => {
          this.props.navigation.pop();
        });
      }
    }
    if (nextProps.isAddBuildingPosting !== this.props.isAddBuildingPosting) {
      if (nextProps.isAddBuildingPosting !== 1) this.context.hideHud();
      if (nextProps.isAddBuildingPosting === 0) {
        InteractionManager.runAfterInteractions(() => {
          this.props.navigation.pop();
        });
      }
    }
    if (nextProps.isAddFloorPosting !== this.props.isAddFloorPosting) {
      if (nextProps.isAddFloorPosting !== 1) this.context.hideHud();
      if (nextProps.isAddFloorPosting === 0) {
        InteractionManager.runAfterInteractions(() => {
          this.props.navigation.pop();
        });
      }
    }
    if (nextProps.isUpdateBuildingPosting !== this.props.isUpdateBuildingPosting) {
      if (nextProps.isUpdateBuildingPosting !== 1) this.context.hideHud();
      if (nextProps.isUpdateBuildingPosting === 0) {
        InteractionManager.runAfterInteractions(() => {
          this.props.navigation.pop();
        });
      }
    }
    if (nextProps.isCirclePosting !== this.props.isCirclePosting) {
      if (nextProps.isCirclePosting !== 1) this.context.hideHud();
      if (nextProps.isCirclePosting === 0) {
        InteractionManager.runAfterInteractions(() => {
          this.props.navigation.pop();
        });
      }
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
          this.setState({
            name: strRes
          });
          this._traceOCR(strRes);
        } catch (e) {
          // console.warn('ocr image error...',e);
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

  _getAssetType() {
    let type = this.props.type;
    if (type) type = type.toLowerCase();
    switch (type) {
      case 'building':
        return '建筑';
      case 'room':
        return '配电室';
      case 'panel':
        return '配电柜';
      case 'device':
        return '设备';
      default:
        return '';
    }
  }

  _traceOCR(ocrText) {
    trackApi.onTrackEvent('App_OCR', {
      customer_id: String(this.props.customerId || ''),
      customer_name: this.props.customerName || '',
      asset_type: this._getAssetType(),
      //ocr_text:ocrText
    })
  }

  _submit(text, panelType, address) {
    //如果当前输入内容和传入的名称相同，不做处理，直接返回
    if (text && text.trim)//数据格式变了
      text = text.trim();

    if (this.props.type === 'building') {
      //如果输入了详细地址信息，但是字数少于5个，给出提示
      let detailAddress = address.Province.trim();
      //let len = detailAddress.match(/[^\x00-\x80]/g);
      if (detailAddress.length < 5) {
        Toast.show('详细地址不能少于5个汉字', {
          duration: Toast.durations.LONG,
          position: Toast.positions.BOTTOM,
        });
        return;
      }
    }
    if (text === this.props.name && this.props.type !== 'Panel') {
      console.log('type', this.props.type);
      if (this.props.type === 'building') {
        // if(address===this.props.address){
        //   this.props.onBack();
        //   return;
        // }
      } else {
        this.props.onBack();
        return;
      }
    }
    // if(text===this.props.name && this.props.type==='Panel'
    //   && this.state.selectedType===this.props.panelType){
    //   this.props.onBack();
    //   return;
    // }
    Keyboard.dismiss();

    if (this.props.checkName) {
      let name = text;
      if (typeof text === 'object') name = text.name;
      let tip = this.props.checkName(name);
      if (tip) {
        InteractionManager.runAfterInteractions(() => {
          Toast.show(tip, {
            duration: Toast.durations.LONG,
            position: Toast.positions.BOTTOM,
          });
        });
        return;
      }
    }
    Keyboard.dismiss();
    this._panelType = panelType;
    this.context.showSpinner('posting');
    this.props.submit(text, panelType, address);
  }

  _takePhoto() {
    Keyboard.dismiss();
    // ImagePicker.openPicker({
    ImagePicker.openCamera({
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

  render() {
    let Component = AssetNameEditView;
    if (this.props.type === 'Panel') Component = PanelEditView;
    if (this.props.type === 'Device') {
      Component = DeviceEditView;
      if (this.props.scanAdd || (this.props.data && this.props.data.get('JoinType') !== 9)) {
        Component = AssetNameEditView;
      }
    }
    return (
      <Component
        title={this.props.title}
        submit={(text, panelType, address) => this._submit(text, panelType, address)}
        name={this.state.name}
        location={this.props.location}
        takePhoto={() => this._takePhoto()}
        panelType={this.props.panelType}
        type={this.props.type}
        deviceModels={this.props.deviceModels}
        data={this.props.data}
        loadingDeviceModels={this.props.loadingDeviceModels}
        navigator={this.props.navigator}
        onBack={() => this.props.onBack()}
      />
    )
  }
}

AssetNameEdit.propTypes = {
  loadTextFromImage: PropTypes.func,
  isFetching: PropTypes.bool,
  ocrData: PropTypes.string,
}

function mapStateToProps(state, ownProps) {
  var ocrData = state.asset.ocrData;
  return {
    isRoomPosting: state.asset.buildHierarchyData.get('isUpdateRoomPosting'),
    isPanelPosting: state.asset.buildHierarchyData.get('isUpdatePanelPosting'),
    isDevicePosting: state.asset.buildHierarchyData.get('isUpdateDevicePosting'),
    isCirclePosting: state.asset.buildHierarchyData.get('isUpdateCirclePosting'),

    isAddRoomPosting: state.asset.buildHierarchyData.get('isAddRoomPosting'),
    isAddPanelPosting: state.asset.buildHierarchyData.get('isAddPanelPosting'),
    isAddDevicePosting: state.asset.buildHierarchyData.get('isAddDevicePosting'),
    isAddCirclePosting: state.asset.buildHierarchyData.get('isAddCirclePosting'),
    isAddFloorPosting: state.asset.buildHierarchyData.get('isAddFloorPosting'),

    isAddBuildingPosting: state.asset.assetData.get('isAddBuildingPosting'),
    isUpdateBuildingPosting: state.asset.assetData.get('isUpdateBuildingPosting'),
    ocrData: ocrData.get('data'),
    isFetching: ocrData.get('isFetching'),
    loadingDeviceModels: state.asset.buildHierarchyData.get('loadingDeviceModels'),
    deviceModels: state.asset.buildHierarchyData.get('deviceModels'),
  };
}

export default connect(mapStateToProps, { loadTextFromImage, getDeviceModels })(AssetNameEdit);
