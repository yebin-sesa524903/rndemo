import {ExpandHeader, ExpandHeaderProps} from "../../components/ExpandHeader";
import React from "react";
import {View, Text, Pressable} from "react-native";
import Colors from "../../../../../utils/const/Colors";
import {isEmptyString} from "../../../../../utils/const/Consts";
import HeaderSwitch from "../../../gasClass/airBottle/list/HeaderSwitch";


export interface InspectionRangeItemProps extends ExpandHeaderProps {
  canEdit?: boolean,  ///是否可编辑
  waiteRange?: InspectionRangeInterface,///待巡检 巡检项集合
  onPressWaitItem?: Function, ///待巡检 巡检项 项点击

  doneRange?: InspectionRangeInterface,///已完成 巡检项集合
  onPressDoneItem?: Function,///已完成巡检项点击

  rangeIndex?: number,  ///待巡检/已完成index
  onSwitchItem?: Function,  ///待巡检/已完成切换 点击
}

export interface InspectionRangeInterface {
  scenes: InspectionRangeItemData[],
  devices: InspectionRangeItemData[]
}

export interface InspectionRangeItemData {
  name: string,
  status: InspectionRangeStatus,
  deviceCode?: string,///设备编码
  deviceId?: number,

  sceneId?: number,
  code?: string, ///场景编码
  operatingStatus?: number, ///2:刷卡开始  1:直接开始
}

export enum InspectionRangeStatus {
  disable = 11222,  ///不可点击
  waiteInspect,///待巡检
  creditCard,///刷卡
  direct,///直接开始 未刷卡
}

/**
 * 巡检范围
 * @param props
 * @constructor
 */
export function InspectionRangeItem(props: InspectionRangeItemProps) {

  const renderInspectionContent = () => {
    return (
      <View style={{backgroundColor: 'white', borderRadius: 2}}>
        <HeaderSwitch onSwitchItem={(switchItem: any) => {
          props.onSwitchItem && props.onSwitchItem(switchItem);
        }}
                      selectedIndex={props.rangeIndex}
                      titles={[
                        {title: '待巡检', value: 0},
                        {title: '已完成', value: 1}]}/>
        <View style={{backgroundColor: Colors.gray.primary, height: 1, marginLeft: 10, marginRight: 10}}/>
        <View style={{flex: 1}}>
          {renderRangeList(props.rangeIndex == 0 ? props.waiteRange : props.doneRange, props.rangeIndex == 0 ? props.onPressWaitItem : props.onPressDoneItem)}
        </View>
      </View>
    )
  }

  const renderRangeList = (data?: InspectionRangeInterface, onPressCallBack?: Function) => {
    return (
      <View style={{paddingTop: 12, paddingBottom: 12}}>
        {renderItem('场景巡检', data?.scenes, onPressCallBack)}
        {renderItem('设备巡检', data?.devices, onPressCallBack)}
      </View>
    )
  }

  const renderItem = (title: string, data?: InspectionRangeItemData[], onPress?: Function) => {
    return (
      <View style={{flexWrap: 'wrap', flexDirection: 'row', alignItems: 'center'}}>
        <Text style={{
          fontSize: 14,
          color: Colors.text.primary,
          fontWeight: 'bold',
          marginLeft: 15,
          marginTop: 10
        }}>{title}</Text>
        {
          data?.map((obj, index: number) => {
            if (isEmptyString(obj.name)) {
              return null;
            }
            let backgroundColor = '#F7F7F7';
            let borderColor = '#BBBCC2';
            let textColor = Colors.text.sub;
            if (obj.status == InspectionRangeStatus.creditCard) {
              backgroundColor = '#e8f8f0';
              borderColor = '#a3e5c3';
              textColor = '#19be6b';
            } else if (obj.status == InspectionRangeStatus.direct) {
              backgroundColor = '#fffbe6';
              borderColor = '#fbce99';
              textColor = '#f78500';
            }

            return (
              <Pressable key={index}
                         disabled={!props.canEdit}
                         onPress={()=>{
                           onPress && onPress(obj)
                         }}
                         style={{
                           marginTop: 10,
                           marginLeft: 10,
                           marginBottom: 10,
                           borderWidth: 1,
                           borderColor: borderColor,
                           backgroundColor: backgroundColor,
                           paddingHorizontal: 12,
                           alignContent: 'center',
                           justifyContent: 'center',
                           height: 25,
                           borderRadius: 12.5
                         }}>
                <Text style={{fontSize: 12, color: textColor}}>{obj.name}</Text>
              </Pressable>
            )
          })
        }
      </View>
    )
  }

  return (
    <ExpandHeader {...props} content={renderInspectionContent()}/>
  )
}
