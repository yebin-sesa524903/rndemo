import React from "react";
import {Image, Pressable, StyleSheet, Text, TextInput, View,} from 'react-native';
import {ConsumablesDetailItemType, ConsumablesReplacementStatus, ConsumablesStatus} from "../../defined/ConstDefined";
import Colors from "../../../../../utils/const/Colors";
import {isEmptyString} from "../../../../../utils/const/Consts";

export interface ConsumablesReplacementProps {
    icon?: any,
    title?: string,
    canEdit?: boolean,
    sectionType?: ConsumablesDetailItemType,///类型
    status?: ConsumablesStatus,///当前耗材状态, 控制是否能添加.是否能生成备件出库单
    data?: ConsumablesReplacementData[],

    onPressCreationOutbound?: Function, ///生成备件出库单
    onPressAdd?: Function,

    textOnChange?: Function,
    editCallBack?: Function,
    deleteCallBack?: Function,

    saveRecordCallBack?: Function,
    cancelCallBack?: Function,

}

export interface ConsumablesReplacementData {
    id?: number,
    ticketId: number,
    name?: string,
    code?: string,
    inputStatus?: ConsumablesReplacementStatus,
    quantity?: string,
    inputPlaceholder?: string,
}

/**
 * 耗材更换 清单 item
 * @constructor
 */
export function ConsumablesReplacement(props: ConsumablesReplacementProps) {

    const renderListItem = (itemObj: ConsumablesReplacementData) => {
        let defaultValue = '';
        let quantity = String(itemObj.quantity);
        if (!isEmptyString(quantity)) {
            defaultValue = quantity;
        }
        return (
            <View key={itemObj.id}
                  style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 6,
                      flex: 1,
                  }}>
                <View style={{flexDirection: 'row', alignItems: 'center', flex: 3}}>
                    <Text style={{fontSize: 14, color: Colors.text.primary, flex: 1}}>{itemObj.name}</Text>
                    <Text style={{fontSize: 14, color: Colors.text.light, marginLeft: 8, flex: 1}}>{itemObj.code}</Text>
                </View>
                {
                    itemObj.inputStatus == ConsumablesReplacementStatus.edit ?
                        <TextInput keyboardType={'numeric'}
                                   style={{
                                       flex: 1,
                                       color: Colors.text.primary,
                                       borderRadius: 2,
                                       borderWidth: itemObj.inputStatus == ConsumablesReplacementStatus.edit ? 1 : 0,
                                       borderColor: Colors.border,
                                       width: 82,
                                       height: 38,
                                   }}
                                   editable={props.canEdit}
                                   placeholder={itemObj.inputPlaceholder}
                                   defaultValue={defaultValue}
                                   onChangeText={(text) => {
                                       props.textOnChange && props.textOnChange(text, itemObj);
                                   }}
                        />
                        :
                        <Text style={{fontSize: 13, color: Colors.text.primary, flex: 1}}>{defaultValue}</Text>
                }

                {renderActionView(itemObj)}
            </View>
        )
    }

    const renderActionView = (itemObj: ConsumablesReplacementData) => {
        if (!props.canEdit) {
            return <></>
        }
        if (itemObj.inputStatus == ConsumablesReplacementStatus.preview) {
            return <View style={{width: 80}}/>;
        }
        if (itemObj.inputStatus == ConsumablesReplacementStatus.initial) {
            return (
                <View style={{flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end'}}>
                    <Pressable style={{paddingLeft: 5, paddingRight: 5}}
                               onPress={() => {
                                   props.editCallBack && props.editCallBack(itemObj);
                               }}>
                        <Image source={require('../../../../../images/aaxiot/plantOperation/repair/edit.png')}/>
                    </Pressable>
                    <Pressable style={{paddingLeft: 5, paddingRight: 5}}
                               onPress={() => {
                                   props.deleteCallBack && props.deleteCallBack(itemObj);
                               }}>
                        <Text style={styles.underlineText}>删除</Text>
                    </Pressable>
                </View>
            )
        } else if (itemObj.inputStatus == ConsumablesReplacementStatus.edit) {
            return (
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flex: 1,
                    justifyContent: 'flex-end'
                }}>
                    <Pressable style={{paddingLeft: 5, paddingRight: 5}}
                               onPress={() => {
                                   props.saveRecordCallBack && props.saveRecordCallBack(itemObj)
                               }}>
                        <Text style={styles.underlineText}>保存</Text>
                    </Pressable>
                    <Pressable style={{paddingLeft: 5, paddingRight: 5}}
                               onPress={() => {
                                   props.cancelCallBack && props.cancelCallBack(itemObj)
                               }}>
                        <Text style={styles.underlineText}>取消</Text>
                    </Pressable>
                </View>
            )
        }
    }

    return (
        <View style={{borderRadius: 5, backgroundColor: 'white', marginLeft: 10, marginRight: 10, marginTop: 12, paddingBottom: 10}}>
            <View style={{
                flexDirection: 'row',
                height: 44,
                paddingLeft: 15,
                paddingRight: 15,
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Image source={props.icon} style={{width: 15, height: 15, marginRight: 6}}/>
                    <Text style={{fontWeight: 'bold', fontSize: 15, color: Colors.text.primary}}>{props.title}</Text>
                </View>
                {/*{*/}
                {/*    props.canEdit &&*/}
                {/*    <Pressable style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}*/}
                {/*               onPress={() => {*/}
                {/*                   props.onPressCreationOutbound && props.onPressCreationOutbound();*/}
                {/*               }}>*/}
                {/*        <Image source={require('../../../../../images/aaxiot/consumables/shengchengchukudan.png')}/>*/}
                {/*        <Text style={{*/}
                {/*            fontSize: 14,*/}
                {/*            color: Colors.theme,*/}
                {/*            fontWeight: 'bold',*/}
                {/*            marginLeft: 5*/}
                {/*        }}>生成备件出库单</Text>*/}
                {/*    </Pressable>*/}
                {/*}*/}
            </View>
            {
                props.canEdit &&
                <Pressable style={{
                    width: 68,
                    height: 28,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: Colors.theme,
                    borderRadius: 2,
                    marginBottom: 5,
                    marginLeft: 15,
                }}
                           onPress={() => {
                               props.onPressAdd && props.onPressAdd()
                           }}>
                    <Text style={{fontSize: 14, color: Colors.white, fontWeight: 'bold'}}>添加</Text>
                </Pressable>
            }

            <View style={{borderRadius: 5, paddingLeft: 15, paddingRight: 15}}>
                {props.data && props.data.map((obj, index: number) => {
                    return renderListItem(obj)
                })}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 5,
        backgroundColor: Colors.white,
        marginLeft: 10,
        marginRight: 10,
        marginTop: 12
    },
    underlineText: {
        textDecorationLine: 'underline',
        fontSize: 13,
        color: Colors.theme,
        fontWeight: 'bold'
    }
})
