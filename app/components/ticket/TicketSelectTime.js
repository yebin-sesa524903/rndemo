
'use strict';
import React, { Component } from 'react';

import {
  View,
  Text,

  Alert
} from 'react-native';
import ListView from 'deprecated-react-native-listview';
import Toolbar from '../Toolbar';
import TouchFeedback from '../TouchFeedback';
import Icon from '../Icon';

import moment from 'moment';
import DateTimePicker from 'react-native-modal-datetime-picker';
import backHelper from '../../utils/backHelper';

import Toast from 'react-native-root-toast';

export default class TicketSelectTime extends Component {
  constructor(props) {
    super(props);
    let { status, startTime, endTime } = this.props;
    //判断格式
    let showHours = false;
    let mStart = moment(startTime);
    let mEnd = moment(endTime);
    if (mStart.hours() > 0 || mStart.minutes() > 0 || mEnd.hours() > 0 || mEnd.minutes() > 0) {
      showHours = true;
      if (mStart.format('HH:mm') === '00:00' && mEnd.format('HH:mm') === '23:59') {
        showHours = false;
      }
    }
    // showHours=true;
    this.state = { showHours, mStart, mEnd, canEditStart: status < 2 || status === 5 };
  }

  componentDidMount() {
    backHelper.init(this.props.navigator, this.props.route.id);
  }

  componentWillUnmount() {
    backHelper.destroy(this.props.route.id);
  }

  _renderRow(title, value, enable, cb) {
    var iconRight = (<Icon type="arrow_right" color="#888" size={14} />);
    if (!enable) {
      iconRight = null;
    }
    return (
      <TouchFeedback enabled={enable} onPress={() => cb()}>
        <View style={{
          flexDirection: 'row', height: 56, marginLeft: 16, paddingRight: 16, alignItems: 'center',
          borderBottomColor: '#e6e6e6', borderBottomWidth: 1
        }}>
          <Text style={{ fontSize: 17, color: '#333', flex: 1 }}>{title}</Text>
          <Text style={{ fontSize: 17, color: '#888', marginRight: 6 }}>{value}</Text>
          {iconRight}
        </View>
      </TouchFeedback>
    )
  }

  _renderPickerView() {
    return (
      <DateTimePicker
        is24Hour={true}
        titleIOS={'选择日期'}
        headerTextIOS={'选择日期'}
        titleStyle={{ fontSize: 17, color: '#333' }}
        cancelTextIOS={'取消'}
        confirmTextIOS={'确定'}
        mode={this.state.showHours ? 'datetime' : 'date'}
        datePickerModeAndroid={'spinner'}
        date={this._getDateTime()}
        onDateChange={(date) => {
          if (this.state.type === 'start') {
            if (date.getTime() <= this.state.mEnd.toDate().getTime()) {
              this.setState({
                mStartTmp: moment(date),
                // modalVisible: false
              })
            }

          } else {
            if (date.getTime() >= this.state.mStart.toDate().getTime()) {
              this.setState({
                mEndTmp: moment(date),
                // modalVisible: false
              })
            }
          }
        }}
        isVisible={this.state.modalVisible}
        onConfirm={(date) => {
          if (this.state.type === 'start') {
            //判断开始时间不能晚于结束时间
            if (date.getTime() > this.state.mEnd.toDate().getTime()) {
              this.setState({
                modalVisible: false
              }, () => {
                Toast.show('开始时间不能晚于结束时间', {
                  duration: Toast.durations.LONG,
                  position: Toast.positions.BOTTOM,
                });
              });
              return;
            }

            this.setState({
              mStart: moment(date),
              modalVisible: false
            })
          } else {
            //判断结束数据不能早于开始时间
            if (date.getTime() < this.state.mStart.toDate().getTime()) {
              this.setState({
                modalVisible: false
              }, () => {
                Toast.show('开始时间不能晚于结束时间', {
                  duration: Toast.durations.LONG,
                  position: Toast.positions.BOTTOM,
                });
              });
              return;
            }
            this.setState({
              mEnd: moment(date),
              modalVisible: false
            })
          }
        }}
        onCancel={() => {
          this.setState({ modalVisible: false })
        }}
      />
    )
  }

  _getDateTime() {
    let time = null;
    if (this.state.type === 'start') {
      time = this.state.mStartTmp || this.state.mStart;
    } else {
      time = this.state.mEndTmp || this.state.mEnd;
    }
    if (this.state.showHours) {
      return moment(time.format('YYYY-MM-DD HH:mm')).toDate();
    } else {
      return moment(time.format('YYYY-MM-DD')).toDate();
    }
  }

  _getFormatTime(time) {
    if (this.state.showHours) {
      return time.format('YYYY-MM-DD HH:mm')
    } else {
      return time.format('YYYY-MM-DD');
    }
  }

  _fixBug() {
    setTimeout(() => { this.setState({}) }, 10);
  }

  render() {

    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <Toolbar
          title={this.props.title}
          navIcon="back"
          actions={[{ title: '完成' }]}
          onActionSelected={[() => {
            let format = 'YYYY-MM-DD';
            if (this.state.showHours) format = 'YYYY-MM-DD HH:mm';
            this.props.onChangeDate(this.state.mStart.format(format), this.state.mEnd.format(format));
            this.props.navigation.pop();
          }]}

          onIconClicked={this.props.onBack} />
        {this._renderRow('开始时间', this._getFormatTime(this.state.mStart), this.state.canEditStart, () => {
          this.setState({
            modalVisible: true,
            type: 'start',
            mStartTmp: this.state.mStart
          })
          this._fixBug();
        })}
        {this._renderRow('结束时间', this._getFormatTime(this.state.mEnd), true, () => {
          this.setState({
            modalVisible: true,
            type: 'end',
            mEndTmp: this.state.mEnd
          })
          this._fixBug();
        })}
        {this._renderPickerView()}
      </View>
    );
  }
}
