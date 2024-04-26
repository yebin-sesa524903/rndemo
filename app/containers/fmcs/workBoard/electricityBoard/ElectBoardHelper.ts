import Colors from "../../../../utils/const/Colors";
import { PieLineObj } from "../../../../components/fmcs/workBoard/charts/Pie";
import { isEmptyString, TimeFormatYMD } from "../../../../utils/const/Consts";
import moment from "moment";
import { sortArray } from "../../plantOperation/utils/Utils";

export enum ElectricBoardChartType {
  semiCircleProgress=200099,///进度条
  table,///表格
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
    }
  ]
}

/**
 * 构建主进状态info
 * @param info
 */
export function convertIncomingInfo(info: any) {
  let keys=['mv10', 'mv20', 'mv30', 'mv40'];
  let arrData=[];
  if (info) {
    for (let item of keys) {
      let objMv=info[item];
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

/**
 * 构建主进状态info
 * @param info
 */
export function convertFzlInfo(info: any) {
  let arrData=[];
  if (info) {
    for (let objMv of info) {
      arrData.push({
        title: objMv.deviceName,
        chartType: ElectricBoardChartType.semiCircleProgress,
        status: `当前负载率`,
        rate: objMv.loadRate>100? 100:objMv.loadRate,
      })
    }
  }
  return arrData;
}

/**
 * 构建报警信息info
 * @param info
 */
export function convertAlarmInfoCount(info: any) {
  let infoData: any[][]=[];
  if (info&&info.data) {
    info.data.forEach((item: { alarmTime: any; content: any; }, index: number) => {
      infoData.push([(index+1), item.alarmTime, item.content])
    });
  }
  return {
    title: '报警信息',
    chartType: ElectricBoardChartType.table,
    headers: ['序号', '时间', '内容'],
    rows: infoData,
    data: [],
  };
}

/**
 * 构建PM任务info
 * @param info
 */
export function convertPMInfoCount(info: any) {
  let leftRows=[];
  let rightRows: any[][]=[];
  if (info) {
    let pmArray=sortArray(info, 'systemName');
    let names=[], periods=[], times=[], users=[];
    for (let pmObj of pmArray) {
      if (pmObj&&pmObj.length>0) {
        leftRows.push({
          title: pmObj[0].systemName,
          count: pmObj.length,
        });

        for (let pmItem of pmObj) {
          names.push(pmItem.name);
          periods.push(pmItem.periodDesc);
          times.push(pmItem.executeTime);
          users.push(pmItem.executeUserDesc);
        }
      }
    }
    rightRows=[names, periods, times, users];
  }


  return {
    title: 'PM任务',
    chartType: ElectricBoardChartType.table,
    headers: ['系统', '保养项目', '周期', '执行时间', '执行人'],
    leftRow: leftRows,
    rightRow: rightRows,
    data: [],
  };
}
