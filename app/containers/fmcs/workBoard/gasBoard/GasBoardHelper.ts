import Colors from "../../../../utils/const/Colors";
import { PieLineObj } from "../../../../components/fmcs/workBoard/charts/Pie";
import { isEmptyString, TimeFormatYMD } from "../../../../utils/const/Consts";
import moment from "moment";

export enum GasBoardChartType {
  pie=200099,///饼图
  progress,///进度条
  table,///表格
  bar,///柱状图
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
        }
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
 * 构建特气info
 * @param info
 */
export function convertQhInfo(info: any) {
  let key1='气瓶状态统计';
  let key2='气瓶更换任务统计';
  let key1Color=[
    {
      name: '送气中',
      color: '#FEA45B',
    },
    {
      name: '待机中',
      color: '#826CE6',
    },
    {
      name: '已下线',
      color: '#1CC26A',
    },
    {
      name: '已吹扫',
      color: '#4FDFB2',
    },
    {
      name: '未知',
      color: '#458DFF',
    }
  ];
  let key2Color=[
    {
      name: '待前吹',
      color: '#4FDFB2',
    },
    {
      name: '前吹中',
      color: '#1CC26A',
    },
    {
      name: '待更换',
      color: '#3C69FF',
    },
    {
      name: '更换中',
      color: '#1FB3FF',
    },
    {
      name: '待Standby',
      color: '#458DFF',
    },
    {
      name: 'Standby中',
      color: '#717CFF',
    },
    {
      name: '已完成',
      color: '#FEA45B',
    },
  ];
  return [
    {
      title: key1,
      chartType: GasBoardChartType.pie,
      data: configPieData(info[key1]),
      colorScale: configColorScale(info[key1], key1Color),
      legendData: key1Color,
    },
    {
      title: key2,
      subTitle: '(今日)',
      chartType: GasBoardChartType.pie,
      data: configPieData(info[key2]),
      colorScale: configColorScale(info[key2], key2Color),
      legendData: key2Color,
    }
  ];
}

function configPieData(responseData: any[]) {
  ///气瓶显示数组
  let qpData: PieLineObj[]=[];

  let qpTotal=0
  for (let gas of responseData) {
    qpTotal+=Number(gas.value)
  }
  let i=0;
  for (let gas of responseData) {
    let yValue=Number(gas.value);
    if (yValue>0) {
      qpData.push({
        y: yValue,
        label: gas.name+': '+(yValue/qpTotal*100).toFixed(2)+'%',
      });
    }
    i++;
  }
  if (qpData.length==0) {
    qpData=[{ y: 1, label: '未知' }]
  }
  return qpData;
}

/**
 * 饼图颜色集合
 * @param responseData
 * @param colors
 */
function configColorScale(responseData: any[], colors: any[]) {
  let tempData=[];
  for (let gas of responseData) {
    for (let color of colors) {
      if (color.name==gas.name) {
        tempData.push(color.color);
      }
    }
  }
  if (tempData.length==0) {
    tempData=['#458DFF'];
  }
  return tempData;
}

/**
 * 构建化学info
 * @param info
 */
export function convertHXInfo(info: any) {
  let key1='化学酸桶状态统计';
  let key2='酸桶更换任务统计';
  let key1Color=[
    {
      name: '桶未空',
      color: '#FEA45B',
    },
    {
      name: '桶已空',
      color: '#826CE6',
    },
    {
      name: '未知',
      color: '#458DFF',
    },
  ];

  let key2Color=[
    {
      name: '待执行',
      color: '#826CE6',
    },
    {
      name: '执行中',
      color: '#FEA45B',
    },

    {
      name: '已完成',
      color: '#1CC26A',
    },
  ];
  return [
    {
      title: key1,
      chartType: GasBoardChartType.pie,
      data: configPieData(info[key1]),
      colorScale: configColorScale(info[key1], key1Color),
      legendData: key1Color,
    },
    {
      title: key2,
      subTitle: '(今日)',
      chartType: GasBoardChartType.pie,
      data: configPieData(info[key2]),
      colorScale: configColorScale(info[key2], key2Color),
      legendData: key2Color,
    }
  ];
}


/**
 * 侦测器 任务转换
 * @param info
 */
export function convertDetectorTask(info: any) {
  let keyColor=[
    {
      name: '新建',
      color: '#4FDFB2',
    },
    {
      name: '待隔离',
      color: '#1CC26A',
    },
    {
      name: '已隔离',
      color: '#3C69FF',
    },
    {
      name: '施工中',
      color: '#1FB3FF',
    },
    {
      name: '待解隔离',
      color: '#458DFF',
    },
    {
      name: '已解隔离',
      color: '#717CFF',
    },
    {
      name: '已完成',
      color: '#FEA45B',
    },
  ];
  return {
    title: '侦测器隔离任务统计',
    subTitle: '(今日)',
    chartType: GasBoardChartType.pie,
    data: configPieData(info),
    colorScale: configColorScale(info, keyColor),
    legendData: keyColor,
  };
}

/**
 * 侦测器状态转换
 * @param info
 */
export function convertDetectorStatus(info: any) {
  let keyColor=[
    {
      name: '隔离',
      color: '#826CE6',
    },
    {
      name: '正常',
      color: '#FEA45B',
    },
    {
      name: '未知',
      color: '#458DFF',
    },
  ];
  return {
    title: '侦测器状态统计',
    chartType: GasBoardChartType.pie,
    data: configPieData(info),
    colorScale: configColorScale(info, keyColor),
    legendData: keyColor,
  };
}

/**
 * SPC超出统计
 * @param info
 */
export function convertSPCOverCount(info: any) {
  let data=[];
  for (let infoElement of info) {
    data.push({
      name: infoElement.name,
      value: Number(infoElement.value),
    })
  }

  return {
    title: 'SPC超出统计',
    subTitle: '(近24小时)',
    chartType: GasBoardChartType.bar,
    data: data,
  };
}

/**
 * 槽车填充通知时间提醒
 * @param info
 *  title?: string, ///标题
 *   percentage?: number,///占比
 *   date?: string,///日期
 */
export function convertTimeRemind(info: any) {
  let dataInfo=[];
  for (let i=0; i<5; i++) {
    dataInfo.push({
      title: '暂无内容',
      percentage: 0,
      date: '暂无内容',
    })
  }
  let j=0;
  for (let infoElement of info) {
    dataInfo[j].title=infoElement.deviceName;
    dataInfo[j].percentage=infoElement.currLevel!=null? Number(((infoElement.currLevel/infoElement.totalLevel)*100).toFixed(0)):0;
    if (!isEmptyString(infoElement.noticeDate)) {
      dataInfo[j].date=moment(infoElement.noticeDate).format(TimeFormatYMD);
    }
    j++;
  }
  return {
    title: '槽车填充通知时间提醒',
    chartType: GasBoardChartType.progress,
    data: dataInfo,
  };
}


export function convertDZQTrafficCount(info: any) {
  let infoData=[];
  if (info&&info.data) {
    for (let datum of info.data) {
      infoData.push([datum.systemName, datum.averageFlowPerHourToday??'-', datum.averageFlowPerHourToMonth??'-', datum.flowPlanToMonth??'-'])
    }
  }


  return {
    title: '大宗气体流量统计',
    chartType: GasBoardChartType.table,
    headers: ['气体类型', '日均流量\n(nm3/h)', '月均流量\n(nm3/h)', '月累计量\n(nm3)'],
    rows: infoData,
    data: [],
  };
}
