import React from "react";
import { Text, View, Image } from "react-native";
import Colors from "../../../../utils/const/Colors";
import LinearGradient from "react-native-linear-gradient";
import { Progress } from "@ant-design/react-native";
import { LinearGradientHeader } from "../LinearGradientHeader";
import InstrumentBoard from "../instrument";
import ImageIcon from "../../../ImageIcon";

export interface SemiProgressProps {
  title?: string,
  chartType?: string,
  totalPower?: string,
  status?: string,
  statusColor?: string,
  temp?: string,
  tempColor?:string,
  frequency?: string,
  electricity?: number,
  volRate?: number,
  voltage?: string,
  voltageMin?: string,
  voltageMax?: string,
}

export function ZJZTProgressItem(props: SemiProgressProps) {
  return (
    <View style={{
      flex: 1,
      backgroundColor: Colors.white,
      marginTop: 10,
      borderRadius: 4,
      overflow:'hidden',
    }}>
      <LinearGradient start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={{ flexDirection: 'row', justifyContent:'space-between', alignItems: 'center', height: 40 }}
                      colors={['rgba(228, 235, 252, 0.89)', 'rgba(247, 251, 255, 0.74)']}>
        <Text style={{
          fontSize: 15,
          color: Colors.text.primary,
          fontWeight: 'bold',
          marginLeft: 15,
          marginTop: 6,
          marginBottom: 6,
        }} numberOfLines={1} lineBreakMode={"tail"}>{props.title}</Text>
        <Text style={{
          fontSize: 15,
          color: Colors.text.primary,
          marginRight: 15,
          fontWeight: 'bold',
        }}>{'总功率 '}
          <Text style={{
            fontSize: 15,
            color: Colors.text.primary,
            fontWeight: 'bold',
          }}>{props.totalPower}</Text>
          <Text style={{fontSize: 12, color: Colors.text.light}}>  Kw</Text>
        </Text>

      </LinearGradient>
      {ZJZTProgressView(props)}
    </View>
  )
}

function renderStatusView(props: SemiProgressProps) {
  let arrTemp = [
    {
      title: '状态',
      subTitle: props.status,
      color: props.statusColor,
    },
    {
      title: '温度',
      subTitle: props.temp,
      color: props.tempColor,
    },
    {
      title: '频率',
      subTitle: props.frequency+'hz',
      color: '#333',
    },
  ]
  let arrViews=arrTemp.map((item, index) => {
    return (
      <View key={index}
            style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
        <ImageIcon type={'icon_state'} size={24}  color={''}/>
        <Text style={{ fontSize: 14, color: '#333', fontWeight: 'bold', marginLeft: 6, }}>{item.title}</Text>
        <Text style={{ fontSize: 14, color: item.color, marginLeft: 5, }}>{item.subTitle}</Text>
      </View>
    )
  });
  return (
    <View style={{ flex: 1, flexDirection: 'row', }}>
      {arrViews}
    </View>
  )
}

function ZJZTProgressView(props: SemiProgressProps) {
  return (
    <View style={{ flexDirection: 'column', paddingLeft: 20, paddingRight: 20, alignItems: 'center', marginTop: 15 }}>
      <View style={{ flexDirection: 'row', }}>
        {renderStatusView(props)}
      </View>
      <View style={{ marginTop: 14, }}>
        {SemiProgressView(props)}
      </View>

      <View style={{ flex: 1, alignItems: 'flex-start', marginTop: -24, }}>
        <Text style={{ fontSize: 14, color: '#333', }}>{"电压"+props.voltage+'kv'}</Text>
        <View style={{ flex: 1, flexDirection: 'row', paddingVertical: 12, }}>
          <Progress position={'normal'}
            percent={props.volRate}
            unfilled={false}
            style={{ backgroundColor: '#f3f3f3', borderRadius: 4, height: 8 }}
            barStyle={{ height: 8, backgroundColor: '#ffa700', borderRadius: 4, borderColor: '#ffa700' }} />
        </View>
      </View>

      <View style={{
        flex: 1, paddingVertical: 2, marginBottom: 12,
        justifyContent: 'space-between',
        flexDirection: 'row',
      }}>
        <View style={{ flex: 1, }}>
          <Text style={{ fontSize: 14, color: '#333', }}>{props.voltageMin}</Text>
        </View>
        <Text style={{ fontSize: 14, color: '#333', }}>{props.voltageMax}</Text>
      </View>
    </View>
  )
}

function SemiProgressView(props: SemiProgressProps) {
  return (
    <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: 0 }}>
      <View style={{
        flexDirection: 'row',
      }}>
        <InstrumentBoard
          percentage={props.electricity!*100/600}
          radius={150}
          strokeWidth={0}
          degreeTexts={['0', '60', '120', '180', '240', '300', '360', '420', '480', '590', '600']}
          degreeTextStartOffset={['4%', '0%', '0%', '0%', '0%', '0%', '0%', '0%', '0%', '0%', '-2%']}
          degreeTextColor={'#9d9d9d'}
          miniDegreeTextColor={'#c4cad8'}
          scaleStartOffset={['10%', '10%', '10%', '10%', '10%', '10%', '10%', '10%', '10%', '10%', '10%',]}
          miniDegreeTexts={Array(101).fill(1)}
          contentTexts={Array(10).fill(1)}
          startAngle={45}
          progressRadius={90}
          progressColor={props.electricity!>420? '#fd3e3e':'#2752ee'}
          contentTextColor={'#333'}
          contentText={props.title}
          progressBackgroundColor={'#f3f3f3'}
          centerSpotRadius={16}
          contentTextRadius={105}
          degreeTextRadius={120}
          animated={true}
        />
      </View>
    </View>
  )
}
