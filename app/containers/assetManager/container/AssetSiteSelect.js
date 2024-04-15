import React, { Component } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
// import SearchBar from "../../../components/SearchBar";
import { loadHierarchyList } from '../../alarmManager/actions';
import { localStr } from '../../../utils/Localizations/localization';
import Colors from '../../../utils/const/Colors';
import Toolbar from '../../../components/Toolbar';
import CreateTicket from '../../ticket/CreateTicket';
import Immutable from 'immutable'
class AssetSiteSelect extends Component {

  constructor(props) {
    super(props);
    this.folderMap = {}
    this.state = { value: '', data: props.hierarchyListData }
  }

  static contextTypes = {
    showSpinner: PropTypes.func,
    hideHud: PropTypes.func
  };

  componentDidMount() {
    //这里对数据进行过滤后进行显示
    let data = [];
    this.props.hierarchyListData.forEach(asset => {
      if (asset.templateType === '店' || asset.templateType === '建筑') {
        data.push(asset);
      }
    })
    this.setState({ data: data })
  }

  componentWillUnmount() {

  }

  toDetail = (item) => {
    this.props.navigation.push('PageWarpper', {
      id: 'ticket_create',
      component: CreateTicket,
      passProps: {
        site: item,
        customer: Immutable.fromJS({
          'CustomerId': this.props.user.Id,
          'CustomerName': this.props.user.Name,
        }),
        onPostingCallback: (type) => {
          this.props.callback && this.props.callback();
          this.props.navigation.pop();
        },
      }
    });


    // this.props.navigation.push('PageWarpper', {
    //   id: 'asset_range_select',
    //   component: AssetRangeSelect,
    //   passProps: {
    //     site: item,
    //     checkList: [],
    //     onSubmit: (data) => {
    //       console.log('data', data);
    //     }
    //   }
    // });

  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.seBrandNomarl }}>
        <Toolbar title={localStr('lang_ticket_select_site')} color={Colors.seBrandNomarl} borderColor={Colors.seBrandNomarl}
          onIconClicked={() => this.props.navigation.pop()} navIcon={'back'} />
        <View style={{ flex: 1, paddingHorizontal: 16, backgroundColor: Colors.seBgContainer }}>
          <FlatList
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => `${item.id}`}
            data={this.state.data}
            renderItem={({ item, index }) => this.renderRow(item)}
          />
        </View>
      </View>
    )
  }


  renderRow(data) {
    return (
      <TouchableOpacity key={data.id} style={{
        flexDirection: 'row', alignItems: 'center', height: 48, borderBottomColor: Colors.seBorderSplit,
        borderBottomWidth: 1
      }} onPress={() => this.toDetail(data)}>
        <Text numberOfLines={1} style={{ color: Colors.seTextTitle, fontSize: 18, }}>{data.name}</Text>

      </TouchableOpacity>
    )
  }
}


function mapStateToProps(state, ownProps) {
  let user = state.user;
  let hierarchyListData = state.device.deviceList.hierarchyListData || [];
  let hierarchyTreeData = state.device.deviceList.hierarchyTreeData || [];
  let hierarchyListFetching = state.device.deviceList.hierarchyListFetching;
  return {
    hierarchyListData, hierarchyTreeData, hierarchyListFetching, user
  };
}

export default connect(mapStateToProps, { loadHierarchyList })(AssetSiteSelect);
