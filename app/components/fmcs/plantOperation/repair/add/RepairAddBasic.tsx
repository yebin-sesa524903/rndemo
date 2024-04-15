import React from "react";

import {Image, Pressable, Text, TextInput, View} from 'react-native';
import Colors from "../../../../../utils/const/Colors";
import {RepairAddRowType, RepairDetailItemType} from "../../defined/ConstDefined";
import {isEmptyString, screenWidth} from "../../../../../utils/const/Consts";
import {ExpandHeader, ExpandHeaderProps} from "../../components/ExpandHeader";
// @ts-ignore
import ModalDropdown from "react-native-modal-dropdown";

export interface RepairAddBasicProps extends ExpandHeaderProps {

    sectionType: RepairDetailItemType,
    data: RepairAddBasicData[]

    dropdownOnSelect?: Function,    ///下拉选择框点选
    orderNameTextChange?: Function, ///工单名称输入变化
    faultDesTextChange?: Function,///故障描述输入变化

    actionCallBack?: Function,
}

export interface RepairAddBasicData {
    isRequire?: boolean, ///是否必须
    canEdit?: boolean,  ///是否可编辑
    rowType?: RepairAddRowType, ///类型
    title: string,
    value?: string,
    placeholder?: string,
    dropdownOptions?: { title?: number, id?: string }[],
    dropdownRef?: any,
}


export function RepairAddBasic(props: RepairAddBasicProps) {

    const renderItem = (item: RepairAddBasicData) => {
        const {rowType, title, canEdit, isRequire, placeholder, value} = item;
        if (rowType == RepairAddRowType.faultDescription) {
            return renderRemark(item);
        }
        let selectRowValue = value;
        let textColor = Colors.text.primary;
        if (!isEmptyString(placeholder) && isEmptyString(value)) {
            selectRowValue = placeholder;
            textColor = Colors.text.light
        }
        return (
            <Pressable key={title}
                       disabled={!canEdit}
                       onPress={() => {
                           if (item.rowType == RepairAddRowType.device || item.rowType == RepairAddRowType.relateOrderNo) {
                               props.actionCallBack && props.actionCallBack(item.rowType);
                           }
                       }}
                       style={{
                           flex: 1,
                           padding: 15,
                           paddingTop: rowType == RepairAddRowType.orderName ? 5: 15,
                           paddingBottom: rowType == RepairAddRowType.orderName ? 5 : 15,
                           flexDirection: 'row',
                           alignItems: 'center',
                           justifyContent: 'space-between'
                       }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flex: 1,
                }}>
                    <Text style={{fontSize: 12, color: isRequire ? 'red' : Colors.white}}>*</Text>
                    <Text style={{
                        width: 100,
                        fontSize: 14,
                        color: Colors.text.primary,
                        fontWeight: '500',
                    }}>{title}</Text>
                    {
                        renderDropdown(item, selectRowValue, textColor)
                    }
                </View>
                {(canEdit && rowType != RepairAddRowType.orderNo && rowType != RepairAddRowType.orderName) &&
                    <Image
                        source={require('../../../../../images/aaxiot/airBottle/arrow_right.png')}
                        style={{marginRight: 8}}/>
                }
                <View style={{
                    position: 'absolute',
                    left: 20,
                    right: 20,
                    bottom: 0,
                    height: 0.5,
                    backgroundColor: Colors.gray.primary
                }}/>
            </Pressable>
        )
    }

    const renderDropdown = (item: RepairAddBasicData, selectRowValue?: string, textColor?: any) => {
        if (item.rowType == RepairAddRowType.orderName) {
            return (
                <View style={{flex: 1, height: 36}}>
                    <TextInput placeholder={item.placeholder}
                               defaultValue={item.canEdit ? (item.value || '') : item.value}
                               editable={item.canEdit}
                               maxLength={50}
                               style={{marginLeft: 20, padding: 8, flex: 1, fontSize: 14, color: Colors.text.primary}}
                               onChangeText={(text) => {
                                   props.orderNameTextChange && props.orderNameTextChange(text);
                               }}/>
                </View>

            )
        } else if (item.rowType == RepairAddRowType.department ||
            item.rowType == RepairAddRowType.system ||
            item.rowType == RepairAddRowType.repairType ||
            item.rowType == RepairAddRowType.repairSource) {
            return (
                <ModalDropdown ref={item.dropdownRef}
                               options={item.dropdownOptions}
                               style={{
                                   marginLeft: 25,
                                   flex: 1,
                               }}
                               textStyle={{fontSize: 14, color: Colors.text.primary, flex: 1}}
                               dropdownTextStyle={{fontSize: 14, color: Colors.text.primary}}
                               dropdownStyle={{
                                   height: ((item.dropdownOptions?.length ?? 0) < 6 ? (item.dropdownOptions?.length ?? 0) : 6) * 44
                               }}
                               adjustFrame={(position: any) => {
                                   return {
                                       top: (position.top ?? 0) - 12,
                                       left: position.left,
                                       right: position.right
                                   }
                               }}
                               renderRow={(option: any, index: number, isSelected: boolean) => {
                                   return (
                                       <Pressable onPress={() => {
                                           props.dropdownOnSelect && props.dropdownOnSelect(option, item.rowType);
                                       }}
                                                  style={{
                                                      height: 44,
                                                      width: screenWidth() - 100 - 20 - 50,
                                                      flexDirection: 'row',
                                                      alignItems: 'center',
                                                      paddingLeft: 8,
                                                      paddingRight: 8,
                                                      backgroundColor: Colors.background.primary
                                                  }}>
                                           <Text style={{
                                               fontSize: 14,
                                               color: isSelected ? Colors.text.primary : Colors.text.light,
                                           }}>{option.title}</Text>
                                       </Pressable>
                                   )
                               }}
                               defaultValue={selectRowValue}
                               defaultTextStyle={{fontSize: 14, color: textColor}}
                               dropdownListProps={{ListHeaderComponent: <></>}}
                />
            )
        } else {
            return (
                <Text style={{
                    fontSize: 14,
                    color: textColor,
                    marginLeft: 25,
                    flex: 1,
                }}>{selectRowValue}</Text>
            )
        }

    }

    /**
     *  备注item
     * @param data
     */
    const renderRemark = (data: RepairAddBasicData) => {
        const {title, canEdit, value, placeholder, isRequire} = data
        return (
            <View key={title}
                  style={{padding: 15}}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={{fontSize: 12, color: isRequire ? 'red' : Colors.white}}>*</Text>
                    <Text style={{fontSize: 14, color: Colors.text.primary}}>{title}</Text>
                </View>

                <TextInput style={{
                    borderWidth: canEdit ? 1 : 0,
                    height: 80,
                    marginTop: 20,
                    borderColor: Colors.border,
                    paddingLeft: 10,
                    paddingRight: 10,
                    color: Colors.text.primary,
                    textAlignVertical: 'top',
                }}
                           defaultValue={value}
                           editable={canEdit}
                           multiline={true}
                           maxLength={300}
                           onChangeText={(text) => {
                               props.faultDesTextChange && props.faultDesTextChange(text);
                           }}
                           placeholder={placeholder}/>
            </View>
        )
    }

    return (
        <ExpandHeader {...props} content={
            <View style={{borderRadius: 5,}}>
                {props.data.map((obj, index: number) => {
                    return renderItem(obj);
                })}
            </View>
        }/>
    )
}
