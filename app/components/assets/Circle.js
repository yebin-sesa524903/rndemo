import React, {
  Component,
} from 'react';

import {
  Animated,

  StyleSheet,
  Text,
  View,
  ViewPropTypes
} from 'react-native';
import PropTypes from 'prop-types';

import Arc from './Arc';
import withAnimation from './withAnimation';
import {Surface, Shape} from '@react-native-community/art';
const CIRCLE = Math.PI * 2;

const AnimatedSurface = Animated.createAnimatedComponent(Surface);
const AnimatedArc = Animated.createAnimatedComponent(Arc);

export class ProgressCircle extends Component {
  constructor(props, context) {
    super(props, context);

    this.progressValue = 0;
  }

  componentWillMount() {
    if (this.props.animated) {
      this.props.progress.addListener((event) => {
        this.progressValue = event.value;
        // console.warn('componentWillMount...',this.progressValue);
        if (this.props.showsText || this.progressValue === 1) {
          this.forceUpdate();
        }
      });
    }
  }

  render() {
    var {
      animated,
      borderColor,
      borderWidth,
      color,
      children,
      direction,
      formatText,
      formatIconText,
      indeterminate,
      progress,
      rotation,
      showsText,
      size,
      style,
      textStyle,
      textIconStyle,
      thickness,
      unfilledColor,
      offsetColor,
      ...restProps
    } = this.props;

    var border = borderWidth || (indeterminate ? 1 : 0);

    const radius = (size / 2) - border;
    const offset = {
      top: border,
      left: border,
    };
    const textOffset = border + thickness;
    const textSize = size - (textOffset * 2);

    const Surface = rotation ? AnimatedSurface : Surface;
    const Shape = animated ? AnimatedArc : Arc;

    var dsProgress=0.01;
    if(this.props.noSpace){//表示不显示分割白边
      dsProgress=0;
    }
    var progressValue = animated ? this.progressValue : progress;
    if (progress>1) {
      progress=1.0;
    }
    var angle = animated ? Animated.multiply(progress, CIRCLE) : progress * CIRCLE;
    // angle=angle-0.1;

    const dsAngle=dsProgress * CIRCLE;

    var angle2 = animated ? Animated.multiply((progress+dsProgress), CIRCLE) : (progress+dsProgress) * CIRCLE;
    return (
      <View style={[styles.container, style]} {...restProps}>
        <Surface
          width={size}
          height={size}
          style={{
            transform: [{
              rotate: indeterminate && rotation
                ? rotation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                })
                : '0deg',
            }],
          }}
        >
          {unfilledColor && progressValue !== 1 ? (
            <Shape
              radius={radius}
              offset={offset}
              startAngle={angle}
              endAngle={CIRCLE-dsAngle}
              direction={direction}
              stroke={unfilledColor}
              strokeWidth={thickness}
            />
          ) : false}
          {!indeterminate ? (
            <Shape
              radius={radius}
              offset={offset}
              startAngle={-dsAngle}
              endAngle={0}
              direction={direction}
              stroke={offsetColor}
              strokeWidth={thickness}
            />
          ) : false}
          {!indeterminate ? (
            <Shape
              radius={radius}
              offset={offset}
              startAngle={0}
              endAngle={angle-dsAngle}
              direction={direction}
              stroke={color}
              strokeWidth={thickness}
            />
          ) : false}
          {!indeterminate ? (
            <Shape
              radius={radius}
              offset={offset}
              startAngle={angle-dsAngle}
              endAngle={angle}
              direction={direction}
              stroke={offsetColor}
              strokeWidth={thickness}
            />
          ) : false}
          {border ? (
            <Arc
              radius={size / 2}
              startAngle={0}
              endAngle={(indeterminate ? 1.8 : 2) * Math.PI}
              stroke={borderColor || color}
              strokeWidth={border}
            />
          ) : false}
        </Surface>
        {!indeterminate && showsText ? (
          <View
            style={{
              position: 'absolute',
              left: textOffset,
              top: textOffset,
              width: textSize,
              height: textSize,
              borderRadius: textSize / 2,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection:'row'
            }}
          >
          <Text>
            <Text
              style={[{
                fontSize: textSize / 4.5,
                // fontWeight: '300',
              }, textStyle]}
            >
              {formatText(progressValue)}
            </Text>
            <Text
              style={[{
                fontSize: textSize / 6,
                // fontWeight: '100',
              }, textIconStyle]}
            >
              {formatIconText(progressValue)}
            </Text>
          </Text>

          </View>
        ) : false}
        {children}
      </View>
    );
  }
}

ProgressCircle.propTypes = {
  animated: PropTypes.bool,
  borderColor: PropTypes.string,
  borderWidth: PropTypes.number,
  color: PropTypes.string,
  children: PropTypes.node,
  direction: PropTypes.oneOf(['clockwise', 'counter-clockwise']),
  formatText: PropTypes.func,
  formatIconText: PropTypes.func,
  indeterminate: PropTypes.bool,
  progress: PropTypes.oneOfType([
    // PropTypes.any,
    // PropTypes.instanceOf(Animated.Value),
  ]),
  rotation: PropTypes.instanceOf(Animated.Value),
  showsText: PropTypes.bool,
  size: PropTypes.number,
  style: ViewPropTypes.style,
  textStyle: Text.propTypes.style,
  textIconStyle: Text.propTypes.style,
  thickness: PropTypes.number,
  unfilledColor: PropTypes.string,
  offsetColor: PropTypes.string,
}

ProgressCircle.defaultProps = {
  borderWidth: 1,
  color: 'rgba(0, 122, 255, 1)',
  direction: 'clockwise',
  formatText: progress => `${Math.round(progress * 100)}`,
  formatIconText: progress => `%`,
  progress: 0,
  showsText: false,
  size: 40,
  thickness: 3,
}

var styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
});

export default withAnimation(ProgressCircle);
