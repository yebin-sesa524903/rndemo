import React, { Component } from "react";
import { View, Text } from 'react-native'
import { connect } from "react-redux";
import { getSubstationList } from '../../actions/monitionAction'
import backHelper from "../../utils/backHelper";
import trackApi from "../../utils/trackApi";
import SingleSelect from "../../components/assets/AssetInfoSingleSelect";
import Toolbar from "../../components/Toolbar";
import Loading from '../../components/Loading'
import { setSubstation } from '../../actions/myAction'
class SubstationList extends Component {

  componentDidMount() {
    backHelper.init(this.props.navigator, this.props.route.id);
    trackApi.onPageBegin(this.props.route.id);
    this.props.getSubstationList();
  }

  componentWillUnmount() {
    backHelper.destroy(this.props.route.id);
    trackApi.onPageEnd(this.props.route.id);
  }

  _onBack = () => this.props.navigation.pop();

  render() {
    let title = '选择所在地点'
    if (this.props.isFetching) {
      return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          <Toolbar
            title={title}
            navIcon="back"
            noShadow={true}
            onIconClicked={this._onBack}
          />
          <Loading />
        </View>
      )
    }
    let list = [];
    if (this.props.data) {
      list = this.props.data.map(item => item.get('name')).toArray()
    }
    if (list.length === 0) {
      return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          <Toolbar
            title={title}
            navIcon="back"
            noShadow={true}
            onIconClicked={this._onBack}
          />
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 17, color: '#666' }}>{'请联系管理员分配配电所权限'}</Text>
          </View>
        </View>
      )
    }

    return (
      <SingleSelect
        navigator={this.props.navigator}
        route={this.props.route}
        dataList={list}
        onSelect={(name) => {
          let data = this.props.data.find(item => item.get('name') === name).toJS();
          if (this.props.fromJobBill) {
            this.props.setJobBillStation(data)
          }
          else {
            this.props.setSubstation(data)
          }
        }}
        onBack={() => this.props.navigation.pop()}
        title={title}
      />
    )
  }
}

function mapToState(state, ownProps) {
  let substation = state.monition.substation
  return {
    isFetching: substation.get('isFetching'),
    data: substation.get('data')
  }
}

export default connect(mapToState, { getSubstationList, setSubstation })(SubstationList)
