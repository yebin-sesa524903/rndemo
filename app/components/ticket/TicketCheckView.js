
'use strict';
import React, { Component } from 'react';

import {
  View,
  Platform,
  ScrollView,
  TextInput,
  Text,
  Keyboard,
  UIManager,
  Dimensions,
  Alert, InteractionManager
} from 'react-native';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import Toast from 'react-native-root-toast';

import TextInput2 from '../CustomerTextInput';

import Toolbar from '../Toolbar';
// import Loading from '../Loading';
import PagerBar from '../PagerBar.js';
import { GREEN, TAB_BORDER, LIST_BG } from '../../styles/color.js';
import { LINE } from "../../styles/color";
import TouchFeedback from "../TouchFeedback";
import backHelper from '../../utils/backHelper';
// import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { listenToKeyboardEvents } from 'react-native-keyboard-aware-scroll-view'
const KeyboardAwareScrollView = listenToKeyboardEvents((props) => <ScrollView {...props} />);
import { submitPatrolTicketItems, loadCacheTicketById } from '../../actions/ticketAction';

import { cacheTicketModify, getTicketFromCache, isTicketInCache } from '../../utils/sqliteHelper';

const SH = Dimensions.get('window').height;
const IS_IOS = Platform.OS === 'ios';

const CHECKEDVIEW = (
  <View style={{
    width: 22, height: 22, justifyContent: 'center', alignItems: 'center',
    borderRadius: 11, borderColor: GREEN, borderWidth: 1
  }}>
    <View style={{ width: 11, height: 11, borderRadius: 5.5, backgroundColor: GREEN }} />
  </View>
);

const UNCHECKVIEW = (
  <View style={{ width: 22, height: 22, borderColor: "#d9d9d9", borderWidth: 1, borderRadius: 11 }} />
)

class TicketCheckView extends Component {

  static contextTypes = {
    showSpinner: PropTypes.func,
    hideHud: PropTypes.func
  };

  constructor(props) {
    super(props);
    this._isDestory = false;
    this.state = {
      data: this.props.data,
      enable: true

    };
  }

  _keyboardDidShow(e) {
    this.setState({ isKeyboardShow: true });
    this.keyborderHeight = e.endCoordinates.height;
    this.isKeyboardShow = true;
  }

  _keyboardDidHide() {
    this.setState({ isKeyboardShow: false });
    this.isKeyboardShow = false;
  }
  _registerEvents() {
    this._keyboardDidShowSubscription = Keyboard.addListener('keyboardDidShow', (e) => this._keyboardDidShow(e));
    this._keyboardDidHideSubscription = Keyboard.addListener('keyboardDidHide', (e) => this._keyboardDidHide(e));
  }

  _unRegisterEvents() {
    this._keyboardDidShowSubscription && this._keyboardDidShowSubscription.remove();
    this._keyboardDidHideSubscription && this._keyboardDidHideSubscription.remove();
  }

  componentDidMount() {
    backHelper.init(this.props.navigator, this.props.route.id);
    this._registerEvents();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isPosting !== this.props.isPosting) {
      this._disableSubmit = false;
      this.setState({ enable: true })
      if (nextProps.isPosting !== 1)
        this.context.hideHud();

      if (nextProps.isPosting === 2) {
        //说明接口成功，返回上一级
        InteractionManager.runAfterInteractions(() => {
          this.props.navigation.pop();
        });
      }
    }

  }

  _onFocus(e) {
    this._y = this.scroll.position.y;
    new Promise(() => {
      UIManager.measureInWindow(e.target, (x, y, w, h) => {
        // console.log('_doCheck', x, y, w, h, SH, this.keyborderHeight);
        let toBottom = SH - (y + h + 35);
        // console.log('toBottom',toBottom,'keyheight',this.keyborderHeight);
        this._doCheck(toBottom);
      })
    }).then();
  }

  _doCheck(toBottom) {
    if (this.isKeyboardShow) {
      let covHeight = this.keyborderHeight - toBottom;
      if (covHeight > 0) {
        if (!IS_IOS) covHeight += 10;
        this.scroll.scrollToPosition(0, this._y + covHeight, true);
      }
    }
  }

  componentWillUnmount() {
    backHelper.destroy(this.props.route.id);
    this._unRegisterEvents();
  }

  //抄表类别
  _renderReadingMeterRow(row, index) {
    let invalidView = null;

    let value = row.get('Result');
    let strValue = String(value).trim();
    let isNumber = true;
    if (strValue.length > 1) {
      if (strValue[0] === '.' || strValue[strValue.length - 1] === '.') isNumber = false;
    }
    // console.warn('value',value);
    if (value && String(value).trim() !== '' && row.get('Name') !== this.state.focusTitle) {
      if (!isNaN(value)) {
        let num = Number.parseFloat(value);
        if (isNumber &&
          ((row.get('MaxValue') && num > row.get('MaxValue')) ||
            (row.get('MinValue') && num < row.get('MinValue')))) {
          invalidView = (
            <View style={{
              width: 52, height: 22, backgroundColor: '#fff1f0',
              borderRadius: 2, borderWidth: 1, borderColor: '#ffa39e', marginLeft: 8,
              alignItems: 'center', justifyContent: 'center'
            }}>
              <Text style={{ fontSize: 12, color: '#ff4d4d' }}>异常</Text>
            </View>
          );
        }
      }
    }

    // if((value<=row.get('MaxValue')&&value>=row.get('MinValue'))){
    //   invalidView=null;
    // }
    if (!this.props.canEdit) {
      value = value || '-';
    }

    let textColor = '#888';
    if ((this.props.canEdit && isNaN(value) && row.get('Name') !== this.state.focusTitle) || !isNumber) {
      textColor = '#ff4d4d';
    }

    return (
      <View key={index} style={{
        height: 56, marginLeft: 16, flexDirection: 'row', alignItems: 'center',
        borderBottomColor: '#f2f2f2', borderBottomWidth: 1
      }}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text numberOfLines={1} style={{ fontSize: 17, color: '#333' }}>{`${row.get('Name')}（${row.get('Unit')}）`}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 17 }}>
          <TextInput numberOfLines={1} style={{ fontSize: 17, textAlign: 'right', minWidth: 70, maxWidth: 120, paddingVertical: 12, color: textColor }}
            value={String(value || '')} placeholder={'请输入'} onFocus={e => {
              this._onFocus(e);
              this.setState({ focusTitle: row.get('Name') })
            }}
            keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : "numeric"}
            placeholderTextColor={'#d0d0d0'} underlineColorAndroid="transparent" onBlur={() => this._onBlur(value)}
            returnKeyType={'done'} returnKeyLabel={'完成'} editable={this.props.canEdit}
            onChangeText={text => this._onRowChanged(index, 'Result', text)}
            enablesReturnKeyAutomatically={true} />
          {invalidView}
        </View>
      </View>
    )
  }

  _onBlur(value) {
    this.setState({ focusTitle: null });
    let strValue = String(value).trim();
    let isNumber = true;
    if (strValue.length > 1) {
      if (strValue[0] === '.' || strValue[strValue.length - 1] === '.') isNumber = false;
    }
    //如果非数字，则提示仅支持数字
    if (!isNumber || isNaN(value)) {
      if (this._toast) Toast.hide(this._toast);
      this._toast = Toast.show('仅支持数字', {
        duration: Toast.durations.LONG,
        position: Toast.positions.CENTER,
      });
    }
  }

  //判断是否能进行执行/提交/关闭/修改巡检项等操作，如果当前工单在待处理同步工单中，则不需继续提交了
  _checkNotCanEdit() {
    let id = this.props.ticketId;
    if (isConnected()) {//目前只处理巡检工单
      let unSyncTicket = this.props.sync.get('waitingSyncTickets');
      if (unSyncTicket.size > 0) {
        let index = unSyncTicket.findIndex(item => item.get('id') === id);
        if (index >= 0) {
          Toast.show('工单同步未完成，请完成后再进行此操作', {
            duration: Toast.durations.LONG,
            position: Toast.positions.BOTTOM,
          });
          return true;
        }
      }
    }
  }

  _checkInput() {
    Keyboard.dismiss();
    //如果是输入类的，需要判断选择是的输入框里面有没有输入内容
    let type = this.state.data.get('ValueType');
    if (type === 3) {
      let count = this.state.data.get('SubItems').size;
      for (let i = 0; i < count; i++) {
        let value = this.state.data.getIn(['SubItems', i, 'Result']);
        let comment = this.state.data.getIn(['SubItems', i, 'Comment']);
        if (value === true && (!comment || String(comment).trim().length === 0)) {
          Toast.show('请输入详情说明', {
            duration: Toast.durations.LONG,
            position: Toast.positions.BOTTOM,
          });
          return;
        }
      }
    }
    if (type === 2) {//抄表类，输入非法字符，提示不能保存
      let count = this.state.data.get('SubItems').size;
      for (let i = 0; i < count; i++) {
        let value = this.state.data.getIn(['SubItems', i, 'Result']);
        if (value && value.trim().length > 1 && value.trim()[0] === '.') {
          if (this._toast) Toast.hide(this._toast);
          this._toast = Toast.show('仅支持数字', {
            duration: Toast.durations.LONG,
            position: Toast.positions.BOTTOM,
          });
          return;
        }
        if (isNaN(value)) {
          if (this._toast) Toast.hide(this._toast);
          this._toast = Toast.show('仅支持数字', {
            duration: Toast.durations.LONG,
            position: Toast.positions.BOTTOM,
          });
          return;
        }

      }
    }

    if (this._checkNotCanEdit()) return;

    this.setState({ enable: false }, () => {
      let count = this.state.data.get('SubItems').size;
      let showDialog = false;
      for (let i = 0; i < count; i++) {
        let value = this.state.data.getIn(['SubItems', i, 'Result']);
        if (value === undefined || value === null || String(value).trim() === '') {
          showDialog = true;
          break;
        }
      }

      let doAction = async () => {
        this.context.showSpinner();
        let newContent = this.props.content;
        newContent = newContent.setIn([0, 'MainItems', this.props.index], this.state.data);

        if (!isConnected()) {
          let id = this.props.ticketId
          let hasCache = await isTicketInCache(id);
          if (hasCache) {//有缓存，保存缓存
            //处理更新后的状态
            await cacheTicketModify(id, 2, JSON.stringify(newContent.toJS()));
            let ticket = await getTicketFromCache(id);
            this.props.loadCacheTicketById(ticket);
            this.context.hideHud();
            InteractionManager.runAfterInteractions(() => {
              this.props.navigation.pop();
            });
            return true;
          }
        }
        this.props.submitPatrolTicketItems(this.props.ticketId, newContent.toJS());
      };

      if (showDialog) {
        Alert.alert(
          '',
          `您有巡检内容未填写，确认完成`,
          [
            {
              text: '继续填写', onPress: () => {
                this.setState({ enable: true })
              }
            },
            {
              text: '完成', onPress: () => {
                InteractionManager.runAfterInteractions(() => {
                  doAction();
                });
              }
            },
          ],
          { cancelable: false }
        )
      } else {
        //直接保存数据
        // this.props.onSubmit(this.state.data);
        doAction();
      }
    });

  }

  _renderCheckItem(lable, checked, clickValue, row, index) {
    return (
      <TouchFeedback onPress={() => {
        this._onRowChanged(index, 'Result', clickValue);
      }}>
        <View style={{
          flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
          paddingHorizontal: 16, marginLeft: -16, marginTop: -5, marginBottom: -5
        }}>
          {checked ? CHECKEDVIEW : UNCHECKVIEW}
          <Text style={{ fontSize: 17, color: '#888', marginLeft: 12 }}>{lable}</Text>
        </View>
      </TouchFeedback>
    )
  }

  //判断类别
  _renderJudgeRow(row, index) {
    let value = row.get('Result');
    if (!this.props.canEdit) {
      let txtColor = '#888';
      let invalidView = null;
      if (value === null || value === undefined) {
        value = '-';
      } else if (!value) {
        value = '异常';
        // txtColor='#ff4d4d';
        invalidView = (
          <View style={{
            width: 52, height: 22, backgroundColor: '#fff1f0',
            borderRadius: 2, borderWidth: 1, borderColor: '#ffa39e', marginLeft: 8,
            alignItems: 'center', justifyContent: 'center'
          }}>
            <Text style={{ fontSize: 12, color: '#ff4d4d' }}>异常</Text>
          </View>
        );

      } else {
        value = '正常';
      }
      return (
        <View key={index} style={{
          marginLeft: 16, flexDirection: 'row', alignItems: 'center', paddingVertical: 16,
          paddingRight: 16, borderBottomColor: '#f2f2f2', borderBottomWidth: 1
        }}>
          <View style={{ flex: 1, marginRight: 32 }}>
            <Text style={{ fontSize: 17, color: '#333', lineHeight: 25 }}>{`${row.get('Name')}：${row.get('Content')}`}</Text>
          </View>
          <Text numberOfLines={1} style={{ fontSize: 17, color: txtColor }}>
            {value}
          </Text>
          {invalidView}
        </View>
      )
    }

    return (
      <View key={index} style={{
        marginLeft: 16, paddingTop: 16, paddingBottom: 16,
        borderBottomColor: '#f2f2f2', borderBottomWidth: 1
      }}>
        <View style={{ flex: 1, paddingRight: 16 }}>
          <Text style={{ fontSize: 17, color: '#333', lineHeight: 25 }}>{`${row.get('Name')}：${row.get('Content')}`}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginTop: 16 }}>
          {this._renderCheckItem('正常', row.get('Result'), true, row, index)}
          <View style={{ width: 60 }} />
          {this._renderCheckItem('异常', row.get('Result') === false, false, row, index)}
        </View>
      </View>
    )
  }

  //输入类别
  _renderInputRow(row, index) {
    // let canEdit=(this.props.status===3||this.props.status===2)&&this.props.roleType!==1;
    let value = row.get('Result');
    if (!this.props.canEdit) {
      let txtColor = '#888';
      let invalidView = null;
      if (value === undefined || value === null) {
        value = '-';
      } else if (!value) {
        value = '无';
        // txtColor='#ff4d4d';
      } else {
        value = '有';
        invalidView = (
          <View style={{
            width: 52, height: 22, backgroundColor: '#fff1f0',
            borderRadius: 2, borderWidth: 1, borderColor: '#ffa39e', marginLeft: 8,
            alignItems: 'center', justifyContent: 'center'
          }}>
            <Text style={{ fontSize: 12, color: '#ff4d4d' }}>异常</Text>
          </View>
        );
      }
      return (
        <View key={index} style={{
          marginLeft: 16, paddingRight: 16, paddingVertical: 16,
          borderBottomColor: '#f2f2f2', borderBottomWidth: 1
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1, marginRight: 32 }}>
              <Text style={{ fontSize: 17, color: '#333', lineHeight: 25 }}>{row.get('Name')}</Text>
            </View>
            <Text numberOfLines={1} style={{ fontSize: 17, color: '#888' }}>
              {value}
            </Text>
            {invalidView}
          </View>
          {row.get('Comment') &&
            <View style={{
              marginTop: 16, paddingTop: Platform.OS === 'ios' ? 4 : 8, paddingBottom: 8, paddingHorizontal: 12,
              backgroundColor: '#f5f5f5', marginBottom: 8
            }}>
              <Text style={{ fontSize: 15, lineHeight: 23, color: '#888' }}>
                {row.get('Comment')}
              </Text>
            </View>
          }
        </View>
      )
    }

    return (
      <View key={index} style={{
        marginLeft: 16, paddingTop: 16, paddingBottom: 16, paddingRight: 16, flex: 1,
        borderBottomColor: '#f2f2f2', borderBottomWidth: 1
      }}>
        <View style={{ flex: 1, paddingRight: 16 }}>
          <Text style={{ fontSize: 17, color: '#333', lineHeight: 25 }}>{row.get('Name')}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginTop: 16 }}>
          {this._renderCheckItem('有', row.get('Result'), true, row, index)}
          <View style={{ width: 60 }} />
          {this._renderCheckItem('无', row.get('Result') === false, false, row, index)}
        </View>
        {row.get('Result') && this._getTextInput(row, index)
        }
      </View>
    )
  }

  _getTextInput(row, index) {
    if (Platform.OS === 'ios') {
      return (
        <View style={{
          borderColor: "#e6e6e6", borderRadius: 2, flex: 1,
          borderWidth: 1, marginTop: 20, paddingTop: 4, paddingBottom: 8, paddingHorizontal: 12
        }}>
          <TextInput2 style={{ fontSize: 15, height: 69, color: '#888', lineHeight: 23, padding: 0, marginTop: -4 }}
            textAlign={'left'}
            autoFocus={false}
            maxLength={1000} multiline={true}
            placeholderStyle={{ fontSize: 15, marginTop: 4, top: 0, lineHeight: 23 }}
            placeholderTextColor={'#d0d0d0'}
            underlineColorAndroid={'transparent'}
            textAlignVertical={'top'}
            onChangeText={text => this._onRowChanged(index, 'Comment', text)}
            value={row.get('Comment')} placeholder={'请输入详细说明'} onFocus={e => this._onFocus(e)}
          />
        </View>
      )
    } else {
      return (
        <View style={{
          borderColor: "#e6e6e6", borderRadius: 2, height: 90, flex: 1,
          borderWidth: 1, marginTop: 20, paddingTop: 8, paddingBottom: 8, paddingHorizontal: 12
        }}>
          <TextInput style={{ fontSize: 15, height: 69, flex: 1, lineHeight: 23, paddingVertical: 0, color: '#888' }}
            value={String(row.get('Comment') || '')} placeholder={'请输入详细说明'} onFocus={e => this._onFocus(e)}
            textAlignVertical={'top'} textAlign={'left'} multiline={true}
            placeholderTextColor={'#d0d0d0'} underlineColorAndroid="transparent"
            returnKeyLabel={'完成'} editable={this.props.canEdit}
            maxLength={1000}
            onChangeText={text => this._onRowChanged(index, 'Comment', text)}
          />
        </View>
      );
    }
  }

  _showItems(row, index) {
    let type = this.state.data.get('ValueType');//0:查表类；1：判断类；2：输入类
    if (type === 2) return this._renderReadingMeterRow(row, index);
    if (type === 1) return this._renderJudgeRow(row, index);
    if (type === 3) return this._renderInputRow(row, index);
  };

  _onRowChanged(index, type, value) {
    let newData = this.state.data;
    newData = newData.setIn(['SubItems', index, type], value);
    this.setState({ data: newData })
  }

  render() {
    let rows = this.state.data.get('SubItems').map((item, index) => this._showItems(item, index));
    let action = [];
    if (this.props.canEdit) {
      action = [{
        title: '完成',
        disable: !this.state.enable,
        show: 'always', showWithText: false
      },
      ];
    }
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <Toolbar title={this.props.data.get('Name')}
          navIcon="back" onIconClicked={() => this.props.onBack()}
          actions={action}
          onActionSelected={[() => { this._checkInput() }]}
        />
        <KeyboardAwareScrollView
          ref={ref => {
            this.scroll = ref
          }}
          extraScrollHeight={35}
          enableOnAndroid={true}
          // onScroll={()=>{
          // }}
          keyboardWillShowEvent={() => {
          }}
          keyboardWillHideEvent={() => {
          }}
          style={[{ backgroundColor: '#fff' }]}>
          {rows}
        </KeyboardAwareScrollView>
      </View>

    );
  }
}

function mapStateToProps(state, ownProps) {
  let ticket = state.ticket.ticket;
  // let index=ownProps.index;
  return {
    ticketId: ticket.getIn(['data', 'Id']),
    isPosting: ticket.get('isPosting'),
    content: ticket.getIn(['data', 'InspectionContent']),
    sync: state.sync
  }
}

export default connect(mapStateToProps, {
  submitPatrolTicketItems,
  loadCacheTicketById
})(TicketCheckView);


