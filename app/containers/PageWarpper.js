'use strict';
import React,{Component} from 'react';
import PropTypes from 'prop-types';
import Scene from '../components/Scene.js';
import { withMappedNavigationProps } from 'react-navigation-props-mapper'

export default class PageWarpper extends Component {
  render() {
    const params = this.props.navigation.state.params;
    return (
      <Scene ref="scene" initComponent={params} navigation={this.props.navigation}
        route={{'id':params.id}}/>
    )
  }
}

// import {
//   StatusBar,
//   InteractionManager,
//   View,
// } from "react-native";
// import {Navigator} from 'react-native-deprecated-custom-components';
// import {StackNavigator,createStackNavigator} from 'react-navigation';
// import PropTypes from 'prop-types';
// import {STATUSBAR_COLOR} from '../styles/color';
// // import Hud from './Hud.js';
// import ContextComponent from '../components/ContextComponent.js';
// import storage from '../utils/storage';
// import chat from './Chat.js';
// import { withMappedNavigationProps } from 'react-navigation-props-mapper'
//
// // import Scene from './components/Scene.js';
// // import Loading from './components/Loading';
// // import Main from './Main';
// // import LoginWithPassword from './LoginWithPassword';
//
// export default class PageWarpper extends Component {
//   constructor(props){
//     super(props);
//     this.state={showModalView:false,isExpandedChat:false,lastLoginIndex:0,lastOneHourIndex:0,textChatAni:null};
//     // this.startLoginChat();
//     // this.startOneHourChat();
//   }
//   componentDidMount() {
//     // InteractionManager.runAfterInteractions(()=>{
//     //   this.startLoginChat();
//     //   this.startOneHourChat();
//     // });
//     // console.warn('ddd',this.props.navigation);
//   }
//   componentWillReceiveProps(nextProps) {
//     // console.warn('aaaa',this.props.initComponent.showChat,nextProps.initComponent.showChat,this.props.initComponent.navigationBar);
//     // if(!this.props.initComponent.showChat && nextProps.initComponent.showChat){
//     //   this.startLoginChat();
//     //   this.startOneHourChat();
//     // }
//   }
//   startLoginChat()
//   {
//     var arrLoginTexts=['叮咚！你的机器人助手小严上线啦~',
//       '我是小严，有关产品和技术的问题都可以戳我聊聊哦~',
//       '太阳当空照，小严对你笑~随时等待你的召唤哦~'];
//     storage.getItem('LASTLOGINSHOWINDEX').then((res)=>{
//       var lastLoginIndex=0;
//       if (res===null||res===undefined) {
//         lastLoginIndex=0;
//       }else {
//         lastLoginIndex=parseInt(res);
//         lastLoginIndex+=1;
//       }
//       lastLoginIndex=lastLoginIndex%3;
//       storage.setItem('LASTLOGINSHOWINDEX',String(lastLoginIndex));
//       this.setState({showModalView:true,isExpandedChat:true,lastLoginIndex:lastLoginIndex,
//         textChatAni:arrLoginTexts[lastLoginIndex]});
//       this._currContextComponent.showChatAnimated();
//     });
//     this.closeChatAnimation();
//   }
//   closeChatAnimation()
//   {
//     setTimeout(()=>{
//       this.setState({showModalView:false,isExpandedChat:false});
//       this._currContextComponent.closeChatAnimated();
//     },5000);
//   }
//   startOneHourChat()
//   {
//     var arrOneHourTexts=['多吃水果多喝水，小严在这里陪伴你每一天~',
//       '有关产品和技术的问题可以随时戳小严聊聊哦~',
//       '小严又学习了好多新知识呢，快来戳我了解一下吧~',
//       '你的贴心助手小严仍然在待命中，为你，全天无休~'];
//     var timeSeconds=60*60*1000;
//     // timeSeconds=3000;
//     this.timerOneHour=setTimeout(()=>{
//       storage.getItem('LASTONEHOURSHOWINDEX').then((res)=>{
//         var lastLoginIndex=0;
//         if (res===null||res===undefined) {
//           lastLoginIndex=0;
//         }else {
//           lastLoginIndex=parseInt(res);
//           lastLoginIndex+=1;
//         }
//         lastLoginIndex=lastLoginIndex%4;
//         storage.setItem('LASTONEHOURSHOWINDEX',String(lastLoginIndex));
//         this.setState({showModalView:true,isExpandedChat:true,lastLoginIndex:lastLoginIndex,
//         textChatAni:arrOneHourTexts[lastLoginIndex]});
//         this._currContextComponent.showChatAnimated();
//       });
//       this.closeChatAnimation();
//     },timeSeconds);
//   }
//   getChildContext() {
//     return {
//       showSpinner:()=>{
//         this._hud.showSpinner();
//       },
//       hideHud:()=>{
//         this._hud.hide();
//       }
//     };
//   }
//   _renderScene()
//   {
//     console.warn('dddddd',this.props.navigation.state.params);
//     var initComponent=this.props.navigation.state.params.initComponent;
//     const Component = initComponent.component;
//     var barStyle = 'default';
//     // if(route.barStyle){
//       // barStyle = route.barStyle;
//     // }
//     var showChat=initComponent.showChat;
//     var text=this.state.textChatAni;
//     if (initComponent.isFromLogin) {
//       text='欢迎来到变频顾问，请问有什么可以帮你吗？';
//     }
//     return (
//       <ContextComponent
//         ref={(context)=>{
//           this._currContextComponednt=context;
//         }}
//         showModalView={this.state.showModalView}
//         isExpandedChat={this.state.isExpandedChat}
//         lastLoginIndex={this.state.lastLoginIndex}
//         lastOneHourIndex={this.state.lastOneHourIndex}
//         textChatAni={text}
//         navigation={this.props.navigation}
//         showChat={
//           true
//           //showChat&&route.id!=='chat_view'&&route.id!=='chat_photo_show'
//         }
//         onModalClose={()=>{
//           this.setState({showModalView:false,isExpandedChat:false});
//         }}
//         onChatClick={()=>{
//           this.setState({showModalView:false,isExpandedChat:false});
//           // this._currContextComponent.closeChatAnimated();
//           if (this.timerOneHour) {
//             clearTimeout(this.timerOneHour);
//             this.timerOneHour=null;
//           }
//           this.props.navigation.navigate(
//             'chat_view',
//             {
//               isFromHorizontal:false,
//             }
//           )
//           // var sceneConfig = Navigator.SceneConfigs.PushFromRight;
//           // navigation.push({
//           //   id:'chat_view',
//           //   component:chat,
//           //   // sceneConfig:sceneConfig,
//           //   passProps:{
//           //     isFromHorizontal:false//route.id==='history_view'
//           //   }
//           // });
//         }}>
//         <StatusBar barStyle={barStyle} translucent={true} backgroundColor={STATUSBAR_COLOR} />
//         <Component
//           navigation={this.props.navigation}
//           {...this.props.navigation.state.params}
//         />
//       </ContextComponent>
//     );
//   }
//   // route={route}
//   // {...route.passProps}
//   _setNavigatorRef(navigation) {
//     if (navigation !== this._navigator) {
//       this._navigator = navigation;
//     }
//   }
//   getNavigator(){
//     // console.warn('getNavigator',this.refs.navigation.resetTo);
//     return this._navigator;
//   }
//   render() {
//     return this._renderScene();
//     // return (
//     //   <Navigator
//     //     ref={(navigation)=>this._setNavigatorRef(navigation)}
//     //     style={{flex: 1,backgroundColor:'white'}}
//     //     renderScene={(route,navigation)=>this._renderScene(route,navigation)}
//     //     initialRoute={this.props.initComponent}
//     //     onDidFocus={(route)=>{
//     //       // console.warn('did focus:',route?route.id:route);
//     //     }}
//     //     configureScene={(route) => {
//     //       if (route.sceneConfig) {
//     //         if(typeof route.sceneConfig === 'string'){
//     //           return Navigator.SceneConfigs[route.sceneConfig];
//     //         }
//     //         return route.sceneConfig;
//     //       }
//     //       return Navigator.SceneConfigs.FloatFromRight;
//     //     }}
//     //   />
//     // );
//   }
// }

PageWarpper.propTypes = {
  // initComponent:PropTypes.object.isRequired,
  navigation:PropTypes.object,
}

// PageWarpper.childContextTypes = {
//   showSpinner: PropTypes.func,
//   hideHud: PropTypes.func
// }
