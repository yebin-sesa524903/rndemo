import { CallInOrderItem } from "../../../../../components/fmcs/callin/callTicket/CallInOrderMsg";
import moment from "moment";
import { isEmptyString, TimeFormatYMDHM, TimeFormatYMDHMS } from "../../../../../utils/const/Consts";
import storage from "../../../../../utils/storage";

export enum CallInTicketItemType {
  basicMsg = 8382,   ///基本信息
  orderMsg,///工单信息
}

export enum CallInOrderStatus {
  pending = 2,  ///未开始
  processing,///执行中
  solved///已完成
}

export const CallInInitialDataInfo = () => {
  return [
    {
      icon: require('../../../../../images/aaxiot/airBottle/basic_msg.png'),
      title: '基本信息',
      isExpand: true,
      sectionType: CallInTicketItemType.basicMsg,
      data: [
        {
          title: '业务类型',
          subTitle: '-'
        },
        {
          title: '工单ID',
          subTitle: '-'
        },
        {
          title: '报修人',
          subTitle: '-'
        },
        {
          title: '课室',
          subTitle: '-'
        },
        {
          title: '报修电话',
          subTitle: '-'
        },
        {
          title: '报修时间',
          subTitle: '-'
        }
      ],
      remarkTitle: "受理内容",
      remark: '',
    },
    {
      title: '工单信息',
      icon: require('../../../../../images/aaxiot/callin/orderMsg.png'),
      isExpand: true,
      canEdit: false,
      sectionType: CallInTicketItemType.orderMsg,
      orders: []
    }
  ]
}


/**
 * 构建工单详情 展示模型数据
 * @param response 请求详情数据
 * @param dataInfo 模型初始数组
 * @param departments 课室数组,给课室id赋值
 * @param userHierarchy 用户的 所属课室层级
 */
export async function configCallInDataInfo(response: any, dataInfo: any[], departments: any[], userHierarchy: any[]) {
  for (const info of dataInfo) {
    if (info.sectionType == CallInTicketItemType.basicMsg) {
      let businessType = getBusinessType(response.type);
      info.data[0].subTitle = businessType;
      info.data[1].subTitle = response.orderId;
      info.data[2].subTitle = response.name;
      info.data[2].title = businessType + '人';
      info.data[3].subTitle = findDepartmentNameWithId(response.deptId, departments);
      info.data[4].subTitle = response.tel;
      info.data[4].title = businessType + '电话';
      info.data[5].subTitle = moment(response.orderDate).format(TimeFormatYMDHM);
      info.data[5].title = businessType + '时间';
      info.remark = response.content ?? '-';
    } else if (info.sectionType == CallInTicketItemType.orderMsg) {
      let orders: CallInOrderItem[] = [];
      for (let element of response.subOrderList) {
        let founded = findUserHierarchyContainerDeptId(userHierarchy, element.deptId);
        let canEdit = (founded && element.state == 3);
        orders.push({
          orderId: element.orderId,
          subOrderId: element.subOrderId,
          department: findDepartmentNameWithId(element.deptId, departments),
          handel: element.name,
          status: element.state,
          canEdit: canEdit,
          statusString: element.state == 2 ? '未开始' : (element.state == 3 ? '执行中' : '已完成'),
          contact: '-',
          tel: element.callee,
          content:  founded ? (isEmptyString(element.content) ? '' : element.content) : (isEmptyString(element.content) ? '-' : element.content),
          pictures: await configPictures(element.files),
          files: element.files,
        })
      }
      info.orders = orders;
    }
  }
  return [...dataInfo];
}

const configPictures = async (files: { name: string, file: string }[]) => {
  let images = [];
  if (files && files.length > 0) {
    let token = await storage.getItem("CALLINTOKEN");
    for (let file of files) {
      images.push({
        uri: `http://175.6.34.241:8989/inf/api/order/getFile/${file.file}?token=${token}&file=${file.file}`,
        name: file.name,
        file: file.file,
        needUpload: false,
        canRemove: true,
      })
    }
  }
  return images;
}

/**
 * 查找可编辑的工单信息
 * @param dataInfo
 */
export const findCanEditOrderList = (dataInfo: any[]) => {
  let orderInfo = undefined;
  for (const info of dataInfo) {
    if (info.sectionType == CallInTicketItemType.orderMsg) {
      for (let order of info.orders) {
        if (order.canEdit) {
          orderInfo = order;
          break;
        }
      }
    }
  }
  return orderInfo;
}


/**
 * 用户的 所属组织层级中是否包含 deptId
 * @param userHierarchy 用户所属组织
 * @param deptId
 */
const findUserHierarchyContainerDeptId = (userHierarchy: any[], deptId: number) => {
  let founded = false;
  for (let userHierarchyElement of userHierarchy) {
    if (userHierarchyElement.id == deptId) {
      founded = true;
      break;
    }
  }
  return founded;
}

/**
 * 计算两个时间 间隔 'x天x小时x分钟'
 * @param startTime
 * @param endTime
 */
const getDifTimeDate = (startTime: string, endTime: string) => {
  let startDate = moment(startTime);
  let endDate = moment(endTime);
  let seconds = endDate.diff(startDate, 'seconds');

  const days = Math.floor(seconds / (24 * 60 * 60));
  seconds -= days * (24 * 60 * 60);
  const hours = Math.floor(seconds / (60 * 60));
  seconds -= hours * (60 * 60);
  const minutes = Math.floor(seconds / (60));

  return `${days}天${hours}小时${minutes}分钟`;
}


/**
 * 按钮文字获取
 */
export const getActionTitle = (stateStr: string) => {
  let title = '';
  switch (stateStr) {
    case 'pending':
      title = '接单'
      break;
    case 'processing':
      title = '编辑';
      break;
    case 'solved':
      title = '查看'
      break;
  }
  return title;
}

export const getAlarmLevelString = (level: string) => {
  let title = '-';
  switch (level) {
    case '1':
      title = '高级'
      break;
    case '2':
      title = '中级';
      break;
    case '3':
      title = '低级'
      break;
  }
  return title;
}
/**
 * 报修类型
 * @param type
 */
export const getBusinessType = (type: number) => {
  let typeStr = '';
  switch (type) {
    case 1:
      typeStr = '报修';
      break;
    case 2:
      typeStr = '投诉';
      break;
    case 3:
      typeStr = '报警';
      break;
  }
  return typeStr;
}


/**
 * 通过课室id找课室name
 * @param deptId
 * @param departments
 */
export const findDepartmentNameWithId = (deptId: number, departments: any[]) => {
  let departmentName = '-';
  for (let department of departments) {
    if (department.id == deptId) {
      departmentName = department.name;
      break;
    }
  }
  return departmentName;
}


/**
 * 构建报警工单详情 初始数据
 * @constructor
 */
export const CallAlarmInitialDataInfo = () => {
  return [
    {
      icon: require('../../../../../images/aaxiot/airBottle/basic_msg.png'),
      title: '基本信息',
      isExpand: true,
      sectionType: CallInTicketItemType.basicMsg,
      data: [
        {
          title: '报警名称',
          subTitle: '-',
          category: '',
          threshold: '',
          value: '',
        },
        {
          title: '报警类别',
          subTitle: '-'
        },
        {
          title: '报警级别',
          subTitle: '-'
        },
        {
          title: '告警设备',
          subTitle: '-'
        },
        {
          title: '报警时间',
          subTitle: '-'
        },
        {
          title: '实际值',
          subTitle: '-'
        },
        {
          title: '设定值',
          subTitle: '-'
        },
      ],
      remarkTitle: "受理内容",
      remark: '',
    },
    {
      title: '工单信息',
      icon: require('../../../../../images/aaxiot/callin/orderMsg.png'),
      isExpand: true,
      canEdit: false,
      sectionType: CallInTicketItemType.orderMsg,
      orders: []
    }
  ]
}


export async function configCallAlarmDataInfo(response: any, device: any, dataInfo: any[], departments: any[], userHierarchy: any[]) {
  for (const info of dataInfo) {
    if (info.sectionType == CallInTicketItemType.basicMsg) {
      info.data[0].subTitle = response.mName;
      info.data[0].category = response.category;
      info.data[0].threshold = response.threshold;
      info.data[0].value = response.value;
      info.data[1].subTitle = response.category;
      info.data[2].subTitle = getAlarmLevelString(response.level);

      info.data[3].subTitle = device.DeviceName ? device.DeviceName : '--';
      info.data[4].subTitle = moment(response.orderDate).format(TimeFormatYMDHM);
      info.data[5].subTitle = response.value;
      info.data[6].subTitle = response.threshold;
      info.remark = response.content ?? '-';
    } else if (info.sectionType == CallInTicketItemType.orderMsg) {
      let orders: CallInOrderItem[] = [];
      for (let element of response.subOrderList) {
        let founded = findUserHierarchyContainerDeptId(userHierarchy, element.deptId);
        let canEdit = (founded && element.state == 3);
        orders.push({
          orderId: element.orderId,
          subOrderId: element.subOrderId,
          department: findDepartmentNameWithId(element.deptId, departments),
          handel: element.name,
          status: element.state,
          canEdit: canEdit,
          statusString: element.state == 2 ? '未开始' : (element.state == 3 ? '执行中' : '已完成'),
          contact: '-',
          tel: element.callee,
          content: founded ? (isEmptyString(element.content) ? '' : element.content) : (isEmptyString(element.content) ? '-' : element.content),
          pictures: await configPictures(element.files),
          files: element.files,
        })
      }
      info.orders = orders;
    }
  }
  return [...dataInfo];
}
