
'use strict';
import React, { Component } from 'react';
import {
  View,
  Platform,
  StyleSheet,
  ScrollView,
  InteractionManager,
  TextInput as TextInput2,
  Keyboard, findNodeHandle, UIManager, Dimensions, TouchableOpacity
} from 'react-native';
import PropTypes from 'prop-types';
import TextInput from '../CustomerTextInput';
import Toolbar from '../Toolbar';
import Button from '../Button.js';
import Bottom from '../Bottom.js';
import Text from '../Text';
import TouchFeedback from '../TouchFeedback';
import Icon from '../Icon.js';
import { isPhoneX } from '../../utils'
import DateTimePicker from 'react-native-modal-datetime-picker';
import Toast from 'react-native-root-toast';
const SH = Dimensions.get('window').height;
const IS_IOS = Platform.OS == 'ios';
import LabelValue from '../ticket/LabelValue';
import Colors from "../../utils/const/Colors";
import { getInterfaceLanguage, localStr } from "../../utils/Localizations/localization";
import moment from 'moment'
import en from '../../utils/Localizations/en';

export default class CreateTicketView extends Component {
  constructor(props) {
    super(props);
    this.state = { rowType: '', openDatePicker: false, useTime: '', date: new Date(), scrollEnabled: true };
    setTimeout(() => {
      this._calcDuration(props)
    }, 10);
    this._scrollY = 0;
  }

  _calcDuration(props) {
    let useTime = '';
    let unitIndex = 0;
    if (props.ticketInfo) {
      let duration = props.ticketInfo.getIn(['extensionProperties', 'duration']);
      if (duration) {
        useTime = duration.get('value');
        if (duration.get("unit") === '2') {
          unitIndex = 1;
        }
        // unitIndex = 0;
      }

      // let endTime = moment(props.ticketInfo.get('endTime'));
      // let startTime = moment(props.ticketInfo.get('startTime'));
      // let diff = endTime.diff(startTime) / 1000;
      // let daySeconds = 24 * 3600;
      // if ((diff + 1) % daySeconds === 0 || (diff) % daySeconds === 0) {
      //   //说明是整数天
      //   unitIndex = 1;

      //   useTime = Number(diff / daySeconds).toFixed(0);
      //   console.log(diff, daySeconds, useTime, String(useTime))
      // } else {
      //   //统一转换成小时处理
      //   useTime = Number(diff / 3600).toFixed(1)
      //   if (useTime === '0.0') useTime = 0.1;
      // }
    }
    this.setState({ useTime: String(useTime), unitIndex })
  }

  _onScroll(e) {
    const { x, y } = e.nativeEvent.contentOffset;
    this._scrollY = y;
    // this._contentSize=e.nativeEvent.contentSize;
    // this._layoutMeasurement=e.nativeEvent.layoutMeasurement;
    // console.warn('sy',y,e.nativeEvent);
  }

  _registerEvents() {
    this._keyboardDidShowSubscription = Keyboard.addListener('keyboardDidShow', (e) => this._keyboardDidShow(e));
    this._keyboardDidHideSubscription = Keyboard.addListener('keyboardDidHide', (e) => this._keyboardDidHide(e));
  }

  _unRegisterEvents() {
    this._keyboardDidShowSubscription && this._keyboardDidShowSubscription.remove();
    this._keyboardDidHideSubscription && this._keyboardDidHideSubscription.remove();
  }

  _keyboardDidShow(e) {
    // console.warn('_keyboardDidShow');
    this.keyborderHeight = e.endCoordinates.height;
    this.isKeyboardShow = true;
    if (!IS_IOS)
      this.setState({ scrollEnabled: false });
    // if(IS_IOS) {
    new Promise(() => {
      let node = findNodeHandle(this.refs.topView);
      if (node) {
        UIManager.measureInWindow(node, (x, y, w, h) => {
          if (this.keyborderHeight > (SH - (y + h + 90))) {
            let offset = this.keyborderHeight - (SH - (y + h + 90));
            this.setState({
              hiddenHeight: offset
            }, () => {
              this._offset = offset;
              let toY = this._offset + this._scrollY;
              // console.warn('scroll',this._scrollY,offset,toY);
              setTimeout(() => {
                InteractionManager.runAfterInteractions(() => {
                  if (this.refs.scrollview) {
                    this.refs.scrollview.scrollTo({ x: 0, y: toY, animated: true });
                  }
                });
              }, 50);
            })
          }
        })
      }
    }).then();
    // }
  }

  componentWillMount() {
    this._registerEvents();
  }

  componentWillUnmount() {
    this._unRegisterEvents();
  }

  _keyboardDidHide() {
    // console.warn('_keyboardDidHide',this._scrollY, this._offset);
    this.isKeyboardShow = false;

    // if(IS_IOS) {
    this.setState({
      hiddenHeight: 0,
      scrollEnabled: true,
    }, () => {
      if (this.refs.scrollview) {
        // console.warn('sv',this.refs.scrollview.getScrollResponder());
        setTimeout(() => {
          InteractionManager.runAfterInteractions(() => {
            if (this.refs.scrollview) {
              if (this._scrollY < 0) {
                this.refs.scrollview.scrollTo({ x: 0, y: 0, animated: true });
                return;
              }
              let offset = this._scrollY - this._offset;
              // console.warn('_keyboardDidHide', offset, this._scrollY, this._offset);
              if (offset < 0) offset = 0;
              this.refs.scrollview.scrollTo({ x: 0, y: offset, animated: true });
              this._offset = 0
            }
          });
        }, 50);
      }
    })

    // }
  }

  _renderPickerView() {
    return (
      <DateTimePicker
        locale={getInterfaceLanguage()}
        is24Hour={true}
        titleIOS={localStr('lang_alarm_time_picker_title')}
        headerTextIOS={localStr('lang_alarm_time_picker_title')}
        titleStyle={{ fontSize: 17, color: '#333' }}
        cancelTextIOS={localStr('lang_alarm_time_picker_cancel')}
        confirmTextIOS={localStr('lang_alarm_time_picker_ok')}
        mode={'datetime'} minimumDate={new Date()}
        datePickerModeAndroid={'spinner'}
        date={this.state.date}
        onDateChange={(date) => {
          this._selectDate = date;
          this.setState({ date })
        }}
        isVisible={this.state.modalVisible}
        onConfirm={(date) => {
          this.setState({ modalVisible: false });
          this.props.onDateChanged(this.state.type, date);
        }}
        onCancel={() => {
          this.setState({ modalVisible: false })
        }}
      />
    )
  }


  _getNavIcon(isNav) {
    if (isNav) {
      return (
        <Icon type='arrow_right' size={16} color={Colors.seTextSecondary} />
      )
    }
  }
  _getSelectIcon(isSelect) {
    if (!!isSelect) {
      return (
        <View style={styles.selectView}>
          <Icon type='icon_check' size={10} color='white' />
        </View>
      )
    } else {
      return (
        <View style={styles.unSelectView}>
        </View>
      )
    }
  }
  _getToolbar(data) {
    let actions = null;
    if (this.props.fullPermission && this.props.status === 10) {
      actions = [{
        title: '',
        iconType: 'delete',
        show: 'always', showWithText: false
      }];
    }
    return (
      <Toolbar title={this.props.title}
        navIcon="back"
        color={Colors.seBrandNomarl}
        borderColor={Colors.seBrandNomarl}
        onIconClicked={() => this.props.onBack()}
        actions={actions}
        onActionSelected={[this.props.onDeleteTicket]}
      />
    );
  }
  _getCustomerRow() {
    // return this._getSimpleRow({'title':'客户名称','value':this.props.customer.get('CustomerName'),'isNav':false});
    let arrAssets = this.props.data.get('Assets');
    let assetNames = [];
    if (arrAssets && arrAssets.size >= 1) {
      arrAssets.forEach(item => {
        assetNames.push(item.get('assetName'));
      });
    }
    let assetText = assetNames.length > 0 ? assetNames.join(',') : localStr('lang_create_alarm_ticket_select');
    let canEditAsset = false;
    //计划工单，报警工单和方案工单编辑时不能修改资产范围
    let ticketTpye = this.props.data.get('TicketType');
    if ((ticketTpye === 4)) {
      canEditAsset = true;
    }
    // if (this.props.ticketInfo) {
    //   if (!arrAssets||arrAssets.size===0) {
    //     canEditAsset=true;
    //   }else {
    //     if (ticketTpye===1||ticketTpye===4) {
    //       canEditAsset=true;
    //     }
    //   }
    // }

    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.seBgContainer, padding: 16 }}>
        <Text style={{ fontSize: 17, color: Colors.seTextPrimary }}>{localStr('lang_create_alarm_ticket_asset_range')}</Text>
        <TouchFeedback style={{ flex: 1 }} onPress={() => {
          Keyboard.dismiss();
          InteractionManager.runAfterInteractions(() => {
            if (canEditAsset) {//报警工单和计划工单不能修改资产范围
              //选择资产范围
              this.props.onRowClick('Assets');
            }
          });
        }}>
          <View style={{ flex: 1, marginLeft: 16, marginRight: 0, alignItems: 'flex-end' }}>
            {/* <AssetsText assetIcons={['icon_building']} separator="、" iconColor="#888"
              lineNumber={1} textColor={Colors.seTextSecondary} textSize={17} iconSize={15}
              assets={assetNames} emptyText="请选择" /> */}
            <Text numberOfLines={1} style={{ flex: 1, fontSize: 17, color: Colors.seTextSecondary }} >{assetText}</Text>
          </View>
        </TouchFeedback>
        {this._getNavIcon(canEditAsset)}
      </View>
    );
  }

  _getTaskView() {
    let inputView = null;
    //计划工单编辑，名称不可修改，资产范围，系统分类不可修改
    let canEditAsset = false;
    let ticketTpye = this.props.data.get('TicketType');
    if ((this.props.ticketInfo && ticketTpye !== 1) || !this.props.ticketInfo) {
      canEditAsset = true;
    }
    if (this.props.isJobTicket) canEditAsset = false;
    if (IS_IOS) {
      inputView = (
        <TextInput style={{ fontSize: 15, height: 168, color: '#888', lineHeight: 23, padding: 0 }}
          textAlign={'left'}
          autoFocus={false}
          maxLength={1000}
          placeholderStyle={{ fontSize: 15, marginTop: 4, top: 3, lineHeight: 23 }}
          placeholderTextColor={'#d0d0d0'}
          underlineColorAndroid={'transparent'}
          textAlignVertical={'top'}
          onChangeText={(text) => {
            this.props.onDateChanged('Content', text);
          }}
          value={this.props.data.get('Content')}
          placeholder={localStr('lang_ticket_edit_content_tip')} multiline={true}
        />
      )
    } else {
      inputView = (
        <ScrollView style={{ height: 168 }}>
          <TextInput style={{ fontSize: 15, color: '#888', lineHeight: 23 }}
            textAlign={'left'}
            autoFocus={false}
            maxLength={1000}
            placeholderStyle={{ fontSize: 15, marginTop: 4, top: 3, lineHeight: 23 }}
            placeholderTextColor={'#d0d0d0'}
            underlineColorAndroid={'transparent'}
            textAlignVertical={'top'}
            onChangeText={(text) => {
              this.props.onDateChanged('Content', text);
            }}
            value={this.props.data.get('Content')}
            placeholder={localStr('lang_ticket_edit_content_tip')} multiline={true}
          />
        </ScrollView>
      );
    }

    return (
      <View ref='topView' style={{ padding: 16, backgroundColor: Colors.seBgContainer }}>
        <TextInput2 style={{ fontSize: 15, color: Colors.seTextSecondary, padding: 0 }}
          textAlign={'left'}
          autoFocus={false}
          editable={canEditAsset}
          // maxLength={30}
          //placeholderStyle={{fontSize:15,lineHeight:23}}
          placeholderTextColor={Colors.seTextDisabled}
          underlineColorAndroid={'transparent'}
          //textAlignVertical={'top'}
          onChangeText={(text) => {
            if (text && text.length > 30) {
              text = text.substring(0, 30);
              Toast.show(localStr('lang_ticket_edit_title_tip'), {
                duration: Toast.durations.LONG,
                position: Toast.positions.CENTER,
              });
            }
            this.props.onDateChanged('Title', text);
          }}
          value={this.props.ticketTitle || ''}
          placeholder={localStr('lang_ticket_edit_title_tip2')} multiline={false}
        />
        {
          !this.props.isJobTicket &&
          <>
            <View style={{ height: 1, backgroundColor: Colors.seBorderSplit, marginVertical: 16 }} />
            {inputView}
          </>
        }
      </View>
    )
  }

  _getDocumentsView() {
    let rowData = null;
    if (!this.props.ticketInfo) {
      rowData = this.props.plan;
      if (!rowData || !rowData.get('Documents')) return null;
    } else {
      rowData = this.props.ticketInfo;
    }
    var documents = rowData.get('Documents').map((item) => { return { name: item.get('DocumentName'), id: item.get('OssKey') ? item.get('OssKey') : item.get('DocumentId'), size: item.get('Size'), ossKey: item.get('OssKey') } }).toArray();
    var content = [
      { label: '作业文档', value: documents }
    ];
    var style = { marginHorizontal: 16, marginBottom: 16 };
    if (Platform.OS === 'ios') {
      style = { marginHorizontal: 16, marginBottom: 8, marginTop: 8 };
    }
    if (!documents || documents.length === 0) {
      return;
    }
    return (
      <View style={{ backgroundColor: 'white' }}>
        {this._getSeperator({ marginHorizontal: 16 })}
        <View style={{ paddingBottom: 15, paddingHorizontal: 16, }}>
          <View style={{
            paddingTop: 16, paddingBottom: 11,
            flexDirection: 'row', alignItems: 'center',
          }}>
            <Text style={{ fontSize: 17, color: '#333', fontWeight: '600' }}>{'作业文档'}</Text>
          </View>
          {
            content.map((item, index) => {
              return (
                <LabelValue key={index} style={{ marginBottom: 0, }} label={item.label} value={item.value} forceStoped={this.state.forceStoped} />
              )
            })
          }
        </View>
      </View>
    )
  }

  _canEditStartTime() {
    let canEdit = false;
    if (this.props.ticketInfo) {
      let sta = this.props.ticketInfo.get('ticketState');
      if (sta === 10) {
        canEdit = true;
      }
    } else {
      canEdit = true;
    }
    return canEdit;
  }

  _getStartTimeRow() {
    let canEdit = this._canEditStartTime();
    return this._getSimpleRow({
      'title': localStr('lang_ticket_create_start_time'), 'value': this.props.data.get('StartTime'),
      'isNav': false, showNav: canEdit, type: 'StartTime'
    });
  }
  _getEndTimeRow() {
    return (
      <View style={[styles.row, styles.rowHeight, { backgroundColor: Colors.seBgContainer }]}>
        <Text style={styles.titleText}>
          {localStr('lang_ticket_create_duration')}
        </Text>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', flexDirection: 'row', marginLeft: 16 }}>
          <TextInput2 style={{ fontSize: 15, color: Colors.seTextSecondary, padding: 0, paddingHorizontal: 4, minWidth: 50, marginRight: 8 }}
            textAlign={'right'} keyboardType='numeric'
            autoFocus={false} maxLength={8}
            placeholderTextColor={Colors.seTextDisabled}
            underlineColorAndroid={'transparent'}
            onChangeText={(text) => {
              this.setState({ useTime: text })
            }}
            value={this.state.useTime || ''}
            placeholder={localStr('lang_ticket_create_duration_hint')} multiline={false}
          />
          {this._renderTimeUnits()}
        </View>
      </View>
    );
  }

  _renderTimeUnits() {
    let units = localStr('lang_ticket_create_duration_units');
    let unitIndex = this.state.unitIndex || 0;
    let views = units.map((item, index) => {
      let sel = index === unitIndex;
      return (
        <TouchableOpacity key={index} style={{ backgroundColor: sel ? Colors.seBrandNomarl : undefined, padding: 4, width: 40, alignItems: 'center', justifyContent: 'center', }}
          onPress={() => this.setState({ unitIndex: index })}
        >
          <Text style={{ fontSize: 12, color: Colors.seTextTitle }}>{item}</Text>
        </TouchableOpacity>
      )
    })
    return (
      <View style={{ flexDirection: 'row', borderRadius: 2, borderWidth: 1, borderColor: Colors.seBrandNomarl }}>
        {views}
      </View>
    )
  }

  _getAssetsRow() {
    var arrAssets = this.props.data.get('Assets');
    var value = '请选择';
    if (arrAssets && arrAssets.size >= 1) {
      value = arrAssets.map((item) => item.get('Name')).join(',');
    }

    return this._getSimpleRow({ 'title': localStr('lang_create_alarm_ticket_asset_range'), 'value': value, 'isNav': !this.props.isAlarm, 'type': 'Assets' });
  }
  _getExecutersRow() {
    var arrUsers = this.props.data.get('Executors');
    var value = localStr('lang_create_alarm_ticket_select');
    let hasSelect = false
    if (arrUsers && arrUsers.size >= 1) {
      value = arrUsers.map((item) => item.get('userName')).join(',');
      hasSelect = true;
    }
    return this._getSimpleRow({ 'title': localStr('lang_create_alarm_ticket_executor'), 'value': value, 'isNav': true, 'type': 'Executors', hasSelect });
  }

  _getSystemClassRow() {
    var value = this.props.sysClassText || localStr('lang_create_alarm_ticket_select');
    let hasSelect = true;
    //计划工单编辑，名称不可修改，资产范围，系统分类不可修改
    let canEditAsset = false;
    let ticketTpye = this.props.data.get('TicketType');
    if ((this.props.ticketInfo && ticketTpye !== 1) || !this.props.ticketInfo) {
      canEditAsset = true;
    }
    return this._getSimpleRow({ 'title': localStr('lang_create_alarm_ticket_system_category'), 'value': value, 'isNav': canEditAsset, 'type': 'SysClass', hasSelect });
  }

  _getDescriptionRow() {
    var strDes = '请输入详细内容';
    var content = this.props.data.get('Content');
    strDes = content && content.length > 0 ? content : strDes;
    return this._getSimpleRow({ 'title': '工单任务', 'value': strDes, 'isNav': true, 'type': 'Content' });
  }
  _getTicketTypeRow() {
    var type = this.props.data.get('TicketType');
    var arrTicketTypes = [{ 'title': '现场', 'value': '', 'isSelect': type === 4, 'type': 4 },
    { 'title': '随工', 'value': '', 'isSelect': type === 3, 'type': 3 }];
    var rowData = { 'title': '工单类型', 'value': arrTicketTypes, 'isNav': false, 'type': 'TicketType' };
    var value = rowData.value;
    if (this.props.ticketInfo || this.props.isAlarm || this.props.plan) {
      var ticketValue = '';
      switch (type) {
        case 1:
          ticketValue = '计划工单';
          break;
        case 2:
          ticketValue = '报警工单';
          break;
        case 3:
          ticketValue = '随工工单';
          break;
        case 4:
          ticketValue = '现场工单';
          break;
        case 5:
          ticketValue = '方案工单';
          break;
        default:
      }
      return this._getSimpleRow({ 'title': '工单类型', 'value': ticketValue, 'isNav': false, 'type': 'TicketType' });
    }
    // if (this.props.isAlarm || type===2) {
    //   return this._getSimpleRow({'title':'工单类型','value':'报警','isNav':false,'type':'TicketType'});
    // }
    return (
      <View style={[styles.row, styles.rowHeight]}>
        <Text style={styles.titleText}>
          {rowData.title}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <TouchFeedback style={[{ justifyContent: 'flex-end', flexDirection: 'row' }]} onPress={() => {
            this.props.onTicketTypeSelect(rowData.type, 4)
          }}>
            <View style={{ alignItems: 'center', flexDirection: 'row', padding: 10 }}>
              {this._getSelectIcon(value[0].isSelect)}
              <Text numberOfLines={1} style={[styles.valueText, { marginRight: 10 }]}>
                {value[0].title}
              </Text>
            </View>
          </TouchFeedback>
          <TouchFeedback style={[{ justifyContent: 'center', flexDirection: 'row' }]} onPress={() => {
            this.props.onTicketTypeSelect(rowData.type, 3)
          }}>
            <View style={{ alignItems: 'center', flexDirection: 'row' }}>
              {this._getSelectIcon(value[1].isSelect)}
              <Text numberOfLines={1} style={styles.valueText}>
                {value[1].title}
              </Text>
            </View>
          </TouchFeedback>
        </View>
      </View>
    );
  }
  _getSection(height) {
    return (
      <View style={{
        borderColor: Colors.seBgLayout, borderBottomWidth: height || 20,
      }}>{ }</View>);
  }

  _pickDate(type) {
    let date = new Date();
    // if (this.props.data.get(type)) {
    //   date = new Date(this.props.data.get(type));
    // }
    this.setState({ modalVisible: true, type: type, date });
  }

  _getSimpleRow(rowData) {
    var value = rowData.value;
    value = value.replace(/(^\s*)|(\s*$)/g, "");
    let textColor = {};
    if ((rowData.type === 'Executors' || rowData.type === 'SysClass') && !rowData.hasSelect) {
      textColor = { color: Colors.seTextSecondary }
    }
    return (
      <TouchFeedback style={[{ backgroundColor: Colors.seBgContainer }, styles.rowHeight]} onPress={() => {
        Keyboard.dismiss();
        // this._keyboardDidHide();
        setTimeout(() => {
          if (rowData.isNav) {
            this.props.onRowClick(rowData.type);
            this.setState({
              openDatePicker: false,
            });
          } else if (rowData.type === 'StartTime' || rowData.type === 'EndTime') {
            // var enableEditStartTime = this.props.ticketInfo ? this.props.ticketInfo.get('Status') < 2 : true;
            if (this._canEditStartTime()) {
              this._pickDate(rowData.type);
              // this.setState({
              //   rowType:rowData.type,
              //   openDatePicker:!this.state.openDatePicker,
              // });
              // this._showPicker(rowData.type);
              // this.props.onRowClick(rowData.type)
            }
          }
        }, 600);
      }}>
        <View style={[styles.row, styles.rowHeight]}>
          <Text style={styles.titleText}>
            {rowData.title}
          </Text>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', flexDirection: 'row', marginLeft: 16 }}>
            <Text numberOfLines={1} lineBreakModel='charWrapping' style={[styles.valueText, { flex: 1, }, textColor]}>
              {value}
            </Text>
            {this._getNavIcon(rowData.isNav || rowData.showNav)}
          </View>
        </View>
      </TouchFeedback>
    );
  }
  _getBottomButton() {
    // if (this.state.openDatePicker) {
    //   return null;
    // }else {
    return (
      <Bottom height={isPhoneX() ? 54 + 34 : 54} backgroundColor={Colors.seBgContainer} borderColor={Colors.seBorderSplit}>
        <Button
          style={[styles.button, {
            backgroundColor: Colors.seBrandNomarl,
          }]}
          disabledStyle={[styles.button, {
            backgroundColor: Colors.seTextDisabled,
          }]
          }
          textStyle={{
            fontSize: 16,
            color: Colors.seTextInverse
          }}
          disabled={false}
          text={localStr('lang_create_alarm_ticket_Save')} onClick={() => this._clickCheck()} />
      </Bottom>
    );
    // }
  }

  _clickCheck() {
    if (!this.props.data.get('Title') || this.props.data.get('Title').trim().length < 1) {
      Toast.show(localStr('lang_ticket_valid_title'), {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
      return;
    }
    if (!this.props.isJobTicket) {
      if (!this.props.data.get('Content') || this.props.data.get('Content').trim().length < 1) {
        Toast.show(localStr('lang_ticket_valid_content'), {
          duration: Toast.durations.LONG,
          position: Toast.positions.BOTTOM,
        });
        return;
      }
    }

    var arrUsers = this.props.data.get('Executors');
    if (!arrUsers || arrUsers.size < 1) {
      Toast.show(localStr('lang_create_alarm_ticket_select_executor'), {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
      return;
    }
    // if (this.props.data.get('EndTime') < this.props.data.get('StartTime')) {
    //   Toast.show('结束时间不能早于开始时间', {
    //     duration: Toast.durations.LONG,
    //     position: Toast.positions.BOTTOM,
    //   });
    //   return;
    // }
    if (!this.state.useTime) {
      Toast.show(localStr('lang_ticket_valid_use_time'), {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
      return;
    }
    let useTime = Number(this.state.useTime)
    if (isNaN(useTime) || useTime < 0) {
      Toast.show(localStr('lang_ticket_valid_use_time_format'), {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
      return;
    }
    let start = moment(this.props.data.get('StartTime')).valueOf();
    let timeValue = useTime;
    if (this.state.unitIndex) {
      useTime *= 24 * 3600 * 1000;
    } else {
      useTime *= 3600 * 1000;
    }
    this.props.onDateChanged('EndTime', new Date(start + useTime));
    setTimeout(() => {
      this.props.onCreateTicket({ unit: String(this.state.unitIndex + 1), value: timeValue });
    }, 10);

  }

  _getSeperator(style) {
    return <View style={[{ height: 1, backgroundColor: Colors.seBorderSplit }, style]} />
  }

  render() {
    if (!this.props.data) {
      return (
        <View style={{ flex: 1, backgroundColor: Colors.seBgContainer }}>
          {this._getToolbar(this.props.ticketInfo)}
        </View>
      );
    }
    return (
      <View style={{ flex: 1, backgroundColor: Colors.seBgContainer }}>
        {this._getToolbar(this.props.ticketInfo)}

        <ScrollView onScroll={e => this._onScroll(e)} alwaysBounce={false} scrollEventThrottle={3}
          keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag"
          ref='scrollview' nestedScrollEnabled={true} scrollEnabled={this.state.scrollEnabled}
          style={[{ marginBottom: isPhoneX() ? 54 + 34 : 54, showsVerticalScrollIndicator: false, backgroundColor: Colors.seBgLayout }]}>

          {this._getSection(10)}
          {this._getTaskView()}

          {/* {this._getDocumentsView()} */}

          {/*{this._getTicketTypeRow()}*/}
          {this._getSection(10)}
          <View style={{ backgroundColor: Colors.seBgContainer }}>
            {this._getCustomerRow()}
            {this._getSeperator({ marginHorizontal: 16 })}
            {this._getStartTimeRow()}
            {/*{this._getDatePicker('StartTime')}*/}
            {this._getSeperator({ marginHorizontal: 16 })}
            {this._getEndTimeRow()}
            {/*{this._getDatePicker('EndTime')}*/}
            {this._getSeperator({ marginHorizontal: 16 })}
            {this._getExecutersRow()}
            {this._getSeperator({ marginHorizontal: 16 })}
            {/* {this._getSystemClassRow()} */}
          </View>
          <View style={{ height: this.state.hiddenHeight || 0 }} />
          <View style={{ height: 10 }} />
          {/*<Text style={{fontSize:15,color:Colors.seTextSecondary,marginHorizontal:16}}>*/}
          {/*  {`${localStr('lang_create_alarm_ticket_customer')}：`+this.props.customer.get('CustomerName')}*/}
          {/*</Text>*/}
        </ScrollView>

        {this._getBottomButton()}
        {this._renderPickerView()}
      </View>
    );
  }
}

CreateTicketView.propTypes = {
  navigator: PropTypes.object,
  title: PropTypes.string,
  onBack: PropTypes.func.isRequired,
  onRowClick: PropTypes.func.isRequired,
  onDateChanged: PropTypes.func.isRequired,
  onTicketTypeSelect: PropTypes.func.isRequired,
  // isFetching:PropTypes.bool.isRequired,
  isPosting: PropTypes.number,
  data: PropTypes.object,
  onRefresh: PropTypes.func.isRequired,
  onCreateTicket: PropTypes.func.isRequired,
  onDeleteTicket: PropTypes.func.isRequired,
  customer: PropTypes.object.isRequired,
  isEnableCreate: PropTypes.bool.isRequired,
  isExecuterNotCreate: PropTypes.bool.isRequired,
  isAlarm: PropTypes.bool,
  ticketInfo: PropTypes.object,
}

const styles = global.amStyleProxy(() => StyleSheet.create({
  button: {
    height: 40,
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 2,
    marginBottom: isPhoneX() ? 34 : 0
  },
  rowHeight: {
    height: 49,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    // flex:1,
    backgroundColor: Colors.seBgContainer,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  titleText: {
    fontSize: 17,
    color: Colors.seTextPrimary,//BLACK,
    // flex:1,
    // backgroundColor:'white',
  },
  valueText: {
    textAlign: 'right',
    marginLeft: 10,
    fontSize: 17,
    color: Colors.seTextSecondary,//GRAY
  },

  selectView: {
    width: 18,
    height: 18,
    borderRadius: 10,
    backgroundColor: Colors.seBrandNomarl,
    // paddingRight:10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  unSelectView: {
    width: 18,
    height: 18,
    borderRadius: 10,
    borderColor: Colors.seBorderSplit,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
}));
