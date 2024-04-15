import React from "react";
import {Image, Pressable, Text, TextInput, View} from 'react-native';
import Colors from "../../../../../utils/const/Colors";
import {SpareOutStoreHouseItemType, SpareOutStoreRowType} from "../../defined/ConstDefined";
import {isEmptyString, screenWidth} from "../../../../../utils/const/Consts";
import {ExpandHeader, ExpandHeaderProps} from "../../components/ExpandHeader";
// @ts-ignore
import ModalDropdown from "react-native-modal-dropdown";

export interface SpareOutStoreAddBasicItemProps extends ExpandHeaderProps {
    sectionType: SpareOutStoreHouseItemType,
    data: SpareOutStoreAddBasicItemData[]

    dropdownOnSelect?: Function,    ///下拉选择框点选
    remarkTextChange?: Function,///备注输入变化
    actionCallBack?: Function,///行点击
}

export interface SpareOutStoreAddBasicItemData {
    isRequire?: boolean, ///是否必须
    canEdit?: boolean,  ///是否可编辑
    rowType?: SpareOutStoreRowType, ///类型
    title: string,
    value?: string,
    placeholder?: string,
    dropdownOptions?: { title?: number, id?: string }[],
    dropdownRef?: any,
}


export function SpareOutStoreAddBasicItem(props: SpareOutStoreAddBasicItemProps) {

    const renderItem = (item: SpareOutStoreAddBasicItemData) => {
        const {rowType, title, canEdit, isRequire, placeholder, value} = item;
        if (rowType == SpareOutStoreRowType.remark) {
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
                           if (item.rowType == SpareOutStoreRowType.device || item.rowType == SpareOutStoreRowType.relateOrderNo) {
                               props.actionCallBack && props.actionCallBack(item.rowType);
                           }
                       }}
                       style={{
                           paddingLeft: 15,
                           paddingRight: 15,
                           height: 44,
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
                {canEdit &&
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

    const renderDropdown = (item: SpareOutStoreAddBasicItemData, selectRowValue?: string, textColor?: any) => {
        if (item.rowType == SpareOutStoreRowType.class ||
            item.rowType == SpareOutStoreRowType.system ||
            item.rowType == SpareOutStoreRowType.use) {
            return (
                <ModalDropdown ref={item.dropdownRef}
                               options={item.dropdownOptions}
                               style={{
                                   marginLeft: 25,
                                   flex: 1,
                               }}
                               textStyle={{fontSize: 14, color: Colors.text.primary}}
                               dropdownTextStyle={{fontSize: 14, color: Colors.text.primary}}
                               dropdownStyle={{
                                   height: ((item.dropdownOptions?.length ?? 0) < 6 ? (item.dropdownOptions?.length ?? 0) : 6) * 44,
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
                                               color: isSelected ? Colors.text.primary : Colors.text.light
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
                    marginLeft: 25
                }}>{selectRowValue}</Text>
            )
        }

    }

    /**
     *  备注item
     * @param data
     */
    const renderRemark = (data: SpareOutStoreAddBasicItemData) => {
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
                    padding: 10,
                    color: Colors.text.primary,
                    textAlignVertical: 'top',
                }}
                           defaultValue={value}
                           editable={canEdit}
                           multiline={true}
                           maxLength={1000}
                           onChangeText={(text) => {
                               props.remarkTextChange && props.remarkTextChange(text);
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
