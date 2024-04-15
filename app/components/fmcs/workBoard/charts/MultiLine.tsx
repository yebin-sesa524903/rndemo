import React from "react";
import {
  VictoryAxis,
  VictoryChart,
  VictoryLabel,
  VictoryLine,
  VictoryScatter,
  VictoryTheme,
  VictoryVoronoiContainer,
} from "victory-native";
import {Dimensions, FlatList, Pressable, Text, View} from "react-native";
import moment from "moment";

export interface MultilineChartsProps {
  /**
   * 数据源
   *  x:x坐标
   *  y:y坐标
   *  fill: 线条填充颜色
   *  fillMark: 线条填充颜色 标记,
   *  name: 线条名称
   */
  data: { x: number, y: number, fill: string, name: string, fillMark: string}[][];
  onTouch?: (isTouchEnd: boolean) => void;
  scrolling?: boolean;///记录父视图是否在滚动, 如果父视图在滚动,则不回去点坐标
}

export function MultilineCharts(props: MultilineChartsProps) {
  /**
   * 记录活跃点
   */
  const [activePoints, setActivePoints] = React.useState<any[]>([]);
  /**
   * 记录当前隐藏的 线条; 方便控制 至少有一条线曲线展示在 图标上
   */
  const [transparentLines, setTransparentLines] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (!props.scrolling) {
      ///父视图停止滚动则 取消标记点
      setActivePoints([]);
    }
  }, [props.scrolling])
  /**
   * 已经透明的线条 不受刷新影响
   */
  const newData = React.useMemo(() => {
    let newPropsData = props.data;
    for (const datum of newPropsData) {
      let founded = false;
      for (const transparentLine of transparentLines) {
        if ((transparentLine && transparentLine.length > 0) && (datum && datum.length > 0)) {
          if (transparentLine[0].name == datum[0].name) {
            founded = true;
            break;
          }
        }
      }
      if (founded) {
        for (const datumElement of datum) {
          datumElement.fill = 'transparent';
        }
      }
    }
    return newPropsData;
  }, [props.data]);

  /**
   * 与ChartLine相交点集合
   */
  const chartSetter = React.useMemo(() => {
    let data = [];
    for (let activePoint of activePoints) {
      data.push({
        x: activePoint.x,
        y: activePoint.y,
        fill: activePoint.fill,
      })
    }
    return renderScatter(data);
  }, [activePoints]);

  /**
   * 计算x底部标记  x偏移, 如果最右边则需要向左偏移,避免遮挡
   */
  const setterLineDx = React.useMemo(() => {
    const lastCounts = 10;
    let dx = 0;
    if (props.data && props.data.length > 0) {
      let chartLineData = props.data[0];
      for (let i = 0; i < chartLineData.length; i++) {
        if (i > chartLineData.length - 1 - lastCounts) {
          let lineData = chartLineData[i];
          ///取坐标轴最后lastCounts个点
          for (let activePoint of activePoints) {
            if (activePoint.x == lineData.x) {
              dx = -(lastCounts - (chartLineData.length - 1 - i));
              break;
            }
          }
        }
      }
    }
    return dx;
  }, [activePoints]);

  /**
   * 处理图表 滚动标记 如果y值为null则不用标记
   */
  const containerDisabled = React.useMemo(() => {
    let disable = true;
    for (const activePoint of activePoints) {
      if (activePoint.y != null) {
        disable = false;
        break;
      }
    }
    return disable;
  }, [activePoints]);

  /**
   * 线条标记 数据
   */
  const legendData = React.useMemo(() => {
    let data = [];
    if (activePoints.length > 0) {
      let xAxisValue = activePoints[0].x;
      for (let datum of newData) {
        let yAxisValue = 0;
        for (let datumElement of datum) {
          if (datumElement.x === xAxisValue) {
            yAxisValue = datumElement.y;
            break;
          }
        }
        if (datum && datum.length > 0) {
          let name;
          if (datum[0].fill == 'transparent' || yAxisValue == null) {
            name = '';
          } else {
            name = (String(yAxisValue.toFixed(1)));
          }
          data.push({
            name: datum[0].name + ': ' + name,
            fill: datum[0].fill,
          })
        }
      }
    } else {
      for (let datum of newData) {
        if (datum && datum.length > 0) {
          data.push({
            name: datum[0].name,
            fill: datum[0].fill,
          })
        }
      }
    }
    return data;
  }, [activePoints, newData]);

  /**
   * x坐标轴 刻度集合
   */
  const xAxisTicketValues = React.useMemo(() => {
    let now=moment().valueOf();
    let curHour=moment().get('hour');
    let hourTime=now-now%3600000;
    hourTime=hourTime/1000;
    let filterHours=[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
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
   * y坐标 刻度集合
   */
  const yAxisTicketValues = React.useMemo(() => {
    const yAxisCount = 6;
    let tempData = [];
    for (let datum of props.data) {
      for (let cureData of datum) {
        tempData.push(cureData.y);
      }
    }
    let tempMaxX = Math.max(...tempData);
    let tempMinX = Math.min(...tempData);

    let maxX = (10 - tempMaxX % 10) + tempMaxX;
    let minX = 0;
    if (tempMinX < 10 && tempMinX > 0){
      minX = 0;
    }else if (tempMinX < 0){
      minX = tempMinX;
    }else {
      minX = tempMinX - tempMinX % 10;
    }
    let space = (maxX - minX) / (yAxisCount - 1);
    let ticketValues = []
    for (let i = 0; i < yAxisCount; i++) {
      let dateStamp = (maxX - space * i);
      ticketValues.push(Math.floor(dateStamp));
    }
    return ticketValues.reverse();
  }, [props.data]);


  return (
    <View style={{ backgroundColor: 'white' }}>
      {renderVictoryLegend()}
      <VictoryChart padding={{ left: 52, right: 50, top: 16, bottom: 40 }}
        height={200}
        width={Dimensions.get('window').width}
        containerComponent={
          renderChartContainer()
        }
        theme={VictoryTheme.material}>
        {renderXAxis()}
        {renderYAxis()}
        {renderChartLines()}
        {chartSetter}
        {renderActiveAxis()}
      </VictoryChart>
    </View>

  )


  /**
   * x轴
   */
  function renderXAxis() {
    return (
      <VictoryAxis
        style={{
          axis: { stroke: 'gray', strokeWidth: 1 },///控制主轴线宽度/颜色
          ticks: { stroke: 'gray', size: 3 },///控制刻度长度/颜色
          grid: { stroke: 'transparent' },///相交轴 每条线 颜色/虚/实
          tickLabels: { fontSize: 12, fill: 'gray' }///控制刻度字体大小/颜色
        }}
        tickFormat={(t, index) => {
          return moment(t * 1000).format('HH:mm');
        }}
        tickValues={xAxisTicketValues}
        dependentAxis={false}
        standalone={false}
      />
    )
  }

  /**
   * y轴
   */
  function renderYAxis() {
    return (
      <VictoryAxis tickCount={4}
        style={{
          axis: { stroke: 'transparent', strokeWidth: 0.5 },
          grid: { stroke: 'gray', strokeWidth: 0.5, strokeDasharray: "3,3" },
          ticks: { stroke: 'transparent', size: 0 },
          tickLabels: { fill: 'gray', fontSize: 12 }
        }}
        tickValues={yAxisTicketValues}
        standalone={false}
        dependentAxis={true}
        crossAxis={false} />
    )
  }


  /**
   * 曲线
   */
  function renderChartLines() {
    return newData.map((source, index) => {
      return <VictoryLine key={index + ((source && source.length > 0) ? source[0].name : '')}
        style={{ data: { stroke: (source && source.length > 0) ? source[0].fill : 'white', }, }}
        interpolation="monotoneX"
        standalone={false}
        data={source} />
    })
  }

  /**
   * 曲线上方标题
   */
  function renderVictoryLegend() {
    return (
      <View style={{ paddingLeft: 16 }}>
        <FlatList data={legendData}
          horizontal={false}
          scrollEnabled={false}
          numColumns={3}
          keyExtractor={(item, index) => {
            return item.name + item.fill + index;
          }}
          renderItem={(item) => {
            let itemObj = item.item;
            return (
              <Pressable style={{ flexDirection: "row", flex: 1, marginBottom: 10, marginTop: 10, alignItems: 'center', justifyContent:'center'}}
                onPress={() => {
                  handleVictoryLegendEventData(itemObj);
                }}>
                <View style={{ width: 12, height: 4, borderRadius: 2, backgroundColor: itemObj.fill }} />
                <Text style={{
                  fontSize: 12,
                  color: '#333',
                  marginLeft: 5
                }}>{itemObj.name}</Text>
              </Pressable>
            )
          }} />
      </View>

    )
  }

  /**
   * 处理 legend点击 data
   * @param selectedData
   */
  function handleVictoryLegendEventData(selectedData: any) {
    for (let datum of props.data) {
      for (let datumElement of datum) {
        configActivePoints(selectedData, datumElement);
      }
    }

    for (let activePoint of activePoints) {
      configActivePoints(selectedData, activePoint);
    }

    let transparentLine = [];
    for (let datum of props.data) {
      if (datum && datum.length > 0) {
        if (datum[0].fill === 'transparent') {
          transparentLine.push(datum);
        }
      }
    }
    setTransparentLines(transparentLine);

    setActivePoints([...activePoints]);
  }

  function configActivePoints(selectedData: any, datumElement: any) {
    if (selectedData.name.includes(datumElement.name) && datumElement.fill === selectedData.fill) {
      if (transparentLines.length <= props.data.length - 2) {
        if (datumElement.fill === 'transparent') {
          datumElement.fill = datumElement.fillMark;
        } else {
          datumElement.fill = 'transparent';
        }
      } else {
        if (datumElement.fill === 'transparent') {
          datumElement.fill = datumElement.fillMark;
        }
      }
    }
  }

  /**
   * 记录触目点坐标
   */
  function renderChartContainer() {
    return (
      <VictoryVoronoiContainer activateData={true}
        voronoiDimension="x"
        voronoiBlacklist={['redPoints']}
        onTouchStart={() => props.onTouch && props.onTouch(false)}
        onTouchEnd={() => {
          props.onTouch && props.onTouch(true);
          setActivePoints([]);
        }}
        onActivated={(data) => {
          if (data.length > 0) {
            let tempData = data.filter((datum) => {
              return datum.childName.includes("chart-line");
            });
            let dataSet = new Set(tempData);
            setActivePoints(tempData);
          }
        }} />
    )
  }

  /**
   * 触摸点 相交点位
   */
  function renderScatter(points: any[]) {
    if (!containerDisabled) {
      return (
        <VictoryScatter name="redPoints"
          style={{
            data: {
              fill: (source) => source.datum.fill,
              stroke: (source) => source.datum.fill,
              strokeWidth: 6,
              strokeOpacity: 0.2,
            }
          }}
          size={4}
          data={points}
        />
      )
    } else {
      return null;
    }
  }

  /**
   * 触摸点x轴 数值
   */
  function renderActiveAxis() {
    if (activePoints.length > 0 && !containerDisabled) {
      return (
        <VictoryAxis tickValues={[activePoints[0].x]}
          style={{
            axis: { stroke: 'transparent' },
            grid: { stroke: '#0A6BFC', strokeDasharray: "2,5" },
            ticks: { stroke: 'transparent' },
            tickLabels: { fontSize: 12, fill: 'white' }
          }}
          tickLabelComponent={<VictoryLabel backgroundPadding={{ top: 5, bottom: 8, left: 5, right: 5 }}
            dy={-12}
            dx={setterLineDx}
            backgroundStyle={{
              fill: "black",
              opacity: 0.6,
              // @ts-ignore 设置圆角
              rx: '2'
            }} />}
          tickFormat={(t) => {
            return moment(t * 1000).format('HH:mm');
          }}
          dependentAxis={false}
          standalone={true}
        />
      )
    }
  }

}
