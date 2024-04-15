import React, { Component } from "react";
import { View, Text, ScrollView, TextInput, Dimensions, Image, Alert } from "react-native";
import { GREEN, LIST_BG } from "../../../styles/color";
import Toolbar from "../../Toolbar";
import TouchFeedback from "../../TouchFeedback";
import Icon from "../../Icon";
import { GreenLabel, Remark } from './widget';
import NetworkImage from "../../NetworkImage";
const WIDTH = Dimensions.get('window').width;
import ProtectionValueEdit from './ProtectionValueEdit';
import PropTypes from "prop-types";
import { connect } from 'react-redux';
import trackApi from "../../../utils/trackApi";
import backHelper from "../../../utils/backHelper";
import { serviceTicketExecute } from '../../../actions/ticketAction';
import Toast from "react-native-root-toast";
import Modal from "../../actionsheet/CommonActionSheet";
import { isPhoneX } from "../../../utils";
import privilegeHelper from "../../../utils/privilegeHelper";
import permissionCode from "../../../utils/permissionCode";
import PhotoShow from "../../../containers/assets/PhotoShow";
import immutable from 'immutable';
const HEIGHT = Dimensions.get('window').height;
class ProtectionValueView extends Component {

  static contextTypes = {
    showSpinner: PropTypes.func,
    hideHud: PropTypes.func
  }

  constructor(props) {
    super(props);
    this.state = {
      ...this.init()
    };
  }

  init() {
    let data = {};
    if (this.props.data) {
      data.high = this.props.data.ItemInfo.HighVoltageConstantValueInfo;
      data.low = this.props.data.ItemInfo.LowVoltageConstantValueInfo
    }
    this._backupState = JSON.parse(JSON.stringify(data));
    return data;
  }

  _changed(l, r) {
    if (l && !r) return true;
    if (!l && r) return true;
    if (l && r) return false;
  }

  _checkIsChanged() {
    if (!this._backupState.high && !this._backupState.low && !this.state.high && !this.state.low) return false;
    if (this._changed(this._backupState.high, this.state.high)) return true;
    if (this._changed(this._backupState.low, this.state.low)) return true;
    let isChanged = false;
    ['IOvercurrent',
      'TOvercurrent',
      'OvercurrentCurve',
      'IQuickBreak',
      'TQuickBreak',
      'QuickBreakCurve',
      'Suggestion'].forEach(key => {
        if (this._backupState.high && this.state.high) {
          if (this._backupState.high[key].Value !== this.state.high[key].Value) {
            isChanged = true;
            return;
          }
        }
        if (this._backupState.low && this.state.low) {
          if (this._backupState.low[key].Value !== this.state.low[key].Value) {
            isChanged = true;
            return;
          }
        }
      })
    if (this._backupState.low && this.state.low) {
      let titles = {
        LowVoltageInImage: '低压进线断路器定值',
        LowVoltageOutImage: '低压出线断路器铭牌',
        TransformerImage: '变压器铭牌',
        CtImage: 'CT变比',
      }
      Object.keys(titles).forEach(key => {
        if (this._backupState.low.Images.Value[key] !== this.state.low.Images.Value[key]) {
          isChanged = true;
          return;
        }
      })
    }

    return isChanged;
  }

  _processBack() {
    if (this._checkIsChanged()) {
      Alert.alert(
        '',
        `是否保存修改？`,
        [
          { text: '不保存', onPress: () => this.props.onBack(), style: 'cancel' },
          {
            text: '保存', onPress: () => {
              this._submit();
            }
          },
        ]
      )
    } else {
      this.props.onBack();
    }
  }

  componentDidMount() {
    trackApi.onPageBegin(this.props.route.id);
    backHelper.init(this.props.navigator, this.props.route.id, () => {
      this._processBack();
    });
  }

  componentWillUnmount() {
    this._backupState = null;
    trackApi.onPageEnd(this.props.route.id);
    backHelper.destroy(this.props.route.id);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.isPosting !== this.props.isPosting && !this.props.isPosting) {
      this.context.hideHud();
    }
    //如果有状态变化，则说明做了执行操作
    if (prevProps.status !== this.props.status) {
      this.context.hideHud();
    }
    if (prevProps.isUpdating !== this.props.isUpdating) {
      if (this.props.isUpdating) {
        this.context.showSpinner();
      } else {
        this.context.hideHud();
        //需要判断失败的情况
        this.props.onBack();
      }
      return;
    }
  }

  _renderEmpty() {
    return (
      <View style={{ height: 280, alignItems: 'center', justifyContent: 'center' }}>
        <Image style={{ width: 60, height: 40 }} source={require('../../../images/empty_box/empty_box.png')} />
        <Text style={{ fontSize: 15, color: '#888', marginTop: 10 }}>暂无巡检日志</Text>
      </View>
    )
  }

  _renderItem(key, value, comment) {
    let showRemark = this.props.status === 4 || this.props.status === 3;
    return (
      <View style={{ alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, color: '#333' }}>{value}</Text>
        </View>

        <Text style={{ fontSize: 15, color: '#888', marginVertical: 8 }}>{key}</Text>
        {showRemark && comment ?
          <Remark noOffset click={() => this.setState({ remarkVisible: true, remarkTitle: key, remarkContent: comment })} />
          : null}
      </View>
    )
  }

  //查看大图
  _showPhotoBig(items, index, option) {
    this.props.navigation.push('PageWarpper', {
      id: 'photo_show',
      component: PhotoShow,
      passProps: {
        index: index,
        arrPhotos: items,
        thumbImageInfo: option || { width: 100, height: 100 },
        type: 'servicePhoto',
        canEdit: false,
      }
    });
  }

  _renderImage() {
    let titles = {
      LowVoltageInImage: '低压进线断路器定值',
      LowVoltageOutImage: '低压出线断路器铭牌',
      TransformerImage: '变压器铭牌',
      CtImage: 'CT变比',
    }
    let showRemark = this.props.status === 4 || this.props.status === 3;

    let imgValues = this.state.low.Images.Value;
    console.log('imgValue', imgValues);
    if (imgValues) {
      let size = (WIDTH - 24 * 3 - 8) / 2;
      let items = Object.keys(imgValues).filter(item => imgValues[item] !== null).map((key, index) => {
        let mr = ((index % 2) === 0) ? 24 : 0;
        let img = imgValues[key];
        let dataSource = require('../../../images/building_default/building.png');
        if (img.uri) {
          dataSource = { uri: img.uri }
          img = img.uri
        }
        return (
          <View key={index} style={{ alignItems: 'center', marginHorizontal: mr, marginBottom: 16, }}>
            <View style={{ position: 'absolute', top: 0, left: 1, zIndex: 100 }}>
              {showRemark && this.state.low.Images.Comment && index === 0 ?
                <Remark noOffset click={() => this.setState({ remarkVisible: true, remarkTitle: '图片', remarkContent: this.state.low.Images.Comment })} />
                : null}
            </View>
            <TouchFeedback onPress={() => {
              let photos = Object.keys(imgValues).filter(item => imgValues[item] !== null).map((key) => {
                return {
                  PictureId: imgValues[key].uri ? imgValues[key].uri : imgValues[key], Content: titles[key]
                }
              });
              this._showPhotoBig(immutable.fromJS(photos), index, { width: size, height: size });
            }}>
              <View style={{ borderWidth: 1, borderColor: '#e6e6e6', borderRadius: 2, padding: 1 }}>
                <NetworkImage
                  style={{}}
                  resizeMode="cover"
                  imgType='jpg'
                  defaultSource={dataSource}
                  width={size} height={size}
                  name={img} />
              </View>
            </TouchFeedback>

            <Text style={{ marginTop: 8, fontSize: 15, color: '#888' }}>{titles[key]}</Text>
          </View>
        )
      });
      if (!items || items.length === 0) return null;

      return (
        <View style={{ marginTop: 20 }}>
          <GreenLabel title={'图片'} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, marginHorizontal: -16 }}>
            {items}
          </View>
        </View>
      )

    } else {
      return null;
    }
  }

  _addOrEditLog(log, isHigh) {
    if (!this._checkAction()) return;
    this.props.navigation.push('PageWarpper', {
      id: 'protection_value_edit',
      component: ProtectionValueEdit,
      passProps: {
        offlineMode: this.props.offlineMode,
        navigator: this.props.navigator,
        onBack: () => this.props.navigation.pop(),
        submit: (data) => {
          this.props.navigation.pop();
          let key = isHigh ? 'high' : 'low';
          let obj = {};
          obj[key] = data;
          this.setState(obj);
        },
        isHigh,
        data: log
      }
    })
  }

  _renderCard(title, isHigh) {
    let content = null;
    let showRemark = this.props.status === 4 || this.props.status === 3;
    let data = isHigh ? this.state.high : this.state.low;
    if (!data) {
      content = this._renderEmpty();
    } else {
      let Curves = ['', '定时限', '反时限'];
      content = (
        <View style={{ padding: 16 }}>
          <GreenLabel title={'过流'} />
          <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 30, marginBottom: 30, justifyContent: 'space-between' }}>
            {this._renderItem('I过流', `${data.IOvercurrent.Value}${isHigh ? 'A' : 'Ir'}`, data.IOvercurrent.Comment)}
            {this._renderItem('t过流', `${data.TOvercurrent.Value}s`, data.TOvercurrent.Comment)}
            {this._renderItem('保护曲线', Curves[data.OvercurrentCurve.Value], data.OvercurrentCurve.Comment)}
          </View>

          <GreenLabel title={'速断'} />
          <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 30, marginBottom: 30, justifyContent: 'space-between' }}>
            {this._renderItem('I速断', `${data.IQuickBreak.Value}${isHigh ? 'A' : 'In'}`, data.IQuickBreak.Comment)}
            {this._renderItem('t速断', `${data.TQuickBreak.Value}s`, data.TQuickBreak.Comment)}
            {this._renderItem('保护曲线', Curves[data.QuickBreakCurve.Value], data.QuickBreakCurve.Comment)}
          </View>

          <GreenLabel title={'建议'} />
          <Text>
            <Text style={{ fontSize: 17, color: '#888', marginBottom: 30, lineHeight: 23 }}>{data.Suggestion.Value || ''}</Text>
            {showRemark && data.Suggestion.Comment ?
              <Remark click={() => this.setState({ remarkVisible: true, remarkTitle: '建议', remarkContent: data.Suggestion.Comment })} />
              : null}
          </Text>
          {isHigh ? null : this._renderImage()}
        </View>
      )
    }
    let icon = data ? 'icon_edit_pencil' : 'icon_circle_add';
    return (
      <View style={{ backgroundColor: '#fff', marginTop: 10 }}>
        <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 17, color: '#333', fontWeight: '500' }}>{title}</Text>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            {this._onlyShow() ? null :
              <TouchFeedback onPress={() => this._addOrEditLog(data, isHigh)}>
                <View style={{ margin: -16, padding: 16 }}>
                  <Icon type={icon} color={GREEN} size={20} />
                </View>
              </TouchFeedback>
            }
          </View>
        </View>
        <View style={{ height: 1, backgroundColor: '#f2f2f2' }} />
        {content}
      </View>
    )
  }

  _onlyShow() {
    //如果是已提交和已关闭，则只能查看
    if (this.props.status === 3 || this.props.status === 5) return true;
    //没有执行完整权限
    if (!privilegeHelper.hasAuth(permissionCode.SERVICE_EXECUTE.FULL)) return true;
    //不是创建者或者执行者
    if (!this.props.isCreatorOrExecutor) return true;
    return false;
  }

  _checkAction() {
    if (this.props.notStart) {
      //未开始，需要先执行提交
      Alert.alert(
        '',
        `开始执行工单？`,
        [
          { text: '取消', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
          {
            text: '开始执行', onPress: () => {
              this.context.showSpinner();
              Toast.show('开始执行，请填写巡检结果', {
                duration: Toast.durations.LONG,
                position: Toast.positions.BOTTOM,
              });
              //this.props.serviceTicketExecute(this.props.ticketId);
              this.props.executeTicket(false)
            }
          },
        ]
      )
      return false;
    }
    return true;
  }

  _submit() {
    if (!this._checkAction()) return;
    if (!this.state.high && !this.state.low) {
      this.props.navigation.pop();
      return;
    }
    let data = {
      HighVoltageConstantValueInfo: this.state.high,
      LowVoltageConstantValueInfo: this.state.low
    }
    this.props.submit(data);
  }

  _remarkModal() {
    if (!this.state.remarkVisible) return;
    return (
      <Modal modalVisible={this.state.remarkVisible} onCancel={() => this.setState({ remarkVisible: false })}>
        <View style={{ backgroundColor: '#fff', padding: 16, paddingBottom: isPhoneX() ? 34 : 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 17, color: '#333', fontWeight: '500' }}>{`查看"${this.state.remarkTitle}"批注`}</Text>
            <TouchFeedback onPress={() => this.setState({ remarkVisible: false })}>
              <View style={{ marginTop: -16, marginRight: -16, padding: 16 }}>
                <Icon type={'icon_close'} color={'#333'} size={17} />
              </View>
            </TouchFeedback>
          </View>
          <View style={{ height: 1, backgroundColor: '#f2f2f2', marginHorizontal: -16 }} />
          <ScrollView showsVerticalScrollIndicator={false}
            style={{ maxHeight: 450 }}>
            <Text style={{ fontSize: 17, color: '#888', marginVertical: 16 }}>{this.state.remarkContent}</Text>
          </ScrollView>
        </View>
      </Modal>
    )
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: LIST_BG }}>
        <Toolbar
          title={'保护定值'}
          navIcon="back"
          noShadow={true}
          actions={this._onlyShow() ? [] : [{ title: '完成' }]}
          onActionSelected={[() => this._submit()]}
          onIconClicked={() => this._processBack()}
        />
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {this._renderCard('高压出线定值巡检日志', true)}
          {this._renderCard('低压进线定值巡检日志', false)}
        </ScrollView>
        {this._remarkModal()}
      </View>
    )
  }
}

function mapStateToProps(state, ownProps) {
  let serviceTicket = state.ticket.serviceTicket;
  return {
    isUpdating: serviceTicket.get('isUpdating'),
    isPosting: serviceTicket.get('isPosting'),
    notStart: serviceTicket.get('data').Status === 1,
    ticketId: serviceTicket.get('data').Id,
    status: serviceTicket.get('data').Status,
  }
}

export default connect(mapStateToProps, { serviceTicketExecute })(ProtectionValueView);
