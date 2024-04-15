import Colors from "../../../../utils/const/Colors";
import { isEmptyString } from "../../../../utils/const/Consts";
import { WaterBoardData } from "../../../../components/fmcs/workBoard/water/WaterBoard";
import moment, { now } from "moment";

export enum WaterBoardChartType {
  chartLine=200099,///饼图
  multiBar,//多条 bar
  singleBar,///单个bar
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
      title: '今日Call-In工单',
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
      title: '今日PM任务',
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
    }
  ]
}

/**
 * 构建纯水 曲线图展示数据
 * @param response
 * @param consumptionResponse
 * @param upwWwtConsumerData
 * @param recycleRateData
 * @param upwWwtPowerConsumeData
 */
export const convertCSChartLineInfo=(response: any, consumptionResponse: any, upwWwtConsumerData: any, recycleRateData: any, upwWwtPowerConsumeData: any) => {
  // if (!response||!consumptionResponse||!upwWwtConsumerData||!upwWwtPowerConsumeData) {
  //   return [];
  // }
  if (!response) {
    return [];
  }
  let particle=configChartLineData(response.particle);
  let resistivity=configChartLineData(response.resistivity);
  let si=configChartLineData(response.itemSi);
  let d0=configChartLineData(response.itemDo);
  let toc=configChartLineData(response.itemToc);
  let temperature=configChartLineData(response.temperature);
  let pressure=configChartLineData(response.pressure);
  // 纯水化学品消耗统计
  let consumption=configWaterConsumption(consumptionResponse.pureChemicalConsumption, 'UPW');
  // ///用水量
  let itemUPW=configConsumeData(upwWwtConsumerData.itemUPW);
  let itemLSR=configConsumeData(upwWwtConsumerData.itemLSR);
  ///回收率
  let recycleRate=configConsumeData(recycleRateData);

  ///电耗量
  let powerConsumption=configPowerConsume(upwWwtPowerConsumeData.purePowerConsume);

  return [
    particle,
    resistivity,
    si,
    d0,
    toc,
    temperature,
    pressure,
    consumption,
    itemUPW,
    itemLSR,
    recycleRate,
    powerConsumption,
  ]
}


/**
 * 构建曲线图表数据
 * @param data
 */
const configChartLineData=(data: any) => {
  let result: WaterBoardData={};
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

    result={
      title: data.itemName,
      unit: isEmptyString(data.unit)? ' ':`(${data.unit})`,
      chartType: WaterBoardChartType.chartLine,
      data: itemData,
      rightRange: { max: data.max, min: data.min }
    }
  }

  return result;
}

/**
 * 化学品耗量统计 数据构建
 * @param data  pureChemicalConsumption  {datas:{}[]}[]
 * @param title
 */
const configWaterConsumption=(data: any, title: string) => {
  let result: WaterBoardData={};
  if (data&&data.length>0) {
    let tempData=[];
    let colors=['#fea45b', '#45a0ff', '#1cc26a', '#826CE6','#EB4741','#04602f', '#daad15', '#c2419b','#187509','#751e15'];
    let i=0;
    for (let datum of data) {
      let itemData=[];
      let color=colors[i];
      for (let obj of datum.datas) {
        if (obj&&obj.length>1) {
          let dateTime = obj[0];
          let date = moment(dateTime).format('MM-DD');
          itemData.push({
            name: date,
            value: obj[1],
            color: color,
          })
        }
      }
      i++;
      if (itemData.length>0) {
        tempData.push({
          itemName: datum.itemName,
          datas: itemData,
        });
      }
    }

    result={
      title: title+'化学品耗量统计',
      chartType: WaterBoardChartType.multiBar,
      data: tempData,
    }
  }
  return result;
}

/**
 * 用水量
 * @param data
 */
function configConsumeData(data: any) {
  let result: WaterBoardData={};
  if (data&&data.datas) {
    let itemData=[];
    let dates=daysArray(data.datas.length)
    let i=0;
    for (let obj of data.datas) {
      itemData.push({
        name: dates[i],
        value: (obj??""),
      })
      i++;
    }
    if (data.unit == '广义'){
      data.unit = 'KWH'
    }
    result={
      title: data.itemName,
      chartType: WaterBoardChartType.singleBar,
      data: itemData,
      unit: `(${data.unit})`,
    }
  }
  return result;
}

/**
 * 电耗量
 * @param data
 */
function configPowerConsume(data: any) {
  let result: WaterBoardData={};
  if (data) {
    let itemData=[];
    for (let obj of data.datas) {
      if (obj&&obj.length>1) {
        itemData.push({
          name: (moment(obj[0]).format("MM.DD")).replace('0',''),
          value: obj[1],
        })
      }
    }
    result={
      title: data.itemName,
      chartType: WaterBoardChartType.singleBar,
      unit: `(${data.unit})`,
      data: itemData,
    }
  }
  return result;
}

/**
 * 获取当前日期前7天日期集合
 * @param length
 */
function daysArray(length: number) {
  let passDate=moment().add(-length+1, 'd').toDate();
  let dateArray=[];
  let dateTemp;
  for (let i=0; i<length; i++) {
    dateTemp=(passDate.getMonth()+1)+'.'+passDate.getDate();
    dateArray.push(dateTemp);
    passDate.setDate(passDate.getDate()+1)
  }
  return dateArray;
}

/**
 * 构建废水 曲线图展示数据
 * @param response
 * @param consumptionResponse
 * @param upwWwtConsumerData
 * @param upwWwtPowerConsumeData
 */
export const convertFSChartLineInfo=(response: any, consumptionResponse: any, upwWwtConsumerData: any, upwWwtPowerConsumeData: any) => {
  // if (!response||!consumptionResponse||!upwWwtConsumerData||!upwWwtPowerConsumeData) {
  //   return [];
  // }
  if (!response) {
    return [];
  }
  let itemPh=configChartLineData(response.itemPh);
  let itemSs=configChartLineData(response.itemSs);
  let itemF=configChartLineData(response.itemF);
  let itemNhn=configChartLineData(response.itemNhn);
  let itemCu=configChartLineData(response.itemCu);

  ///废水化学品消耗统计
  let consumption=configWaterConsumption(consumptionResponse.sewageChemicalConsumption, 'WWT');
  ///WWT排放量
  let itemWWT=configConsumeData(upwWwtConsumerData.itemWWT);
  ///WWT电耗量
  let wasteWWTPowerConsume=configPowerConsume(upwWwtPowerConsumeData.wastePowerConsume);
  return [
    itemPh,
    itemSs,
    itemF,
    itemNhn,
    itemCu,
    consumption,
    itemWWT,
    wasteWWTPowerConsume,
  ]
}
