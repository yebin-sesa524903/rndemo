import React,{Component} from "react";
import CommonActionSheet from '../actionsheet/CommonActionSheet';
import {View, Text, ScrollView,} from 'react-native';
import s from "../../styles/commonStyle";
import {Table} from "../Table";
import {GREEN} from "../../styles/color";
import TouchFeedback from "../TouchFeedback";
import Scan from "../../containers/assets/Scan";
import Icon from "../Icon";

export default class ListModal extends Component{
  constructor(props) {
    super(props)
    let sel = null;
    if(props.multi) {
      sel = props.sel || []
    }
    this.state = {
      sel:[].concat(sel)
    }
  }

  _renderTitle() {
    return (
      <View style={[s.center,s.p16]}>
        <Text style={[s.f18]}>{this.props.title}</Text>
      </View>
    )
  }

  _renderVLine() {
    return (
      <View style={{width:1,backgroundColor:'#e6e6e6'}}/>
    )
  }

  _renderHLine() {
    return (
      <View style={{height:1,backgroundColor:'#e6e6e6'}}/>
    )
  }

  _findItem(item) {
    let findIndex = this.state.sel.findIndex(p => {
      if(typeof p === 'string') {
        return p === item
      }else {
        if(p.title) return p.title === item.title;
        if(p.name) return p.name === item.name;
        if(item.get && item.get('title')) return item.get('title') === p.get('title')
      }
      return false
    })
    return findIndex;
  }

  _renderItems() {
    if(this.props.items) {
      let items = this.props.items.map((item,index) => {
        let label = item;
        if(item.title) {
          label = item.title
        } else if(item.name) {
          label = item.name
        }else if(item.get && item.get('title')) {
          label = item.get('title');
        }
        let icon = null;
        if(this.props.multi && this._findItem(item) !== -1) {
          icon = <Icon type={'icon_check'} color={GREEN} size={16}/>
        }
        return (
          <TouchFeedback key={index} onPress={()=>{
            this.props.onItemClick(index);
            if(this.props.multi){
              let findIndex = this._findItem(item)
              if(findIndex === -1) this.state.sel.push(item)
              else this.state.sel.splice(findIndex,1);
              this.setState({})
            }
          }}>
            <View style={[s.mh16,s.pv16,s.r,{borderBottomWidth:1,borderBottomColor:'#e6e6e6'}]}>
              <Text style={[{color:'#333'},s.f]}>{label || ''}</Text>
              {icon}
            </View>
          </TouchFeedback>
        )
      })
      return items;
    }
    return null;
  }

  _renderInputItem() {
    if(!this.props.showInput) return;
    return (
      <TouchFeedback onPress={this.props.onInputClick}>
        <View style={[s.mh16,s.pv16,s.center,{borderBottomWidth:1,borderBottomColor:'#e6e6e6'}]}>
          <Text style={[{color:GREEN}]}>{'手动输入'}</Text>
        </View>
      </TouchFeedback>

    )
  }

  render() {
    if(this.props.show) {
      return (
        <CommonActionSheet modalVisible={this.props.show} onCancel={this.props.onCancel}>
          <View style={[{backgroundColor:'#fff',maxHeight:400}]}>
            {this._renderTitle()}
            {this._renderHLine()}
            {this._renderInputItem()}
            <ScrollView  showsVerticalScrollIndicator={false}>
              {this._renderItems()}
            </ScrollView>
          </View>
        </CommonActionSheet>
      )
    }
    return null;
  }
}
