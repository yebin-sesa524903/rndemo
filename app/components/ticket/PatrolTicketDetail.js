
'use strict';
import React,{Component} from 'react';

import {
  View,
  ImageBackground,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  DeviceEventEmitter,
  Image,
  Alert, InteractionManager, TouchableWithoutFeedback
} from 'react-native';
import PropTypes from 'prop-types';
import DeviceInfo from 'react-native-device-info';
import Toolbar from '../Toolbar';

import Text from '../Text';
import {GRAY,BLACK,TAB,TAB_BORDER,GREEN,TICKET_STATUS,LINE,LIST_BG} from '../../styles/color';
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
import Toast from 'react-native-root-toast';
import AssetsText from '../AssetsText';
import Share from "react-native-share";
import ViewShot from "react-native-view-shot";
import PatrolRow from './PatrolRow';
// import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {listenToKeyboardEvents } from 'react-native-keyboard-aware-scroll-view';
import CameraRoll from "@react-native-community/cameraroll";
const KeyboardAwareScrollView = listenToKeyboardEvents(ScrollView);//listenToKeyboardEvents((props) => <ScrollView {...props} />);
import {cacheTicketModify, getTicketFromCache, isTicketInCache} from "../../utils/sqliteHelper";
import {requestPhotoPermission} from '../../utils/devicePermission';
import TextInput from '../CustomerTextInput';
import {refreshAlbum} from "../../actions/myAction";
import permissionCode from "../../utils/permissionCode";
import SignView from '../../components/signature/SignView';
moment.locale('zh-cn');
import {Keyboard} from 'react-native';
import Immutable from "immutable";
import {Avatar} from "./service/widget";
import CommonActionSheet from "../actionsheet/CommonActionSheet";
import TicketSign from "../../containers/ticket/TicketSign";
import FadeInView from "../actionsheet/FadeInView";
export default class TicketDetail extends Component{
  static contextTypes = {
    showSpinner: PropTypes.func,
    hideHud: PropTypes.func
  }
  constructor(props){
    super(props);
    //roletype 0:运维工程师 1：运维主管A 2：运维主管B
    this.roleType=0;
    if(privilegeHelper.hasAuth('TicketEditPrivilegeCode')&&privilegeHelper.hasAuth('TicketExecutePrivilegeCode')){
      this.roleType=2;
    }else if(privilegeHelper.hasAuth('TicketEditPrivilegeCode')){
      this.roleType=1;
    }else if(privilegeHelper.hasAuth('TicketExecutePrivilegeCode')){
      this.roleType=0;
    }
    this.state = {toolbarOpacity:0,showToolbar:false,forceStoped:false,expandMap:{},showAllExpand:true,
      ticketState:0,roleType:this.roleType,showProcess:false,clickItems:[],isCapturing:false};
  }
  _getImageHeader(){
    var {rowData} = this.props;
    var buildingKey = rowData.getIn(['Assets',0,'BuildingPictureKey']);
    var {width} = Dimensions.get('window');
    var height = parseInt(width*2/3);
    return (
      <NetworkImage
        defaultSource = {require('../../images/building_default/building.png')}
        width={width}
        height={height}
        name={buildingKey}>
        <View style={{
            flex:1,
            justifyContent:'flex-end'}}>
            <ImageBackground
              resizeMode="stretch"
              style={{justifyContent:'flex-end',
                width,height,paddingBottom:28,paddingHorizontal:16}}
              source={require('../../images/black_gradient/gradient.png')} >
              <Text style={{marginBottom:11,fontSize:12,color:'white'}}>
                资产位置
              </Text>
              <Text numberOfLines={1} style={{fontSize:20,color:'white'}}>
                {rowData.get('BuildingNames').join('、')}
              </Text>
            </ImageBackground>

        </View>
      </NetworkImage>
    );
  }

  _getDateDisplay(){
    let mStart=moment(this.props.rowData.get('StartTime'));
    let mEnd=moment(this.props.rowData.get('EndTime'));
    let showHour=false;
    let isSameDay=false;
    //判断是否要显示小数
    if(mStart.hours()>0||mStart.minutes()>0||mEnd.hours()>0||mEnd.minutes()>0){
      //需要显示的格式带小数
      showHour=true;
      if(mStart.format('HH:mm')==='00:00' && mEnd.format('HH:mm')==='23:59'){
        showHour=false;
      }
    }
    //判断开始结束日期是否同一天
    if(mStart.format('YYYY-MM-DD') === mEnd.format('YYYY-MM-DD')){
      isSameDay=true;
    }
    if(isSameDay&&showHour){//同一天，显示小时
      return `${mStart.format('MM-DD HH:mm')}至${mEnd.format('HH:mm')}`;
    }else if(showHour){//不是同一天，要显示小时
      return `${mStart.format('MM-DD HH:mm')}至${mEnd.format('MM-DD HH:mm')}`;
    }else{//不显示小时
      return `${mStart.format('MM-DD')} 至 ${mEnd.format('MM-DD')}`;
    }
  }

  _getAssetView(){
    var {rowData} = this.props;
    var type = rowData.get('TicketType');
    if(type === 1){
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
    }else if (type === 5) {
      type = '方案工单';
    }else if(type===6){
      type='巡检工单';
    }
    var content = rowData.get('AssetNames').join('、');
    var startTime = moment(rowData.get('StartTime')).format('MM-DD'),
        endTime = moment(rowData.get('EndTime')).format('MM-DD');

    var arrAssets = rowData.get('Assets');
    let assetNames=[];
    let assetIcons=[];
    if (arrAssets && arrAssets.size >= 1) {
      // value = arrAssets.map((item)=>item.get('Name')).join('、');
      let getIcon=(item)=>{
        let type=item.get('HierarchyType');
        let isAsset=item.get('IsAsset');
        let iconType='';
        if (type===2) {
          iconType='icon_building';//room
        }else if (type===3) {
          iconType='icon_room';//room
        }else if (type===4) {
          iconType=isAsset?'icon_panel':'icon_panel_box';
        }else if (type===5) {
          iconType=isAsset?'icon_device':'icon_device_box';
        }else if(type===200){
          iconType=isAsset?'icon_asset_loop':'icon_box_loop';
        }
        let subType=item.get('SubType');
        switch (subType){
          case 7:
            iconType='icon_asset_bus_system';
            break;
          case 50:
            iconType='icon_asset_socket_box';
            break;
          case 60:
            iconType='icon_asset_function_unit_group';
            break;
          case 8:
            iconType='icon_floor';
            break;
          case 70:
            iconType='icon_power_dis_box';
            break;
        }
        return iconType;
      };
      arrAssets.forEach(item=>{
        assetNames.push(item.get('HierarchyName'));
        assetIcons.push(getIcon(item));
      });
    }
    return (
      <View key={'_asset_view'} style={{paddingBottom:14,backgroundColor:'white'}}>
        <View style={{paddingTop:15,paddingBottom:12,paddingLeft:16,
          flexDirection:'row',alignItems:'center'
        }}>
          <Text numberOfLines={1} style={{fontSize:17,color:'#333',fontWeight:'bold',flexShrink:1}}>{rowData.get('Title')}</Text>
          <View style={{borderRadius:10,paddingVertical:2,paddingHorizontal:8,
            borderColor:'#219bfd',borderWidth:1,marginLeft:8,}}>
            <Text style={{fontSize:11,color:'#219bfd'}}>{type}</Text>
          </View>
        </View>
        <View style={styles.moreContent}>
          <AssetsText assetIcons={assetIcons} separator="、" iconColor="#888"
            lineNumber={0} textColor="#888" textSize={15} iconSize={15}
            assets={assetNames} emptyText="请选择"/>
        </View>
        {/*<MoreContent style={styles.moreContent}*/}
          {/*titleStyle={{color:'#333',fontSize:16,}} title="" content={content}  maxLine={3}/>*/}

        <View style={{paddingHorizontal:16,backgroundColor:''}}>
          <View style={{flexDirection:'row'}}>
            <View style={{minWidth:115,flexDirection:'row'}}>
              <Icon type={'icon_date'} size={13} color={'#999'} />
              <View style={{marginLeft:4,}}>
                <Text numberOfLines={1} style={[{fontSize:13,color:'#999'}]}>{this._getDateDisplay()}</Text>

              </View>
            </View>
            <View style={{flex:1,flexDirection:'row',marginLeft:21,}}>
              <Icon type={'arrow_location'} size={11} color={'#999'} />
              <View style={{flex:1,marginLeft:4,}}>
                <Text numberOfLines={1} style={[{color:'#999',fontSize:13}]}>{rowData.get('BuildingNames').join('、')}</Text>
              </View>
            </View>
          </View>
          <View style={{flex:1,flexDirection:'row',marginLeft:0,marginTop:8}}>
            <View style={{marginTop:3,}}>
              <Icon type={'icon_person'} size={13} color={'#999'} />
            </View>
            <View style={{flex:1,marginLeft:4,}}>
              <Text numberOfLines={10} style={[{fontSize:13,color:'#999',lineHeight:20,}]}>
                {rowData.get('ExecutorNames').join('、')}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  _renderRejection() {
    //只有驳回状态，才显示驳回原因，驳回状态是23
    let emptyView = <View/>
    let status = this.props.rowData.get('Status');
    if(status !== 9) return emptyView;
    let reason = this.props.rowData.get('RejectReason');
    let RejectUser = this.props.rowData.get('RejectUser');
    let rejectTime = moment(this.props.rowData.get('RejectTime')).format('YYYY年MM月DD日 HH:mm');
    return (
      <View key={'_rejection_view'} style={{backgroundColor:'#fff',padding:16,marginTop:10,marginBottom:0}}>
        <Text style={{fontSize:17,color:'#333',fontWeight:'500'}}>{'驳回原因'}</Text>
        <View style={{height:1,backgroundColor:'#f2f2f2',marginRight:-16,marginTop:16,marginBottom:12}}/>
        <Text style={{fontSize:17,color:'#333',lineHeight:28}}>{reason}</Text>
        {
          !RejectUser ? null :
            <>
              <View style={{height:1,backgroundColor:'#f2f2f2',marginRight:-16,marginTop:12,marginBottom:8}}/>
              <View style={{flexDirection:'row',alignItems:'center',marginBottom:-8,justifyContent:'space-between'}}>
                <TouchFeedback onPress={()=>console.warn('click....')}>
                  <View style={{flex:1,paddingVertical:12,marginVertical:-12,flexDirection:'row',alignItems:'center'}}>
                    <Avatar radius={16} name={RejectUser.get('RealName') || ''} imgKey={RejectUser.get('Photo')}/>
                    <Text style={{fontSize:15,color:'#888',marginLeft:12}}>{RejectUser.get('RealName') || ''}</Text>
                  </View>
                </TouchFeedback>
                <Text style={{fontSize:15,color:'#888'}}>{rejectTime}</Text>
              </View>
            </>
        }

      </View>
    )
  }

  _getButtonByType(fill,cb,text){
    let txtStyle={color:fill?'#fff':GREEN}
    let viewStyle={
      borderColor:GREEN,borderWidth:1
    };
    if(fill){
      viewStyle={backgroundColor:GREEN}
    }
    return (
      <TouchFeedback key={text} style={{flex:1}} onPress={()=>{
        // console.warn(text);
        cb();
      }}>
        <View style={[{flex:1,height:40,justifyContent:'center',alignItems:'center',
          borderRadius:2},viewStyle]}>
          <Text style={[{fontSize:16},txtStyle]}>{text}</Text>
        </View>
      </TouchFeedback>
    );
  }

  _checkInput(){
    let items=this.props.rowData.getIn(['InspectionContent', 0, 'MainItems']);
    for(let i=0;i<items.size;i++){
      for(let n=0;n<items.getIn([i,'SubItems']).size;n++){
        let value=items.getIn([i,'SubItems',n,'Result']);
        if(value===undefined || value===null || String(value).trim()===''){
          this.setState({showWarning:true})
          return false;
        }
      }
    }
    return true;
  }

  _submitAlert(){
    if(!this.props.summary || this.props.summary.trim().length===0){
      Toast.show('无法提交，请填写设备运行总结', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM-40,
      });
      return;
    }
    this.setState({showProcess:true},()=>{
      //如果有漏填的，给出漏填项
      if(!this._checkInput()){
        Alert.alert(
          '',
          `您有巡检内容未填写，确认提交工单`,
          [
            {text: '继续填写', onPress: () =>{
              this.setState({enable:true})
            }},
            {text: '提交', onPress: () =>{
              InteractionManager.runAfterInteractions(()=>{
                this.props.onSubmitTicket(this.props.rowData.get('Id'));
              });
            }},
          ],
          { cancelable: false }
        );
      }else{
        this.props.onSubmitTicket(this.props.rowData.get('Id'));
      }
    })
  }

  _updateInspectionContent(noAlert){
    // console.warn('udpate inspection content');
    this._checkInput();
    this.props.updateInspectionContent(noAlert);
  }

  _getButton(isScollView){
    //根据状态和权限显示底部按钮
    let btns=[];
    let status=this.props.rowData.get('Status');
    if (!privilegeHelper.hasAuth('TicketExecutePrivilegeCode')) {
      return;
    }
    switch (status){
      case 5://待派工
        if(this.state.roleType>0)
          btns.push(this._getButtonByType(true,()=>this._doAction('updateExecutor'),'派工'));
        break;
      case 1:
        if(this.state.roleType!==1){
          //显示执行按钮
          btns.push(this._getButtonByType(true,()=>{
            this.props.onExecute(this.props.rowData.get('Id'));
          },'开始执行'));
        }
        break;
      case 2://执行中
      case 9://已驳回
        if(this.state.roleType!==1){
          //显示保存按钮
          btns.push(this._getButtonByType(false,()=>{
            this._updateInspectionContent();
          },'保存'));
          btns.push(<View key={'00'} style={{width:10}}/>);
          //显示提交按钮
          btns.push(this._getButtonByType(true,()=>{
            // this.props.onSubmitTicket(this.props.rowData.get('Id'));
            this._submitAlert();
          },'提交审批'));

        }
        break;

      case 4://已提交
        if(this.state.roleType!==1){
          //显示保存按钮
          // btns.push(this._getButtonByType(false,()=>{
          //   this._updateInspectionContent();
          // },'保存'));
          // btns.push(<View key={'00'} style={{width:10}}/>);
          // //显示执行按钮
          // btns.push(this._getButtonByType(this.state.roleType===0?true:false,()=>{
          //   //this.props.onSubmitTicket(this.props.rowData.get('Id'));
          //   this._submitAlert();
          // },'提交工单'));
        }
        if(this.state.roleType===2||this.state.roleType===1){
          if (privilegeHelper.checkModulePermission(permissionCode.POP_TICKET_CLOSE_MANAGEMENT)) {
            // btns.push(this._getButtonByType(true,()=>{
            //   this.props.ticketReject(this.props.rowData.get('Id'));
            // },'驳回'));
            // btns.push(<View key={'0'} style={{width:10}}/>);
            btns.push(this._getButtonByType(true,()=>{
              this.props.onCloseTicket(this.props.rowData.get('Id'));
            },'审批通过'));
          }
        }
        break;
    }
    if(btns.length===0) return null;

    return (
      <View style={{flexDirection:'row',paddingVertical:7,paddingHorizontal:16,height:54}}>
        {btns}
      </View>
    );
  }
  _onScroll(e){
  }




  _getToolbar(data){
    var actions = [];
    let actionSelected=[];
    if(!this.props.errorMessage){
      actions = [
        {
          title:'分享',
          iconType:'share',
          show: 'always', showWithText: false
        }
      ];
      actionSelected.push((item)=>{
        let max=200;
        let items=this.props.rowData.getIn(['InspectionContent', 0, 'MainItems']);
        // let showAllExpand=false;
        let expandMap=this.state.expandMap||{}
        let showItemsCount=0;
        items.forEach((item,i)=>{
          if(expandMap[i]){
            showItemsCount+=item.get('SubItems').size;
          }
        });
        showItemsCount+=items.size;
        let fnNext=()=>{
          this.setState({
            isCapturing: true,
          },()=>{
            let callback=()=>{
              this.context.showSpinner();
              setTimeout(()=>{
                if(this.refs.viewShot){
                  this.refs.viewShot.capture().then(uri => {
                    CameraRoll.saveToCameraRoll(uri);
                    const shareOptions = {
                      title: 'Share file',
                      url: uri,
                      failOnCancel: false,
                    };
                    Share.open(shareOptions);
                    this.setState({isCapturing: false})
                    this.context.hideHud();
                  }).catch((err)=>{
                    console.warn('截屏失败:',err);
                    this.context.hideHud();
                    this.setState({isCapturing: false})
                  });
                }
              },1000)
            }
            let failCallback=()=>{
              this.setState({isCapturing: false})
            }
            requestPhotoPermission(callback,failCallback);
          });
        }
        console.warn('showItemsCount',showItemsCount);
        if(showItemsCount>max){
          Alert.alert('','您展开的巡检项过多，可能会引起程序的闪退，请您折叠部分巡检项以后，再分享',[
            {text:'取消分享',onPress:()=>{}},
            {text:'继续分享',onPress:()=>{fnNext()}}
          ]);
          return;
        }else{
          fnNext();
        }
      })
    }
    if(this.state.roleType>0&&this.props.rowData&&
      this.props.rowData.get('Status')!==3 && this.props.rowData.get('Status')!==4){
      actions.push({
        isFontIcon:true,
        type:'icon_more'
      });
      actionSelected.push(()=>{
        if(!isConnected()){
          Toast.show('当前网络已断开，无法编辑工单',{
            duration: Toast.durations.LONG,
            position: Toast.positions.BOTTOM,
          });
          return;
        }
        this._clickActionMore();
      })
    }
    return (
        <Toolbar
          title='工单详情'
          navIcon="back"
          onIconClicked={()=>{
            this._doBack();
          }}
          actions={actions}
        onActionSelected={actionSelected} />
    );
  }

  _doBack(){
    if(this.props.contentChanged){
      Alert.alert(
        '',
        '当前内容尚未保存，是否保存?',
        [
          {text: '不保存', onPress: ()=>{
              this.props.onBack();
              this.setState({forceStoped:true});
          }},
          {text: '保存', onPress: async () => {
            //然后进行保存操作
            this._updateInspectionContent(true);
          }}
        ]
      )
    }else{
      this.props.onBack();
      this.setState({forceStoped:true});
    }
  }

  static getStatusText(rowData) {
    var status = rowData.get('Status'),statusText='';
    if(status === 1){
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

  _traceDetail(){
    if(!this._traced){
      this._traced=true;
      let content=this.props.rowData.get('Content');
      let desc=content;
      if(content&&content.length>0){
        content=content.split('\n');
        if(content.length===7) {
          let tmp = {};
          content.forEach(item => {
            let keyValue=item.split(':');
            tmp[keyValue[0]]=keyValue[1];
          });
          content=tmp;
        }else{
          content={};
        }

      }
      let strAssets=this.props.rowData.get('AssetNames').join(',');
      trackApi.onTrackEvent('App_ViewTicketDetail',{
        customer_id:String(this.props.rowData.get('CustomerId')||''),
        customer_name:this.props.rowData.get('CustomerName'),
        from:this.props.fromAlarm?'报警详情':'工单列表',
        workorder_id:this.props.rowData.get('TicketNum'),
        workorder_status:[null,'未开始','执行中','已完成','已提交','待派工'][this.props.rowData.get('Status')],
        workorder_type:[null,'计划工单','报警工单','随工工单','现场工单','方案工单','巡检工单','抢修工单'][this.props.rowData.get('TicketType')],
        start_time:moment(this.props.rowData.get('StartTime')).format('YYYY-MM-DD'),
        position:this.props.rowData.get('BuildingNames').join(','),
        logfile_count:this.props.logCount||0
      })
    }
  }

  componentDidMount(){
    this._msgLongPress=DeviceEventEmitter.addListener('msgLongPress',menu=>{
      this._showMenu(menu);
    });
    this._logLongPress=DeviceEventEmitter.addListener('logLongPress',menu=>{
      this._showMenu(menu);
    });

    //计算吸顶项索引
    let items=this.props.rowData.getIn(['InspectionContent', 0, 'MainItems']);
    if(items){
      let stickyIndex=[];
      let count=0;
      let currentIndex=2;
      items.forEach((item,index)=>{
        currentIndex++;
        stickyIndex.push(currentIndex);
        currentIndex=currentIndex+1;
      });
      this._stickyIndex=stickyIndex;
      // console.warn('吸顶项',stickyIndex)
      this.setState({
        stickyIndex
      })
    }
  }

  componentWillUnmount(){
    this._msgLongPress.remove();
    this._logLongPress.remove();
  }

  _showMenu(menu){
    this.setState({'modalVisible':true,arrActions:menu,title:''});
  }

  _getActionSheet() {
    var arrActions=this.state.arrActions;
    if (!arrActions) {
      return;
    }
    if (this.state.modalVisible) {
      return(
        <SchActionSheet title={this.state.title} arrActions={arrActions} modalVisible={this.state.modalVisible}
          onCancel={()=>{
            this.setState({'modalVisible':false});
          }}
          onSelect={item=>{
            this.setState({modalVisible:false},()=>{
              setTimeout(()=>{
                item.click();
              },200);
            });
          }}
        >
        </SchActionSheet>
      )
    }
  }

  _showSignModal() {
    let arr = this.props.navigator.state.sceneConfigStack;
    this._backConfig = arr[arr.length - 1];
    arr[arr.length - 1] = null;
    this.setState({signModalVisible:true})
  }

  _hideSignModal() {
    let arr = this.props.navigator.state.sceneConfigStack;
    arr[arr.length - 1] = this._backConfig;
    this.setState({signModalVisible:false})
  }

  _renderSignModal() {
    if(this.state.signModalVisible) {
      return (
        <View style={{position: 'absolute',left:0,right:0,top:0,bottom:0,backgroundColor:'#00000099'}}>
          <TouchableWithoutFeedback style={{flex:1}} onPress={()=>this._hideSignModal()}>
            <View style={{flex:1}}/>
          </TouchableWithoutFeedback>
          <TicketSign isModal={true} ticketId={this.props.rowData.get('Id')}
                      onModalBack={()=>this._hideSignModal()} type={this._signType}
                      offlineMode={this.props.isCache&&!isConnected()}/>
        </View>
      );
    }
  }

  _getItemStatusView(item,index){
    let status=this.props.rowData.get('Status');
    // if(status===2&&(!this.state.showProcess && this.state.clickItems.indexOf(index)<0)) return null;
    // if(status>1&&status<5){
      let count=item.get('SubItems').size;
      let finishCount=0;
      for(let i=0;i<count;i++){
        let standard=item.getIn(['SubItems',i,'Result']);
        if((standard&&String(standard).trim().length>0)||standard===false){
          finishCount+=1;
        }
      }
      //显示警告
      let redColor=this.state.showWarning&&status!==3;//已关闭工单不显示红字
      if(finishCount===count){
        return (
          <Text style={{fontSize:17,color:'#333'}}>已完成</Text>
        );
      }else{
        return (
          <Text style={{fontSize:17,color:redColor?'#ff4d4d':'#333'}}>{`${finishCount}/${count}`}</Text>
        );
      }
    // }
  }

  componentWillReceiveProps(nextProps){
    //有状态改变
    // if(nextProps.rowData.get('Status')===2&&this.props.rowData.get('Status')===1){
    //   if(this._gotoCheckView){
    //     this._gotoCheckView=false;
    //     InteractionManager.runAfterInteractions(() => {
    //       this.props.onRowClick(this._clickRowIndex, nextProps.rowData.get('Status'), this.state.roleType);
    //     });
    //   }
    // }
  }

  _rowClick(index){
    //如果有编辑巡检项的权利，并且工单还没有执行，要给出执行提示
    if(this.state.roleType!==1&&this.props.rowData.get('Status')===1){
      Alert.alert(
        '',
        '开始执行工单？',
        [
          {text: '取消', onPress: () => {}},
          {text: '开始执行', onPress: () => {
            this._clickRowIndex=index;
            this._gotoCheckView=true;
            this.props.onExecute(this.props.rowData.get('Id'));
            // this.props.changeTicketStatus(2);
            // this.props.onRowClick(index, this.props.rowData.get('Status'), this.state.roleType,true);
          }}
        ]
      )
    }else{
      this.props.onRowClick(index, this.props.rowData.get('Status'), this.state.roleType);
    }
  }

  _executeCheck(){
    if(this.state.roleType!==1&&this.props.rowData.get('Status')===1){
      Keyboard.dismiss();
      setTimeout(()=>{
        Alert.alert(
          '',
          '开始执行工单？',
          [
            {text: '取消', onPress: () => {}},
            {text: '开始执行', onPress: () => {
              // this._clickRowIndex=index;
              // this._gotoCheckView=true;
              this.props.onExecute(this.props.rowData.get('Id'));
            }}
          ]
        )
      },100)
      return false;
    }
    return true;
  }

  //显示作业程序
  _renderJob(){
    if(!this.props.rowData.get('InspectionContent') || this.props.rowData.get('InspectionContent').size===0) {
      return null
    }
    let items=this.props.rowData.getIn(['InspectionContent', 0, 'MainItems']);
    let titleView=(
      <TouchFeedback onPress={()=>{
        let showAllExpand=this.state.showAllExpand;
        let expandMap=this.state.expandMap;
        if(showAllExpand){
          showAllExpand=false;
          items.forEach((item,i)=>{
            expandMap[i]=true;
          });
        }else{
          expandMap={};
          showAllExpand=true;
        }
        this.setState({
          expandMap: {...expandMap},
          showAllExpand
        })
      }}>
        <View style={{backgroundColor:'#fff',marginTop: 10,paddingTop:15,paddingBottom:8,flexDirection:'row',alignItems:'center',paddingRight:16}}>
          <Text key={0} style={{fontSize:17,color:'#333',flex:1, marginLeft:16,
            fontWeight:'500'}}>{'作业程序'}</Text>
          <Text style={{fontSize:15,color:GREEN}}>{this.state.showAllExpand?'全部展开':'全部折叠'}</Text>
        </View>
      </TouchFeedback>
    )

    let rows=[];
    rows.push(titleView)

    for(let index=0;index<items.size;index++){
      let item=items.get(index);
      rows.push(
        <TouchFeedback key={rows.length} enabled={true} onPress={() => {
          let expandMap=this.state.expandMap;
          expandMap[index]=!expandMap[index];
          let showAllExpand=false;//this.state.showAllExpand;
          //判断是否全部都展开了
          items.forEach((_,i)=>{
            if(!expandMap[i]){
              showAllExpand=true;
            }
          });

          this.setState({
            expandMap: {...expandMap},showAllExpand
          })
          // this.props.onRowClick(index, this.props.rowData.get('Status'), this.state.roleType);
        }}>
          <View key={index} style={{backgroundColor:'#fff',paddingLeft:16}}>
            <View style={{
              height: 56, paddingRight: 16,backgroundColor:'#fff',
              alignItems: 'center', flexDirection: 'row',
              borderBottomWidth: 1, borderBottomColor: '#f2f2f2'
            }}>
              <Icon type={this.state.expandMap[index]?'icon_asset_expand':'icon_asset_folder'} style={{marginRight:10}}
                color={'#333'} size={18}/>
              <Text numberOfLines={1} style={{flex: 1, fontSize: 17, color: '#333',marginRight:16}}>{item.get('Name')}</Text>
              {this._getItemStatusView(item,index)}
            </View>
          </View>
        </TouchFeedback>
      )
      let status=this.props.rowData.get('Status');
      let roleType=this.state.roleType;
      let canEdit=(status === 9 || status === 2 || status ===1) && roleType !== 1;
      rows.push(
        this.state.expandMap[index]?
          <PatrolRow index={index} data={item} canEdit={canEdit} status={status}
             editRemark={(mainIndex,subIndex)=>{
               if(this._executeCheck()) {
                 this.props.editInspectionRemark(mainIndex,subIndex);
               }
             }}
             //isOffline={this.props.isCache&&!isConnected()}
             imageClick={this.props.imageClick}
             valueChanged={item=>{
               if(this._executeCheck()){
                 this.props.updateInspectionContentItems(index,item);
               }
             }}
             roleType={roleType}/>
          :
          <View/>
      )
    }
    return rows;

    return (
      <View key={'_job_view'} style={{backgroundColor:'#fff',marginTop:10}}>
        {rows}
      </View>
    )
  }

  //总结，比填项，未开始不显示；进行中已提交可以编辑，关闭：不能编辑
 _renderConclusion(isConclusionResult){
    let status=this.props.rowData.get('Status');
    let readOnly=false;
    //只有执行中，已提交，已关闭，才显示这里
   if(status===1 || status === 2 || status ===3 || status ===4 || status === 9){
     if(status===3 || status === 4) readOnly=true;
   }else{
     return null;
   }
   if(isConclusionResult) {
     if(![3,4].includes(status)) return;
     if(status === 4) readOnly = false
     else readOnly = true
   }
   let title = '设备运行总结',opt = '（必填）',hint='请输入设备运行总结'
   if(isConclusionResult) {
     title = '处理情况',opt = '（选填）',hint='请输入处理情况'
   }

   let summary=isConclusionResult ? this.props.conclusionResult : this.props.summary;
   if(status === 3)  {
     if(!summary)
        return null;
     opt = ''
   }
   if(summary === null || summary === undefined) summary='';

   let contentView=(
     <TextInput ref="sign" style={{fontSize:15,minHeight:138,color:'#888',lineHeight:23,padding:0}}
        textAlign={'left'}
        autoFocus={false}
        maxLength={1000}
         onFocus={e=>{
           if(!this._executeCheck()){
             // if(this._signViewRef) this._signViewRef.blur();
           }
         }}
        //         onRef={e=>this._signViewRef=e}
        placeholderStyle={{fontSize:15,marginTop:4,top:3,lineHeight:23}}
        placeholderTextColor={'#d0d0d0'}
        underlineColorAndroid={'transparent'}
        textAlignVertical={'top'}
        onChangeText={(text)=>{
          if(this.props.rowData.get('Status')===1){
            this.props.changeSummary('');
          }else{
            this.props.changeSummary(text,isConclusionResult);
          }
        }}
        value={summary}
        placeholder={hint} multiline={true}
     />
   );
   if(readOnly){
     contentView=(
       <Text style={{fontSize:15,color:'#888',lineHeight:23,padding:0}}>{summary}</Text>
     );
   }
  return (
    <View key={'_conclusion_view'+(isConclusionResult?'_result':'')} style={{backgroundColor:'#fff',marginTop:10,paddingHorizontal:16,paddingBottom:10}}>
      <View style={{backgroundColor:'#fff',paddingTop:15,paddingBottom:8,flexDirection:'row',alignItems:'center',paddingRight:16}}>
        <Text key={0} style={{fontSize:17,color:'#333',
          fontWeight:'500'}}>{title}</Text>
        <Text style={{fontSize:15,color:'#666'}}>{opt}</Text>
      </View>
      {contentView}
    </View>

  )
 }
 _renderSignature(isBoss){
   //判断工单状态
   let status=this.props.rowData.get('Status');
   let isTablet = DeviceInfo.isTablet();
   //只有执行中，已提交，已关闭，才显示这里签名
   if(status === 2 || status ===3 || status ===4 || status === 9){
      if(isBoss && ![3,4].includes(status)) return null
   }else{
     return null;
   }

   let signView=null;
   let signFilePath=this.props.rowData.get(isBoss? 'ChiefOperatorSignFilePath' : 'SignFilePath');
   if(signFilePath){
     //如果是base64图片开图，则是本地图片
     if(signFilePath.indexOf('data:image/jpeg;base64,')===0){
        signView=(
          <Image resizeMode="contain" style={{flex:1,height:65}} source={{ uri: signFilePath }}/>
        )
     }else{
       signView=(
         <NetworkImage
           name={this.props.rowData.get(isBoss? 'ChiefOperatorSignFilePath' : 'SignFilePath')}
           resizeMode="contain"
           height={65}
           style={{flex:1}}
           // imgType='jpg'
           defaultSource={require('../../images/building_default/building.png')}
           useOrigin={true}>
           <TouchFeedback
             style={{flex: 1, backgroundColor: 'transparent'}}
             onPress={() => {
               if(isTablet) {
                 this._signType = isBoss ? 1 : 0
                 this._showSignModal();
               }else {
                 this.props.onSignatureClick(this.props.rowData.get('Id'),isBoss?1:0)
               }
             }}
           >
             <View style={{flex: 1}}></View>
           </TouchFeedback>
         </NetworkImage>
       );
     }
   }else{
     if(status === 3) {
        //已关闭，择不显示 没填写的
       return null;
     }
     //如果是已提交，没填写巡检工程师签名，则也不显示
     if(status === 4 && !isBoss) {
       return null
     }
     signView=<Text style={{fontSize:15,color:GREEN,marginLeft:16}}>{'点此签名'}</Text>;
   }
   let title = isBoss ? '值班长签字' : '巡检工程师签字'
   let opt = status === 3 ? '' : '(选填)'
   return (
     <View key={'_sign_view'+(isBoss?"_boss":'')} style={{backgroundColor:'#fff',marginTop:10,paddingHorizontal:16,paddingBottom:0}}>
       <View style={{backgroundColor:'#fff',marginTop:0,height:65,flexDirection:'row',alignItems:'center',paddingRight:16}}>
         <Text  style={{fontSize:17,color:'#333', fontWeight:'500'}}>{title}</Text>
         <Text  style={{fontSize:14,color:'#b2b2b2', fontWeight:'500'}}>{opt}</Text>
         <TouchFeedback  style={{flex:1}} onPress={()=>{
           if(isTablet) {
             this._signType = isBoss ? 1 : 0
             this._showSignModal();
           }else {
             this.props.onSignatureClick(this.props.rowData.get('Id'),isBoss?1:0)
           }
           //  this._gotoSign()
           }}>
           {signView}
         </TouchFeedback>
       </View>
     </View>

   )
 }

  _testView(){
    let status=['待派工','未开始','执行中','已关闭','已提交'][this.props.rowData.get('Status')];
    let role=['运维','主管A','主管B'][this.state.roleType];
    return (
      <View style={{backgroundColor:'#fff',marginTop:10}}>
        <Text style={{fontSize:17,color:'#333',marginLeft:16,marginTop:15,fontWeight:'500'}}>
          {`测试按钮  ${status}  ${role}`}
          </Text>
        <View style={{flexDirection:'row'}}>
          {this._getButtonByType(false,()=>{this.setState({roleType:0})},'运维')}
          {this._getButtonByType(true,()=>{this.setState({roleType:1})},'主管A')}
          {this._getButtonByType(false,()=>{this.setState({roleType:2})},'主管B')}
          {this._getButtonByType(true,()=>{this.props.changeTicketStatus(3)},'关闭工单')}
        </View>
        <View style={{flexDirection:'row',marginTop:10}}>
          {this._getButtonByType(false,()=>{this.props.changeTicketStatus(0)},'待派工')}
          {this._getButtonByType(true,()=>{this.props.changeTicketStatus(1)},'未开始')}
          {this._getButtonByType(false,()=>{this.props.changeTicketStatus(2)},'执行中')}
          {this._getButtonByType(true,()=>{this.props.changeTicketStatus(4)},'已提交')}
        </View>
      </View>
    )
  }


  _doAction(actionType){
    // console.warn('action type',actionType);
    switch (actionType){
      case 'updateExecutor':
        this.props.changeExecutor();
        break;
      case 'updateTime':
        this.props.editDateTime();
        break;
      case 'delete':
        this.props.onDeleteTicket();
        break;
    }
  }

  _delAlart(){
    Alert.alert(
      '',
      '删除当前工单？',
      [
        {text: '取消', onPress: () => {}},
        {text: '删除', onPress: () => {
          this._doAction('delete')
        }}
      ],
      {cancelable:false}
    )
  }

  _clickActionMore(){
    //根据状态，显示不同的按钮菜单
    //待派工菜单：修改执行时间 删除工单
    //为开始  修改执行人，修改执行时间，删除工单
    //执行中，已提交  修改执行人，修改执行时间

    let status=this.props.rowData.get('Status');
    let menu=[];
    switch (status){
      case 5:
        menu=[
          {title:'修改执行时间',click:()=>this._doAction('updateTime')},
          {title:'删除工单',click:()=>{
            setTimeout(()=>{
              this._delAlart();
            },100);
          }}
          ];
        break;
      case 1:
        menu=[
            {title:'修改执行人',click:()=>this._doAction('updateExecutor')},
            {title:'修改执行时间',click:()=>this._doAction('updateTime')},
            {title:'删除工单',click:()=>{
              setTimeout(()=>{
                this._delAlart();
              },100);
            }}
          ];
        break;
      case 2:
      case 4:
        menu=[
          {title:'修改执行人',click:()=>this._doAction('updateExecutor')},
          {title:'修改执行时间',click:()=>this._doAction('updateTime')}];
        break;
    }

    this._showMenu(menu);
  }

  render() {
    if(!this.props.isFetching && this.props.errorMessage){
      return  (
        <View style={{flex:1,backgroundColor:'white'}}>
          {this._getToolbar(this.props.rowData)}
          <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
            <Text style={{fontSize:17,color:GRAY}}>{this.props.errorMessage}</Text>
          </View>
        </View>
      )
    }
    if(this.props.isFetching || !this.props.rowData){
      return  (
        <View style={{flex:1,backgroundColor:'white'}}>
          {this._getToolbar(this.props.rowData)}
          <Loading />
        </View>
      )
    }

    this._traceDetail();
    var marginBottom = {marginBottom:bottomHeight};

    //已提交工单没有按钮，已开始按钮，在scrollview内，如果没有权限，按钮也不显示
    var bottomButton = this._getButton(false);
    if(!bottomButton){
      marginBottom = null;
    }

    if(bottomButton) {
      if (Platform.OS === 'ios') {
        bottomButton = (
          <View style={{backgroundColor: '#fff'}}>
            <View style={{marginBottom: (isPhoneX() ? 34 : 0)}}>
              {bottomButton}
            </View>
          </View>
        );
      } else {
        bottomButton = (
          <View style={{backgroundColor: '#fff',marginBottom: (isPhoneX() ? 34 : 0)}}>
            {bottomButton}
          </View>
        );
      }
    }
    let arr=[
      this._getAssetView(),
      this._renderRejection(),
      this._renderJob(),
      this._renderConclusion(),
      this._renderConclusion(true),
      this._renderSignature(),
      this._renderSignature(true),
      <View key={'_line'} style={{height:10,flex:1,backgroundColor:LIST_BG}}>
      </View>
    ];

    let realView=this.state.isCapturing?(
      <ViewShot key={'_view_shot'} style={{flex:1,backgroundColor:LIST_BG}} ref="viewShot" options={{ format: "jpg", quality: 0.9 }}>
        {arr}
      </ViewShot>
    ):arr;
    let ScrollComponent=ScrollView;
    if(Platform.OS==='ios'){
      ScrollComponent=KeyboardAwareScrollView;
    }
    return (
      <View style={{flex:1,backgroundColor:LIST_BG}}>
        {this._getToolbar(this.props.rowData)}
        <ScrollComponent key={'_scroll_component'} stickyHeaderIndices={this.state.stickyIndex||[]} style={[styles.wrapper,marginBottom]}
          onScroll={(e)=>this._onScroll(e)}>
          {realView}
        </ScrollComponent>
        {bottomButton}
        {this._renderSignModal()}
        {this._getActionSheet()}
      </View>
    );
  }
}

TicketDetail.propTypes = {
  onBack:PropTypes.func,
  onEditTicket:PropTypes.func,
  onCreateLog:PropTypes.func,
  onCreateMesg:PropTypes.func,
  onGotoAllMesg:PropTypes.func,
  onExecute:PropTypes.func,
  onSubmitTicket:PropTypes.func,
  onCloseTicket:PropTypes.func,
  onSignatureClick:PropTypes.func,
  ticketLog:PropTypes.func,
  isCurrCreater:PropTypes.bool,
  isFetching:PropTypes.bool,
  logCount:PropTypes.number,
  msgCount:PropTypes.number,
  rowData:PropTypes.object,//immutable
  contentView:PropTypes.object,
  errorMessage:PropTypes.string,
}
var bottomHeight = 0;

var styles = StyleSheet.create({
  statusRow:{
    height:69,
    flexDirection:'row',
    alignItems:'center',
    paddingHorizontal:16,
    backgroundColor:TICKET_STATUS
  },
  statusText:{
    fontSize:17,
    color:BLACK
  },
  moreContent:{
    margin:16,
    marginTop:0,
    marginBottom:13,
    backgroundColor:'white'
  },
  bottom:{
    position:'absolute',
    left:0,
    right:0,
    bottom:0,
    flex:1,
    height:bottomHeight,
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
  },
  button:{
    height:40,
    flex:1,
    marginHorizontal:16,
    borderRadius:2,

  },
  wrapper:{
    flex:1,
    backgroundColor:'transparent',
  },
});
