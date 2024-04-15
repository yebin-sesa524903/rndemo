import React, {Component, ReactNode, ReactElement} from 'react';
import {View, ViewStyle} from 'react-native';

interface ITableOptions {
  style?: ViewStyle;
  borderStyle?: ViewStyle;
  children?: any,
}

export function Table(props: ITableOptions) {
  function _renderChildren(item: Readonly<ITableOptions> & Readonly<{ children?: ReactNode }>) {
    return React.Children.map(item.children, child =>
      React.cloneElement(
        (child as unknown as ReactElement),
        item.borderStyle && (child as unknown as { type: { displayName: string } }).type.displayName !== 'ScrollView' ? {borderStyle: item.borderStyle} : {}
      )
    );
  }

  const {borderStyle} = props;
  const borderLeftWidth = (borderStyle && borderStyle.borderWidth) || 0;
  const borderBottomWidth = borderLeftWidth;
  const borderColor = (borderStyle && borderStyle.borderColor) || '#000';
  return (
    <View
      style={[
        props.style,
        {
          borderLeftWidth,
          borderBottomWidth,
          borderColor
        }
      ]}
    >
      {_renderChildren(props)}
    </View>
  );
}


interface ITableWrapperOptions {
  style?: ViewStyle;
  borderStyle?: ViewStyle;
  children?: any;
}

export function TableWrapper(props:ITableWrapperOptions) {
  function  _renderChildren(item: Readonly<ITableWrapperOptions> & Readonly<{ children?: ReactNode }>) {
    return React.Children.map(item.children, child =>
      React.cloneElement((child as unknown as ReactElement), item.borderStyle ? {borderStyle: item.borderStyle} : {})
    );
  }
  const {style} = props;
  return <View style={style}>{_renderChildren(props)}</View>;
}
