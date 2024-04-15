
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';
import TaskDesEditView from '../../components/ticket/TaskDesEditView';
import { ticketCreateConditionChange } from '../../actions/ticketAction';
import trackApi from '../../utils/trackApi.js';

class TicketTaskDesEdit extends Component {
  constructor(props) {
    super(props);
  }
  _save(value) {
    this.props.ticketCreateConditionChange({
      type: 'Content', value
    });
    this.props.navigation.pop();
  }
  _dataChanged(value) {
    // this.props.ticketCreateConditionChange({
    //   type:'Content',value
    // });
  }
  componentDidMount() {
    trackApi.onPageBegin(this.props.route.id);
    backHelper.init(this.props.navigation, this.props.route.id);
  }
  componentWillReceiveProps(nextProps) {
    // if(nextProps.logs !== this.props.logs){
    //   this.props.navigation.pop();
    // }
  }
  componentWillUnmount() {
    trackApi.onPageEnd(this.props.route.id);
    backHelper.destroy(this.props.route.id);
  }
  render() {
    return (
      <TaskDesEditView
        title={'任务描述'}
        content={this.props.content}
        user={null}
        isSameUser={this.props.isSameUser}
        ticketId={this.props.ticketId}
        onSave={(data) => this._save(data)}
        dataChanged={(value) => this._dataChanged(value)}
        onBack={() => this.props.navigation.pop()} />
    );
  }
}

TicketTaskDesEdit.propTypes = {
  navigation: PropTypes.object,
  route: PropTypes.object,
  user: PropTypes.object,
  content: PropTypes.string,
  title: PropTypes.string,
  saveLog: PropTypes.func,
  ticketCreateConditionChange: PropTypes.func,
  isSameUser: PropTypes.bool,
  hasAuth: PropTypes.bool,
  ticketId: PropTypes.number,
}

function mapStateToProps(state, ownProps) {
  return {}
}

export default connect(mapStateToProps, { ticketCreateConditionChange })(TicketTaskDesEdit);
