import Colors from "../../../../utils/const/Colors";
import { isEmptyString } from "../../../../utils/const/Consts";
import moment from "moment";
import { WaterBoardChartType } from "../waterBoard/WaterBoardHelper";

export enum MachineBoardChartType {
  tempCard=3000099,
  singleLine,//单条折线图
  multiLine,//多条折线图
  multiLineNoLegend,///多条折线但是不显示 头部legend
  CircleRound,    ///圆形progress

}

export function convertOverViewInfo(info: any) {
  return [
    {
      title: '设备状态统计',
      itemInfo: [
        {
          title: '总数',
          valueColor: Colors.text.primary,
          value: info.deviceStatus.totalCount,
        },
        {
          title: '正常',
          valueColor: Colors.text.primary,
          value: info.deviceStatus.normalCount,
        },
        {
          title: '带病',
          valueColor: Colors.text.primary,
          value: info.deviceStatus.stopCount,
        },
        {
          title: '备机',
          valueColor: Colors.text.primary,
          value: info.deviceStatus.backupCount,
        },
        {
          title: '故障',
          valueColor: Colors.text.primary,
          value: info.deviceStatus.faultCount,
        },
      ]
    },
    {
      title: '今日安全隐患任务',
      itemInfo: [
        {
          title: '总计',
          valueColor: Colors.text.primary,
          value: info.riskTask.totalCount,
        },
        {
          title: '已完成',
          valueColor: Colors.green.primary,
          value: info.riskTask.finishedCount,
        },
        {
          title: '未完成',
          valueColor: Colors.yellow.primary,
          value: info.riskTask.unfinishedCount,
        },
      ]
    },
    {
      title: '今日话务工单',
      itemInfo: [
        {
          title: '总计',
          valueColor: Colors.text.primary,
          value: info.callInTicket.totalCount,
        },
        {
          title: '已完成',
          valueColor: Colors.green.primary,
          value: info.callInTicket.finishedCount,
        },
        {
          title: '未完成',
          valueColor: Colors.yellow.primary,
          value: info.callInTicket.unfinishedCount,
        },
      ]
    },
    {
      title: '今日保养任务',
      showViewDetails: true,
      itemInfo: [
        {
          title: '总计',
          valueColor: Colors.text.primary,
          value: info.pmTask.totalCount,
        },
        {
          title: '已完成',
          valueColor: Colors.green.primary,
          value: info.pmTask.finishedCount,
        },
        {
          title: '未完成',
          valueColor: Colors.yellow.primary,
          value: info.pmTask.unfinishedCount,
        },
      ]
    },
    {
      title: '今日设备巡检任务',
      showViewDetails: true,
      itemInfo: [
        {
          title: '总计',
          valueColor: Colors.text.primary,
          value: info.inspectTask.totalCount,
        },
        {
          title: '已完成',
          valueColor: Colors.green.primary,
          value: info.inspectTask.finishedCount,
        },
        {
          title: '未完成',
          valueColor: Colors.yellow.primary,
          value: info.inspectTask.unfinishedCount,
        },
      ]
    },
    {
      title: '今日设备维修任务',
      showViewDetails: true,
      itemInfo: [
        {
          title: '总计',
          valueColor: Colors.text.primary,
          value: info.repairTask.totalCount,
        },
        {
          title: '已完成',
          valueColor: Colors.green.primary,
          value: info.repairTask.finishedCount,
        },
        {
          title: '未完成',
          valueColor: Colors.yellow.primary,
          value: info.repairTask.unfinishedCount,
        },
      ]
    },
    // {
    //   title: '耗材更换任务',
    //   showViewDetails: true,
    //   itemInfo: [
    //     {
    //       title: '总计',
    //       valueColor: Colors.text.primary,
    //       value: info.repairTask.totalCount,
    //     },
    //     {
    //       title: '已完成',
    //       valueColor: Colors.green.primary,
    //       value: info.repairTask.finishedCount,
    //     },
    //     {
    //       title: '未完成',
    //       valueColor: Colors.yellow.primary,
    //       value: info.repairTask.unfinishedCount,
    //     },
    //   ]
    // }
  ]
}

/**
 * 构建无尘室温湿度info
 * @param info
 */
export function convertTempHumitureInfo(response: any) {

  if (!response) {
    return [];
  }
  let temperature=configChartLineData(response.temperature);
  let temperatureNotLitho=configChartLineData(response.temperatureNotLitho);
  let humidness=configChartLineData(response.humidness);
  let humidnessNotLitho=configChartLineData(response.humidnessNotLitho);
  let particle=configChartLineData(response.particle);
  return [
    temperature,
    temperatureNotLitho,
    humidness,
    humidnessNotLitho,
    particle,
  ]
}

/**
 * 构建CUS系统info
 * @param cusLowMiddleStatus
 * @param cusIceHotWaterData
 */
export function convertCusSystem(cusLowMiddleStatus: any, cusIceHotWaterData: any) {

  return  [
    {
      title:cusIceHotWaterData.dwbs.itemName,
      rightTitle:(cusLowMiddleStatus.lowIceWaterTemp.value ? cusLowMiddleStatus.lowIceWaterTemp.value.toFixed(0): "-") + cusLowMiddleStatus.lowIceWaterTemp.unit,
      chartType: MachineBoardChartType.multiLine,
      legendData:configChartLegendData(cusLowMiddleStatus.lowIceDeviceList),
      data: configCUSChartData(cusIceHotWaterData.dwbs),
    },
    {
      title:cusIceHotWaterData.zwbs.itemName,
      rightTitle:(cusLowMiddleStatus.mediumIceWaterTemp.value? cusLowMiddleStatus.mediumIceWaterTemp.value.toFixed(0):'-') + cusLowMiddleStatus.mediumIceWaterTemp.unit,
      chartType: MachineBoardChartType.multiLine,
      legendData:configChartLegendData(cusLowMiddleStatus.mediumIceDeviceList),
      data: configCUSChartData(cusIceHotWaterData.zwbs),
    },
    {
      title:cusIceHotWaterData.zwrs.itemName,
      rightTitle:(cusLowMiddleStatus.mediumHotWaterTemp.value?cusLowMiddleStatus.mediumHotWaterTemp.value.toFixed(0):'-') + cusLowMiddleStatus.mediumHotWaterTemp.unit,
      chartType: MachineBoardChartType.multiLineNoLegend,
      data: configCUSChartData(cusIceHotWaterData.zwrs),
    },
    {
      title:cusIceHotWaterData.gwrs.itemName,
      rightTitle:(cusLowMiddleStatus.highHotWaterTemp.value?cusLowMiddleStatus.highHotWaterTemp.value.toFixed(0):'-') + cusLowMiddleStatus.highHotWaterTemp.unit,
      chartType: MachineBoardChartType.multiLineNoLegend,
      data: configCUSChartData(cusIceHotWaterData.gwrs),
    }
  ]
}

/**
 * CUS 低温/中温 图表头部展示数据组合
 * @param deviceList
 */
function configChartLegendData(deviceList: any[]){
  let legendData = [];
  for (let deviceListElement of deviceList) {
    legendData.push({
      title: deviceListElement.itemName + ':',
      value: deviceListElement.value == 0 ? '停机' : '开机',
      valueColor: deviceListElement.value == 0? '#F6A93B' :'#1FC26D',
    })
  }
  return legendData;
}

/**
 * CUS 图表数据组合
 * @param response
 */
function configCUSChartData(response: any){
  let supplyArray = [];
  for (let supply of response.supply) {
    let xValue: number = 0, yValue: number = 0;
    if (supply.length > 1){
      xValue = moment(supply[0]).unix();
      yValue = supply[1];
    }
    supplyArray.push({
      x: xValue,
      y: yValue,
      name:'主管供水压力',
      fill:'#1FC26D',
      fillMark: '#1FC26D',
    })
  }
  let backArray = [];
  for (let back of response.back) {
    let xValue: number = 0, yValue: number = 0;
    if (back.length > 1){
      xValue = moment(back[0]).unix();
      yValue = back[1];
    }
    backArray.push({
      x: xValue,
      y: yValue,
      name:'主管回水压力',
      fill:'#2A40F4',
      fillMark: '#2A40F4',
    })
  }
  let differenceArray = [];
  for (let difference of response.difference) {
    let xValue: number = 0, yValue: number = 0;
    if (difference.length > 1){
      xValue = moment(difference[0]).unix();
      yValue = difference[1];
    }
    differenceArray.push({
      x: xValue,
      y: yValue,
      name:'主管压差',
      fill:'#209EF5',
      fillMark: '#209EF5',
    })
  }
  return [supplyArray, backArray, differenceArray];
}

/**
 * 构建PCW info
 * @param pwdPvStatus
 * @param pcwPvFrequency
 */
export function convertPcwSystem(pwdPvStatus: any, pcwPvFrequency: any) {
  if (!pwdPvStatus) {
    return [];
  }
  let itemPressure=configChartLineData(pwdPvStatus.itemPressure);
  let itemTemperature=configChartLineData(pwdPvStatus.itemTemperature);
  return [
    itemPressure,
    itemTemperature,
    configFrequency(pcwPvFrequency.pcw)
  ]
}

/**
 * 构建泵频率 数据集合
 * @param item
 */
function configFrequency(item: any){
  return {
    title:item?.itemName??'-',
    value: item?.value ?? 0,
    unit: item?.unit??'-',
    chartType: MachineBoardChartType.CircleRound,
  }
}

/**
 * 构建PV info
 * @param pwdPvStatus
 * @param pcwPvFrequency
 */
export function convertPvSystem(pwdPvStatus: any, pcwPvFrequency: any) {
  if (!pwdPvStatus) {
    return [];
  }
  let itemZkPressure=configChartLineData(pwdPvStatus.itemZkPressure);
  // let itemTemperature=configChartLineData(pwdPvStatus.itemTemperature);
  return [
    itemZkPressure,
    configFrequency(pcwPvFrequency.pv)
  ]
}

/**
 * 构建无尘室温湿度info
 * @param info
 */
export function convertVocSexSystem(response: any) {
  if (!response) {
    return [];
  }
  let itemCh4=configChartLineData(response.itemCh4);
  let itemNmhc=configChartLineData(response.itemNmhc);
  let itemThc=configChartLineData(response.itemThc);
  let itemSo2=configChartLineData(response.itemSo2);
  let itemNo=configChartLineData(response.itemNo);
  let itemO2=configChartLineData(response.itemO2);
  return [
    itemCh4,
    itemNmhc,
    itemThc,
    itemSo2,
    itemNo,
    itemO2
  ]
}

/**
 * 构建排气压力info
 * @param info
 */
export function convertExhaustStatus(response: any) {
  if (!response) {
    return [];
  }
  let itemSp=configChartLineData(response.itemSp);
  let itemYb=configChartLineData(response.itemYb);
  let itemTp=configChartLineData(response.itemTp);
  let itemYjp=configChartLineData(response.itemYjp);
  let itemNo=configChartLineData(response.itemNo);
  let itemO2=configChartLineData(response.itemO2);
  return [
    itemSp,
    itemYb,
    itemTp,
    itemYjp,
  ]
}

/**
 * 构建房间温度info
 * @param response
 */
export function convertHouseTemperateStatus(response: any) {
  if (!response) {
    return [];
  }
  let arrData=[];
  if (response) {
    for (let objMv of response) {
      let temperate = objMv.value ? Number(objMv.value.toFixed(1)) : '-';
      if (temperate > 50){
        temperate = 50;
      }
      arrData.push({
        title: "名称:",
        subTitle: "(" + objMv.itemName + ")",
        chartType: MachineBoardChartType.tempCard,
        value: temperate,
        unit: objMv.unit??'°C',
        max: objMv.max,
        min: objMv.min,
        desc: objMv.desc,
        code: objMv.itemCode,
        name: objMv.itemName,
      })
    }
  }
  return arrData;
}

/**
 * 构建曲线图表数据
 * @param data
 */
const configChartLineData=(data: any) => {
  let result={};
  if (data) {
    let itemData=[];
    if (data.datas) {
      for (let obj of data.datas) {
        if (obj&&obj.length>1) {
          itemData.push({
            x: obj[0]/1000,
            y: obj[1],
          })
        }
      }
    }
    let range = undefined;
    if (data.max || data.min){
      range = {max: data.max, min: data.min};
    }

    result={
      title: data.itemName,
      unit: (isEmptyString(data.unit) || data.unit == 'xx')? ' ':`(${data.unit})`,
      chartType: WaterBoardChartType.chartLine,
      data: itemData,
      rightRange: range,
    }
  }

  return result;
}

