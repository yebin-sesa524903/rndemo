import React,{Component} from "react";
import {View,Text,StyleSheet} from 'react-native';
import s from "../styles/commonStyle";
export class Table extends Component {

  constructor(props) {
    super(props);
    this.state={}
  }

  initRowAndCol(grid,change) {
    if(!grid) return;
    grid = grid.split(';');
    let rows = [];
    let len = 0;
    let cr = [];
    rows.push(cr)
    grid.forEach(str => {
      let d = Number(str);
      if(d>12) d = 12;
      if(len <= 12) {
        if(len + d > 12) {
          cr = [d];
          rows.push(cr);
          len = d;
        }else{
          cr.push(d)
          len += d;
        }
      }
    })
    return rows;
  }

  _renderTable(data) {
    let cellIndex = 0;
    let lastRow = data.length -1;
    let children = [];
      this.props.children.map(item => {
      if(Array.isArray(item)) return item.map(v => children.push(v))
      else children.push(item)
    })
    let rows = data.map((row,index) => {
      let cells = row.map((cell,ci) => {
        let vid = cellIndex;
        cellIndex++;
        return (
          <View key={ci} style={[{flex:cell},s.cel3]}>
            {children[vid]}
          </View>
        )
      })
      return (
        <View key={index} style={[s.r,index === lastRow ? s.cel:s.cel2]}>
          {cells}
        </View>
      )
    });
    return rows;
  }

  render() {
    let rows = this.initRowAndCol(this.props.grid);
    if(rows && rows.length>0) {
      return (
        <View style={[]}>
          {this._renderTable(rows)}
        </View>
      )
    }
    return null;

  }
}

