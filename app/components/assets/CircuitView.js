import React,{Component} from 'react';
import {View,Dimensions,StyleSheet,Platform,//ViewPagerAndroid,
  SegmentedControlIOS, InteractionManager} from 'react-native';
import Toolbar from '../Toolbar';
import ViewPager from '@react-native-community/viewpager';
const ViewPagerAndroid=ViewPager;
import Text from '../Text';
import Loading from '../Loading';
import {GRAY, GREEN, TAB_BORDER} from "../../styles/color";
import SchActionSheet from '../actionsheet/SchActionSheet';
import ScrollableTabBar from './ScrollableTabBar'
import Toast from "react-native-root-toast";
import InputDialog from '../InputDialog';
import AlertDialog from '../AlertDialog';
import PropTypes from 'prop-types';

export default class CircuitView extends Component{
  constructor(props){
    super(props);
    this.state={}
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
  _pagerBarClicked(index){
    if(this.props.currentIndex !== index){
      this.props.indexChanged(index);
    }
  }
  _getTabArray(){
    return this.props.tabs;
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
          goToPage={(index) => this._pagerBarClicked(index)}/>
      );
    }
    return null;
  }
  _getView(){
    return this.props.contentView;
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
    this.setState({modalVisible:false},()=>{
      //判断是修改还是删除
      if(item.index==0){
        //跳转到修改
        this.props.doEdit();
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
        this.props.doDel();
        break;
    }
  }

  _showAlertDialog(){
    let title='删除当前回路？';
    // if(this.props.assetType=='Room') title='删除？';
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



  _showMenu(){
    let lable='编辑回路';
    let arr=[lable,'删除'].map((item,index)=>{
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
            <Text style={{fontSize:17,color:GRAY}}>{this.props.errorMessage}</Text>
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
      </View>
    );
  }
}

CircuitView.propTypes = {
  errorMessage:PropTypes.string,
}
