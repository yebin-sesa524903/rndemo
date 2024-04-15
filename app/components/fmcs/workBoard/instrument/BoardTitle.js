/**
 * Project - react-native-instrument-board
 * Author      : ljunb
 * Date        : 2017/11/22 下午8:33
 * Description : 底部中间的标题和副标题
 */
import React, { Component } from 'react'
import {
  View,
  Text
} from 'react-native';

export default class BoardTitle extends Component {

  constructor(props) {
    super(props);
    this.state = {
      title: props.title,
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.title !== this.props.title) {
      this.setState({ title: nextProps.title })
    }
  }

  render() {
    const { title } = this.state;
    const { startAngle, radius, innerRadius, subTitle , showNeedleAngle, showSectionProgress} = this.props;
    const x1 = radius + innerRadius * Math.sin(2 * Math.PI / 360 * (360 - startAngle));
    const x2 = radius - innerRadius * Math.sin(2 * Math.PI / 360 * startAngle);
    const y = radius + innerRadius * Math.cos(2 * Math.PI / 360 * startAngle);
    let sourceTitle = title.toFixed(1);
    if (Math.floor(sourceTitle) == sourceTitle) {
      sourceTitle = title.toFixed(0);
    }

    return (
      <View style={{ position: 'absolute', top: y - (showNeedleAngle ? 40 : 100), left: x1, right: x2, backgroundColor: 'transparent' }}>
        <Text style={{ textAlign: 'center', fontSize: showSectionProgress ? 25 : 40, color: this.props.textColor }}>{sourceTitle}
          {
            !showNeedleAngle && <Text style={{fontSize: 17, color: this.props.textColor}}>°C</Text>
          }
        </Text>
        <Text style={{ textAlign: 'center', fontSize: 18, color: showNeedleAngle ? this.props.textColor : '#999'}}>{subTitle}</Text>
      </View>
    )
  }
}
