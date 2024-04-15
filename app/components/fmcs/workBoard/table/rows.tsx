import React, { Component } from 'react';
import { View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Cell } from './cell';
import { sum } from './utils';

interface IRowOptions {
	data: string[] | JSX.Element[];
	style?: ViewStyle;
	widthArr?: number[];
	height?: number;
	flexArr?: number[];
	textStyle?: TextStyle;
  borderStyle?: ViewStyle,
}

export function Row(props: IRowOptions) {
  const { data, style, widthArr, height, flexArr, textStyle, borderStyle} = props;
  const width = widthArr ? sum(widthArr) : 0;
  return data ? (
    <View style={[
      height ? { height } : {},
      width ? { width } : {},
      styles.row, style
    ]}>
      {[...data].map((item, i) => {
        const flex = flexArr && flexArr[i];
        const wth = widthArr && widthArr[i];
        return <Cell key={i} data={item} width={wth} height={height} flex={flex} textStyle={textStyle} borderStyle={borderStyle}/>;
      })}
    </View>
  ) : null;
}

interface IRowsOptions {
	data: string[][] | JSX.Element[][];
	style?: ViewStyle;
	widthArr?: number[];
	heightArr?: number[];
	flexArr?: number[];
	textStyle?: TextStyle;
  borderStyle?: ViewStyle,
}

export function Rows(props: IRowsOptions) {
  const { data, style, widthArr, heightArr, flexArr, textStyle , borderStyle} = props;
  const flex = flexArr ? sum(flexArr) : 0;
  const width = widthArr ? sum(widthArr) : 0;
  return data ? (
    <View style={[
      flex ? { flex } : {},
      width ? { width } : {}
    ]}>
      {[...data].map((item, i) => {
        const height = heightArr && heightArr[i];
        return (
          <Row
            key={i}
            data={item}
            widthArr={widthArr}
            height={height}
            flexArr={flexArr}
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
	row: {
		flexDirection: 'row',
		overflow: 'hidden'
	}
});
