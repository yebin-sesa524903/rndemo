import React, { Component } from "react";
import { View, Text, ScrollView, TextInput, Dimensions, Keyboard, Alert } from "react-native";
import { LIST_BG } from "../../../styles/color";
import Toolbar from "../../Toolbar";
import TouchFeedback from "../../TouchFeedback";
import Icon from "../../Icon";
import { listenToKeyboardEvents } from 'react-native-keyboard-aware-scroll-view'
import trackApi from "../../../utils/trackApi";
import backHelper from "../../../utils/backHelper";
import AssetInfoSingleSelect from "../../assets/AssetInfoSingleSelect";
import RiskData from "../../../utils/risk_data.json";
import ImagePicker from "../../../containers/ImagePicker";
import { compressImages } from "../../../utils/imageCompress";
import UploadableImage from "../../UploadableImage";
import NetworkImage from "../../NetworkImage";
import Toast from "react-native-root-toast";
import ImagePicker2 from "../../ImagePicker";
import SchActionSheet from "../../actionsheet/SchActionSheet";
import { isPhoneX } from "../../../utils";

const KeyboardAwareScrollView = listenToKeyboardEvents((props) => <ScrollView {...props} />);

const WIDTH = Dimensions.get('window').width;

const DEFAULT_TEXT = '保护选择性分析确定了保护装置的特性、设置或尺寸，提供了最适合电气系统的设备保护和选择设备操作之间的平衡。';
const HIGH_TEXT = '高低压侧不具备保护选择性，并且未见到保护选择性分析报告，建议做选择性分析，根据选择性分析结果做进一步行动。';

export default class ProtectionValueEdit extends Component {

  constructor(props) {
    super(props);
    this.state = {
      canScroll: false,
      suggestion: this.props.isHigh ? HIGH_TEXT : DEFAULT_TEXT,
      ...this.init()
    };
  }

  init() {
    let data = {}
    if (this.props.data) {
      data = {
        gl_i: this.props.data.IOvercurrent.Value,
        gl_t: this.props.data.TOvercurrent.Value,
        gl_curve: this.props.data.OvercurrentCurve.Value,
        sd_i: this.props.data.IQuickBreak.Value,
        sd_t: this.props.data.TQuickBreak.Value,
        sd_curve: this.props.data.QuickBreakCurve.Value,
        suggestion: this.props.data.Suggestion.Value,
      }
    }
    if (!this.props.isHigh) {
      let titles = {
        LowVoltageInImage: '低压进线断路器定值',
        LowVoltageOutImage: '低压出线断路器铭牌',
        TransformerImage: '变压器铭牌',
        CtImage: 'CT变比',
      }
      let imgs = Object.keys(titles).map(key => {
        let value = null;
        if (this.props.data && this.props.data.Images && this.props.data.Images.Value) {
          let img = this.props.data.Images.Value[key];
          if (img) {
            value = img.uri ? img : { PictureId: img };
          }
        }
        return {
          key, title: titles[key],
          value
        }
      })
      data.imgs = imgs;
    }
    return data;
  }

  componentDidMount() {
    trackApi.onPageBegin(this.props.route.id);
    this._didShow = Keyboard.addListener('keyboardDidShow', () => {
      this.setState({ canScroll: true })
    });
    this._didHide = Keyboard.addListener('keyboardDidHide', () => {
      this.setState({ canScroll: false })
    });
    backHelper.init(this.props.navigator, this.props.route.id);
  }

  componentWillUnmount() {
    this._addImageItem = null;
    this._didShow.remove();
    this._didHide.remove();
    trackApi.onPageEnd(this.props.route.id);
    backHelper.destroy(this.props.route.id);
  }

  _renderRow(title, value, cb, option) {
    let displayValue = value || `请选择${option ? '(选填)' : ''}`;
    if (value === '') displayValue = '';
    return (
      <TouchFeedback onPress={() => cb(title)}>
        <View style={{
          height: 56, marginLeft: 16, paddingRight: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
          borderBottomWidth: 1, borderBottomColor: '#f2f2f2'
        }}>
          <Text style={{ fontSize: 17, color: '#333', width: 92 }}>{title}</Text>
          <Text style={{ fontSize: 17, color: '#888', flex: 1, textAlign: 'right', marginRight: 8 }}>{displayValue}</Text>
          <Icon type={'icon_asset_folder'} color={'#b2b2b2'} size={17} />
        </View>
      </TouchFeedback>
    )
  }

  _renderInputRow(title, key, hint) {
    let value = this.state[key];
    if (value !== null && value !== undefined) {
      value = String(value);
    }
    return (
      <View key={title} style={{
        height: 56, marginLeft: 16, paddingRight: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderBottomWidth: 1, borderBottomColor: '#f2f2f2'
      }}>
        <Text style={{ fontSize: 16, color: '#333', width: 90 }}>{title}</Text>
        <TextInput style={{ fontSize: 16, color: '#888', height: 23, padding: 0, flex: 1 }}
          placeholderTextColor={'#888'}
          underlineColorAndroid={'transparent'}
          textAlign={"right"}
          keyboardType={'numeric'}
          onChangeText={text => {
            let obj = {};
            obj[key] = text;
            this.setState(obj)
          }}
          value={value || ''} placeholder={hint || '请输入'}
        />
      </View>
    )
  }

  _openImagePicker(item) {
    this.props.navigation.push('PageWarpper', {
      id: 'imagePicker',
      component: ImagePicker,
      passProps: {
        max: 1,
        dataChanged: (chosenImages) => {
          compressImages(chosenImages, res => {
            res.forEach((item, index) => {
              item.PictureId = `logbook-image-${Date.now()}-${index}`;
              // item.uri = item.uri;
            });
            item.value = res[0];
            this.setState({ imgs: this.state.imgs })
          });

        }
      }
    });
  }

  _deleteImage(item) {
    Alert.alert(
      '',
      '删除这张图片吗？',
      [
        { text: '取消', onPress: () => { }, style: 'cancel' },
        {
          text: '删除', onPress: () => {
            item.value = null;
            this.setState({ imgs: this.state.imgs })
          }
        }
      ]
    )
  }

  _imageLoadComplete(item) {
    item.loaded = true;
    this.setState({ imgs: this.state.imgs })
  }

  _renderImage() {
    if (this.props.isHigh) return null;
    let size = (WIDTH - 24 * 3) / 2;

    let imgViews = this.state.imgs.map((item, index) => {
      let mr = (index % 2 === 0) ? 24 : 0;
      let imgView = null;
      if (!item.value) {
        imgView = (
          <View key={'add_view'}>
            <TouchFeedback onPress={() => {
              this._addImageItem = item;
              this.setState({ modalVisible: true })
            }}>
              <View style={{
                backgroundColor: '#fafafa', width: size, height: size, marginBottom: 10,
                alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#d9d9d9',
                borderRadius: 2
              }}>
                <Icon type={'icon_add'} color={'#000'} size={14} />
              </View>
            </TouchFeedback>
          </View>
        )
      } else {
        if (!this.props.offlineMode && item.value.uri) {
          imgView = (
            <View key={index} style={{
              borderRadius: 2, borderWidth: 1, borderColor: '#d9d9d9', marginBottom: 10,
              alignItems: 'center', justifyContent: 'center', width: size, height: size
            }}>
              <UploadableImage name={item.value.PictureId} uri={item.value.uri}
                loaded={item.value.loaded} resizeMode="cover" height={size - 2} width={size - 2}
                loadComplete={() => this._imageLoadComplete(item)}>
                <TouchFeedback
                  style={{ flex: 1, backgroundColor: 'transparent' }}
                  onPress={() => { }} onLongPress={() => this._deleteImage(item)}>
                  <View style={{ flex: 1 }}></View>
                </TouchFeedback>
              </UploadableImage>
            </View>
          )
        } else {
          let dataSource = require('../../../images/building_default/building.png');
          if (item.value.uri) {
            dataSource = { uri: item.value.uri }
          }
          imgView = (
            <View key={index} style={{
              borderColor: '#d9d9d9', alignItems: 'center', justifyContent: 'center', borderRadius: 2,
              backgroundColor: 'gray', width: size, height: size, marginBottom: 10,
            }}>
              <NetworkImage
                defaultSource={dataSource}
                name={item.value.uri || item.value.PictureId}
                resizeMode="cover" imgType='jpg' width={size} height={size}>
                <TouchFeedback
                  style={{ flex: 1, backgroundColor: 'transparent' }}
                  onPress={() => { }} onLongPress={() => this._deleteImage(item)}>
                  <View style={{ flex: 1 }}></View>
                </TouchFeedback>
              </NetworkImage>
            </View>
          )
        }
      }
      return (
        <View style={{ width: size, alignItems: 'center', marginHorizontal: mr, marginBottom: 16 }}>
          {imgView}
          <Text style={{ fontSize: 15, color: '#888' }}>{item.title}</Text>
        </View>
      )
    });

    return (
      <View>
        {this._renderSection('图片（选填）')}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 16, marginBottom: 0 }}>
          {imgViews}
        </View>
      </View>
    )
  }

  _renderSection(title) {
    return (
      <View style={{ backgroundColor: LIST_BG, paddingTop: 12, paddingBottom: 8, paddingHorizontal: 16 }}>
        <Text style={{ fontSize: 14, color: '#888' }}>{title}</Text>
      </View>
    )
  }

  _getCurve(val) {
    return ['', '定时限', '反时限'][val];
  }

  _selectCurve(key) {
    let curves = ['定时限', '反时限'];
    this.props.navigation.push('PageWarpper', {
      id: 'AssetInfoSingleSelect',
      component: AssetInfoSingleSelect,
      passProps: {
        showInput: false,
        dataList: curves,
        title: '保护曲线',
        navigator: this.props.navigator,
        onBack: () => this.props.navigation.pop(),
        onSelect: (text) => {
          let index = curves.indexOf(text) + 1;
          let obj = {};
          obj[key] = index;
          this.setState(obj);
        }
      }
    });
  }

  _isEmpty(val) {
    if (val === null || val === undefined) return true;
    if (String(val).trim().length === 0) return true;
    return false;
  }

  _checkEmpty(keys) {
    let ret = true;
    for (let i = 0; i < keys.length; i++) {
      if (this._isEmpty(this.state[keys[i]])) return false;
    }
    return ret;
  }

  _canSubmit() {
    let keys = ['gl_i', 'gl_t', 'sd_i', 'sd_t', 'gl_curve', 'sd_curve', 'suggestion'];
    return this._checkEmpty(keys);
  }

  _validNumber() {
    let labels = [`I过流(${this.props.isHigh ? 'A' : 'Ir'})`, 't过流(s)', `I速断(${this.props.isHigh ? 'A' : 'In'})`, 't速断(s)'];
    let numberKeys = ['gl_i', 'gl_t', 'sd_i', 'sd_t'];
    //严格匹配模式
    let reg = /^[0-9]+((.[0-9]+)|([0-9]*))$/
    for (let i = 0; i < labels.length; i++) {
      if (!reg.test(this.state[numberKeys[i]])) {
        Toast.show(`${labels[i]}仅支持≥0的数字`, {
          duration: Toast.durations.LONG,
          position: Toast.positions.BOTTOM,
        });
        return false;
      }
    }
    return true;
  }

  _submit() {
    Keyboard.dismiss();
    if (!this._validNumber()) return false;
    let data = {
      IOvercurrent: {
        Value: Number(this.state.gl_i)
      },
      TOvercurrent: {
        Value: Number(this.state.gl_t)
      },
      OvercurrentCurve: {
        Value: this.state.gl_curve
      },
      IQuickBreak: {
        Value: Number(this.state.sd_i)
      },
      TQuickBreak: {
        Value: Number(this.state.sd_t)
      },
      QuickBreakCurve: {
        Value: this.state.sd_curve
      },
      Suggestion: {
        Value: this.state.suggestion
      },
    }
    if (!this.props.isHigh) {
      let value = {};
      this.state.imgs.forEach(img => {
        if (this.props.offlineMode) {
          value[img.key] = img.value ? img.value : null
        } else {
          value[img.key] = img.value ? img.value.PictureId : null
        }

      });
      data.Images = {
        Value: value
      }
    }
    this.props.submit(data);
  }

  _menuClick(item) {
    switch (item.title) {
      case '拍照':
        ImagePicker2._takePhoto((chosenImages) => {
          compressImages(chosenImages, res => {
            res.forEach((item, index) => {
              item.PictureId = `logbook-image-${Date.now()}-${index}`;
              // item.uri = item.uri;
            });
            this._addImageItem.value = res[0];
            this.setState({ imgs: this.state.imgs })
          });
        });
        break;
      case '从相册上传':
        this._openImagePicker(this._addImageItem);
        break;
    }
  }

  _getActionSheet() {
    let arrActions = [{ title: '拍照' }, { title: '从相册上传' }];
    if (this.state.modalVisible) {
      return (
        <SchActionSheet title={''} arrActions={arrActions} modalVisible={this.state.modalVisible}
          onCancel={() => {
            this.setState({ 'modalVisible': false });
          }}
          onSelect={item => {
            this.setState({ modalVisible: false }, () => {
              setTimeout(() => {
                this._menuClick(item)
              }, 200);
            });
          }}>
        </SchActionSheet>
      )
    }
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: LIST_BG }}>
        <Toolbar
          title={'巡检日志'}
          navIcon="back"
          noShadow={true}
          actions={[{ title: '完成', disable: !this._canSubmit() }]}
          onActionSelected={[() => this._submit()]}
          onIconClicked={() => this.props.onBack()}
        />
        <KeyboardAwareScrollView
          extraScrollHeight={16}
          enableOnAndroid={true}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1, backgroundColor: LIST_BG, marginBottom: isPhoneX() ? 34 : 0 }}>
          <View style={{ backgroundColor: '#fff' }}>
            {this._renderSection('过流')}
            {this._renderInputRow(`I过流(${this.props.isHigh ? 'A' : 'Ir'})`, 'gl_i')}
            {this._renderInputRow('t过流(s)', 'gl_t')}
            {this._renderRow('保护曲线', this._getCurve(this.state.gl_curve), () => this._selectCurve('gl_curve'))}
            {this._renderSection('速断')}
            {this._renderInputRow(`I速断(${this.props.isHigh ? 'A' : 'In'})`, 'sd_i')}
            {this._renderInputRow('t速断(s)', 'sd_t')}
            {this._renderRow('保护曲线', this._getCurve(this.state.sd_curve), () => this._selectCurve('sd_curve'))}
            {this._renderSection('建议')}
            <TextInput style={{ fontSize: 16, color: '#888', minHeight: 96, padding: 16, lineHeight: 23, flex: 1, backgroundColor: '#fff' }}
              placeholderTextColor={'#d0d0d0'}
              underlineColorAndroid={'transparent'}
              multiline={true} scrollEnabled={false}
              onChangeText={text => {
                this.setState({ suggestion: text })
              }}
              value={this.state.suggestion} placeholder={'请输入'}
            />
            {this._renderImage()}
          </View>
        </KeyboardAwareScrollView>
        {this._getActionSheet()}
      </View>
    )
  }
}
