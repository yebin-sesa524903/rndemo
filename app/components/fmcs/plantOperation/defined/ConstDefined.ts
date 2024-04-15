/**
 * 关于厂务运行这一块的 常量定义
 */
///巡检详情 item type
export enum InspectionDetailItemType {
    basicMsg = 11001,   ///基本信息
    range,///巡检范围
    task,///巡检项
    summary,///总结项
}

/**
 * 保养执行 详情  item type
 */
export enum MaintainDetailItemType {
    basicMsg = 10001,///基本信息
    maintainItems,///保养项目
    summaryExcept,///异常总结
    summaryDevice,///设备运行总结
    maintainPicture,///保养图片
    maintainFile,///保养文件
}

/**
 * 维修执行 详情 基本执行 item type
 */
export enum RepairDetailItemType {
    basicMsg = 30001,   ///基本信息
    repairRecords,///维修记录
    repairPicture,///维修图片
}

/**
 * 故障保修 rowType
 */
export enum RepairAddRowType {
    orderNo = 30010,    ///工单编号
    orderName,///工单名称
    department,///课室
    system,///系统
    device,///设备
    repairType,///维修类型
    repairSource,///维修来源
    relateOrderNo,///关联工单号
    faultDescription,///工单描述
}

/**
 * 维修记录状态
 */
export enum RepairStatus {
    initial= 30011,///初始化状态
    addNoRecords,///还没有记录点了添加  需要将维修输入框显示
    addHasRecordsNoInput,    ///添加记录状态 已经有记录 没有维修记录输入框
    addHasRecordsHasInput,    ///添加记录状态 已经有记录 有维修记录输入框
    view,   ///查看状态
}

/**
 * 耗材更换执行 详情 item类型
 */
export enum ConsumablesDetailItemType {
    basicMsg = 20011,///基本信息
    exchangeList,///耗材更换清单
    outbound,   ///备件出库单
}

export enum ConsumablesStatus {
    waitExecute= 20021, ///待执行
    executing  , ///执行中
    complete,   ///已完成, 没有添加按钮只能查看
}

export enum ConsumablesReplacementStatus {
    initial = 20031,///初始化状态    需要填写数值
    edit,    ///编辑状态
    preview,   ///预览状态 只能查看
}

/**
 * 备件盘点 详情 item类型
 */
export enum SpareRepertoryItemType {
    baseInfo = 1001,   ///基本信息
    spareList,         ///备件盘点信息
}

///盘点状态
export enum InventoryStatus {
    initial = 3232,////初始状态
    inventorying,///盘点中
    inventoried///盘点结束
}

/**
 * 备件领用退库 详情 item类型
 */
export enum SpareOutStoreHouseItemType {
    basicMsg = 1011, /// 基本信息
    spareInfo,       /// 备件信息
}

export enum SpareOutStoreStatus {
    withdrawal = 1201,///退库状态 只有退库,
    edit,///可编辑状态  编辑/删除
    editing, ///编辑中状态 保存/取消按钮
}

/**
 * 新增备件出库 用途类型
 */
export enum SpareOutUseType {
    maintain    = 32787,///保养
    repair,///维修
    consumables///耗材更换
}

/**
 * 备件领用退库 选择类型
 */
export enum SpareOutStoreRowType {
    warehouseExitNo= 1688,///出库单号
    class , ///课室
    time,///出库时间
    executor,///执行人
    system,    ///系统
    device,    ///设备
    use,       ///用途
    relateOrderNo,  ///单号
    remark,///备注
}

/**
 * 备件状态
 */
export enum SpareOutStoreHouseStateType {
    initial= 1021, ///初始化状态
    edit,        ///编辑状态
    delete,      ///出库状态
}

/**
 * 异常点检
 */
export enum AbnormalDetailItemType {
    basicMsg = 1031, /// 基本信息
    abnormalRecord,   ///点检记录
}

/**
 * 异常点检 点检状态
 */
export enum AbnormalDetailRecordStatus{
    initial,    ///初始状态  保存/取消
    edit,///编辑状态  编辑/删除
    editing,///编辑中 保存/取消
    preview,///预览状态  没有操作按钮
}


export enum fileModuleCode {
    maintenanceTask = 100000000,//保养
    sparePartEquipment = 200000000,//备件管理
    repairWorkOrder = 300000000,//维修工单执行中上传
    repairWorkOrderDeviceImg = 400000000,//维修工单基本信息上传,
    device= 'Device',
}

