import React from "react";
import {
  VictoryAxis,
  VictoryChart,
  VictoryLabel, VictoryLegend,
  VictoryLine,
  VictoryScatter,
  VictoryTheme,
  VictoryTooltip,
  VictoryVoronoiContainer
} from "victory-native";
import { Dimensions } from "react-native";
import moment from "moment";
import utils from '../../../../utils/unit.js';

export interface LineChartsProps {
  /**
   * 数据源
   */
  data: { x: number, y: number }[];
  /**
   * 手指触摸 开始/结束 回调
   * @param isTouchEnd
   */
  onTouch: (isTouchEnd: boolean) => void;
  /**
   * 父视图是否滚动
   */
  scrolling?: boolean,
  /**
   * 标题
   */
  title?: string,
  /**
   * 单位
   */
  unit?: string,
  /**
   * 内控要求
   */
  range?: { max: number, min: number },
}

export function LineCharts(props: LineChartsProps) {

  React.useEffect(() => {
    if (!props.scrolling) {
      setCurrentIndex({ x: 0, y: 0 });
    }
  }, [props.scrolling])

  /**
   * 手指移动 x坐标点
   */
  const [currentIndex, setCurrentIndex]=React.useState({ x: 0, y: 0 });

  /**
   * x轴标记点
   */
  const xAxisComponent=React.useMemo(() => {
    return (currentIndex.x>0)? renderAxisComponent(currentIndex.x, 0, -12, false):null;
  }, [currentIndex.x]);

  /**
   * y轴标记点
   */
  const yAxisComponent=React.useMemo(() => {
    return (currentIndex.y>0)? renderAxisComponent(currentIndex.y, 6, -5, true):null;
  }, [currentIndex.y]);

  const xAxisTicketValues=React.useMemo(() => {
    let now=moment().valueOf();
    let curHour=moment().get('hour');
    let hourTime=now-now%3600000;
    hourTime=hourTime/1000;
    //显示的小时 2，6，10，14，18，22
    let filterHours=[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
    // let filterHours = [2, 6, 10, 14, 18, 22];
    let arr=[];
    for (let i=0; i<24; i++) {
      let tempHour=curHour-i;
      if (tempHour<0) tempHour=24+tempHour;
      if (filterHours.includes(tempHour)) {
        let key=hourTime-i*3600;
        arr.push(key);
      }
    }
    return arr.splice(0, 4).reverse();
  }, [props.data])

  /**
   * y轴最大值
   */
  const dataYMaxValue=React.useMemo(() => {
    let yValues=[];
    for (let datum of props.data) {
      yValues.push(datum.y);
    }
    return Math.max(...yValues);
  }, [props.data]);

  function getToFixedValue(value: any, maxValue: any) {
    if (Math.abs(maxValue)<10) {
      value=utils.toFixed(value, 2);
    } else {
      value=utils.toFixed(value, 0);
    }
    return value;
  }
  /**
   * 手动计算y轴等分坐标
   */
  const yAxisTicketsValue=React.useMemo(() => {
    const yAxisCount=6;
    let yValues=[];
    for (let datum of props.data) {
      yValues.push(datum.y);
    }
    let maxValue=Math.max(...yValues);
    if (maxValue===0) {
      if (props.range?.max==0 || props.range?.max == undefined) {
        return [0, 1, 2, 3, 4, 5];
      } else {
        maxValue=props.range?.max!*1.1;
      }
    }
    let minValue=Math.min(...yValues);

    let maxX=(10-maxValue%10)+maxValue;
    if (maxValue<10) {
      maxX=maxValue;
    }
    if (props.range && props.range.max && props.range.max>maxX) {
      maxX= (10 - props.range.max % 10) + props.range.max;
    }
    let minX=minValue<10? 0:(minValue-minValue%10);
    if (props.range && props.range.min && props.range.min < minX){
      minX = props.range.min - props.range.min % 10;
    }
    let space=(maxX-minX)/(yAxisCount-1);
    let ticketValues=[]
    for (let i=0; i<yAxisCount; i++) {
      let dateStamp=(maxX-space*i);
      ticketValues.push(getToFixedValue(dateStamp, maxX));
    }
    return ticketValues.reverse();
  }, [props.data]);

  return (
    <VictoryChart
      padding={{ left: 60, right: 60, top: 46, bottom: 40 }}
      height={230}
      width={Dimensions.get('window').width}
      containerComponent={
        renderChartContainer()
      }
      theme={VictoryTheme.material}>
      {renderMainAxis()}
      {renderCrossAxis()}
      {xAxisComponent}
      {/*{yAxisComponent}*/}
      {renderChartLine()}
      {renderScatter()}
      {renderMaxRange()}
      {renderMinRange()}
      {renderLegend()}
    </VictoryChart>
  )

  function renderLegend() {
    return currentIndex.y>0&&<VictoryLegend x={20}
      y={10}
      colorScale={['transparent']}
      style={{ title: { fontSize: 18 } }}
      data={[{
        name: props.title+': '+String(currentIndex.y)+props.unit,
        labels: { fill: "#666" },
      }]} />
  }

  /**
   * 内控要求范围
   */
  function renderMaxRange() {
    if (props.range?.max == undefined){
      return null;
    }
    let tickValues = [props.range?.max];

    return (
      <VictoryAxis style={{
        axis: { stroke: 'transparent', strokeWidth: 0.5 },
        grid: { stroke: '#F6A93B', strokeWidth: 1, strokeDasharray: "3,3" },
        ticks: { stroke: 'transparent', size: 5 },
        tickLabels: { fill: 'transparent', fontSize: 12 }
      }}
        tickCount={1}
        tickLabelComponent={
          <VictoryLabel
            style={[{ fill: "#F6A93B", fontSize: 12 }]}
            backgroundPadding={{ top: 5, bottom: 8, left: 5, right: 5 }}
            textAnchor="start"
            verticalAnchor="middle"
            dx={20}
            dy={-20}
          />}
        tickValues={tickValues}
        tickFormat={(value) => {
          let title=''
          if (props.range?.min==0 || props.range?.min == null) {
            title='内控要求 <'+value;
          } else {
            title='内控要求 '+props.range?.min+'~'+value;
          }
          return title+props.unit;
        }}
        standalone={true}
        dependentAxis={true}
        crossAxis={true} />
    )
  }

  /**
   * 内控要求范围
   */
  function renderMinRange() {
    if (props.range?.min==0 || props.range?.min == undefined) {
      return null;
    }
    let tickValues = [props.range?.min];
    return (
      <VictoryAxis style={{
        axis: { stroke: 'transparent', strokeWidth: 0.5 },
        grid: { stroke: '#F6A93B', strokeWidth: 1, strokeDasharray: "3,3" },
        ticks: { stroke: 'transparent', size: 5 },
        tickLabels: { fill: 'transparent', fontSize: 12 }
      }}
        tickCount={1}
        tickValues={tickValues}
        tickFormat={({ v }) => {
          return ''
        }}
        standalone={true}
        dependentAxis={true}
        crossAxis={true} />
    )
  }

  /**
   * 手指移动 计算位置
   * VictoryVoronoiContainer 反馈 当前触摸点与VictoryLine相交的点坐标
   * VictoryCursorContainer 反馈 当前触摸点的点坐标
   */
  function renderChartContainer() {
    return (
      <VictoryVoronoiContainer activateData={true}
        onTouchStart={() => props.onTouch(false)}
        onTouchEnd={() => {
          props.onTouch(true);
          setCurrentIndex({ x: 0, y: 0 });
        }}
        onActivated={(data) => {
          if (data.length>0) {
            let position=data[0];
            if (position.x>0&&position.y>0) {
              setCurrentIndex({ x: position.x, y: position.y });
            } else {
              setCurrentIndex({ x: 0, y: 0 });
            }
          }
        }} />
    )
  }

  /**
   * 纵轴
   */
  function renderCrossAxis() {
    return (
      <VictoryAxis style={{
        axis: { stroke: 'transparent', strokeWidth: 0.5 },
        grid: { stroke: 'gray', strokeWidth: 0.5, strokeDasharray: "3,3" },
        ticks: { stroke: 'transparent', size: 5 },
        tickLabels: { fill: 'gray', fontSize: 12 }
      }}
        tickCount={5}
        tickValues={yAxisTicketsValue}
        standalone={true}
        dependentAxis={true}
        crossAxis={true} />
    )
  }


  /**
   * 横轴
   */
  function renderMainAxis() {
    return (
      <VictoryAxis
        style={{
          axis: { stroke: '#818FA0', strokeWidth: 1 },///控制主轴线宽度/颜色
          ticks: { stroke: '#818FA0', size: 3 },///控制刻度长度/颜色
          grid: { stroke: 'transparent' },///相交轴 每条线 颜色/虚/实
          tickLabels: { fontSize: 12, fill: '#666' }///控制刻度字体大小/颜色
        }}
        tickFormat={(t, index) => {
          return moment(t*1000).format('HH:mm');
        }}
        tickValues={xAxisTicketValues}
        dependentAxis={false}
        standalone={false}
      />
    )
  }

  /**
   * 折线
   */
  function renderChartLine() {
    return (
      <VictoryLine
        style={{
          data: { stroke: '#0265FC', strokeWidth: 1.5 }
        }}
        interpolation="monotoneX"
        standalone={false}
        data={props.data} />
    )
  }

  /**
   * 曲线 点位
   */
  function renderScatter() {
    let data: any[]|undefined=[];
    if (currentIndex.x>0&&currentIndex.y>0) {
      data=[currentIndex];
    }
    return (
      <VictoryScatter
        style={{
          data: {
            fill: '#1171FC',
            stroke: '#fff',
            strokeWidth: (currentIndex.x>0&&currentIndex.y>0)? 4:0,
            strokeOpacity: 1,
          }
        }}
        labels={({ datum }) => {
          return '';///props.title+': '+datum.y+props.unit;
        }}

        // labelComponent={
        //   <VictoryTooltip
        //     active={true}
        //     activateData={true}
        //     constrainToVisibleArea
        //     pointerOrientation={'right'}
        //     flyoutStyle={{ strokeWidth: 0, stroke: '#17191D', fill: "#17191D", fillOpacity: 0.6 }}
        //     style={{ fill: "white", fillOpacity: 0.8 }}
        //     pointerWidth={10}
        //     pointerLength={10}
        //     renderInPortal={false}
        //     centerOffset={{ x: -45, y: 20 }}
        //     flyoutPadding={{ top: 5, bottom: 5, left: 10, right: 10 }}
        //     cornerRadius={2}
        //   />
        // }
        size={(currentIndex.x>0&&currentIndex.y>0)? 5:0}
        data={data}
      />
    )
  }

  /**
   * x/y轴标注点
   * @param value 当前值
   * @param dx x轴偏移
   * @param dy y轴偏移
   * @param dependentAxis 是否是纵轴
   */
  function renderAxisComponent(value: number, dx: number, dy: number, dependentAxis: boolean) {
    return (
      <VictoryAxis tickCount={1}
        style={{
          axis: { stroke: 'transparent', strokeWidth: 0 },
          grid: { stroke: '#0265FC', strokeDasharray: "3,3", strokeWidth: 1 },
          ticks: { stroke: 'transparent', },
          tickLabels: { fontSize: 12, fill: 'white' }
        }}
        tickLabelComponent={<VictoryLabel
          backgroundPadding={{ top: 5, bottom: dependentAxis? 5:8, left: 5, right: 5 }}
          dx={dx}
          dy={dy}
          backgroundStyle={
            // @ts-ignore
            { fill: "black", opacity: 0.6, rx: '2' }
          } />}
        tickValues={[value]}
        tickFormat={(t) => {
          return moment(t*1000).format('HH:mm');
        }}
        dependentAxis={dependentAxis}
        standalone={true}
      />
    )
  }

}
