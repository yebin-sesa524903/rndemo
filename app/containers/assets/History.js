
'use strict';
import React, { Component } from 'react';
import { InteractionManager, Platform, View } from 'react-native';
import PropTypes from 'prop-types';
import { loadHistoryData, updateStepData, resetHistoryData } from '../../actions/historyAction.js';
import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';
import HistoryView from '../../components/assets/HistoryView';
import HistoryDataView from '../../components/assets/HistoryDataView';

import moment from 'moment';
import Colors from "../../utils/const/Colors";

///https://github.com/yamill/react-native-orientation/issues/411
const Orientation = require('react-native-orientation');

let _startToExit = false;

class History extends Component {
  constructor(props) {
    super(props);
    this.state = { currSegnmentIndex: 0 };
  }
  _onLeftClick() {
    if (this.props.isFetching) {
      return;
    }
    this.props.updateStepData({ 'type': 'left', 'index': this.state.currSegnmentIndex, 'isEnergyData': this.props.isEnergyData });
  }
  _onRightClick() {
    if (this.props.isFetching) {
      return;
    }
    this.props.updateStepData({ 'type': 'right', 'index': this.state.currSegnmentIndex, 'isEnergyData': this.props.isEnergyData });
  }
  _onDateSelect(date1) {
    if (this.props.isFetching) {
      return;
    }
    this.props.updateStepData({ 'type': 'center', 'index': this.state.currSegnmentIndex, 'isEnergyData': this.props.isEnergyData, 'newDate': date1 });
  }
  _indexChanged(index) {
    if (this.props.isFetching) {
      return;
    }
    this.setState({ currSegnmentIndex: index });
    this.props.updateStepData({ 'type': 'step', 'index': index, 'isEnergyData': this.props.isEnergyData });
  }
  _loadHistoryDatas(filter) {
    let endTime = moment(filter.get('EndTime')).unix();
    let startTime = moment(filter.get('StartTime')).unix();
    let step = filter.get('Step');
    let customerId = this.props.user.get('CustomerId');
    let param = {
      customerId: customerId,
      tags: [
        {
          tagId: this.props.tagId,
          tagType: 1,
        }
      ],
      startTime: startTime,
      endTime: endTime,
      step: step,
    }
    this.props.loadHistoryData(param);
  }
  _getCurrentContentView() {
    let obj = {
      isFetching: this.props.isFetching,
      data: this.props.data,
      isEnergyData: this.props.isEnergyData,
      step: this.props.filter.get('Step'),
      unit: this.props.unit
    };
    return <HistoryDataView {...obj} />;
  }
  _orientationDidChange(orientation) {
    if (Platform.OS === 'android' || _startToExit) {
      // Orientation.lockToPortrait();
      return;
    }
    if (orientation === 'LANDSCAPE') {
      //do something with landscape layout
    } else {
      //do something with portrait layout
      console.warn('history..._orientationDidChange');
      Orientation.lockToLandscape();
    }
  }
  componentDidMount() {
    Orientation.lockToLandscapeRight();//ios is here
    Orientation.addOrientationListener(this._orientationDidChange);
    // StatusBar.setHidden(true);
    InteractionManager.runAfterInteractions(() => {
      this._loadHistoryDatas(this.props.filter);

      backHelper.init(this.props.navigation, this.props.route.id, () => {
        Orientation.lockToPortrait();//when hardware back
        this.props.navigation.pop();
      });
    });

    this._gestureHandlers = {
      onStartShouldSetResponder: () => true,
      onResponderGrant: () => {
        console.warn('onResponderGrant');
      },
      onResponderTerminate: () => {
        console.warn('onResponderTerminate');
        Orientation.removeOrientationListener(this._orientationDidChange);
        // Orientation.lockToPortrait();
      },
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.filter !== nextProps.filter) {
      InteractionManager.runAfterInteractions(() => {
        this._loadHistoryDatas(nextProps.filter);
      });
    }
  }
  componentWillUnmount() {
    this.props.resetHistoryData();
    backHelper.destroy(this.props.route.id);
    Orientation.removeOrientationListener(this._orientationDidChange);
  }
  render() {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.seBgContainer }}>
        <HistoryView
          onBack={() => {
            _startToExit = true;
            Orientation.removeOrientationListener(this._orientationDidChange);
            Orientation.lockToPortrait();//when left top button back
            InteractionManager.runAfterInteractions(() => {
              this.props.navigation.pop();
            });
          }}
          name={this.props.name}
          unit={this.props.unit}
          isFetching={this.props.isFetching}
          isEnergyData={this.props.isEnergyData}
          filter={this.props.filter}
          enablePrview={this.props.enablePrview}
          enableNext={this.props.enableNext}
          currentIndex={this.state.currSegnmentIndex}
          indexChanged={(index) => { this._indexChanged(index) }}
          contentView={this._getCurrentContentView()}
          onDateChanged={(date) => this._onDateSelect(date)}
          onLeftClick={() => this._onLeftClick()}
          onRightClick={() => this._onRightClick()}
          onResponderTerminate={() => {

          }}
        />
      </View>
    )
  }
}

History.propTypes = {
  navigation: PropTypes.object,
  route: PropTypes.object,
  title: PropTypes.string,
  user: PropTypes.object,
  filter: PropTypes.object,
  data: PropTypes.object,
  enablePrview: PropTypes.bool,
  enableNext: PropTypes.bool,
  isFetching: PropTypes.bool,
  loadHistoryData: PropTypes.func,
  updateStepData: PropTypes.func,
  resetHistoryData: PropTypes.func,
  isEnergyData: PropTypes.bool,
  name: PropTypes.string,
  unit: PropTypes.string,
  tagId: PropTypes.number,
}

function mapStateToProps(state, ownProps) {
  let historyData = state.asset.historyData;
  return {
    user: state.user.get('user'),
    unit: ownProps.unit,
    isEnergyData: ownProps.unit.toLocaleLowerCase() === 'kwh',
    isFetching: historyData.get('isFetching'),
    filter: historyData.get('filter'),
    data: historyData.get('data'),
    enablePrview: historyData.get('enablePrview'),
    enableNext: historyData.get('enableNext'),
  };
}

export default connect(mapStateToProps, { loadHistoryData, updateStepData, resetHistoryData })(History);
