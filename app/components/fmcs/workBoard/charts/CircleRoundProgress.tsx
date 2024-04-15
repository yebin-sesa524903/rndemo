import React from "react";
import Svg, {Path} from "react-native-svg";
import {screenWidth} from "../../../../utils/const/Consts";
import {Text, View} from "react-native";

export interface CircleRoundProgressProps {
  value?: number,///当前值
  height?: number,
  unit?: string,///单位
}

export function CircleRoundProgress(props: CircleRoundProgressProps) {
  const newProps = React.useMemo(() => {
    return Object.assign({}, props, {
      height: 300,
    })
  }, [props])
  ///画布宽
  let width = (screenWidth() - 20);
  ///画布高
  let height = newProps.height;

  return (
    <View style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center"
    }}>
      {renderSvgRound(width, height, props.value!, '#1340E9')}
      <View style={{
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        alignItems: "center",
        justifyContent: "center",
      }}>
        <Text style={{fontSize: 32, color: '#333', fontWeight: 'bold'}}>{newProps.value}
          <Text style={{fontSize: 17, color: '#333', fontWeight:'normal'}}> {newProps.unit}</Text>
        </Text>
        <Text style={{fontSize: 11, color: '#999'}}>COMPLETED</Text>
      </View>
    </View>

  )
}

/**
 * 画一个svg的圆
 * @param width
 * @param height
 * @param value
 * @param fillColor
 */
export function renderSvgRound (width: number, height: number, value: number, fillColor: string){
  const circlePath = () => {
    let radius = height * 0.5 * 0.7;
    let cx = width * 0.5;
    let cy = height * 0.5 - radius;
    return [
      'M',
      cx,
      cy,
      'a',
      radius,
      radius,
      0, 1, 0, 1, 0, 'Z'
    ].join(' ')
  }

  const pathDescription = () => {
    if (value! >= 100){
      return circlePath()
    }
    let radius = height * 0.5 * 0.7;
    let cx = width * 0.5;
    let cy = height * 0.5 - radius;

    let angel = 360 * value! / 100;

    let prod = angel * (Math.PI / 180);
    let enxX = cx + Math.sin(prod) * radius;
    let enxY = cy + radius - Math.cos(prod) * radius;
    return [
      "M",
      cx,
      cy,
      'A',
      radius,
      radius,
      0,
      (angel > 180) ? 1 : 0,
      1,
      enxX,
      enxY,
    ].join(" ");
  }

  return (
    <Svg width={width}
         height={height}
         style={{
           justifyContent: "center",
           alignItems: "center",
         }}>
      {/*外圈实线圆*/}
      <Path
        d={circlePath()}
        fill="none"
        stroke="rgba(23, 25, 29, 0.08)"
        strokeWidth={20}/>
      <Path d={pathDescription()}
            fill="none"
            strokeLinecap={'round'}
            stroke={fillColor}
            strokeWidth={15}
      />
    </Svg>
  )
}
