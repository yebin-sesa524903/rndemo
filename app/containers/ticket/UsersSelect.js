
'use strict';
import React, { Component } from 'react';
import {

  InteractionManager,
} from 'react-native';
import PropTypes from 'prop-types';
import ListView from 'deprecated-react-native-listview';
import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';

import { getUsersFromAssets, updateUserSelectInfo } from '../../actions/ticketAction';
import UsersSelView from '../../components/ticket/UsersSelView';
import trackApi from '../../utils/trackApi.js';
import Immutable from 'immutable';
class UsersSelect extends Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (r1, r2) => r1 !== r2,
    });
    // console.warn('data',props.data);
    // if(props.data){
    //   var obj = props.data.map((item)=>item.toArray()).toArray();
    //   // InteractionManager.runAfterInteractions(() => {
    //     this.state={dataSource:this.ds.cloneWithRowsAndSections(obj)}
    //   // });
    // }else {
    this.state = { dataSource: null };
    // }
  }
  _loadUsers(selectAssets, userMap) {
    // var Assets=[];
    // selectAssets.forEach((item)=>{
    //   Assets.push(item.get('Id'));
    // });
    let params = this.props.ticketExecutors.map((item) => item.userId);
    this.props.getUsersFromAssets({ userIds: params }, userMap);
  }
  _didRowClick(rowData) {
    this.props.updateUserSelectInfo({ type: 'select', value: rowData });
  }
  _onSave() {
    if (this.props.saveCallback) {
      this.props.saveCallback(this.props.selectUsers);
    }
    else {
      this.props.updateUserSelectInfo({ type: 'save', value: this.props.selectUsers });
    }
    this.props.navigation.pop();
  }
  _onRefresh() {
    this._loadUsers(this.props.selectAssets);
  }
  componentDidMount() {
    trackApi.onPageBegin(this.props.route.id);
    let selectUserMap = {};
    this.props.selectUsers.forEach(user => {
      selectUserMap[user.get('Id')] = user;
    });
    InteractionManager.runAfterInteractions(() => {
      this._loadUsers(this.props.selectAssets, selectUserMap);
    });
    backHelper.init(this.props.navigation, this.props.route.id);
  }
  componentWillReceiveProps(nextProps) {
    var data = nextProps.data;
    var oldData = this.props.data;
    if (data) {

      let users = data.toJSON()[0];
      let executors = this.props.ticketExecutors;
      for (let user of users) {
        for (let executor of executors) {
          if (user.userId === executor.userId) {
            user.userName = executor.userName;
          }
        }
      }

      let tempArray = Immutable.fromJS({ data: users });
      // console.warn('componentWillReceiveProps...',nextProps.isFetching,nextProps.sectionData,data);
      var obj = tempArray.map((item) => item.toArray()).toArray();
      InteractionManager.runAfterInteractions(() => {
        this.setState({
          dataSource: this.ds.cloneWithRowsAndSections(obj)
        });
      });
    }
  }
  componentWillUnmount() {
    trackApi.onPageEnd(this.props.route.id);
    backHelper.destroy(this.props.route.id);
  }
  render() {
    return (
      <UsersSelView
        title={this.props.title}
        isFetching={this.props.isFetching}
        data={this.state.dataSource}
        sectionData={this.props.sectionData}
        selectUsers={this.props.selectUsers}
        onRowClick={(rowData) => this._didRowClick(rowData)}
        onBack={() => this.props.navigation.pop()}
        onSave={() => this._onSave()}
        onRefresh={() => this._onRefresh()}
      />
    );
  }
}

UsersSelect.propTypes = {
  navigation: PropTypes.object,
  route: PropTypes.object,
  title: PropTypes.string,
  users: PropTypes.object,
  ticketExecutors: PropTypes.object,
  isFetching: PropTypes.bool.isRequired,
  data: PropTypes.object,
  sectionData: PropTypes.object,
  selectUsers: PropTypes.object,
  selectAssets: PropTypes.object,
  getUsersFromAssets: PropTypes.func,
  updateUserSelectInfo: PropTypes.func,
  startTime: PropTypes.string,
  endTime: PropTypes.string,
}

function mapStateToProps(state, ownProps) {
  var users = state.ticket.users;
  var data = users.get('data'),
    sectionData = users.get('sectionData'),
    isFetching = users.get('isFetching'),
    selectUsers = users.get('selectUsers'),
    selectAssets = ownProps.selectAssets;
  return {
    isFetching,
    data,
    sectionData,
    selectUsers,
    selectAssets,
  };
}

export default connect(mapStateToProps, { getUsersFromAssets, updateUserSelectInfo })(UsersSelect);
