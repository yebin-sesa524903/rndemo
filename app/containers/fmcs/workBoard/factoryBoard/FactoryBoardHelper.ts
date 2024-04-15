import Colors from "../../../../utils/const/Colors";
import { ElectricBoardChartType } from "../electricityBoard/ElectBoardHelper";

/**
 * 厂务任务
 * @param task
 */
export function convertTaskInfo(task: any) {
  return [{
    data: [
      {
        title: '巡检任务',
        totalCount: task.inspectTask?.totalCount,
        finishedCount: task.inspectTask?.finishedCount,
        iconName: require('../../../../images/aaxiot/board/xjrw.png'),
        colors: ['#98fb99', '#5ac657']
      },
      {
        title: '保养任务',
        totalCount: task.pmTask?.totalCount,
        finishedCount: task.pmTask?.finishedCount,
        iconName: require('../../../../images/aaxiot/board/byrw.png'),
        colors: ['#adb0fc', '#748bfd']
      },
      {
        title: '维修任务',
        totalCount: task.repairTask?.totalCount,
        finishedCount: task.repairTask?.finishedCount,
        iconName: require('../../../../images/aaxiot/board/wxrw.png'),
        colors: ['#60b9fe', '#1c7aff']
      },
      {
        title: '工单任务',
        totalCount: task.callInTicket?.totalCount,
        finishedCount: task.callInTicket?.finishedCount,
        iconName: require('../../../../images/aaxiot/board/gdrw.png'),
        colors: ['#fec385', '#ffa363']
      }
    ]
  }]
}

/**
 * 厂务能耗
 * @param energy
 */
export function convertEnergyInfo(energy: any) {
  return [
    {
      data: [
        {
          value: energy.electric,
          icon: require('../../../../images/aaxiot/board/cw_d.png'),
          unit: '电(kWh)'
        },
        {
          value: energy.water,
          icon: require('../../../../images/aaxiot/board/cw_s.png'),
          unit: '水(t)'
        },
        {
          value: energy.fuelGas,
          icon: require('../../../../images/aaxiot/board/cw_rq.png'),
          unit: '燃气(m3)'
        },
        {
          value: energy.vapor,
          icon: require('../../../../images/aaxiot/board/cw_zq.png'),
          unit: '蒸汽(kg)'
        }
      ]
    }
  ]
}

/**
 * 电课构建 构建主进状态数据
 * @param mainStatus
 */
export function convertMainVStatus(mainStatus: any) {
  let keys=['mv10', 'mv20', 'mv30', 'mv40'];
  let arrData=[];
  if (mainStatus) {
    for (let item of keys) {
      let objMv=mainStatus[item];
      if (objMv&&Object.keys(objMv).length>0) {
        arrData.push({
          title: objMv.deviceName,
          chartType: ElectricBoardChartType.semiCircleProgress,
          totalPower: objMv.totalPower,
          subTitle: `总功率${objMv.totalPower}kw`,
          status: objMv.status==="1"? '运行':'停止',
          statusColor: objMv.status==="1"? '#333':Colors.red.primary,
          temp: objMv.temp? '正常':'异常',
          tempColor: objMv.temp? '#333':Colors.red.primary,
          frequency: objMv.frequency===null? '-':objMv.frequency,
          electricity: objMv.electricity>600? 600:objMv.electricity,
          volRate: objMv.voltage.current*100.0/(objMv.voltage.max-objMv.voltage.min),
          voltage: objMv.voltage.current??'-',
          voltageMin: objMv.voltage.min,
          voltageMax: objMv.voltage.max,
        })
      }
    }
  }
  return arrData;
}


export enum FMChartLineType {
  doubleChartLine=2992,///两条曲线
  GMS,
  progress, ///erc
  instrument, ////仪表盘
  bar,  ///柱状图
}

export function gxkInfo(jxkData: any, voc: any, sex: any) {
  return [
    {
      title: '机械课运行',
      chartType: FMChartLineType.instrument,
      data: configJxkDataInfo(jxkData),
    },
    {
      title: 'VOC废气入口浓度',
      unit: '（mg/m³）',
      chartType: FMChartLineType.bar,
      data: configJxkPTGLDiscardData(voc, 0, '#ffa510'),
    },
    {
      title: 'VOC废气出口浓度',
      unit: '（mg/m³）',
      chartType: FMChartLineType.bar,
      data: configJxkPTGLDiscardData(voc, 1, '#ffc970'),
    },
    {
      title: 'SEX废气入口浓度',
      unit: '（mg/m³）',
      chartType: FMChartLineType.bar,
      data: configJxkPTGLDiscardData(sex, 0, '#4baefc'),
    },
    {
      title: 'SEX废气出口浓度',
      unit: '（mg/m³）',
      chartType: FMChartLineType.bar,
      data: configJxkPTGLDiscardData(sex, 1, '#93cefd'),
    }
  ];
}

/**
 * 构建机械课概览数据
 * @param jxk
 */
function configJxkDataInfo(jxk: any) {
  let tempData=[];
  for (let datum of jxk) {
    if (datum.value&&datum.value.length>0) {
      for (let obj of datum.value) {
        let colors: string[]=[];
        let values: number[]=[];
        let color='';
        if (obj.rangeMin!=undefined&&obj.rangeMax!=undefined) {
          let range=obj.rangeMax-obj.rangeMin;
          if (obj.min!=undefined&&obj.max!=undefined) {
            colors=['#ffa100', '#758dfe', '#ff0000'];
            values=[obj.min/range, obj.max/range, obj.rangeMax/100];
            if (obj.value<obj.min) {
              color=colors[0];
            } else if (obj.value<obj.max) {
              color=colors[1];
            } else {
              color=colors[2];
            }
          } else {
            colors=['#51abfe', '#ff0000'];
            if (obj.min!=undefined) {
              values=[obj.min/range, obj.rangeMax/100];
              color=colors[obj.value<obj.min? 0:1];
            } else if (obj.max!=undefined) {
              values=[obj.max/range, obj.rangeMax/100];
              color=colors[obj.value<obj.max? 0:1];
            }
          }
        } else {
          colors=['#51abfe', '#51abfe', '#51abfe'];
          values=[0, 0.5, 1];
          color='#51abfe';
        }

        tempData.push({
          name: obj.itemName,
          unit: '('+obj.unit+')',
          value: obj.value,
          colors: colors,
          values: values,
          color: color
        });
      }
    } else {
      tempData.push({
        name: datum.itemName,
        value: 0,
        colors: ['#51abfe', '#51abfe', '#51abfe'],
        values: [0, 0.5, 1],
        color: '#51abfe',
      });
    }
  }
  return tempData;
}

function configJxkPTGLDiscardData(data: any, index: number, barColor: string) {
  let tempData=[];
  for (let datum of data) {
    if (datum.datas&&datum.datas.length>1) {
      tempData.push({
        name: datum.name,
        value: datum.datas[index].value,
        color: barColor,
      })
    }
  }
  return tempData;
}

/**
 * 气化课运行 数据构建
 * @param gasOperation 各种气  数据
 * @param gmsMsg  //GMS数据
 */
export function gasInfo(gasOperation: any, gmsMsg: any) {
  return [
    {
      title: '大宗气',
      unit: getGasUnit(gasOperation.bulkGas),
      chartType: FMChartLineType.doubleChartLine,
      data: convertGasData(gasOperation.bulkGas),
    },
    {
      title: '特气',
      unit: getGasUnit(gasOperation.specialGas),
      chartType: FMChartLineType.doubleChartLine,
      data: convertGasData(gasOperation.specialGas),
    },
    {
      title: '化学品',
      unit: getGasUnit(gasOperation.chemical),
      chartType: FMChartLineType.doubleChartLine,
      data: convertGasData(gasOperation.chemical),
    },
    {
      title: 'GMS',
      chartType: FMChartLineType.GMS,
      data: convertGMSData(gmsMsg),
    }
  ]
}


const convertGasData=(info?: any) => {
  let data=[];
  let colors=['#00d3ca', '#758cfd']
  if (info&&info.length>0) {
    let index=0;
    for (let infoElement of info) {
      let tempData=[];
      if (infoElement.datas&&infoElement.datas.length>0) {
        for (let data1 of infoElement.datas) {
          if (data1.length>0) {
            tempData.push({
              x: data1[0],
              y: data1[1],
              name: infoElement.itemName,
              fill: colors[index],
            })
          }
        }
      }
      if (tempData.length>0) {
        data.push(tempData);
      }
      index++;
    }
  }
  return data;
}

const getGasUnit=(info?: any) => {
  let unit='';
  if (info&&info.length>0) {
    unit=info[0].unit;
  }
  return unit;
}


const convertGMSData=(gms: any) => {
  let data=[];
  for (let gm of gms) {
    if (gm.name=='未知') {
      continue;
    }
    let color='';
    let index=0;
    if (gm.name=='正常') {
      color='#04b443';
      index=0;
    } else if (gm.name=='隔离') {
      color='#ffa510';
      index=1;
    } else {
      color='#ff0000';
      index=2;
    }

    data.push({
      name: gm.name,
      value: gm.value,
      color: color,
      index: index,
    })
  }

  return data.sort((a, b) => a.index-b.index);
}

/**
 * 构建水课数据
 * @param skData
 */
export function configSkData(skData: any) {
  return [{
    title: '水课运行',
    chartType: FMChartLineType.instrument,
    data: configSkDataResult(skData),
  }];
}

function configSkDataResult(data: any) {
  let tempData=[];
  for (let datum of data) {
    let colors: string[]=[];
    let values: number[]=[];
    let color='';
    if (datum.rangeMin!=undefined&&datum.rangeMax!=undefined) {
      let range=datum.rangeMax-datum.rangeMin;
      if (datum.min!=undefined&&datum.max!=undefined) {
        colors=['#ffa100', '#758dfe', '#ff0000'];
        values=[datum.min/range, datum.max/range, datum.rangeMax/100];
        if (datum.value<datum.min) {
          color=colors[0];
        } else if (datum.value<datum.max) {
          color=colors[1];
        } else {
          color=colors[2];
        }
      } else {
        colors=['#51abfe', '#ff0000'];
        if (datum.min!=undefined) {
          values=[datum.min/range, datum.rangeMax/100];
          color=colors[datum.value<datum.min? 0:1];
        } else if (datum.max!=undefined) {
          values=[datum.max/range, datum.rangeMax/100];
          color=colors[datum.value<datum.max? 0:1];
        }
      }
    } else {
      colors=['#51abfe', '#51abfe', '#51abfe'];
      values=[0, 0.5, 1];
      color='#51abfe';
    }

    tempData.push({
      name: datum.itemName,
      unit: '('+datum.unit+')',
      value: datum.value,
      colors: colors,
      values: values,
      color: color,
    })
  }
  return tempData;
}

/**
 * 构建erc data
 * @param erc
 * @param gmsMsg
 */
export function configErcData(erc: any, gmsMsg: any) {
  let isolationCount=0;
  if (gmsMsg&&gmsMsg.length>0) {
    for (let gm of gmsMsg) {
      if (gm.name=='隔离') {
        isolationCount=gm.value;
        break;
      }
    }
  }
  return [{
    title: 'ERC运行',
    chartType: FMChartLineType.progress,
    alarmCount: erc.alarmCount,
    isolationCount: erc.isolationCount??isolationCount,
    breakdownCount: erc.breakdownCount,
    data: configDataResult(erc.data),
  }];
}

function configDataResult(data: any) {
  let tempData=[];
  for (let datum of data) {
    tempData.push({
      value: datum.metricsValue,
      title: datum.metricsKey,
      orderIndex: Number(datum.orderIndex??0),
    })
  }
  tempData=tempData.sort((a, b) => {
    return a.orderIndex-b.orderIndex;
  })
  return tempData;
}
