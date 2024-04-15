
'use strict';
import React,{Component} from 'react';
import {
  View,
  Text,
  StyleSheet, Image,
} from 'react-native';
import PropTypes from 'prop-types';
import ListView from 'deprecated-react-native-listview';
import Toolbar from '../Toolbar';
import s from '../../styles/commonStyle'
import List from '../List.js';
import PhotoThuNaiRow from './PhotoThuNaiRow.js';
import {checkFileNameIsImage} from "../../utils/fileHelper";
import TouchFeedback from "../TouchFeedback";
import NetworkText from "../ticket/NetworkText";

export default class SinglePhotosView extends Component{
  constructor(props){
    super(props);
    console.log('singlephotoview',props.data.toJS())
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = { dataSource:this.ds.cloneWithRows(props.data.toArray())};
  }
  _renderRow(rowData,sectionId,rowId){
    return (
      <PhotoThuNaiRow
        rowData={rowData}
        rowId={rowId}
        onRowClick={this.props.onRowClick} />
    );
  }
  _getToolbar(){
    return (
      <Toolbar
        title='资产文档'
        navIcon="back"
        onIconClicked={this.props.onBack}
        />
    );
  }

  _getImageByFileName(fileName) {
    if(checkFileNameIsImage(fileName)) return require('../../images/document_list/img.png')
    let ext = fileName.substring(fileName.lastIndexOf('.')+1).toLowerCase();
    if(ext === 'pdf') return require('../../images/document_list/pdf.png')
    if(ext === 'dwg') return require('../../images/document_list/dwg.png')
    if(ext === 'xlsx' || ext === 'xls') return require('../../images/document_list/excel.png')
    return require('../../images/building_default/building.png')
  }

  _renderDocumentList() {
    if(this.props.data && this.props.data.size > 0) {
      return this.props.data.map((item,index) => {
        if(checkFileNameIsImage(item.get('FileName'))) {
          return (
            <TouchFeedback key={index} style={{backgroundColor:'#fff'}} onPress={()=>{
              let realImgIndex = 0;
              this.props.data.find((img,imgIndex) => {
                if (imgIndex === index) return true;
                if(checkFileNameIsImage(img.get('FileName'))) realImgIndex++
                return false;
              })
              this.props.onRowClick(item,realImgIndex,{})
            }}>
              <View style={[s.r,s.p16,s.ac,{borderBottomColor:'#e6e6e6',borderBottomWidth:1,marginLeft:16,paddingLeft:0}]}>
                <Image style={{width:23,height:23}} source={this._getImageByFileName(item.get('FileName'))}/>
                <Text style={{fontSize:17,color:'#333',marginLeft:13,flex:1}}>{item.get('FileName')}</Text>
              </View>
            </TouchFeedback>
          )
        }else {
          let data = {name:item.get('FileName'),id:item.get('Id'),ossKey:item.get('PictureId'),size:0}
          return (
            <View style={[s.r,s.p16,s.ac,{borderBottomColor:'#e6e6e6',borderBottomWidth:1,marginLeft:16,paddingLeft:0}]}>
              <Image style={{width:23,height:23}} source={this._getImageByFileName(item.get('FileName'))}/>
              <NetworkText item={data} title={data.name} textStyle={{fontSize:17,color:'#333',marginLeft:13,flex:1}}></NetworkText>
            </View>
          )
        }
      })
    }else {
      return (
        <View style={[s.f,s.center]}>
          <Text style={{fontSize:18,color:'#666'}}>{'没有资产文档'}</Text>
        </View>
      )
    }
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.data !== this.props.data){
      this.setState({dataSource:this.ds.cloneWithRows(nextProps.data)})
    }
  }
  render() {
    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        {this._getToolbar()}
        {this._renderDocumentList()}
        {/*<List*/}
        {/*  contentContainerStyle={styles.listGridStyle}*/}
        {/*  isFetching={false}*/}
        {/*  listData={this.state.dataSource}*/}
        {/*  hasFilter={false}*/}
        {/*  currentPage={1}*/}
        {/*  totalPage={1}*/}
        {/*  emptyText='没有资产文档'*/}
        {/*  renderRow={(rowData,sectionId,rowId)=>this._renderRow(rowData,sectionId,rowId)}*/}
        {/*/>*/}
      </View>
    );
  }
}

SinglePhotosView.propTypes = {
  user:PropTypes.object,
  onRowClick:PropTypes.func.isRequired,
  data:PropTypes.object,
  onBack:PropTypes.func.isRequired,
}

var styles = StyleSheet.create({
  listGridStyle:{
    justifyContent:'flex-start',
    flexDirection:'row',
    flexWrap:'wrap'
  },
});
