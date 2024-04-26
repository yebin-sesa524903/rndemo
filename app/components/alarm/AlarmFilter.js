
'use strict';
import React, { Component } from 'react';
import {
  View,

  StyleSheet,
  Text,
  Platform,
  DatePickerAndroid,
  DatePickerIOS,
  ScrollView, findNodeHandle, UIManager,
} from 'react-native';
import PropTypes from 'prop-types';
import ListView from 'deprecated-react-native-listview';
import Toolbar from '../Toolbar';
import StatableSelectorGroup from './StatableSelectorGroup';
import DateInputGroup from '../ticket/DateInputGroup';
import { GREEN, LIST_BG, GRAY, LINE } from '../../styles/color.js';
import Loading from '../Loading';
import Button from '../Button.js';
import Icon from '../Icon';
import TouchFeedback from '../TouchFeedback';
import moment from 'moment';
import { isPhoneX } from '../../utils'
import CommonActionSheet from '../actionsheet/CommonActionSheet';
import { DatePickerView, DatePicker } from '@ant-design/react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';
import immutable from "immutable";
import LettersIndexView from "../LettersIndexView";

let MarginTop = isPhoneX() ? 24 + 12 : 16;
if (Platform.OS === 'android') {
  MarginTop = 24;
}
let statusBarHeight = 28;
if (Platform.OS === 'ios') {
  statusBarHeight = 20;
  if (isPhoneX()) {
    statusBarHeight = 40;
  }
}
let onLayout = undefined;
if (Platform.OS === 'android') onLayout = (e) => { };
export default class AlarmFilter extends Component {
  constructor(props) {
    super(props);
    var ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = { dataSource: ds.cloneWithRows([0, 1, 2, 3, 4]), date: new Date() };
  }
  _renderSeparator(sectionId, rowId) {
    return (
      <View key={rowId} style={styles.sepView}></View>
    )
  }

  //安卓日期选择
  async _showPicker(type) {
    if (Platform.OS === 'android') {
      try {
        var value = undefined;
        if (type === 'StartTime') {
          value = this.props.filter.get('StartTime') || undefined;
        } else if (type === 'EndTime') {
          value = this.props.filter.get('EndTime') || undefined;
        }
        var date = moment(value);
        var options = { date: date.toDate(), maxDate: new Date() };
        var { action, year, month, day } = await DatePickerAndroid.open(options);
        if (action !== DatePickerAndroid.dismissedAction) {
          var date = moment({ year, month, day, hour: 8 });//from timezone
          // console.warn('moment',date);
          // this.props.onChanged(type,date.toDate());
          this.props.filterChanged(type, date.toDate());
        }

      } catch ({ code, message }) {
      }
    }
  }

  _renderPickerView() {
    return (
      <DateTimePicker
        is24Hour={true}
        titleIOS={'选择日期'}
        headerTextIOS={'选择日期'}
        titleStyle={{ fontSize: 17, color: '#333' }}
        cancelTextIOS={'取消'}
        confirmTextIOS={'确定'}
        mode={'date'}
        maximumDate={new Date()}
        datePickerModeAndroid={'spinner'}
        date={this.state.date}
        onDateChange={(date) => {
          this._selectDate = date;
          this.setState({ date })
        }}
        isVisible={this.state.modalVisible}
        onConfirm={(date) => {
          this.setState({ modalVisible: false });
          this.props.filterChanged(this.state.type, date);
        }}
        onCancel={() => {
          this.setState({ modalVisible: false })
        }}
      />
    )

    // if( !this.state.modalVisible) return null;
    // return (
    //   <CommonActionSheet modalVisible={this.state.modalVisible}
    //     onCancel={()=>this.setState({modalVisible:false})}>
    //     <View style={{backgroundColor:'white'}}>
    //       <View style={{height:44,backgroundColor:'#f0f1f2',
    //         flexDirection:'row',alignItems:'center'}}>
    //         <TouchFeedback onPress={()=>this.setState({modalVisible:false})}>
    //           <Text style={{fontSize:17,paddingVertical:10,paddingHorizontal:16,color:'#017aff'}}>取消</Text>
    //         </TouchFeedback>
    //         <View style={{flex:1,alignItems:'center'}}>
    //           <Text style={{fontSize:17,color:'#333'}}>选择日期</Text>
    //         </View>
    //         <TouchFeedback onPress={()=>{
    //           this.setState({modalVisible:false});
    //           this.props.filterChanged(this.state.type,this._selectDate);
    //         }}>
    //           <Text style={{fontSize:17,paddingVertical:10,paddingHorizontal:16,color:'#017aff'}}>确定</Text>
    //         </TouchFeedback>
    //       </View>
    //       {/*<DatePickerIOS style={{borderTopWidth:1,borderColor:LINE}} date={new Date()} mode="date"*/}
    //        {/*maximumDate={new Date()} onDateChange={(date1)=>{*/}
    //           {/*this._selectDate=date1;*/}
    //          {/*}} />*/}
    //       <DatePickerView
    //         mode={'date'}
    //         maxDate={new Date()}
    //         value={this.state.date}
    //         onValueChange={(value,index)=>{
    //           // console.warn('value',value,'index',index);
    //         }}
    //         onChange={(date)=>{
    //           this._selectDate=date;
    //           this.setState({date})
    //         }}
    //       />
    //     </View>
    //   </CommonActionSheet>
    // )
  }

  _clickBeginTime(time) {
    let beginTime = this.props.filter.get('StartTime');
    if (beginTime) {
      beginTime = new Date(beginTime);
    } else {
      beginTime = new Date();
    }
    this.setState({ modalVisible: true, type: 'StartTime', date: beginTime });
  }

  _clickEndTime(time) {
    let endTime = this.props.filter.get('EndTime');
    if (endTime) {
      endTime = new Date(endTime);
    } else {
      endTime = new Date();
    }
    this.setState({ modalVisible: true, type: 'EndTime', date: endTime });
  }

  _renderDate(rid) {
    let beginTime = '开始时间';
    let beginColor = '#d0d0d0';
    if (this.props.filter.get('StartTime')) {
      beginColor = '#333';
      beginTime = moment(this.props.filter.get('StartTime')).format("YYYY-MM-DD")
    }
    let endTime = '结束时间';
    let endColor = '#d0d0d0';
    if (this.props.filter.get('EndTime')) {
      endColor = '#333';
      endTime = moment(this.props.filter.get('EndTime')).format("YYYY-MM-DD");
    }
    return (
      <View key={rid}>
        <Text numberOfLines={1} style={{ fontSize: 13, color: '#888' }}>
          时间（若不填写，则筛选范围为全部时间）
        </Text>
        <View style={{ flex: 1, flexDirection: 'row', height: 30, alignItems: 'center', marginTop: 10 }}>
          <TouchFeedback style={{ flex: 1 }} onPress={() => this._clickBeginTime()}>
            <View style={{
              flex: 1, borderColor: '#e6e6e6', height: 30, borderWidth: 1, borderRadius: 2,
              justifyContent: 'center', alignItems: 'center'
            }}>
              <Text style={{ fontSize: 13, color: beginColor }}>{beginTime}</Text>
            </View>
          </TouchFeedback>
          <View style={{ width: 8, height: 1, backgroundColor: '#d0d0d0', marginHorizontal: 10 }} />
          <TouchFeedback style={{ flex: 1 }} onPress={() => this._clickEndTime()}>
            <View style={{
              flex: 1, borderColor: '#e6e6e6', borderWidth: 1, height: 30, borderRadius: 2,
              justifyContent: 'center', alignItems: 'center'
            }}>
              <Text style={{ fontSize: 13, color: endColor }}>{endTime}</Text>
            </View>
          </TouchFeedback>
        </View>
      </View>
    )
  }

  _renderRow(rowData, sid, rid) {
    // console.warn('_renderRow');
    if (rowData === 0) {
      // return (
      //   <DateInputGroup
      //     title='时间'
      //     startTime={this.props.filter.get('StartTime')}
      //     endTime={this.props.filter.get('EndTime')}
      //     onChanged={(type,text)=>{
      //       this.props.filterChanged(type,text);
      //     }} />
      // );
      return this._renderDate(rid);
    } else if (rowData === 1) {
      // return (
      //   <StatableSelectorGroup
      //     title='状态'
      //     data={['未解除','已解除']}
      //     selectedIndexes={this.props.filter.get('status')}
      //     onChanged={(index)=>this.props.filterChanged('status',index)} />
      // );
      return null;
    }
    else if (rowData === 2) {
      return (
        <StatableSelectorGroup
          title='级别'
          key={rid}
          titleColor={'#888'}
          titleFontSize={13}
          fontSize={13}
          checkedBg={'#284e9822'}
          borderWidth={-1}
          unCheckedBg={'#f2f2f2'}
          checkedFontColor={GREEN}
          borderRadius={2}
          unCheckedFontColor={'#333'}
          data={['高级', '中级', '低级']}
          selectedIndexes={this.props.filter.get('level')}
          onChanged={(index) => this.props.filterChanged('level', index)} />
      );
    }
    else if (rowData === 3) {
      return (
        <StatableSelectorGroup
          title='类别'
          key={rid}
          data={this.props.codes}
          titleColor={'#888'}
          titleFontSize={13}
          fontSize={13}
          checkedBg={'#284e9822'}
          borderWidth={-1}
          unCheckedBg={'#f2f2f2'}
          checkedFontColor={GREEN}
          borderRadius={2}
          unCheckedFontColor={'#333'}
          selectedIndexes={this.props.filter.get('code')}
          onChanged={(index) => this.props.filterChanged('code', index)} />
      );
    }
    else if (rowData === 4) {
      if (!this.props.buildings || this.props.buildings.length === 0) {
        return null;
      }
      return this._showBuildingList(this.props.buildings, rid);
      // return (
      //   <StatableSelectorGroup
      //     title='建筑'
      //     data={this.props.buildings}
      //     selectedIndexes={this.props.filter.get('building')}
      //     onChanged={(index)=>this.props.filterChanged('building',index)} />
      // );
    }
    return null;

  }

  _buildGrup(group, index) {
    // console.warn('group',group.toJSON());
    let children = [];
    if (!group.get('isFolder')) {
      group.get('children').forEach((item, i) => {
        let icon = (
          <View style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 18, height: 18, borderColor: '#d9d9d9', borderWidth: 1, borderRadius: 9 }}>

            </View>
          </View>
        );
        if (this.props.filter.get('building').includes(item.get('Id'))) {
          icon = <Icon type='icon_select' size={20} color={GREEN} />
        }
        children.push(
          <View key={i} style={{ flex: 1, backgroundColor: 'white' }}>
            <TouchFeedback style={{ flex: 1 }} onPress={() => this.props.filterChanged('building', { index: item.get('Id'), name: item.get('Name') })}>
              <View style={{
                flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 14, height: 44,
                borderColor: LINE, borderBottomWidth: 0
              }}>
                {icon}
                <Text numberOfLines={1} style={{ color: '#333', fontSize: 13, flex: 1, marginLeft: 12 }}>{item.get('Name')}</Text>
              </View>
            </TouchFeedback>
          </View>
        )
      });
    }
    return (
      <View key={index}>
        <View style={{ flexDirection: 'row', height: 40, alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 13, color: '#333' }}>{group.get('CustomerName')}</Text>
          <TouchFeedback onPress={() => {
            this.props.buildingFolder(group.get('CustomerId'))
          }}>
            <View style={{ height: 30, width: 30, justifyContent: 'center', alignItems: 'center', marginRight: -8 }}>
              <Icon type={group.get('isFolder') ? "icon_arrow_up" : 'icon_arrow_down'} color="#888" size={13} />
            </View>
          </TouchFeedback>
        </View>
        {children}
      </View>
    )
  }

  _showBuildingList(buildings, rid) {
    let content = null;
    if (this.props.isFetching) {
      content = (
        <View style={{ marginTop: 100 }}>
          <Loading />
        </View>
      );
    } else {
      if (!this.props.buildings || this.props.buildings.length === 0) {
        content = null;
      } else {
        content = buildings.map((item, index) => {
          return this._buildGrup(item, index);
          // let icon=(
          //   <View style={{width:20,height:20,borderColor:'#d9d9d9',borderWidth:1,borderRadius:10}}></View>
          // );
          // if(this.props.filter.get('building').includes(index)){
          //   icon=<Icon type='icon_select' size={20} color={GREEN} />
          // }
          // return (
          //   <View key={index} style={{flex:1,backgroundColor:'white'}}>
          //     <TouchFeedback style={{flex:1}} onPress={()=>this.props.filterChanged('building',index)}>
          //       <View style={{flex:1,flexDirection:'row',alignItems:'center',marginRight:-30,paddingRight:30,
          //         paddingVertical:16,borderColor:LINE,borderBottomWidth:1}}>
          //         {icon}
          //         <Text numberOfLines={1} style={{color:'#333',fontSize:13,flex:1,marginLeft:12}}>{item}</Text>
          //       </View>
          //     </TouchFeedback>
          //   </View>
          // )
        })
      }
    }


    return (
      <View key={rid} style={{ marginBottom: 16, flex: 1, paddingHorizontal: 16 }}>
        <Text style={{ fontSize: 13, color: '#888' }}>建筑</Text>
        <View style={{ height: 1, backgroundColor: '#e6e6e6', marginVertical: 10, marginHorizontal: -16 }} />
        {content}
      </View>
    )
  }

  _buildBuilding2(title, items, index) {
    let children = [];
    let key_id = 'Id';
    let key_name = 'Name';
    items.forEach((item, i) => {
      let icon = (
        <View style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 18, height: 18, borderColor: '#d9d9d9', borderWidth: 1, borderRadius: 9 }}>

          </View>
        </View>
      );
      if (this.props.filter.get('building').includes(item.get(key_id))) {
        icon = <Icon type='icon_select' size={20} color={GREEN} />
      }
      // if(this.props.selectDatas.get('selectBuilds').includes(item.get(key_id))){
      //   icon=<Icon type='icon_select' size={20} color={GREEN} />
      // }
      children.push(
        <View key={i} style={{ flex: 1, backgroundColor: 'white' }}>
          <TouchFeedback style={{ flex: 1 }} onPress={() => this.props.filterChanged('building', { index: item.get('Id'), name: item.get('Name') })}>
            <View style={{
              flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 14, height: 44, marginRight: 32,
              borderColor: LINE, borderBottomWidth: 0
            }}>
              {icon}
              <Text numberOfLines={1} style={{ color: '#333', fontSize: 13, flex: 1, marginLeft: 12 }}>{item.get(key_name)}</Text>
            </View>
          </TouchFeedback>
        </View>
      )
    });
    this._layoutIndex.push(title);
    return (
      <View key={index}>
        <View onLayou={onLayout} ref={title} style={{ height: 30, backgroundColor: '#f2f2f2', justifyContent: 'center', paddingLeft: 16 }}>
          <Text style={{ color: '#888', fontSize: 13, }}>{title}</Text>
        </View>
        {children}
      </View>
    )
  }

  _showBuildingList2(buildings) {
    let content = null;
    if (this.props.isFetching) {
      content = (
        <View style={{ marginTop: 100 }}>
          <Loading />
        </View>
      );
    } else {
      if ((!this.props.buildings || this.props.buildings.length === 0)) {
        content = null;
      } else {
        content = buildings.map((item, index) => {
          return this._buildBuilding2(item.get('Name'), item.get('Children'), index);
        })
      }
    }
    return (
      <View>
        {content}
      </View>
    );
  }

  layout(ref) {
    const handle = findNodeHandle(ref);
    return new Promise((resolve) => {
      UIManager.measure(handle, (x, y, width, height, pageX, pageY) => {
        resolve({
          x,
          y,
          width,
          height,
          pageX,
          pageY
        });
      });
    });
  }

  async jumpToLetter(letter) {
    console.warn('jumpToLetter', letter);
    let ref = this.refs[letter];
    if (ref) {
      let size = await this.layout(ref);
      if (size.y !== 0) {
        this.refs.sv.scrollTo({ x: 0, y: size.y, animated: false });
      } else {
        let dy = this._y || 0;
        this.refs.sv.scrollTo({ x: 0, y: dy + size.pageY - statusBarHeight, animated: false });
      }
    }
  }

  componentWillReceiveProps(nextProps) {

    if (nextProps.filter !== this.props.filter) {
      var ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
      this.setState({
        dataSource: ds.cloneWithRows([0, 1, 2, 3, 4])
      });
    }
  }

  _getBottomButton() {
    return (
      <Bottom height={72} backgroundColor={'transparent'} borderColor={'transparent'}>
        <Button
          style={[styles.button, {
            backgroundColor: GREEN,
          }]}
          disabledStyle={[styles.button, {
            backgroundColor: GRAY,
          }]
          }
          textStyle={{
            fontSize: 18,
            color: '#ffffff',
            fontWeight: '500',
          }}
          disabled={false}
          text='应用筛选条件' onClick={this.props.doFilter} />
      </Bottom>
    );
  }

  _getBottom() {
    let toBottom = isPhoneX() ? 34 : 0;
    return (
      <View style={{ flexDirection: 'row', height: 57, borderTopColor: LINE, borderTopWidth: 1, marginBottom: toBottom }}>
        <TouchFeedback style={{ flex: 1 }} onPress={() => this.props.doReset()}>
          <View style={{ backgroundColor: 'white', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#666', fontSize: 16 }}>重置</Text>
          </View>
        </TouchFeedback>
        <TouchFeedback style={{ flex: 1 }} onPress={() => this.props.doFilter()}>
          <View style={{ backgroundColor: GREEN, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'white', fontSize: 16 }}>确定</Text>
          </View>
        </TouchFeedback>
      </View>
    );
  }

  render() {
    this._layoutIndex = ['time1', 'level1', 'type1'];
    var list = null
    // if(!this.props.isFetching || this.props.isFetching){
    list = (
      <View style={{ flex: 1 }}>
        {/*<ListView*/}
        {/*ref={(ref)=>this.mylist=ref}*/}
        {/*style={{flex:1,backgroundColor:'transparent'}}*/}
        {/*contentContainerStyle={{padding:16,backgroundColor:'transparent'}}*/}
        {/*dataSource={this.state.dataSource}*/}
        {/*renderSeparator={(sectionId, rowId, adjacentRowHighlighted)=> this._renderSeparator(sectionId,rowId)}*/}
        {/*renderRow={(rowData,sectionId,rowId) => this._renderRow(rowData,sectionId,rowId)}*/}
        {/*/>*/}
        <ScrollView style={{ flex: 1 }} ref="sv" onScroll={(event) => {
          this._y = event.nativeEvent.contentOffset.y;
        }}>
          <View style={{ padding: 16 }}>
            <View ref="时间" onLayout={onLayout}>
              {this._renderDate(0)}
            </View>
            <View style={{ height: 20 }} />
            <View ref="级别" onLayout={onLayout}>
              <StatableSelectorGroup
                title='级别'
                key={1}
                titleColor={'#888'}
                titleFontSize={13}
                fontSize={13}
                checkedBg={'#284e9822'}
                borderWidth={-1}
                unCheckedBg={'#f2f2f2'}
                checkedFontColor={GREEN}
                borderRadius={2}
                unCheckedFontColor={'#333'}
                data={['高级', '中级', '低级']}
                selectedIndexes={this.props.filter.get('level')}
                onChanged={(index) => this.props.filterChanged('level', index)} />
            </View>
            <View style={{ height: 20 }} />
            <View ref="类别" onLayout={onLayout}>
              <StatableSelectorGroup
                title='类别'
                key={2}
                data={this.props.codes}
                titleColor={'#888'}
                titleFontSize={13}
                fontSize={13}
                checkedBg={'#284e9822'}
                borderWidth={-1}
                unCheckedBg={'#f2f2f2'}
                checkedFontColor={GREEN}
                borderRadius={2}
                unCheckedFontColor={'#333'}
                selectedIndexes={this.props.filter.get('code')}
                onChanged={(index) => this.props.filterChanged('code', index)} />
            </View>

          </View>
          {this._showBuildingList2(this.props.buildings, 3)}
        </ScrollView>
        <View style={{
          position: 'absolute', top: 0, bototm: 0, right: 4,
          justifyContent: 'center', height: '100%'
        }}>
          <LettersIndexView special={['时间', '级别', '类别']} clickLetter={this.jumpToLetter.bind(this)} />
        </View>
        {this._getBottom()}
      </View>
    )
    // }
    // else {
    //   list = (<Loading />);
    // }
    return (
      <View style={{ flex: 1, backgroundColor: 'white', paddingTop: MarginTop }}>
        {/*<Toolbar*/}
        {/*title='报警筛选'*/}
        {/*navIcon="close"*/}
        {/*onIconClicked={this.props.onClose}*/}
        {/*actions={[{*/}
        {/*title:'重置',*/}
        {/*show: 'always', showWithText:true}]}*/}
        {/*onActionSelected={[this.props.doReset]}*/}
        {/*/>*/}
        {list}
        {this._renderPickerView()}
      </View>
    );
  }
}

AlarmFilter.propTypes = {
  filter: PropTypes.object,
  codes: PropTypes.array,
  rawCodes: PropTypes.object,
  buildings: PropTypes.any,
  doFilter: PropTypes.func.isRequired,
  doReset: PropTypes.func.isRequired,
  isFetching: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  filterChanged: PropTypes.func.isRequired,
}

var bottomHeight = 72;

var styles = StyleSheet.create({
  sepView: {
    height: 16,
    backgroundColor: 'transparent'
  },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
    height: bottomHeight,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  button: {
    // marginTop:20,
    height: 43,
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 6,

  }
});
