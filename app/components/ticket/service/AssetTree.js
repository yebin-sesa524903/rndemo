import React,{Component} from "react";
import {connect} from 'react-redux';
import {View, Text, ScrollView,FlatList} from 'react-native';
import {GREEN, LIST_BG} from "../../../styles/color";
import Toolbar from "../../Toolbar";
import TouchFeedback from "../../TouchFeedback";
import {serviceTicketLoadHierarchy,serviceTicketTreeExpand,serviceTicketLoadCacheHierarchy}
  from '../../../actions/ticketAction';
import trackApi from "../../../utils/trackApi";
import backHelper from "../../../utils/backHelper";
import Loading from '../../Loading';
import Icon from "../../Icon";

class AssetTree extends Component {

  constructor(props) {
    super(props);
    this.state={
      data:props.data
    };
  }

  componentDidMount() {
    trackApi.onPageBegin(this.props.route.id);
    backHelper.init(this.props.navigator,this.props.route.id);
    this._loadTree();
  }

  _loadTree() {
    if(isConnected()) {
      this.props.serviceTicketLoadHierarchy(this.props.userId,this.props.assetId);
    }else {
      //载入离线tree
      if(this.props.serviceTicket && this.props.serviceTicket.HierarchyList){
        this.props.serviceTicketLoadCacheHierarchy(this.props.serviceTicket.HierarchyList)
      }else {
        this.props.serviceTicketLoadHierarchy(this.props.userId,this.props.assetId);
      }
    }
  }

  componentWillUnmount() {
    trackApi.onPageEnd(this.props.route.id);
    backHelper.destroy(this.props.route.id);
  }

  _renderItem(item) {
    let foldView = (
      <View style={{width:16}}/>
    )
    let ml = (item.rowLevel -2) * 20 + 16;

    if(item.Children && item.Children.length > 0) {
      foldView = (
        <TouchFeedback onPress={()=>this.props.serviceTicketTreeExpand(item)}>
          <View style={{width:32,height:56,marginLeft:-16,paddingLeft:16,
            alignItems:'center',justifyContent:'center'}}>
            <Icon type={item.rowExpand ? 'icon_asset_expand': 'icon_asset_folder'} color={'#888'} size={16}/>
          </View>
        </TouchFeedback>
      )
    }
    let iconType = ['','','icon_building','icon_room',item.IsAsset?'icon_panel':'icon_panel_box'][item.Type];
    //新增了三种图标类型：母线系统，功能单元组，插件箱
    let subType=item.SubType;
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
    let enable = item.Type === 3 || item.Type === 4;
    return (
      <TouchFeedback enabled={enable} onPress={()=>this._submit(item)}>
        <View style={{height:56,alignItems:'center',backgroundColor:'#fff',paddingHorizontal:16,
          paddingLeft:ml,flexDirection:'row',borderBottomWidth:1,borderBottomColor:'#e6e6e6'}}>
          {foldView}
          <Icon style={{marginHorizontal:4}} type={iconType} color={'#333'} size={16}/>
          <Text numberOfLines={1} style={{fontSize:17,color:'#333',flex:1}}>{item.Name}</Text>
        </View>
      </TouchFeedback>
    )
  }

  _submit(row) {
    let path=[];
    let step = row;
    while(step) {
      path.unshift(step.Name);
      step = step.rowParent;
    }
    this.props.submit(path,row.Id);
  }

  render() {
    let contentView = null;
    if(this.props.isFetching || (!this.props.data && !this.props.error)) {
      contentView = <Loading/>
    } else {
      if(this.props.data) {
        contentView = (
          <FlatList
            keyExtractor={(item, index) => `${index}-${item.Id}`}
            data={this.props.data}
            renderItem={({item,index})=>this._renderItem(item)}
          />
        );
      }
      if(this.props.error) {
        contentView = (
          <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
            <Text style={{fontSize:17,color:'#888'}}>{this.props.error}</Text>
          </View>
        )
      }
    }
    return (
      <View style={{flex:1, backgroundColor:LIST_BG}}>
        <Toolbar
          title={'发现位置'}
          navIcon="back"
          noShadow={true}
          onIconClicked={()=>this.props.onBack()}
        />
        <Text style={{fontSize:14,color:'#888',margin:16}}>
          请选配电室或配电柜节点
        </Text>
        {contentView}
      </View>
    )
  }
}

function mapStateToProps(state,ownProps) {
  let user = state.user;
  let tree = state.ticket.serviceAssetTree;
  let serviceTicket = state.ticket.serviceTicket.get('data');
  return {
    isFetching:tree.get('isFetching'),
    error:tree.get('errorMessage'),
    data:tree.get('data'),
    userId:user.getIn(['user','Id']),
    serviceTicket
  }
}

export default connect(mapStateToProps,{serviceTicketLoadHierarchy,serviceTicketTreeExpand,
  serviceTicketLoadCacheHierarchy})(AssetTree);
