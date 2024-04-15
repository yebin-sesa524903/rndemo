import React from "react";
import { Text, View } from "react-native";
import Colors from "../../../../utils/const/Colors";
import LinearGradient from "react-native-linear-gradient";
import { Progress } from "@ant-design/react-native";
import { LinearGradientHeader } from "../LinearGradientHeader";
import InstrumentBoard from '../instrument';

export interface SemiProgressProps {
  title?: string,
  chartType?: string,
  totalPower?: string,
  status?: string,
  temp?: string,
  frequency?: string,
  electricity?: string,
  voltage?: string,
  voltageMin?: string,
  voltageMax?: string,
}

export function SemiCircleProgressView(props: SemiProgressProps) {
  return (
    SemiProgressView(props)
  )
}

function SemiProgressView(props: SemiProgressProps) {
  return (
    <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: 0 }}>
      <View style={{
        // flex: 1,
        // paddingVertical: 4,
        // alignItems: 'flex-start',
        flexDirection: 'row',
        // justifyContent: 'space-between',
        // backgroundColor: 'red'
      }}>
        <InstrumentBoard
          percentage={20}
          radius={150}
          strokeWidth={0}
          degreeTexts={['0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100']}
          degreeTextStartOffset={['4%', '0%', '0%', '0%', '0%', '0%', '0%', '0%', '0%', '0%', '-2%']}
          degreeTextColor={'#9d9d9d'}
          miniDegreeTextColor={'#c4cad8'}
          scaleStartOffset={['10%', '10%', '10%', '10%', '10%', '10%', '10%', '10%', '10%', '10%', '10%',]}
          miniDegreeTexts={Array(101).fill(1)}
          contentTexts={Array(10).fill(1)}
          startAngle={45}
          progressRadius={90}
          progressColor={'#2752ee'}
          contentTextColor={'#2752ee'}
          contentText={'当前负载率'}
          progressBackgroundColor={'#f3f3f3'}
          needleRadius={20}
          needleAngle={60}
          centerSpotRadius={16}
          contentTextRadius={105}
          degreeTextRadius={120}
          animated={true} />
        <Text style={{ fontSize: 14, color: '#333', }}>{props.voltageMin}</Text>
        <Text style={{ fontSize: 14, color: '#333', }}>{props.voltageMax}</Text>
      </View>
    </View>
  )
}
