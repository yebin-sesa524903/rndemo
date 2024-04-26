import React, { Component } from "react";
import { View, Text, StyleSheet, InteractionManager, Image, Alert } from 'react-native';
import TouchFeedback from "../TouchFeedback";
import Toolbar from "../Toolbar";
import InputDialog from "../InputDialog";
import s from "../../styles/commonStyle";
import { Table } from "../Table";
import { GREEN } from "../../styles/color";
import AssetModal from "./assetModal";
import ListModal from "./listModal";
import DateTimePicker from "react-native-modal-datetime-picker";
import moment from "moment";
import Toast from "react-native-root-toast";
import Loading from '../Loading'

const CELL_BG = {
  backgroundColor: 'rgba(61, 205, 88, 0.06)'
}

const BILL_STATE = {
  edit: 0,
  read: 1,
  finish: 2,
  fill: 3,//补全状态
}

const KEYS = {
  nameFrom: "commander",
  timeFrom: "commandTime",
  nameTo: "commandReceiver",
  timeTo: "powerOffTime",
  tdph: 'circuitSerialNumber',
  tdhl: 'circuitName',
  tdyy: "powerOffReason",
  workName: "checkedBy",
  gjdx: "isGroundWireConnected",
  bh: "code",
  result: 'powerOperationResult',//"operationTicketStatus",
  processComplete: 'processComplete',
  operatorBill: "operationTicketId",
  workBill: "workTicketId",
  pds: 'organization',
  createTime: 'createdTime',
  commandTicketType: 'commandTicketType',
  operationType: 'operationType',
  roomHierarchyId: 'roomHierarchyId',
  circuitHierarchyId: 'circuitHierarchyId',
  id: 'id',
  status: 'status'
}

const FORMAT_DAY = 'YYYY年MM月DD日';
const TIME_FORMAT = 'YYYY-MM-DD HH:mm';
const TDYY = ['检修', '调试', '生产需要', '事故'];
const SDYY = ['检修完成', '调试完成', '生产需要', '事故'];

export default class CommandBill extends Component {
  constructor(props) {
    super(props);
    this.state = { billState: BILL_STATE.edit, data: {} };
    //this._propsToState(props.data,true)
  }

  _propsToState(pdata, isConstructor) {
    let data = this.state.data
    let propsData = pdata.toJS()
    Object.assign(data, propsData)
    if (propsData.id) {
      this.state.billState = BILL_STATE.read
    }
    if (!isConstructor) this.setState({})
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.data !== this.props.data) {
      this._propsToState(nextProps.data)
    }
  }

  _renderTitle() {
    return (
      <View style={[s.r, s.bt, { marginTop: -4, marginBottom: 12 }]}>
        <Text style={[s.f14, { color: '#333' }]}>{`单位：${this.state.data[KEYS.pds] || ''}`}</Text>
        <Text style={[s.f14, { color: '#333' }]}>{moment(this.state.data[KEYS.createTime]).format(FORMAT_DAY)}</Text>
        <Text style={[s.f14, { color: '#333', minWidth: 160 }]}>{'编号：' + (this.state.data[KEYS.bh] || '')}</Text>
      </View>
    )
  }

  _getUsers(type) {
    if (type)
      return this.props.persons.filter(item => item.workerType === type).map(item => item.workerName)
    else return this.props.persons.filter(item => item.workerType !== '发令人').map(item => item.workerName)
  }

  _clickKey(key) {
    this._editKey = key;
    switch (key) {
      case KEYS.nameFrom:
        this._editListData = {
          title: '命令者姓名',
          list: this._getUsers('发令人')
        }
        this._showListModal();
        break;
      case KEYS.nameTo:
        this._editListData = {
          title: '受令者姓名',
          list: this._getUsers()
        }
        this._showListModal();
        break;
      case KEYS.timeFrom:
      case KEYS.timeTo:
        this._showDateModal();
        break;
      case KEYS.tdph:
      case KEYS.tdhl:
        this._showAssetModal();
        break;
      case KEYS.tdyy:
        let operationType = this.state.data[KEYS.operationType];
        this._editListData = {
          title: `${operationType === 1 ? "送电" : "停电"}原因`,
          list: operationType === 1 ? SDYY : TDYY,
        }
        this._showListModal();
        break;
      case KEYS.workName:
        this._editListData = {
          title: '检查电工姓名',
          list: this._getUsers()
        }
        this._showListModal();
        break;
      case KEYS.gjdx:
        this._editListData = {
          title: '挂接地线',
          list: [{ title: '断开接地刀闸', value: 1 }, { title: '闭合接地刀闸', value: 0 }, { title: '保留接地刀闸', value: 2 }],
          noInput: true
        }
        this._showListModal();
        break;
    }
  }

  _renderReadItem(label) {
    return (
      <View style={[{ padding: 6.4, borderRadius: 2, margin: 12 }]}>
        <Text style={{ fontSize: 14, color: '#333' }}>{label}</Text>
      </View>
    )
  }

  _clickItem(key, label = '请选择', style) {
    if (this.state.data[key]) label = this.state.data[key];
    let isFillKey = key === KEYS.workName || key === KEYS.gjdx;
    //挂接地线 显示 和 值分开
    if (key === KEYS.gjdx) {
      if (this.state.data[key] === 1) {
        label = '断开接地刀闸';
      } else if (this.state.data[key] === 0) {
        label = '闭合接地刀闸';
      } else if (this.state.data[key] === 2) {
        label = '保留接地刀闸';
      }
    }
    switch (this.state.billState) {
      case BILL_STATE.edit:
        if (isFillKey) {
          return this._renderReadItem(label);
        }
        break;
      case BILL_STATE.fill:
        if (!isFillKey) {
          return this._renderReadItem(label);
        }
        break;
      default:
        return this._renderReadItem(label);
    }
    return (
      <View style={[{ margin: 12 }]}>
        <TouchFeedback onPress={() => this._clickKey(key)}>
          <View style={[s.col, style, { padding: 6.4, borderRadius: 2 }]}>
            <Text style={{ fontSize: 14, color: '#999' }}>{label}</Text>
          </View>
        </TouchFeedback>
      </View>
    )
  }

  _renderCommandFrom(data) {
    return (
      <View style={[s.r]}>
        <View style={[s.center, s.cel, s.ph16, CELL_BG, { borderRightWidth: 0, width: 74 }]}>
          <Text style={[s.f14, { width: 18, color: '#333', textAlignVertical: 'center' }]}>{data.label}</Text>
        </View>
        <View style={[s.f, { width: 168 }]}>
          <View style={[s.r, s.cel2]}>
            <View style={[s.center, s.cel3, s.g3, CELL_BG]}>
              <Text style={[s.f14, { color: '#333' }]}>{data.nameLabel}</Text>
            </View>
            <View style={[s.cel3, s.g9]}>
              {this._clickItem(data.nameKey, data.name)}
            </View>
          </View>
          <View style={[s.r, s.cel]}>
            <View style={[s.center, s.cel3, s.g3, CELL_BG]}>
              <Text style={[s.f14, { color: '#333' }]}>{data.timeLabel}</Text>
            </View>
            <View style={[s.cel3, s.g9]}>
              {this._clickItem(data.timeKey, data.time)}
            </View>
          </View>
        </View>

      </View>
    )
  }

  _dismissInputDialog() {
    this.setState({ inputDialog: false })
  }

  _showInputDialog() {
    this.setState({ inputDialog: true })
  }

  _renderInputDialog() {
    if (this.state.inputDialog) {
      let editListData = this._editListData;
      return (
        <InputDialog title={editListData.title}
          onClick={(txt) => {
            this._dismissInputDialog();
            let data = this.state.data;
            data[this._editKey] = txt;
            this.setState({ data })
          }}
          onCancel={this._dismissInputDialog.bind(this)} />
      )
    }
    return null;
  }

  _renderCell() {
    return (
      <TouchFeedback onPress={() => {
        let count = this.state.count || 0;
        count++;
        this.setState({ count })
      }}>
        <View style={[s.p16]}>
          <Text>{``}</Text>
        </View>
      </TouchFeedback>
    )
  }

  _renderLabel(label, style) {
    return (
      <View style={[s.p16, s.center, s.r, s.f, CELL_BG, style]}>
        <Text style={{ fontSize: 14, color: '#333' }}>{label}</Text>
      </View>
    )
  }

  _renderButton(label, click, isFill = false, enable = true) {
    let color = '#fff';
    let backgroundColor = '#fff';
    let border = {};
    if (enable && !isFill) {
      color = GREEN;
    }
    if (!enable) backgroundColor = '#284e9866';
    else {
      if (isFill) {
        backgroundColor = GREEN;
      } else {
        border = {
          borderWidth: 1,
          borderColor: GREEN
        }
      }
    }
    return (
      <TouchFeedback style={[s.f]} key={label} enabled={enable} onPress={() => click()}>
        <View style={[s.center, border, { flex: 1, borderRadius: 2, height: 46, backgroundColor, paddingVertical: 8 }]}>
          <Text style={[{ fontSize: 16, color }]}>{label}</Text>
        </View>
      </TouchFeedback>
    )
  }


  _dismissAssetModal() {
    this.setState({ assetModal: false })
  }
  _showAssetModal() {
    this.setState({ assetModal: true })
  }
  _renderAssetModal() {
    if (this.state.assetModal) {
      return <AssetModal show={this.state.assetModal}
        assets={this.props.assets}
        onClickAsset={(data, index) => {
          this._dismissAssetModal();
          let obj = this.state.data;
          obj[KEYS.roomHierarchyId] = data.id;
          obj[KEYS.circuitHierarchyId] = data.children[index].id
          obj[KEYS.tdph] = data.children[index].serialNumber;
          obj[KEYS.tdhl] = data.children[index].name
          this.setState({});
        }}
        onCancel={this._dismissAssetModal.bind(this)}
        title={'测试'} />
    }
    return null;
  }

  _showListModal() {
    this.setState({ listModal: true })
  }

  _dismissListModal() {
    this.setState({ listModal: false })
  }

  _inputClick() {
    this._dismissListModal();
    setTimeout(() => {
      this._showInputDialog();
    }, 200);
  }

  _renderListModal() {
    if (this.state.listModal) {
      let editListData = this._editListData;
      return (
        <ListModal show={this.state.listModal} title={editListData.title} onCancel={this._dismissListModal.bind(this)}
          onInputClick={this._inputClick.bind(this)} showInput={editListData.noInput ? false : true}
          items={editListData.list} onItemClick={(index) => {
            this._dismissListModal();
            let data = this.state.data;
            let v = editListData.list[index];
            if (this._editKey === KEYS.gjdx) v = v.value;
            data[this._editKey] = v;
            this.setState({ data });
          }}
        />
      )
    }
    return null;
  }

  _showDateModal() {
    this.setState({ dateModal: true })
    setTimeout(() => {
      this.setState({})
    }, 10)
  }
  _dismissDateModal() {
    this.setState({ dateModal: false })
  }

  _renderDateModal() {
    if (!this.state.dateModal) return null;
    let min = null, max = null;
    if (this._editKey === KEYS.timeFrom) {
      if (this.state.data[KEYS.timeTo]) {
        max = moment(this.state.data[KEYS.timeTo]).toDate()
      }
    } else {
      if (this.state.data[KEYS.timeFrom]) {
        min = moment(this.state.data[KEYS.timeFrom]).toDate()
      }
    }
    return (
      <DateTimePicker
        is24Hour={true}
        titleIOS={'选择日期'}
        headerTextIOS={'选择日期'}
        titleStyle={{ fontSize: 17, color: '#333' }}
        cancelTextIOS={'取消'}
        confirmTextIOS={'确定'}
        mode={'datetime'}
        maximumDate={max}
        minimumDate={min}
        datePickerModeAndroid={'spinner'}
        date={new Date()}
        onDateChange={(date) => {
          //this.setState({date})
        }}
        isVisible={this.state.dateModal}
        onConfirm={(date) => {
          let data = this.state.data;
          data[this._editKey] = moment(date).format('YYYY-MM-DD HH:mm')
          this.setState({ dateModal: false, data });
        }}
        onCancel={() => {
          this.setState({ dateModal: false })
        }}
      />
    )
  }

  _getTitleLabel() {
    if (this.state.billState === BILL_STATE.edit) return '保存';
    if (this.state.billState === BILL_STATE.read) return '编辑';
  }

  _checkArray = (keys) => {
    ///检查两个值 1.isGroundWireConnected  2.checkedBy
    /// 有一个为空 则 "完成" 按钮不可点击 true 可点击  false 不可点击
    let enable = true;
    if (this.state.data === undefined) {
      enable = false;
    } else {
      for (let key of keys) {
        if (this.state.data[key] === null ||
          this.state.data[key] === undefined) {
          enable = false;
          break;
        }
      }
    }
    return enable;
  }

  _enable() {
    switch (this.state.billState) {
      case BILL_STATE.edit:
        return this._checkArray([KEYS.nameFrom, KEYS.nameTo, KEYS.timeFrom, KEYS.timeTo,
        KEYS.tdph, KEYS.tdhl, KEYS.tdyy]);
      case BILL_STATE.read:
        return true;
    }
    return false;
  }

  _doSave() {
    switch (this.state.billState) {
      case BILL_STATE.edit:
        if (moment(this.state.data[KEYS.timeFrom]).isAfter(moment(this.state.data[KEYS.timeTo]))) {
          Toast.show('受令时间不能早于命令时间', {
            duration: Toast.durations.SHORT,
            position: Toast.positions.BOTTOM - 80,
          });
          return;
        }
        this.props.saveCommandBill(this.state.data)
        return;
      case BILL_STATE.read:
        this.setState({ billState: BILL_STATE.edit })
        break;
    }
  }

  _createOrOpenOperateBill(bill) {
    this.props.generateOperateBill()
  }

  _createOrOpenWorkBill(bill) {
    this.props.generateJobBill()
  }

  _fillBill = () => {
    this.props.fillCommandBill({
      "checkedBy": this.state.data[KEYS.workName],
      "commandTicketId": this.state.data.id,
      "isGroundWireConnected": this.state.data[KEYS.gjdx]
    });
  }

  _cancelFillBill = () => {
    let data = this.state.data;
    data[KEYS.gjdx] = null;
    data[KEYS.workName] = null;
    this.setState({ data, billState: BILL_STATE.read });
  }

  _renderOperateBillButton() {
    let data = this.state.data;
    let txt = data[KEYS.operatorBill] ? '查看操作票' : '生成操作票';
    let fn = () => this._createOrOpenOperateBill(data[KEYS.operatorBill]);
    return this._renderButton(txt, fn, !data[KEYS.operatorBill], true)
  }
  _renderWorkBillButton() {
    let data = this.state.data;
    let txt = data[KEYS.workBill] ? '查看工作票' : '生成工作票';
    let fn = () => this._createOrOpenWorkBill(data[KEYS.workBill]);
    //已补全的
    let canDo = true
    if (this.state.data[KEYS.status] === 2 ||
      (this.state.data[KEYS.processComplete] && this.state.data[KEYS.result] === 2)) {
      if (!data[KEYS.workBill]) canDo = false;
    }
    return this._renderButton(txt, fn, !data[KEYS.workBill], canDo)
  }

  _renderFillButton() {
    if (!this.state.data[KEYS.processComplete]) return null;
    if (this.state.data[KEYS.status] === 2) return null;
    let data = this.state.data;
    if (!data[KEYS.gjdx] && data[KEYS.result]) {
      // return [
      //   this._renderButton('补全命令票',()=>this.setState({billState:BILL_STATE.fill}),false,true),
      //   <View key={'fillSep'} style={{width:16}}/>
      // ]
      return this._renderButton('补全命令票', () => this.setState({ billState: BILL_STATE.fill }), false, true)
    }
    return null;
  }

  _renderButtons() {
    if (this.state.billState === BILL_STATE.edit) return null;
    let buttons = [];

    switch (this.state.billState) {
      case BILL_STATE.fill:
        buttons = [
          this._renderButton("取消", this._cancelFillBill, true, true),
          <View style={{ width: 16 }} key={'sep'} />,
          this._renderButton("完成", this._fillBill, true, this._checkArray([KEYS.gjdx, KEYS.workName]))
        ]
        break;
      default:
        // buttons = [
        //   this._renderOperateBillButton(),
        //   <View style={{width:16}} key={'sep'}/>,
        //   this._renderFillButton(),
        //   this._renderWorkBillButton()
        // ]
        if (this.props.billPermission.operate.canCreate) {
          buttons.push(this._renderOperateBillButton())
          //buttons.push(<View style={{width:16}} key={'sep'}/>)
        }
        if (this.props.billPermission.command.canCreate) {
          buttons.push(this._renderFillButton())
        }
        if (this.props.billPermission.job.canCreate) {
          buttons.push(this._renderWorkBillButton())
        }
        buttons = buttons.map((item, index) => {
          if (index > 0) {
            return [
              <View style={{ width: 16 }} key={'sep'} />,
              item
            ]
          }
          return item;
        })
        break;
    }
    return (
      <View style={[s.f, { justifyContent: 'flex-end', marginHorizontal: -16, marginBottom: -16 }]}>
        <View style={[s.p16, s.r, { borderTopWidth: 1, borderTopColor: '#d9d9d9' }]}>
          {buttons}
        </View>
      </View>
    )

  }

  _renderResult() {
    if (this.state.data[KEYS.status] !== 2 && !this.state.data[KEYS.processComplete]) return null;
    if (!this.state.data[KEYS.result]) return null;
    let img = null;
    let txt = '正常';
    let color = GREEN;
    if (this.state.data[KEYS.result] !== 1) {
      color = '#333'
      txt = '异常'
      img = <Image source={require('../../images/bill/stamp_reject.png')} width={82} height={82} />
    } else {
      img = <Image source={require('../../images/bill/stamp_complete.png')} width={82} height={82} />
    }
    return (
      <View style={[s.r, s.center, s.f, {}]}>
        <Text style={{ fontSize: 16, color, marginRight: 12 }}>{txt}</Text>
        {img}
      </View>
    )
  }

  _renderLoading() {
    return (
      <View style={[s.f, { backgroundColor: '#fff' }]}>
        <Toolbar
          title='停电命令票'
          navIcon="back"
          onIconClicked={() => this.props.navigation.pop()}
        />
        <Loading />
      </View>
    )
  }

  _getTitleAction() {
    if (!this.props.billPermission.command.canCreate) return null;
    if (this.state.data[KEYS.operatorBill] || this.state.data[KEYS.workBill]) return null;
    return [{ title: this._getTitleLabel(), disable: !this._enable() }]
  }

  _getTitle() {
    let operate = this.state.data[KEYS.operationType] === 1 ? '送电' : '停电'
    let type = this.state.data[KEYS.commandTicketType] === 1 ? '命令票' : '申请票'
    return `${operate}${type}`
  }

  render() {
    if (this.props.isFetching) return this._renderLoading();
    let operate = this.state.data[KEYS.operationType] === 1 ? '送电' : '停电'
    return (
      <View style={[s.f, { backgroundColor: '#fff' }]}>
        <Toolbar
          title={this._getTitle()}
          navIcon="back"
          actions={this._getTitleAction()}
          onActionSelected={[() => this._doSave()]}
          onIconClicked={() => this.props.onBack()}
        />
        <View style={[s.p16, s.f]}>
          {this._renderTitle()}
          <View style={[]}>
            <View style={[]}>
              <View>
                {this._renderCommandFrom({
                  label: this.state.data[KEYS.commandTicketType] === 1 ? '命令者' : '申请人', nameLabel: '姓名',
                  timeLabel: this.state.data[KEYS.commandTicketType] === 1 ? '命令时间' : '申请时间',
                  nameKey: KEYS.nameFrom, timeKey: KEYS.timeFrom
                })}
              </View>
              <View style={[{ marginTop: -1 }]}>
                {this._renderCommandFrom({
                  label: this.state.data[KEYS.commandTicketType] === 1 ? '受令者' : '值班所负责人', nameLabel: '姓名',
                  timeLabel: this.state.data[KEYS.commandTicketType] === 1 ? '受令时间' : '确认时间',
                  nameKey: KEYS.nameTo, timeKey: KEYS.timeTo
                })}
              </View>
            </View>
            <View style={[s.negT, { marginTop: -1, height: 560 }]}>
              <Table grid={'2;4;2;4;2;4;2;4;2;10;2;10'}>
                {this._renderLabel(`${operate}盘号`)}
                {this._clickItem(KEYS.tdph)}
                {this._renderLabel(`${operate}回路`)}
                {this._clickItem(KEYS.tdhl)}
                {this._renderLabel('是否挂接地线', s.ph0)}
                {this._clickItem(KEYS.gjdx, '')}
                {this._renderLabel('检查电工姓名', s.ph0)}
                {this._clickItem(KEYS.workName, '')}
                {this._renderLabel(`${operate}原因`)}
                {this._clickItem(KEYS.tdyy, '请选择', { height: 102 })}
                {this._renderLabel(`${operate}结果`, { height: 300, flex: undefined })}
                {this._renderResult()}
              </Table>
              <Text style={{ fontSize: 14, color: '#fbb325', marginTop: 0 }}>* 规定：电话命令完后，受令者复诵一次</Text>
            </View>
          </View>
          {this._renderButtons()}
        </View>
        {this._renderInputDialog()}
        {this._renderAssetModal()}
        {this._renderListModal()}
        {this._renderDateModal()}
      </View>
    )
  }
}
