export default [
  {
    title:'模板1',
    data:[
      '检查{asset}具备停电条件',
      '检查{asset}真空断路器已断开',
      '断开{asset}合闸电流电压',
      '断开{asset}控制电压',
    ]
  },
  {
    title:'模板2',
      data:[
    '检查{asset}具备停电条件',
    '检查{asset}真空断路器已断开',
    '将{asset}小车由工作位遥至试验位',
    ]
  },
  {
    title:'模板3',
    data:[
      '检查{asset}具备停电条件',
      '检查{asset}真空断路器已断开',
      '断开{asset}合闸电流电压',
      '检查{asset}接地刀闸确已合闸到位',
      '检查{asset}真空断路器已断开',
      '断开{asset}合闸电流电压',
    ]
  }
]

export const jobTaskTpl = [
  {
    title:'模板1',
    tasks:[
      {
        title:'拉开刀闸',
        steps:[
          {action:'断开',content:'真空断路器'},
          {action:'检查',content:'断路器'},
        ]
      },
      {
        title:'装接地线',
        steps:[
          {action:'合',content:'接地线'},
        ]
      },
      {
        title:'挂指示牌',
        steps:[
          {action:'在',content:'悬挂指示牌'},
          {action:'再用布把',content:'包围起来'},
          {action:'最后',content:''},
        ]
      },
      {
        title:'补充安全措施',
        steps:[
          {action:'安全第一',content:'安全第一'},
        ]
      }
    ]
  },
  {
    title:'模板2',
    tasks:[
      {
        title:'拉开刀闸',
        steps:[
          {action:'断开',content:'真空断路器'},

        ]
      },
      {
        title:'装接地线',
        steps:[
          {action:'检查',content:'断路器'},
          {action:'合',content:'接地线'},
        ]
      },
      {
        title:'挂指示牌',
        steps:[
          {action:'在',content:'悬挂指示牌'},
          {action:'最后',content:''},
          {action:'再用布把',content:'包围起来'},
        ]
      },
      {
        title:'补充安全措施',
        steps:[
          {action:'安全第一',content:'安全第一'},
        ]
      }
    ]
  }
]

export const testAsset = [
  {
    title:'配电室1',
    Id:1,
    data:[
      {Id:11,Name:'电容柜1',Num:'3EBc'},
      {Id:12,Name:'电容柜2',Num:'3ABc'},
      {Id:13,Name:'电容柜3',Num:'33Bc'},
      {Id:14,Name:'电容柜1',Num:'3EBc'},
      {Id:15,Name:'电容柜2',Num:'3ABc'},
      {Id:16,Name:'电容柜3',Num:'33Bc'},
      {Id:17,Name:'电容柜1',Num:'3EBc'},
      {Id:18,Name:'电容柜2',Num:'3ABc'},
      {Id:19,Name:'电容柜3',Num:'33Bc'}
    ]
  },
  {
    title:'配电室2',
    Id:2,
    data:[
      {Id:21,Name:'变压器柜1',Num:'aac'},
      {Id:22,Name:'变压器柜2',Num:'ddc'},
      {Id:23,Name:'变压器柜3',Num:'ddc'},

    ]
  },
  {
    title:'配电室3',
    Id:3,
    data:[
      {Id:31,Name:'进线柜1',Num:'N11'},
      {Id:32,Name:'进线柜2',Num:'B22'},
    ]
  },
  {
    title:'配电室5',
    data:[
      {Id:51,Name:'进线柜1',Num:'N11'},
      {Id:52,Name:'进线柜2',Num:'B22'},
    ]
  }
]

export const STAFF = ['杨广','杨玄感','李靖','李渊','王世充','李密','李世民','秦叔宝','罗士信','程咬金','徐世绩','尉迟恭'];
export const STAFF_GROUP = ['皇帝','重臣','猛将','革命者'];

