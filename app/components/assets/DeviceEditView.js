import React, { Component } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet, InteractionManager,
  Platform, TouchableWithoutFeedback, Image, Dimensions, Keyboard
} from 'react-native';
import { LIST_BG, LINE, GREEN, GRAY } from '../../styles/color';
import Icon from '../Icon';
import Toolbar from '../Toolbar';
import TouchFeedback from '../TouchFeedback';
import AssetInfoSingleSelect from "./AssetInfoSingleSelect";
import Toast from "react-native-root-toast";
import DateTimePicker from "react-native-modal-datetime-picker";
import Loading from '../Loading';
import moment from "moment";
import { listenToKeyboardEvents } from 'react-native-keyboard-aware-scroll-view'
const KeyboardAwareScrollView = listenToKeyboardEvents((props) => <ScrollView {...props} />);

const KEY_KJDL = '壳架电流';
const KEY_EDDL = '额定电流';
const KEY_EDDY = '额定电压';
const KEY_EDDR = '额定电容';

export default class DeviceEditView extends Component {

  constructor(props) {
    super(props);

    this.state = {
      inputText: this.props.name,
      ...this._init()
    }
  }

  _init() {
    let initState = {};
    if (this.props.data) {
      let data = this.props.data.toJS();
      console.warn('data', data);
      initState.factory = data.Factory;
      initState.general = data.Class;
      initState.type = data.DeviceType;
      initState.model = data.Specification;
      //生产日期
      let p = data.LedgerParameters;
      if (p) {
        p.forEach(item => {
          let name = item.Name;
          if (name === '生产日期') {
            initState.createDate = moment(item.Values[0]).toDate();
          } else {
            this._initExtra(item, initState);
          }

        });
      }

    }
    return initState;
  }

  _initExtra(item, initState) {
    let names = ['壳架电流', '额定电流', '额定电容', '额定电压'];
    let keys = [KEY_KJDL, KEY_EDDL, KEY_EDDR, KEY_EDDY];
    let index = names.indexOf(item.Name);
    let key = null;
    if (index >= 0) {
      key = keys[index];
    } else {
      index = names.findIndex(name => {
        return name.indexOf('壳架电流') === 0;
      });
      if (index >= 0) {
        key = keys[index];
      }
    }
    // let key = keys[index],name=names[index];
    if (key) {
      initState[key] = item.Values[0];
    }
    // let _extra = this._extra || {};
    // _extra[key] = item;
    // this._extra = _extra;
  }

  _clearExtraData() {
    let obj = {};
    [KEY_KJDL, KEY_EDDL, KEY_EDDR, KEY_EDDY].forEach(key => {
      obj[key] = null;
    });
    this.setState(obj);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.name !== this.props.name) {
      this.setState({
        inputText: nextProps.name
      })
    }
    // if(nextProps.loadingDeviceModels !== this.props.loadingDeviceModels && !nextProps.loadingDeviceModels) {
    //   if(this._extra) {
    //
    //   }
    // }
  }

  _onChangeText(type, text) {
    this.setState({ inputText: text })
  }

  componentWillUnmount() {
    Keyboard.dismiss();
  }

  _onFocus(e) {
  }

  _doSubmit() {
    Keyboard.dismiss();
    let ext = Object.keys(this._extra);
    let extSubmit = [];
    ext.forEach(item => {
      let v = this._extra[item];
      //如果用户输入（选择了）才提交，否则不要了
      if (this.state[item]) {
        extSubmit.push({
          ...v, Values: [this.state[item] || ''],
        })
      }
    });
    let body = {
      "IsAsset": true,
      "Factory": this.state.factory,
      "Name": this.state.inputText.trim(),
      "Class": this.state.general,
      "JoinType": 9,
      "Type": 5,
      "DeviceType": this.state.type,
      "Specification": this.state.model, // 如果不是 框架断路器及负荷开关, 有值, 否则为: ""
      "LedgerParameters": [
        // {ValueType: null, Name: "生产日期", Values: [this._formatSubmitDate(this.state.createDate)], ParameterType: null, IsUploaded: null},
        // 只有为 框架断路器及负荷开关 才有值
        {
          "IsUploaded": false,
          "Name": "生产日期",
          "ParameterType": 0,
          "Values": [
            this._formatSubmitDate(this.state.createDate)
          ],
          "ValueType": 0
        },

        ...extSubmit
      ]
    }
    // console.warn('submit',body);
    this.props.submit(body);
  }

  _renderRow(title, value, cb, option) {
    let displayValue = value || `请选择${option ? '(选填)' : ''}`;
    if (value === '') displayValue = '';
    return (
      <TouchFeedback key={title} onPress={() => cb(title)}>
        <View style={{
          minHeight: 56, paddingVertical: 16, marginLeft: 16, paddingRight: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
          borderBottomWidth: 1, borderBottomColor: LINE
        }}>
          <Text style={{ fontSize: 17, color: '#333', width: 110 }}>{title}</Text>
          <Text style={{ fontSize: 17, color: value ? '#888' : '#888', flex: 1 }}>{displayValue}</Text>
          <Icon type={'icon_asset_folder'} color={'#b2b2b2'} size={20} />
        </View>
      </TouchFeedback>
    )
  }

  _renderInputRow(title, key, hint) {
    return (
      <View key={title} style={{
        height: 56, marginLeft: 16, paddingRight: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderBottomWidth: 1, borderBottomColor: LINE
      }}>
        <Text style={{ fontSize: 16, color: '#333', width: 110 }}>{title}</Text>
        <TextInput style={{ fontSize: 16, color: '#888', height: 23, padding: 0, flex: 1 }}
          placeholderTextColor={'#888'}
          underlineColorAndroid={'transparent'}
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

  _selectFactory() {
    this.props.navigation.push('PageWarpper', {
      id: 'AssetInfoSingleSelect',
      component: AssetInfoSingleSelect,
      passProps: {
        showInput: true,
        inputTitle: '生产厂家',
        inputHint: '请输入厂家名称',
        dataList: this.props.deviceModels.Factories,
        title: '生产厂家',
        navigator: this.props.navigator,
        onBack: () => this.props.navigator.pop(),
        onSelect: (text) => {
          if (this.state.factory !== text) {
            this.setState({
              factory: text,
            })
          }
        }
      }
    });
  }

  _selectDate(type) {
    let dateType = type === '生产日期' ? 'createDate' : 'runDate';
    this.setState({
      dateType, modalVisible: true
    })
  }

  _selectGeneral() {
    let data = this.props.deviceModels.DeviceClassDtos.map(item => item.Name);
    this.props.navigation.push('PageWarpper', {
      id: 'AssetInfoSingleSelect',
      component: AssetInfoSingleSelect,
      passProps: {
        showInput: false,
        dataList: data,
        title: '设备总称',
        navigator: this.props.navigator,
        onBack: () => this.props.navigator.pop(),
        onSelect: (text) => {
          if (this.state.general !== text) {
            this._clearExtraData();
            this.setState({
              general: text,
              //如果type和model都是唯一项，则需要自动补上数据
              type: null,
              model: null
            })
          }
        }
      }
    });
  }

  _selectType() {
    if (!this.state.general) {
      Toast.show('请先选择设备总称', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
      return;
    }

    let data = [];
    let findTypes = this.props.deviceModels.DeviceClassDtos.find(item => item.Name === this.state.general);
    if (findTypes) {
      data = findTypes.DeviceTypes.map(item => item.Name);
    }
    this.props.navigation.push('PageWarpper', {
      id: 'AssetInfoSingleSelect',
      component: AssetInfoSingleSelect,
      passProps: {
        showSearch: true,
        searchHint: '请搜索设备类型',
        dataList: data,
        title: '设备类型',
        navigator: this.props.navigator,
        onBack: () => this.props.navigator.pop(),
        onSelect: (text) => {
          if (this.state.type !== text) {
            this._clearExtraData();
            //判断是否是唯一
            let models = this._getModelsByType(text, findTypes.DeviceTypes);
            if (models && models.length === 1) models = models[0].Name;
            else models = null;
            this.setState({
              type: text,
              model: models
            })
          }
        }
      }
    });
  }

  _getModelsByType(type, findTypes) {
    let models = [];
    let findType = findTypes.find(item => item.Name === type);
    if (findType) {
      models = findType.Specifications;
    }
    return models;
  }

  _selectModel() {
    if (!this.state.general) {
      Toast.show('请先选择设备总称', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
      return;
    }
    if (!this.state.type) {
      Toast.show('请先选择类型', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
      return;
    }

    let data = [];
    let findGeneral = this.props.deviceModels.DeviceClassDtos.find(item => item.Name === this.state.general);
    if (findGeneral) {
      let findType = findGeneral.DeviceTypes.find(item => item.Name === this.state.type);
      if (findType) {
        data = findType.Specifications.map(item => item.Name);
      }
    }
    this.props.navigation.push('PageWarpper', {
      id: 'AssetInfoSingleSelect',
      component: AssetInfoSingleSelect,
      passProps: {
        showSearch: true,
        searchHint: '请搜索设备型号',
        showInput: true,
        inputTitle: '设备型号',
        inputHint: '请输入设备型号',
        dataList: data,
        title: '设备型号',
        navigator: this.props.navigator,
        onBack: () => this.props.navigator.pop(),
        onSelect: (text) => {
          if (this.state.model !== text) {
            this._clearExtraData();
            console.warn('选择的型号是:', text);
            this.setState({
              model: text
            })
          }
        }
      }
    });
  }

  _renderExtraRow(title, key, findProp, cb) {
    this._extra[key] = { ...findProp, Name: key };
    let isOneEmpty = findProp.Values && findProp.Values[0] === '';
    if (!isOneEmpty && findProp.Values && findProp.Values.length > 0) {
      //显示可选
      let value = this.state[key];
      if (!value && findProp.Values.length === 1) {
        value = findProp.Values[0];
      }
      return this._renderRow(title, value, cb, true);
    } else {
      //显示可输入
      return this._renderInputRow(title, key, '请输入(选填)');
    }
  }

  _selectExtra(title, key) {
    let data = this._extra[key].Values;
    title = key;
    this.props.navigation.push('PageWarpper', {
      id: 'AssetInfoSingleSelect',
      component: AssetInfoSingleSelect,
      passProps: {
        showInput: true,
        dataList: data,
        inputTitle: title,
        inputHint: `请输入${title}`,
        title: title,
        navigator: this.props.navigator,
        onBack: () => this.props.navigator.pop(),
        onSelect: (text) => {
          if (this.state[key] !== text) {
            let obj = {};
            obj[key] = text;
            this.setState(obj);
          }
        }
      }
    });
  }

  _getExtraRows() {
    //根据选择的设备总称，类型和型号，判断还有没有额外的选择项/输入项
    //有可选性项，则有跳转；没有可选择项，则无跳转，直接input
    this._extra = {};
    if (this.state.general && this.state.type && (this.state.model || this.state.model === '')) {
      //总称、类型、型号都确定了，才判断是否要显示壳架电流，额定电压，电容，电流 这几个选填项
      let findGeneral = this.props.deviceModels.DeviceClassDtos.find(item => item.Name === this.state.general);
      if (findGeneral) {
        let findType = findGeneral.DeviceTypes.find(item => item.Name === this.state.type);
        if (findType) {
          //这里要做处理：有可能是Specifications 只有1项，且没有名称，则用户输入的就是他

          let findModel = null;
          if (findType.Specifications && findType.Specifications.length > 0) {
            if (findType.Specifications.length === 1) {
              findModel = findType.Specifications[0];
            } else {
              findModel = findType.Specifications.find(item => item.Name === this.state.model);
            }
          }

          if (findModel) {
            //这里在判断要显示的字段
            if (this.state.general === '塑壳断路器及负荷开关') {
              //判断有没有壳架电流
              let findProp = findModel.Properties.find(item => item.Name && item.Name.indexOf('壳架电流') === 0);
              if (findProp) {
                return this._renderExtraRow('壳架电流', KEY_KJDL, findProp, () => this._selectExtra('壳架电流', KEY_KJDL))
              }
            } else if (this.state.general === '框架断路器及负荷开关' || this.state.general === '中压断路器和接触器') {
              let arr = [];
              let findProp = findModel.Properties.find(item => item.Name && item.Name.trim() === '额定电流');
              if (findProp) {
                console.log(findProp);
                arr.push(this._renderExtraRow('额定电流', KEY_EDDL, findProp, () => this._selectExtra(KEY_EDDL, KEY_EDDL)))
              }
              findProp = findModel.Properties.find(item => item.Name && item.Name.trim() === '额定电压');
              if (findProp) {
                arr.push(this._renderExtraRow('额定电压', KEY_EDDY, findProp, () => this._selectExtra(KEY_EDDY, KEY_EDDY)))
              }
              return arr;
            } else if (this.state.general === '变压器') {
              let findProp = findModel.Properties.find(item => item.Name === '额定容量');
              if (findProp) {
                return this._renderExtraRow(KEY_EDDR, KEY_EDDR, findProp, () => this._selectExtra(KEY_EDDR, KEY_EDDR))
              }
            }
          }
        }
      }
    }
  }

  _renderRows() {
    let extraRow = this._getExtraRows();
    return (
      <View style={{ backgroundColor: '#fff' }}>
        {this._renderRow('生产厂家', this.state.factory, () => this._selectFactory())}
        {this._renderRow('生产日期', this._formatTime(this.state.createDate), (type) => this._selectDate(type))}
        {this._renderRow('设备总称', this.state.general, (type) => this._selectGeneral())}
        {this._renderRow('设备类型', this.state.type, () => this._selectType())}
        {this._renderRow('设备型号', this.state.model, () => this._selectModel())}
        {extraRow}
      </View>
    )
  }

  _isValid(arr) {
    let valid = true;
    for (let i = 0; i < arr.length; i++) {
      //model为空字符串，认为合法
      if (arr[i] === 'model' && this.state[arr[i]] === '') continue;
      if (!this.state[arr[i]]) return false;
    }
    return valid;
  }

  _enableSubmit() {
    if (!this._isValid(['factory', 'createDate', 'inputText', 'model', 'type', 'general'])) return false;
    return true;
  }

  _renderPickerDate() {
    return (
      <DateTimePicker
        is24Hour={true}
        titleIOS={'选择日期'}
        headerTextIOS={'选择日期'}
        titleStyle={{ fontSize: 17, color: '#333' }}
        cancelTextIOS={'取消'}
        confirmTextIOS={'确定'}
        mode={'date'}
        datePickerModeAndroid={'spinner'}
        date={this._getDateTime()}
        onDateChange={(date) => {

        }}
        isVisible={this.state.modalVisible}
        onConfirm={(date) => {
          let obj = {
            modalVisible: false
          };
          obj[this.state.dateType] = date;
          this.setState(obj);
        }}
        onCancel={() => {
          this.setState({ modalVisible: false })
        }}
      />
    )
  }

  _getDateTime() {
    return this.state[this.state.dateType] || new Date();
  }

  _formatSubmitDate(date) {
    if (!date) return '';
    return moment(date).format('YYYY-MM-DD');
  }

  _formatTime(time) {
    if (!time) return null;
    return moment(time).format('YYYY年MM月DD日');
  }

  renderLoading() {
    return (
      <View style={{ flex: 1, backgroundColor: LIST_BG }} >
        <Toolbar
          title={this.props.title}
          navIcon="back"
          noShadow={true}
          onIconClicked={() => this.props.onBack()}
          actions={[{ title: '完成', show: 'always', disable: !this._enableSubmit() }]}
          onActionSelected={[() => this._doSubmit()]}
        />
        <Loading />
      </View>
    )
  }

  render() {
    if (this.props.loadingDeviceModels || !this.props.deviceModels) return this.renderLoading();
    let width = { width: 110 };
    let flex = { flex: 1 };

    return (
      <View style={{ flex: 1, backgroundColor: LIST_BG }} >
        <Toolbar
          title={this.props.title}
          navIcon="back"
          noShadow={true}
          onIconClicked={() => this.props.onBack()}
          actions={[{ title: '完成', show: 'always', disable: !this._enableSubmit() }]}
          onActionSelected={[() => this._doSubmit()]}
        />
        <KeyboardAwareScrollView style={{ flex: 1 }}
          extraScrollHeight={16}
          enableOnAndroid={true}>
          <TouchableWithoutFeedback style={[flex]} onPress={() => Keyboard.dismiss()}>
            <View style={[flex]}>
              <View style={{
                flexDirection: 'row', marginVertical: 10, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: 'white', alignItems: 'center', borderColor: LINE,
                borderBottomWidth: 1
              }}>
                <Text style={{ fontSize: 17, color: '#333', ...width }}>名称</Text>
                <View style={{ flex: 1, }}>
                  <TextInput numberOfLines={1} style={{ fontSize: 17, paddingVertical: 0, color: '#888', marginRight: 6 }}
                    value={this.state.inputText} placeholder={'请输入'} onFocus={this._onFocus}
                    placeholderTextColor={'#888'} underlineColorAndroid="transparent" returnKeyType={'done'} returnKeyLabel={'完成'}
                    onChangeText={text => this._onChangeText('name', text)} enablesReturnKeyAutomatically={true} autoFocus={true} />
                </View>

              </View>
              {this._renderRows()}
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAwareScrollView>
        {this._renderPickerDate()}
      </View>
    )
  }
}
