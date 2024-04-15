import PermissionCode from "./PermissionCode";

export const permissionList = [
  {
    key: "public",
    text: "公共权限",
    defaultChecked: true,
    disabled: true,
    sub: [
      {
        id: 1,
        text: "资产管理地图",
        defaultChecked: true,
        code: PermissionCode.ASSET_MANAGE_MAP.READONLY,
        permissions: {
          readOnly: PermissionCode.ASSET_MANAGE_MAP.READONLY
        }
      },
      {
        id: 2,
        text: "设备数据监视查看",
        defaultChecked: true,
        code: PermissionCode.DEVICE_DATA_MONITOR.READONLY,
        permissions: {
          readOnly: PermissionCode.DEVICE_DATA_MONITOR.READONLY
        }
      },
      {
        id: 3,
        text: "设备历史数据查看",
        defaultChecked: true,
        code: PermissionCode.DEVICE_HISTORY_DATA.READONLY,
        permissions: {
          readOnly: PermissionCode.DEVICE_HISTORY_DATA.READONLY
        }
      }
    ]
  },
  {
    key: "asset",
    text: "资产管理",
    sub: [
      {
        id: 5,
        text: "资产基础信息",
        code: PermissionCode.ASSET_BASIC_INFO.FULL,
        permissions: {
          full: PermissionCode.ASSET_BASIC_INFO.FULL,
          readOnly: PermissionCode.ASSET_BASIC_INFO.READONLY
        }
      },
      {
        id: 7,
        text: "资产运维参数",
        code: PermissionCode.ASSET_RUNNING_CONFIG.FULL,
        permissions: {
          readOnly: PermissionCode.ASSET_RUNNING_CONFIG.READONLY,
          full: PermissionCode.ASSET_RUNNING_CONFIG.FULL
        }
      },
      {
        id: 9,
        text: "数据监视显示设置",
        code: PermissionCode.DATA_MONITOR_SETTING.FULL,
        permissions: {
          readOnly: PermissionCode.DATA_MONITOR_SETTING.READONLY,
          full: PermissionCode.DATA_MONITOR_SETTING.FULL
        }
      },
      {
        id: 10,
        text: "设备历史数据导出",
        code: PermissionCode.DEVICE_HISTORY_DATA_EXPORT.READONLY,
        permissions: {
          readOnly: PermissionCode.DEVICE_HISTORY_DATA_EXPORT.READONLY
        }
      },
      {
        id: 35,
        text: "维护日志",
        code: PermissionCode.POP_OPERATION_LOG.FULL,
        permissions: {
          readOnly: PermissionCode.POP_OPERATION_LOG.READONLY,
          full: PermissionCode.POP_OPERATION_LOG.FULL
        }
      },
      {
        id: 34,
        text: "注册设备",
        code: PermissionCode.POP_REGISTER_DEVICE.FULL,
        permissions: {
          full: PermissionCode.POP_REGISTER_DEVICE.FULL
        }
      }
    ]
  },
  {
    key: "alarm",
    text: "报警管理",
    sub: [
      {
        id: 4,
        text: "故障报警",
        code: PermissionCode.SP_FAULT_ALARM.FULL,
        permissions: {
          readOnly: PermissionCode.SP_FAULT_ALARM.READONLY,
          full: PermissionCode.SP_FAULT_ALARM.FULL
        }
      },
      {
        id: 6,
        text: "资产报警信息",
        code: PermissionCode.ASSET_ALARM_INFO.FULL,
        permissions: {
          readOnly: PermissionCode.ASSET_ALARM_INFO.READONLY,
          full: PermissionCode.ASSET_ALARM_INFO.FULL
        }
      },
      {
        id: 8,
        text: "报警短信通知设置",
        code: PermissionCode.ALRAM_SMS_NOTICE_SETTING.FULL,
        permissions: {
          readOnly: PermissionCode.ALRAM_SMS_NOTICE_SETTING.READONLY,
          full: PermissionCode.ALRAM_SMS_NOTICE_SETTING.FULL
        }
      }
    ]
  },
  {
    key: "operate",
    text: "运维管理",
    sub: [
      {
        id: 19,
        text: "维护计划",
        code: PermissionCode.POP_MAINTAIN_PLAN.FULL,
        permissions: {
          readOnly: PermissionCode.POP_MAINTAIN_PLAN.READONLY,
          full: PermissionCode.POP_MAINTAIN_PLAN.FULL
        }
      },
      {
        id: 21,
        text: "查看执行工单",
        code: PermissionCode.POP_TICKET_VIEW_MANAGEMENT.FULL,
        permissions: {
          readOnly: PermissionCode.POP_TICKET_VIEW_MANAGEMENT.READONLY,
          full: PermissionCode.POP_TICKET_VIEW_MANAGEMENT.FULL
        }
      },
      {
        id: 22,
        text: "创建编辑工单",
        code: PermissionCode.POP_TICKET_EDIT_MANAGEMENT.FULL,
        permissions: {
          full: PermissionCode.POP_TICKET_EDIT_MANAGEMENT.FULL
        }
      },
      {
        id: 23,
        text: "客户全部工单",
        code: PermissionCode.POP_ALL_TICKET.READONLY,
        permissions: {
          readOnly: PermissionCode.POP_ALL_TICKET.READONLY
        }
      },
      {
        id: 36,
        text: "作业程序",
        code: PermissionCode.POP_INSPECTION_PROGRAM.FULL,
        permissions: {
          readOnly: PermissionCode.POP_INSPECTION_PROGRAM.READONLY,
          full: PermissionCode.POP_INSPECTION_PROGRAM.FULL
        }
      },
      // DISPATCH_PANEL_ENTITLED && {
      //   id: 38,
      //   text: "运维大屏",
      //   code: PermissionCode.POP_DISPATCH_PANEL.FULL,
      //   permissions: {
      //     full: PermissionCode.POP_DISPATCH_PANEL.FULL
      //   }
      // }
    ].filter(Boolean)
  },
  {
    key: "doc",
    text: "文档管理",
    sub: [
      {
        id: 20,
        text: "文档管理",
        code: PermissionCode.POP_DOCUMENT_MANAGEMENT.FULL,
        permissions: {
          readOnly: PermissionCode.POP_DOCUMENT_MANAGEMENT.READONLY,
          full: PermissionCode.POP_DOCUMENT_MANAGEMENT.FULL
        }
      }
    ]
  },
  {
    key: "report",
    text: "报告管理",
    sub: [
      {
        id: 19,
        text: "工单报告",
        code: PermissionCode.POP_TICKET_REPORT.FULL,
        permissions: {
          readOnly: PermissionCode.POP_TICKET_REPORT.FULL,
          full: PermissionCode.POP_TICKET_REPORT.READONLY
        }
      },
      {
        id: 20,
        text: "资产报告",
        code: PermissionCode.POP_ASSET_REPORT.FULL,
        permissions: {
          readOnly: PermissionCode.POP_ASSET_REPORT.FULL,
          full: PermissionCode.POP_ASSET_REPORT.READONLY
        }
      },
      {
        id: 21,
        text: "资产报表",
        code: PermissionCode.POP_ASSET_REPORT_FORM.FULL,
        permissions: {
          readOnly: PermissionCode.POP_ASSET_REPORT_FORM.FULL,
          full: PermissionCode.POP_ASSET_REPORT_FORM.READONLY
        }
      },
      {
        id: 22,
        text: "断路器跳闸报告",
        code: PermissionCode.POP_CIRCUIT_BREAKER_TRIP_REPORT.FULL,
        permissions: {
          readOnly: PermissionCode.POP_CIRCUIT_BREAKER_TRIP_REPORT.FULL,
          full: PermissionCode.POP_CIRCUIT_BREAKER_TRIP_REPORT.READONLY
        }
      },
      {
        id: 32,
        text: "资产健康报告",
        code: PermissionCode.POP_REPORT_ASSET_HEALTH.FULL,
        permissions: {
          full: PermissionCode.POP_REPORT_ASSET_HEALTH.FULL
        }
      }
    ]
  },
  {
    key: "diagnose",
    text: "诊断分析",
    sub: [
      {
        id: 25,
        text: "智能诊断",
        code: PermissionCode.POP_DIAGNOSE_ANALYSIS.FULL,
        permissions: {
          readOnly: PermissionCode.POP_DIAGNOSE_ANALYSIS.READONLY,
          full: PermissionCode.POP_DIAGNOSE_ANALYSIS.FULL
        }
      },
      {
        id: 26,
        text: "系统概览",
        code: PermissionCode.POP_SYSTEM_OVERVIEW.FULL,
        permissions: {
          readOnly: PermissionCode.POP_SYSTEM_OVERVIEW.READONLY,
          full: PermissionCode.POP_SYSTEM_OVERVIEW.FULL
        }
      },
      {
        id: 28,
        text: "改进方案",
        code: PermissionCode.POP_SOLUTION.FULL,
        permissions: {
          readOnly: PermissionCode.POP_SOLUTION.READONLY,
          full: PermissionCode.POP_SOLUTION.FULL
        }
      },
      {
        id: 29,
        text: "未推送方案",
        code: PermissionCode.POP_NOT_PUSH_SOLUTION.FULL,
        permissions: {
          readOnly: PermissionCode.POP_NOT_PUSH_SOLUTION.READONLY,
          full: PermissionCode.POP_NOT_PUSH_SOLUTION.FULL
        }
      },
      {
        id: 30,
        text: "已推送方案",
        code: PermissionCode.POP_PUSH_SOLUTION.FULL,
        permissions: {
          readOnly: PermissionCode.POP_PUSH_SOLUTION.READONLY,
          full: PermissionCode.POP_PUSH_SOLUTION.FULL
        }
      },
      {
        id: 31,
        text: "数据点管理",
        code: PermissionCode.POP_TAG_MANAGEMENT.FULL,
        permissions: {
          readOnly: PermissionCode.POP_TAG_MANAGEMENT.READONLY,
          full: PermissionCode.POP_TAG_MANAGEMENT.FULL
        }
      },
      {
        id: 27,
        text: "数据分析",
        code: PermissionCode.POP_DATA_ANALYSIS.FULL,
        permissions: {
          readOnly: PermissionCode.POP_DATA_ANALYSIS.READONLY,
          full: PermissionCode.POP_DATA_ANALYSIS.FULL
        }
      }
    ]
  },
  {
    key: "gateway",
    text: "网关管理",
    sub: [
      {
        id: 17,
        text: "物理网关管理",
        code: PermissionCode.SP_GATEWAY_MANAGEMENT.FULL,
        permissions: {
          readOnly: PermissionCode.SP_GATEWAY_MANAGEMENT.READONLY,
          full: PermissionCode.SP_GATEWAY_MANAGEMENT.FULL
        }
      },
      {
        id: 18,
        text: "虚拟网关管理",
        code: PermissionCode.EMOP_EMDC_GATEWAY_MANAGEMENT.FULL,
        permissions: {
          readOnly: PermissionCode.EMOP_EMDC_GATEWAY_MANAGEMENT.READONLY,
          full: PermissionCode.EMOP_EMDC_GATEWAY_MANAGEMENT.FULL
        }
      },
      {
        id: 14,
        text: "模板库管理",
        code: PermissionCode.SP_TEMPLATE_MANAGEMENT.FULL,
        permissions: {
          readOnly: PermissionCode.SP_TEMPLATE_MANAGEMENT.READONLY,
          full: PermissionCode.SP_TEMPLATE_MANAGEMENT.FULL
        }
      }
    ]
  },
  {
    key: "dataPanel",
    text: "数据看板",
    sub: [
      {
        id: 33,
        text: "数据看板",
        code: PermissionCode.SP_DATA_BOARD.FULL,
        permissions: {
          readOnly: PermissionCode.SP_DATA_BOARD.READONLY,
          full: PermissionCode.SP_DATA_BOARD.FULL
        }
      }
    ]
  },
  {
    key: "platform",
    text: "平台管理",
    sub: [
      {
        id: 12,
        text: "客户管理",
        code: PermissionCode.SP_CUSTOMER_MANAGE.FULL,
        onlyForSp: true,
        permissions: {
          readOnly: PermissionCode.SP_CUSTOMER_MANAGE.READONLY,
          full: PermissionCode.SP_CUSTOMER_MANAGE.FULL
        }
      },
      {
        id: 13,
        text: "用户管理",
        code: PermissionCode.SP_USER_MANAGE.FULL,
        permissions: {
          readOnly: PermissionCode.SP_USER_MANAGE.READONLY,
          full: PermissionCode.SP_USER_MANAGE.FULL
        }
      },
      {
        id: 37,
        text: "角色管理",
        code: PermissionCode.POP_ROLE_MANAGEMENT.FULL,
        permissions: {
          full: PermissionCode.POP_ROLE_MANAGEMENT.FULL
        }
      }
    ]
  }
];
export function hasCheckedPermission(permission, checkedPermissions) {
  //这个permission参数是permissionList里外层的那个，如公共权限
  let hasContent = false;
  permission.sub.forEach(p => {
    if (checkedPermissions.indexOf(p) >= 0) {
      hasContent = true;
    }
  });
  return hasContent;
}
