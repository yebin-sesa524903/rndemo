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
import moment from "moment";
import { listenToKeyboardEvents } from 'react-native-keyboard-aware-scroll-view'
const KeyboardAwareScrollView = listenToKeyboardEvents((props) => <ScrollView {...props} />);

const PanelSection = ['中压一次AIS柜', '中压一次GIS柜', '中压二次柜', '施耐德低压柜', '其它柜型'];
const OtherSection = ['中压柜', '低压柜', '电容柜'];

const BRAND_SCHNEIDER = '施耐德电气';
const BRAND_NOT_SCHNEIDER = '非施耐德电气';

const PanelType = [
  [
    { key: 'PIX', value: 'MSAPI010', },
    { key: 'PIX 50KA', value: 'MSAPI011', },
    { key: 'PIX 500', value: 'MSAPI016', },
    { key: 'DNF7', value: 'MSADN001', },
    { key: 'MVnex-12/24', value: 'MSAMV001', },
  ],
  [
    { key: 'WSG', value: 'MSGGH001' },
    { key: 'WIG', value: 'MSGGH002' },
    { key: 'GMA', value: 'MSGGM001' },
  ],
  [
    { key: 'FBX', value: 'MSGFB001' },
    { key: 'RM6', value: 'MSGRM001' },
    { key: 'RM6-S', value: 'MSGFB002' },
    { key: 'RM6-S PLUS', value: 'MSGRM002' },
    { key: 'FLUSARC', value: 'MSGFL001' },
    { key: 'PREMSET', value: 'SWITCHBOARD_MV' },
    { key: 'SM6', value: 'SWITCHBOARD_MV' },
  ],
  [
    { key: 'Blokset低压柜', value: 'LVESWBC_BLOKSET' },
    { key: 'BM6 Plus低压柜', value: 'LVESWBC_BM6PLUS' },
    { key: 'BM6低压柜', value: 'LVESWBC_BM6' },
    { key: 'Prisma E低压柜', value: 'LVESWBC_PRISMAE' },
    { key: 'Okken低压柜', value: 'LVESWBI_OKKEN' },
    { key: 'Blokset MB低压柜', value: 'LVESWBI_BLOKSETMB' },
    { key: 'Prisma iPM低压柜', value: 'LVESWBI_PRISMAIPM' },
    { key: 'Blokset 5000低压柜', value: 'LVESWBC_B5000' },
    { key: 'OKKENL低压柜', value: 'LVESWBC_OKKENL' },
  ],
  [
    { key: '其它低压电气柜', value: '无' },
    { key: '其它中压电气柜', value: '无' },
    { key: '其它', value: '无' },
  ]
];

export default class PanelEditView extends Component {

  constructor(props) {
    super(props);
    //如果data中初始化编辑数据
    let editData = this.initData();
    this.state = {
      inputText: this.props.name,
      ...editData
    }
  }

  initData() {
    let data = {};
    if (this.props.data) {
      data.factory = this.props.data.get('Factory');
      data.brand = this.props.data.get('FactoryType');
      data.type = this.props.data.get('PanelClass');
      data.model = this.props.data.get('PanelType');
      let propertyGroups = this.props.data.get('PropertyGroups');
      if (propertyGroups) {
        propertyGroups = propertyGroups.toJS();
        let findInstall = propertyGroups.find(item => item.Name === '安装信息');
        if (findInstall) {
          findInstall.Properties.forEach(item => {
            if (item.Name === '生产日期' && item.Value) {
              data.createDate = moment(item.Value).toDate();
            }
            if (item.Name === '运行日期' && item.Value) {
              data.runDate = moment(item.Value).toDate();
            }
          });
        }
      }
    }
    return data;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.name !== this.props.name) {
      this.setState({
        inputText: nextProps.name
      })
    }
  }

  _onChangeText(type, text) {
    this.setState({ inputText: text })
  }

  componentWillUnmount() {
    Keyboard.dismiss();
  }

  _onFocus(e) {
  }

  // _doSubmit(){
  //   Keyboard.dismiss();
  // }

  _renderRow(title, value, cb) {
    if (!cb) {
      return this._renderInputRow(title, value);
    }

    return (
      <TouchFeedback onPress={() => cb(title)}>
        <View style={{
          minHeight: 56, paddingVertical: 16, marginLeft: 16, paddingRight: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
          borderBottomWidth: 1, borderBottomColor: '#e6e6e6'
        }}>
          <Text style={{ fontSize: 17, color: '#333', width: 92 }}>{title}</Text>
          <Text style={{ fontSize: 17, color: '#888', flex: 1 }}>{value || '请选择'}</Text>
          <Icon type={'icon_asset_folder'} color={'#b2b2b2'} size={20} />
        </View>
      </TouchFeedback>
    )
  }

  _renderInputRow(title, key) {
    return (
      <View style={{
        height: 56, marginLeft: 16, paddingRight: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderBottomWidth: 1, borderBottomColor: '#e6e6e6'
      }}>
        <Text style={{ fontSize: 16, color: '#333', width: 90 }}>{title}</Text>
        <TextInput style={{ fontSize: 16, color: '#888', height: 23, padding: 0, flex: 1 }}
          placeholderTextColor={'#888'}
          underlineColorAndroid={'transparent'}
          onChangeText={text => {
            let obj = {};
            obj[key] = text;
            this.setState(obj)
          }}
          value={this.state[key] || ''} placeholder={'请输入'}
        />
      </View>
    )
  }

  _selectDate(type) {
    let dateType = type === '生产日期' ? 'createDate' : 'runDate';
    this.setState({
      dateType, modalVisible: true
    })
  }

  _isSchneiderBrand(brand = this.state.brand) {
    return brand === 1;
  }

  _selectType() {
    if (!this.state.brand) {
      Toast.show('请先选择品牌', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
      return;
    }

    let data = [];
    if (this._isSchneiderBrand()) {
      data = PanelSection;
    } else {
      data = OtherSection;
    }
    this.props.navigation.push('PageWarpper', {
      id: 'AssetInfoSingleSelect',
      component: AssetInfoSingleSelect,
      passProps: {
        showInput: false,
        dataList: data,
        title: '选择类型',
        navigator: this.props.navigator,
        onBack: () => this.props.navigation.pop(),
        onSelect: (text) => {
          if (this.state.type !== text) {
            this.setState({
              type: text,
              model: null
            })
          }
        }
      }
    });
  }

  _selectModel() {
    if (!this.state.brand) {
      Toast.show('请先选择品牌', {
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

    let data = PanelType[PanelSection.indexOf(this.state.type)].map(item => item.key);

    this.props.navigation.push('PageWarpper', {
      id: 'AssetInfoSingleSelect',
      component: AssetInfoSingleSelect,
      passProps: {
        dataList: data,
        title: '选择型号',
        navigator: this.props.navigator,
        onBack: () => this.props.navigation.pop(),
        onSelect: (text) => {
          if (this.state.type !== text) {
            this.setState({
              model: text
            })
          }
        }
      }
    });
  }

  _getBrand() {
    switch (this.state.brand) {
      case 1:
        return BRAND_SCHNEIDER;
      case 2:
        return BRAND_NOT_SCHNEIDER;
      default:
        return null;
    }
  }

  _selectBrand() {
    let dataList = [BRAND_SCHNEIDER, BRAND_NOT_SCHNEIDER];
    this.props.navigation.push('PageWarpper', {
      id: 'AssetInfoSingleSelect',
      component: AssetInfoSingleSelect,
      passProps: {
        dataList,
        title: '品牌',
        navigator: this.props.navigator,
        onBack: () => this.props.navigation.pop(),
        onSelect: (text) => {
          if (this._getBrand() !== text) {
            let brand = dataList.indexOf(text) + 1;
            //如果是编辑之前创建的盘柜，默认都当做施耐德配电柜
            if (!this.state.brand && text === BRAND_SCHNEIDER) {
              this.setState({
                brand
              })
              return;
            }
            this.setState({
              brand,
              type: null,
              model: null
            })
          }
        }
      }
    });
  }

  _isModelInput() {
    return this.state.brand === 2;
  }

  _renderRows() {
    return (
      <View style={{ backgroundColor: '#fff' }}>
        {this._renderRow('生产厂家', 'factory')}
        {this._renderRow('生产日期', this._formatTime(this.state.createDate), (type) => this._selectDate(type))}
        {this._renderRow('运行日期', this._formatTime(this.state.runDate), (type) => this._selectDate(type))}
        {this._renderRow('品牌', this._getBrand(), () => this._selectBrand())}
        {this._renderRow('类型', this.state.type, () => this._selectType())}
        {this._renderRow('型号', this._isModelInput() ? 'model' : this.state.model, this._isModelInput() ? null : () => this._selectModel())}
      </View>
    )
  }

  _isValid(arr) {
    let valid = true;
    for (let i = 0; i < arr.length; i++) {
      if (!this.state[arr[i]] || !String(this.state[arr[i]]).trim()) return false;
    }
    return valid;
  }

  _enableSubmit() {
    if (!this._isValid(['factory', 'createDate', 'inputText', 'runDate', 'type', 'brand'])) return false;
    if (this._isSchneiderBrand()) {
      if (!this._isValid(['model'])) return false;
    }
    return true;
  }

  _processEdit(body) {
    //如果是编辑提交，则传递的数据有细微调整
    let propertyGroups = this.props.data.get('PropertyGroups');
    if (propertyGroups) {
      //如果有，则替换
      propertyGroups = propertyGroups.toJS();
      let findInstall = propertyGroups.find(item => item.Name === '安装信息')
      if (findInstall) {
        findInstall.Properties.forEach(item => {
          if (item.Name === '生产日期') {
            item.Value = this._formatSubmitDate(this.state.createDate);
          }
          if (item.Name === '运行日期') {
            item.Value = this._formatSubmitDate(this.state.runDate);
          }
        });
      }
      body.PropertyGroups = propertyGroups;
      body.Id = this.props.data.get('Id');
      body.ParentId = this.props.data.get('ParentId');
    }
  }

  _doSubmit() {
    //组装提交数据
    let body = {
      "FactoryType": this.state.brand, // 1为施耐德厂家, 2为非施耐德厂家
      "Factory": this.state.factory.trim(),
      "Name": this.state.inputText.trim(),
      "SubType": 0,
      "Type": 4,
      "PanelClass": this.state.type,
      "PanelType": this.state.model.trim(),
      "PropertyGroups": [
        {
          "Id": 1,
          "HierarchyId": "",
          "Order": 1,
          "Name": "安装信息",
          "Properties": [
            {
              "Id": "",
              "GroupId": 1,
              "Order": 1,
              "Name": "生产日期",
              "Value": this._formatSubmitDate(this.state.createDate),
              "HintText": "请选择"
            },
            {
              "Id": "",
              "GroupId": 1,
              "Order": 2,
              "Name": "运行日期",
              "Value": this._formatSubmitDate(this.state.runDate),
              "HintText": "请选择"
            }
          ]
        }
      ]
    }
    if (this.props.data) {
      this._processEdit(body);
    }
    console.warn(body);
    this.props.submit(body, this.state.model.trim());
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

  _formatTime(time) {
    if (!time) return null;
    return moment(time).format('YYYY年MM月DD日');
  }

  _formatSubmitDate(date) {
    if (!date) return '';
    return moment(date).format('YYYY-MM-DD');
  }

  render() {
    let width = { width: 90 };
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
