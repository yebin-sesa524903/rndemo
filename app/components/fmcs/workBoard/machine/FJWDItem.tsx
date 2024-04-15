import React from "react";
import {Image, Text, View} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import {LinearGradientHeader} from "../LinearGradientHeader";
import InstrumentBoard from "../instrument";

export interface FJWDBoardData {
  title?: string,
  subTitle?: string,
  chartType?: string,
  value?: number | string,///当前温度
  unit?: string,///温度单位
  name?: string,///房间名称
  max?: number, ///正常范围最大值
  min?: number,///正常范围最小值
  desc?: string, ///温度范围
  code?: string,///编号
}

export function FJWDItem(props: FJWDBoardData) {
  return (
    <LinearGradientHeader title={props.title}
                          subTitle={props.subTitle}
                          content={
                            FJWDProgressView(props)
                          }/>
  )
}

function FJWDProgressView(props: FJWDBoardData) {
  return (
    <View style={{flexDirection: 'column', paddingLeft: 20, paddingRight: 20, alignItems: 'center', marginTop: 15}}>
      <View style={{flexDirection: 'row', paddingBottom: 12}}>
        {renderGradientItem(String(props.value!), props.unit!, '当前温度', require('../../../../images/aaxiot/board/temp.png'))}
        <View style={{width: 20}}/>
        {renderGradientItem(props.name!, '', '名称', require('../../../../images/aaxiot/board/home.png'))}
      </View>
      { props.value != '-' && renderProgressItem(Number(props.value), props.desc!, props.min!, props.max!)}
      {
        props.value != '-' && <View style={{
          position: 'absolute',
          bottom: 30,
          left: 0,
          right: 0,
          height: 40,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Text style={{fontSize: 16, color: '#333'}}>编号:
            <Text style={{fontSize: 14, color: '#999'}}> ({props.code})</Text></Text>
        </View>
      }

    </View>
  )
}

function renderGradientItem(title: string, unit: string, name: string, imageName: any) {
  return (
    <LinearGradient start={{x: 0, y: 0}}
                    end={{x: 0, y: 1}}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      height: 94,
                      width: 160,
                      borderRadius: 10,
                      overflow: 'hidden',
                      justifyContent: 'space-around'
                    }}
                    colors={['#E4EBFCE3', '#F7FBFFBD']}>
      <View>
        <Text style={{fontSize: 16, color: '#333', fontWeight: 'bold'}}>{title} <Text
          style={{fontSize: 16, color: '#333'}}> {unit}</Text></Text>
        <Text style={{fontSize: 13, color: '#333', marginTop: 10}}>{name}</Text>
      </View>
      <View style={{
        backgroundColor: 'white',
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
      }}>
        <Image source={imageName} style={{width: 25, height: 27,}} resizeMode={"contain"}/>
      </View>

    </LinearGradient>
  )
}

function renderProgressItem(percentage: number, desc: string, min: number, max: number) {
  ///计算占比
  ///温度范围 -50 ~ 200 °C
  let reallyPercentage = (percentage + 50) / 250 * 100;

  let progressColor = undefined;
  if (min && max){
    if (min && max && percentage > min && percentage < max){
      progressColor = '#2752ee';
    }else {
      progressColor = '#fd3e3e';
    }
  }else if (!min){
    if (percentage < max){
      progressColor = '#2752ee';
    }else {
      progressColor = '#fd3e3e';
    }
  }

  return (
    <InstrumentBoard
      percentage={reallyPercentage}
      realValue={percentage}
      degreeTexts={['-50', '-25', '0', '25', '50', '75', '100', '125', '150', '175', '200']}
      contentText={desc}
      contentTextColor={'#333'}
      progressColor={progressColor}
      showNeedleAngle={false}
    />
  )
}
