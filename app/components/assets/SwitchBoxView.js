import React,{Component} from 'react';
import {View,Text,Dimensions,Platform} from 'react-native';
import ViewPagerAndroid from '@react-native-community/viewpager';
import {connect} from 'react-redux';
import Toolbar from "../../components/Toolbar";
import {GRAY, GREEN, TAB_BORDER} from "../../styles/color";
import SchActionSheet from "../../components/actionsheet/SchActionSheet";
import AlertDialog from "../../components/AlertDialog";
import privilegeHelper from "../../utils/privilegeHelper";
import ScrollableTabBar from "./ScrollableTabBar";

export default class SwitchBoxView extends Component {

  constructor(props) {
    super(props);
    this.state={};
  }

  _onDialogClick(index){
    this.setState({modalDialog:false});
    switch (index){
      case 0:
        break;

      case 1://执行删除接口
        this.props.delete();
        break;
    }
  }

  _showAlertDialog(){
    let title='删除当前配电箱？';
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
    let label='编辑配电箱';
    let arr=[label,'删除'].map((item,index)=>{
      return {title:item,select:true,index}
    });
    this.setState({'modalVisible':true,arrActions:arr});
  }

  _menuClick(item){
    this.setState({modalVisible:false},()=>{
      //判断是修改还是删除
      if(item.index==0){
        //跳转到修改
        this.props.edit();
      }else{
        setTimeout(()=>{
          this.setState({
            modalDialog:true
          })
        },20);
      }
    });

  }

  _getActionSheet() {
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
        />
      )
    }
  }

  _pagerBarClicked(index){
    if(this.props.currentIndex !== index){
      this.props.indexChanged(index);
    }
  }

  _getTabControl(){
    let {width,height} = Dimensions.get('window');
    let array = ['配电箱信息','维护日志'];
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

  _onPageSelected(e){
    if(e.nativeEvent.position !== this.props.currentIndex){
        this.props.indexChanged(e.nativeEvent.position);
    }
  }

  _getView(){
    if(Platform.OS === 'ios'){
      return this.props.contentView;
    }
    else {
      return (
        <ViewPagerAndroid
          ref={(viewPager) => { this._viewPager = viewPager; }}
          style={{flex:1}}
          initialPage={this.props.currentIndex}
          onPageSelected={(e)=>this._onPageSelected(e)}>
          {
            ['配电箱信息','维护日志'].map((item,index)=>{
              var contentView = null;
              if(this.props.currentIndex === index){
                contentView = this.props.contentView;
              }
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

  render() {
    let actions = [];
    if (this.props.logbookPermission) {
      actions = [{title: `&#xf16f;`, show: 'always', isFontIcon: true, type: 'icon_more'}];
    }
    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <Toolbar
          title={this.props.title}
          navIcon="back"
          noShadow={true}
          onIconClicked={() => this.props.onBack()}
          actions={actions}
          onActionSelected={[() => this._showMenu()]}
        />
        {this._getTabControl()}
        {this._getView()}
        {this._getActionSheet()}
        {this._showAlertDialog()}
      </View>
    );
  }
}

