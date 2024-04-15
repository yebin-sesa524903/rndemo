import React, {Component} from 'react';
import {View, StyleSheet, ViewStyle, TextStyle} from 'react-native';
import {Cell} from './cell';
import {sum} from './utils';

interface IColOptions {
  data: string[] | JSX.Element[];
  style?: ViewStyle;
  width?: number | string;
  heightArr?: number[];
  flex?: number;
  textStyle?: TextStyle;
  borderStyle?: ViewStyle,
}

export function Col(props: IColOptions) {
  const {data, style, width, heightArr, flex, textStyle, borderStyle} = props;
  return data ? (
    <View style={[
      width ? {width} : {flex: 1},
      flex ? {flex} : {},
      style,
    ]}>
      {[...data].map((item, i) => {
        const height = heightArr && heightArr[i];
        return <Cell key={i} data={item} width={width} height={height} textStyle={textStyle} flex={flex} borderStyle={borderStyle}/>;
      })}
    </View>
  ) : null;
}

interface IColsOptions {
  data: string[][] | JSX.Element[][];
  style?: ViewStyle;
  widthArr?: number[];
  heightArr?: number[];
  flexArr?: number[];
  textStyle?: TextStyle;
  borderStyle?: ViewStyle;
}

export function Cols(props: IColsOptions) {
  const { data, style, widthArr, heightArr, flexArr, textStyle, borderStyle} = props;
  const width = widthArr ? sum(widthArr) : 0;
  return data ? (
    <View style={[
      styles.cols,
      width ? {width} : {flex: 1}
    ]}>
      {[...data].map((item, i) => {
        const flex = flexArr && flexArr[i];
        const wth = widthArr && widthArr[i];
        return (
          <Col
            key={i}
            data={item}
            width={wth}
            heightArr={heightArr}
            flex={flex}
            style={style}
            textStyle={textStyle}
            borderStyle={borderStyle}
          />
        );
      })}
    </View>
  ) : null;
}

const styles = StyleSheet.create({
	cols: { flexDirection: 'row' }
});
