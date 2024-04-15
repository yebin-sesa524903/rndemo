'use strict'

var _codes;

const CodeMap = {
  TicketEditPrivilegeCode: '2135',
  TicketExecutePrivilegeCode: '2133',//查看执行工单--完整权限
  AssetEditPrivilegeCode: '2105',
  FeedbackPrivilegeCode: '0',
  RegDeviceFullPrivilegeCode: '2176',
  LogLookPrivilegeCode: '2177',
  LogFullPrivilegeCode: '2178',
  ViewRiskFactor: '2168',
  FullRiskFactor: '2169',
  CommTicketRead: '7101',//仅查看(7101)命令票
  CreateCommTicketFull: '7102',//创建命令票：允许用户创建、编辑命令票
  OperationTicketRead: '7103',//仅查看(7103) 操作票
  OperationTicketFull: '7104',//创建操作票：允许用户生成、编辑操作票
  ExecuteOpeTicketFull: '7106',// 执行操作票：允许用户执行操作票在操作票上填写执行结果、签名等操作
  WorkTicketRead: '7107',//仅查看(7107) 工作票
  CreateWorkTicketFull: '7108',//创建工作票：允许用户生成、编辑工作票，分为无权限、仅查看(7107)、完整权限(7108)
  ExecuteWorkTicketFull: '7110',//执行工作票：允许用户执行工作票在工作票上填写执行结果、签名等操作，分为无权限、仅查看(7109)、完整权限(7110)

  OMTicketRead: '10050',
  OMTicketFull: '10049',
  OMTicketExecute: '10052',

  AlarmRead: '3135',
  AlarmFull: '3133',

  AssetTicketRead: '10054',
  AssetTicketFull: '10053',
  AssetTicketExecute: '10056',

  LedgerRead: '10008',
  LedgerFull: '10007'
}

export function getOperateBillPermission(codes) {
  let p = {}

  if (codes && codes.length > 0) {
    codes.forEach(item => {
      switch (item) {
        case CodeMap.ExecuteOpeTicketFull:
          p.canExe = true;
          p.canRead = true;
          break;
        case CodeMap.OperationTicketFull:
          p.canCreate = true;
          p.canRead = true;
          break;
        case CodeMap.OperationTicketRead:
          p.canRead = true;
          break;
      }
    })
  }
  return p;
}

export function getJobBillPermission(codes) {
  let p = {}
  if (codes && codes.length > 0) {
    codes.forEach(item => {
      switch (item) {
        case CodeMap.ExecuteWorkTicketFull:
          p.canExe = true;
          p.canRead = true;
          break;
        case CodeMap.CreateWorkTicketFull:
          p.canCreate = true;
          p.canRead = true;
          break;
        case CodeMap.WorkTicketRead:
          p.canRead = true;
          break;
      }
    })
  }
  return p;
}

export function getCommandBillPermission(codes) {
  let p = {}
  if (codes && codes.length > 0) {
    codes.forEach(item => {
      switch (item) {
        case CodeMap.CreateCommTicketFull:
          p.canCreate = true;
          p.canRead = true;
          break;
        case CodeMap.CommTicketRead:
          p.canRead = true;
          break;
      }
    })
  }
  return p;
}


export default {
  CodeMap,
  setPrivilegeCodes: (codes) => {
    // console.warn('codes',codes);
    _codes = codes;
  },
  hasAuth: (code) => {
    if (Number.isInteger(code)) code = String(code);
    if (_codes) {
      if (code === 'FeedbackPrivilegeCode') {
        return true;
      }
      //code can be 'TicketEditPrivilegeCode' or 2135
      if (CodeMap[code]) {
        code = CodeMap[code];
      }
      else {
        //console.warn('PrivilegeCode does not exist:%s',code);
      }
      // console.warn('code',code);
      code = _codes.find((item) => item === code);
      // console.warn('code',code);

      return code ? true : false;
    }
    return false;
  },
  checkModulePermission(target) {
    return (
      this.hasAuth(String(target.FULL)) ||
      this.hasAuth(String(target.READONLY))
    );
  },
  showService() {
    // 创建编辑服务报告-完整权限:6101
    // 查看执行服务工单-仅查看:6102
    // 查看执行服务工单-完整权限:6103
    // 服务报告管理-仅查看:6104
    // 服务报告管理-完整权限:6105
    // 全部报告-仅查看:6106
    // 报告日志审批-完整权限:6108
    let codes = [6101, 6102, 6103, 6104, 6105, 6106, 6108];
    for (let i = 0; i < codes.length; i++) {
      if (this.hasAuth(String(codes[i]))) return true;
    }
    return false;
  }
}
