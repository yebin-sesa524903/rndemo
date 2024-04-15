import React,{Component} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Platform,
  Linking,
  Alert,
  Dimensions,
  TouchableOpacity, Pressable, InteractionManager
} from 'react-native';
import Toolbar from "../../Toolbar";
import {GREEN, LIST_BG} from "../../../styles/color";
import {isPhoneX} from "../../../utils";
import TouchFeedback from "../../TouchFeedback";
import Button from "../../Button";
import {Avatar, Remark, Urgency} from "./widget";
import Icon from "../../Icon";
import Modal from '../../actionsheet/CommonActionSheet';
import Loading from '../../Loading';
import moment from "moment";
import Toast from "react-native-root-toast";
import privilegeHelper from "../../../utils/privilegeHelper";
import permissionCode from "../../../utils/permissionCode";
import ViewShot from "react-native-view-shot";
import CameraRoll from "@react-native-community/cameraroll";
import Share from "react-native-share";
import {requestPhotoPermission} from "../../../utils/devicePermission";
import trackApi from "../../../utils/trackApi";

const HEIGHT = Dimensions.get('window').height;

export default class ServiceTicketDetailView extends Component {

  constructor() {
    super();
    this.state={
      isClickSubmit:false,validateModal:false
    }
  }

  _getRejectTime() {
    return moment(this.props.data.RejectTime).format('YYYY年MM月DD日 HH:mm')
  }

  _renderRejection() {
    if(this.props.data.Status !== 4 && this.props.data.Status !== 3) return null;
    //还没有驳回信息
    if(!this.props.data.RejectUser) return;
    return (
      <View style={{backgroundColor:'#fff',padding:16,marginTop:10}}>
        <Text style={{fontSize:17,color:'#333',fontWeight:'500'}}>{'驳回原因'}</Text>
        <View style={{height:1,backgroundColor:'#f2f2f2',marginHorizontal:-16,marginTop:16,marginBottom:12}}/>
        <Text style={{fontSize:17,color:'#333',lineHeight:28}}>{this.props.data.RejectReason}</Text>
        <View style={{height:1,backgroundColor:'#f2f2f2',marginRight:-16,marginTop:12,marginBottom:8}}/>
        <View style={{flexDirection:'row',alignItems:'center',marginBottom:-8,justifyContent:'space-between'}}>
          <TouchFeedback onPress={()=>this.setState({modalVisible:true,clickReject:true})}>
            <View style={{flex:1,paddingVertical:12,marginVertical:-12,flexDirection:'row',alignItems:'center'}}>
              <Avatar radius={16} name={this.props.data.RejectUser.RealName || ''} imgKey={this.props.data.RejectUser.Photo}/>
              <Text style={{fontSize:15,color:'#888',marginLeft:12}}>{this.props.data.RejectUser.RealName || ''}</Text>
            </View>
          </TouchFeedback>
          <Text style={{fontSize:15,color:'#888'}}>{this._getRejectTime()}</Text>
        </View>

      </View>
    )
  }

  _renderHead() {
    let offsetY = 0;
    if(Platform.OS === 'android') offsetY = 4;
    return (
      <View style={{backgroundColor:'#fff',padding:16}}>
        <Text style={{flexDirection:'row',alignItems:'center'}}>
          <Text style={{fontSize:17,lineHeight:23,color:'#333',fontWeight:'500'}}>{this.props.data.Name}</Text>
          <View style={{width:8}}/>
          <Urgency isUrgency={this.props.data.IsUrgent} offsetY={offsetY}/>
        </Text>
        <Text style={{fontSize:15,color:'#333',marginVertical:10}}>{`资产：${this.props.data.AssetName}`}</Text>
        <View style={{flexDirection:'row', alignItems:'center'}}>
          <Icon type={'icon_asset_location'} color={'#888'} size={15}/>
          <Text numberOfLines={1} style={{fontSize:15,color:'#888',marginLeft:10,marginRight:12,flex:1}}>{this.props.data.CustomerLocation}</Text>
          {true ? null : <Image source={require('../../../images/navi/navi.png')} width={30} height={30}/>}
        </View>
        <View style={{height:1, backgroundColor:'#f2f2f2', marginVertical:10}}/>
        <View style={{flexDirection:'row', alignItems:'center'}}>
          <Icon type={'icon_date'} color={'#888'} size={15}/>
          <Text numberOfLines={1} style={{fontSize:15,color:'#888',marginLeft:10}}>{this._formatTicketTime()}</Text>
          <View style={{flexDirection:'row',flex:1,justifyContent:'flex-end'}}>
            <TouchFeedback onPress={()=>this.setState({modalVisible:true})}>
              <View style={{flexDirection:'row',alignItems:'center'}}>
                {this._renderExecutorIcons()}
              </View>
            </TouchFeedback>
          </View>
        </View>
      </View>
    )
  }

  _renderExecutorIcons() {
    let executor = this.props.data.ExecuteUsers;
    let views = [];
    let fcount = executor.length;
    let more = 0;
    if(fcount>3) {
      more = fcount - 3;
      fcount = 3;
    }
    for(let i=0;i<fcount;i++) {
      let item = executor[i];
      views.push(
        <>
          <View style={{width:12}}/>
        <Avatar style={{marginLeft:0}} key={i} imgKey={item.Photo} radius={18} name={item.RealName}/>
        </>
      )
    }
    if(more) {
      views.push(
        <Text key={'more_text'} style={{marginLeft:12,fontSize:15,color:'#888'}}>{`+${more}`}</Text>
      )
    }
    return views;
  }

  _formatTicketTime() {
    let start = moment(this.props.data.StartTime).format('MM-DD');
    let end = moment(this.props.data.EndTime).format('MM-DD');
    return `${start} 至 ${end}`
  }

  _checkSubmit() {
    let content = this.props.data.Content;
    let checked = true;
    Object.keys(content).forEach(item => {
      if(!content[item].IsIgnored) {
        let ret = this._checkTaskItemFill(item,content[item]);
        if(!ret) checked = false;
      }
    })
    return checked;
  }

  //点击底部按钮
  _post() {
    switch (this.props.data.Status) {
      case 1://为开始
        Toast.show('开始执行，请填写巡检结果', {
          duration: Toast.durations.LONG,
          position: Toast.positions.BOTTOM,
        });
        trackApi.onTrackEvent('App_LogbookTicket',{
          ticket_operation:['开始执行','忽略任务项','添加日志','筛选','提交审批','自定义编辑'][0]
        })
        this.props.executeTicket();
        break;
      case 2://执行中
      case 4://已驳回
        this.setState({
          isClickSubmit:true
        })
        if(!this._checkSubmit()) {
          Toast.show('请确保任务全部完成后重试', {
            duration: Toast.durations.LONG,
            position: Toast.positions.BOTTOM,
          });
          return;
        }
        Alert.alert(
          '',
          `审批过程中无法修改巡检结果，确认提交？`,
          [
            {text: '继续填写', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
            {text: '提交审批', onPress: () => {
              InteractionManager.runAfterInteractions(()=>{
                trackApi.onTrackEvent('App_LogbookTicket',{
                  ticket_operation:['开始执行','忽略任务项','添加日志','筛选','提交审批','自定义编辑'][4]
                })
                this.props.submitTicket();
              });
              }},
          ]
        )

        break;

    }
  }

  //底部按钮
  _renderBottomButton() {
    let buttonTitle = [null,'开始执行','提交审批',null,'提交审批',null][this.props.data.Status];
    if(!buttonTitle) return null;
    if(this._onlyShow()) return null;
    return (
      <View style={{backgroundColor:'#fff',padding:16,paddingVertical:7,paddingBottom:isPhoneX()?41:7,
        borderTopWidth:1,borderTopColor:'#e6e6e6'}}>
        <Button onClick={()=>this._post()}
          style={{backgroundColor:GREEN,borderRadius:2,height:40}}
          textStyle={{color:'#fff',fontSize:16}} text={buttonTitle}
        />
      </View>
    )
  }

  _renderTicketLabel() {
    let creatTime = moment(this.props.data.CreateTime).format('YYYY-MM-DD');
    return (
      <View style={{alignItems:'center',marginVertical:16}}>
        <Text style={{fontSize:12,color:'#888'}}>{`工单ID：${this.props.data.TicketNum}`}</Text>
        <Text style={{fontSize:12,color:'#888',marginTop:4}}>{`${this.props.data.CreateUserName} 创建于${creatTime}`}</Text>
      </View>
    )
  }

  //检查项是否写完完整
  _checkTaskItemFill(itemKey,item) {
    if(itemKey === 'ConstantValueInfo') {
      //如果是保护定值  则高低日志都不能为空
      return item.ItemInfo.HighVoltageConstantValueInfo && item.ItemInfo.LowVoltageConstantValueInfo
    } else {
      //非保护定值
      if(item.ItemInfo.InspectionInfoList) {
        if(item.ItemInfo.InspectionInfoList.length === 0) return false;
      }
      if(item.ItemInfo.MaintenanceInfo) {
        let info = item.ItemInfo.MaintenanceInfo ;
        let fill = true;
        Object.keys(info).forEach((key,index) => {
          if(info.Frequency === 4) {
            if(index < 2 && info[key] === null) {
              fill = false;
              return;
            }
          }else {
            if(info[key] === null) {
              fill = false;
              return;
            }
          }
        });
        return fill;
      }
      return true;
    }
  }

  _renderTask() {
    let tasks = [];
    let content = this.props.data.Content;
    Object.keys(content).forEach(item => {
      if(!content[item].IsIgnored) {
        tasks.push({
          ...content[item],
          info:this.props.model[item],
          key:item,
          isFill:this._checkTaskItemFill(item,content[item])
        })
      }
    })
    if(tasks.length === 0) return null;
    let leftIconColor,leftIconView,errorColor,errorView;
    let unCheckStatus = true;
    let status = this.props.data.Status;
    switch (status) {
      case 1:
        leftIconColor = 'rgba(0, 0, 0, 0.15)';
        errorColor = leftIconColor;
        break;
      case 2:
        if(this.state.isClickSubmit) unCheckStatus = false;
        leftIconColor = GREEN;
        errorColor = '#ff4d4d';
        leftIconView = <Icon type={'icon_check'} color={GREEN} size={17}/>
        errorView = <Icon type={'icon_close'} color={errorColor} size={14}/>
        break;
      case 4://已驳回
        unCheckStatus = false;
        errorColor = '#ff4d4d';
        leftIconColor = GREEN;
        leftIconView = <Icon type={'icon_check'} color={GREEN} size={17}/>
        errorView = <Icon type={'icon_close'} color={errorColor} size={14}/>
        break;
      case 3://已提交
      case 5://已关闭
        unCheckStatus = false;
        leftIconColor = GREEN;
        errorColor=leftIconColor;
        leftIconView = <Icon type={'icon_check'} color={GREEN} size={17}/>
        errorView = leftIconView
        break;
    }

    let ignoreView = null;
    //已提交和已关闭 不显示忽略项
    if(!this._onlyShow()) {
      //未执行也不显示忽略项
      if(this.props.data.Status !== 1) {
        ignoreView = (
          <TouchFeedback onPress={()=>this.props.doIgnore()}>
            <Text style={{fontSize:17,color:GREEN}}>忽略任务项</Text>
          </TouchFeedback>
        );
      }

    }

    let showRemark = this.props.data.Status === 4 || this.props.data.Status === 3;
    let taskViews = tasks.map((item,index) => {
      //判断当前项是否都已填写
      return (
        <TouchFeedback key={index} onPress={()=>this.props.clickTask(item)}>
          <View  style={{flexDirection:'row',marginLeft:16,paddingRight:16,height:56,alignItems:'center',
            borderBottomColor:'#f2f2f2',borderBottomWidth:1}}>
            <View style={{width:32,height:32,borderRadius:16,borderColor: item.isFill?leftIconColor: unCheckStatus ? 'rgba(0, 0, 0, 0.25)' : errorColor,borderWidth:1,
              alignItems:'center',justifyContent:'center'}}>
              { item.isFill ? leftIconView :
                (unCheckStatus ? <Text style={{fontSize:17,color:'rgba(0, 0, 0, 0.25)'}}>{index+1}</Text> : errorView)
              }
            </View>
            <Text style={{flex:1,fontSize:17,color:'#333',marginHorizontal:10}}>{item.info.title}</Text>
            {
              showRemark && item.HaveComments ? <Remark disable noOffset click={()=>this.props.clickTask(item)}/> : null
            }
            <Icon style={{marginLeft:12}} type={'arrow_right'} color={'#888'} size={14}/>
          </View>
        </TouchFeedback>
      )
    })
    return (
      <View style={{backgroundColor:'#fff',marginTop:10}}>
        <View style={{flexDirection:'row',justifyContent:'space-between',padding:16,}}>
          <Text style={{fontSize:17,color:'#333',fontWeight:'500'}}>巡检维护任务</Text>
          <View style={{flex:1}}/>
          {ignoreView}
        </View>
        <View style={{height:1,backgroundColor:'#f2f2f2'}}/>
        {taskViews}
      </View>
    )
  }

  _onlyShow() {
    //没有执行完整权限
    if(!privilegeHelper.hasAuth(permissionCode.SERVICE_EXECUTE.FULL)) return true;
    //不是创建者或者执行者
    if(!this.props.isCreatorOrExecutor) return true;
    let status = this.props.data.Status;
    //如果是已提交和已关闭，则只能查看
    if(status === 3 || status === 5) return true;
    return false;
  }

  _callPhone(tel){
    if(Platform.OS==='ios'){
      Linking.canOpenURL('tel:' + tel).then(supported => {
        if (!supported) {
          console.warn('Can\'t handle url: ' + tel);
        } else {
          return Linking.openURL('tel:' + tel);
        }
      }).catch(err => console.error('An error occurred', err));
    }else {
      Alert.alert('', tel, [
        {
          text: '取消', onPress: () => {
          }
        },
        {
          text: '呼叫', onPress: () => {
            Linking.canOpenURL('tel:' + tel).then(supported => {
              if (!supported) {
                console.warn('Can\'t handle url: ' + tel);
              } else {
                return Linking.openURL('tel:' + tel);
              }
            }).catch(err => console.error('An error occurred', err));
          }
        }
      ])
    }
  }

  _executorModal() {
    if(!this.state.modalVisible) return;
    let users = this.props.data.ExecuteUsers;
    if(this.state.clickReject) {
      users = [this.props.data.RejectUser];
    }
    let items = users.map((item,index)=>{
      let showPhone = item.Phone && item.Phone.length>0;
      return (
        <View key={index} style={{flexDirection:'row',justifyContent:'space-between',height:40,alignItems:'center'}}>
          <Text style={{fontSize:17,color:'#333'}}>{item.RealName}</Text>
          {
            showPhone ?
            <TouchFeedback onPress={()=>this._callPhone(item.Phone)}>
              <View style={{flexDirection: 'row',width:140,alignItems: 'center',marginVertical:-6,paddingVertical:6}}>
                <Icon type={'icon_phone'} color={GREEN} size={12}/>
                <Text style={{fontSize: 17, color: GREEN, marginLeft: 6}}>{item.Phone}</Text>
              </View>
            </TouchFeedback>
              : null
          }
        </View>
      )
    });
    return (
      <Modal modalVisible={this.state.modalVisible} onCancel={()=>this.setState({modalVisible:false,clickReject:false})}>
        <View style={{backgroundColor:'#fff',padding:16,paddingBottom:isPhoneX()?34:16}}>
          <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            <Text style={{fontSize:17,color:'#333',fontWeight:'500'}}>{this.state.clickReject ? '专家信息' : '工单执行人'}</Text>
            <TouchFeedback onPress={()=>this.setState({modalVisible:false,clickReject:false})}>
              <View style={{marginTop:-16,marginRight:-16,padding:16}}>
              <Icon type={'icon_close'} color={'#333'} size={17}/>
              </View>
            </TouchFeedback>
          </View>
          <View style={{height:1,backgroundColor:'#f2f2f2',marginHorizontal:-16}}/>
          <ScrollView showsVerticalScrollIndicator={false}
            style={{maxHeight:450}}>
            {items}
          </ScrollView>

        </View>
      </Modal>
    )
  }

  _savePhoto() {
    let callback=()=>{
      if(this.refs.viewShot){
        this.refs.viewShot.capture().then(uri => {
          CameraRoll.saveToCameraRoll(uri);
          // const shareOptions = {
          //   title: 'Share file',
          //   url: uri,
          //   failOnCancel: false,
          // };
          // Share.open(shareOptions);
          this.setState({validateModal: false});
          Toast.show('保存图片成功', {
            duration: Toast.durations.LONG,
            position: Toast.positions.BOTTOM,
          });
        }).catch((err)=>{
          Toast.show('保存图片失败', {
            duration: Toast.durations.LONG,
            position: Toast.positions.BOTTOM,
          });
        });
      }
    }
    let failCallback=()=>{

    }
    requestPhotoPermission(callback,failCallback);
  }

  _validateFailModal() {
    if(!this.state.validateModal) return;
    // let data = [
    //   {
    //     "Type": 3,
    //     "Id": 823007,
    //     "ItemName": "电容补偿柜状态",
    //     "Key": "验证母线系统",
    //     "Value": "总长度"
    //   },
    //   {
    //     "Type": 4,
    //     "Id": 823008,
    //     "ItemName": "系统运行环境与工况",
    //     "Key": "验证配电柜",
    //     "Value": "生产厂家,运行日期,生产日期"
    //   }
    // ]
    let data = this.props.validateResult;
    let views = data.map((item,index) => {
      let width = 1;
      if(index === data.length -1) width = 0;
      return (
        <View key={index} style={{flex:1,flexDirection:'row',borderBottomColor:'#e6e6e6',borderBottomWidth:width}}>
          <View style={{padding:10,flex:1,backgroundColor:'#fafafa',borderRightColor:'#e6e6e6',
            borderRightWidth:1,justifyContent:'center'}}>
            <Text style={{fontSize:14,color:'#333'}}>{item.Key}</Text>
          </View>
          <View style={{padding:10,flex:1,backgroundColor:'#fff'}}>
            <Text style={{fontSize:14,color:'#333',flex:1}}>{item.Value}</Text>
          </View>
        </View>
      )
    });
    return (
      <Modal modalVisible={this.state.validateModal} onCancel={()=>this.setState({validateModal:false})}>
        <View style={{backgroundColor:'#fff',padding:16,margin:16,borderRadius:2}}>
          <View style={{alignItems:'center'}}>
            <Icon type={'icon_unselect'} color={'red'} size={30}/>
            <Text style={{fontSize:20,color:'rgba(0, 0, 0, 0.85)',marginVertical:10}}>提交审批失败</Text>
          </View>
          <Text style={{fontSize:15,color:'#333',marginBottom:8,marginTop:6}}>请填写如下资产信息后重试</Text>
          <ScrollView style={{maxHeight:282,}} showsVerticalScrollIndicator={false}>
            <ViewShot style={{flex:1,borderRadius:2,borderColor:'#e6e6e6',borderWidth:1}} ref="viewShot" options={{ format: "png", quality: 1 }}>
              {views}
            </ViewShot>
            {/*<View style={{flex:1,borderRadius:2,borderColor:'#e6e6e6',borderWidth:1}}>*/}
            {/*  {views}*/}
            {/*</View>*/}
          </ScrollView>
          <View style={{height:1,backgroundColor:'#e6e6e6',marginHorizontal:-16,marginTop:12}}></View>
          <View style={{flexDirection:'row',marginBottom:-16}}>
            <Pressable onPress={()=>this.setState({validateModal:false})} style={{padding:10,flex:1,borderRightColor:'#e6e6e6',paddingVertical:16,
              borderRightWidth:1,justifyContent:'center',alignItems:'center'}}>
              <Text style={{fontSize:17,color:'#0076ff'}}>{'知道了'}</Text>
            </Pressable>
            <Pressable onPress={()=>this._savePhoto()} style={{padding:10,flex:1,backgroundColor:'#fff',paddingVertical:16,justifyContent:'center',alignItems:'center'}}>
              <Text style={{fontSize:17,color:'#0076ff',flex:1}}>{'保存图片至本地'}</Text>
            </Pressable>
          </View>
        </View>
        <TouchableOpacity style={{flex:1}} onPress={()=>this.setState({validateModal:false})}></TouchableOpacity>
      </Modal>
    );
  }

  componentDidUpdate(prevProps, prevState) {
    if(prevProps.validatePosting !== this.props.validatePosting && this.props.validatePosting !== 1){
      if(this.props.validatePosting === 0) {
        if(this.props.validateResult && this.props.validateResult.length > 0) {
          this.setState({validateModal:true})
        }
      }
    }
  }

  render() {
    if(this.props.errMsg && !this.props.isFetching) {
      return (
        <View style={{flex:1, backgroundColor:LIST_BG}}>
          <Toolbar
            title={this.props.title || '工单详情'}
            navIcon="back"
            noShadow={true}
            onIconClicked={()=>this.props.onBack()}
          />
          <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
            <Text style={{fontSize:17,color:'#333'}}>{this.props.errMsg}</Text>
          </View>
        </View>
      )
    }
    if(this.props.isFetching || !this.props.data) {
      return (
        <View style={{flex:1, backgroundColor:LIST_BG}}>
          <Toolbar
            title={this.props.title || '工单详情'}
            navIcon="back"
            noShadow={true}
            onIconClicked={()=>this.props.onBack()}
          />
          <Loading/>
        </View>
      )
    }

    return (
      <View style={{flex:1, backgroundColor:LIST_BG}}>
        <Toolbar
          title={this.props.title || '工单详情'}
          navIcon="back"
          noShadow={true}
          onIconClicked={()=>this.props.onBack()}
        />

        <ScrollView style={{flex:1}} showsVerticalScrollIndicator={false}>
          {this._renderHead()}
          {this._renderRejection()}
          {this._renderTask()}
          {this._renderTicketLabel()}
        </ScrollView>

        {this._renderBottomButton()}
        {this._executorModal()}
        {this._validateFailModal()}
      </View>
    )
  }
}
