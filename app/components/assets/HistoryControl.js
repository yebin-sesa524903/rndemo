'use strict'
import React, { Component } from 'react';

import {
  View,
  StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';

import Text from '../Text';
import { GRAY, LINE_HISTORY } from '../../styles/color.js';
import IconButton from '../IconButton.js';
import Button from '../Button.js';
import moment from 'moment';
import { stepValue } from "../../reducers/assets/historyReducer";
import Colors from "../../utils/const/Colors";

export default class HistoryControl extends Component {
  constructor(props) {
    super(props);
  }
  _updateTimeDescrip() {
    // console.warn('_updateTimeDescrip...',this.props.filter);
    var StartTime = this.props.filter.get('StartTime');
    var EndTime = this.props.filter.get('EndTime');
    var step = this.props.filter.get('Step');
    if (step === stepValue.day) {
      return StartTime.format("YYYY年MM月DD日");
    } else if (step === stepValue.hour) {
      return `${StartTime.format("YYYY年MM月DD日 HH:mm")}~${EndTime.format("HH:mm")}`;
    } else if (step === stepValue.week) {
      let tempEndT = moment(EndTime)
      return `${StartTime.format("YYYY年MM月DD日")}~${tempEndT.format("MM月DD日")}`;
    } else if (step === stepValue.month) {
      return `${StartTime.format("YYYY年MM月")}`;
    } else if (step === stepValue.year) {
      return `${StartTime.format("YYYY年")}`;
    }
  }
  render() {
    var { enablePrview, enableNext } = this.props;
    return (
      <View style={styles.rowStyle}>
        <IconButton
          style={{ width: 30 }}
          iconType="icon_arrow_left"
          normalColor={Colors.seTextSecondary}
          disableColor={Colors.seDisabledColor}
          onClick={() => this.props.onLeftClick()}
          disabled={!enablePrview} />
        <Button
          style={[{ backgroundColor: 'transparent' }]}
          textStyle={styles.titleText}
          text={this._updateTimeDescrip()}
          disabled={!this.props.enableDatePicker}
          onClick={() => this.props.onDateClick()} />
        <IconButton
          style={{ width: 30 }}
          iconType="icon_arrow_right"
          normalColor={Colors.seTextSecondary}
          disableColor={Colors.seDisabledColor}
          onClick={() => this.props.onRightClick()}
          disabled={!enableNext} />
      </View>
    );
  }
}

HistoryControl.propTypes = {
  isEnergyData: PropTypes.bool,
  onLeftClick: PropTypes.func.isRequired,
  onRightClick: PropTypes.func.isRequired,
  onDateClick: PropTypes.func.isRequired,
  enablePrview: PropTypes.bool,
  enableNext: PropTypes.bool,
  enableDatePicker: PropTypes.bool,
  filter: PropTypes.object,
}

HistoryControl.defaultProps = {
  enableDatePicker: true,
}

const styles = global.amStyleProxy(() => StyleSheet.create({
  rowStyle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 16,
    color: Colors.seTextPrimary,
    // flex:1,
    // backgroundColor:'white',
  },
}));
