/**
 * Project - react-native-instrument-board
 * Author      : ljunb
 * Date        : 2017/11/22 下午8:33
 * Description : 简易的仪表盘组件
 */

import React, { Component } from 'react';
import {
  View,
  Animated,
} from 'react-native';

import Svg, {
  Path,
  Text,
  Defs,
  TextPath,
  G,
} from 'react-native-svg';
import PropTypes from 'prop-types';
import BoardNeedle from './BoardNeedle';
import BoardProgress from './BoardProgress';
import paintbrush from './paintbrush';
import BoardTitle from "./BoardTitle";
import {isIndustryPad, screenWidth} from "../../../../utils/const/Consts";

const AnimatedBoardNeedle = Animated.createAnimatedComponent(BoardNeedle);
const AnimatedBoardProgress = Animated.createAnimatedComponent(BoardProgress);
const AnimatedBoardTitle = Animated.createAnimatedComponent(BoardTitle);

export default class InstrumentBoard extends Component {
  static propTypes = {
    // 百分比，0-100
    percentage: PropTypes.number,
    // 整体半径，指外圈
    radius: PropTypes.number,
    // 边框宽度
    strokeWidth: PropTypes.number,
    // 开始的角度，0-360
    startAngle: PropTypes.number,
    // 区域的边框颜色
    contentStrokeColors: PropTypes.array,
    contentPercentValues: PropTypes.array,
    showSectionProgress: PropTypes.bool,
    // 刻度值文本数组
    degreeTexts: PropTypes.array,
    // 刻度值半径
    degreeTextRadius: PropTypes.number,
    // 刻度值文本偏移量数组
    degreeTextStartOffset: PropTypes.array,
    //刻度偏移量数组
    scaleStartOffset: PropTypes.array,
    // 刻度值文本颜色
    degreeTextColor: PropTypes.string,
    // 区域内容文本数组
    contentTexts: PropTypes.array,
    // 区域内容文本颜色
    contentTextColor: PropTypes.string,
    // 进度条半径
    progressRadius: PropTypes.number,
    // 进度条颜色
    progressColor: PropTypes.string,
    // 进度条背景色
    progressBackgroundColor: PropTypes.string,
    ///是否展示指示箭头
    showNeedleAngle: PropTypes.bool,
    ///真实的刻度值
    realValue: PropTypes.number,
    // 指示针半径
    needleRadius: PropTypes.number,
    // 指示箭头角度（决定箭头宽度）
    needleAngle: PropTypes.number,
    // 指示箭头中心圆点半径
    centerSpotRadius: PropTypes.number,
    // 是否开启动画
    animated: PropTypes.bool,
  };

  static defaultProps = {
    percentage: 20,
    radius: 150,
    strokeWidth: 0,
    degreeTexts: ['0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100'],
    degreeTextStartOffset: ['4%', '0%', '0%', '0%', '0%', '0%', '0%', '0%', '0%', '0%', '-2%'],
    degreeTextColor: '#9d9d9d',
    miniDegreeTextColor: '#c4cad8',
    scaleStartOffset: ['10%', '10%', '10%', '10%', '10%', '10%', '10%', '10%', '10%', '10%', '10%',],
    miniDegreeTexts: Array(101).fill(1),
    contentTexts: ['0', '1', '2', '3', '4', '5', '|', '|', '|', '9'],
    contentTextColor: 'green',
    contentStrokeColors: ['rgb(11, 86, 215)', 'rgb(26, 189, 131)', 'rgb(248, 145, 7)', 'rgb(234, 0, 22)'],
    contentPercentValues: [0.1, 0.3, 0.5, 0.9],
    showSectionProgress: false,
    startAngle: 45,
    progressRadius: 90,
    progressColor: '#2752ee',
    progressBackgroundColor: '#f3f3f3',
    showNeedleAngle: true,
    needleRadius: 80,
    needleAngle: 60,
    centerSpotRadius: 16,
    degreeTextRadius: 120,
    animated: true,
  };

  constructor(props) {
    super(props);
    this.state = {
      percentage: props.percentage,
    };
    this.degreeTextKeys = this.makePathKeys(props.degreeTexts);
    this.degreeScaleKeys = this.makePathKeys2(props.degreeTexts);
    this.miniDegreeScaleKeys = this.makePathKeys2(props.miniDegreeTexts);
  }

  degAnimatedValue = new Animated.Value(0);

  componentDidMount() {
    this.startDrawInRect();
  }

  componentWillReceiveProps(nextProps) {
    const { percentage } = this.props;
    // if (percentage !== nextProps.percentage) {
    this.setState({ percentage: nextProps.percentage }, this.startDrawInRect)
    // }
  }

  // 创建TextPath的id引用
  makePathKeys = textArr => textArr.map((item, key) => `TextPath_${item}_${key}`);
  makePathKeys2 = textArr => textArr.map((item, key) => `TextPath2_${item}_${key}`);

  definedDegreeTextPath = ((id, index) => {
    const { radius, startAngle, degreeTextRadius, contentTexts } = this.props;
    // 可旋转的总角度
    const totalAngle = (360 - startAngle * 2);
    // 每个区域的角度大小
    const contentAngle = totalAngle / contentTexts.length;

    const startA = startAngle + contentAngle * index - 4;
    const endA = startAngle + contentAngle * (index + 1);
    return (
      <Path
        key={id}
        id={id}
        d={paintbrush.drawArc(radius, degreeTextRadius, startA, endA, true)}
      />
    )
  });

  definedDegreeScalePath = ((id, index) => {
    const { radius, startAngle, degreeTextRadius, contentTexts } = this.props;
    // 可旋转的总角度
    const totalAngle = (360 - startAngle * 2);
    // 每个区域的角度大小
    const contentAngle = totalAngle / contentTexts.length;

    const startA = startAngle + contentAngle * index - 4;
    const endA = startAngle + contentAngle * (index + 1);
    return (
      <Path
        key={id}
        id={id}
        d={paintbrush.drawArc(radius, degreeTextRadius - 17, startA, endA, true)}
      />
    )
  });

  definedMiniDegreeScalePath = ((id, index) => {
    const { radius, startAngle, degreeTextRadius, contentTexts } = this.props;
    // 可旋转的总角度
    const totalAngle = (360 - startAngle * 2);
    // 每个区域的角度大小
    const contentAngle = totalAngle / 100;

    const startA = startAngle + contentAngle * index - 4;
    const endA = startAngle + contentAngle * (index + 1);
    return (
      <Path
        key={id}
        id={id}
        d={paintbrush.drawArc(radius, degreeTextRadius - 10, startA, endA, true)}
      />
    )
  });

  //绘制弧形分段刻度条
  drawContentStrokeItem = ((color, index) => {
    const { radius, strokeWidth, startAngle, contentPercentValues } = this.props;
    // 可旋转的总角度
    const totalAngle = (360 - startAngle * 2);
    let contentAngle = totalAngle * contentPercentValues[index];
    // 除去strokeWidth的内层半径
    const innerRadius = radius - strokeWidth - 30;
    let startA = startAngle;
    if (index != 0) {
      startA = startAngle + totalAngle * contentPercentValues[index - 1];
    }
    let endA = startAngle + totalAngle * contentPercentValues[index];
    // console.warn('--------', index, contentAngle, totalAngle, startA, endA,);
    return (
      <G key={`G_${color+index}`}>
        <Path
          key={color}
          d={paintbrush.drawArc(radius, innerRadius, startA, endA, true)}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
      </G>
    )
  });

  drawDegreeTextItem = ((key, index) => {
    return (
      <Text key={key} fill={this.props.degreeTextColor}>
        <TextPath href={`#${key}`}
          startOffset={
            this.props.degreeTextStartOffset[index]
          }
        >
          {this.props.degreeTexts[index]}
        </TextPath>
      </Text>
    )
  });

  drawDegreeScaleItem = ((key, index) => {
    return (
      <Text key={key} fill={this.props.degreeTextColor} style={{ fontSize: 5, }}>
        <TextPath href={`#${key}`}
          startOffset={
            this.props.scaleStartOffset[index]
          }
        >
          {'|'}
        </TextPath>
      </Text>
    )
  });
  drawMiniDegreeScaleItem = ((key, index) => {
    return (
      <Text key={key} fill={this.props.miniDegreeTextColor} style={{ fontSize: 5, }}>
        <TextPath href={`#${key}`}
          startOffset={
            '45%'
          }
        >
          {'|'}
        </TextPath>
      </Text>
    )
  });

  render() {
    const {
      centerSpotRadius, needleAngle,
      radius, startAngle, degreeTexts, contentTexts,
      progressColor, progressBackgroundColor,
      degreeTextColor, contentTextColor, showSectionProgress
    } = this.props;

    const lastItem = degreeTexts[degreeTexts.length - 1];
    // 可旋转的总角度
    const totalAngle = (360 - startAngle * 2);

    const arrowAnimatedAngle = this.degAnimatedValue.interpolate({
      inputRange: [0, this.state.percentage],
      outputRange: [startAngle, this.state.percentage / 100 * totalAngle + startAngle]
    });

    const progressAnimatedValue = this.degAnimatedValue.interpolate({
      inputRange: [0, this.state.percentage],
      outputRange: [startAngle, startAngle + (this.state.percentage / 100 * totalAngle)]
    });

    const titleValue = this.degAnimatedValue.interpolate({
      inputRange: [0, this.state.percentage],
      outputRange: [0, this.state.percentage / 100 * lastItem]
    });

    return (
      <View style={{ backgroundColor: 'transparent', justifyContent: 'center', zIndex: 0, overflow: 'hidden' }}>
        <Svg height={radius * 2} width={radius * 2}>
          <Defs>
            {this.degreeTextKeys.map(this.definedDegreeTextPath)}
            {this.degreeScaleKeys.map(this.definedDegreeScalePath)}
            {this.miniDegreeScaleKeys.map(this.definedMiniDegreeScalePath)}
          </Defs>
          {showSectionProgress && this.props.contentStrokeColors.map(this.drawContentStrokeItem)}
          {this.degreeTextKeys.map(this.drawDegreeTextItem)}
          {this.degreeScaleKeys.map(this.drawDegreeScaleItem)}
          {this.miniDegreeScaleKeys.map(this.drawMiniDegreeScaleItem)}
          {!showSectionProgress && <AnimatedBoardProgress
            progressRadius={this.props.progressRadius}
            showNeedleAngle={this.props.showNeedleAngle}
            progressColor={progressColor}
            progressBackgroundColor={progressBackgroundColor}
            radius={radius}
            totalAngle={totalAngle}
            startAngle={startAngle}
            endAngle={progressAnimatedValue}
          />}
          {this.props.showNeedleAngle &&
            <AnimatedBoardNeedle
              radius={radius}
              needleColor={progressColor}
              needleRadius={this.props.needleRadius}
              centerSpotRadius={centerSpotRadius}
              angle={arrowAnimatedAngle}
              needleAngle={needleAngle}
            />}
        </Svg>
        <AnimatedBoardTitle
          title={this.props.showNeedleAngle ? titleValue : this.props.realValue}
          useNativeDriver={false}
          showNeedleAngle={this.props.showNeedleAngle}
          textColor={contentTextColor}
          startAngle={startAngle}
          radius={radius}
          innerRadius={this.props.progressRadius}
          showSectionProgress={this.props.showSectionProgress}
          subTitle={this.props.contentText}
        />
      </View>
    );
  }

  getContentTextIndex = () => {
    const { percentage } = this.state;
    const { contentTexts } = this.props;
    const findIndex = Math.floor(percentage / (100 / contentTexts.length));
    return findIndex === contentTexts.length ? (findIndex - 1) : findIndex;
  };

  startDrawInRect = () => {
    if (this.props.animated) {
      Animated.spring(this.degAnimatedValue, {
        toValue: this.state.percentage,
      }).start();
    } else {
      this.degAnimatedValue.setValue(this.state.percentage);
    }
  };
}
