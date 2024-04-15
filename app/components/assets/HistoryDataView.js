
'use strict';
import React, { Component } from 'react';

import {
  View,
  Dimensions,
  Platform,
} from 'react-native';
import PropTypes from 'prop-types';

import moment from 'moment';
import Loading from '../Loading';
import Immutable from 'immutable';
import Text from '../Text';
import utils from '../../utils/unit.js';
import { isPhoneX } from '../../utils';
// import {

import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryLine,
  VictoryScatter,
  VictoryTooltip,
  VictoryVoronoiContainer,
  VictoryCursorContainer,
  VictoryLabel
} from "victory-native";
import { Rect, Text as Text2 } from "react-native-svg";
import { stepValue } from "../../reducers/assets/historyReducer";
import Colors from "../../utils/const/Colors";
export default class HistoryDataView extends Component {
  constructor(props) {
    super(props);
    this.state = { currScrollIndex: -1 }
    this._alreadyShowMaxPointInDay = false;
    this._alreadyShowMinPointInDay = true;
  }
  _checkShowXTickes(index, isInsert, time, isError, isErrOnStep) {
    // console.warn('_checkShowXTickes',index,isInsert,isError);
    var objTime = moment(1000 * time).subtract(0, 'h');
    var stepIndex = 0;
    if (this.props.step === stepValue.day && !this.props.isEnergyData) {
      // stepIndex=12;
      // var points=[6,18,30,42,54,66,78,90,102];
      var arrTimes = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00','24:00'];
      var strTime = this._getXTickesFormat(time, index);
      return arrTimes.indexOf(strTime) !== -1 && !isInsert;
      // return index%stepIndex===0&&!isInsert;
      // return points.indexOf(index)!==-1&&!isInsert&&!isError;
    } else if (this.props.step === stepValue.hour && !this.props.isEnergyData) {//hour
      stepIndex = 1;
      return index % stepIndex === 0 && !isInsert;
    } else if (this.props.step === stepValue.day && this.props.isEnergyData) {
      stepIndex = 3;
      return (objTime.get('hour') % stepIndex === 0) && !isInsert && !isError;
    } else if (this.props.step === stepValue.week && this.props.isEnergyData) {
      return !isInsert && !isError;
    } else if (this.props.step === stepValue.month && this.props.isEnergyData) {
      // stepIndex=7;
      return !isInsert && !isError;///(index-1)%stepIndex===0&&!isInsert&&!isError;
    } else if (this.props.step === stepValue.year && this.props.isEnergyData) {
      return !isInsert && !isError;
    }
  }
  _getXTickesFormat(time, x, size) {
    let objTime = moment(1000 * time).subtract(0, 'h');
    if (this.props.step === stepValue.day && !this.props.isEnergyData) {
      let strTime = objTime.format("HH:mm");
      if ((x > 23 && strTime === '00:00')) {
        return '24:00';
      }
      return strTime;
    } else if (this.props.step === stepValue.hour && !this.props.isEnergyData) {
      return objTime.format("HH:mm");
    } else if (this.props.step === stepValue.day && this.props.isEnergyData) {
      let formatTime = objTime.format("HH:mm");
      if (x > 24 && formatTime.indexOf('00:00')> -1){
        return '24:00'
      }
      return objTime.format("HH:mm");
    } else if (this.props.step === stepValue.week && this.props.isEnergyData) {
      return objTime.format("MM/DD");
    } else if (this.props.step === stepValue.month && this.props.isEnergyData) {
      return objTime.format("MM/DD");
    } else if (this.props.step === stepValue.year && this.props.isEnergyData) {
      return objTime.format("MM");
    }
  }
  _getToFixedValue(value) {
    if (Math.abs(value) < 10) {
      value = utils.fillZeroAfterPointWithRound(value, 2);
    } else {
      value = utils.fillZeroAfterPointWithRound(value, 1);
    }
    return value;
  }
  _getYLabelValues(yValues, maxValue, minValue) {
    var yDayValues = [];
    if (this.props.step === stepValue.day && !this.props.isEnergyData) {
      // console.warn('aaaa',maxValue,minValue);
      var isFindedMax = false;
      var isFindedMin = true;//Rock not need
      yValues.forEach((item) => {
        if (item.value === maxValue && !isFindedMax) {
          yDayValues.push(this._getToFixedValue(maxValue));
          isFindedMax = true;
        } else if (item.value === minValue && !isFindedMin) {
          yDayValues.push(this._getToFixedValue(minValue));
          isFindedMin = true;
        } else if (item.isError) {
          yDayValues.push(this._getToFixedValue(item.value));
        } else {
          yDayValues.push('');
        }
      });
    } else if (this.props.step === stepValue.hour && !this.props.isEnergyData) {
      yValues.forEach((item) => {
        if (item.isError) {
          yDayValues.push(this._getToFixedValue(item.value));
        } else {
          yDayValues.push(item.value || item.value === 0 ? this._getToFixedValue(item.value) : item.value);
        }
      });
    }
    return yDayValues;
  }
  _getBarWidth() {
    if (this.props.step === stepValue.day && !this.props.isEnergyData) {
      return 0;
    } else if (this.props.step === stepValue.hour && !this.props.isEnergyData) {
      return 0;
    } else if (this.props.step === stepValue.day && this.props.isEnergyData) {
      return 18;
    } else if (this.props.step === stepValue.week && this.props.isEnergyData) {
      return 50;
    } else if (this.props.step === stepValue.month && this.props.isEnergyData) {
      return 45;
    } else if (this.props.step === stepValue.year && this.props.isEnergyData) {
      return 34;
    }
  }
  _unshiftXItems(arrItems) {
    let item = arrItems.get(0);
    let item2 = arrItems.get(0);
    if (arrItems.toJSON().length > 23){
      item2 = arrItems.get(23);
    }
    if (this.props.step === stepValue.day && !this.props.isEnergyData) {
      arrItems = arrItems.unshift(Immutable.fromJS({ 'time': item.get('time'), 'value': null, 'isInsert': true }));
      arrItems = arrItems.unshift(Immutable.fromJS({ 'time': item.get('time'), 'value': null, 'isInsert': true }));
      ///天最后返回的 时间 是23:00; 这里加一个占位点 在最后一个点的基础上加一个小时 24:00
      arrItems = arrItems.push(Immutable.fromJS({ 'time': moment(item2.get('time')* 1000).add(1, 'h')*0.001, 'value': null, 'isInsert': false }));
      arrItems = arrItems.push(Immutable.fromJS({ 'time': item2.get('time'), 'value': null, 'isInsert': true }));
    } else if (this.props.step === stepValue.hour && !this.props.isEnergyData) {
      arrItems = arrItems.unshift(Immutable.fromJS({ 'time': item.get('time'), 'value': null, 'isInsert': true }));
      arrItems = arrItems.push(Immutable.fromJS({ 'time': item.get('time'), 'value': null, 'isInsert': true }));
    } else if (this.props.step === stepValue.day && this.props.isEnergyData) {
      arrItems = arrItems.push(Immutable.fromJS({ 'time': moment(item2.get('time')* 1000).add(1, 'h')*0.001, 'value': null, 'isInsert': false }));
      arrItems = arrItems.push(Immutable.fromJS({ 'time': item.get('time'), 'value': null, 'isInsert': true }));
    } else if (this.props.step === stepValue.week && this.props.isEnergyData) {
      arrItems = arrItems.push(Immutable.fromJS({ 'time': item.get('time'), 'value': null, 'isInsert': true }));
    } else if (this.props.step === stepValue.month && this.props.isEnergyData) {

      arrItems = arrItems.push(Immutable.fromJS({ 'time': item.get('time'), 'value': null, 'isInsert': true }));
    } else if (this.props.step === stepValue.year && this.props.isEnergyData) {

      arrItems = arrItems.push(Immutable.fromJS({ 'time': item.get('time'), 'value': null, 'isInsert': true }));
    }

    return arrItems;
  }
  _reCalculateMaxMinValue(maxValue, minValue) {
    var yInterval = ((maxValue - minValue) / 5.0);
    if (maxValue < 0) {
      // maxValue = maxValue + yInterval;
    } else {
      if (minValue < 0) {
        maxValue = maxValue / 0.7;
      } else
        maxValue = maxValue / 0.7;//0.8;
    }
    yInterval = ((maxValue - minValue) / 5.0);
    if (minValue < 0) {
      minValue = minValue - yInterval;
    } else {
      minValue = 0;
    }
    yInterval = ((maxValue - minValue) / 5.0);
    if (maxValue < 0) {
      yInterval = ((maxValue - minValue) / 5.0);
    }
    if (yInterval > 2) {
      // yInterval = [self changeFloatToAccuracy:yInterval with:AccuracyTypeTen];
    }
    if (maxValue === 0 && minValue === 0) {
      maxValue = 500;
      yInterval = ((maxValue - minValue) / 5.0);
    } else if (maxValue === minValue) {
      maxValue = maxValue + 0.4 * 3;
      minValue = minValue - 0.6 * 3;
      yInterval = 0.199;
      // yInterval = [self changeFloatToAccuracy:yInterval with:AccuracyTypeThou];
    } else if (maxValue - minValue < 0.001) {
      maxValue = maxValue + 1;
      yInterval = 0.199;
    } else if ((maxValue - minValue < 3) && !this.props.isEnergyData) {
      for (var i = 0; i < 1000; i++) {
        maxValue = maxValue + yInterval;
        minValue = minValue - yInterval;
        yInterval = ((maxValue - minValue) / 5.0);
        if (maxValue - minValue >= 3 && maxValue > 0) {
          // console.warn('maxValue - minValue < 3',maxValue - minValue,yInterval);
          break;
        }
      }
    }
    return { maxRange: maxValue, minRange: minValue };
  }
  _getPlotChar(datas) {
    if (!this.props.isEnergyData) {
      return (
        <VictoryLine
          style={{
            data: {
              stroke: Colors.seBrandNomarl,
              strokeWidth: 2,
            },
            labels: { fontSize: 12 }
          }}
          data={datas} />
      );
    }
    let otherData = {};
    if (String(this.props.unit || '').toLocaleLowerCase() === 'kwh') {
      otherData = {
        labels: (datum) => {
          let y = null;
          if (datum.datum) y =  datum.datum.y;
          if (y === null || y === undefined) y = datum._y;
          return `${(y === null || y === undefined) ? ' 无数据 ' : this._getToFixedValue(y)}`
        },
        labelComponent: <VictoryTooltip minWidth={70} constrainToVisibleArea style={{ fill: Colors.seBrandNomarl }} flyoutStyle={{ strokeWidth: 0.5, stroke: Colors.seDisabledBg }} />
      }
    }
    return (
      <VictoryBar
        data={datas}
        {...otherData}
        style={{
          data: {
            fill: (value) => {
              return value.y === null ? 'transparent' : Colors.seBrandNomarl;
            },
            width: this._getBarWidth()
          }
        }}
      />
    );
  }
  _getPlotScatter(datas, arrPointsText, maxValue, minValue) {
    if (!this.props.isEnergyData) {
      return (
        <VictoryScatter
          standalone={false}
          style={{
            data: {
              fill: (data) => {
                // console.warn('aaaa',data);
                if (data.errPoint) {
                  return 'red';
                }
                return Colors.seBrandNomarl;
              }
            },
            labels: {
              fontFamily: '',
              fill: (data) => {
                if (data.errPoint) {
                  return 'red';
                }
                return Colors.seTextPrimary;
              },
              backgroundColor: Colors.seDisabledBg,
              fontSize: 12,
              width: 100,
              height: 40,
              padding: 10,
            }
          }}
          size={(data) => {
            if (!data.y && data.y !== 0) {
              return 0;
            } else {
              if ((data.y === maxValue && !this._alreadyShowMaxPointInDay) || this.props.step === stepValue.day) {
                this._alreadyShowMaxPointInDay = true;
                return 4;
              } else if ((data.y === minValue && !this._alreadyShowMinPointInDay) || this.props.step === stepValue.day) {
                this._alreadyShowMinPointInDay = true;
                return 4;
              } else if (data.errPoint) {
                return 4;
              }
              else {
                return 1;
              }
            }
          }}
          labels={arrPointsText}
          data={datas}
        />
      );
    }
    return null;
  }
  _getNoDatasView() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 17, color: Colors.seTextPrimary }}>{`此时间段内无${this.props.isEnergyData ? '能耗数据' : '历史数据'}`}</Text>
      </View>
    );
  }
  _formatNumber(v, digit) {
    if (v.indexOf('.') >= 0) {
      return Number(v).toFixed(digit);
      // return unit.toFixed(Number(v),digit);
    }
    else {
      if (v >= 1000 && v < 1000000) {
        return (Number(v) / 1000.0) + 'k';
      } else if (v >= 1000000 && v < 1000000000) {
        return (Number(v) / 1000000.0) + 'm';
      }
      return v;
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.data !== nextProps.data || this.props.isFetching !== nextProps.isFetching ||
      this.state.currScrollIndex !== nextState.currScrollIndex) {
      return true;
    }
    return false;
  }
  render() {
    // console.warn('TicketSubView render listData...',this.props.isFetching,this.props.data);
    var allLineDatas = this.props.data;
    if (this.props.isFetching) {
      return (<Loading />);
    } else {
      if (!allLineDatas || allLineDatas.length === 0) {
        return this._getNoDatasView();
      }
    }
    var datas = [];
    var tickesIndex = [];
    // var yValues=[];
    var yNotFixedValues = [];
    var maxValue = 0;
    var minValue = 0;
    allLineDatas = this._unshiftXItems(allLineDatas);
    var hasNotNullValue = false;
    // console.warn('dddd',this.props.step,this.props.isEnergyData);
    var stepNum = 0;
    if (this.props.step <= 1 && !this.props.isEnergyData) {
      stepNum = 900;
    }
    var gIndex = 0;
    var gIntStepIndex = 0;
    var timeStart = allLineDatas.getIn([0, 'time']);
    // console.warn('eeeee',timeStart,allLineDatas.size);
    var arrNormalPoints = [];
    var arrAlarmPoints = [];
    allLineDatas.forEach((item, index) => {
      var value = item.get('value');
      var isError = false;
      var isErrOnStep = false;
      if (stepNum !== 0) {
        if ((item.get('time') - timeStart) % stepNum !== 0) {
          gIndex = gIntStepIndex + (item.get('time') - timeStart) / stepNum;
        } else {
          isErrOnStep = true;
          timeStart = item.get('time');
          if (index !== 0) {
            gIndex = parseInt(gIndex + 1);
            gIntStepIndex = gIndex;
          }
        }
      } else {
        gIndex = parseInt(gIndex + 1);
        gIntStepIndex = gIndex;
      }
      datas.push({ x: gIndex, y: value, errPoint: isError, symbol: isError ? 'diamond' : 'round', time: item.get('time') });
      yNotFixedValues.push({ value, isError });
      if (this._checkShowXTickes(gIndex, item.get('isInsert'), item.get('time'), isError, isErrOnStep)) {
        tickesIndex.push(gIndex);
      }

      if (value || value === 0) {
        if (!hasNotNullValue) {
          maxValue = value;
          minValue = value;
          hasNotNullValue = true;
        }
        if (value > maxValue) {
          maxValue = value;
        }
        if (value < minValue) {
          minValue = value;
        }
      }
    });
    if (!hasNotNullValue || !allLineDatas) {
      return this._getNoDatasView();
    }
    var showValue = Math.abs(maxValue) >= Math.abs(minValue) ? maxValue : minValue;
    var arrLabelValues = this._getYLabelValues(yNotFixedValues, showValue, minValue);
    var { maxRange, minRange } = this._reCalculateMaxMinValue(maxValue, minValue);
    var { width, height } = Dimensions.get('window');
    var bottom = 65;
    if (Platform.OS === 'ios') {
      if (height === 320) {
        bottom = 130;
      } else if (isPhoneX()) {
        bottom = 80;
      }
    }
    if (Platform.OS === 'android') {
      bottom = 90;
    }
    this._alreadyShowMaxPointInDay = false;
    this._alreadyShowMinPointInDay = true;//Rock not need

    //判断是否显示
    let otherData = {};
    if (String(this.props.unit || '').toLocaleLowerCase() === 'kwh') {
      otherData = {
        containerComponent:
          <VictoryVoronoiContainer
            voronoiDimension="x"
          />
      }
    }
    if (this.props.step === stepValue.day && !this.props.isEnergyData) {
      otherData = {
        containerComponent: (
          <VictoryCursorContainer
            cursorDimension="x"
            cursorComponent={<VictoryLabel />}
            onCursorChange={(value, props) => {
              if (value === null) {
                this.setState({
                  currScrollIndex: -1
                })
                return
              }
              this._chartWidth = props.width;
              let index = Math.round(value);
              if (this.state.currScrollIndex !== index) {
                this.setState({
                  currScrollIndex: index
                })
              }
            }}
          />
        )
      }
    }
    return (
      <VictoryChart
        width={width > height ? width : height}
        height={(width > height ? height : width) - bottom}
        padding={{ left: 50, right: 25, top: 20, bottom }}
        {...otherData}
      >
        <VictoryAxis
          style={{
            axis: { stroke: Colors.seDisabledColor, strokeWidth: 0.5 },
            ticks: { stroke: Colors.seDisabledColor, size: 3, strokeWidth: 0.5 },
            tickLabels: { fontSize: 12, fill: Colors.seTextSecondary, },//fontFamily:'',
          }}
          tickValues={tickesIndex}
          domain={[0, tickesIndex.length]}
          tickFormat={(x) => {
            // console.warn('will render,,',x);
            var xTickText = '';
            datas.forEach((item, index) => {
              if (item.x === x) {
                xTickText = this._getXTickesFormat(item.time, x, allLineDatas.size);
                return false;
              }
            })
            return xTickText;
          }} />
        <VictoryAxis
          style={{
            axis: { stroke: Colors.seDisabledColor, strokeWidth: 0.5 },
            grid: { stroke: Colors.seDisabledColor, strokeWidth: 0.5, strokeDasharray: "3,5" },
            tickLabels: { fontSize: 12, fill: Colors.seTextSecondary, fontFamily: '' },
          }}
          domain={[minRange, maxRange]}
          dependentAxis
          crossAxis={true}
          standalone={true}
          tickFormat={(y) => {
            return this._formatNumber(String(y), 1);
          }}
        />
        {
          this._getPlotChar(datas)
        }
        {this._getPlotScatter(datas, arrLabelValues, showValue, minValue)}
        {this.renderCustomerXAxis()}
        {this.renderCurveDot(datas, maxRange)}
      </VictoryChart>
    );
  }

  renderCustomerXAxis() {
    if (this.state.currScrollIndex >= 0) {
      return (
        <VictoryAxis
          tickCount={1}
          style={{
            axis: { stroke: Colors.seDisabledBg, strokeWidth: 0.5 },
            grid: { stroke: Colors.seBrandNomarl, strokeWidth: 1 },
          }}
          tickFormat={(t) => ''}
          tickValues={[this.state.currScrollIndex]}
          standalone={true}
        />
      )
    }
    return null;
  }
  renderCurveDot(datas, maxValue) {
    let curves = (
      this.state.currScrollIndex >= 0 ?
        <VictoryScatter
          size={4}
          labels={datas[this.state.currScrollIndex].y}
          style={{
            data: { fill: Colors.seBrandNomarl }, labels: {
              fill: Colors.seBrandNomarl,
              fontSize: 12,
              width: 100,
              height: 40,
              padding: 65,
            }
          }}
          labelComponent={<Label maxValue onWidth={() => this._chartWidth} onValue={() => this.state.currScrollIndex} />}
          data={[].concat(datas[this.state.currScrollIndex])}
        />
        : null
    )
    return curves;
  }
}

class Label extends React.Component {
  render() {
    const { x, y, datum } = this.props;
    const cat = `${datum._y}`;
    return (
      <Text2 key={'text'}
        fill={Colors.seTextPrimary}
        color={Colors.seTextPrimary}
        fontSize="12"
        x={x}
        y={15}
        textAnchor={'middle'}
      >{cat}</Text2>
    );
  }
}

HistoryDataView.propTypes = {
  user: PropTypes.object,
  isFetching: PropTypes.bool,
  data: PropTypes.object,
  isEnergyData: PropTypes.bool,
  step: PropTypes.number,
}
