import React from "react";
import {Image, Pressable, StyleSheet, Text, TextInput, View} from "react-native";
import Colors from "../../../../../utils/const/Colors";
// @ts-ignore
import ModalDropdown from "react-native-modal-dropdown";
import {isEmptyString} from "../../../../../utils/const/Consts";
import {AbnormalDetailRecordStatus} from "../../defined/ConstDefined";

export interface AbnormalRecordItemProps {
    icon?: any,
    title?: string,
    showAdd: boolean,
    onPressAdd?: Function,
    taskResult?: string,///处理结果
    records?: AbnormalRecord[],

    onSelectDropdown?: Function,    ///下拉选择
    recordTextChange?: Function,///点检文字输入
    onPressEdit?: Function,
    onPressDelete?: Function,
    onPressSave?: Function,
    onPressCancel?: Function,
}

export interface AbnormalRecord {
    id?: number,
    taskId?: number,
    code?: string,
    comment?: string,
    recordStatus?: AbnormalDetailRecordStatus,
}


export function AbnormalRecordItem(props: AbnormalRecordItemProps) {

    /**
     * 处理结果展示
     */
    const renderRecordResult = () => {
        return (
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingLeft: 15,
                paddingRight: 15,
                justifyContent: 'space-between',
                marginBottom: 15,
                marginTop: 8,
            }}>
                <View style={{flexDirection: 'row', flex: 1,}}>
                    <Text style={{color: 'red'}}>*</Text>
                    <Text style={{color: Colors.text.primary, fontSize: 14}}>处理结果</Text>
                </View>
                <View style={{
                    flex: 3,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingRight: 12,
                }}>
                    <ModalDropdown style={{flex: 1}}
                                   disabled={!props.showAdd}
                                   options={['处理成功', '处理失败']}
                                   defaultValue={props.taskResult}
                                   defaultTextStyle={{fontSize: 14, color: Colors.text.light}}
                                   textStyle={{fontSize: 14, color: Colors.text.primary}}
                                   dropdownStyle={{
                                       height: 88,
                                       backgroundColor: Colors.background.light,
                                   }}
                                   dropdownTextStyle={{
                                       fontSize: 14,
                                       height: 44,
                                       color: Colors.text.primary
                                   }}
                                   adjustFrame={(position: any) => {
                                       return {
                                           top: (position.top ?? 0) - 10,
                                           left: position.left,
                                           right: position.right
                                       }
                                   }}
                                   onSelect={(index: number, option: any) => {
                                       props.onSelectDropdown && props.onSelectDropdown(option);
                                   }}
                                   dropdownListProps={{ListHeaderComponent: <></>}}/>
                    {props.showAdd &&
                        <Image source={require('../../../../../images/aaxiot/airBottle/arrow_right.png')}/>}
                </View>
            </View>
        )
    }

    const renderRecords = (itemObj: AbnormalRecord, index: number) => {
        return (
            <View key={(itemObj.id ?? '') + String(index)}
                  style={{flexDirection: 'row', alignItems: 'center', paddingTop: 12, paddingBottom: 12}}>
                <View style={{
                    backgroundColor: Colors.background.primary,
                    height: 1,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0
                }}/>
                <Text style={{fontSize: 14, color: Colors.text.primary, width: 80}}>{itemObj.code}</Text>
                {
                    (itemObj.recordStatus === AbnormalDetailRecordStatus.edit ||
                        itemObj.recordStatus === AbnormalDetailRecordStatus.preview) ?
                        <Text style={{flex: 1, fontSize: 14, color: Colors.text.primary}}>{itemObj.comment}</Text> :
                        <TextInput
                            style={{
                                fontSize: 14,
                                flex: 1,
                                padding: 5,
                                borderRadius: 3,
                                borderWidth: 1,
                                borderColor: Colors.border,
                                height: 34
                            }}
                            placeholder={'请输入'}
                            maxLength={100}
                            defaultValue={itemObj.comment}
                            onChangeText={(text) => {
                                props.recordTextChange && props.recordTextChange(text, itemObj)
                            }}/>
                }
                {configActions(itemObj)}
            </View>
        )
    }

    const configActions = (itemObj: AbnormalRecord) => {
        if (itemObj.recordStatus == AbnormalDetailRecordStatus.preview) {
            return null;
        } else if (itemObj.recordStatus == AbnormalDetailRecordStatus.initial || itemObj.recordStatus == AbnormalDetailRecordStatus.editing) {
            ///初始态
            return (
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Pressable style={styles.pressStyle}
                               onPress={() => {
                                   props.onPressSave && props.onPressSave(itemObj);
                               }}>
                        <Text style={{
                            color: Colors.theme,
                            textDecorationLine: 'underline',
                            fontWeight: '500',
                            marginLeft: 20
                        }}>保存</Text>
                    </Pressable>
                    <Pressable style={styles.pressStyle}
                               onPress={() => {
                                   props.onPressCancel && props.onPressCancel(itemObj);
                               }}>
                        <Text style={{
                            color: Colors.theme,
                            textDecorationLine: 'underline',
                            marginLeft: 20
                        }}>取消</Text>
                    </Pressable>
                </View>
            )
        } else if (itemObj.recordStatus == AbnormalDetailRecordStatus.edit) {
            ///编辑态
            return (
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Pressable style={styles.pressStyle}
                               onPress={() => {
                                   props.onPressEdit && props.onPressEdit(itemObj);
                               }}>
                        <Image source={require('../../../../../images/aaxiot/airBottle/edit.png')}
                               style={{width: 14, height: 14, marginLeft: 30}}
                               resizeMode={'contain'}/>
                    </Pressable>
                    <Pressable style={styles.pressStyle}
                               onPress={() => {
                                   props.onPressDelete && props.onPressDelete(itemObj);
                               }}>
                        <Text style={{
                            color: Colors.theme,
                            textDecorationLine: 'underline',
                            marginLeft: 20
                        }}>删除</Text>
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
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Image source={props.icon} style={{width: 15, height: 15, marginRight: 6}}/>
                    <Text style={{fontWeight: 'bold', fontSize: 15, color: Colors.text.primary}}>{props.title}</Text>
                </View>
                {
                    props.showAdd &&
                    <Pressable style={{
                        width: 68,
                        height: 28,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: Colors.theme,
                        borderRadius: 3
                    }}
                               onPress={() => {
                                   let record = '0';
                                   if (props.records && props.records.length > 0){
                                       // @ts-ignore
                                       record = props.records[props.records.length - 1].code;
                                   }
                                   props.onPressAdd && props.onPressAdd(record);
                               }}>
                        <Text style={{fontSize: 14, color: Colors.white}}>添加</Text>
                    </Pressable>
                }
            </View>
            {renderRecordResult()}
            <View style={{
                paddingLeft: 15,
                paddingRight: 15,
            }}>
                {
                    props.records?.map((record, index) => {
                        return renderRecords(record, index);
                    })
                }
            </View>


        </View>
    )
}

const styles = StyleSheet.create({
    pressStyle: {
        paddingTop: 8,
        paddingBottom: 8,
        marginLeft: 8,
    }
})
