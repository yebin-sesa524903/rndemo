import { I18nManager } from 'react-native';
import getSceneIndicesForInterpolationInputRange from '../../node_modules/react-navigation/src/utils/getSceneIndicesForInterpolationInputRange';

export function forLeftOver(props){
    const {layout, position, scene} = props;
    const width = layout.initWidth;
    const index = scene.index;
    const inputRange = [index-1,index,index+1];
    const outputRange = [-width,0,0];
    const opacity = position.interpolate({
        inputRange,
        outputRange:[0,1,0]
    });
    const translateX = position.interpolate({
        inputRange,
        outputRange
    });
    return {
        opacity,
        transform:[{translateX}]
    }
}

export function forRightOver(props){
    const {layout, position, scene} = props;
    const width = layout.initWidth;
    const index = scene.index;
    const inputRange = [index-1,index,index+1];
    const outputRange = [width,0,0];
    const opacity = position.interpolate({
        inputRange,
        outputRange:[0,1,0]
    });
    const translateX = position.interpolate({
        inputRange,
        outputRange
    });
    return {
        opacity,
        transform:[{translateX}]
    }
}

export function forBottomOver(props){
    const {layout, position, scene} = props;
    const height = layout.initHeight;
    const index = scene.index;
    const inputRange = [index-1,index,index+1];
    const outputRange = [height,0,0];
    const opacity = position.interpolate({
        inputRange,
        outputRange:[0,1,0]
    });
    const translateY = position.interpolate({
        inputRange,
        outputRange
    });
    return {
        opacity,
        transform:[{translateY}]
    }
}

export function forLeftPush(props){
    const {layout, position, scene} = props;
    const width = layout.initWidth;
    const index = scene.index;
    const inputRange = [index-1,index,index+1];
    const outputRange = [-width,0,width];
    const opacity = position.interpolate({
        inputRange,
        outputRange:[0,1,0]
    });
    const translateX = position.interpolate({
        inputRange,
        outputRange
    });
    return {
        opacity,
        transform:[{translateX}]
    }
}

export function forRightPush(props){
    const {layout, position, scene} = props;
    const width = layout.initWidth;
    const index = scene.index;
    const inputRange = [index-1,index,index+1];
    const outputRange = [width,0,-width];
    const opacity = position.interpolate({
        inputRange,
        outputRange:[0,1,0]
    });
    const translateX = position.interpolate({
        inputRange,
        outputRange
    });
    return {
        opacity,
        transform:[{translateX}]
    }
}

export function forLeftPull(props){
    const {layout, position, scene} = props;
    const width = layout.initWidth;
    const index = scene.index;
    const inputRange = [index-1,index,index+1];
    const outputRange = [-width,0,-width];
    const opacity = position.interpolate({
        inputRange,
        outputRange:[0,1,0]
    });
    const translateX = position.interpolate({
        inputRange,
        outputRange
    });
    return {
        opacity,
        transform:[{translateX}]
    }
}

export function forRightPull(props){
    const {layout, position, scene} = props;
    const width = layout.initWidth;
    const index = scene.index;
    const inputRange = [index-1,index,index+1];
    const outputRange = [width,0,width];
    const opacity = position.interpolate({
        inputRange,
        outputRange:[0,1,0]
    });
    const translateX = position.interpolate({
        inputRange,
        outputRange
    });
    return {
        opacity,
        transform:[{translateX}]
    }
}

export function forBottomPull(props){
    const {layout, position, scene} = props;
    const height = layout.initHeight;
    const index = scene.index;
    const inputRange = [index-1,index,index+1];
    const outputRange = [height,0,height];
    const opacity = position.interpolate({
        inputRange,
        outputRange:[0,1,0]
    });
    const translateY = position.interpolate({
        inputRange,
        outputRange
    });
    return {
        opacity,
        transform:[{translateY}]
    }
}

export function forLeftTopOver(props){
    const {layout, position, scene} = props;
    const width = layout.initWidth;
    const height = layout.initHeight;
    const index = scene.index;
    const inputRange = [index-1,index,index+1];
    const xRange = [-width,0,0];
    const yRange = [-height,0,0];
    const opacity = position.interpolate({
        inputRange,
        outputRange:[0,1,0]
    });
    const translateX = position.interpolate({
        inputRange,
        outputRange:xRange
    });
    const translateY = position.interpolate({
        inputRange,
        outputRange:yRange
    });
    return {
        opacity,
        transform:[{translateX},{translateY}]
    }
}

export function forLeftTopPull(props){
    const {layout, position, scene} = props;
    const width = layout.initWidth;
    const height = layout.initHeight;
    const index = scene.index;
    const inputRange = [index-1,index,index+1];
    const xRange = [-width,0,width];
    const yRange = [-height,0,-height];
    //const outputRange = [height,0,height];
    const opacity = position.interpolate({
        inputRange,
        outputRange:[0,1,0]
    });
    const translateX = position.interpolate({
        inputRange,
        outputRange:xRange
    });
    const translateY = position.interpolate({
        inputRange,
        outputRange:yRange
    });
    return {
        opacity,
        transform:[{translateX},{translateY}]
    }
}

export function forLeftTopPush(props){
    const {layout, position, scene} = props;
    const width = layout.initWidth;
    const height = layout.initHeight;
    const index = scene.index;
    const inputRange = [index-1,index,index+1];
    const xRange = [-width,0,width];
    const yRange = [-height,0,height];
    //const outputRange = [height,0,height];
    const opacity = position.interpolate({
        inputRange,
        outputRange:[0,1,0]
    });
    const translateX = position.interpolate({
        inputRange,
        outputRange:xRange
    });
    const translateY = position.interpolate({
        inputRange,
        outputRange:yRange
    });
    return {
        opacity,
        transform:[{translateX},{translateY}]
    }
}

export function forRightTopOver(props){
    const {layout, position, scene} = props;
    const width = layout.initWidth;
    const height = layout.initHeight;
    const index = scene.index;
    const inputRange = [index-1,index,index+1];
    const xRange = [width,0,0];
    const yRange = [-height,0,0];
    const opacity = position.interpolate({
        inputRange,
        outputRange:[0,1,0]
    });
    const translateX = position.interpolate({
        inputRange,
        outputRange:xRange
    });
    const translateY = position.interpolate({
        inputRange,
        outputRange:yRange
    });
    return {
        opacity,
        transform:[{translateX},{translateY}]
    }
}

export function forRightTopPull(props){
    const {layout, position, scene} = props;
    const width = layout.initWidth;
    const height = layout.initHeight;
    const index = scene.index;
    const inputRange = [index-1,index,index+1];
    const xRange = [width,0,-width];
    const yRange = [-height,0,-height];
    const opacity = position.interpolate({
        inputRange,
        outputRange:[0,1,0]
    });
    const translateX = position.interpolate({
        inputRange,
        outputRange:xRange
    });
    const translateY = position.interpolate({
        inputRange,
        outputRange:yRange
    });
    return {
        opacity,
        transform:[{translateX},{translateY}]
    }
}

export function forRightTopPush(props){
    const {layout, position, scene} = props;
    const width = layout.initWidth;
    const height = layout.initHeight;
    const index = scene.index;
    const inputRange = [index-1,index,index+1];
    const xRange = [width,0,-width];
    const yRange = [-height,0,height];
    const opacity = position.interpolate({
        inputRange,
        outputRange:[0,1,0]
    });
    const translateX = position.interpolate({
        inputRange,
        outputRange:xRange
    });
    const translateY = position.interpolate({
        inputRange,
        outputRange:yRange
    });
    return {
        opacity,
        transform:[{translateX},{translateY}]
    }
}

function forInitial(props) {
  const { navigation, scene } = props;

  const focused = navigation.state.index === scene.index;
  const opacity = focused ? 1 : 0;
  // If not focused, move the scene far away.
  const translate = focused ? 0 : 1000000;
  return {
    opacity,
    transform: [{ translateX: translate }, { translateY: translate }],
  };
}

export function forHorizontal(props) {
  const { layout, position, scene } = props;

  if (!layout.isMeasured) {
    return forInitial(props);
  }
  const interpolate = getSceneIndicesForInterpolationInputRange(props);

  if (!interpolate) return { opacity: 0 };

  const { first, last } = interpolate;
  const index = scene.index;
  const opacity = position.interpolate({
    inputRange: [first, first + 0.01, index, last - 0.01, last],
    outputRange: [0, 1, 1, 0.85, 0],
  });

  const width = layout.initWidth;
  const translateX = position.interpolate({
    inputRange: [first, index, last],
    outputRange: I18nManager.isRTL
      ? [-width, 0, width * 0.3]
      : [width, 0, width * -0.3],
  });
  const translateY = 0;

  return {
    opacity,
    transform: [{ translateX }, { translateY }],
  };
}

export function forVertical(props) {
  const { layout, position, scene } = props;

  if (!layout.isMeasured) {
    return forInitial(props);
  }
  const interpolate = getSceneIndicesForInterpolationInputRange(props);

  if (!interpolate) return { opacity: 0 };

  const { first, last } = interpolate;
  const index = scene.index;
  const opacity = position.interpolate({
    inputRange: [first, first + 0.01, index, last - 0.01, last],
    outputRange: [0, 1, 1, 0.85, 0],
  });

  const height = layout.initHeight;
  const translateY = position.interpolate({
    inputRange: [first, index, last],
    outputRange: [height, 0, 0],
  });
  const translateX = 0;

  return {
    opacity,
    transform: [{ translateX }, { translateY }],
  };
}

export function forFadeScaleFromRightBottom(props){
    const {position, scene, layout} = props;
    const {index} = scene;
    // var {width,height} = Dimensions.get('window');
    // const Screen = this.props.router.getComponentForRouteName(route.routeName)
    const inputRange = [index - 1, index, index + 1];
    // const opacity = position.interpolate({
    //     inputRange,
    //     outputRange: [0, 0, 1, 1],
    // });

    const interpolate = getSceneIndicesForInterpolationInputRange(props);
    // if (!interpolate) return { opacity: 0 };
    const { first, last } = interpolate;
    const opacity = position.interpolate({
      inputRange: [first, first + 0.3, index, last - 0.01, last],
      outputRange: [0, 0, 1, 1, 1],
    });

    const scaleY = position.interpolate({
        inputRange,
        outputRange: ([0, 1, 1]),
    });
    const scaleX = position.interpolate({
        inputRange,
        outputRange: ([0, 1, 1]),
    });
    const width = layout.initWidth;
    const translateX = position.interpolate({
        inputRange,
        outputRange: ([width*2, 0, 0]),
    });
    const height = layout.initHeight;
    const translateY = position.interpolate({
        inputRange,
        outputRange: ([height*2, 0, 0]),
    });

    return {
        opacity,
        transform: [
          {scaleX},
          {scaleY},
          { translateY }, { translateX }
        ]
    };
};
