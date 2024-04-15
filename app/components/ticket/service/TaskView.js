import React, { Component } from "react";
import { View, Text, Image, ScrollView, Dimensions, Alert } from "react-native";
import { GREEN, LIST_BG } from "../../../styles/color";
import Toolbar from "../../Toolbar";
import TouchFeedback from "../../TouchFeedback";
import Icon from "../../Icon";
import { CheckDot, Level, Remark } from "./widget";
import SchActionSheet from "../../actionsheet/SchActionSheet";
import ServiceLogEdit from "./ServiceLogEdit";
import NetworkImage from "../../NetworkImage";
import { connect } from 'react-redux';
import trackApi from "../../../utils/trackApi";
import backHelper from "../../../utils/backHelper";
import PropTypes from "prop-types";
import { serviceTicketExecute } from '../../../actions/ticketAction';
import Toast from "react-native-root-toast";
import Modal from "../../actionsheet/CommonActionSheet";
import { isPhoneX } from "../../../utils";
import privilegeHelper from "../../../utils/privilegeHelper";
import permissionCode from "../../../utils/permissionCode";
import PhotoShow from "../../../containers/assets/PhotoShow";
import Immutable from 'immutable';
const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;
class TaskView extends Component {

  static contextTypes = {
    showSpinner: PropTypes.func,
    hideHud: PropTypes.func
  }

  constructor(props) {
    super(props);
    this.state = {
      selectMap: { ...props.data.ItemInfo.MaintenanceInfo },
      logs: props.data.ItemInfo.InspectionInfoList
    }

    this._backupState = JSON.parse(JSON.stringify(this.state));
  }

  _checkIsChanged() {
    let changed = false;
    Object.keys(this._backupState.selectMap).forEach(key => {
      if (this._backupState.selectMap[key] !== this.state.selectMap[key]) {
        changed = true;
      }
    });
    if (changed) return true;
    if (this._backupState.logs && this.state.logs) {
      if (this._backupState.logs.length !== this.state.logs.length) {
        return true;
      }
      this._backupState.logs.forEach((log, index) => {
        let newLog = this.state.logs[index];
        if (newLog.IsCustom !== log.IsCustom) {
          changed = true;
          return;
        }
        if (newLog.LocationId !== log.LocationId) {
          changed = true;
          return;
        }
        [
          "RiskDescription",
          "RiskHarm",
          "Suggestion",
          "Location",
          "Priority"].forEach(key => {
            if (newLog[key].Value !== log[key].Value) {
              changed = true;
              return;
            }
          })
      })
    }
    return changed;
  }

  componentDidMount() {
    trackApi.onPageBegin(this.props.route.id);
    backHelper.init(this.props.navigator, this.props.route.id, () => {
      this._processBack();
    });
  }

  componentWillUnmount() {
    this._backupState = false;
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


  _renderTask() {
    if (!this.props.data.info.subTasks) return;
    //过滤需要显示的项目
    let tasks = this.props.data.info.subTasks;//data[rowIndex];
    let maintenanceInfo = this.state.selectMap;
    //如果维护频率显示的是从不(4),则只显示固定前2项
    let items = Object.keys(maintenanceInfo).filter((key, index) => {
      if (maintenanceInfo.Frequency === 4) {
        return index <= 1;
      }
      return true;
    }).map((key, index) => {
      if (this._onlyShow()) {
        return this._renderReadView(index, key, tasks[key]);
      }
      return this._renderCheckRow(index, key, tasks[key]);
    });
    return (
      <View style={{ backgroundColor: '#fff', marginTop: 10 }}>
        <Text style={{ fontSize: 17, color: '#333', padding: 16, fontWeight: '500' }}>维护信息</Text>
        <View style={{ height: 1, backgroundColor: '#f2f2f2' }} />
        {items}
      </View>
    )
  }

  //查看
  _renderReadView(rowIndex, key, item) {
    let selIndex = this.state.selectMap[key];
    let findOption = item.options.find(op => op.value === selIndex);
    return (
      <View key={rowIndex} style={{
        minHeight: 56, marginLeft: 16, paddingRight: 16, paddingVertical: 16,
        borderBottomWidth: 1, borderBottomColor: '#f2f2f2', flexDirection: 'row', alignItems: 'center'
      }}>
        <Text style={{ fontSize: 17, color: '#333', marginRight: 32, lineHeight: 23, flex: 1 }}>
          {`${rowIndex + 1}. ${item.title}`}
        </Text>
        <Text style={{ fontSize: 17, color: '#888' }}>{findOption ? findOption.title : '--'}</Text>
      </View>
    )
  }

  _renderCheckRow(rowIndex, key, item) {
    let itemWidth = (WIDTH - 16 * 3) / 4;
    let selIndex = this.state.selectMap[key];
    let selViews = item.options.map((item, index) => {
      let sel = item.value === selIndex;
      if (item.title === '备件不足') {
        itemWidth = (WIDTH - 16 * 2) / 3;
      }
      return (
        <TouchFeedback key={index} onPress={() => {
          if (!this._checkAction()) return;
          let selectMap = this.state.selectMap;
          selectMap[key] = sel ? null : item.value;
          this.setState(selectMap);
        }}>
          <View style={{ flexDirection: 'row', minWidth: itemWidth, alignItems: 'center' }}>
            <CheckDot color={'#d9d9d9'} size={22} selected={sel} />
            <Text style={{ fontSize: 17, color: '#888', marginLeft: 4 }}>{item.title}</Text>
          </View>
        </TouchFeedback>
      )
    })
    return (
      <View key={rowIndex} style={{
        height: 92, marginLeft: 16, paddingRight: 16, justifyContent: 'center',
        borderBottomWidth: 1, borderBottomColor: '#f2f2f2'
      }}>
        <Text style={{ fontSize: 17, color: '#333', marginBottom: 12 }}>
          {`${rowIndex + 1}. ${item.title}`}
        </Text>
        <View style={{ flexDirection: 'row' }}>
          {selViews}
        </View>
      </View>
    )
  }

  _renderLog() {
    let logs = null;
    let logList = this.state.logs;
    if (!logList) return;
    if (logList.length === 0) {
      logs = this._renderEmpty();
    } else {
      logs = [];
      logList.forEach((log, index) => {
        logs.push(this._renderLogItem(index, log));
        if (index < logList.length - 1) {
          logs.push(<View key={'line:' + index} style={{ height: 1, backgroundColor: '#f2f2f2', marginBottom: 16 }} />)
        }
      });
    }

    let addView = null;
    if (!this._onlyShow()) {
      addView = (
        <View>
          <TouchFeedback onPress={() => this._editOrAddLog(true)}>
            <View style={{ padding: 16, marginVertical: -16, marginRight: -16 }}>
              <Icon type={'icon_circle_add'} color={GREEN} size={20} style={{ fontWeight: '500' }} />
            </View>

          </TouchFeedback>
        </View>
      );
    }

    return (
      <View style={{ backgroundColor: '#fff', marginTop: 10 }}>
        <View style={{ flexDirection: 'row', padding: 16, paddingBottom: 0, alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 17, color: '#333', fontWeight: '500' }}>巡检日志</Text>
          <View style={{ flex: 1 }} />
          {addView}
        </View>
        <View style={{ height: 1, backgroundColor: '#f2f2f2', marginVertical: 16 }} />
        {logs}
      </View>
    )
  }

  //查看大图
  _showPhotoBig(items, index) {
    this.props.navigation.push('PageWarpper', {
      id: 'photo_show',
      component: PhotoShow,
      passProps: {
        index: index,
        arrPhotos: items,
        thumbImageInfo: { width: 100, height: 100 },
        type: 'servicePhoto',
        canEdit: false,
      }
    });
  }

  _editOrAddLog(isAdd, log) {
    if (!this._checkAction()) return;
    this.props.navigation.push('PageWarpper', {
      id: 'service_log_edit',
      component: ServiceLogEdit,
      passProps: {
        offlineMode: this.props.offlineMode,
        navigator: this.props.navigator,
        taskType: this.props.data.info.subTitle,
        assetId: this.props.assetId,
        onBack: () => this.props.navigation.pop(),
        submit: (data) => {
          this.props.navigation.pop();
          let logs = this.state.logs;
          if (isAdd) logs.push(data);
          this.setState({ logs })
        },
        data: isAdd ? null : log
      }
    })
  }

  _renderLogItem(key, item) {
    let level = item.Priority.Value;
    let showRemark = this.props.status === 4 || this.props.status === 3;
    let size = 100;
    let imgs = item.Images.Value.map((imgKey, index) => {
      let img = imgKey;
      if (typeof imgKey === 'object') {
        img = imgKey.uri;
      }
      let dataSource = require('../../../images/building_default/building.png');
      if (imgKey.uri) {
        dataSource = { uri: imgKey.uri }
      }
      return (
        <View key={index}>
          <TouchFeedback onPress={() => {
            let items = item.Images.Value.map(_img => {
              return {
                PictureId: typeof _img === 'object' ? _img.uri : _img, Content: ''
              }
            });
            this._showPhotoBig(Immutable.fromJS(items), index);
          }}>
            <View style={{ borderWidth: 1, borderColor: '#e6e6e6', padding: 1, borderRadius: 2, marginRight: 10, marginBottom: 16 }}>
              <NetworkImage
                style={{}}
                resizeMode="cover"
                imgType='jpg'
                defaultSource={dataSource}
                width={size} height={size}
                name={img} />
            </View>
          </TouchFeedback>
          <View style={{ position: 'absolute', top: 0, left: -2, zIndex: 100 }}>
            {showRemark && item.Images.Comment && index === 0 ?
              <Remark noOffset click={() => this.setState({ remarkVisible: true, remarkTitle: '图片', remarkContent: item.Images.Comment })} />
              : null}
          </View>
        </View>
      )
    })

    return (
      <View key={key} style={{ marginHorizontal: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', alignContent: 'center' }}>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <Text>
              <Text style={{ fontSize: 17, lineHeight: 23, flexShrink: 1 }}>{`${item.RiskDescription.Value}`}</Text>
              {showRemark && item.RiskDescription.Comment ?
                <>
                  <View style={{ width: 8 }} />
                  <Remark click={() => this.setState({ remarkVisible: true, remarkTitle: '风险描述', remarkContent: item.RiskDescription.Comment })} />
                </>
                : null}
              <View style={{ width: 8 }} />
              <Level level={level} />

              {showRemark && item.Priority.Comment ?
                <>
                  <View style={{ width: 8 }} />
                  <Remark click={() => this.setState({ remarkVisible: true, remarkTitle: '优先级', remarkContent: item.Priority.Comment })} />
                </>
                : null}
            </Text>
          </View>
          {this._onlyShow() ? null :
            <TouchFeedback onPress={() => {
              if (!this._checkAction()) return;
              this.setState({ modalVisible: true, editLog: item })
            }}>
              <View style={{ marginTop: -16, marginRight: -16, padding: 16, paddingLeft: 32, paddingBottom: 0 }}>
                <Icon type={'icon_more'} color={GREEN} size={15} />
              </View>
            </TouchFeedback>
          }
        </View>
        {
          item.RiskHarm.Value && item.RiskHarm.Value.trim().length > 0 ?
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <Text>
                <Text style={{ fontSize: 14, color: '#888', lineHeight: 23 }}>
                  {`风险危害：${item.RiskHarm.Value}`}
                </Text>

                {showRemark && item.RiskHarm.Comment ?
                  <>
                    <View style={{ width: 8 }} />
                    <Remark click={() => this.setState({ remarkVisible: true, remarkTitle: '风险危害', remarkContent: item.RiskHarm.Comment })} />
                  </>
                  : null}
              </Text>
            </View> : null
        }
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <Text>
            <Text style={{ fontSize: 14, color: '#888', lineHeight: 23 }}>
              {`建议：${item.Suggestion.Value}`}
            </Text>

            {showRemark && item.Suggestion.Comment ?
              <>
                <View style={{ width: 8 }} />
                <Remark click={() => this.setState({ remarkVisible: true, remarkTitle: '建议', remarkContent: item.Suggestion.Comment })} />
              </>
              : null}
          </Text>

        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <Text>
            <Text numberOfLines={1} style={{ fontSize: 14, color: '#888', lineHeight: 23 }}>
              {`发现位置：${item.Location.Value || ''}`}
            </Text>
            <View style={{ width: 8 }} />
            {showRemark && item.Location.Comment ?
              <Remark click={() => this.setState({ remarkVisible: true, remarkTitle: '发现位置', remarkContent: item.Location.Comment })} />
              : null}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
          {imgs}
        </View>
      </View>
    )
  }

  _renderEmpty() {
    return (
      <View style={{ height: 280, alignItems: 'center', justifyContent: 'center' }}>
        <Image style={{ width: 60, height: 40 }} source={require('../../../images/empty_box/empty_box.png')} />
        <Text style={{ fontSize: 15, color: '#888', marginTop: 10 }}>暂无巡检日志</Text>
      </View>
    )
  }

  _menuClick(item) {
    this.setState({ modalVisible: false }, () => {
      setTimeout(() => {
        if (item.title === '删除') {
          this._deleteLog();
          return;
        }
        this._editOrAddLog(false, this.state.editLog);
      }, 400);
    });
  }

  _deleteLog() {
    Alert.alert(
      '',
      `删除该条巡检日志？`,
      [
        { text: '取消', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        {
          text: '删除', onPress: () => {
            let logs = this.state.logs;
            let index = logs.indexOf(this.state.editLog);
            if (index >= 0) {
              logs.splice(index, 1);
              this.setState({ logs });
            }
          }
        },
      ]
    )
  }

  _getActionSheet() {
    let arrActions = [{ title: '编辑' }, { title: '删除' }];
    if (this.state.modalVisible) {
      return (
        <SchActionSheet title={''} arrActions={arrActions} modalVisible={this.state.modalVisible}
          onCancel={() => {
            this.setState({ 'modalVisible': false });
          }}
          onSelect={item => this._menuClick(item)}>
        </SchActionSheet>
      )
    }
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
              // this.props.serviceTicketExecute(this.props.ticketId);
              this.props.executeTicket(false)
            }
          },
        ]
      )
      return false;
    }
    return true;
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

  _submit() {
    if (!this._checkAction()) return;
    let data = {
      MaintenanceInfo: this.state.selectMap,
      InspectionInfoList: this.state.logs
    }
    this.props.submit(data);
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
    let actions = [];
    return (
      <View style={{ flex: 1, backgroundColor: LIST_BG }}>
        <Toolbar
          title={this.props.data.info.title}
          navIcon="back"
          noShadow={true}
          actions={this._onlyShow() ? [] : [{ title: '完成' }]}
          onActionSelected={[this._submit.bind(this)]}
          onIconClicked={() => this._processBack()}
        />
        <ScrollView style={{ flex: 1, marginBottom: isPhoneX() ? 34 : 0 }} showsVerticalScrollIndicator={false}>
          {this._renderTask()}
          {this._renderLog()}
        </ScrollView>
        {this._getActionSheet()}
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
    status: serviceTicket.get('data').Status,
    ticketId: serviceTicket.get('data').Id,
  }
}

export default connect(mapStateToProps, { serviceTicketExecute })(TaskView);
