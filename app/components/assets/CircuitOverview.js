import React, { Component } from "react";
import { View, Text, ScrollView, RefreshControl, PanResponder } from 'react-native';
import Icon from "../Icon";
import TouchFeedback from "../TouchFeedback";
import ChartTpCurve from './ChartTpCurve';
import ChartRiskIndex from './ChartRiskIndex';
import ChartPower from './ChartPower';
import moment from "moment";
import DateTimePicker from "react-native-modal-datetime-picker";
import Toast from "react-native-root-toast";
import AgeingView from "./AgeingView";
import Loading from '../Loading';
import { GREEN } from "../../styles/color";
const FORMAT = 'YYYY-MM-DD';
import { isPhoneX } from '../../utils'
import SectionParamTouch from "./SectionParamTouch";
import SimpleRow from "./SimpleRow";
export default class CircuitOverview extends Component {

  constructor(props) {
    super(props);
    this.state = { tabIndex: 0, canScroll: true }
  }

  renderTip() {
    if (!this.props.networkType) return;
    //判断是否显示tip
    let tip = this.props.networkType === 1 ? '低流量：15分钟刷新1次数据' : '高流量：5秒刷新1次数据';
    let textColor = '#ff9500';
    let bgColor = '#fffbe6';
    return (
      <View>
        <View style={{
          height: 36, backgroundColor: bgColor, flexDirection: 'row', paddingHorizontal: 16,
          alignItems: 'center'
        }}>
          <Icon type={'icon_info'} color={textColor} size={14} />
          <Text style={{ color: textColor, fontSize: 14, marginLeft: 8 }}>{tip}</Text>
        </View>
        {this.renderGap()}
      </View>
    )
  }

  renderGap() {
    return (
      <View style={{ height: 10 }} />
    )
  }

  renderLine(color = '#d9d9d9', key = undefined) {
    let data = {};
    if (key) {
      data.key = key;
    }
    return <View {...data} style={{ height: 1, backgroundColor: color }} />
  }

  renderScrollTab() {
    let tabs = this.props.sensors;
    let selColor = '#284e98';
    let unSelColor = '#333';
    let redDot = () => (
      <View style={{
        width: 6, height: 6, borderRadius: 3, backgroundColor: '#f00',
        position: 'absolute', top: 0, right: 0
      }} />
    )
    let rows = tabs.map((t, index) => {
      let isSel = this.state.tabIndex === index;
      let red = false;
      if (this.props.redDot && this.props.redDot.length > 0) {
        if (this.props.redDot.findIndex(d => d.DeviceId === t.get('DeviceId')) >= 0) {
          red = true;
        }
      }
      let textColor = isSel ? selColor : unSelColor;
      let bgColor = isSel ? selColor : '#00000000';
      return (
        <TouchFeedback key={index} onPress={() => {
          if (this.state.tabIndex !== index) {
            this.setState({ tabIndex: index });
            this.props.changeSensorTab(tabs.get(index));
          }
        }}>
          <View style={{ justifyContent: 'flex-end', alignItems: 'center', paddingTop: 6, marginLeft: index === 0 ? 0 : 20 }}>
            <Text style={{ color: textColor, fontSize: 15 }}>{t.get('DeviceName')}</Text>
            <View style={{ width: '100%', height: 3, backgroundColor: bgColor, marginTop: 8 }} />
            {red ? redDot() : null}
          </View>
        </TouchFeedback>
      )
    })
    return (
      <View style={{ backgroundColor: '#fff', height: 44, paddingHorizontal: 16 }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ alignItems: 'flex-end', }}
          showsHorizontalScrollIndicator={false} horizontal={true}>
          {rows}
        </ScrollView>
      </View>

    )
  }

  renderTpCurve() {
    if (!this.props.sensorData || !this.props.sensors || this.props.sensors.size === 0) return;
    let deviceId = this.props.sensors.getIn([this.state.tabIndex, 'DeviceId']);
    if (!deviceId) return;
    let data = this.props.sensorData.get(deviceId);
    let units = [];
    let monitorNames = this.props.sensors.getIn([this.state.tabIndex, 'MonitorParameters'])
      .map(p => {
        let formula = p.get('EdgeFormula');
        // formula = Number(formula);
        units.push(p.get('Unit'))
        switch (formula) {
          case 'Min':
            formula = '(最小值)';
            break;
          case 'Max':
            formula = '(最大值)';
            break;
          default:
            formula = '';
            break;
        }
        return p.get('Name') + formula;
      }).toJS();
    if (!data) return;
    if (data.isFetching) {
      return (
        <View style={{ backgroundColor: '#fff', height: 320 }}>
          <Loading />
        </View>
      )
    }
    if (data.err) {
      return (
        <View style={{ backgroundColor: '#fff', height: 320, alignItems: 'center', justifyContent: 'center' }}>
          <Text>获取数据失败</Text>
        </View>
      )
    }
    if (!data.data || data.data.length === 0) {
      return (
        <View style={{ backgroundColor: '#fff', height: 320, alignItems: 'center', justifyContent: 'center' }}>
          <Text>无数据</Text>
        </View>
      )
    }
    return (
      <View style={{ backgroundColor: '#fff' }}>
        <ChartTpCurve data={data.data} units={units} monitorNames={monitorNames}
          onMove={() => {
            this._moveTime = Date.now();
            if (this.state.canScroll) {
              this.setState({ canScroll: false })
            }
            return false;
          }}
        />
      </View>
    )
  }

  _changeDatePre() {
    let date = moment(this.props.riskDate).add(-1, 'd').format(FORMAT);
    this.props.changeRiskDate(date);
  }

  _changeDateNext() {
    if (moment().isBefore(moment(this.props.riskDate)) ||
      moment().format(FORMAT) === moment(this.props.riskDate).format(FORMAT))
      return;

    let date = moment(this.props.riskDate).add(1, 'd').format(FORMAT);
    this.props.changeRiskDate(date);
  }

  renderRiskIndex() {
    if (true) return null;
    if (!this.props.riskErr &&
      (!this.props.riskData || this.props.riskData.size === 0)) {
      return;
    }
    let otherView = null;
    if (this.props.riskFetching) {
      otherView = <Loading />
    } else if (this.props.riskErr) {
      otherView = (
        <Text style={{ fontSize: 12, color: '#888' }}>加载数据失败</Text>
      )
    }
    let riskDate = this.props.riskDate;
    if (!riskDate) {
      riskDate = moment().format('YYYY年MM月DD日');
    } else {
      riskDate = moment(riskDate).format('YYYY年MM月DD日');
    }
    let contentView = null;
    if (otherView) {
      contentView = (
        <View style={{ height: 200, alignItems: 'center', justifyContent: 'center' }}>
          {otherView}
        </View>
      )
    } else {
      contentView = (
        <View onMoveShouldSetResponder={() => {
          this._moveTime = Date.now();
          if (this.state.canScroll) {
            this.setState({ canScroll: false })
          }
          return false;
        }}>
          <ChartRiskIndex date={moment(this.props.riskDate).toDate().getTime() / 1000} data={this.props.riskData.toJS()} />
        </View>
      )
    }

    let leftRightIcon = (icon, click) => {
      return (
        <TouchFeedback onPress={click}>
          <View style={{ padding: 4 }}>
            <Icon type={icon} color={'#888'} size={14} />
          </View>
        </TouchFeedback>
      )
    }
    return (
      <View style={{ padding: 16, backgroundColor: '#fff', marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 17, color: '#333' }}>风险指数历史曲线</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {leftRightIcon('icon_arrow_left', () => this._changeDatePre())}
            <TouchFeedback onPress={this._pickDate.bind(this)}>
              <Text style={{ fontSize: 14, color: '#888' }}>{riskDate}</Text>
            </TouchFeedback>
            {leftRightIcon('icon_arrow_right', () => this._changeDateNext())}
          </View>
        </View>
        {contentView}
      </View>
    )
  }

  renderPower() {
    if (this.props.power && this.props.power.size > 0) {
      let max = 0;
      let min = 0;
      let data = this.props.power.toJS().map(p => {
        p = p.value;
        if (!p) p = 0;
        p = Number(p);
        if (p > max) max = p;
        if (p < min) min = p;
        return p;
      });
      return (
        <View style={{ padding: 16, backgroundColor: '#fff', marginBottom: 10 }}>
          <Text style={{ fontSize: 17, color: '#333' }}>功率与电流最大需量</Text>
          <ChartPower data={data} max={max} min={min} />
        </View>
      )
    }

  }

  renderCommonRow() {
    let data = this.props.parameters;
    let rows = [];
    let fnRow = (item, key) => {
      return (
        <View key={key} style={{
          flexDirection: 'row', alignItems: 'center',
          height: 56, justifyContent: 'space-between'
        }}>
          <Text>{item.get('title')}</Text>
          <Text>{item.get('value')}</Text>
        </View>
      )
    }
    data && data.forEach((row, index) => {
      rows.push(fnRow(row, index));
      if (index !== data.size - 1) {
        rows.push(this.renderLine(undefined, `${index}${index}`));
      }
    });
    return (
      <View style={{ backgroundColor: '#fff', paddingHorizontal: 16 }}>
        {rows}
      </View>
    );
  }

  _renderParamGroup() {
    let arr = [];
    if (this.props.paramGroup && this.props.paramGroup.size > 0) {
      this.props.paramGroup.forEach((g, index) => {
        arr.push(
          <SectionParamTouch key={`${g.get('title')}-${index}`} onSectionClick={() => {
            if (this.props.expandCircuitParam) {
              this.props.expandCircuitParam(index);
            }
          }} rowData={g} />
        )
        g.get('isExpanded') && g.get('data').forEach((p, index2) => {
          arr.push(
            <SimpleRow key={`${g.get('title')}-${index}-${index2}`} onRowClick={() => { }} rowData={p} />
          )
        })
      });
    }
    return arr;
  }

  renderSensors() {
    if (!this.props.sensors || this.props.sensors.size === 0) return;
    return (
      <View>
        {this.renderScrollTab()}
        {this.renderLine()}
        {this.renderTpCurve()}
        {this.renderGap()}
      </View>
    )
  }

  _pickDate() {
    this._riskDate = moment(this.props.riskDate).toDate();
    this.setState({ modalVisible: true })
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
        mode={'date'}
        datePickerModeAndroid={'spinner'}
        date={this._riskDate}
        onDateChange={(date) => {
        }}
        isVisible={this.state.modalVisible}
        onConfirm={(date) => {
          if (date.getTime() <= Date.now()) {
            this.props.changeRiskDate(moment(date).format(FORMAT))
          }
          this.setState({ modalVisible: false })
        }}
        onCancel={() => {
          this.setState({ modalVisible: false })
        }}
      />
    )
  }

  renderAging() {
    if (!this.props.agingData) return;
    let errView = null;
    if (this.props.agingData.get('errStr')) {
      errView = (
        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          <Icon type={'icon_info'} color={'#ff4d4d'} size={14} />
          <Text style={{ color: '#ff4d4d', fontSize: 14, marginLeft: 8, lineHeight: 18 }}>{this.props.agingData.get('errStr')}</Text>
        </View>
      )
    }
    return (
      <View style={{ padding: 16, backgroundColor: '#fff', marginBottom: 10 }}>
        <Text style={{ fontSize: 17, color: '#333' }}>设备老化程度</Text>
        {errView}
        <AgeingView color={'#e6e6e6'} unfilledColor={GREEN} ageValue={this.props.agingData.get('value')} errStr={null} />
      </View>
    )
  }

  render() {
    return (
      <ScrollView refreshControl={
        <RefreshControl
          refreshing={this.props.isFetching}
          onRefresh={this.props.onRefresh}
          tintColor={GREEN}
          title="加载中，请稍候..."
          colors={[GREEN]}
          progressBackgroundColor={'white'}
        />
      }
        onMoveShouldSetResponder={() => {
          let now = Date.now();
          let preMove = this._moveTime || 0;
          if (now - preMove > 10) {
            this.setState({ canScroll: true })
          }
        }}

        scrollEnabled={true}
        contentContainerStyle={{ paddingBottom: 10 }}
        style={{ backgroundColor: '#f2f2f2', flex: 1, marginBottom: isPhoneX() ? 34 : 0 }}>

        {this.renderTip()}
        {this.renderSensors()}
        {this.renderRiskIndex()}
        {this.renderPower()}
        {this.renderAging()}
        {/*{this.renderCommonRow()}*/}
        {this._renderParamGroup()}
        {this._renderPickerView()}
      </ScrollView>
    )
  }
}
