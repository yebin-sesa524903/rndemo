import React from "react";
import {Image, Pressable, Text, TextInput, View} from "react-native";
import {SpareOutStoreHouseItemType, SpareOutStoreStatus} from "../../defined/ConstDefined";
import Colors from "../../../../../utils/const/Colors";


export interface SpareOutStoreSpareMsgItemProps {
    icon?: any,
    title?: string,
    sectionType?: SpareOutStoreHouseItemType,
    data: SpareOutStoreSpareMsgData[],
    isWithdrawal?: boolean, ///是否退过库

    onPressAdd?: Function,  ///添加备件点击
    onPressWithdrawal?: Function,///退库点击
    onPressSave?: Function, ///保存点击
    onPressCancel?: Function,   ///取消点击
    onPressEdit?: Function, ///编辑点击
    onPressDelete?: Function,///删除点击
    onTextChange?: Function,///输入框文字变化
}

export interface SpareOutStoreSpareMsgData {
    id?: number,
    spareName?: string,///备件名
    code?: string,  ///备件编号
    inventory?: number, ///库存数量
    outStoreCount?: number,///出库数量
    withdrawalCount?: number,///退库数量
    spareOutStatus: SpareOutStoreStatus,  ///出库状态
}

export function SpareOutStoreSpareMsgItem(props: SpareOutStoreSpareMsgItemProps) {

    const renderSpareOutStoreItem = () => {
        return props.data.map((spareOutItem, index) => {
            return (
                <View key={spareOutItem.id}
                      style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingHorizontal: 15,
                          paddingVertical: 12
                      }}>
                    <View style={{flex: 1}}>
                        <Text style={{fontSize: 14, color: Colors.text.primary}}>{spareOutItem.spareName}</Text>
                        <Text style={{
                            fontSize: 13,
                            color: Colors.text.light,
                            marginTop: 8
                        }}>{props.isWithdrawal ? '出库/退库数量' : '库存/出库数量'}</Text>
                    </View>
                    {renderSpareOutContent(spareOutItem)}
                    {renderActionView(spareOutItem)}
                    <View style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        height: 0.5,
                        backgroundColor: '#eee'
                    }}/>
                </View>
            )
        })
    }

    const renderSpareOutContent = (spareOutItem: SpareOutStoreSpareMsgData) => {
        if (props.isWithdrawal) {
            return (
                <View style={{flex: 1}}>
                    <Text style={{fontSize: 14, color: Colors.text.primary}}>{spareOutItem.code}</Text>
                    <View style={{flexDirection: 'row', marginTop: 8, alignItems: 'center'}}>
                        <Text style={{
                            fontSize: 14,
                            color: Colors.text.primary
                        }}>{spareOutItem.outStoreCount}</Text>
                        {
                            spareOutItem.spareOutStatus == SpareOutStoreStatus.withdrawal ?
                                <Text style={{
                                    fontSize: 14,
                                    color: Colors.text.primary
                                }}>{'/' + spareOutItem.withdrawalCount}</Text>
                                :
                                <View style={{height: 34}}>
                                    <TextInput value={String(spareOutItem.withdrawalCount)}
                                               keyboardType={'numeric'}
                                               maxLength={10}
                                               onChangeText={(text) => {
                                                   const newText = text.replace(/[^\d]+/, '');
                                                   props.onTextChange && props.onTextChange(newText, spareOutItem)
                                               }}
                                               style={{
                                                   marginLeft: 6,
                                                   fontSize: 13,
                                                   width: 100,
                                                   padding: 8,
                                                   color: Colors.text.primary,
                                                   borderRadius: 2,
                                                   borderWidth: 1,
                                                   textAlignVertical: 'bottom',
                                                   borderColor: Colors.border,
                                               }}/>
                                </View>
                        }
                    </View>
                </View>
            )
        } else {
            return (
                <View style={{flex: 1}}>
                    <Text style={{fontSize: 14, color: Colors.text.primary}}>{spareOutItem.code}</Text>
                    <View style={{flexDirection: 'row', marginTop: 8, alignItems: 'center'}}>
                        <Text style={{
                            fontSize: 14,
                            color: Colors.text.primary
                        }}>{spareOutItem.inventory +  '/'}</Text>
                        {
                            spareOutItem.spareOutStatus == SpareOutStoreStatus.edit ?
                                <Text style={{
                                    fontSize: 14,
                                    color: Colors.text.primary
                                }}>{spareOutItem.outStoreCount}</Text>
                                :
                                <View style={{height: 34}}>
                                    <TextInput value={String(spareOutItem.outStoreCount)}
                                               keyboardType={'numeric'}
                                               maxLength={10}
                                               onChangeText={(text) => {
                                                   const newText = text.replace(/[^\d]+/, '');
                                                   props.onTextChange && props.onTextChange(newText, spareOutItem)
                                               }}
                                               style={{
                                                   marginLeft: 6,
                                                   fontSize: 13,
                                                   width: 100,
                                                   padding: 8,
                                                   color: Colors.text.primary,
                                                   borderRadius: 2,
                                                   borderWidth: 1,
                                                   textAlignVertical:'bottom',
                                                   borderColor: Colors.border,
                                               }}/>
                                </View>
                        }
                    </View>
                </View>
            )
        }
    }

    const renderActionView = (spareOutItem: SpareOutStoreSpareMsgData) => {
        if (spareOutItem.spareOutStatus == SpareOutStoreStatus.withdrawal) {
            return (
                <Pressable style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end'}}
                           onPress={() => {
                               props.onPressWithdrawal && props.onPressWithdrawal(spareOutItem);
                           }}>
                    <Text style={{fontSize: 14, color: Colors.theme, fontWeight: 'bold',}}>退库</Text>
                </Pressable>
            )
        } else if (spareOutItem.spareOutStatus == SpareOutStoreStatus.edit) {
            return (
                <View style={{flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end'}}>
                    <Pressable style={{paddingHorizontal: 10}}
                               onPress={() => {
                                   props.onPressEdit && props.onPressEdit(spareOutItem);
                               }}>
                        <Image source={require('../../../../../images/aaxiot/plantOperation/consumables/hc_edit.png')}/>
                    </Pressable>
                    <Pressable style={{paddingHorizontal: 10}}
                               onPress={() => {
                                   props.onPressDelete && props.onPressDelete(spareOutItem);
                               }}>
                        <Text style={{fontSize: 14, color: Colors.theme, fontWeight: 'bold'}}>删除</Text>
                    </Pressable>
                </View>
            )
        } else if (spareOutItem.spareOutStatus == SpareOutStoreStatus.editing) {
            return (
                <View style={{flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end'}}>
                    <Pressable style={{paddingHorizontal: 10}}
                               onPress={() => {
                                   props.onPressSave && props.onPressSave(spareOutItem);
                               }}>
                        <Text style={{fontSize: 14, color: Colors.theme, fontWeight: 'bold'}}>保存</Text>
                    </Pressable>
                    <Pressable style={{paddingHorizontal: 10}}
                               onPress={() => {
                                   props.onPressCancel && props.onPressCancel(spareOutItem, props.isWithdrawal ? SpareOutStoreStatus.withdrawal : SpareOutStoreStatus.edit);
                               }}>
                        <Text style={{fontSize: 14, color: Colors.theme, fontWeight: 'bold'}}>取消</Text>
                    </Pressable>
                </View>
            )
        }
    }

    return (
        <View style={{borderRadius: 5, backgroundColor: 'white', marginLeft: 10, marginRight: 10, marginTop: 12}}>
            <View style={{
                flexDirection: 'row',
                height: 44,
                paddingLeft: 15,
                paddingRight: 15,
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                    <Image source={props.icon} style={{width: 15, height: 15, marginRight: 6}}/>
                    <Text style={{
                        fontSize: 15,
                        color: Colors.text.primary,
                        fontWeight: 'bold',
                    }}>{props.title}</Text>
                </View>
                {
                    !props.isWithdrawal &&
                    <Pressable onPress={() => {
                        props.onPressAdd && props.onPressAdd();
                    }}
                               style={{
                                   backgroundColor: Colors.theme,
                                   width: 68,
                                   height: 28,
                                   borderRadius: 2,
                                   alignItems: 'center',
                                   justifyContent: 'center',
                               }}>
                        <Text style={{fontSize: 14, color: Colors.white, fontWeight: 'bold'}}>添加</Text>
                    </Pressable>
                }
            </View>
            {renderSpareOutStoreItem()}
        </View>
    )
}
