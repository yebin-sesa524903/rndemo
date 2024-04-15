
'use strict';
import React,{Component} from 'react';
import {
  View,
  Dimensions,Linking,
  StyleSheet, InteractionManager,
} from 'react-native';
import PropTypes from 'prop-types';
import SchActionSheet from '../actionsheet/SchActionSheet';

import Toolbar from '../Toolbar';
import List from '../List.js';
import SimpleRow from './SimpleRow';
import NetworkImage from '../NetworkImage.js';
import Section from '../Section.js';
import TouchFeedback from '../TouchFeedback.js';
import Icon from '../Icon.js';
import {GRAY, GREEN} from '../../styles/color.js';
import Text from '../Text.js';
import UploadableImage from '../UploadableImage';
import Toast from 'react-native-root-toast';
import AlertDialog from '../AlertDialog';
import InputDialog from '../InputDialog';
import ListSeperator from '../ListSeperator';
import {Keyboard} from 'react-native';
import {isPhoneX} from '../../utils';

export default class DetailView extends Component{
  constructor(props){
    super(props);
    var {width} = Dimensions.get('window');
    var height = parseInt(width*2/3);
    this.state = {imgWidth:width,imgHeight:height};
  }
  _renderSection(sectionData,sectionId,sectionIndex){

    //判断是否logTab
    if(this.props.stateData&&this.props.stateData.get('isLogTab') || this.props.isLogTab){
      return(
        <View style={{height:10}}/>
      );
    }

    var sectionTitle = this.props.sectionData.get(sectionId);
    if(sectionTitle===''&&this.props.emptyHeaderHeight){
      return(
        <View style={{height:this.props.emptyHeaderHeight}}/>
      );
    }
    if(!sectionTitle) return null;
    if(sectionTitle.get&&sectionTitle.get('type')==='box_location') return null;
    if(sectionTitle.get&&sectionTitle.get('type')==='parent_node') return <View style={{height:10}}/>;
    if(sectionTitle.get&&sectionTitle.get('sensorHistory')) return this._renderSensorHistory(sectionTitle);
    //判断是否显示延保信息
    if(sectionTitle.get&&sectionTitle.get('showWarranty')){
      return (
        <View style={{paddingHorizontal:16,paddingVertical:12}}>
          <Text style={{fontSize:14,lineHeight:21,color:'#888'}}>
            <Icon type={'icon_info'} color={'#fbb325'} size={16} />
            <Text>  感谢您参与扫码延保计划。此施耐德电气元器件的质保期将在施耐德电气承诺的标准产品质保期基础上延长6个月。施耐德电气承诺的标准质保期及其保内服务请点击查看：</Text>
            <Text onPress={()=>{
              Linking.openURL('https://www.schneider-electric.cn/zh/work/services/After-sales-service/guarantee.jsp');
            }}
                  style={{color:'#219bfd'}}>https://www.schneider-electric.cn/zh/work/services/After-sales-service/guarantee.jsp</Text>
          </Text>
        </View>
      );
    }
    return (
      <Section text={sectionTitle} />
    );
  }

  //母排温度历史曲线
  _renderSensorHistory(row) {
    return (
      <View style={{
        paddingTop:19,
        paddingHorizontal:16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom:10,
        backgroundColor:this.props.bkgColor,
      }}>
        <Text style={{fontSize:14, color:GRAY,}} numberOfLines={1}>{row.get('title')}</Text>
        <TouchFeedback onPress={this.props.clickHistory}>
          <Text style={{fontSize:14, color:GREEN,marginTop: -19,paddingTop: 19}}>历史曲线</Text>
        </TouchFeedback>
      </View>
    )
  }

  _renderRow(rowData,sectionId,rowId){
    if(rowData.get('type')==='location'){
      // return this._renderLocation(rowData);
    }
    if(rowData.get('type')==='buildingAdmin'){
      return this._renderContactItem(rowData);
    }
    if(rowData.get('industryId')&&!rowData.get('value')) return null;
    let isLogTab=this.props.stateData&&this.props.stateData.get('isLogTab');
    let hiddenImage=this.props.hiddenImage;
    //此界面是公用，只要不是logTab界面，都要显示资产图片
    if(!isLogTab&&sectionId === '0'&&!hiddenImage){
      let imageUri = rowData.get('value');
      var touchItem = null;
      if(this.props.canEdit){
        touchItem = (
          <TouchFeedback
            style={styles.emptyImageContainer}
            onPress={()=>this._addImage()}>
            <View style={{flex:1,}}>

            </View>
          </TouchFeedback>
        );
      }
      if(rowData.get('pendingImageUri')){
        // console.warn('pendingImageUri',rowData.get('pendingImageUri'));
        return (
          <UploadableImage
            name={this.props.ownData.get('Id').toString()}
            postUri={`${this.props.ownData.get('Id')}/logo/upload`}
            uri={rowData.get('pendingImageUri')}
            resizeMode="contain"
            height={this.state.imgHeight} width={this.state.imgWidth}
            loadComplete = {this.props.changeImageComplete} >
            {touchItem}
          </UploadableImage>
        );
      }

      if(imageUri){
        // console.warn('NetworkImage',rowData.get('value'),rowData.get('isEncryptLogo'));
        return (
          <NetworkImage
            resizeMode='contain'
            width={this.state.imgWidth}
            height={this.state.imgHeight}
            name={rowData.get('value')}
            isEncrypt={rowData.get('isEncryptLogo')}
           >
             {touchItem}
           </NetworkImage>
        );
      }
      else {
        return (
          <View style={{width:this.state.imgWidth,height:this.state.imgHeight}}>
            <TouchFeedback
              style={styles.emptyImageContainer}
              onPress={()=>this._addImage()}>
              <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                <Icon type="icon_add" color={GRAY} size={60} />
                <Text style={styles.emptyImageText}>{this.props.emptyImageText}</Text>
              </View>

            </TouchFeedback>
          </View>
        );
      }

    }
    if(rowData&&rowData.get('hidden')) return null;
    return (
      <SimpleRow rowData={rowData} onRowClick={this.props.onRowClick} />
    );
  }

  _renderContactItem(item){
    let phoneView=null;
    if(item.get('phone')&&item.get('phone').length>0){
      phoneView=(
        <View style={{flexDirection:'row',alignItems:'center',marginVertical:14}}>
          <Icon type="icon_phone" color="#888" size={15}/>
          <Text onPress={()=>{
            this.props.callPhone(item.get('phone'))
          }} style={{fontSize:15,color:'#219bfd',marginLeft:10}}>{item.get('phone')}</Text>
        </View>
      );
    }
    let mailView=null;
    if(item.get('email')&&item.get('email').length>0){
      mailView=(
        <View style={{flexDirection:'row',alignItems:'center'}}>
          <Icon type="icon_mail" color="#888" size={15}/>
          <Text numberOfLines={1} style={{flex:1,fontSize:15,color:'#888',marginLeft:10}}>
            {item.get('email')}
          </Text>
        </View>
      );
    }
    let divW=2;
    if(!item.get('Title') || item.get('Title').length===0) {
      divW=0;
    }
    return (
      <View style={{paddingHorizontal:16,paddingVertical:16,backgroundColor:'#fff',flex:1}}>
        <View style={{flexDirection:'row',alignItems:'center',overflow:'hidden'}}>
          <Text numberOfLines={1} style={{fontSize:17,color:'#333'}}>{item.get('name')}</Text>
          <View style={{backgroundColor:'#e6e6e6',height:16,width:divW,marginHorizontal:15}}/>
          <Text numberOfLines={1} style={{fontSize:15,color:'#333'}}>{item.get('title')}</Text>
        </View>
        {phoneView}
        {mailView}
      </View>
    )
  }
  _addImage(){
    if(this.props.canEdit){
      this.props.changeImage()
    }
    else {
      this._showToast();
    }
  }
  _showToast(){
    Toast.show('您没有这一项的操作权限，请联系系统管理员', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
    });
  }
  _getToolbar(){
    if(this.props.hasToolbar){
      let actions = [];
      if(this.props.logbookPermission) {
        actions = [{title: `&#xf16f;`, show: 'always', isFontIcon: true, type: 'icon_more'}];
      }
      return (
        <Toolbar
          title={this.props.name}
          navIcon="back"
          onIconClicked={()=>this.props.onBack()}
          actions={actions}
          onActionSelected={[()=>this._showMenu()]}
        />
      );
    }
    return null;
  }

  _showMenu(){
    let isRoom=this.props.ownData.get('Type')==3;
    let editText=isRoom?'编辑配电室名称':'编辑配电柜名称';
    let arr=[editText,'删除'].map((item,index)=>{
      return {title:item,select:true,index}
    });
    this.setState({'modalVisible':true,arrActions:arr});
  }

  _getActionSheet()
  {
    var arrActions=this.state.arrActions;
    if (!arrActions) {
      return;
    }
    if (this.state.modalVisible) {
      return(
        <SchActionSheet title={''} arrActions={arrActions} modalVisible={this.state.modalVisible}
          onCancel={()=>{
            this.setState({'modalVisible':false});
          }}
          onSelect={item=>this._menuClick(item)}
        >
        </SchActionSheet>
      )
    }
  }

  _toast(msg){
    Toast.show(msg,{
      duration:1500
    });
  }

  _menuClick(item){
    let isRoom=this.props.ownData.get('Type')==3;
    let state={};
    if(item.index==0){
      state={
        modalInputDialog:true,
        inputTitle:isRoom?'编辑配电室名称':'编辑配电柜名称',
        hintText:isRoom?'请输入配电室名称':'请输入配电柜名称',
        inputText:this.props.name,
        inputType:isRoom?'room':'box'
      }
    }else{
      state={modalDialog: true}
    }
    this.setState({modalVisible:false},()=>{
      setTimeout(()=>{
        this.setState(state);
      },10);
    });

  }

  _onDialogClick(index){
    let isRoom=this.props.ownData.get('Type')==3;
    this.setState({modalDialog:false});
    switch (index){
      case 0:
        break;

      case 1://执行删除接口
        if(isRoom){
          this.props.delRoom(this.props.ownData.get('Id'));
        }else{
          this.props.delPanel(this.props.ownData.get('Id'));
        }
        break;
    }
  }

  _showAlertDialog(){
    let isRoom=this.props.ownData.get('Type')==3;
    let title=isRoom?'删除当前配电室？':'删除当前配电柜？';
    let buttons=[{text:'取消',textColor:'#007aff'},{text:'删除',textColor:'#ff4d4d'}]
    if(this.state.modalDialog){
      return (
        <AlertDialog modalShow={this.state.modalDialog} buttons={buttons}
          title={title} onClick={index=>this._onDialogClick(index)}/>
      );
    }else{
      return null;
    }
  }

  _inputDialogClick(text,type){
    text=text.trim();
    let isRoom=type=='room';
    //TODO 重名判断
    if(text==this.props.name){
      // this._toast(isRoom?'配电柜名称重复':'配电室名称重复');
      Keyboard.dismiss();
      this.setState({modalInputDialog: false});
      // setTimeout(()=>{
      //   InteractionManager.runAfterInteractions(()=>{
      //     this._toast(isRoom?'配电室名称重复':'配电柜名称重复');
      //   });
      // },600);
      return;
    }
    this.setState({modalInputDialog: false});
    if(isRoom) {
      this.props.updateRoom(this.props.ownData.get('Id'), text);
    }else{
      this.props.updatePanel(this.props.ownData.get('Id'), text);
    }
  }

  _showInputDialog(){
    if(this.state.modalInputDialog){
      return (
        <InputDialog title={this.state.inputTitle} type={this.state.inputType} hint={this.state.hintText}
          onClick={(text,type)=>this._inputDialogClick(text,type)} inputText={this.state.inputText}
          onCancel={()=>this.setState({modalInputDialog:false})}
          modalShow={this.state.modalInputDialog}/>
      );
    }else{
      return null;
    }
  }

  _renderSeperator(sid,rid){
    let offset=this.props.data.getRowData(sid,rid).get('offset');
    return (
      <ListSeperator marginWithLeft={offset}  key={sid+rid} />
    );
  }

  renderNoPermission(){
    let toolbar=null;
    if(this.props.hasToolbar){
      toolbar=<Toolbar
        title={this.props.name}
        navIcon="back"
        onIconClicked={()=>this.props.onBack()}
        actions={[]}
        onActionSelected={[]}
      />;
    }
    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        {toolbar}
        <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
          <Text style={{fontSize: 17,color:'#888'}}>您没有这一项的操作权限，请联系系统管理员</Text>
        </View>
      </View>
    )
  }

  render() {
    if(this.props.noPermission){
      return this.renderNoPermission();
    }
    if(!this.props.isFetching&&this.props.errorMessage){
      return  (
        <View style={{flex:1,backgroundColor:'white'}}>
          {this._getToolbar()}
          <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
            <Text style={{fontSize:17,color:GRAY}}>{this.props.errorMessage}</Text>
          </View>
        </View>
      )
    }
    return (
      <View style={{flex:1,backgroundColor:'white',paddingBottom:isPhoneX()?34:0}}>
        {this._getToolbar()}
          <List
            isFetching={this.props.isFetching}
            listData={this.props.data}
            hasFilter={false}
            currentPage={1}
            renderSeperator={(sectionId,rowId)=>this._renderSeperator(sectionId,rowId)}
            sticky={false}
            totalPage={1}
            emptyText='该建筑下无配电室和设备'
            onRefresh={this.props.onRefresh}
            renderRow={(rowData,sectionId,rowId)=>this._renderRow(rowData,sectionId,rowId)}
            renderSectionHeader={(sectionData,sectionId)=>this._renderSection(sectionData,sectionId)}
          />
        {this._getActionSheet()}
        {this._showAlertDialog()}
        {this._showInputDialog()}
      </View>

    );
  }
}

DetailView.propTypes = {
  navigator:PropTypes.object,
  onBack:PropTypes.func,
  sectionData:PropTypes.object,
  pendingImageUri:PropTypes.string,
  emptyImageText:PropTypes.string,
  changeImageComplete:PropTypes.func.isRequired,
  changeImage:PropTypes.func.isRequired,
  onRowClick:PropTypes.func.isRequired,
  isFetching:PropTypes.bool.isRequired,
  data:PropTypes.object,
  canEdit:PropTypes.bool,
  hasToolbar:PropTypes.bool,
  onRefresh:PropTypes.func.isRequired,
  ownData:PropTypes.object.isRequired,
  errorMessage:PropTypes.string,
}

DetailView.defaultProps = {
  hasToolbar:true
}

var styles = StyleSheet.create({
  emptyImageContainer:{
    flex:1,
  },
  emptyImageText:{
    fontSize:17,
    marginTop:10,
    color:GRAY
  }
});
