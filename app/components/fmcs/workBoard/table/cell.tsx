import React, {Component} from 'react';
import {View, Text, StyleSheet, ViewStyle, TextStyle} from 'react-native';

interface ICellOptions {
  data: string | JSX.Element;
  width?: number | string;
  height?: number;
  flex?: number;
  style?: ViewStyle;
  textStyle?: TextStyle;
  borderStyle?: ViewStyle;
}

export function Cell(props: ICellOptions) {
  const {data, width, height, flex, style, textStyle, borderStyle} = props;
  const textDom = React.isValidElement(data) ? (
    data
  ) : (
    <Text style={[textStyle, styles.text]} {...props}>
      {data}
    </Text>
  );
  const borderTopWidth = (borderStyle && borderStyle.borderWidth) || 0;
  const borderRightWidth = borderTopWidth;
  const borderColor = (borderStyle && borderStyle.borderColor) || '#F2EFEF';
  return (
    <View
      style={[
        {
          borderTopWidth,
          borderRightWidth,
          borderColor
        },
        styles.cell,
        width ? {width} : {},
        height ? {height} : {},
        flex ? {flex} : {},
        !width && !flex && !height && !style && {flex: 1},
        style
      ]}
    >
      {textDom}
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {justifyContent: 'center'},
  text: {backgroundColor: 'transparent'}
});
