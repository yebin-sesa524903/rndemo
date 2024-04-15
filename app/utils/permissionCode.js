export default {
    ASSET_MANAGE_MAP: {
        FULL: 2100
    },
    DEVICE_DATA_MONITOR: {
        FULL: 2101
    },
    DEVICE_HISTORY_DATA: {
        FULL: 2102
    },
    SP_FAULT_ALARM: {
        READONLY: 2104,
        FULL: 2103
    },
    ASSET_BASIC_INFO: {
        READONLY: 2106,
        FULL: 2105
    },
    ASSET_ALARM_INFO: {//资产报警信息
        READONLY: 2108,
        FULL: 2107
    },
    ASSET_RUNNING_CONFIG: {
        READONLY: 2109,
        FULL: 2136
    },
    ALRAM_SMS_NOTICE_SETTING: {
        FULL: 2110
    },
    DATA_MONITOR_SETTING: {
        FULL: 2112
    },
    DEVICE_HISTORY_DATA_EXPORT: {
        READONLY: 2114
    },
    TREE_STRUCTURE_MANAGE: {
        READONLY: 2116,
        FULL: 2115
    },
    SP_CUSTOMER_MANAGE: {
        READONLY: 2118,
        FULL: 2117
    },
    SP_USER_MANAGE: {
        READONLY: 2120,
        FULL: 2119
    },
    SP_TEMPLATE_MANAGEMENT: {
        READONLY: 2139,
        FULL: 2138
    },
    SP_COMX510_MANAGEMENT: {
        FULL: 2141
    },
    SP_DATA_BOARD: {
        READONLY: 1332,
        FULL: 1333
    },
    SP_GATEWAY_MANAGEMENT: {
        READONLY: 2128,
        FULL: 2127
    },
    POP_MAINTAIN_PLAN: {
        READONLY: 2130,
        FULL: 2129
    },
    POP_DOCUMENT_MANAGEMENT: {
        READONLY: 2132,
        FULL: 2131
    },
    POP_TICKET_VIEW_MANAGEMENT: {//查看执行工单
        READONLY: 2134,
        FULL: 2133
    },
    POP_TICKET_EDIT_MANAGEMENT: {//创建编辑工单
        FULL: 2135
    },
    POP_TICKET_CLOSE_MANAGEMENT: {
        FULL: 4003
    },
    ASSET_DEVICE_PARAMETER: {
        FULL: 2136
    },
    POP_ALL_TICKET: {
        READONLY: 2137
    },
    POP_DIAGNOSE_ANALYSIS: {
        READONLY: 2161,
        FULL: 2160
    },
    POP_DATA_ANALYSIS: {
        READONLY: 2163,
        FULL: 2162
    },
    //改进方案
    POP_SOLUTION: {
        READONLY: 2165,
        FULL: 2164
    },
    POP_NOT_PUSH_SOLUTION: {
        READONLY: 2170,
        FULL: 2171
    },
    POP_PUSH_SOLUTION: {
        READONLY: 2172,
        FULL: 2173
    },
    POP_TAG_MANAGEMENT: {
        READONLY: 2153,
        FULL: 2152
    },
    POP_SYSTEM_OVERVIEW: {
        READONLY: 2168,
        FULL: 2169
    },
    POP_REPORT_ASSET_HEALTH: {
        FULL: 2175
    },
    POP_REGISTER_DEVICE: {
        FULL: 2176
    },
    POP_OPERATION_LOG: {
        READONLY: 2177,
        FULL: 2178
    },
    POP_INSPECTION_PROGRAM: {
        READONLY: 2191,
        FULL: 2192
    },
    EMOP_EMDC_GATEWAY_MANAGEMENT: {
        READONLY: 3003,
        FULL: 3001
    },
    // 工单报告
    POP_TICKET_REPORT: {
        FULL: 2206
    },
    // 资产报告
    POP_ASSET_REPORT: {
        FULL: 2198
    },
    // 资产报表
    POP_ASSET_REPORT_FORM: {
        FULL: 2105
    },
    // 断路器跳闸报告
    POP_CIRCUIT_BREAKER_TRIP_REPORT: {
        FULL: 2202
    },
    // 角色管理
    POP_ROLE_MANAGEMENT: {
        READONLY: 2203,
        FULL: 2204
    },
    //运维大屏
    POP_DISPATCH_PANEL: {
        FULL: 2207
    },
    //创建编辑服务报告-完整权限:6101
    SERVICE_EDIT: {
        FULL: 6101
    },
    // 查看执行服务工单-完整权限:6103
    // 查看执行服务工单-仅查看:6102
    SERVICE_EXECUTE: {
        FULL: 6103,
        READONLY: 6102
    },
    // 服务报告管理-仅查看:6104
    // 服务报告管理-完整权限:6105
    SERVICE_MANAGE: {
        FULL: 6105,
        READONLY: 6104
    },
    // 全部报告-仅查看:6106
    SERVICE_ALL: {
        READONLY: 6106
    },
    // 报告日志审批-完整权限:6108
    SERVICE_APPROVE: {
        FULL: 6108
    },


    ///******************北创相关权限码***********************///
    ///气化运行
    ///气瓶更换
    GAS_AIR_BOTTLE: {
        FULL: 3281,
    },
    ///酸桶更换
    GAS_ACID_BUCKET: {
        FULL: 3297,
    },
    ///气化课移动看板
    GAS_BOARD: {
        FULL: 3381,
    },
    ///厂务运行
    ///设备巡检
    PLANT_INSPECTION: {
        FULL: 9053,
    },
    ///保养任务
    PLANT_MAINTAIN: {
        FULL: 9033,
    },
    ///设备维修
    PLANT_REPAIR: {
        FULL: 9057,
    },
    ///异常点检
    PLANT_ABNORMAL: {
        FULL: 9073,
    },
    ///耗材更换
    PLANT_CONSUMABLES: {
        READONLY: 9081,
    },
    ///备件出入库
    PLANT_SPARE_PARTS_OUTBOUND_STORAGE: {
        FULL: 9009,
    },
    ///备件盘点
    PLANT_SPARE_PARTS_COUNT: {
        FULL: 9037,
    },

    ///知识库
    KNOWLEDGE_LIBRARY:{
        FULL: 3509,
    },

    ///看板
    ///气化看板
    GAS_WORK_BOARD: {
        FULL: 3381,
    },
    ///水课运行 看板
    WATER_WORK_BOARD: {
        FULL: 3387,
    },
    ///机械课 运行 看板
    MECHANIC_WORK_BOARD: {
        FULL: 3385,
    },
    ///电课看板
    ELECTRIC_WORK_BOARD:{
      FULL: 3419,
    },
    ///厂务看板
    FM_WORK_BOARD:{
      FULL: 3447,
    }
};
