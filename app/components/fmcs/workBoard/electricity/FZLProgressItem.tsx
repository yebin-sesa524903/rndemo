import React from "react";
import { Text, View } from "react-native";
import Colors from "../../../../utils/const/Colors";
import LinearGradient from "react-native-linear-gradient";
import { Progress } from "@ant-design/react-native";
import { LinearGradientHeader } from "../LinearGradientHeader";
import InstrumentBoard from "../instrument";

export interface FzlProgressProps {
  title?: string,
  chartType?: string,
  status?: string,
  rate?: number,
}

export function FZLProgressItem(props: FzlProgressProps) {
  return (
    <LinearGradientHeader
      title={props.title}
      content={
        <>
          {
            FZLProgressView(props)
          }
        </>
      } />
  )
}

function FZLProgressView(props: FzlProgressProps) {
  return (
    <View style={{ flexDirection: 'column', paddingLeft: 20, paddingRight: 20, alignItems: 'center', marginTop: 15 }}>
      <View style={{ marginTop: 14, }}>
        <InstrumentBoard
          percentage={props.rate}
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
          progressColor={props.rate!>70? '#fd3e3e':'#2752ee'}
          contentTextColor={'#333'}
          contentText={props.status}
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
