
'use strict';
import React,{Component} from 'react';
import {
  View, Text, SectionList, RefreshControl, TouchableOpacity, FlatList,
  InteractionManager,DeviceEventEmitter,BackHandler,ScrollView,
  UIManager,Dimensions,findNodeHandle,Platform,Keyboard,Image
} from 'react-native';
import PropTypes from 'prop-types';

import Toolbar from '../Toolbar';
import List from '../List.js';
import AssetRow from './AssetRow';
import Icon from '../Icon';
import ClickableRow from '../ClickableRow';
import TouchFeedback from '../TouchFeedback';
import {GRAY, GREEN, LIST_BG} from "../../styles/color";
import immutable from 'immutable';
import Toast from "react-native-root-toast";
import SchActionSheet from '../actionsheet/SchActionSheet';
import AlertDialog from '../AlertDialog';
import Immutable from 'immutable';
import {isPhoneX} from '../../utils';
import SearchBar from '../SearchBar';
const SH=Dimensions.get('window').height;
const ANDORID_OFFSET=Platform.OS=='ios'?0:24;
const bottomNavHeight=56+isPhoneX()?34:0+24;


export default class AssetsView extends Component{
  constructor(props){
    super(props);
    this._firsetRender=true;
    if(this.props.keyword&&this.props.keyword.length>0) this._firsetRender=false;
    this.state={};
    this._scrollY=0;
    this.state={value:this.props.keyword||'',keyboardHeight:0}
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.initIndex !== this.props.initIndex){
      // console.warn('rowindex',nextProps.initIndex,'sid',this._scrollSid);
      //滚动到指定的索引
      setTimeout(()=>{
        // this.refs.flatlist.scrollToLocation({offset: 10000000, animated: true});

        InteractionManager.runAfterInteractions(()=>{
          if((nextProps.initIndex+2)*56>this._toBottom-bottomNavHeight){
            let toScrollY=(nextProps.initIndex+2)*56+bottomNavHeight-this._toBottom+this._scrollY+ANDORID_OFFSET;
            // console.warn(this._scrollY,toScrollY,this._toBottom);
            this.flatlist.scrollTo({x: 0, y: toScrollY, animated: true});
            setTimeout(()=>{
              this.flatlist.scrollTo({x: 0, y: toScrollY, animated: true});
            },500);
          }
        });
      },1500);
    }
  }

  _onScroll(e){
    this._scrollY=e.nativeEvent.contentOffset.y;
  }

  _calOffsetToBottom(e,sectionData,sid){
    UIManager.measureInWindow(findNodeHandle(e.target),(x,y,w,h)=>{
      this._toBottom=SH-(y+h);
      //这里条用最终的方法
      this.props.createBuilding(sectionData,sid);

      // let count=5;
      // if((count)*56>this._toBottom){
      //   let toScrollY=(count)*56-this._toBottom+this._scrollY+ANDORID_OFFSET;
      //   console.warn(this._scrollY,toScrollY,this._toBottom);
      //   this.refs.flatlist.scrollTo({x: 0, y: toScrollY, animated: true});
      // }
    });
  }

  _clear(disKeyboard){
    if(disKeyboard) {
      Keyboard.dismiss();
    }
    this.setState({value:''},()=>{
      this.props.doFilter('');
    });
  }

  _searchChanged(text){
    this.setState({value:text},()=>{
      this._doFilter(text);
    });
  }

  _doFilter(text){
    let lastTime=this._lastTime||0;
    let duration=(new Date().getTime()) - lastTime;
    // console.log('duration',duration);
    if(duration<500){
      //记录本次要查询的关键字
      this._lastSearchText=text;
      if(this._filterTimer) clearTimeout(this._filterTimer);
      this._filterTimer=setTimeout(()=>{
        this._doFilter(this._lastSearchText);
      },510-duration);
      return;
    }
    this._lastTime=new Date().getTime();
    this.props.doFilter(text.trim());
  }

  componentDidMount() {
    //注册监听事件
    this.actionSheetItemClickListener=DeviceEventEmitter.addListener('actionSheetItemClick',(item)=>{
      if(item.type==='Building')
        this._menuClick(item);
    })
    this._registerEvents();
    //注册监听
    InteractionManager.runAfterInteractions(()=>{
      this._back=BackHandler.addEventListener('hardwareBackPress', () => {
        if(this.state.value.length>0){
          this._clear();
          return true;
        }
        return false;
      });
    });
  }

  componentWillUnmount() {
    this.actionSheetItemClickListener.remove();
    this._unRegisterEvents();
    if(this._filterTimer) clearTimeout(this._filterTimer);
    Keyboard.dismiss();
    this._back&&this._back.remove();
  }


  _renderRow(rowData,sectionId,rowId){
    return (
      <AssetRow key={rowData?rowData.Id:rowId} rowData={rowData} onRowClick={this.props.onRowClick} rowId={rowId}
        onLongClick={(rowData,rowId)=>{
          this._showMenu(rowData,rowData.Id,this.props.section[sectionId].rowIndex);
      }}/>
    );
  }

  _renderSection(sectionData,sid){
    if(sectionData) {
      let section=sectionData;//this.props.section;
      let isFolder=section.isFolder;
      let iconType=isFolder?'icon_asset_folder':'icon_asset_expand';
      let createButton=null;
      if(this.props.canCreateBuilding){
        createButton=(
          <View style={{alignItems:'flex-end'}}>
            <TouchFeedback onPress={(e)=>{
              this._scrollSid=sid;
              // this.props.createBuilding(sectionData,sid);
              this._calOffsetToBottom(e,sectionData,sectionData.rowIndex);
            }}>
              <View style={{padding:8}}>
                <Icon type={'icon_asset_add'} color={'#888'} size={17}/>
              </View>
            </TouchFeedback>
          </View>
        );
      }

      return (
        <TouchFeedback key={`${sectionData.customerId}`} onPress={()=>{
          this.props.changeAssetExpand(sectionData.rowIndex,!isFolder);

          // if(!isFolder&&Platform.OS==='ios'&&sid===this.props.section.length-1) {
          //   setTimeout(() => {
          //     this.flatlist.scrollToEnd({animated: true});
          //   }, 1500);
          // }
        }}>
          <View style={{flex:1,height:56,flexDirection:'row',alignItems:'center',paddingHorizontal:16,backgroundColor:'#fff',
            borderColor:'#e6e6e6',borderTopWidth:1,borderBottomWidth:1,marginTop:-1}}>
            <Icon size={18} color={'#b2b2b2'} type={iconType}/>
            <Icon style={{marginHorizontal:4}} size={18} color={'#333'} type={'icon_asset_customer'}/>
            <Text numberOfLines={1} style={{fontSize:17,color:'#333',flex:1}}>{section.customerName}</Text>
            {createButton}
          </View>
        </TouchFeedback>
      );
    }else{
      return null;
    }
  }

  _getRefreshControl(){
    var refreshControl = null;
    if(this.props.onRefresh){
      var style;
      if(this.state.showRefreshControlStyle){
        style = {backgroundColor:'transparent'}
      }
      else {
        style = null;
      }
      refreshControl = (
        <RefreshControl
          style={style}
          refreshing={this.props.isFetching}
          onRefresh={this.props.onRefresh}
          tintColor={GREEN}
          title="加载中，请稍候..."
          colors={[GREEN]}
          progressBackgroundColor={'white'}
        />
      );
      // console.warn('refreshControl');
    }
    return refreshControl;
  }

  _extraUniqueKey(item,index){
    let id=item.isHeader?item.customerId:item.Id;//item.get('isHeader')?item.get('customerId'):item.get('Id');
    return `${item.Id}`;//index*1000+item;
  }

  _toast(msg){
    Toast.show(msg,{
      duration:1500
    });
  }

  _menuClick(item){
    this.setState({modalVisible:false},()=>{
      //判断是修改还是删除
      if(item.index==0){
        //跳转到修改
        this.props.doEdit(this.state.editItem);
      }else{
        setTimeout(()=>{
          this.setState({
            modalDialog:true
          })
        },20);
      }
    });

  }

  _onDialogClick(index){
    this.setState({modalDialog:false});
    switch (index){
      case 0:
        break;

      case 1://执行删除接口
        this.props.doDel(this.state.editItem);
        break;
    }
  }

  _showAlertDialog(){
    let title='删除当前建筑？';
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

  _showMenu(rowData,index,sid){
    //如果是非logbook建筑，不弹出菜单
    rowData=Immutable.fromJS(rowData);
    if(rowData.get('IsLogbook')!==1) return;
    this.setState({editItem:{row:rowData,rowId:index,sid}});
    DeviceEventEmitter.emit('showActionSheet','Building');
    // let arr=['编辑建筑','删除'].map((item,index)=>{
    //   return {title:item,select:true,index}
    // });
    // this.setState({'modalVisible':true,arrActions:arr,editItem:{row:rowData,rowId:index}});
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

  _registerEvents(){
    this._keyboardDidShowSubscription = Keyboard.addListener('keyboardDidShow', (e) => this._keyboardDidShow(e));
    this._keyboardDidHideSubscription = Keyboard.addListener('keyboardDidHide', (e) => this._keyboardDidHide(e));
  }

  _unRegisterEvents() {
    this._keyboardDidShowSubscription && this._keyboardDidShowSubscription.remove();
    this._keyboardDidHideSubscription && this._keyboardDidHideSubscription.remove();
  }

  _keyboardDidShow(e) {
    let offset=70;
    if(Platform.OS==='ios'){
      if(isPhoneX()) offset=90;
      else offset=70;
    }
    this.setState({keyboardHeight:e.endCoordinates.height-offset,showKeyboard:true});
  }

  _keyboardDidHide() {
    this.setState({keyboardHeight:0,showKeyboard:false});
  }

  render() {
    if(!this.props.isFetching && (this.props.data && this.props.data.length ===0)){
      //说明没有关联的资产，显示空数据提示
      let displayText='暂未关联任何建筑，请联系管理员';
      if(this.state.value&&this.state.value.trim().length>0){
        displayText='搜索无结果';
      }
      return(
        <View style={{flex:1,backgroundColor:'white'}}>
          <Toolbar title='资产' switchLogo={this.props.showSwitch}
             actions={[{
               title:'筛选',
               icon:require('../../images/scan/scan.png'),
               show: 'always', showWithText: false}]}
             onActionSelected={[this.props.onScanClick]}/>
          <SearchBar
            style={{marginTop:-1,backgroundColor:'#fff',borderColor:'#f2f2f2',borderBottomWidth:1}}
            value={this.state.value}
            hint={'请搜索客户或建筑'}
            showCancel={this.state.showKeyboard||this.state.value.length>0}
            onCancel={()=>this._clear(true)}
            onClear={()=>this._clear(false)}
            onChangeText={this._searchChanged.bind(this)}
          />
          <View style={{flex:1}}>
            <ScrollView
              style={{flex:1,backgroundColor:LIST_BG}}
              contentContainerStyle={{flex:1}}
              removeClippedSubviews
              scrollEventThrottle={16}
              // 指定RefreshControl组件, 用于为ScrollView提供下拉刷新功能
              refreshControl={
                <RefreshControl
                  refreshing={this.props.isFetching}
                  onRefresh={this.props.onRefresh}
                  tintColor={GREEN}
                  title="加载中，请稍候..."
                  colors={[GREEN]}
                />
              }>
              <View style={{flex: 1, justifyContent: 'center', alignItems: 'center',backgroundColor:LIST_BG}}>
                <Image
                  source={require('../../images/empty_box/empty_box.png')}
                  style={{width:55}}/>
                <Text style={{fontSize: 16, color: '#888',marginTop:8, textAlign: 'center'}}
                      numberOfLines={2}>{displayText}</Text>
              </View>
            </ScrollView>
          </View>

        </View>
      );
    }
    this._firsetRender=false;
    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <Toolbar title='资产' switchLogo={this.props.showSwitch}
         actions={[{
           title:'筛选',
           icon:require('../../images/scan/scan.png'),
           show: 'always', showWithText: false}]}
          onActionSelected={[this.props.onScanClick]}/>
        <SearchBar
          style={{marginTop:-1,backgroundColor:'#fff',borderColor:'#f2f2f2',borderBottomWidth:1}}
          value={this.state.value}
          hint={'请搜索客户或建筑'}
          showCancel={this.state.showKeyboard||this.state.value.length>0}
          onCancel={()=>this._clear(true)}
          onClear={()=>this._clear(false)}
          onChangeText={this._searchChanged.bind(this)}
        />
        <List style={{backgroundColor: LIST_BG}}
          ref='flatlist'
          setRef={ref=>this.flatlist=ref}
          renderSeperator={(sid, rid) => null}
          refreshControl={this._getRefreshControl()}
          keyExtractor={(item, index) =>this._extraUniqueKey(item,index)}
          getItemLayout={(data, index)=>({length: 56, offset: 56 * index, index})}
          scrollEventThrottle={1}
          onScroll={(e)=>this._onScroll(e)}
          sticky={false}
          isFetching={this.props.isFetching}
          listData={this.props.listData}
          hasFilter={false}
          currentPage={1}
          totalPage={1}
          onRefresh={this.props.onRefresh}
          renderRow={(rowData,sectionId,rowId)=>this._renderRow(rowData,sectionId,rowId)}
          renderSection={(sectionData,sectionId)=>this._renderSection(this.props.section[sectionId],sectionId)}
        />
        <View style={{height:0}}/>
        {this._showAlertDialog()}
      </View>
    );
  }
}

AssetsView.propTypes = {
  navigator:PropTypes.object,
  onScanClick:PropTypes.func.isRequired,
  user:PropTypes.object,
  currentPage:PropTypes.number,
  totalPage:PropTypes.number,
  hasFilter:PropTypes.bool.isRequired,
  onRowClick:PropTypes.func.isRequired,
  isFetching:PropTypes.bool.isRequired,
  // listData:PropTypes.object,
  onRefresh:PropTypes.func.isRequired,
  nextPage:PropTypes.func.isRequired,
}
