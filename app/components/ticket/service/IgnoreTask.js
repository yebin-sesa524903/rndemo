import React,{Component} from "react";
import {View, Text, ScrollView, Alert,} from 'react-native';
import {GREEN, LIST_BG} from "../../../styles/color";
import Toolbar from "../../Toolbar";
import TouchFeedback from "../../TouchFeedback";
import trackApi from "../../../utils/trackApi";
import backHelper from "../../../utils/backHelper";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import Toast from "react-native-root-toast";

class IgnoreTask extends Component {

  static contextTypes = {
    showSpinner: PropTypes.func,
    hideHud: PropTypes.func
  }

  constructor(props) {
    super(props);
    this.state={
      data:props.data
    };
  }

  componentDidMount() {
    trackApi.onPageBegin(this.props.route.id);
    backHelper.init(this.props.navigator,this.props.route.id);
  }

  componentWillUnmount() {
    trackApi.onPageEnd(this.props.route.id);
    backHelper.destroy(this.props.route.id);
  }

  componentDidUpdate(prevProps, prevState , snapshot) {

    if(prevProps.isUpdating !== this.props.isUpdating ){
      if(this.props.isUpdating) {
        this.context.showSpinner();
      } else {
        this.context.hideHud();
        //需要判断失败的情况
        this.props.onBack();
      }
      return;
    }
  }

  _renderTask() {
    let taskViews = this.state.data.map((item,index) => {
      let ignore = item.isIgnore;

      return (
        <View key={index} style={{flexDirection:'row',marginLeft:16,paddingRight:16,height:56,alignItems:'center',
          borderBottomColor:'#f2f2f2',borderBottomWidth:1}}>
          <View style={{width:32,height:32,borderRadius:16,borderColor:ignore?'#d9d9d9':'#d9d9d9',borderWidth:1,
            alignItems:'center',justifyContent:'center',backgroundColor:ignore?'#f2f2f2':'#00000000'}}>
            <Text style={{fontSize:17,color:ignore?'#d9d9d9':'#d9d9d9'}}>{index+1}</Text>
          </View>
          <Text style={{flex:1,fontSize:17,color:ignore?'#c0c0c0':'#333',marginHorizontal:16,
            textDecorationLine:ignore?'line-through':'none'
          }}>{item.title}</Text>
          <TouchFeedback onPress={()=>{
            let obj = this.state.data;
            obj[index].isIgnore = !ignore;
            this.setState({data:obj});
          }}>
            <View style={{padding:10,marginRight:-16,paddingRight:16}}>
              <Text style={{fontSize:17,color:GREEN}}>{ignore ? '取消忽略':`忽略`}</Text>
            </View>

          </TouchFeedback>

        </View>
      )
    })
    return (
      <View style={{backgroundColor:'#fff',marginTop:10}}>
        <View style={{flexDirection:'row',justifyContent:'space-between',padding:16,}}>
          <Text style={{fontSize:17,color:'#333',fontWeight:'500'}}>巡检维护任务</Text>
        </View>
        <View style={{height:1,backgroundColor:'#f2f2f2'}}/>
        {taskViews}
      </View>
    )
  }

  _doSubmit() {
    //如果全部忽略，给出提示
    let hasItem = false;
    this.state.data.forEach(item => {
      if(!item.isIgnore){
        hasItem = true;
      }
    })
    if(!hasItem) {
      Alert.alert(
        '',
        `巡检任务不可全部忽略`,
        [
          {text: '知道了', onPress: () => {}},
        ]
      )
      return;
    }
    this.props.submit(this.state.data)
  }

  render() {
    return (
      <View style={{flex:1, backgroundColor:LIST_BG}}>
        <Toolbar
          title={'忽略任务项'}
          navIcon="back"
          noShadow={true}
          actions={[{title:'完成'}]}
          onActionSelected={[()=>this._doSubmit()]}
          onIconClicked={()=>this.props.onBack()}
        />
        <ScrollView style={{flex:1}} showsVerticalScrollIndicator={false}>
          {this._renderTask()}
        </ScrollView>
      </View>
    )
  }
}

function mapStateToProps(state,ownProps) {
  let serviceTicket = state.ticket.serviceTicket;
  return {
    isUpdating:serviceTicket.get('isUpdating')
  }
}

export default connect(mapStateToProps,{})(IgnoreTask);
