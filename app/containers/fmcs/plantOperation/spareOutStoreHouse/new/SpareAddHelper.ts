import {
  SpareOutStoreHouseItemType,
  SpareOutStoreRowType, SpareOutStoreStatus
} from "../../../../../components/fmcs/plantOperation/defined/ConstDefined";
import {
  SpareOutStoreAddBasicItemProps
} from "../../../../../components/fmcs/plantOperation/spareOutStoreHouse/new/SpareOutStoreAddBasicItem";
import {
  SpareOutStoreSpareMsgData
} from "../../../../../components/fmcs/plantOperation/spareOutStoreHouse/detail/SpareOutStoreSpareMsgItem";
import { isEmptyString } from "../../../../../utils/const/Consts";

/**
 * 故障保修 数据模型
 */
export const InitialAddSpareOutStoreInfo=() => [
  {
    title: '基本信息',
    icon: require('../../../../../images/aaxiot/airBottle/basic_msg.png'),
    isExpand: true,
    sectionType: SpareOutStoreHouseItemType.basicMsg,
    data: [
      {
        isRequire: true,
        canEdit: false,
        rowType: SpareOutStoreRowType.warehouseExitNo,
        title: '出库单号',
        value: '',
      },
      {
        isRequire: true,
        canEdit: true,
        rowType: SpareOutStoreRowType.class,
        title: '课室',
        value: '',
        placeholder: '请选择',
        dropdownOptions: [],
      },
      {
        isRequire: false,
        canEdit: false,
        rowType: SpareOutStoreRowType.time,
        title: '出库时间',
        value: '',
      },
      {
        isRequire: false,
        canEdit: false,
        rowType: SpareOutStoreRowType.executor,
        title: '执行人',
        value: '',
      },
      {
        isRequire: false,
        canEdit: true,
        rowType: SpareOutStoreRowType.system,
        title: '所属系统',
        value: '',
        placeholder: '请选择',
        dropdownOptions: [],
      },
      {
        isRequire: true,
        canEdit: true,
        rowType: SpareOutStoreRowType.device,
        title: '设备',
        value: '',
        placeholder: '请选择',
      },
      {
        isRequire: true,
        canEdit: true,
        rowType: SpareOutStoreRowType.use,
        title: '用途',
        value: '',
        placeholder: '请选择',
        dropdownOptions: [],
      },
      {
        isRequire: false,
        canEdit: true,
        rowType: SpareOutStoreRowType.relateOrderNo,
        title: '关联单号',
        value: '',
        placeholder: '请选择',
        dropdownOptions: []
      },

      {
        isRequire: false,
        canEdit: true,
        rowType: SpareOutStoreRowType.remark,
        title: '备注',
        value: '',
        placeholder: '请输入',
      }
    ]
  },
  {
    icon: require('../../../../../images/aaxiot/airBottle/baseInfo.png'),
    title: '备件信息',
    canEdit: true,
    isWithdrawal: false,
    sectionType: SpareOutStoreHouseItemType.spareInfo,
    data: [],
  }
]

/**
 * 更新备件列表
 * @param spares
 * @param addSpareInfo
 */
export function updateSpareInfo(spares: any[], addSpareInfo: any[]) {
  for (let info of addSpareInfo) {
    if (info.sectionType==SpareOutStoreHouseItemType.spareInfo) {
      info.data.push(...convertSpareList(spares));
    }
  }
  return [...addSpareInfo];
}

function convertSpareList(detailList: any[]) {
  let spares=[];
  if (detailList&&detailList.length>0) {
    for (let detailObj of detailList) {
      if (detailObj.editable) {
        spares.push({
          id: detailObj.id,
          spareName: detailObj.name,
          code: detailObj.code,
          inventory: detailObj.inventory,
          outStoreCount: ((detailObj.inventory==null||detailObj.inventory==0)? 0:1),
          spareOutStatus: SpareOutStoreStatus.editing,
        })
      }
    }
  }
  return spares;
}

export function updateAddSpareOutStore(responseBasic: any, addSpareInfo: SpareOutStoreAddBasicItemProps[], use: string) {
  for (let info of addSpareInfo) {
    if (info.sectionType==SpareOutStoreHouseItemType.basicMsg) {
      for (let datum of info.data) {
        if (datum.rowType==SpareOutStoreRowType.class) {
          datum.canEdit=false;
          datum.value=responseBasic.departmentName;
        } else if (datum.rowType==SpareOutStoreRowType.system) {
          datum.canEdit=false;
          datum.value=responseBasic.systemName;
        } else if (datum.rowType==SpareOutStoreRowType.device) {
          datum.canEdit=false;
          datum.value=responseBasic.deviceName;
        } else if (datum.rowType==SpareOutStoreRowType.use) {
          datum.canEdit=false;
          datum.value=use;
        } else if (datum.rowType==SpareOutStoreRowType.relateOrderNo) {
          datum.canEdit=false;
          datum.value=responseBasic.code;
        }
      }
    }
  }
  return [...addSpareInfo];
}

/**
 * 更新添加故障报修 行信息
 * @param value
 * @param rowType
 * @param addSpareInfo
 */
export function updateSpareRowValueWithType(value: string, rowType: SpareOutStoreRowType, addSpareInfo: SpareOutStoreAddBasicItemProps[]) {
  for (let info of addSpareInfo) {
    if (info.sectionType==SpareOutStoreHouseItemType.basicMsg) {
      for (let datum of info.data) {
        if (datum.rowType==rowType) {
          datum.value=value;
          break;
        }
      }
    }
  }
  return [...addSpareInfo];
}


/**
 * 更新用途下拉
 * 更新下拉选择 框的数据
 * @param rowType   哪个下拉框
 * @param options   内容
 * @param addSpareInfo 业务数组
 */
export function updateDropdownOptions(rowType: SpareOutStoreRowType, options: any[], addSpareInfo: SpareOutStoreAddBasicItemProps[]) {
  let tempOptions=[];
  if (rowType==SpareOutStoreRowType.use) {
    ///如果是保养 下拉选择需要 转换一下
    for (let option of options) {
      tempOptions.push({
        title: option.label,
        id: option.value,
      })
    }
  } else {
    tempOptions=options;
  }

  for (let info of addSpareInfo) {
    if (info.sectionType==SpareOutStoreHouseItemType.basicMsg) {
      for (let datum of info.data) {
        if (datum.rowType==rowType) {
          datum.dropdownOptions=tempOptions;
        }
      }
    }
  }
  return [...addSpareInfo];
}


/**
 * 输入变化时 更新出库数量
 * @param dataInfo
 * @param text
 * @param msgData
 */
export function updateSpareOutStoreCount(dataInfo: any[], text: string, msgData: SpareOutStoreSpareMsgData) {
  for (const datum of dataInfo) {
    if (datum.sectionType==SpareOutStoreHouseItemType.spareInfo) {
      for (let spareObj of datum.data) {
        if (spareObj.id==msgData.id) {
          if (spareObj.inventory>=Number(text)) {
            spareObj.outStoreCount=text;
          } else {
            spareObj.outStoreCount=spareObj.inventory;
          }
          break;
        }
      }
    }
  }
  return [...dataInfo];
}

/**
 * 检查当前备件信息列表 是否有未保存的项目
 * @param dataInfo
 */
export function checkOutStoreIsHasNoSave(dataInfo: any[]) {
  ///是否有没有保存的 备件信息项
  let isHasNoSave=false;
  for (const datum of dataInfo) {
    if (datum.sectionType==SpareOutStoreHouseItemType.spareInfo) {
      for (let spareObj of datum.data) {
        if (spareObj.spareOutStatus==SpareOutStoreStatus.editing) {
          isHasNoSave=true;
          break;
        }
      }
    }
  }
  return isHasNoSave;
}


/**
 * 检查备件信息里面是否有退库为0的记录
 * @param dataInfo
 */
export function checkStoreHasZeroRecord(dataInfo: any[]) {
  let name='';
  for (const datum of dataInfo) {
    if (datum.sectionType==SpareOutStoreHouseItemType.spareInfo) {
      for (let spareObj of datum.data) {
        if (Number(spareObj.withdrawalCount)==0) {
          name=spareObj.spareName;
          break;
        }
      }
    }
  }
  return name;
}

/**
 * 完成提交 构建 入参里detailList
 * @param dataInfo
 */
export function configStoreDetailList(dataInfo: any[]) {
  let detailList=[];
  for (const datum of dataInfo) {
    if (datum.sectionType==SpareOutStoreHouseItemType.spareInfo) {
      for (let spareObj of datum.data) {
        detailList.push({
          id: null,
          assetEntryId: spareObj.id,
          inventory: spareObj.inventory,
          warehouseExitQuantity: Number(spareObj.outStoreCount),
        })
      }
    }
  }
  return detailList;
}

/**
 * 检查出库信息里面是否有0的记录
 * @param dataInfo
 */
export function configStoreHasZeroRecord(dataInfo: any[]) {
  let name='';
  for (const datum of dataInfo) {
    if (datum.sectionType==SpareOutStoreHouseItemType.spareInfo) {
      for (let spareObj of datum.data) {
        if (Number(spareObj.outStoreCount)==0) {
          name=spareObj.spareName;
          break;
        }
      }
    }
  }
  return name;
}

/**
 * 更新备件信息 状态
 * @param dataInfo
 * @param spareOutStatus
 * @param msgData
 */
export function changeAddSpareOutStoreStatus(dataInfo: any[], spareOutStatus: SpareOutStoreStatus, msgData: SpareOutStoreSpareMsgData) {
  for (const datum of dataInfo) {
    if (datum.sectionType==SpareOutStoreHouseItemType.spareInfo) {
      for (let spareObj of datum.data) {
        if (spareObj.id==msgData.id) {
          spareObj.spareOutStatus=spareOutStatus;
          /// 处理输入为空的情况
          if (spareOutStatus==SpareOutStoreStatus.edit) {
            ///保存点击
            if (typeof spareObj.outStoreCount=="string") {
              if (isEmptyString(spareObj.outStoreCount)) {
                if (spareObj.inventory>0) {
                  spareObj.outStoreCount=1;
                } else {
                  spareObj.outStoreCount=0;
                }
              }
            }
          }
          break;
        }
      }
    }
  }
  return [...dataInfo];
}

/**
 * 添加备件取消按钮点击
 * @param dataInfo
 * @param spareOutStatus
 * @param msgData
 */
export function changeAddSpareOutStoreCancelAction(dataInfo: any[], spareOutStatus: SpareOutStoreStatus, msgData: SpareOutStoreSpareMsgData) {
  for (const datum of dataInfo) {
    if (datum.sectionType==SpareOutStoreHouseItemType.spareInfo) {
      for (let spareObj of datum.data) {
        if (spareObj.id==msgData.id) {
          spareObj.spareOutStatus=spareOutStatus;
          if (spareObj.inventory>0) {
            spareObj.outStoreCount=1;
          } else {
            spareObj.outStoreCount=0;
          }
          break;
        }
      }
    }
  }
  return [...dataInfo];
}
