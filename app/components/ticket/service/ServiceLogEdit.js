import React, { Component } from "react";
import { View, Text, ScrollView, TextInput, Dimensions, Alert } from "react-native";
import { GREEN, LIST_BG } from "../../../styles/color";
import Toolbar from "../../Toolbar";
import TouchFeedback from "../../TouchFeedback";
import Icon from "../../Icon";
import UploadableImage from "../../UploadableImage";
import NetworkImage from "../../NetworkImage";
import ImagePicker from "../../../containers/ImagePicker";
import { compressImages } from "../../../utils/imageCompress";
import { checkFileNameIsImage } from "../../../utils/fileHelper";
import RiskData from '../../../utils/risk_data.json';
import AssetInfoSingleSelect from "../../assets/AssetInfoSingleSelect";
import AssetTree from './AssetTree'
import trackApi from "../../../utils/trackApi";
import backHelper from "../../../utils/backHelper";
import SchActionSheet from "../../actionsheet/SchActionSheet";
import ImagePicker2 from '../../../components/ImagePicker';

const WIDTH = Dimensions.get('window').width;
const PRIORITY = ['高', '中', '低'];
const PRIORITY_VALUE = [3, 2, 1];

export default class ServiceLogEdit extends Component {

  constructor(props) {
    super(props);
    this.state = {
      harm: '',
      suggestion: '',
      riskDes: null,
      priority: '',
      locationPath: null,
      locationId: '',
      isCustom: false,
      imgs: [],
      ...this._init()
    };
  }

  _init() {
    if (!this.props.data) return {}
    let imgs = this.props.data.Images.Value.map(img => {
      if (img.uri) return img;
      return { PictureId: img, upload: true }
    })
    let data = {
      imgs,
      harm: this.props.data.RiskHarm.Value,
      suggestion: this.props.data.Suggestion.Value,
      riskDes: this.props.data.RiskDescription.Value,
      priority: this.props.data.Priority.Value,
      locationPath: this.props.data.Location.Value,
      locationId: this.props.data.LocationId,
      isCustom: this.props.data.IsCustom
    }
    if (!data.isCustom) {
      //表示之前选择的是无异常情况
      if (data.riskDes && (data.harm === '' || !data.harm)) {
        data.hidden = true;
      }
    }

    return data;
  }

  componentDidMount() {
    trackApi.onPageBegin(this.props.route.id);
    backHelper.init(this.props.navigator, this.props.route.id);
  }

  componentWillUnmount() {
    trackApi.onPageEnd(this.props.route.id);
    backHelper.destroy(this.props.route.id);
  }

  _renderRow(title, value, cb, option) {
    let displayValue = value || `请选择${option ? '(选填)' : ''}`;
    if (value === '') displayValue = '';
    return (
      <TouchFeedback key={title} onPress={() => cb(title)}>
        <View style={{
          minHeight: 56, marginLeft: 16, paddingRight: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
          borderBottomWidth: 1, borderBottomColor: '#f2f2f2'
        }}>
          <Text style={{ fontSize: 17, color: '#333', width: 92 }}>{title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', flex: 1, marginLeft: 10, paddingVertical: 16 }}>
            <Text style={{ fontSize: 17, lineHeight: 23, color: value ? '#888' : '#888', flex: 1, textAlign: 'right' }}>{displayValue}</Text>
            <Icon type={'icon_asset_folder'} color={'#b2b2b2'} size={17} style={{ marginLeft: 12 }} />
          </View>
        </View>
      </TouchFeedback>
    )
  }

  _renderInputRow(title, key, hint) {
    return (
      <View key={title} style={{
        minHeight: 56, marginLeft: 16, paddingRight: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderBottomWidth: 1, borderBottomColor: '#f2f2f2'
      }}>
        <Text style={{ fontSize: 17, color: (this.state[key] || this.state.isCustom) ? '#333' : '#c0c0c0', width: 92 }}>{title}</Text>
        <TextInput style={{ fontSize: 17, color: '#888', padding: 0, flex: 1, marginVertical: 10 }}
          placeholderTextColor={this.state.isCustom ? '#888' : '#c0c0c0'}
          underlineColorAndroid={'transparent'}
          editable={this.state.isCustom}
          textAlign={"right"}
          multiline={true}
          onChangeText={text => {
            let obj = {};
            obj[key] = text;
            this.setState(obj)
          }}
          value={this.state[key] || ''} placeholder={hint || '请输入'}
        />
      </View>
    )
  }

  _selectAsset() {
    this.props.navigation.push('PageWarpper', {
      id: 'service_asset_tree',
      component: AssetTree,
      passProps: {
        onBack: () => this.props.navigation.pop(),
        assetId: this.props.assetId,
        submit: (path, id) => {
          this.props.navigation.pop();
          this.setState({
            locationId: id,
            locationPath: path.join('-')
          })
        }
      }
    });
  }

  _openImagePicker() {
    this.props.navigation.push('PageWarpper', {
      id: 'imagePicker',
      component: ImagePicker,
      passProps: {
        max: 9 - this.state.imgs.length,
        dataChanged: (chosenImages) => {
          compressImages(chosenImages, res => {
            res.forEach((item, index) => {
              item.PictureId = `logbook-image-${Date.now()}-${index}`;
              item.uri = item.uri;
            });
            this.setState({
              imgs: this.state.imgs.concat(res)
            })
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
            let index = this.state.imgs.indexOf(item);
            if (index >= 0) {
              this.state.imgs.splice(index, 1);
              this.setState({ imgs: this.state.imgs });
            }
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

    let size = 100;
    let addView = null;
    if (this.state.imgs.length < 9) {
      addView = (
        <View key={'add_view'}>
          <TouchFeedback onPress={() => this.setState({ modalVisible: true })}>
            <View style={{
              backgroundColor: '#fafafa', width: size, height: size,
              alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#d9d9d9',
              borderRadius: 2
            }}>
              <Icon type={'icon_add'} color={'#000'} size={14} />
            </View>
          </TouchFeedback>
        </View>
      )
    }

    let imgs = this.state.imgs.map((item, index) => {
      //只有在线模式才上传图片
      if (!this.props.offlineMode && item.uri) {
        return (
          <View key={index} style={{
            borderRadius: 2, borderWidth: 1, borderColor: '#d9d9d9', marginRight: 10, marginBottom: 10,
            alignItems: 'center', justifyContent: 'center', width: size, height: size
          }}>
            <UploadableImage name={item.PictureId} uri={item.uri}
              loaded={item.loaded} resizeMode="cover" height={size - 2} width={size - 2}
              loadComplete={() => this._imageLoadComplete(item)}>
              <TouchFeedback
                style={{ flex: 1, backgroundColor: 'transparent' }}
                onPress={() => { }} onLongPress={() => this._deleteImage(item)}>
                <View style={{ flex: 1 }}></View>
              </TouchFeedback>
            </UploadableImage>
          </View>
        )
      }
      else {
        let dataSource = require('../../../images/building_default/building.png');
        if (item.uri) {
          dataSource = { uri: item.uri }
        }
        return (
          <View key={index} style={{
            borderColor: '#d9d9d9', alignItems: 'center', justifyContent: 'center', borderRadius: 2,
            backgroundColor: 'gray', width: size, height: size, marginRight: 10, marginBottom: 10,
          }}>
            <NetworkImage
              name={item.uri || item.PictureId}
              defaultSource={dataSource}
              resizeMode="cover" imgType='jpg' width={size} height={size}>
              <TouchFeedback
                style={{ flex: 1, backgroundColor: 'transparent' }}
                onPress={() => { }} onLongPress={() => this._deleteImage(item)}>
                <View style={{ flex: 1 }}></View>
              </TouchFeedback>
            </NetworkImage>
          </View>
        );
      }
    });


    return (
      <View style={{ backgroundColor: '#fff', padding: 16, marginTop: 10 }}>
        <Text style={{ fontSize: 17, color: '#333', marginBottom: 10 }}>图片</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {imgs}
          {addView}
        </View>
      </View>
    )
  }

  _renderSection(title) {
    return (
      <View style={{ backgroundColor: LIST_BG }}>
        <Text style={{ margin: 16, marginBottom: 10, fontSize: 17, color: '#333' }}>{title}</Text>
      </View>
    )
  }

  _selectRiskDescription() {
    let key = 'riskDes';
    let title = '风险描述';
    let data = RiskData.filter(item => item['风险类别'] === this.props.taskType).map(item => item['风险描述']);
    this.props.navigation.push('PageWarpper', {
      id: 'AssetInfoSingleSelect',
      component: AssetInfoSingleSelect,
      passProps: {
        showInput: false,
        dataList: data,
        title,
        navigator: this.props.navigator,
        onBack: () => this.props.navigation.pop(),
        onSelect: (text) => {
          if (this.state[key] !== text) {
            let row = RiskData.filter(item => item['风险类别'] === this.props.taskType && item['风险描述'] === text)[0];
            let obj = {};
            obj[key] = text;
            obj['suggestion'] = row['建议'];
            obj['harm'] = row['风险危害'];
            obj.hidden = row['风险危害'] === '';
            if (obj.hidden) {
              //也需要把优先级隐藏掉
              obj.priority = null;
            }
            this.setState(obj);
          }
        }
      }
    });
  }

  _selectPriority() {
    this.props.navigation.push('PageWarpper', {
      id: 'AssetInfoSingleSelect',
      component: AssetInfoSingleSelect,
      passProps: {
        showInput: false,
        dataList: PRIORITY,
        title: '优先级',
        navigator: this.props.navigator,
        onBack: () => this.props.navigation.pop(),
        onSelect: (text) => {
          this.setState({
            priority: PRIORITY_VALUE[PRIORITY.indexOf(text)]
          })
        }
      }
    });
  }

  _isValid(keys) {
    let valid = true;
    keys.forEach(key => {
      let value = this.state[key];
      if (Array.isArray(value) && value.length === 0) {
        valid = false;
        return;
      }
      if (value === null || value === undefined || value === '') {
        valid = false;
        return;
      }
      if (String(value).trim().length === 0) valid = false;
      if (key === 'priority' && value === '0') valid = false;
    });
    return valid;
  }

  _canSubmit() {
    let keys = ['suggestion', 'locationPath', 'riskDes', 'imgs'];
    if (!this.state.hidden) {
      keys.push('priority', 'harm');
    }
    return this._isValid(keys);
  }

  _submit() {
    let data = this.props.data || {}
    if (!data.RiskHarm) data.RiskHarm = {};
    data.RiskHarm.Value = this.state.harm;

    if (!data.Suggestion) data.Suggestion = {};
    data.Suggestion.Value = this.state.suggestion;

    if (!data.RiskDescription) data.RiskDescription = {};
    data.RiskDescription.Value = this.state.riskDes;

    if (!data.Priority) data.Priority = {};
    data.Priority.Value = this.state.priority;

    if (!data.Location) data.Location = {};
    data.Location.Value = this.state.locationPath;

    data.LocationId = this.state.locationId;

    if (!data.Images) data.Images = {};
    if (this.props.offlineMode) {
      data.Images.Value = this.state.imgs;//.map(item => item.PictureId);
    } else {
      data.Images.Value = this.state.imgs.map(item => item.PictureId);
    }
    trackApi.onTrackEvent('App_LogbookTicket', {
      ticket_operation: ['开始执行', '忽略任务项', '添加日志', '筛选', '提交审批', '自定义编辑'][2]
    })
    if (this.state.isCustom) {
      trackApi.onTrackEvent('App_LogbookTicket', {
        ticket_operation: ['开始执行', '忽略任务项', '添加日志', '筛选', '提交审批', '自定义编辑'][5]
      })
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
              item.uri = item.uri;
            });
            this.setState({
              imgs: this.state.imgs.concat(res)
            })
          });
        });
        break;
      case '从相册上传':
        this._openImagePicker();
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

  _displayPriority() {
    if (!this.state.priority) return null;
    let index = PRIORITY_VALUE.indexOf(this.state.priority);
    if (index >= 0) return PRIORITY[index];
    return null;
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
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{
            flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 12, marginBottom: 8,
            justifyContent: 'space-between'
          }}>
            <Text style={{ fontSize: 14, color: '#888' }}>风险&建议</Text>
            <TouchFeedback onPress={() => this.setState({ isCustom: true, hidden: false })}>
              <View style={{ marginTop: -12, marginBottom: -8, paddingTop: 12, paddingBottom: 8 }}>
                <Text style={{ fontSize: 14, color: GREEN }}>{this.state.isCustom ? '' : `自定义编辑`}</Text>
              </View>
            </TouchFeedback>
          </View>
          <View style={{ backgroundColor: '#fff' }}>

            {this.state.isCustom ?
              this._renderInputRow('风险描述', 'riskDes')
              :
              this._renderRow('风险描述', this.state.riskDes, () => this._selectRiskDescription())
            }
            {this.state.hidden ? null : this._renderInputRow('风险危害', 'harm')}
            {this._renderInputRow('建议', 'suggestion')}

            <View style={{ height: 10, backgroundColor: LIST_BG }} />
            {this._renderRow('发现位置', this.state.locationPath, () => this._selectAsset())}
            {this.state.hidden ? null : this._renderRow('优先级', this._displayPriority(), () => this._selectPriority())}
          </View>
          {this._renderImage()}
        </ScrollView>
        {this._getActionSheet()}
      </View>
    )
  }
}
