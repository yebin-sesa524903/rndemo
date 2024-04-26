import React, { Component } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Image,
  TouchableWithoutFeedback, Alert, Dimensions
} from 'react-native';
import TouchFeedback from "../TouchFeedback";
import Toolbar from "../Toolbar";
import InputDialog from "../InputDialog";
import s from "../../styles/commonStyle";
import { Table } from "../Table";
import { GREEN } from "../../styles/color";
import AssetModal from "./assetModal";
import ListModal from "./listModal";
import DateTimePicker from "react-native-modal-datetime-picker";
import Icon from "../Icon";
import TicketSign from "../../containers/ticket/TicketSign";

import SchActionSheet from "../actionsheet/SchActionSheet";
import Toast from "react-native-root-toast";
import moment from "moment";
import Loading from "../Loading";
import NetworkImage from "../NetworkImage";
const TIME_FORMAT = 'YYYY-MM-DD HH:mm';
const CELL_BG = 'rgba(61, 205, 88, 0.07)';
const DEFAULT_ROWS = 12;
let S_W = Dimensions.get('window').width;
let S_H = Dimensions.get('window').height;
//任务项状态
const TASK_STATE = {
  EDIT: 1,//可编辑
  READ: 2,//只读
  COMPLETE: 3,//已完成
  DONG: 4,//进行中
  WAITING: 5,//待执行
}

const RESULT = {
  DONG: 1,//未完成状态
  FINISH: 2,//已完成状态
  REJECT: 3,//已作废状态
}

//任务表状态
const BILL_TASK_STATE = {
  EDIT: 0,
  READ: 1,
  DOING: 2,
  COMPLETE: 3,
  REJECTING: 4
}

const KEYS = {
  remark: 'comment',
  num: 'code',
  beginTime: 'operationBeginTime',
  endTime: 'operationEndTime',
  sign1: 'operator',
  sign2: 'guardian',
  sign3: 'personInCharge',
  taskProgress: 'taskProgress',
  result: 'status',
  commander: 'commander',
  commandReceiver: 'commandReceiver',
  commandTime: 'commandTime',
  organization: 'organization',
  organizationHierarchyId: 'organizationHierarchyId',
  circuitSerialNumber: 'circuitSerialNumber',
  circuitName: 'circuitName',
  circuitHierarchyId: 'circuitHierarchyId',
  operationStepList: 'operationStepList',
  operationTask: 'operationTask',
  ticketType: 'ticketType',
  operationType: 'operationType'
}

const LABELS_PRE = {
  commander: '发令人：',
  commandReceiver: '受令人：',
  operationType: '操作任务：'
}
const LABELS_END = {
  commander: '',
  commandReceiver: '',
  operationType: '高压电源'
}

export default class OperateBill extends Component {
  constructor(props) {
    super(props);
    this.state = {
      billState: BILL_TASK_STATE.EDIT,
      data: {}
    };
    //this._propsToState(props.data,true)
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.data !== this.props.data) {
      this._propsToState(nextProps.data)
    }
    if (nextProps.steps !== this.props.steps) {
      this._makeTaskList(nextProps.steps)
    }
  }

  _propsToState(pdata, isConstructor) {
    let data = this.state.data
    let propsData = pdata.toJS()
    Object.assign(data, propsData)
    if (propsData.id) {
      this.state.billState = BILL_TASK_STATE.READ
    }
    if (propsData[KEYS.beginTime] && this.props.billPermission.operate.canExe) {
      this.state.billState = BILL_TASK_STATE.DOING
    }
    switch (propsData[KEYS.result]) {
      case RESULT.REJECT:
      case RESULT.FINISH:
        this.state.billState = BILL_TASK_STATE.COMPLETE
        break;
    }
    if (!isConstructor) {
      this.setState({})
      this._restoreState()
    }
  }

  _renderTitle() {
    return (
      <View style={[s.r, s.bt, { marginVertical: 12 }]}>
        <Text style={[s.f14, { color: '#333' }]}>{`单位：${this.state.data[KEYS.organization]}`}</Text>
        <Text style={[s.f14, { color: '#333' }]}>{`编号：${this.state.data[KEYS.num] || '    '}`}</Text>
      </View>
    )
  }

  _getUsers(type) {
    if (type)
      return this.props.persons.filter(item => item.workerType === type).map(item => item.workerName)
    else return this.props.persons.filter(item => item.workerType !== '发令人').map(item => item.workerName)
  }

  _clickKey(key) {
    let list = [], title = '', onClick;
    switch (key) {
      case KEYS.commander:
        title = '请选择发令人';
        list = this._getUsers('发令人')
        onClick = (index) => this.state.data[key] = list[index]
        break;
      case KEYS.commandReceiver:
        title = '请选择受令人';
        list = this._getUsers()
        onClick = (index) => this.state.data[key] = list[index]
        break;
      case KEYS.operationType:
        //判断是否是停送电
        let assetKey = this.state.data[KEYS.operationType] === 1 ? 'powerUp' : 'powerDown'
        list = this.props.assets[assetKey].map(item => `${item.name}(${item.serialNumber})`)
        title = '请选择回路';
        onClick = (index) => {
          let item = this.props.assets[assetKey][index];
          this.state.data[KEYS.circuitHierarchyId] = item.hierarchyId;
          this.state.data[KEYS.circuitSerialNumber] = item.serialNumber;
          this.state.data[KEYS.circuitName] = item.name;
          this.state.data[KEYS.operationStepList] = []
          this.state.data[KEYS.operationTask] =
            `${this.state.data[KEYS.operationType] === 1 ? '送' : '停'}${this.state.data[KEYS.circuitName]}(${this.state.data[KEYS.circuitSerialNumber]})高压电源`
          //重新调整task
          this.setState({})
        }
        break;
    }
    this._editList = {
      key,
      items: list,
      title,
      onClick
    }
    this._showListModal();
  }

  _clickEditItem(key) {
    let label = this.state.data[key] || '请选择'
    let preTitle = LABELS_PRE[key];
    if (key === KEYS.operationType) {
      preTitle += this.state.data[KEYS.operationType] === 1 ? '送' : '停'
      if (this.state.data[KEYS.circuitName])
        label = `${this.state.data[KEYS.circuitName]}(${this.state.data[KEYS.circuitSerialNumber]})`
      else label = '请选择'
    }
    let endTitle = LABELS_END[key]
    return (
      <View key={key} style={[s.r, s.ac, { minHeight: 44, paddingHorizontal: 8 }]}>
        <Text style={[s.f14, { color: '#333', marginRight: 8 }]}>{preTitle}</Text>
        <TouchFeedback onPress={() => this._clickKey(key)}>
          <View style={[s.col, s.p8, { borderRadius: 2, flex: 1, paddingVertical: 4 }]}>
            <Text style={[s.f14]}>{label}</Text>
          </View>
        </TouchFeedback>
        <Text style={[s.f14, { color: '#333', marginLeft: 8 }]}>{endTitle}</Text>
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
      return (
        <InputDialog onCancel={this._dismissInputDialog.bind(this)} />
      )
    }
    return null;
  }

  _renderLabel(label, style = {}) {
    return (
      <View key={label} style={[s.jc, { height: 44 }, style]}>
        <Text style={{ fontSize: 14, color: '#333', marginLeft: 12 }}>{label}</Text>
      </View>
    )
  }

  _renderLabel2(label) {
    return (
      <View key={label} style={[s.center, s.f, { height: 44, backgroundColor: 'rgba(61, 205, 88, 0.07)' }]}>
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

  _makeTaskList(tpl) {
    let assets = this.state.data[KEYS.circuitName]
    let data = tpl.map(item => {
      return {
        order: item.order,
        content: `${item.action}${assets}(${this.state.data[KEYS.circuitSerialNumber]})${item.operationContent}`,
        isDone: false,
      }
    });
    this.state.data[KEYS.operationStepList] = data;
    this.setState({})
  }

  _renderListModal() {
    if (this.state.listModal) {
      let { items, title, onClick } = this._editList || {}//this.props.tpl || [];
      return (
        <ListModal show={this.state.listModal} title={title} onCancel={this._dismissListModal.bind(this)}
          onInputClick={this._inputClick.bind(this)} showInput={false}
          items={items} onItemClick={(index) => {
            this._dismissListModal();
            onClick(index)
          }}
        />
      )
    }
    return null;
  }

  _showDateModal() {
    this.setState({ dateModal: true })
  }

  _dismissDateModal() {
    this.setState({ dateModal: false })
  }

  _renderDateModal() {
    if (!this.state.dateModal) return null;
    return (
      <DateTimePicker
        is24Hour={true}
        titleIOS={'选择日期'}
        headerTextIOS={'选择日期'}
        titleStyle={{ fontSize: 17, color: '#333' }}
        cancelTextIOS={'取消'}
        confirmTextIOS={'确定'}
        mode={'date'}
        maximumDate={new Date()}
        datePickerModeAndroid={'spinner'}
        date={this.state.date}
        onDateChange={(date) => {
          this._selectDate = date;
          this.setState({ date })
        }}
        isVisible={this.state.dateModal}
        onConfirm={(date) => {
          this.setState({ dateModal: false });
        }}
        onCancel={() => {
          this.setState({ dateModal: false })
        }}
      />
    )
  }

  _renderBlank() {
    return (
      <View style={[{ height: 44 }]} />
    )
  }

  _getSendOrStop() {
    if (this.state.data.operationType) {
      if (this.state.data.operationType === 1) return '送'
      return '停'
    }
    return '';
  }

  //由工作票创建的操作票，编辑时，发令人，受令人和操作任务中的回路是可以选择编辑的
  _renderEditTop() {
    return [
      this._clickEditItem(KEYS.commander),
      this._clickEditItem(KEYS.commandReceiver),
      this._renderLabel(`发令时间：${moment(this.state.data[KEYS.commandTime]).format(TIME_FORMAT)}`),
      this._renderLabel(`开始操作时间：${this.state.data[KEYS.beginTime] || ''}`),
      this._renderLabel(`结束操作时间：${this.state.data[KEYS.endTime] || ''}`),
      this._clickEditItem(KEYS.operationType),
      this._renderLabel2('顺序'),
      this._renderOperateCell()
    ]
  }

  _renderTop() {
    if (this.state.billState === BILL_TASK_STATE.EDIT && this.state.data[KEYS.ticketType] === 2) return this._renderEditTop()
    return [
      this._renderLabel(`发令人：${this.state.data[KEYS.commander]}`),
      this._renderLabel(`受令人：${this.state.data[KEYS.commandReceiver]}`),
      this._renderLabel(`发令时间：${moment(this.state.data[KEYS.commandTime]).format(TIME_FORMAT)}`),
      this._renderLabel(`开始操作时间：${this.state.data[KEYS.beginTime] || ''}`),
      this._renderLabel(`结束操作时间：${this.state.data[KEYS.endTime] || ''}`),
      this._renderLabel(`操作任务：${this.state.data[KEYS.operationTask]}`, { minHeight: 44, height: undefined, paddingVertical: 6 }),
      this._renderLabel2('顺序'),
      this._renderOperateCell()
    ]
  }

  _renderOperateCell() {
    let hasData = this._hasTasks(true);//this.state.data && this.state.data.length > 0;
    let addView = null;
    if (this.state.billState === BILL_TASK_STATE.EDIT) {
      addView = (
        <TouchFeedback enabled={this.state.data[KEYS.circuitHierarchyId] || false} onPress={() => {
          this._editList = {
            items: this.props.tpl || [],
            title: '选择操作项模板',
            onClick: index => {
              this.props.loadSteps(this.props.tpl[index].templateId)
            }
          }
          this._showListModal()
        }}>
          <Text style={[s.p16, { color: GREEN, fontSize: 14 }]}>{hasData ? '重新添加' : '添加'}</Text>
        </TouchFeedback>
      )
    }
    return (
      <View key={'op'} style={[s.r, s.ac, { height: 44, marginLeft: 12 }]}>
        <Text style={{ fontSize: 14, color: '#333' }}>项目操作</Text>
        {addView}
      </View>
    )
  }

  //思路就是固定+可变（可变由模板数据或者自定义数据构成）+ 备注
  _renderMarkRow() {
    let v = null;
    let label = '备注(选填)';
    //根据状态是显示编辑态还是只读态
    switch (this.state.billState) {
      case BILL_TASK_STATE.READ:
        label = '备注'
        break;
      case BILL_TASK_STATE.EDIT:
      case BILL_TASK_STATE.DOING:
      case BILL_TASK_STATE.REJECTING:
        v = (
          <View key={'remark'} style={[s.r, s.f, s.ac, { paddingVertical: 0, paddingHorizontal: 12 }]}>
            <TextInput
              style={{
                fontSize: 14, flex: 1, backgroundColor: 'white', borderRadius: 1.6,
                margin: 0, paddingHorizontal: 8, paddingVertical: 0,
                borderWidth: 1, borderColor: '#999'
              }}
              autoFocus={false}
              autoCapitalize={'none'}
              underlineColorAndroid={'transparent'}
              textAlign={'left'}
              placeholderTextColor={'#b2b2b2'}
              textAlignVertical={'center'}
              placeholder={'请输入'}
              onChangeText={(task) => {
                let obj = this.state.data;
                obj[KEYS.remark] = task;
                this.setState({})
              }}
              value={this.state.data[KEYS.remark]}
            />
          </View>
        )
        break;
      case BILL_TASK_STATE.COMPLETE:
        label = '备注';
      default:
        v = (
          <View style={[s.f, s.jc, { minHeight: 44, paddingHorizontal: 12, paddingVertical: 6 }]}>
            <Text style={[s.f14, { color: '#333' }]}>{this.state.data[KEYS.remark]}</Text>
          </View>
        )
        break;
    }
    return [
      this._renderLabel2(label),
      v
    ];
  }

  _renderNumberLabel(num) {
    return (
      <View style={[s.f, s.center, { height: 44, backgroundColor: CELL_BG }]}>
        <View style={[s.center, { width: 22, height: 22, borderRadius: 11, backgroundColor: GREEN }]}>
          <Text style={[s.f14, { color: '#fff' }]}>{num}</Text>
        </View>
      </View>
    )
  }

  _delTask(taskIndex) {
    // this.state.data.splice(taskIndex, 1);
    this.state.data[KEYS.operationStepList].splice(taskIndex, 1);
    this.setState({})
  }

  _addTask(taskIndex) {
    this._taskIndex = taskIndex;
    this.setState({ addModal: true })
  }

  _taskChanged(taskIndex, content) {
    // this.state.data[taskIndex] = content;
    this.state.data[KEYS.operationStepList][taskIndex].content = content;
    this.setState({})
  }

  _taskFinish(taskIndex) {
    // let taskProgress = this.state.taskProgress || 0;
    // taskProgress++;
    this.state.data[KEYS.operationStepList][taskIndex].isDone = true;
    this._recordState();
    this.props.saveBill(this.state.data);
    // this.setState({})
  }

  _renderTaskCell(taskIndex, taskState) {
    let displayContent = this.state.data[KEYS.operationStepList][taskIndex].content
    switch (taskState) {
      case TASK_STATE.EDIT:
        return (
          <View style={[s.r, s.f, s.ac, { paddingVertical: 0, paddingLeft: 12, paddingRight: 16 }]}>
            <TextInput
              style={{
                fontSize: 14,
                flex: 1,
                backgroundColor: 'white', borderRadius: 1.6,
                margin: 0, paddingHorizontal: 8, paddingVertical: 0,
                borderWidth: 1, borderColor: '#999'
              }}
              autoFocus={false}
              autoCapitalize={'none'}
              underlineColorAndroid={'transparent'}
              textAlign={'left'}
              placeholderTextColor={'#b2b2b2'}
              textAlignVertical={'center'}
              placeholder={'请输入配置项'}
              onChangeText={(task) => this._taskChanged(taskIndex, task)}
              value={displayContent}
            />
            <TouchFeedback onPress={() => this._addTask(taskIndex)}>
              <View style={[s.center, s.p16, { paddingVertical: 4, marginRight: -8, paddingLeft: 32 }]}>
                <Icon type={'icon_add2'} color={GREEN} size={22} />
              </View>
            </TouchFeedback>
            <TouchFeedback onPress={() => this._delTask(taskIndex)}>
              <View style={[s.center, s.p16, { paddingVertical: 4, marginRight: -16 }]}>
                <Icon type={'icon_del'} color={'#ff4d4d'} size={20} />
              </View>
            </TouchFeedback>
          </View>
        )
      case TASK_STATE.READ:
        return (
          <View style={[s.f, s.jc, { minHeight: 44, paddingHorizontal: 12, paddingVertical: 6 }]}>
            <Text style={[s.f14, { color: '#333' }]}>{displayContent}</Text>
          </View>
        )
      case TASK_STATE.COMPLETE:
        return (
          <View style={[s.f, s.r, s.ac, { minHeight: 44, paddingHorizontal: 12, paddingVertical: 6 }]}>
            <Text style={[s.f14, s.f, { color: '#555', marginRight: 16 }]}>{displayContent}</Text>
            <View style={[s.r]}>
              <Icon type={'icon_success'} color={GREEN} size={18} />
              <Text style={[s.f14, { color: '#333', marginLeft: 2 }]}>{'已完成'}</Text>
            </View>
          </View>
        )
      case TASK_STATE.DONG:
        return (
          <View style={[s.f, s.r, s.ac, { minHeight: 44, paddingHorizontal: 12, paddingVertical: 6 }]}>
            <Text style={[s.f14, s.f, { color: '#333' }]}>{displayContent}</Text>
            <Text onPress={() => {
              this._taskFinish(taskIndex)
            }} style={[s.f14, { color: GREEN, paddingLeft: 16 }]}>{'完成'}</Text>
          </View>
        )
      case TASK_STATE.WAITING:
        return (
          <View style={[s.f, s.r, s.ac, { paddingHorizontal: 12, minHeight: 44, paddingVertical: 6 }]}>
            <Text style={[s.f14, s.f, { color: '#333' }]}>{displayContent}</Text>
            <Text style={[s.f14, { color: '#c0c0c0', marginLeft: 16 }]}>{'完成'}</Text>
          </View>
        )
    }

  }

  _renderData() {
    let rows = DEFAULT_ROWS;
    let stepList = this.state.data[KEYS.operationStepList];
    let dataLen = -1;
    if (stepList && stepList.length > rows) {
      rows = stepList.length;
    }
    if (stepList && stepList.length > 0) dataLen = stepList.length;
    let arr = [];
    let billState = this.state.billState;
    let taskState = TASK_STATE.COMPLETE;
    for (let i = 0; i < rows; i++) {
      if (i < dataLen) {
        arr.push(this._renderNumberLabel(`${i + 1}`))
        switch (billState) {
          case BILL_TASK_STATE.EDIT:
            arr.push(this._renderTaskCell(i, TASK_STATE.EDIT))
            break;
          case BILL_TASK_STATE.READ:
          case BILL_TASK_STATE.REJECTING:
            arr.push(this._renderTaskCell(i, TASK_STATE.READ))
            break;
          case BILL_TASK_STATE.DOING:
            // let taskProgress = this.state.taskProgress || 0;
            taskState = TASK_STATE.COMPLETE;
            let currentStep = this.state.data[KEYS.operationStepList][i];
            let preStep = i > 0 ? this.state.data[KEYS.operationStepList][i - 1] : null
            if (!currentStep.isDone && (!preStep || (preStep && preStep.isDone))) taskState = TASK_STATE.DONG;
            if (!currentStep.isDone && preStep && !preStep.isDone) taskState = TASK_STATE.WAITING;
            arr.push(this._renderTaskCell(i, taskState))
            break;
          case BILL_TASK_STATE.COMPLETE:
            taskState = this.state.data[KEYS.result] === RESULT.REJECT ? TASK_STATE.READ : TASK_STATE.COMPLETE
            arr.push(this._renderTaskCell(i, taskState))
            break;
        }

      } else {
        //空白行
        arr.push(this._renderLabel2(''))
        arr.push(this._renderBlank())
      }
    }
    return arr;
  }

  _getGrid() {
    let head = '3.5;3.5;5;6;6;12;2;10';
    let tail = '2;10';
    let rows = DEFAULT_ROWS;
    let stepList = this.state.data[KEYS.operationStepList];
    if (stepList && stepList.length > rows) rows = stepList.length;
    let middle = '';
    for (let i = 0; i < rows; i++) {
      middle += ';2;10';
    }
    return `${head}${middle};${tail}`;
  }

  _addRow(isUp) {
    let data = this.state.data[KEYS.operationStepList] || [];
    let addIndex = isUp ? this._taskIndex : this._taskIndex + 1;
    let step = {
      order: addIndex,
      content: `${this.state.data[KEYS.circuitName]}(${this.state.data[KEYS.circuitSerialNumber]})`,
      isDone: false
    }
    data.splice(addIndex, 0, step);
    // data.push('测试任务项')
    this.setState({})

  }

  _changeBillState(billState) {
    this.setState({ billState })
  }

  _clickSign(key) {

  }

  _showSignModal() {
    let arr = this.props.navigator.state.sceneConfigStack;
    this._backConfig = arr[arr.length - 1];
    arr[arr.length - 1] = null;
    this.setState({ signModalVisible: true })
  }

  _hideSignModal() {
    let arr = this.props.navigator.state.sceneConfigStack;
    arr[arr.length - 1] = this._backConfig;
    this.setState({ signModalVisible: false })
  }

  _getSignatureType() {
    switch (this._signKey) {
      case KEYS.sign1: return 1
      case KEYS.sign2: return 2
      case KEYS.sign3: return 3
    }
  }

  _renderSignModal() {
    if (this.state.signModalVisible) {
      if (S_W > S_H) {
        let tmp = S_W
        S_W = S_H
        S_H = tmp
      }
      return (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: '#00000099' }}>
          <TouchableWithoutFeedback style={{ flex: 2.5 }} onPress={() => this._hideSignModal()}>
            <View style={{ height: S_H - S_W / 3 }} />
          </TouchableWithoutFeedback>
          <TicketSign isModal={true}
            onModalBack={() => this._hideSignModal()} sanpiao={true}
            saveSign={(key) => {
              this.state.data[this._signKey] = key//signBase64;
              this._recordState();
              //this.props.saveBill(this.state.data)
            }}
            offlineMode={false} />
        </View>
      );
    }
  }

  _recordState() {
    this._billState = this.state.billState;
  }

  _restoreState() {
    if (this._billState) {
      let billState = this._billState
      this.setState({ billState })
      this._billState = null
    }
  }

  _renderActionSheet() {
    if (this.state.addModal) {
      let actions = [{ title: '在上面添加一条', up: true }, { title: '在下面添加一条' }];
      return (
        <SchActionSheet title={`第${this._taskIndex + 1}条`} arrActions={actions} modalVisible={this.state.addModal}
          onCancel={() => {
            this.setState({ 'addModal': false });
          }}
          onSelect={item => {
            this.setState({ addModal: false }, () => {
              setTimeout(() => {
                this._addRow(item.up)
              }, 200);
            });
          }}
        >
        </SchActionSheet>
      )
    }
  }

  _renderSign() {
    let txt = '点击签名';
    let canSign = false;
    switch (this.state.billState) {
      case BILL_TASK_STATE.READ:
        txt = ''
        break;
      case BILL_TASK_STATE.EDIT:
        canSign = true;
        break;
      case BILL_TASK_STATE.DOING:
        let stepList = this.state.data[KEYS.operationStepList] || []
        let lastIndex = stepList.length - 1;
        //canSign = lastIndex>=0 && stepList[lastIndex].isDone
        break;
      case BILL_TASK_STATE.REJECTING:
        //canSign = true;
        break;
    }
    let signItem = (key, label, img) => {
      let signView = null;
      if (img) {
        signView = (
          <NetworkImage name={img} resizeMode="contain" height={40}
            width={120} style={{ marginLeft: 0 }}
            // imgType='jpg'
            defaultSource={require('../../images/building_default/building.png')}
            useOrigin={true}>
            <TouchFeedback enabled={false}
              style={{ flex: 1, backgroundColor: 'transparent' }}
              onPress={() => { }}>
              <View style={{ flex: 1 }}></View>
            </TouchFeedback>
          </NetworkImage>
        )
      } else {
        signView = <Text style={[s.f14, { color: GREEN }]}>{txt}</Text>
      }
      return (
        <View style={[s.r, s.ac]}>
          <Text style={[s.f14, { color: '#333' }]}>{label}</Text>
          <TouchFeedback enabled={canSign} onPress={() => {
            this._signKey = key;
            this._showSignModal()
          }}>
            <View style={[s.jc, { width: 120, height: 40, backgroundColor: '#fff' }]}>
              {signView}
            </View>
          </TouchFeedback>
        </View>
      )
    }
    return (
      <View style={[s.r, s.bt, { marginTop: 6 }]}>
        {signItem(KEYS.sign1, '操作人：', this.state.data[KEYS.sign1])}
        {signItem(KEYS.sign2, '监护人：', this.state.data[KEYS.sign2])}
        {signItem(KEYS.sign3, '值班负责人(值长)：', this.state.data[KEYS.sign3])}
      </View>
    )
  }

  _doAction = () => {
    switch (this.state.billState) {
      case BILL_TASK_STATE.EDIT:
        let hasEmpty = !this._hasTasks();
        if (hasEmpty) {
          Toast.show('请填写完整操作项目', {
            duration: Toast.durations.SHORT,
            position: Toast.positions.BOTTOM - 80,
          });
          return;
        }
        //调整顺序
        this.state.data[KEYS.operationStepList].forEach((item, index) => {
          item.order = index + 1
        })
        this.props.saveBill(this.state.data)
        return;
      case BILL_TASK_STATE.READ:
        this.state.data[KEYS.sign1] = null;
        this.state.data[KEYS.sign2] = null;
        this.state.data[KEYS.sign3] = null;
        this.setState({ billState: BILL_TASK_STATE.EDIT })
        return
      default:
        return null;
    }
  }

  _hasTasks(onlySize) {
    let stepList = this.state.data[KEYS.operationStepList];
    if (!stepList || stepList.length === 0) return false;
    if (onlySize) return true;
    for (let i = 0; i < stepList.length; i++) {
      let step = stepList[i];
      if (!step.content || !step.content.trim()) return false
    }
    return true
  }

  _getAction = () => {
    if (!this.props.billPermission.operate.canCreate) return;
    switch (this.state.billState) {
      case BILL_TASK_STATE.EDIT:
        let canDo = true
        if (!this.state.data[KEYS.commander] || !this.state.data[KEYS.commandReceiver]) canDo = false;
        return [{ title: '保存', disable: !canDo || !(this._hasTasks(true)) || !this._checkKeyValue([KEYS.sign1, KEYS.sign2, KEYS.sign3]) }]
      case BILL_TASK_STATE.READ:
        return [{ title: '编辑' }]//this.state.data[KEYS.sign1] ?  null : [{title:'编辑'}] ;
      default:
        return null;
    }
  }

  _openCommandBill = () => {
    this.props.OpenCommandBill()
  }

  _openJobBill = () => {
    this.props.OpenJobBill()
  }

  _beginReject = () => {
    //this.setState({billState:BILL_TASK_STATE.REJECTING})
    Alert.alert("", '作废后，关联的票将⼀并作废，确认作废？', [
      { text: '取消', onPress: () => { } },
      { text: '作废', onPress: this._doReject }
    ])
  }

  _cancelReject = () => {
    if (this.state.data[KEYS.beginTime]) {
      //有开始时间，则说明前一个状态是执行中
      this.setState({ billState: BILL_TASK_STATE.DOING })
    } else {
      //否则就是未开始执行
      this.setState({ billState: BILL_TASK_STATE.READ })
    }
  }

  _doReject = () => {
    if (!this._checkArray([KEYS.sign1, KEYS.sign2, KEYS.sign3])) {
      Toast.show('请完成签字后重试', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM - 80,
      });
      return;
    }
    this.props.rejectBill(this.state.data);
  }

  _gap(key) {
    return <View key={key} style={{ width: 16 }} />
  }

  _beginExecute = () => {
    this.props.beginExecute();
  }

  _doExecute = () => {
    if (!this._checkArray([KEYS.sign1, KEYS.sign2, KEYS.sign3])) {
      Toast.show('请完成签字后重试', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM - 80,
      });
      return;
    }
    this.props.finishBill(this.state.data);
  }

  _checkArray = (keys) => {
    for (let i = 0; i < keys.length; i++) {
      if (!this.state.data[keys[i]]) return false;
    }
    return true;
  }

  _isTaskDone() {
    let isDone = false;
    if (this.state.data[KEYS.operationStepList]) {
      isDone = true
      if (this.state.data[KEYS.operationStepList].find(item => !item.isDone)) {
        isDone = false;
      }
    }
    return isDone;
  }

  _renderButtons() {
    if (this.state.billState === BILL_TASK_STATE.EDIT) return null;
    let buttons = [];
    switch (this.state.billState) {
      case BILL_TASK_STATE.READ:
        //判断当前是有命令票创建的，还是由工作票创建的
        if (this.state.data[KEYS.ticketType] === 1) {
          if (this.props.billPermission.command.canRead) {
            buttons.push(this._renderButton('查看命令票', this._openCommandBill))
          }
        } else {
          if (this.props.billPermission.job.canRead) {
            buttons.push(this._renderButton('查看工作票', this._openJobBill))
          }
        }

        if (this.props.billPermission.operate.canExe) {
          if (buttons.length > 0) {
            buttons.push(this._gap('gap2'))
          }
          buttons.push(this._renderButton('作废', this._beginReject));
          buttons.push(this._gap('gap2'));
          buttons.push(this._renderButton('开始操作', this._beginExecute, true))
        }
        break;
      case BILL_TASK_STATE.DOING:
        if (!this.props.billPermission.operate.canExe) break;
        //只有在任务都完成并且签名完成后，结束操作才可点击
        let enable = this._checkArray([KEYS.sign1, KEYS.sign2, KEYS.sign3]);
        buttons = [
          this._renderButton('作废', this._beginReject),
          this._gap('gap1'),
          this._renderButton('结束操作', this._doExecute, true, this._isTaskDone()),
        ]
        break;
      case BILL_TASK_STATE.REJECTING:
        if (!this.props.billPermission.operate.canExe) break;
        buttons = [
          this._renderButton('取消', this._cancelReject),
          this._gap('gap1'),
          this._renderButton('确认作废', this._doReject, true),
        ]
        break;
      case BILL_TASK_STATE.COMPLETE:
        //判断当前是有命令票创建的，还是由工作票创建的
        if (this.state.data[KEYS.ticketType] === 1) {
          if (this.props.billPermission.command.canRead) {
            buttons.push(this._renderButton('查看命令票', this._openCommandBill))
          }
        } else {
          if (this.props.billPermission.job.canRead) {
            buttons.push(this._renderButton('查看工作票', this._openJobBill))
          }
        }
        break;
    }
    if (buttons.length === 0) return null;
    return (
      <View style={[{ marginHorizontal: -16, marginBottom: 0, marginTop: 6 }]}>
        <View style={[s.p16, s.r, { borderTopWidth: 1, borderTopColor: '#d9d9d9' }]}>
          {buttons}
        </View>
      </View>
    )
  }

  _renderResult() {
    if (this.state.billState !== BILL_TASK_STATE.COMPLETE) return;
    let isOk = this.state.data[KEYS.result] === RESULT.FINISH;
    return (
      <View style={[s.center, { position: "absolute", bottom: 200, left: 0, right: 0 }]}>
        {
          isOk ? <Image source={require('../../images/bill/stamp_complete.png')} style={{ width: 90, height: 90 }} />
            : <Image source={require('../../images/bill/stamp_reject.png')} style={{ width: 90, height: 90 }} />
        }
      </View>
    )
  }

  _renderLoading() {
    return (
      <View style={[s.f, { backgroundColor: '#fff' }]}>
        <Toolbar
          title='操作票'
          navIcon="back"
          onIconClicked={() => this.props.onBack()}
        />
        <Loading />
      </View>
    )
  }

  _checkKeyValue(arr, any = false) {
    if (any) {
      //如果一个有值，就为true
      if (arr.find(key => this.state.data[key])) return true;
      return false;
    }
    //所有有值才为true
    if (arr.find(key => !this.state.data[key])) return false;
    return true;
  }

  render() {
    if (this.props.isFetching) return this._renderLoading();
    return (
      <View style={[s.f, { backgroundColor: '#fff' }]}>
        <Toolbar
          title='操作票'
          navIcon="back"
          actions={this._getAction()}
          onIconClicked={() => this.props.onBack()}
          onActionSelected={[this._doAction]}
        />
        <View style={[s.f, s.ph16]}>
          <View style={[s.f]}>
            <ScrollView style={[s.f]} showsVerticalScrollIndicator={false}>
              {this._renderTitle()}
              <View style={[{}]}>
                <Table grid={this._getGrid()}>
                  {this._renderTop()}
                  {this._renderData()}
                  {this._renderMarkRow()}
                </Table>
                {this._renderSign()}
              </View>
            </ScrollView>
            {this._renderButtons()}
          </View>
        </View>
        {this._renderResult()}
        {this._renderInputDialog()}
        {this._renderListModal()}
        {this._renderDateModal()}
        {this._renderSignModal()}
        {this._renderActionSheet()}
      </View>
    )
  }
}
