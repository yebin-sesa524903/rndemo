import {Text, TextStyle, View} from "react-native";
import Colors from "../../../utils/const/Colors";
import LinearGradient from "react-native-linear-gradient";
import React from "react";

export interface LinearGradientHeaderProps {
  title?: string,
  subTitle?: string,
  content?: React.ReactElement|Function,   ///底部要展示的内容
}

export function LinearGradientHeader(props: LinearGradientHeaderProps) {
  return (
    <View style={{
      flex: 1,
      backgroundColor: Colors.white,
      borderRadius: 4,
      marginTop: 10,
      overflow:'hidden',
    }}>
      <LinearGradient start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ flexDirection: 'row', alignItems: 'center', height: 40 }}
        colors={['rgba(228, 235, 252, 0.89)', 'rgba(247, 251, 255, 0.74)']}>
        <Text style={{
          fontSize: 15,
          color: Colors.text.primary,
          fontWeight: 'bold',
          marginLeft: 15,
          marginTop: 6,
          marginBottom: 6,
        }} numberOfLines={1} lineBreakMode={"tail"}>{props.title}</Text>
        {
          props.subTitle ?
          <Text style={{ fontSize: 12, color: Colors.text.sub }}> {props.subTitle}</Text>
              :null
        }
      </LinearGradient>
      {props.content}
    </View>
  )
}

