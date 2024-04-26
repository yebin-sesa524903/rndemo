import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  InteractionManager,
  ScrollView,
  TextInput,
  Image,
  TouchableWithoutFeedback, Platform, Alert, Dimensions
} from 'react-native';
import TouchFeedback from "../TouchFeedback";
import Toolbar from "../Toolbar";
import InputDialog from "../InputDialog";
import s from "../../styles/commonStyle";
import { Table } from "../Table";
import { GREEN, TICKET_STATUS } from "../../styles/color";
import AssetModal from "./assetModal";
import ListModal from "./listModal";
import DateTimePicker from "react-native-modal-datetime-picker";
import Icon from "../Icon";
import TicketSign from "../../containers/ticket/TicketSign";
import billTaskTpl, { jobTaskTpl, STAFF, STAFF_GROUP, testAsset } from "./billTaskTpl";
import SchActionSheet from "../actionsheet/SchActionSheet";
import Orientation from "react-native-orientation";
import Scan from "../../containers/assets/Scan";
import Toast from "react-native-root-toast";
import EditJobTaskModal from "./editJobTaskModal";
import moment from "moment";
import AssignCommandBillModal from "./assignCommandBillModal";
import Loading from "../Loading";
import NetworkImage from "../NetworkImage";
const TIME_FORMAT = 'YYYY-MM-DD HH:mm';
const TS = { ...s.f14, color: '#333' }
const TS2 = { ...s.f14, color: '#999' }

//编辑项的状态
const ITEM_STATE = {
  NONE: 1,
  SELECT: 2,
  N_SELECT: 3,
  SIGN: 4,
  N_SIGN: 5,
  READ: 6,
  INPUT: 7,
  N_INPUT: 8,
  ASSETS: 9,
  ASSETS_READ: 10,
  SIGN_IMG: 11,
  RESULT: 12,
  M_SELECT: 13,//多选
}

const T_S = '请选择';
const T_I = '请输入';
const RESULT_OK = 2;
const RESULT_REJECT = 1;

const KEYS = {
  //许可时间
  XK_TIME: 'key1',
  XK_SIGN1: 'key2',
  XK_SIGN2: 'key3',
  //工作负责人变动
  BD_OLD: 'key1',
  BD_NOW: 'key2',
  BD_TIME: 'key3',
  BD_SIGN: 'key4',
  //票据延期
  YQ_TIME: 'key1',
  YQ_SIGN1: 'key2',
  YQ_SIGN2: 'key3',
  //工作总结
  ZJ_TIME: 'key1',
  ZJ_SIGN1: 'key2',
  ZJ_SIGN2: 'key3',
  ZJ_JDD: 'key4',
  ZJ_GROUP: 'key5',
  ZJ_SIGN3: 'key6',
  //检修和实验结果
  JX_RESULT: 'executionResult',
  //备注
  REMARK: 'content',
  //工作负责人
  GZFZR: 'key1',
  BZ: 'key2',
  //工作班人员
  GZBYY: 'key1',
  RS: 'key2',
  //工作内容
  GZNR: 'workContent',
  GZDD: 'workPlaceName',
  GZDDID: 'workPlaceId',
  //工作时间
  JH_START: 'planStartTime',
  JH_END: 'planEndTime',
  //选择的资产（回路）
  ASSETS: 'circuitHierarchyName',
  ASSETS_ID: 'circuitHierarchyId',
  TASK: 'safetyMeasure',
  TASK_ITEMS: 'safetyMeasureItems',
  //表格里面的签名字段
  TABLE_SIGN1: 'safetyWorkUserSign',
  TABLE_SIGN2: 'safetyDutyUserSign',
  TABLE_TIME: 'safetyAcceptTime',
  TABLE_SIGN3: 'safetyPermitUserSign',
  TABLE_SIGN4: 'safetyPermitDutyUserSign',
  //编号
  NUM: 'code',
  BILL_STATE: 'billState',
  //工作票回收
  HS_SIGN: 'completeWorkUserSign',
  HS_TIME: 'completeTime',
  //关联命令票
  COMMAND_BILL: 'commandTicketId',
  BDS: 'acceptSubstationHierarchyName',
  BDSID: 'acceptSubstationHierarchyId',
  ORDER_ITEMS: 'workTicketOrderItems',
  ORDER_ITEM_CONTENT: 'contentJson',
  ORDER_ITEM_NUMBER: 'orderNumber',
  CREATE_OPERATE: 'create_operate',
}

let S_H = Dimensions.get('window').width;
let S_W = Dimensions.get('window').height;

const TABLE_KEYS = [KEYS.TABLE_SIGN1, KEYS.TABLE_SIGN2, KEYS.TABLE_SIGN3, KEYS.TABLE_SIGN4];
const BILL_STATE = {
  EDIT: 1,
  READ: 2,
  AUTH_CHECK: 11,//工作票开始前权限检查
  SAFE_DOING: 3,//安全措施执行中
  ORDER_DOING: 4,//工作项执行中
  DUTY_CHANGING: 8,//工作负责人变更中
  DUTY_SIGNING: 9,//工作负责人变动签名中
  DUTY_WAITING_SIGN: 10, //等待负责人变更签名
  FINISHED: 5,//有检修结果
  RECYCLED: 6,//已回收
  WAITING_RECYCLE: 7,//待回收
}

export default class JobBill extends Component {
  constructor() {
    super();
    this.state = {
      data: {},
      isSafeDoing: false, ///记录安全措施 是否正在执行
    };
    this.state[KEYS.BILL_STATE] = BILL_STATE.EDIT;
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.data !== this.props.data) {
      //如果是绑定命令票成功
      if (nextProps.data.get(KEYS.COMMAND_BILL) !== this.props.data.get(KEYS.COMMAND_BILL)
        && this.props.data.get('id')
      ) {
        this.state.data[KEYS.COMMAND_BILL] = nextProps.data.get(KEYS.COMMAND_BILL);
        this.setState({});
      } else {
        this._propsToState(nextProps.data)
      }

    }
    if (nextProps.tplInfo !== this.props.tplInfo) {
      if (this._updateTask) {
        this._makeTaskList(nextProps.tplInfo);
      }
      this._updateTask = false;
    }
  }

  /**
   * 检查安全措施项是否有未执行
   * @param data
   * @returns {boolean}
   * @private
   */
  _isSafeDone(data) {
    let tasks = data[KEYS.TASK][KEYS.TASK_ITEMS];
    if (tasks.find(item => item.operateStatus !== 2)) {
      return false;
    }
    return true;
  }

  /**
   * 检查安全措施项是否 都还未执行
   *
   * @param data
   * @returns {boolean} ture 全都未执行  false 至少有一个执行或执行中
   * @private operateStatus 0待执行，1，执行中 2，已完成
   */
  _isSafetyItemIsAllUndone(data) {
    let isAllUndone = true;
    let tasks = data[KEYS.TASK][KEYS.TASK_ITEMS];
    for (let task of tasks) {
      if (task.operateStatus === 1 || task.operateStatus === 2) {
        isAllUndone = false;
        break;
      }
    }
    return isAllUndone;
  }

  _propsToState(pdata, isConstructor) {
    let data = this.state.data
    let propsData = pdata.toJS()
    Object.assign(data, propsData)
    if (propsData.id) {
      this.state[KEYS.BILL_STATE] = BILL_STATE.READ;
      if (this.state.data[KEYS.TASK][KEYS.TABLE_SIGN2]) {
        if (this._isSafetyItemIsAllUndone(propsData)) {
          if (this.props.billPermission.job.canExe) {
            this.state[KEYS.BILL_STATE] = BILL_STATE.AUTH_CHECK;
          }
        } else {
          if (!this._isSafeDone(propsData)) {
            if (!this.state.isSafeDoing) {
              this.state[KEYS.BILL_STATE] = BILL_STATE.AUTH_CHECK;
            } else {
              if (this.props.billPermission.job.canExe)
                this.state[KEYS.BILL_STATE] = BILL_STATE.SAFE_DOING;
            }
          } else {
            this.state[KEYS.BILL_STATE] = BILL_STATE.READ;
          }
        }
      }
      //判断是否是待签名状态-->变更负责人没签名，其他字段有值
      if (this._checkOrderItems(8, [KEYS.BD_OLD, KEYS.BD_NOW, KEYS.BD_TIME]) &&
        !this._checkOrderItems(8, [KEYS.BD_SIGN])) {
        this.state[KEYS.BILL_STATE] = BILL_STATE.DUTY_WAITING_SIGN;
      }
      if (this.state.data[KEYS.JX_RESULT]) this.state[KEYS.BILL_STATE] = BILL_STATE.FINISHED;
      if (this.state.data[KEYS.HS_SIGN]) this.state[KEYS.BILL_STATE] = BILL_STATE.RECYCLED;
    }
    if (!isConstructor) {
      this.setState({})
    }
  }

  _renderTitle() {
    return (
      <View style={[s.r, s.bt, s.ac, s.p16, { paddingVertical: 4 }]}>
        <Text style={[TS]}>{`厂（公司）：${this.state.data.customerName || ''}`}</Text>
        <View style={[s.r, s.ac]}>
          <Text style={[TS]}>{`变电所 ：`}</Text>
          {this._clickItem(KEYS.BDS, '请选择', { minWidth: 140, maxWidth: 240 })}
        </View>
        <Text style={[TS]}>{`编号：${this.state.data[KEYS.NUM] || '          '}`}</Text>
      </View>
    )
  }

  _doPickTime(key, gid) {
    this._time = key;
    this._gid = gid;
    this._showDateModal();
  }

  _doSelectList(items, title, gid, showInput, key, multi = false, sel = []) {
    this._showListModal({
      items,
      title,
      gid,
      showInput,
      key,
      multi, sel,
      onListClick: (index) => {
        let obj = this.state.data;
        switch (key) {
          case KEYS.CREATE_OPERATE:
            console.warn('选择结果', items[index]);
            this.props.createOperateBill(items[index]);
            break;
          case KEYS.GZDD:
            let preGZDD_ID = obj[KEYS.GZDDID];
            let preGZDD = obj[KEYS.GZDD];
            if (preGZDD !== items[index].title || !preGZDD_ID)
              this._checkClearAssetAndTask();
            let data = this.state.data;
            data[KEYS.GZDD] = items[index].title;
            data[KEYS.GZDDID] = items[index].id
            this.setState({});
            break;
          case KEYS.BDS:
            let preId = obj[KEYS.BDSID];
            obj[KEYS.BDS] = items[index].title;
            obj[KEYS.BDSID] = items[index].id
            if (preId !== obj[KEYS.BDSID]) {
              //变电所变动了，那么需要重新修改工作地点，选择的回路和安全措施
              this._checkClearAssetAndTask(true)
              this.props.changeSubstation({
                acceptSubstationHierarchyId: items[index].id,
                acceptSubstationHierarchyName: items[index].title
              })
            }
            this.setState({});
            break;
          case KEYS.JX_RESULT:
            obj[KEYS.JX_RESULT] = index === 0 ? 2 : 1;
            this.setState({ changed: true })
            break;
          default:
            if (gid) {
              //判断是不是点击的工作班人员
              if (gid === 2 && key === KEYS.GZBYY) {
                //这里做特殊处理
                let ry = this._getOrderItemValue(gid, key) || [];
                let findIndex = ry.findIndex(p => p === items[index]);
                if (findIndex === -1) ry.push(items[index])
                else ry.splice(findIndex, 1);
                this._setOrderItemValue(gid, key, ry);
                this.setState({ changed: true });
              } else {
                this._setOrderItemValue(gid, key, items[index])
                this.setState({ changed: true });
              }
            } else {

            }
        }
      }
    });
  }

  _getFZRList = () => {
    return this.props.person.filter(item => item.workerType !== '发令人').map(item => item.workerName)
  }

  _getBZList = () => {
    let ret = [];
    let arr = this.props.person.filter(item => item.workerTeam).forEach(item => {
      if (!ret.includes(item.workerTeam)) {
        ret.push(item.workerTeam)
      }
    });
    return ret;
  }

  _getGZBYYList = () => {
    return this.props.person.filter(item => item.workerType !== '发令人').map(item => item.workerName)
  }

  _orderItemsKeyClick(key, gid) {
    let title = '';
    let items = [];
    this._gid = gid;
    switch (gid) {
      case 1:
        if (key === KEYS.GZFZR) {
          title = '选择工作负责人'
          items = this._getFZRList();
        } else {
          title = '选择班组'
          items = this._getBZList();
        }
        this._doSelectList(items, title, gid, true, key)
        break;
      case 2:
        title = '选择工作班人员'
        items = this._getGZBYYList();
        let ry = this._getOrderItemValue(gid, key) || []
        this._doSelectList(items, title, gid, true, key, true, ry)
        break;
      case 7:
        if (key === KEYS.XK_TIME) {
          this._doPickTime(key, gid)
        }
        break;
      case 8:
        if (key === KEYS.BD_TIME) {
          this._doPickTime(key, gid)
        } else {
          if (key === KEYS.BD_OLD) {
            title = '选择原工作负责人'
            items = this._getFZRList();
          } else {
            title = '选择变更后工作负责人'
            items = this._getFZRList();
          }
          this._doSelectList(items, title, gid, true, key)
        }
        break;
      case 9:
        this._doPickTime(key, gid);
        break;
      case 10:
        this._doPickTime(key, gid);
        break;
    }
  }

  _clickKey = (key, gid) => {
    let items = null;
    let title = null;
    let showInput = true;
    if (gid) {
      this._orderItemsKeyClick(key, gid)
      return;
    }
    this._gid = null;
    switch (key) {
      case KEYS.ASSETS:
        if (this.state.data[KEYS.GZDD]) {
          this._showAssetModal();
        } else {
          Toast.show('请先选择工作地点', {
            duration: Toast.durations.SHORT,
            position: Toast.positions.BOTTOM - 80,
          });
        }
        break;
      case KEYS.JH_START:
      case KEYS.JH_END:
        this._doPickTime(key, gid);
        break;
      case KEYS.GZDD:
        //工作地点选项和所选择的配电所相关，所以需要先选择配电所
        if (!this.state.data[KEYS.BDS]) {
          Toast.show('请先选择变电所', {
            duration: Toast.durations.SHORT,
            position: Toast.positions.BOTTOM - 80,
          });
          return;
        }
        if (!items) {
          items = this.props.assets.map(item => {
            return {
              id: item.id, title: item.name
            }
          });
          title = '选择工作地点';
        }

      case KEYS.JX_RESULT:
        if (!items) {
          items = ['合格', '不合格'];
          title = '选择检修和试验结果';
          showInput = false;
        }
      case KEYS.BDS:
        if (!items) {
          if (this.props.substationList) {
            items = this.props.substationList.map(item => {
              return {
                id: item.get('id'), title: item.get('name')
              }
            }).toArray();
          } else items = []
          title = '选择变电所';
          showInput = false;
        }
        this._doSelectList(items, title, gid, showInput, key)
        break;
    }
  }

  _doSign(key, gid) {
    let canDo = true;
    if (!this.props.billPermission.job.canExe) {
      canDo = false;
    }
    if (key === KEYS.TABLE_SIGN1 && this.props.billPermission.job.canCreate) canDo = true;
    if (!canDo) {
      this._gid = null;
      Toast.show('无操作权限', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM - 80,
      });
      return;
    }
    let billState = this.state[KEYS.BILL_STATE];
    if (gid) {
      if (billState !== BILL_STATE.ORDER_DOING && gid !== 8) return;
      if (gid === 8 && (billState !== BILL_STATE.DUTY_SIGNING && billState !== BILL_STATE.DUTY_CHANGING)) return;
      //如果已变更了工作负责人，则再不允许编辑7项
      if (billState === BILL_STATE.ORDER_DOING && gid === 7 && this._checkOrderItems(8, [KEYS.BD_SIGN])) return;
      this._signKey = key;
      this._gid = gid;
      this._showSignModal();
    } else {
      if (TABLE_KEYS.includes(key)) {
        if (!this.state.data[KEYS.TASK]) {
          this.state.data[KEYS.TASK] = {}
        }
        if (key === KEYS.TABLE_SIGN1) {
          if (this._isEdit()) {
            this._signKey = key;
            this._showSignModal();
          }
          return;
        }
        if (this.state.data[KEYS.TASK][key] && key !== KEYS.TABLE_SIGN1) return;
        this._signKey = key;
        this._showSignModal();
      } else {
        if (billState !== BILL_STATE.WAITING_RECYCLE) return;
        this._gid = null;
        this._signKey = key;
        this._showSignModal();
      }
    }
  }

  _checkClearAssetAndTask(all) {
    let data = this.state.data;
    if (all) {
      data[KEYS.GZDD] = null;
      data[KEYS.GZDDID] = null;
    }
    data[KEYS.ASSETS] = [];
    data[KEYS.ASSETS_ID] = [];
    if (data[KEYS.TASK] && data[KEYS.TASK][KEYS.TASK_ITEMS]) {
      data[KEYS.TASK][KEYS.TASK_ITEMS] = [];
    }
  }

  _isEdit() {
    return this.state[KEYS.BILL_STATE] === BILL_STATE.EDIT;
  }

  _getTableKeyStateByPreKey(key) {
    let v = this.state.data[KEYS.TASK][key];
    if (v) return ITEM_STATE.SIGN_IMG;
    let index = TABLE_KEYS.indexOf(key);
    if (index > 0) {
      let preKey = TABLE_KEYS[index - 1];
      if (this.state.data[KEYS.TASK][preKey]) {
        return ITEM_STATE.SIGN;
      } else
        return ITEM_STATE.NONE;
    }
    return ITEM_STATE.SIGN;
  }

  _getTableKeyState(key) {
    if (!this.state.data[KEYS.TASK] || this._isEdit()) return ITEM_STATE.NONE;
    switch (this.state[KEYS.BILL_STATE]) {
      case BILL_STATE.READ:
        return this._getTableKeyStateByPreKey(key);
      case BILL_STATE.AUTH_CHECK:
      case BILL_STATE.SAFE_DOING:
        if (key === KEYS.TABLE_SIGN1 || key === KEYS.TABLE_SIGN2) return ITEM_STATE.SIGN_IMG;
        if (key === KEYS.TABLE_SIGN3 || key === KEYS.TABLE_SIGN4) return ITEM_STATE.NONE;
        break;
      case BILL_STATE.DUTY_CHANGING:
      case BILL_STATE.DUTY_SIGNING:
      case BILL_STATE.DUTY_WAITING_SIGN:
      case BILL_STATE.ORDER_DOING:
      case BILL_STATE.FINISHED:
      case BILL_STATE.RECYCLED:
      case BILL_STATE.WAITING_RECYCLE:
        if (!this.state.data[KEYS.TASK][key]) return ITEM_STATE.NONE;
        return ITEM_STATE.SIGN_IMG;
    }
  }

  _isEditKey(key) {
    return key === KEYS.REMARK//[KEYS.RS,KEYS.ZJ_JDD,KEYS.ZJ_GROUP].includes(key);
  }

  _checkOrderItemsAnyOne(gid, arr) {
    for (let i = 0; i < arr.length; i++) {
      if (this._checkOrderItems(gid, [arr[i]])) return true;
    }
    return false;
  }

  _checkOrderItems(gid, arr) {
    let items = this.state.data[KEYS.ORDER_ITEMS];
    if (!items) return false;
    let find = items.find(item => item[KEYS.ORDER_ITEM_NUMBER] === gid)
    if (find) {
      //如果是工作班人员的判断,人数由人员自定确定，只需要判断人员
      if (gid === 2) {
        let ry = find[KEYS.ORDER_ITEM_CONTENT].key1;
        if (Array.isArray(ry) && ry.length > 0) return true
        if (typeof ry === 'string' && ry) return true;
        return false;
      }
      if (arr.find(item => !find[KEYS.ORDER_ITEM_CONTENT][item])) return false;
      return true;
    }
    return false;
  }

  _getOrderItemValue(gid, key) {
    let items = this.state.data[KEYS.ORDER_ITEMS];
    if (!items) return null;
    let find = items.find(item => item[KEYS.ORDER_ITEM_NUMBER] === gid)
    if (find) {
      if (gid === 2 && key === KEYS.GZBYY) {
        let ry = find[KEYS.ORDER_ITEM_CONTENT][key];
        if (ry && typeof ry === 'string') {
          return ry.split('、')
        }
      }
      return find[KEYS.ORDER_ITEM_CONTENT][key]
    }
    return null;
  }

  _setOrderItemValue(gid, key, value) {
    let items = this.state.data[KEYS.ORDER_ITEMS];
    if (!items) this.state.data[KEYS.ORDER_ITEMS] = items = []
    let find = items.find(item => item[KEYS.ORDER_ITEM_NUMBER] === gid)
    if (find) find[KEYS.ORDER_ITEM_CONTENT][key] = value;
    else {
      let v = {}
      v[key] = value;
      items.push({
        "orderNumber": gid,
        "contentJson": v
      })
    }
  }

  _isFinish1_2 = () => this._checkOrderItems(1, [KEYS.GZFZR, KEYS.BZ]) &&
    this._checkOrderItems(2, [KEYS.GZBYY, KEYS.RS])

  _isFinish7 = () => this._checkOrderItems(7, [KEYS.XK_TIME, KEYS.XK_SIGN1, KEYS.XK_SIGN2])

  _isFinish10 = () => this._checkOrderItems(10, [KEYS.ZJ_TIME, KEYS.ZJ_JDD, KEYS.ZJ_GROUP, KEYS.ZJ_SIGN1, KEYS.ZJ_SIGN2, KEYS.ZJ_SIGN3])

  _getItemState(key, gid) {
    //备注只要是在编辑态，都可以编辑
    if (key === KEYS.REMARK && (this._isEdit() || [BILL_STATE.ORDER_DOING, BILL_STATE.WAITING_RECYCLE].includes(this.state[KEYS.BILL_STATE]))) return ITEM_STATE.INPUT;
    if (key === KEYS.BDS) {
      if (!this.state.data[KEYS.NUM] || (this._isEdit() && !this._checkSafetyMeasure([KEYS.TABLE_SIGN1]))) return ITEM_STATE.SELECT;
      return ITEM_STATE.READ;
    }
    if (!this.state.data[KEYS.NUM] || (this._isEdit() && !this._checkSafetyMeasure([KEYS.TABLE_SIGN2]))) {
      switch (key) {
        case KEYS.GZNR:
          return ITEM_STATE.INPUT;
        case KEYS.GZDD:
        case KEYS.JH_START:
        case KEYS.JH_END:
          return ITEM_STATE.SELECT;
        case KEYS.ASSETS:
          return ITEM_STATE.ASSETS;
        case KEYS.REMARK:
          return ITEM_STATE.INPUT;
        case KEYS.TABLE_SIGN1:
          if (this._checkSafetyMeasure([KEYS.TABLE_SIGN1])) {
            return ITEM_STATE.SIGN_IMG;
          }
          return ITEM_STATE.SIGN;
      }
      return ITEM_STATE.NONE;
    }
    if (TABLE_KEYS.includes(key)) {
      let state = this._getTableKeyState(key)
      return state
    }
    if (gid) {
      let v = this._checkOrderItems(gid, [key]);
      if (this.state[KEYS.BILL_STATE] === BILL_STATE.ORDER_DOING) {
        //判断8变动有没有签名
        if (this._checkOrderItems(8, [KEYS.BD_SIGN])) {
          switch (gid) {
            case 1:
            case 2:
            case 7:
              if (gid === 7 && (key === KEYS.XK_SIGN2 || key === KEYS.XK_SIGN1)) return ITEM_STATE.SIGN_IMG
              return ITEM_STATE.READ
          }
        }

        switch (gid) {
          case 1:
            return ITEM_STATE.SELECT;
          case 2:
            if (key === KEYS.RS) return ITEM_STATE.INPUT;
            return ITEM_STATE.M_SELECT;
          case 7:
            if (this._isFinish1_2()) {
              if (key === KEYS.XK_TIME) return ITEM_STATE.SELECT;
              return (this._checkOrderItems(7, [key])) ? ITEM_STATE.SIGN_IMG : ITEM_STATE.SIGN;
            } else {
              if (key === KEYS.XK_TIME) return ITEM_STATE.N_SELECT;
              return ITEM_STATE.N_SIGN;
            }
          case 8: //单独处理，这里就不处理
            // if(this._isFinish7()) {
            //   if(key === KEYS.BD_SIGN) return (this._checkOrderItems(8,[key])) ? ITEM_STATE.SIGN_IMG:ITEM_STATE.SIGN;
            //   return ITEM_STATE.SELECT;
            // }else {
            //   if(key === KEYS.BD_SIGN) return ITEM_STATE.N_SIGN;
            //   return ITEM_STATE.N_SELECT;
            // }
            if (v) {
              if (key === KEYS.BD_SIGN) return ITEM_STATE.SIGN_IMG
              return ITEM_STATE.READ;
            }
            return ITEM_STATE.NONE
          case 9:
            if (this._isFinish7()) {
              if (key === KEYS.YQ_SIGN1 || key === KEYS.YQ_SIGN2) return (this._checkOrderItems(9, [key])) ? ITEM_STATE.SIGN_IMG : ITEM_STATE.SIGN;
              return ITEM_STATE.SELECT;
            } else {
              if (key === KEYS.YQ_SIGN1 || key === KEYS.YQ_SIGN2) return ITEM_STATE.N_SIGN;
              return ITEM_STATE.N_SELECT;
            }
          case 10:
            if (this._isFinish7()) {
              if (key === KEYS.ZJ_TIME) return ITEM_STATE.SELECT
              if (key === KEYS.ZJ_JDD || key === KEYS.ZJ_GROUP) return ITEM_STATE.INPUT
              else return (this._checkOrderItems(10, [key])) ? ITEM_STATE.SIGN_IMG : ITEM_STATE.SIGN;
            } else {
              if (key === KEYS.ZJ_TIME) return ITEM_STATE.N_SELECT
              if (key === KEYS.ZJ_JDD || key === KEYS.ZJ_GROUP) return ITEM_STATE.N_INPUT
              else return ITEM_STATE.N_SIGN
            }
        }
      } else {
        //针对变更负责人，单独处理
        if (gid === 8) {
          switch (this.state[KEYS.BILL_STATE]) {
            case BILL_STATE.DUTY_CHANGING:
              if (key === KEYS.BD_SIGN) return v ? ITEM_STATE.SIGN_IMG : ITEM_STATE.SIGN
              return ITEM_STATE.SELECT;
            case BILL_STATE.DUTY_SIGNING:
              if (key === KEYS.BD_SIGN) return v ? ITEM_STATE.SIGN_IMG : ITEM_STATE.SIGN
              return ITEM_STATE.READ
            default:
              if (key === KEYS.BD_SIGN) return v ? ITEM_STATE.SIGN_IMG : ITEM_STATE.NONE
              return v ? ITEM_STATE.READ : ITEM_STATE.NONE;
          }
        }
        if (v) {
          if ((gid === 7 && (key === KEYS.XK_SIGN1 || key === KEYS.XK_SIGN2)) ||
            //(gid === 8 && (key === KEYS.BD_SIGN)) ||
            (gid === 9 && (key === KEYS.YQ_SIGN1 || key === KEYS.YQ_SIGN2)) ||
            (gid === 10 && (key === KEYS.ZJ_SIGN1 || key === KEYS.ZJ_SIGN2 || key === KEYS.ZJ_SIGN3))) {
            return ITEM_STATE.SIGN_IMG
          }
          return ITEM_STATE.READ;
        }
        return ITEM_STATE.NONE
      }
    } else {
      switch (this.state[KEYS.BILL_STATE]) {
        case BILL_STATE.DUTY_CHANGING:
        case BILL_STATE.DUTY_SIGNING:
        case BILL_STATE.DUTY_WAITING_SIGN:
          if (this.state.data[key]) {
            return ITEM_STATE.READ;
          }
          return ITEM_STATE.NONE;
        case BILL_STATE.AUTH_CHECK:
        case BILL_STATE.SAFE_DOING:
        case BILL_STATE.READ:
        case BILL_STATE.FINISHED:
          if (this.state.data[key]) {
            if (key === KEYS.JX_RESULT) return ITEM_STATE.RESULT;
            return ITEM_STATE.READ;
          }
          return ITEM_STATE.NONE;
        case BILL_STATE.ORDER_DOING:
          if (key === KEYS.JX_RESULT) {
            if (this.state.data[key]) return ITEM_STATE.RESULT;
            if (this._isFinish10()) {
              return ITEM_STATE.SELECT;
            } else return ITEM_STATE.N_SELECT;
          }
          if (this.state.data[key]) {
            return ITEM_STATE.READ;
          }
          return ITEM_STATE.NONE;
        case BILL_STATE.WAITING_RECYCLE:
          if (key === KEYS.HS_SIGN) return this.state.data[key] ? ITEM_STATE.SIGN_IMG : ITEM_STATE.SIGN;
          if (this.state.data[key]) {
            if (key === KEYS.JX_RESULT) return ITEM_STATE.RESULT
            return ITEM_STATE.READ;
          }
          return ITEM_STATE.NONE;
        case BILL_STATE.RECYCLED:
          if (this.state.data[key]) {
            if (key === KEYS.JX_RESULT) return ITEM_STATE.RESULT
            if (key === KEYS.HS_SIGN) return ITEM_STATE.SIGN_IMG;
            return ITEM_STATE.READ
          }
          return ITEM_STATE.NONE;
      }
    }
    return ITEM_STATE.N_SELECT;
  }

  _renderGZBYY(gid, key, style) {
    let ry = this._getOrderItemValue(gid, key) || []
    let contentView = null;
    if (ry.length === 0) {
      contentView = <Text style={[TS2]}>{'请选择'}</Text>
    } else {
      contentView = ry.map((p, i) => {
        return (
          <View key={i} style={[s.r, s.ac, {
            paddingHorizontal: 6, paddingVertical: 2, margin: 2, borderWidth: 1,
            borderColor: '#d9d9d9', borderRadius: 1.6
          }]}>
            <Text style={[TS2, s.f12, { marginRight: 6 }]}>{p}</Text>
            <TouchFeedback onPress={() => {
              ry.splice(i, 1);
              this._setOrderItemValue(gid, key, ry);
              this.setState({ changed: true })
            }}>
              <View style={[{ marginHorizontal: -6, paddingHorizontal: 6 }, s.center]}>
                <Icon type={'icon_close'} color={'#d9d9d9'} size={10} />
              </View>
            </TouchFeedback>

          </View>
        )
      })
    }
    return (
      <TouchFeedback key={`${gid}-${key}`} onPress={() => this._clickKey(key, gid)}>
        <View style={[s.ac, s.r, {
          borderRadius: 1.6, borderColor: '#999', borderWidth: 1,
          paddingHorizontal: 6, paddingVertical: 6, flexWrap: 'wrap'
        }, style]}>
          {contentView}
        </View>
      </TouchFeedback>
    )
  }

  _clickItem(key, label = '请选择', style = {}, groupId) {
    let itemState = this._getItemState(key, groupId);
    if (this.state.data[key]) label = this.state.data[key];
    if (key === KEYS.GZDD && label) {
      if (label.Name) label = label.Name;
    }
    if (key === KEYS.ASSETS && itemState === ITEM_STATE.READ) {
      if (Array.isArray(label)) {
        label = label.map(item => `${item.name}(${item.serialNumber})`).join('、')
      }
    }
    if (this._isEditKey(key) && itemState === ITEM_STATE.N_SELECT) {
      itemState = ITEM_STATE.N_INPUT;
    }
    if (groupId) {
      //由于工作班人数是自动计算，所以需要特殊对待,是只读，值是有选择的工作班人员自动变化的
      if (groupId === 2 && key === KEYS.RS) {
        itemState = ITEM_STATE.READ
        let bz = this._getOrderItemValue(2, KEYS.GZBYY)
        if (Array.isArray(bz)) label = `${bz.length}`
        else label = '0'
      } else {
        let v = this._getOrderItemValue(groupId, key);
        if (v) {
          if (Array.isArray(v)) label = v.join('、')
          else label = v;
        }
      }

    }
    switch (itemState) {
      case ITEM_STATE.N_INPUT:
        if (!label) label = '请输入';
      case ITEM_STATE.N_SELECT:
        return (
          <View style={[s.jc, {
            height: 32, borderRadius: 1.6, borderWidth: 1, borderColor: '#999',
            backgroundColor: '#f2f2f2', paddingHorizontal: 6
          }, style]}>
            <Text style={[TS2]}>{label}</Text>
          </View>
        )
      case ITEM_STATE.M_SELECT:
        return this._renderGZBYY(groupId, key, style)
      case ITEM_STATE.RESULT:
        let result = this.state.data[key];
        if (result) {
          let img = null, txt;
          if (result === RESULT_OK) {
            txt = '合格';
            img = <Image resizeMethod={"resize"} resizeMode="contain" style={{ height: 72, width: 72 }} source={require('../../images/bill/stamp_complete.png')} />
          } else {
            txt = '不合格';
            img = <Image resizeMethod={"resize"} resizeMode="contain" style={{ height: 72, width: 72 }} source={require('../../images/bill/stamp_reject.png')} />
          }
          return (
            <TouchFeedback enabled={this.state[KEYS.BILL_STATE] === BILL_STATE.ORDER_DOING} onPress={() => this._clickKey(key)}>
              <View style={[s.ac, s.r, style]}>
                <Text style={[TS, { marginRight: 8 }]}>{txt}</Text>
                {img}
              </View>
            </TouchFeedback>
          )
        }

      case ITEM_STATE.SELECT:
        let bds = {}
        return (
          <TouchFeedback onPress={() => this._clickKey(key, groupId)}>
            <View style={[s.jc, {
              minHeight: 32, borderRadius: 1.6, borderColor: '#999', borderWidth: 1,
              paddingHorizontal: 6
            }, style]}>
              <Text style={[TS2, bds]}>{label}</Text>
            </View>
          </TouchFeedback>
        )
      case ITEM_STATE.NONE:
        return (
          <View style={[style, s.jc, { height: 32 }]}>
            <Text style={[TS2]}>{'-'}</Text>
          </View>
        )
      case ITEM_STATE.SIGN:
        return (
          <TouchFeedback onPress={() => this._doSign(key, groupId)}>
            <View style={[s.jc, { height: 32 }, style]}>
              <Text style={[TS2, { color: GREEN }]}>{'点击签名'}</Text>
            </View>
          </TouchFeedback>
        )
      case ITEM_STATE.SIGN_IMG:
        let signKey = this.state.data[key] || 'keyK'
        if (TABLE_KEYS.includes(key)) signKey = this.state.data[KEYS.TASK][key]
        if (groupId) signKey = this._getOrderItemValue(groupId, key);
        return (
          <TouchFeedback onPress={() => this._doSign(key, groupId)}>
            <View style={[s.jc, style]}>
              {/*<Image resizeMethod={"resize"} resizeMode="contain" style={{height: 40,width:120}} source={{uri: label}}/>*/}
              <NetworkImage name={signKey} resizeMode="contain" height={40}
                width={120} style={{}}
                defaultSource={require('../../images/building_default/building.png')}
                useOrigin={true}>
                <TouchFeedback enabled={false}
                  style={{ flex: 1, backgroundColor: 'transparent' }}
                  onPress={() => { }}>
                  <View style={{ flex: 1 }}></View>
                </TouchFeedback>
              </NetworkImage>
            </View>
          </TouchFeedback>
        )
      case ITEM_STATE.N_SIGN:
        let sign_key = null;
        if (groupId) sign_key = this._getOrderItemValue(groupId, key);
        if (sign_key) {
          return (
            <View style={[s.jc, style]}>
              <NetworkImage name={sign_key} resizeMode="contain" height={40}
                width={120} style={{}}
                defaultSource={require('../../images/building_default/building.png')}
                useOrigin={true}>
                <TouchFeedback enabled={false}
                  style={{ flex: 1, backgroundColor: 'transparent' }}
                  onPress={() => { }}>
                  <View style={{ flex: 1 }}></View>
                </TouchFeedback>
              </NetworkImage>
            </View>
          )
        }

        return (
          <View style={[s.jc, { height: 32 }, style]}>
            <Text style={[TS2]}>{'点击签名'}</Text>
          </View>
        )
      case ITEM_STATE.READ:
        return (
          <View style={[s.jc, { minHeight: 32 }, style]}>
            <Text style={[TS]}>{`${label}`}</Text>
          </View>
        )
      case ITEM_STATE.INPUT:
        let multiline = key === KEYS.REMARK;
        return this._edit(key, { style, multiline }, groupId)
      case ITEM_STATE.ASSETS:
        let assets = this.state.data[KEYS.ASSETS];
        if (!assets || assets.length === 0) {
          return (
            <TouchFeedback onPress={() => this._clickKey(key)}>
              <View style={[s.jc, {
                height: 32, borderRadius: 1.6, borderColor: '#999', borderWidth: 1,
                paddingHorizontal: 6
              }, style]}>
                <Text style={[TS2]}>{'请选择'}</Text>
              </View>
            </TouchFeedback>
          );
        }

        assets = this.state.data[KEYS.ASSETS].map((item, index) => {
          return (
            <View key={index} style={[s.r, s.ac, {
              minHeight: 26, borderRadius: 1.6, borderWidth: 1, marginRight: 10, paddingLeft: 8,
              borderColor: GREEN, backgroundColor: 'rgba(61, 205, 88, 0.08)', marginTop: 6
            }]}>
              <Text style={{ fontSize: 12, color: '#333', maxWidth: 566, }}>{`${item.name}(${item.serialNumber})`}</Text>
              <TouchFeedback onPress={() => {
                let assets = this.state.data[KEYS.ASSETS];
                let assetsIds = this.state.data[KEYS.ASSETS_ID];
                let delItem = assets[index];//{name:assets[index],id:assetsIds[index]};
                assets.splice(index, 1);
                assetsIds.splice(index, 1);
                this._changeAssets(null, true, delItem);
              }}>
                <View style={[s.center, { height: 26, paddingHorizontal: 8 }]}>
                  <Icon type={'icon_close'} color={'#999'} size={12} />
                </View>
              </TouchFeedback>
            </View>
          )
        })

        assets.push(
          <TouchFeedback onPress={() => this._showAssetModal()}>
            <View style={[s.center, {
              height: 26, paddingHorizontal: 8, borderRadius: 1.6, borderWidth: 1, marginRight: 10, paddingLeft: 8,
              borderColor: GREEN, backgroundColor: 'rgba(61, 205, 88, 0.08)', marginTop: 6
            }]}>
              <Icon type={'icon_add'} color={'#999'} size={12} />
            </View>
          </TouchFeedback>
        )

        return (
          <View style={[s.r, {
            minHeight: 32, borderRadius: 1.6, borderWidth: 1, borderColor: '#999',
            backgroundColor: '#f2f2f2', paddingHorizontal: 6, flexWrap: 'wrap', paddingBottom: 6
          }, style]}>
            {assets}
          </View>
        )
    }

    return (
      <TouchFeedback onPress={() => this._clickKey(key)}>
        <View style={[s.col, s.p8, { margin: 0, padding: 0, backgroundColor: '#f2f2f2', width: 100, ...style }]}>
          <Text style={[s.f12, { color: style.color || '#666' }]}>{label}</Text>
        </View>
      </TouchFeedback>
    )
  }

  _editTextChange(key, text, gid) {
    text = text.trim();
    if (gid) {
      this._setOrderItemValue(gid, key, text);
      this.setState({ changed: true })
    } else {
      let editData = this.state.data || {}
      editData[key] = text
      this.setState({})
    }

  }

  _edit(key, data = {}, gid) {
    let editData = this.state.data || {}
    let value = '';
    if (gid) {
      value = this._getOrderItemValue(gid, key);
    } else {
      value = editData[key]
    }
    let numberType = [KEYS.RS, KEYS.ZJ_JDD, KEYS.ZJ_GROUP].includes(key);
    let borderColor = '#999';
    // if(numberType && this.state.data[key]){
    //   if(isNaN(Number(this.state.data[key]))) {
    //     borderColor = '#f00';
    //   }
    // }
    let keyboardType = 'default'
    if (gid) {
      if ((gid === 2 && key === KEYS.RS) || (gid === 10 && key === KEYS.ZJ_JDD) || (gid === 10 && key === KEYS.ZJ_GROUP)) {
        keyboardType = 'decimal-pad'
      }
    }
    return (
      <View style={[s.jc, {
        paddingHorizontal: 10, backgroundColor: 'white', minHeight: 32,
        borderRadius: 1.6, borderWidth: 1, borderColor,
        ...data.style
      }]}>
        <TextInput
          style={[TS2, { padding: 0, margin: 0 }]}
          autoFocus={false} keyboardType={keyboardType}
          autoCapitalize={'none'}
          underlineColorAndroid={'transparent'}
          textAlign={'left'}
          multiline={data.multiline}
          placeholderTextColor={'#b2b2b2'}
          textAlignVertical={'center'}
          placeholder={data.label || '请输入'}
          onChangeText={(val) => this._editTextChange(key, val, gid)}
          value={value}
        />
      </View>
    )
  }

  _dismissEditTaskDialog = () => {
    this.setState({ editTaskDialog: false })
  }

  _showEditTaskDialog(data) {
    this._editData = data;
    this.setState({ editTaskDialog: true })
  }

  _renderEditTaskDialog() {
    if (this.state.editTaskDialog) {
      let data = this._editData || {};
      let step = {};
      if (data.add) {
        step = {
          action: '', content: '', select: []
        }
      } else {
        step = { ...data.step }
        step.select = step[KEYS.ASSETS_ID].map((item, index) => {
          return { ...step[KEYS.ASSETS][index], id: item }
        })
      }
      let assets = this.state.data[KEYS.ASSETS].map((item, index) => {
        return { ...item, id: this.state.data[KEYS.ASSETS_ID][index] }
      })
      return (
        <EditJobTaskModal step={step} onCancel={this._dismissEditTaskDialog}
          assets={assets} show={this.state.editTaskDialog}
          onSave={(action, content, select) => {
            if (data.add) {
              let itemAdd = {
                "orderNumber": 1,
                "stepGroup": data.group,
                "action": action,
                "content": content,
                "whetherShowLoop": select.length > 0 ? 1 : 2,
              }
              itemAdd[KEYS.ASSETS_ID] = select.map(item => item.id);
              itemAdd[KEYS.ASSETS] = select.map(item => item);
              this.state.data[KEYS.TASK][KEYS.TASK_ITEMS].splice(data.stepIndex, 0, itemAdd);
              this._taskOrderSort();
            } else {
              data.step.action = action;
              data.step.content = content;
              data.step[KEYS.ASSETS_ID] = select.map(item => item.id);
              data.step[KEYS.ASSETS] = select.map(item => item);
            }
            this._dismissEditTaskDialog();
          }}
        />
      )
    }
    return null;
  }

  _dismissAssetModal() {
    this.setState({ assetModal: false })
  }

  _showAssetModal() {
    this.setState({ assetModal: true })
  }

  _changeAssets = (assets, isDel, asset) => {
    if (assets) {
      this.state.data[KEYS.ASSETS_ID] = assets.map(item => item.id)
      this.state.data[KEYS.ASSETS] = assets.map(item => item)
    }
    let tasks = null;
    if (this.state.data[KEYS.TASK] && this.state.data[KEYS.TASK][KEYS.TASK_ITEMS]) {
      tasks = this.state.data[KEYS.TASK][KEYS.TASK_ITEMS];
    }
    if (tasks) {
      tasks.forEach(task => {
        if (isDel) {
          //移除对应的项
          let findIndex = task[KEYS.ASSETS_ID].findIndex(item => item === asset.id);
          if (findIndex >= 0) {
            task[KEYS.ASSETS].splice(findIndex, 1);
            task[KEYS.ASSETS_ID].splice(findIndex, 1);
          }
        } else {
          //添加对应项
          task[KEYS.ASSETS].push(asset);
          task[KEYS.ASSETS_ID].push(asset.id);
        }
      });
    }
    this.setState({})
  }

  _renderAssetModal() {
    if (this.state.assetModal) {
      let assets = this.props.assets;//testAsset;
      if (this.state.data[KEYS.GZDDID]) {
        assets = assets.filter(item => item.id === this.state.data[KEYS.GZDDID]);
      }
      let select = [];
      if (this.state.data[KEYS.ASSETS_ID]) {
        select = this.state.data[KEYS.ASSETS].map((item, index) => {
          if (item.hierarchyId && !item.id) item.id = item.hierarchyId;
          return item;
        })
      }
      return (
        <AssetModal show={this.state.assetModal} assets={assets}
          multi={true} select={select}
          onMultiSelect={this._changeAssets}
          onCancel={this._dismissAssetModal.bind(this)}
          title={'选择回路'} />
      )
    }
    return null;
  }

  _showListModal(data) {
    this._listData = data;
    this.setState({ listModal: true })
  }

  _dismissListModal() {
    this._listData = null;
    this.setState({ listModal: false })
  }

  _inputClick(key, title) {
    this._dismissListModal();
    setTimeout(() => {
      this._showInputDialog({ title: title || '工作地点', key });
    }, 200);
  }

  _dismissInputDialog() {
    this._inputData = null;
    this.setState({ inputDialog: false })
  }

  _showInputDialog(data) {
    this._inputData = data;
    this.setState({ inputDialog: true })
  }

  _renderInputDialog() {
    if (this.state.inputDialog) {
      let { title, key } = this._inputData;
      return (
        <InputDialog type={key} title={title}
          onCancel={this._dismissInputDialog.bind(this)}
          onClick={(txt, type) => {
            switch (type) {
              case KEYS.GZDD:
                let obj = this.state.data;
                let preGZDD = obj[KEYS.GZDD];
                let preGZDD_ID = obj[KEYS.GZDDID];
                obj[KEYS.GZDD] = txt;//{Name:txt}
                obj[KEYS.GZDDID] = null;
                if (preGZDD !== txt || preGZDD)
                  this._checkClearAssetAndTask();
                this.setState();
                this._dismissInputDialog();
                break;
            }
            if (this._gid) {
              if (this._gid === 2 && key === KEYS.GZBYY) {
                //采用数组形式存储
                let ry = this._getOrderItemValue(this._gid, key) || []
                ry.push(txt)
                this._setOrderItemValue(this._gid, key, ry);
              } else {
                this._setOrderItemValue(this._gid, key, txt);
              }
              this.setState({ changed: true })
              this._dismissInputDialog();
              this._gid = null;
            }
          }}
        />
      )
    }
    return null;
  }

  _makeTaskList(tpl) {
    let data = this.state.data;
    let items = [];
    let index = 1;
    tpl.forEach(t => {
      items.push({
        "orderNumber": index++,
        "stepGroup": t.safetyMeasures,
        "action": t.action,
        "content": t.operationContent,
        "whetherShowLoop": 1,
        "circuitHierarchyId": [].concat(data[KEYS.ASSETS_ID]),
        "circuitHierarchyName": [].concat(data[KEYS.ASSETS])
      })
    })

    if (!data[KEYS.TASK]) {
      data[KEYS.TASK] = {}
    }
    data[KEYS.TASK][KEYS.TASK_ITEMS] = items;
    this.setState({});
  }

  _renderListModal() {
    if (this.state.listModal) {
      let { items, title, showInput, key, onListClick, multi, sel } = this._listData;
      return (
        <ListModal show={this.state.listModal} title={title} onCancel={this._dismissListModal.bind(this)}
          onInputClick={() => this._inputClick(key, title)} showInput={showInput} multi={multi} sel={sel}
          items={items} onItemClick={(index) => {
            if (!multi)
              this._dismissListModal();
            onListClick(index)
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

  _limitDate(key, gid) {
    let ret = {}
    switch (gid) {
      case 7:
        ret.min = moment(this.state.data[KEYS.TASK][KEYS.TABLE_TIME]).add(1, 'm')
        break;
      case 8:
        let xk_time = this._getOrderItemValue(7, KEYS.XK_TIME);
        ret.min = moment(xk_time).add(1, 'm')
        break;
      case 9:
        ret.min = moment(this.state.data[KEYS.JH_END]).add(1, 'm')
        break;
      case 10:
        let min = null
        let xk = this._getOrderItemValue(7, KEYS.XK_TIME);
        if (xk) min = moment(xk).add(1, 'm');
        let bd = this._getOrderItemValue(8, KEYS.BD_TIME);
        if (bd) {
          min = moment(bd).add(1, 'm');
        }
        ret.min = min;
        break;
    }
    return ret;
  }

  _renderDateModal() {
    if (!this.state.dateModal) return null;
    let min = null, max = null;
    if (this._gid) {
      let limit = this._limitDate(this._time, this._gid);
      min = limit.min;
      if (min) min = min.toDate()
      max = limit.max;
      if (max) max = max.toDate()
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
          this._selectDate = date;
          this.setState({ date })
        }}
        isVisible={this.state.dateModal}
        onConfirm={(date) => {
          let obj = this.state.data;
          if (this._gid) { this._setOrderItemValue(this._gid, this._time, moment(date).format(TIME_FORMAT)) }
          else obj[this._time] = moment(date).format(TIME_FORMAT);
          this.setState({ dateModal: false, changed: true });
        }}
        onCancel={() => {
          this.setState({ dateModal: false })
        }}
      />
    )
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

  _renderSignModal() {
    if (this.state.signModalVisible) {
      //判断宽高，防止某种原因导致宽高错位
      if (S_W < S_H) {
        let tmp = S_H
        S_H = S_W;
        S_W = tmp
      }
      console.log('sign modal', S_H - S_W / 3, S_W, S_H)
      return (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: '#00000099' }}>
          <TouchableWithoutFeedback style={{ flex: 1 }} onPress={() => this._hideSignModal()}>
            <View style={{ height: S_H - S_W / 3 }} />
          </TouchableWithoutFeedback>
          <TicketSign isModal={true}
            onModalBack={() => this._hideSignModal()} sanpiao={true}
            saveSign={(signKey) => {
              if (TABLE_KEYS.includes(this._signKey)) {
                if (this._signKey === KEYS.TABLE_SIGN1) {
                  this.state.data[KEYS.TASK][this._signKey] = signKey;
                  this.setState({})
                  return;
                }
                this.props.signBill({
                  "id": this.state.data.id,
                  "signType": this._signKey,
                  "signKey": signKey
                })
                return;
              }
              if (this._gid) {
                this._setOrderItemValue(this._gid, this._signKey, signKey)
                this.setState({ changed: true })
                this._gid = null;
                return;
              }
              this.state.data[KEYS.HS_TIME] = moment().format(TIME_FORMAT)
              this.state.data[this._signKey] = signKey;
              this.setState({})
            }}
            offlineMode={false} />
        </View>
      );
    }
  }

  _renderActionSheet() {
    if (this.state.addModal) {
      let actions = [{ title: '在上面添加一条', up: true }, { title: '在下面添加一条' }];
      return (
        <SchActionSheet title={`添加安全措施`} arrActions={actions} modalVisible={this.state.addModal}
          onCancel={() => {
            this.setState({ 'addModal': false });
          }}
          onSelect={item => {
            this.setState({ addModal: false }, () => {
              setTimeout(() => {
                let editData = this._editData;
                if (!item.up) {
                  editData.stepIndex += 1;
                }
                this._showEditTaskDialog(editData)
              }, 200);
            });
          }}
        >
        </SchActionSheet>
      )
    }
  }

  _renderLabel(label, style = {}) {
    return (
      <Text style={[TS, style]}>{`${label}`}</Text>
    )
  }

  _renderIconTitle(label, style = {}, tipText = null) {
    return (
      <View style={[s.r, s.ac, style]}>
        <Image source={require('../../images/bill/job_arrow.png')} style={{ width: 10, height: 10, marginRight: 3 }} />
        <Text style={[TS]}>{label}{tipText}</Text>
      </View>
    )
  }

  _renderSignItem(label, key, style = {}, gid) {
    return (
      <View style={[s.r, s.ac, style, { backgroundColor: '#fff' }]}>
        <Text style={[TS]}>{label}</Text>
        {this._clickItem(key, '请选择', {}, gid)}
      </View>
    )
  }

  _renderSelectAssets() {
    return (
      <View style={[]}>
        {this._renderIconTitle('5.回路')}
        {this._clickItem(KEYS.ASSETS, '请选择', {
          flex: 1, paddingVertical: 8,
          minHeight: 58, justifyContent: 'flex-start', marginTop: 8
        })}
      </View>
    )
  }

  _addTask = () => {
    //获取工作票模板接口暂时未知，那么先给出固定的数据格式
    let assets = this.state.data[KEYS.ASSETS];
    if (!assets || assets.length === 0) {
      Toast.show('请先选择回路', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM - 80,
      });
      return;
    }
    this._gid = null;
    this._showListModal({
      items: this.props.tpl,
      title: '选择安全措施模板',
      showInput: false,
      key: KEYS.TASK,
      onListClick: (index) => {
        this._updateTask = true;
        this.props.loadTplInfo(this.props.tpl[index].templateId)
      }
    });
  }

  _renderLeftTop() {
    let showAddTask = true;
    if (!this._isEdit()) showAddTask = false;
    let label = '添加';
    let task = this.state.data[KEYS.TASK];
    if (task && task[KEYS.TASK_ITEMS] && task[KEYS.TASK_ITEMS].length > 0) {
      label = '重新添加';
    }

    let safeTipText = null;
    if (this._checkHasUndoneOperationBill() && this.state[KEYS.BILL_STATE] === BILL_STATE.SAFE_DOING) {
      safeTipText = <Text style={{ color: "red", fontSize: 13, }}>(请先完成与工作票关联的所有操作票后再点击“完成”按钮)</Text>;
    }

    return (
      <>
        <View style={[s.r]}>
          <View style={[s.g1]}>
            <View style={[s.r, s.ac]}>
              {this._renderIconTitle('1.工作负责人：')}
              {this._clickItem(KEYS.GZFZR, T_S, { width: 176 }, 1)}
            </View>
            <View style={[s.r, s.ac, { justifyContent: 'flex-end', marginTop: 10, marginRight: 24 }]}>
              {this._renderLabel('班组：')}
              {this._clickItem(KEYS.BZ, T_S, { width: 176 }, 1)}
            </View>
            <View style={[s.r, s.ac, { marginTop: 18, marginBottom: 10 }]}>
              {this._renderIconTitle('2.工作班人员：')}
              {this._clickItem(KEYS.GZBYY, T_S, { width: 176 }, 2)}
            </View>
            <View style={[s.r, s.ac, { justifyContent: 'flex-end', marginRight: 24 }]}>
              {this._renderLabel('人数：')}
              {this._clickItem(KEYS.RS, T_S, { width: 176 }, 2)}
            </View>
          </View>
          <View style={[s.g1, {}]}>
            <View style={[s.r, s.ac, {}]}>
              {this._renderIconTitle('3.工作内容：')}
              {this._clickItem(KEYS.GZNR, T_S, { width: 214 })}
            </View>
            <View style={[s.r, s.ac, { justifyContent: 'flex-end', marginTop: 10 }]}>
              {this._renderLabel('工作地点：')}
              {this._clickItem(KEYS.GZDD, T_S, { width: 214 })}
            </View>
            {this._renderIconTitle('4.计划工作时间', { marginTop: 26 })}
            <View style={[s.r, s.ac, { justifyContent: 'flex-end', marginRight: 0, marginTop: 16 }]}>
              {this._renderLabel('开始时间：')}
              {this._clickItem(KEYS.JH_START, T_S, { width: 214 })}
            </View>
            <View style={[s.r, s.ac, { justifyContent: 'flex-end', marginRight: 0, marginTop: 10 }]}>
              {this._renderLabel('结束时间：')}
              {this._clickItem(KEYS.JH_END, T_S, { width: 214 })}
            </View>
          </View>
        </View>
        {this._renderSelectAssets()}
        <View style={[s.r, s.ac, { marginTop: 40, marginBottom: showAddTask ? 0 : 6 }]}>
          {this._renderIconTitle('6.安全措施', null, safeTipText)}
          {!showAddTask ? null :
            <TouchFeedback onPress={this._addTask}>
              <View style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
                <Text style={[s.f14, { color: GREEN }]}>{label}</Text>
              </View>
            </TouchFeedback>
          }
        </View>
      </>
    )
  }

  _renderRight() {
    return (
      <View style={[{ width: 340, marginLeft: 32 }]}>
        {this._renderIconTitle('7.许可开始工作时间')}
        {this._clickItem(KEYS.XK_TIME, T_S, { width: 313, alignSelf: 'flex-end', marginTop: 6 }, 7)}
        {this._renderSignItem('工作许可人：', KEYS.XK_SIGN1, { marginTop: 6, marginLeft: 27 }, 7)}
        {this._renderSignItem('工作负责人：', KEYS.XK_SIGN2, { marginTop: 6, marginLeft: 27 }, 7)}

        {this._renderIconTitle('8.工作负责人变动', { marginTop: 16, marginBottom: 10 })}
        <View style={{ marginLeft: 27 }}>
          <View style={[s.r, s.ac]}>
            {this._renderLabel('原工作负责人')}
            {this._clickItem(KEYS.BD_OLD, T_S, { width: 174, marginHorizontal: 6 }, 8)}
            {this._renderLabel('离去')}
          </View>
          <View style={[s.r, s.ac, { marginVertical: 12 }]}>
            {this._renderLabel('变更')}
            {this._clickItem(KEYS.BD_NOW, T_S, { width: 174, marginHorizontal: 6 }, 8)}
            {this._renderLabel('为工作负责人')}
          </View>
          <View style={[s.r, s.ac]}>
            {this._renderLabel('变更时间')}
            {this._clickItem(KEYS.BD_TIME, T_S, { width: 174, marginHorizontal: 6 }, 8)}
          </View>
          {this._renderSignItem('工作票签发人签名：', KEYS.BD_SIGN, { marginTop: 6 }, 8)}
        </View>

        {this._renderIconTitle('9.工作票延期', { marginTop: 16, marginBottom: 10 })}
        <View style={{ marginLeft: 27 }}>
          <View style={[s.r, s.ac]}>
            {this._renderLabel('有效期延长到')}
            {this._clickItem(KEYS.YQ_TIME, T_S, { width: 218, marginHorizontal: 6 }, 9)}
          </View>
          {this._renderSignItem('工作负责人：', KEYS.YQ_SIGN1, { marginTop: 6 }, 9)}
          {this._renderSignItem('值班负责人：', KEYS.YQ_SIGN2, { marginTop: 6 }, 9)}
        </View>

        {this._renderIconTitle('10.工作终结', { marginTop: 16, marginBottom: 10 })}
        <View style={{ marginLeft: 27 }}>
          {this._renderLabel('工作人员已全部撤离,现场清理完毕')}
          <View style={[s.r, s.ac, { marginTop: 10 }]}>
            {this._renderLabel('全部工作于')}
            {this._clickItem(KEYS.ZJ_TIME, T_S, { width: 189, marginHorizontal: 6 }, 10)}
            {this._renderLabel('结束')}
          </View>
          {this._renderSignItem('工作负责人：', KEYS.ZJ_SIGN1, { marginTop: 6 }, 10)}
          {this._renderSignItem('工作许可人：', KEYS.ZJ_SIGN2, { marginTop: 6 }, 10)}
          <View style={[s.r, s.ac, { marginTop: 10 }]}>
            {this._renderLabel('接地刀')}
            {this._clickItem(KEYS.ZJ_JDD, T_S, { width: 64, marginHorizontal: 6 }, 10)}
            {this._renderLabel('号等共')}
            {this._clickItem(KEYS.ZJ_GROUP, T_S, { width: 64, marginHorizontal: 6 }, 10)}
            {this._renderLabel('组已拆除')}
          </View>
          {this._renderSignItem('值班负责人：', KEYS.ZJ_SIGN3, { marginTop: 6 }, 10)}
        </View>

        {this._renderIconTitle('11.检修和试验结果', { marginTop: 16, marginBottom: 4 })}
        {this._clickItem(KEYS.JX_RESULT, T_S, { width: 313, alignSelf: 'flex-end', marginTop: 6, height: 58 })}
        {this._renderIconTitle('12.备注（选填）', { marginTop: 16, marginBottom: 4 })}
        {this._clickItem(KEYS.REMARK, T_S, {
          width: 313, alignSelf: 'flex-end', marginTop: 6, height: 58,
          justifyContent: 'flex-start', paddingVertical: 6
        })}
        {this._renderBillRecycle()}
      </View>
    )
  }

  _renderBillRecycle() {
    //已回收，显示已回收UI
    if (this.state.data[KEYS.HS_SIGN]) {
      let txt = '';
      if (this.state[KEYS.BILL_STATE] === BILL_STATE.WAITING_RECYCLE) txt = '检查无误，';
      return (
        <View style={[{ marginTop: 16 }]}>
          {this._renderIconTitle(`13.工作票已于${this.state.data[KEYS.HS_TIME]}${txt}回收`)}
          {this._renderSignItem('工作票签发人：', KEYS.HS_SIGN, { marginTop: 6, marginLeft: 27 })}
        </View>
      )
    }
    //未回收
    return (
      <View style={[s.r, s.ac, { marginTop: 16 }]}>
        {this._renderIconTitle('13.工作票签发人收回工作票：')}
        {this._clickItem(KEYS.HS_SIGN, T_S)}
      </View>
    )
  }

  _renderHeaderCell(label) {
    return (
      <View style={[s.center, { height: 37, backgroundColor: 'rgba(61, 205, 88, 0.07)' }]}>
        <Text style={TS}>{label}</Text>
      </View>
    )
  }

  _renderSignCell(isRight) {
    if (isRight) {
      return (
        <View style={[s.jc, s.f, { padding: 12, height: 120 }]}>
          <View style={[s.r, s.ac]}>
            <Text style={[TS]}>{'工作许可人签名：'}</Text>
            {this._clickItem(KEYS.TABLE_SIGN3)}
          </View>
          <View style={[s.r, s.ac, { marginTop: 10 }]}>
            <Text style={[TS]}>{'值班负责人签名：'}</Text>
            {this._clickItem(KEYS.TABLE_SIGN4)}
          </View>
        </View>
      )
    }
    let sign2 = null;
    if (this.state.data[KEYS.TASK] && this.state.data[KEYS.TASK][KEYS.TABLE_SIGN2]) {
      sign2 = (
        <View style={[{ marginTop: 10 }]}>
          <Text style={[TS]}>{`收到工作票时间：${this.state.data[KEYS.TASK][KEYS.TABLE_TIME]}`}</Text>
          <View style={[s.r, s.ac]}>
            <Text style={[TS]}>{'值班负责人：'}</Text>
            {this._clickItem(KEYS.TABLE_SIGN2)}
          </View>
        </View>
      )
    } else {
      sign2 = (
        <View style={[s.r, s.ac, { marginTop: 10 }]}>
          <Text style={[TS]}>{'值班负责人收到工作票：'}</Text>
          {this._clickItem(KEYS.TABLE_SIGN2)}
        </View>
      )
    }

    return (
      <View style={[s.jc, s.f, { padding: 12, height: 120 }]}>
        <View style={[s.r, s.ac]}>
          <Text style={[TS]}>{'工作票签发人签名：'}</Text>
          {this._clickItem(KEYS.TABLE_SIGN1)}
        </View>
        {sign2}
      </View>
    )
  }

  _renderEmptyCell(key) {
    return (
      <View key={key} style={{ height: 500 }} />
    )
  }

  _taskOrderSort() {
    let tasks = this.state.data[KEYS.TASK][KEYS.TASK_ITEMS];
    //let order = 1;
    tasks.forEach((item, index) => {
      item.orderNumber = index + 1;
    })
    this.setState({})
  }

  _renderTaskCell(task, index, isRight, subIndex) {
    if (isRight && task.operateStatus !== 2 && (this._isEdit() || this.state[KEYS.BILL_STATE] === BILL_STATE.SAFE_DOING || this.state.data[KEYS.TASK][KEYS.TASK_ITEMS][0].operateStatus !== 2)) {
      return null;
    }
    let tasks = this.state.data[KEYS.TASK][KEYS.TASK_ITEMS];
    //判断任务项是否是可编辑状态：是编辑模式，且tablesing2为空
    let canEdit = this.state[KEYS.BILL_STATE] === BILL_STATE.EDIT && !this.state.data[KEYS.TABLE_SIGN2];
    let taskIndex = index;
    let hasPre = index - 1 >= 0;
    let hasNext = index + 1 < tasks.length;
    let showTitle = !hasPre || (hasPre && task.stepGroup !== tasks[index - 1].stepGroup)
    let showDel = false;//task.steps && task.steps.length > 1;
    if (hasNext && hasPre) showDel = task.stepGroup === tasks[index - 1].stepGroup || task.stepGroup === tasks[index + 1].stepGroup
    else if (hasPre) showDel = task.stepGroup === tasks[index - 1].stepGroup
    else if (hasNext) showDel = task.stepGroup === tasks[index + 1].stepGroup
    let subItem = (index) => {
      let step = task;//task.steps[index];
      let assets = '';
      if (step[KEYS.ASSETS]) {
        assets = step[KEYS.ASSETS].map(item => `${item.name}(${item.serialNumber})`).join('、')
      }
      let txt = `${subIndex}.${step.action}${assets}${step.content}`;
      let iconButton = (icon, cb) => {
        return (
          <TouchFeedback onPress={cb}>
            <View style={{ paddingVertical: 10, paddingHorizontal: 4 }}>
              <Icon type={icon} color={GREEN} size={10} />
            </View>
          </TouchFeedback>
        )
      }
      let rightView = null;
      if (canEdit) {
        rightView = (
          <View style={[s.r, s.ac, { paddingLeft: 4, borderLeftColor: '#d9d9d9', borderLeftWidth: 1 }]}>
            {iconButton('icon_edit_pencil', () => {
              this._showEditTaskDialog({ step })
            })}
            {iconButton('icon_add', () => {
              this._editData = {
                add: true, taskIndex, group: step.stepGroup,
                stepIndex: index
              }
              this.setState({ addModal: true })
            })}
            {(showDel) ?
              iconButton('icon_del', () => {
                //task.steps.splice(index,1);
                tasks.splice(index, 1)
                this._taskOrderSort();
                this.setState({})
              }) :
              <View style={{ width: 18 }} />
            }
          </View>
        )
      }
      return (
        <View key={index} style={[s.r, {
          marginTop: 6,
          paddingHorizontal: 10, paddingVertical: 6, borderRadius: 1.6,
          backgroundColor: 'rgba(0, 0, 0, 0.03)', borderWidth: 1, borderColor: '#d9d9d9'
        }]}>
          <Text style={{
            fontSize: 12,
            color: '#333',
            flex: 1,
            textAlignVertical: 'center'
          }}>{txt}</Text>
          {rightView}
        </View>
      )
    }
    let titleView = null;
    if (showTitle) {
      titleView = (
        <View style={[s.r]}>
          <View style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: isRight ? '#e69d0d' : '#284e98',
            marginTop: 6,
            marginRight: 6
          }} />
          <Text style={[{ fontSize: 12, color: '#666', flex: 1 }]}>{`${task.stepGroup}${isRight ? '已完成' : ''}`}</Text>
        </View>
      )
    }
    return (
      <View key={`${index}:${isRight}`} style={[{ padding: 10, marginTop: showTitle ? 0 : -20 }]}>
        {titleView}
        {subItem(index)}
      </View>
    )
  }

  _renderSafeDoingCell(lastIndex, group) {
    let tasks = this.state.data[KEYS.TASK][KEYS.TASK_ITEMS];
    let update = [];
    let doingState = tasks[lastIndex].operateStatus === 2 ? 2 : 0;//0待执行，1，执行中 2，已完成
    let hasValid = false;
    for (let i = lastIndex; i >= 0; i--) {
      let one = tasks[i];
      if (group === one.stepGroup) {
        update.push({
          ...one,
          operateStatus: 2
        })
      } else {
        if (one.operateStatus !== 2) doingState = 0
        else doingState = doingState !== 2 ? 1 : 2
        hasValid = true;
        break;
      }
    }
    if (!hasValid) doingState = doingState === 2 ? 2 : 1
    let body = {
      "id": this.state.data.id,
      "safetyMeasure": {
        "safetyMeasureItems": update
      }
    }
    let color = '', enable = false
    switch (doingState) {
      case 0:
        color = '#c0c0c0'
        break;
      case 1:
        color = GREEN
        enable = true
        break;
      case 2:
        color = '#333'
        break;
    }

    ///检查是否有未完成的操作票
    if (this._checkHasUndoneOperationBill()) {
      enable = false;
      color = "#c0c0c0";
    }

    return (
      <TouchFeedback style={[s.f]} enabled={enable} key={'safeDong' + lastIndex}
        onPress={() => {
          this.setState({
            isSafeDoing: true
          })
          this.props.finishSafeTask(body);
        }}>
        <View style={[s.center, s.f]}>
          <Text style={{ fontSize: 14, color }}>完成</Text>
        </View>
      </TouchFeedback>
    )
  }

  _renderTaskTable() {
    let header = '6;6', footer = '6;6', grid = '';
    let task = null;
    if (this.state.data[KEYS.TASK]) task = this.state.data[KEYS.TASK][KEYS.TASK_ITEMS];
    let middle = [];
    if (task && task.length > 0) {
      let groupLeft = [], groupRight = [], groups = [];
      task.forEach((item, index) => {
        if (index > 0 && item.stepGroup !== task[index - 1].stepGroup) {
          //提交之前的记录
          middle.push(<View key={index}>{groupLeft}</View>);
          if (this.state[KEYS.BILL_STATE] === BILL_STATE.AUTH_CHECK) {
            if (task[index - 1].operateStatus === 2) {
              middle.push(<View key={index}>{groupRight}</View>);
            } else {
              middle.push(<View key={index}></View>);
            }
          } else {
            if ((this.state[KEYS.BILL_STATE] === BILL_STATE.SAFE_DOING && task[index - 1].operateStatus !== 2)) {
              middle.push(this._renderSafeDoingCell(index - 1, task[index - 1].stepGroup));
            } else {
              middle.push(<View key={index}>{groupRight}</View>);
            }
          }
          groups.push(true)
          groupLeft = [], groupRight = [];
        }
        groupLeft.push(this._renderTaskCell(item, index, false, groupLeft.length + 1))
        groupRight.push(this._renderTaskCell(item, index, true, groupRight.length + 1));
        if (index === task.length - 1) {
          middle.push(<View key={index}>{groupLeft}</View>);
          let preIndex = index;//-1;
          if (preIndex < 0) preIndex = 0

          if ((this.state[KEYS.BILL_STATE] === BILL_STATE.AUTH_CHECK)) {
            middle.push(<View key={index}></View>);
          } else {
            if ((this.state[KEYS.BILL_STATE] === BILL_STATE.SAFE_DOING)) {
              middle.push(this._renderSafeDoingCell(preIndex, task[preIndex].stepGroup));
            } else {
              middle.push(<View key={index}>{groupRight}</View>);
            }
          }

          groups.push(true)
        }
      })
      let taskGrid = groups.map(item => '6;6').join(';')
      grid = `${header};${taskGrid};${footer}`
    } else {
      grid = `${header};6;6;${footer}`
      middle =
        [
          this._renderEmptyCell(1),
          this._renderEmptyCell(2)
        ]
        ;
    }
    return (
      <Table grid={grid}>
        {this._renderHeaderCell('下列由工作票签发人填写')}
        {this._renderHeaderCell('下列由工作许可人填写')}
        {middle}
        {this._renderSignCell()}
        {this._renderSignCell(true)}
      </Table>
    )
  }

  _checkOrderTime() {
    let xk = this._getOrderItemValue(7, KEYS.XK_TIME);
    if (xk) {
      if (moment(xk).isSameOrBefore(moment(this.state.data[KEYS.TASK][KEYS.TABLE_TIME]))) {
        Toast.show('许可开始时间不能早于等于收到工作票的时间', {
          duration: Toast.durations.SHORT,
          position: Toast.positions.BOTTOM - 80,
        });
        return false;
      }
    }
    let bd = this._getOrderItemValue(8, KEYS.BD_TIME);
    if (bd && xk) {
      if (moment(bd).isSameOrBefore(moment(xk))) {
        Toast.show('工作负责人变更时间不能早于等于许可开始时间', {
          duration: Toast.durations.SHORT,
          position: Toast.positions.BOTTOM - 80,
        });
        return false;
      }
    }
    let yq = this._getOrderItemValue(9, KEYS.YQ_TIME);
    if (yq) {
      if (moment(yq).isSameOrBefore(moment(this.state.data[KEYS.JH_END]))) {
        Toast.show('工作票延期时间不能早于等于结束时间', {
          duration: Toast.durations.SHORT,
          position: Toast.positions.BOTTOM - 80,
        });
        return false;
      }
    }
    let zj = this._getOrderItemValue(10, KEYS.ZJ_TIME);
    if (zj) {
      if (bd) {
        if (moment(zj).isSameOrBefore(moment(bd))) {
          Toast.show('工作终结时间不能早于等于工作负责人变更时间', {
            duration: Toast.durations.SHORT,
            position: Toast.positions.BOTTOM - 80,
          });
          return false;
        }
      }
      if (moment(zj).isSameOrBefore(moment(xk))) {
        Toast.show('工作终结时间不能早于等于许可开始时间', {
          duration: Toast.durations.SHORT,
          position: Toast.positions.BOTTOM - 80,
        });
        return false;
      }
    }
    return true;
  }

  _actionChangeDuty = () => {
    console.log('_actionChangeDuty')
    this._setOrderItemValue(8, KEYS.BD_OLD, null);
    this._setOrderItemValue(8, KEYS.BD_NOW, null);
    this._setOrderItemValue(8, KEYS.BD_SIGN, null);
    this._setOrderItemValue(8, KEYS.BD_TIME, null);
    this.state[KEYS.BILL_STATE] = BILL_STATE.DUTY_CHANGING;
    this.setState({})
  }

  _actionClick = () => {
    if (!this.state.data[KEYS.NUM]) {
      if (moment(this.state.data[KEYS.JH_END]).isBefore(moment(this.state.data[KEYS.JH_START]))) {
        Toast.show('计划结束时间不能早于计划开始时间', {
          duration: Toast.durations.SHORT,
          position: Toast.positions.BOTTOM - 80,
        });
        return;
      }
      this.props.createBill(this.state.data);
      return;
    }
    let obj = {}
    switch (this.state[KEYS.BILL_STATE]) {
      case BILL_STATE.EDIT:
        if (moment(this.state.data[KEYS.JH_END]).isBefore(moment(this.state.data[KEYS.JH_START]))) {
          Toast.show('计划结束时间不能早于计划开始时间', {
            duration: Toast.durations.SHORT,
            position: Toast.positions.BOTTOM - 80,
          });
          return;
        }
        this.props.saveBill(this.state.data);
        break;
      case BILL_STATE.READ:
        if (!this.state.data[KEYS.TASK][KEYS.TABLE_SIGN2]) {
          obj[KEYS.BILL_STATE] = BILL_STATE.EDIT;
          this.setState(obj)
        } else {
          obj[KEYS.BILL_STATE] = BILL_STATE.ORDER_DOING;
          this.setState(obj)
        }
        break;
      case BILL_STATE.AUTH_CHECK:
        // Alert.alert('','123');
        obj[KEYS.BILL_STATE] = BILL_STATE.SAFE_DOING;
        this.setState(obj)
        break;
      case BILL_STATE.SAFE_DOING:
        // Alert.alert('','123');
        break;
      case BILL_STATE.ORDER_DOING:
        if (!this._checkOrderTime()) return;
        //这里给出判断
        if (this.state.data[KEYS.JX_RESULT] === RESULT_REJECT) {
          Alert.alert("", '作废后，关联的票将⼀并作废，确认作废？', [
            { text: '取消', onPress: () => { } },
            { text: '作废', onPress: () => this.props.updateJobBillOrder(this.state.data) }
          ])
        } else {
          this.props.updateJobBillOrder(this.state.data);
        }

        break;
      case BILL_STATE.DUTY_WAITING_SIGN:
        obj[KEYS.BILL_STATE] = BILL_STATE.DUTY_SIGNING;
        this.setState(obj)
        break;
      case BILL_STATE.DUTY_CHANGING:
      case BILL_STATE.DUTY_SIGNING:
        //形式打好
        if (!this._checkOrderTime()) return;
        let whetherSign = this.state[KEYS.BILL_STATE] === BILL_STATE.DUTY_SIGNING
        this.props.updateJobBillOrderDuty(this.state.data, whetherSign);
        break;
      case BILL_STATE.FINISHED:
        obj[KEYS.BILL_STATE] = BILL_STATE.WAITING_RECYCLE;
        this.setState(obj)
        break;
      case BILL_STATE.RECYCLED:
        break;
      case BILL_STATE.WAITING_RECYCLE:
        //进行回收操作
        this.props.recycleJobBill(this.state.data);
        break;
    }
    return;
  }

  /**
   * 检查是否有 关联的操作票未完成
   * 如果有则需要展示提示信息 "请先完成与工作票关联的所有操作票后再点击“完成”按钮"
   * 如果没有 则不需要展示提示信息,保持原来的逻辑
   * @private
   */
  _checkHasUndoneOperationBill() {
    ///是否有未完成的工作票
    let hasUndone;
    let operationList = this.state.data["workTicketOperationList"];
    if (operationList !== undefined && operationList.length > 0) {
      let undoneOperation = false;
      for (let element of operationList) {
        if (element.status === 1) {
          undoneOperation = true;
          break;
        }
      }
      hasUndone = undoneOperation;
    } else {
      hasUndone = false;
    }
    return hasUndone;
  }

  _checkArray = (keys) => {
    for (let i = 0; i < keys.length; i++) {
      if (!this.state.data[keys[i]]) return false;
      let v = this.state.data[keys[i]]
      if (Array.isArray(v) && v.length === 0) return false;
    }
    return true;
  }

  _getActions() {
    let actions = [];
    let dutyAction = { title: '变更工作负责人' }
    switch (this.state[KEYS.BILL_STATE]) {
      case BILL_STATE.EDIT:
        if (this.props.billPermission.job.canCreate)
          actions.push({
            title: '保存',
            disable: !(this._checkArray([KEYS.GZDD, KEYS.GZNR, KEYS.JH_END, KEYS.JH_START, KEYS.ASSETS,
            KEYS.TASK, KEYS.BDS]) && this.state.data[KEYS.TASK] && this.state.data[KEYS.TASK][KEYS.TABLE_SIGN1])
          })
        break;
      case BILL_STATE.READ:
        if (this.state.changed) this.setState({ changed: false })
        if ((this.state.data[KEYS.TASK][KEYS.TABLE_SIGN4] && this.props.billPermission.job.canExe) ||
          (!this.state.data[KEYS.TASK][KEYS.TABLE_SIGN2] && this.props.billPermission.job.canCreate)) {
          if (this._checkOrderItems(7, [KEYS.XK_TIME, KEYS.XK_SIGN1, KEYS.XK_SIGN2])
            && !this._checkOrderItems(10, [KEYS.ZJ_GROUP, KEYS.ZJ_JDD, KEYS.ZJ_TIME, KEYS.ZJ_SIGN1, KEYS.ZJ_SIGN2, KEYS.ZJ_SIGN3])) {
            actions.push(dutyAction)
          }
          actions.push({
            title: '编辑',
            disable: false
          })
        }
        break;
      case BILL_STATE.AUTH_CHECK:
        if (this.props.billPermission.job.canExe) {
          actions.push({
            title: '执行',
            disable: false
          });
        }
        break;
      case BILL_STATE.SAFE_DOING:
        break;
      case BILL_STATE.DUTY_CHANGING:
        if (this.props.billPermission.job.canExe)
          actions.push({
            title: '保存',
            disable: !this._checkOrderItems(8, [KEYS.BD_OLD, KEYS.BD_NOW, KEYS.BD_TIME])
          })
        break;
      case BILL_STATE.DUTY_SIGNING:
        if (this.props.billPermission.job.canExe)
          actions.push({
            title: '保存',
            disable: !this._checkOrderItems(8, [KEYS.BD_SIGN])
          })
        break;
      case BILL_STATE.DUTY_WAITING_SIGN:
        if (this.props.billPermission.job.canExe)
          actions.push({
            title: '编辑',
          })
        break;
      case BILL_STATE.ORDER_DOING:
        //如果7有值，人员为0，不能保存，如果7无值，人员可以为0
        let enable = true
        let has7 = this._checkOrderItemsAnyOne(7, [KEYS.XK_TIME, KEYS.XK_SIGN2, KEYS.XK_SIGN1]);
        let c = this._getOrderItemValue(2, KEYS.GZBYY)
        if (has7 && (!c || c.length === 0)) enable = false;
        let canSave = this.state.changed && enable
        //console.log('cansave',canSave,this.state.changed,enable)
        if (this.props.billPermission.job.canExe)
          actions.push({
            title: '保存',
            disable: !canSave//!this.state.changed && !enable
          })
        break;
      case BILL_STATE.FINISHED:
        if (this.props.billPermission.job.canExe)
          actions.push({
            title: '编辑',
            disable: false
          })
        break;
      case BILL_STATE.WAITING_RECYCLE:
        if (this.props.billPermission.job.canExe)
          actions.push({
            title: '保存',
            disable: !this.state.data[KEYS.HS_SIGN]
          })
        break;
      case BILL_STATE.RECYCLED:
        break;
    }
    return actions;
  }

  _checkSafetyMeasure(keys) {
    let safe = this.state.data[KEYS.TASK];
    if (safe && keys) {
      if (keys.find(key => !safe[key])) return false;
      return true;
    }
    return false;
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

  _showAssignCommandBillModal = () => {
    if (this.state.data[KEYS.COMMAND_BILL]) {
      this.props.openCommandBill();
      return;
    }
    this.setState({ assignCommandBillModal: true })
  }

  _dismissAssignCommandBillModal = () => {
    this.setState({ assignCommandBillModal: false })
  }

  _renderAssignCommandBillModal() {
    if (this.state.assignCommandBillModal) {
      return (
        <AssignCommandBillModal show={this.state.assignCommandBillModal}
          onItemClick={bid => {
            this._dismissAssignCommandBillModal();
            this.props.bindJobBillToCommandBill({
              "workTicketId": this.state.data.id,
              "commandTicketId": bid
            })
          }}
          workTicketId={this.state.data.id}
          loadUnbindBill={this.props.loadUnbindBill} unbound={this.props.unbound}
          listData={this.props.unboundList} title={'关联命令票'}
          onCancel={this._dismissAssignCommandBillModal}
        />
      )
    }
    return null;
  }

  _createOperateBill = () => {
    //如果不能创建停电或者送电票，则屏蔽菜单
    let actions = [];
    if (this.props.unboundAssets && this.props.unboundAssets.powerDown.length > 0) {
      actions.push({ title: '停电操作票', type: 2 })
    }
    if (this.props.unboundAssets && this.props.unboundAssets.powerUp.length > 0) {
      actions.push({ title: '送电操作票', type: 1 })
    }
    ///生成操作票点击
    this._doSelectList(actions, '请选择操作票类型', null, false, KEYS.CREATE_OPERATE);
  }

  _renderButtons() {
    let buttons = [];
    if (this.state.data[KEYS.NUM] && !this._isEdit()) {
      if (this.state.data[KEYS.COMMAND_BILL]) {
        //有命令票 判断命令票权限
        if (!this.props.billPermission.command.canRead) return null;
      } else {
        //无命令票，判断命令票和工作票权限
        if (!this.props.billPermission.command.canRead || !this.props.billPermission.job.canExe) return null;
      }
      let txt = this.state.data[KEYS.COMMAND_BILL] ? '查看命令票' : '关联命令票';
      buttons.push(this._renderButton(txt, this._showAssignCommandBillModal, false, true))
    }
    //判断显示不显示创建操作票的按钮
    if (this.state.data[KEYS.TASK] && this.state.data[KEYS.TASK][KEYS.TABLE_SIGN2] && !this.state.data[KEYS.TASK][KEYS.TABLE_SIGN4]) {
      //TODO 还需要判断是否回路都创建了对应的操作票 没有检修结果，并且还有未创建操作票的回路
      if (!this.state.data[KEYS.JX_RESULT] && this.props.unboundAssets &&
        (this.props.unboundAssets.powerUp.length > 0 || this.props.unboundAssets.powerDown.length > 0)) {
        buttons.push(this._renderButton('生成操作票', this._createOperateBill, true, true))
      }
    }

    if (buttons.length > 0) {
      if (buttons.length === 2) buttons.splice(1, 0, <View style={{ width: 16 }} />)
      return (
        <View style={[{ justifyContent: 'flex-end' }]}>
          <View style={[s.p16, s.r, { borderTopWidth: 1, borderTopColor: '#d9d9d9' }]}>
            {buttons}
          </View>
        </View>
      )
    }
    return null;
  }

  _renderLoading() {
    return (
      <View style={[s.f, { backgroundColor: '#fff' }]}>
        <Toolbar
          title='工作票'
          navIcon="back"
          onIconClicked={() => this.props.navigation.pop()}
        />
        <Loading />
      </View>
    )
  }


  render() {
    if (this.props.isFetching) return this._renderLoading();
    let actions = this._getActions();
    let actionPress = [];
    if (actions.length === 2) {
      actionPress.push(this._actionChangeDuty)
    }
    actionPress.push(this._actionClick)
    return (
      <View style={[s.f, { backgroundColor: '#fff' }]}>
        <Toolbar
          title='工作票' actions={this._getActions()}
          onActionSelected={actionPress}
          navIcon="back"
          onIconClicked={() => this.props.onBack()}
        />
        {this._renderTitle()}
        <View style={[s.mh16, { height: 1, backgroundColor: '#999' }]} />
        <ScrollView style={{ flex: 1 }}>
          <View style={[s.r, s.m16, { marginTop: 12 }]}>
            <View style={[s.g9]}>
              {this._renderLeftTop()}
              {this._renderTaskTable()}
            </View>
            {this._renderRight()}
          </View>
        </ScrollView>
        {this._renderButtons()}
        {this._renderEditTaskDialog()}
        {this._renderAssetModal()}
        {this._renderListModal()}
        {this._renderDateModal()}
        {this._renderSignModal()}
        {this._renderActionSheet()}
        {this._renderInputDialog()}
        {this._renderAssignCommandBillModal()}
      </View>
    )
  }
}
