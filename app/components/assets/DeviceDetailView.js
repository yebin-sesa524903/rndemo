
'use strict';
import React,{Component} from 'react';
import {
  View,
  Platform,
  Dimensions,
  //ViewPagerAndroid,
  SegmentedControlIOS, InteractionManager
} from 'react-native';
import PropTypes from 'prop-types';
import ViewPager from '@react-native-community/viewpager';
const ViewPagerAndroid=ViewPager;
import Toolbar from '../Toolbar';
import Text from '../Text';
import Loading from '../Loading';
// import SimpleRow from './SimpleRow';
// import NetworkImage from '../NetworkImage.js';
import PagerBar from '../PagerBar.js';
import {GREEN,TAB_BORDER,GRAY} from '../../styles/color.js';
// import ViewPager from '../ViewPager.android.js';
import SchActionSheet from '../actionsheet/SchActionSheet';
import ScrollableTabBar from './ScrollableTabBar'
import Toast from "react-native-root-toast";
import InputDialog from '../InputDialog';
import AlertDialog from '../AlertDialog';

import {Keyboard} from 'react-native';

export default class DeviceDetailView extends Component{
  constructor(props){
    super(props);
    // console.warn('DeviceDetailView',props);
    this.state={};
  }
  _tabChanged(event){
    // console.warn('_tabChanged',event.nativeEvent.selectedSegmentIndex);
    this.props.indexChanged(event.nativeEvent.selectedSegmentIndex);
  }
  _onPageSelected(e){
    if(e.nativeEvent.position !== this.props.currentIndex){
      this.props.indexChanged(e.nativeEvent.position);
    }
  }
  _pagerBarClicked(index,tabName){
    // console.warn('index',index);
    if(this.props.currentIndex !== index){
      this.props.indexChanged(index,tabName);
    }
  }
  _getTabArray(){
    // console.warn('deviceData',this.props.deviceData);
    return this.props.tabArray;
  }
  _getTabControl(){
    var {width,height} = Dimensions.get('window');
    var array = this._getTabArray();
    if(array.length>1) {
      return (
        <ScrollableTabBar
          barStyle={{
            borderBottomWidth: 1,
            borderColor: TAB_BORDER,
          }}
          activeTextColor={GREEN}
          underlineStyle={{
            position: 'absolute',
            height: 3,
            backgroundColor: GREEN,
            bottom: 0,
          }}
          tabStyle={{
            height: 43,
            alignItems: 'center',
            justifyContent: 'center',
            paddingLeft: 10,
            paddingRight: 10,
          }}
          textStyle={{
            fontSize: 15,
          }}
          inactiveTextColor={'#353535'}
          containerWidth={width > height ? height : width}
          tabs={array}
          activeTab={this.props.currentIndex}
          scrollValue={{'_value': this.props.currentIndex}}
          goToPage={(index) => this._pagerBarClicked(index,array[index])}/>
      );
    }
    return null;
  }
  _getView(){
    if(!this.props.deviceData){
      return (
        <Loading />
      )
    }
    if(Platform.OS === 'ios'){
      return this.props.contentView;
    }
    else {
      return (
        <ViewPagerAndroid
          ref={(viewPager) => { this._viewPager = viewPager; }}
          style={{flex:1}}
          initialPage={this.props.currentIndex}
          onPageSelected={(e)=>this._onPageSelected(e)}
        >
        {
          this._getTabArray().map((item,index)=>{
            var contentView = null;
            if(this.props.currentIndex === index){
              contentView = this.props.contentView;
              // console.warn('contentView',contentView,index,this.props.currentIndex);
            }
            // console.warn('contentView',contentView);
            return (
              <View key={index} style={{flex:1}}>
              {
                contentView
              }
              </View>
            )
          })
        }
      </ViewPagerAndroid>
      )
    }
  }
  componentWillReceiveProps(nextProps) {
    if(nextProps.currentIndex !== this.props.currentIndex){
      if(this._viewPager){
        this._viewPager.setPage(nextProps.currentIndex);
      }
    }
  }

  _toast(msg){
    Toast.show(msg,{
      duration:1500
    });
  }

  _menuClick(item){
    // let state={};
    // if(item.index==0){
    //   state={
    //     modalInputDialog:true,
    //     inputTitle:'编辑设备名称',
    //     hintText:'请输入设备名称',
    //     inputText:this.props.title,
    //     inputType:'device'
    //   }
    // }else{
    //   state={modalDialog: true}
    // }
    this.setState({modalVisible:false},()=>{
      setTimeout(()=>{
        // this.setState(state);
        if(item.index==0){
          this.props.editName();
        }else{
          this.setState({modalDialog: true});
        }
      },10);
    });

  }

  _onDialogClick(index){
    this.setState({modalDialog:false});
    switch (index){
      case 0:
        break;

      case 1://执行删除接口
        this.props.delDevice();
        break;
    }
  }

  _showAlertDialog(){
    let title='删除当前设备？';
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
    //TODO 重名判断
    if(text==this.props.title){
      Keyboard.dismiss();
      this.setState({modalInputDialog: false});
      // setTimeout(()=>{
      //   InteractionManager.runAfterInteractions(()=>{
      //     this._toast('设备名称重复');
      //   });
      // },600);
      return;
    }
    this.setState({modalInputDialog: false});
    this.props.updateDevice(text);
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

  _showMenu(){
    let arr=['编辑设备','删除'].map((item,index)=>{
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
  // _menuClick(item){
  //   this.setState({
  //     'modalVisible':false
  //   },()=>{
  //     setTimeout(()=>{
  //       console.log('click...',item);
  //     },100);
  //   })
  // }


  render() {
    let actions = [];
    if(this.props.logbookPermission){
      actions=[{title:`&#xf16f;`,show:'always',isFontIcon:true,type:'icon_more'}];
    }
    if(this.props.errorMessage){
      return  (
        <View style={{flex:1,backgroundColor:'white'}}>
          <Toolbar
            title={this.props.title}
            navIcon="back"
            noShadow={true}
            onIconClicked={()=>this.props.onBack()}
          />
          <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
            <Text style={{fontSize:17,color:GRAY,textAlign:'center',lineHeight:30,}}>{this.props.errorMessage}</Text>
          </View>
        </View>
      )
    }
    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <Toolbar
          title={this.props.title}
          navIcon="back"
          noShadow={true}
          onIconClicked={()=>this.props.onBack()}
          actions={actions}
          onActionSelected={[()=>this._showMenu()]}
        />
        {this._getTabControl()}
        {this._getView()}
        {this._getActionSheet()}
        {this._showAlertDialog()}
        {this._showInputDialog()}
      </View>
    );
  }
}

DeviceDetailView.propTypes = {
  navigator:PropTypes.object,
  onBack:PropTypes.func.isRequired,
  contentView:PropTypes.object,
  indexChanged:PropTypes.func.isRequired,
  currentIndex:PropTypes.number.isRequired,
  hasRealtime:PropTypes.bool.isRequired,
  hasRuntime:PropTypes.bool.isRequired,
  deviceData:PropTypes.object,
  title:PropTypes.string.isRequired,
  errorMessage:PropTypes.string,
}
