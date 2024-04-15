
'use strict';
import React,{Component} from 'react';

import {
  View,
  // Alert
} from 'react-native';
import PropTypes from 'prop-types';


// console.warn('ViewPager',ViewPager);

export default class ViewPager extends Component{
  constructor(props){
    super(props);
    this.state = {index:props.initialPage}
    this._cache={};
  }
  _renderPage(index){
    if(this._cache[index]){
      return this._cache[index];
    }
    var component = this.props.renderPage(index,this.state.index);
    if(component){
      this._cache[index] = component;
    }
    return component;
  }
  setPage(index){
    this.setState({index});
  }
  componentWillReceiveProps(nextProps) {
    if(nextProps.initialPage !== this.state.index){
      this.setState({index:nextProps.initialPage});
    }
  }
  render() {
    return (
      <View style={{flex:1,}}>
        {this._renderPage(this.state.index)}
      </View>
    );
  }
}

ViewPager.propTypes = {
  children:PropTypes.array,
  renderPage:PropTypes.func,
}
