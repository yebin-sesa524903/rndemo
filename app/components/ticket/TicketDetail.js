
'use strict';
import React, { Component } from 'react';

import {
  View,
  ImageBackground,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  // Share,
  DeviceEventEmitter
} from 'react-native';
import PropTypes from 'prop-types';

import Toolbar from '../Toolbar';
import Share from "react-native-share";
import Text from '../Text';
import { GRAY, BLACK, TAB, TAB_BORDER, GREEN, TICKET_STATUS, LINE, LIST_BG } from '../../styles/color';
import moment from 'moment';
import ListSeperator from '../ListSeperator';
import Button from '../Button';
// import TicketRow from './TicketRow.js';
import MoreContent from './MoreContent';
import LabelValue from './LabelValue';
import TouchFeedback from '../TouchFeedback';
import NetworkImage from '../NetworkImage';
import Icon from '../Icon.js';
import Bottom from '../Bottom.js';
import Loading from '../Loading';
import privilegeHelper from '../../utils/privilegeHelper.js';
import { isPhoneX } from '../../utils';
import trackApi from "../../utils/trackApi";
import SchActionSheet from '../actionsheet/SchActionSheet';
import AssetsText from '../AssetsText';
import ViewShot from "react-native-view-shot";
// import BackgroundGeolocation from '@mauron85/react-native-background-geolocation'
import { calcWalking, calcDriving } from '../../utils/locationHelper';
import permissionCode from "../../utils/permissionCode";
import unit from '../../utils/unit';
import Toast from 'react-native-root-toast';
import { Avatar } from "./service/widget";
import Immutable from 'immutable';
moment.locale('zh-cn');
const defaultDuration = '计算中...';

export default class TicketDetail extends Component {
  constructor(props) {
    super(props);
    this.state = { toolbarOpacity: 0, showToolbar: false, forceStoped: false, distance: '计算中...', duration: defaultDuration };
  }
  _getImageHeader() {
    var { rowData } = this.props;
    var buildingKey = rowData.getIn(['Assets', 0, 'BuildingPictureKey']);
    var { width } = Dimensions.get('window');
    var height = parseInt(width * 2 / 3);
    return (
      <NetworkImage
        defaultSource={require('../../images/building_default/building.png')}
        width={width}
        height={height}
        name={buildingKey}>
        <View style={{
          flex: 1,
          justifyContent: 'flex-end'
        }}>
          <ImageBackground
            resizeMode="stretch"
            style={{
              justifyContent: 'flex-end',
              width, height, paddingBottom: 28, paddingHorizontal: 16
            }}
            source={require('../../images/black_gradient/gradient.png')} >
            <Text style={{ marginBottom: 11, fontSize: 12, color: 'white' }}>
              资产位置
            </Text>
            <Text numberOfLines={1} style={{ fontSize: 20, color: 'white' }}>
              {rowData.get('BuildingNames').join('、')}
            </Text>
          </ImageBackground>

        </View>
      </NetworkImage>
    );
  }
  _getAssetView() {
    var { rowData } = this.props;
    var type = rowData.get('TicketType');
    if (type === 1) {
      type = '计划工单';
    }
    else if (type === 2) {
      type = '报警工单';
    }
    else if (type === 3) {
      type = '随工工单';
    }
    else if (type === 4) {
      type = '现场工单';
    } else if (type === 5) {
      type = '方案工单';
    } else if (type === 7) {
      type = '抢修工单';
    }
    var content = rowData.get('AssetNames').join('、');
    var startTime = moment(rowData.get('StartTime')).format('MM-DD'),
      endTime = moment(rowData.get('EndTime')).format('MM-DD');

    var arrAssets = rowData.get('Assets');
    let assetNames = [];
    let assetIcons = [];
    if (arrAssets && arrAssets.size >= 1) {
      // value = arrAssets.map((item)=>item.get('Name')).join('、');
      let getIcon = (item) => {
        let type = item.get('HierarchyType');
        let isAsset = item.get('IsAsset');
        let iconType = '';
        if (type === 2) {
          iconType = 'icon_building';//room
        } else if (type === 3) {
          iconType = 'icon_room';//room
        } else if (type === 4) {
          iconType = isAsset ? 'icon_panel' : 'icon_panel_box';
        } else if (type === 5) {
          iconType = isAsset ? 'icon_device' : 'icon_device_box';
        } else if (type === 200) {
          iconType = isAsset ? 'icon_asset_loop' : 'icon_box_loop';
        }
        let subType = item.get('SubType');
        switch (subType) {
          case 7:
            iconType = 'icon_asset_bus_system';
            break;
          case 50:
            iconType = 'icon_asset_socket_box';
            break;
          case 60:
            iconType = 'icon_asset_function_unit_group';
            break;
          case 8:
            iconType = 'icon_floor';
            break;
          case 70:
            iconType = 'icon_power_dis_box';
            break;
        }
        return iconType;
      };
      arrAssets.forEach(item => {
        assetNames.push(item.get('HierarchyName'));
        assetIcons.push(getIcon(item));
      });
    }
    let executor = null;
    if (rowData.get('ExecutorNames') && rowData.get('ExecutorNames').size > 0) {
      let names = rowData.get('Executors').map(item => {
        if (item.get('UserRoleName') === '巡检班长') {
          return item.get('UserName') + '班组';
        }
        return item.get('UserName');
      });
      executor = (
        <View style={{ flex: 1, flexDirection: 'row', marginLeft: 0, marginTop: 8 }}>
          <View style={{ marginTop: 3, }}>
            <Icon type={'icon_person'} size={13} color={'#999'} />
          </View>
          <View style={{ flex: 1, marginLeft: 4, }}>
            <Text numberOfLines={10} style={[{ fontSize: 13, color: '#999', lineHeight: 20, }]}>
              {names.join('、')}
            </Text>
          </View>
        </View>
      );
    }
    return (
      <View style={{ paddingBottom: 14, backgroundColor: 'white' }}>
        <View style={{
          paddingTop: 15, paddingBottom: 12, paddingLeft: 16,
          flexDirection: 'row', alignItems: 'center', paddingRight: 16,
        }}>
          <Text numberOfLines={1} style={{ fontSize: 17, color: '#333', fontWeight: 'bold', flexShrink: 1 }}>{rowData.get('Title')}</Text>
          <View style={{
            borderRadius: 10, paddingVertical: 2, paddingHorizontal: 8,
            borderColor: '#219bfd', borderWidth: 1, marginLeft: 8,
          }}>
            <Text style={{ fontSize: 11, color: '#219bfd' }}>{type}</Text>
          </View>
        </View>
        <View style={styles.moreContent}>
          <AssetsText assetIcons={assetIcons} separator="、" iconColor="#888"
            lineNumber={0} textColor="#888" textSize={15} iconSize={15}
            assets={assetNames} emptyText="请选择" />
        </View>
        {/*<MoreContent style={styles.moreContent}*/}
        {/*titleStyle={{color:'#333',fontSize:16,}} title="" content={content}  maxLine={3}/>*/}

        <View style={{ paddingHorizontal: 16, backgroundColor: '' }}>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <View style={{ minWidth: 115, flexDirection: 'row' }}>
              <Icon type={'icon_date'} size={13} color={'#999'} />
              <View style={{ flex: 1, marginLeft: 4, }}>
                <Text numberOfLines={1} style={[{ fontSize: 13, color: '#999' }]}>{`${startTime}至${endTime}`}</Text>
              </View>
            </View>
            <View style={{ flex: 1, flexDirection: 'row', marginLeft: 21, }}>
              <Icon style={{ marginTop: 2 }} type={'arrow_location'} size={11} color={'#999'} />
              <View style={{ flex: 1, marginLeft: 4, }}>
                <Text numberOfLines={1} style={[{ color: '#999', fontSize: 13 }]}>{rowData.get('BuildingNames').join('、')}</Text>
              </View>
            </View>
          </View>
          {executor}
        </View>
      </View>
    );
  }
  _getTaskView() {
    var { rowData } = this.props;
    var content = rowData.get('Content');
    if (content) {
      content = content.replace(/(^\s*)|(\s*$)/g, "");
    }
    return (
      <View style={{ paddingBottom: 0, backgroundColor: 'white' }}>
        <View style={{
          paddingTop: 16, paddingBottom: 12, paddingLeft: 16,
          flexDirection: 'row', alignItems: 'center'
        }}>
          <Text style={{ fontSize: 17, color: 'black', fontWeight: 'bold' }}>{'任务描述'}</Text>
        </View>
        <MoreContent style={styles.moreContent} content={content || ''} maxLine={5} />
      </View>
    );
  }
  _getDocumentsView() {
    var { rowData } = this.props;
    var startTime = moment(rowData.get('StartTime')).format('YYYY-MM-DD'),
      endTime = moment(rowData.get('EndTime')).format('YYYY-MM-DD');
    var executor = rowData.get('ExecutorNames').join('、');
    var documents = rowData.get('Documents').map((item) => { return { name: item.get('DocumentName'), id: item.get('DocumentId'), size: item.get('Size') } }).toArray();
    var content = [
      // {label:'执行时间',value:`${startTime} 至 ${endTime}`},
      // {label:'执行人',value:executor},
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
        <View style={{ paddingBottom: 15, paddingHorizontal: 16, }}>
          <View style={{
            paddingTop: 16, paddingBottom: 11,
            flexDirection: 'row', alignItems: 'center',
          }}>
            <Text style={{ fontSize: 17, color: 'black', fontWeight: 'bold' }}>{'作业文档'}</Text>
          </View>
          {
            content.map((item, index) => {
              return (
                <LabelValue key={index} style={{ marginBottom: 0, }} label={item.label} value={item.value} forceStoped={this.state.forceStoped} />
              )
            })
          }
        </View>
        <ListSeperator marginWithLeft={16} />
      </View>
    )
  }
  _getIDView() {
    var { rowData } = this.props;
    var strId = rowData.get('TicketNum');
    //CreateUserName	String	wangjing666
    let createDate = moment(rowData.get('CreateTime')).format('YYYY-MM-DD');
    return (
      <View style={{
        paddingBottom: 16, paddingTop: 8, paddingLeft: 16, paddingRight: 16, backgroundColor: LIST_BG, marginTop: -2
        ,
      }}>
        <Text numberOfLines={1} style={{ fontSize: 13, color: '#999' }}>
          {`${rowData.get('CreateUserName')}创建于${createDate} (ID：${strId})`}
        </Text>
      </View>
    )
  }

  _getTab() {
    var { rowData } = this.props;
    var status = rowData.get('Status');
    return (
      <View style={{ height: 48, justifyContent: 'flex-end' }}>
        <Text style={{ fontSize: 17, marginBottom: 8, fontWeight: '600', color: '#333' }}>{`日志(${this.props.logCount})`}</Text>
      </View>
    )
    if (status < 2) { //未开始和已提交，不能上传日志
      return (
        <View style={{ height: 48, justifyContent: 'flex-end' }}>
          <Text style={{ fontSize: 17, marginBottom: 8, fontWeight: '600', color: '#333' }}>{`留言(${this.props.msgCount})`}</Text>
        </View>
      )
    } else {
      let line = { borderBottomWidth: 3, borderColor: GREEN };
      let unLine = { borderBottomWidth: 3, borderColor: '#fff' };
      let bold = { fontWeight: '600' };
      return (
        <View style={{ flexDirection: 'row', height: 48, alignItems: 'flex-end' }}>
          <TouchFeedback onPress={() => this.props.changeTab(0)}>
            <View style={[{ marginRight: 30, }, this.props.tab === 0 ? line : unLine]}>
              <Text style={[{ fontSize: 17, marginBottom: 8, color: '#333' }, this.props.tab === 0 ? bold : null]}>{`日志(${this.props.logCount || ''})`}</Text>
            </View>
          </TouchFeedback>
          <TouchFeedback onPress={() => this.props.changeTab(1)}>
            <View style={this.props.tab === 1 ? line : unLine}>
              <Text style={[{ fontSize: 17, marginBottom: 8, color: '#333' }, this.props.tab === 1 ? bold : null]}>{`留言(${this.props.msgCount})`}</Text>
            </View>
          </TouchFeedback>
        </View>
      )
    }
  }

  _getLogMessage() {
    return (
      <View style={{ backgroundColor: '#fff' }}>
        <View style={{ marginLeft: 16 }}>
          {this._getTab()}
          <View style={{ height: 1, backgroundColor: LINE }} />
        </View>
        {this.props.contentView}
      </View>
    )
  }

  _getLogView() {
    var { rowData } = this.props;
    var status = rowData.get('Status');
    if (status < 2) { //未开始和已提交，不能上传日志
      return null;
    }
    var count = '';
    // if(this.props.logCount > 0){
    count = this.props.logCount;
    // }
    var hasNew = !rowData.get('IsRead');
    var isFngdType = rowData.get('TicketType') === 5;
    var text = '工单日志';
    if (isFngdType) {
      // text='工单日志&留言';
    } else {
      hasNew = false;
    }
    var iconNewView = (
      <View style={{ marginRight: 4, }}>
        <View style={{ width: 6, height: 6, backgroundColor: 'red', borderRadius: 3, }}>
        </View>
      </View>
    )
    if (!hasNew) {
      iconNewView = null;
    }
    return (
      <View style={{ flex: 1, }}>
        <View style={{ height: 10, flex: 1, backgroundColor: LIST_BG }}>
        </View>
        <View style={{ height: 56, backgroundColor: 'white' }}>
          <TouchFeedback style={{ flex: 1 }} onPress={this.props.ticketLog}>
            <View style={
              {
                flex: 1,
                justifyContent: 'space-between',
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16
              }}>
              <Text style={{ fontSize: 17, color: 'black', fontWeight: 'bold' }}>{text}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 17, color: '#666', marginRight: 4 }}>{count + '条'}</Text>
                {iconNewView}
                <Icon type='arrow_right' size={16} color={GRAY} />
              </View>
            </View>
          </TouchFeedback>
        </View>
      </View>
    );
  }
  _getMessageView() {
    var { rowData } = this.props;
    var buttonMore = (
      <TouchFeedback style={{}}
        onPress={() => {
          this.props.onGotoAllMesg(this.props.rowData.get('Id'));
        }}>
        <View style={
          {
            flex: 1,
            justifyContent: 'center',
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'white',
            height: 41,
          }}>
          <Text style={{ fontSize: 15, color: '#999' }}>
            <Text style={{ fontSize: 14, color: '#999' }}>
              {`查看全部`}
            </Text>
            <Text style={{ fontSize: 15, color: GREEN, }}>
              {` ${this.props.msgCount} `}
            </Text>
            <Text style={{ fontSize: 15, color: '#999' }}>
              {`条留言`}
            </Text>
          </Text>
        </View>
      </TouchFeedback>
    )
    if (this.props.msgCount <= 3) {
      buttonMore = null;
    }
    var btnWriteMsg = (
      <TouchFeedback style={{}}
        onPress={() => {
          this.props.onCreateMesg(this.props.rowData.get('Id'));
        }}>
        <View style={
          {
            // flex:1,
            justifyContent: 'center',
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'white',
            borderColor: GREEN,
            borderRadius: 3,
            borderWidth: 1,
            height: 24,
            width: 72,
            marginRight: 16,
            // marginVertical:7,
            // topLineColor:'#ccc',
          }}>
          <Text style={{ fontSize: 14, color: GREEN }}>{'去留言'}</Text>
          <View style={{
            flexDirection: 'row', alignItems: 'center', marginLeft: 2,
            marginTop: 2
          }}>
            <Icon type='arrow_right' size={11} color={GREEN} />
          </View>
        </View>
      </TouchFeedback>
    )
    if (!privilegeHelper.hasAuth('TicketEditPrivilegeCode') || !privilegeHelper.hasAuth('TicketExecutePrivilegeCode')) {
      btnWriteMsg = null;
    }
    var seperatorView = (
      <ListSeperator marginWithLeft={16} />
    )
    if (this.props.msgCount === 0) {
      seperatorView = null;
    }
    //
    return (
      <View style={{ paddingBottom: 0, backgroundColor: 'white' }}>
        <View style={{
          paddingTop: 16, paddingBottom: 12, paddingLeft: 16,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Text style={{ fontSize: 17, color: 'black', fontWeight: 'bold' }}>{'留言'}</Text>
          {btnWriteMsg}
        </View>
        {seperatorView}
        {this.props.contentView}
        {buttonMore}
      </View>
    );
  }

  _renderSubmittedButton() {
    //如果
    if (!privilegeHelper.checkModulePermission(permissionCode.POP_TICKET_CLOSE_MANAGEMENT)) {
      return null;
    }
    return (
      <Bottom borderColor={'#f2f2f2'} height={54} backgroundColor={'#fff'}>
        {/*<Button*/}
        {/*  style={[styles.button,{*/}
        {/*    backgroundColor:GREEN,*/}
        {/*    marginLeft:16,*/}
        {/*    flex:1,*/}
        {/*    borderRadius:2,*/}
        {/*  }]}*/}
        {/*  textStyle={{*/}
        {/*    fontSize:16,*/}
        {/*    color:'#ffffff'*/}
        {/*  }}*/}
        {/*  text='驳回' onClick={() => this.props.ticketReject(this.props.rowData.get('Id'))} />*/}
        <Button
          style={[styles.button, {
            backgroundColor: GREEN,
            marginLeft: 16,
            flex: 1,
            borderRadius: 2,
          }]}
          textStyle={{
            fontSize: 16,
            color: '#ffffff'
          }}
          text='审批通过' onClick={() => this.props.onCloseTicket(this.props.rowData.get('Id'))} />
      </Bottom>
    )
  }

  _getButton(isScollView) {
    var startTime = moment(this.props.rowData.get('StartTime')).format('YYYY-MM-DD');
    var nowTime = moment().format('YYYY-MM-DD');
    var status = this.props.rowData.get('Status');
    if ((!privilegeHelper.hasAuth('TicketExecutePrivilegeCode') &&
      status !== 4) || startTime > nowTime) {
      return null;
    }

    //如果是待抢单工单，则显示抢单按钮
    let isDJD = this.props.rowData.get('IsDJD');
    if (isDJD) {
      //if(this.props.offline) return;
      let buttons = (
        <Bottom borderColor={'#f2f2f2'} height={54} backgroundColor={'#fff'}>
          <Button
            style={[styles.button, {
              backgroundColor: '#fff',
              marginLeft: 16,
              marginRight: 0,
              borderColor: '#284e98',
              borderWidth: 1,
              flex: 1,
              borderRadius: 2,
            }, styleSubmit]}
            textStyle={{
              fontSize: 16,
              color: '#284e98'
            }}
            text='拒单' onClick={() => this.props.reject()} />
          <Button
            style={[styles.button, {
              backgroundColor: GREEN,
              flex: 1,
              borderRadius: 2,
            }]}
            textStyle={{
              fontSize: 16,
              color: '#ffffff'
            }}
            text='接单' onClick={() => this.props.accept()} />
        </Bottom>
      );
      return buttons;
    }

    //待派工状态，没有下面的按钮
    if (status === 5 && privilegeHelper.hasAuth('TicketEditPrivilegeCode')) {
      if (this.props.offline) return;
      return (
        <Bottom borderColor={'#f2f2f2'} height={54} backgroundColor={'#fff'}>
          <Button
            style={[styles.button, {
              backgroundColor: GREEN,
              marginLeft: 16,
              flex: 1,
              borderRadius: 2,
            }]}
            textStyle={{
              fontSize: 16,
              color: '#ffffff'
            }}
            text='派工' onClick={() => this.props.changeExecutor()} />
        </Bottom>
      );
    }

    let msgButton = (
      <TouchFeedback style={{}}
        onPress={() => {
          this.props.changeTab(1);
          this.props.onCreateMesg(this.props.rowData.get('Id'));
        }}>
        <View style={{ minWidth: 50, minHeight: 50, justifyContent: 'center', alignItems: 'center' }}>
          <Icon type='icon_ticket_msg' size={16} color={'#333'} />
          <Text style={{ fontSize: 12, color: '#333', marginTop: 3 }}>{'留言'}</Text>
        </View>
      </TouchFeedback>
    );
    msgButton = null;//不显示留言
    let logButton = (
      <TouchFeedback style={{}}
        onPress={() => {
          this.props.changeTab(0);
          this.props.onCreateLog(this.props.rowData.get('Id'));
        }}>
        <View style={{ minWidth: 50, minHeight: 50, justifyContent: 'center', alignItems: 'center' }}>
          <Icon type='icon_ticket_log' size={16} color={'#333'} />
          <Text style={{ fontSize: 12, color: '#333', marginTop: 3 }}>{'写日志'}</Text>
        </View>
      </TouchFeedback>
    );

    //判断是否显示到达现场
    let showArrivedTarget = (this.props.rowData.get('TicketType') === 7 &&
      this.props.rowData.get('UserTicketStatus') !== 3 &&
      status !== 1 && status !== 3
    );

    console.warn('UserTicketStatus', this.props.rowData.get('UserTicketStatus'));

    // console.warn('curr status...',status);
    if ((status === 1 || showArrivedTarget) && !isScollView) {
      let btnLabel = '开始执行';
      //如果是抢修工单，则文本修改为 到达现场
      if (this.props.rowData.get('TicketType') === 7) {
        btnLabel = '到达现场';
      }
      return (
        <Bottom borderColor={'#f2f2f2'} height={54} backgroundColor={'#fff'}>
          <View style={{ flex: 0 }}>
            {msgButton}
          </View>

          <Button
            style={[styles.button, {
              backgroundColor: GREEN, marginLeft: 16, flex: 2
            }]}
            textStyle={{
              fontSize: 16,
              color: '#ffffff'
            }}
            text={btnLabel} onClick={() => this.props.onExecute(this.props.rowData.get('Id'))} />
        </Bottom>
      );
    }

    if (status === 4) {//表示已提交工单
      return this._renderSubmittedButton();
      var btnClose = (
        <Button
          style={[styles.button, {
            backgroundColor: GREEN,
            marginLeft: 0,
            flex: 1,
            borderRadius: 2,
            borderBottomLeftRadius: 0,
            borderTopLeftRadius: 0,
          }]}
          textStyle={{
            fontSize: 16,
            color: '#ffffff'
          }}
          text='关闭工单' onClick={() => this.props.onCloseTicket(this.props.rowData.get('Id'))} />
      )
      var styleSubmit = { flex: 1, };
      if (!privilegeHelper.checkModulePermission(permissionCode.POP_TICKET_CLOSE_MANAGEMENT)) {
        btnClose = null;
        styleSubmit = {
          flex: 2, marginRight: 16, borderRadius: 2, backgroundColor: GREEN,
          borderBottomRightRadius: 2,
          borderTopRightRadius: 2,
        };
      }
      if (privilegeHelper.hasAuth('TicketExecutePrivilegeCode')) {

        var btnSubmit = (
          <Button
            style={[styles.button, {
              backgroundColor: '#70e07c',
              marginLeft: 10,
              marginRight: 0,
              flex: 2,
              borderRadius: 2,
              borderBottomRightRadius: 0,
              borderTopRightRadius: 0,
            }, styleSubmit]}
            textStyle={{
              fontSize: 16,
              color: '#ffffff'
            }}
            text='提交工单' onClick={() => this.props.onSubmitTicket(this.props.rowData.get('Id'))} />
        )
        return (
          <Bottom borderColor={'#f2f2f2'} height={54} backgroundColor={'#fff'}>
            <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'space-around' }}>
              <View style={{ flex: 0 }}>
                {msgButton}
              </View>
              <View style={{ flex: 1 }}>
                {logButton}
              </View>
            </View>
            <View style={{ flexDirection: 'row', flex: 3 }}>
              {btnSubmit}
              {btnClose}
            </View>
          </Bottom>
        )
      } else {
        if (!privilegeHelper.checkModulePermission(permissionCode.POP_TICKET_CLOSE_MANAGEMENT)) {
          return;
        }
        return (
          <Bottom borderColor={'#f2f2f2'} height={54} backgroundColor={'#fff'}>
            <Button
              style={[styles.button, {
                backgroundColor: GREEN,
                marginLeft: 16,
                flex: 1,
                borderRadius: 2,
              }]}
              textStyle={{
                fontSize: 16,
                color: '#ffffff'
              }}
              text='关闭工单' onClick={() => this.props.onCloseTicket(this.props.rowData.get('Id'))} />
          </Bottom>
        )
      }
    }
    //执行中和已驳回操作一样
    if ((status === 2 || status === 9) && !isScollView) {
      return (
        <Bottom borderColor={'#f2f2f2'} height={54} backgroundColor={'#fff'}>
          <View style={{ flexDirection: 'row', flex: 1 }}>
            <View style={{ flex: 0 }}>
              {msgButton}
            </View>
            <View style={{ flex: 1 }}>
              {logButton}
            </View>
          </View>
          <Button
            style={[styles.button, {
              backgroundColor: GREEN,
              marginLeft: 0,
              flex: 3,
            }]}
            textStyle={{
              fontSize: 16,
              color: '#ffffff'
            }}
            text='提交审批' onClick={() => this.props.onSubmitTicket(this.props.rowData.get('Id'))} />
        </Bottom>
      );
    } else if (status === 2 && isScollView) {
      <View style={{
        flex: 1, borderTopWidth: 1, borderTopColor: '#f2f2f2',
        height: 72, paddingHorizontal: 16, paddingVertical: 13
      }}>
        <Button
          style={[styles.button, {
            backgroundColor: GREEN,
          }]}
          textStyle={{
            fontSize: 15,
            color: '#ffffff'
          }}
          text='完成工单' onClick={() => this.props.finish(this.props.rowData.get('Id'))} />
      </View>
    }

    return null;
  }
  _onScroll(e) {
    // console.warn('scroll',e);
  }
  _getToolbar(data) {
    this._actions = [];
    let actionSelected = [];
    if (data) {
      var status = data.get('Status');
      //如果有错误信息，不显示分享按钮
      if (!this.props.errorMessage) {
        this._actions = [
          {
            title: '分享',
            iconType: 'share',
            show: 'always', showWithText: false
          }
        ];
        actionSelected.push((item) => {
          if (this.refs.viewShot) {
            this.refs.viewShot.capture().then(uri => {
              const shareOptions = {
                title: 'Share file',
                url: uri,
                failOnCancel: false,
              };
              Share.open(shareOptions);
            });
          }
        })
      }
      if (status !== 3 && status !== 4 && this.props.isCurrCreater) {
        this._actions.push({
          title: '编辑',
          code: 'TicketEditPrivilegeCode',
          iconType: 'edit',
          show: 'always', showWithText: false
        });
        actionSelected.push(() => {
          if (!isConnected()) {
            Toast.show('当前网络已断开，无法编辑工单', {
              duration: Toast.durations.LONG,
              position: Toast.positions.BOTTOM,
            });
            return;
          }
          this.props.onEditTicket();
        });
      }
    }
    return (
      <Toolbar
        title='工单详情'
        navIcon="back"
        onIconClicked={() => {
          this.props.onBack();
          this.setState({ forceStoped: true });
        }}
        actions={this._actions}
        onActionSelected={actionSelected}
      />
    );
  }
  static getStatusText(rowData) {
    var status = rowData.get('Status'), statusText = '';
    if (status === 1) {
      statusText = '未开始';
    }
    else if (status === 2) {
      statusText = '执行中';
    }
    else {
      statusText = '已提交';
    }
    return statusText;
  }

  _traceDetail() {
    if (!this._traced) {
      this._traced = true;
      let content = this.props.rowData.get('Content');
      let desc = content;
      if (content && content.length > 0) {
        content = content.split('\n');
        if (content.length === 7) {
          let tmp = {};
          content.forEach(item => {
            let keyValue = item.split(':');
            tmp[keyValue[0]] = keyValue[1];
          });
          content = tmp;
        } else {
          content = {};
        }

      }
      let strAssets = this.props.rowData.get('AssetNames').join(',');
      trackApi.onTrackEvent('App_ViewTicketDetail', {
        customer_id: String(this.props.rowData.get('CustomerId') || ''),
        customer_name: this.props.rowData.get('CustomerName'),
        from: this.props.fromAlarm ? '报警详情' : '工单列表',
        workorder_id: this.props.rowData.get('TicketNum'),
        workorder_status: [null, '未开始', '执行中', '已完成', '已提交', '待派工'][this.props.rowData.get('Status')],
        workorder_type: [null, '计划工单', '报警工单', '随工工单', '现场工单', '方案工单', '巡检工单', '抢修工单'][this.props.rowData.get('TicketType')],
        start_time: moment(this.props.rowData.get('StartTime')).format('YYYY-MM-DD'),
        // asset_range:strAssets,
        // grade:content['级别'],
        // point:content['类别'],
        // issue:content['点位'],
        // actual_value:content['实际值'],
        // set_value:content['设定值'],
        position: this.props.rowData.get('BuildingNames').join(','),
        // description:desc,
        // file_count:this.props.rowData.get('Documents').size,
        logfile_count: this.props.logCount || 0
      })
    }
  }

  componentDidMount() {
    this._msgLongPress = DeviceEventEmitter.addListener('msgLongPress', menu => {
      this._showMenu(menu);
    });
    this._logLongPress = DeviceEventEmitter.addListener('logLongPress', menu => {
      this._showMenu(menu);
    });
  }

  getBuildingLocation(rowData) {
    if (rowData.get('Assets')) {
      let location = null;
      let findIndex = rowData.get('Assets').findIndex(item => {
        if (item.get('Lat') && item.get('Lng')) {
          location = {
            latitude: item.get('Lat'),
            longitude: item.get('Lng')
          }
          return true;
        }
      });
      return location;
    }
    return null;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.rowData && !this.props.rowData) {
      if (nextProps.rowData.get('TicketType') === 7 && nextProps.rowData.get('UserTicketStatus') === 0
        && !nextProps.rowData.get('IsDJD')
        && this.getBuildingLocation(nextProps.rowData)) {
        //如果建筑有定位信息
        this._registerLocationEvent(nextProps.rowData);
      }
    }

    //状态变更后符合要求的
    if (nextProps.rowData && this.props.rowData) {
      if (nextProps.rowData.get('TicketType') === 7 && nextProps.rowData.get('UserTicketStatus') === 0
        && !nextProps.rowData.get('IsDJD')
        && this.props.rowData.get('IsDJD') && this.getBuildingLocation(nextProps.rowData)) {
        //如果建筑有定位信息
        this._registerLocationEvent(nextProps.rowData);
      }
    }

    if (nextProps.rowData && this.props.rowData &&
      nextProps.rowData.get('UserTicketStatus') !== this.props.rowData.get('UserTicketStatus') &&
      nextProps.rowData.get('TicketType') === 7) {
      //说明工单状态由未开始变化了，那么取消定位
      this._locationListener && this._locationListener.remove();
    }
  }

  _registerLocationEvent(rowData) {
    console.warn('注册位置变化');
    if (this._locationListener) return;
    //如果是离线模式，不显示定位
    if (this.props.offline) return;
    console.warn('hasScreenLocation', this.props.hasScreenLocation);
    //必须是抢修工单，有大屏调度权限，并且是未开始的
    //注册位置变化通知
    if (rowData && rowData.get('TicketType') === 7
      && this.props.hasScreenLocation) {
      console.warn('注册定位事件')
      let endPos = this.getBuildingLocation(rowData);
      // this._locationListener=BackgroundGeolocation.on('location',(location)=>{
      //   //根据当前定位和工单建筑定位，计算距离和预计到达时间
      //   this._calcDistanceAndDuration(location,endPos);
      // });
      // //立即取一次当前定位，计算距离和时间
      // BackgroundGeolocation.getCurrentLocation(location=>{
      //   this._calcDistanceAndDuration(location,endPos);
      // });
    }
  }

  _calcDistanceAndDuration(startPos, endPos) {
    console.warn('_calcDistanceAndDuration', startPos, endPos);
    //TODO 取当前工单关联建筑的定位
    // let endPos=this.getBuildingLocation(this.)
    //
    // let startPos={
    //   longitude:114.42+Math.random()/100,
    //   latitude:30.45+Math.random()/100
    // }
    let posType = 1;
    let fn = this.props.isTeamGroup ? calcDriving : calcWalking;
    fn({
      startPos, endPos, posType
    }, success => {
      //单位分别是米和秒
      let { distance, duration } = success;
      if (distance < 100) distance = 100;
      let strDistance = unit.fillZeroAfterPointWithRound(distance / 1000, 1) + 'km';
      let targetMoment = moment().add(duration, 's');
      let targetDay = targetMoment.dayOfYear();
      let nowDay = moment().dayOfYear();
      let strDuration = '';
      if (targetDay !== nowDay) {
        //说明不是同一天，显示月份和时间
        strDuration = targetMoment.format('MM-DD HH:mm');
      } else {
        strDuration = targetMoment.format('HH:mm');
      }
      //由于预计到达时间只计算一次，那么这里控制下显示
      let data = {
        distance: strDistance
      }
      if (this.state.duration === defaultDuration) {
        data.duration = strDuration;
      }

      this.setState({ ...data })
    }, fail => {
      console.warn('fail', fail);
    });
  }

  componentWillUnmount() {
    this._msgLongPress.remove();
    this._logLongPress.remove();
    this._locationListener && this._locationListener.remove();
  }

  _showMenu(menu) {
    this.setState({ 'modalVisible': true, arrActions: menu, title: '' });
  }

  _getActionSheet() {
    var arrActions = this.state.arrActions;
    if (!arrActions) {
      return;
    }
    if (this.state.modalVisible) {
      return (
        <SchActionSheet title={this.state.title} arrActions={arrActions} modalVisible={this.state.modalVisible}
          onCancel={() => {
            this.setState({ 'modalVisible': false });
          }}
          onSelect={item => {
            this.setState({ modalVisible: false }, () => {
              setTimeout(() => {
                item.click();
              }, 200);
            });
          }}
        >
        </SchActionSheet>
      )
    }
  }

  _renderRejection() {
    //只有驳回状态，才显示驳回原因，驳回状态是23
    let status = this.props.rowData.get('Status');
    if (status !== 9) return null;
    let reason = this.props.rowData.get('RejectReason');
    let RejectUser = this.props.rowData.get('RejectUser');
    let rejectTime = moment(this.props.rowData.get('RejectTime')).format('YYYY年MM月DD日 HH:mm');
    return (
      <View style={{ backgroundColor: '#fff', padding: 16, marginTop: 10, marginBottom: 10 }}>
        <Text style={{ fontSize: 17, color: '#333', fontWeight: '500' }}>{'驳回原因'}</Text>
        <View style={{ height: 1, backgroundColor: '#f2f2f2', marginRight: -16, marginTop: 16, marginBottom: 12 }} />
        <Text style={{ fontSize: 17, color: '#333', lineHeight: 28 }}>{reason}</Text>
        {
          !RejectUser ? null :
            <>
              <View style={{ height: 1, backgroundColor: '#f2f2f2', marginRight: -16, marginTop: 12, marginBottom: 8 }} />
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: -8, justifyContent: 'space-between' }}>
                <TouchFeedback onPress={() => console.warn('click....')}>
                  <View style={{ flex: 1, paddingVertical: 12, marginVertical: -12, flexDirection: 'row', alignItems: 'center' }}>
                    <Avatar radius={16} name={RejectUser.get('RealName') || ''} imgKey={RejectUser.get('Photo')} />
                    <Text style={{ fontSize: 15, color: '#888', marginLeft: 12 }}>{RejectUser.get('RealName') || ''}</Text>
                  </View>
                </TouchFeedback>
                <Text style={{ fontSize: 15, color: '#888' }}>{rejectTime}</Text>
              </View>
            </>
        }
      </View>
    )
  }

  renderRealDistance() {
    //未开始 有定位上传权限的,并且是抢修工单的，才显示实时位置变化 如果工单详情的建筑有定位

    if (this.props.rowData.get('Status') === 3) return;//已关闭工单不显示到达现场
    if (this.props.rowData.get('UserTicketStatus') === 3) return null;//不是未开始状态，不显示，表示点击了到达现场
    if (this.props.rowData.get('TicketType') !== 7) return null;
    if (!this.props.hasScreenLocation) return null;
    if (!this.getBuildingLocation(this.props.rowData)) return null;
    let isDJD = this.props.rowData.get('IsDJD');
    if (isDJD) return null;//待接单时不显示实时距离
    if (this.props.offline) return null;
    return (
      <View style={{
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginBottom: 10,
        padding: 16
      }}>
        <View style={{
          borderColor: '#ead2c5', borderRadius: 2, borderWidth: 1,
          backgroundColor: '#feecdc', padding: 2
        }}>
          <Text style={{ fontSize: 13, color: '#e16f53', }}>实时</Text>
        </View>
        <Text style={{ fontSize: 17, color: '#333', marginHorizontal: 12 }}>报警站点</Text>
        <Text numberOfLines={1} style={{ fontSize: 13, color: '#888', flex: 1 }}>
          <Text>距您</Text>
          <Text style={{ color: GREEN }}>{this.state.distance}</Text>
          <Text>  |  预计</Text>
          <Text style={{ color: GREEN }}>{this.state.duration}</Text>
          <Text>到达</Text>
        </Text>
      </View>
    )
  }

  render() {
    if (!this.props.isFetching && this.props.errorMessage) {
      return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          {this._getToolbar(this.props.rowData)}
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 17, color: GRAY }}>{this.props.errorMessage}</Text>
          </View>
        </View>
      )
    }
    if (this.props.isFetching || !this.props.rowData) {
      return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          {this._getToolbar(this.props.rowData)}
          <Loading />
        </View>
      )
    }

    this._traceDetail();
    var marginBottom = { marginBottom: bottomHeight };
    // var status = this.props.rowData.get('Status');

    //已提交工单没有按钮，已开始按钮，在scrollview内，如果没有权限，按钮也不显示
    var bottomButton = this._getButton(false);
    // if(status === 3 || status === 2){
    //   marginBottom = null;
    // }
    if (!bottomButton) {
      marginBottom = null;
    }

    if (bottomButton) {
      if (Platform.OS === 'ios') {
        bottomButton = (
          <View style={{ backgroundColor: '#fff' }}>
            <View style={{ marginBottom: (isPhoneX() ? 34 : 0) }}>
              {bottomButton}
            </View>
          </View>
        );
      } else {
        bottomButton = (
          <View style={{ marginBottom: (isPhoneX() ? 34 : 0) }}>
            {bottomButton}
          </View>
        );
      }
    }

    return (
      <View style={{ flex: 1, backgroundColor: LIST_BG }}>
        {this._getToolbar(this.props.rowData)}
        <ScrollView style={[styles.wrapper, marginBottom]} onScroll={(e) => this._onScroll(e)}>
          <ViewShot style={{ flex: 1, backgroundColor: LIST_BG }} ref="viewShot" options={{ format: "jpg", quality: 0.9 }}>
            {
              //this._getImageHeader()
            }
            {this.renderRealDistance()}
            {this._getAssetView()}
            {this._renderRejection()}
            <ListSeperator marginWithLeft={16} />
            {this._getTaskView()}
            <ListSeperator marginWithLeft={16} />

            {this._getDocumentsView()}
            {this._getIDView()}
            {this._getLogMessage()}

            {/*{*/}
            {/*this._getLogView()*/}
            {/*}*/}
            <View style={{ height: 10, flex: 1, backgroundColor: LIST_BG }}>
            </View>

            {/*{this._getMessageView()}*/}
            {/*<View style={{height:10,flex:1,backgroundColor:LIST_BG}}>*/}
          </ViewShot>
        </ScrollView>
        {bottomButton}
        {this._getActionSheet()}
      </View>
    );
  }
}

TicketDetail.propTypes = {
  onBack: PropTypes.func,
  onEditTicket: PropTypes.func,
  onCreateLog: PropTypes.func,
  onCreateMesg: PropTypes.func,
  onGotoAllMesg: PropTypes.func,
  onExecute: PropTypes.func,
  onSubmitTicket: PropTypes.func,
  onCloseTicket: PropTypes.func,
  ticketLog: PropTypes.func,
  isCurrCreater: PropTypes.bool,
  isFetching: PropTypes.bool,
  logCount: PropTypes.number,
  msgCount: PropTypes.number,
  rowData: PropTypes.object,//immutable
  contentView: PropTypes.object,
  errorMessage: PropTypes.string,
}
var bottomHeight = 54;

var styles = StyleSheet.create({
  statusRow: {
    height: 69,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: TICKET_STATUS
  },
  statusText: {
    fontSize: 17,
    color: BLACK
  },
  moreContent: {
    margin: 16,
    marginTop: 0,
    marginBottom: 13,
    backgroundColor: 'white'
  },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
    height: bottomHeight,
    // borderTopWidth:1,
    // borderColor:TAB_BORDER,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor:TAB
  },
  button: {
    // marginTop:20,
    height: 40,
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 2,

  },
  wrapper: {
    flex: 1,
    // marginTop:-56,
    // position:'absolute',
    //
    // top:0,
    // bottom:0,
    // left:0,right:0,
    backgroundColor: 'transparent',
  },
});
