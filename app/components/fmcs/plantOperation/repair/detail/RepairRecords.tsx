import React from "react";
import {Image, Pressable, StyleSheet, Text, TextInput, View} from "react-native";
import Colors from "../../../../../utils/const/Colors";
import {RepairDetailItemType, RepairStatus} from "../../defined/ConstDefined";
import {ExpandHeader, ExpandHeaderProps} from "../../components/ExpandHeader";

export interface RepairRecordsProps extends ExpandHeaderProps {
    sectionType?: RepairDetailItemType,///当前section 类型
    repairStatus?: RepairStatus,///维修记录状态
    records?: RepairRecords[];///维修记录
    canEdit?: boolean,  ///是否可编辑

    faultPhenomenonTextChange?: Function;///故障现象输入回调
    faultCauseTextChange?: Function;///故障原因 输入回调

    addRecordCallBack?: Function;    ///添加记录

    saveRecordCallBack?: Function;///保存记录点击
    cancelCallBack?: Function;  ///取消记录点击
    repairTaskTextChange?: Function;///维修项目文字变化
    repairRecordTextChange?: Function;  ///维修实施记录文字变化

    deleteCallBack?: Function;///删除点击
    editCallBack?: Function;///编辑点击

    faultPhenomenon?: string;///故障现象
    faultCause?: string;   ///故障原因
    ///某一条记录处在编辑中
    repairRecord?: {
        id?: string,    ///维修记录id
        title?: string,  ///维修项目名称
        content?: string,    ///维修项目实施记录
    }
}

export interface RepairRecords {
    id?: string,
    taskId?: string,
    title?: string,     ///记录标题
    content?: string, ///记录内容
    isEdit?: boolean,   ///当前是否是编辑态

}

/**
 * 维修详情 维修记录
 * @param itemObj
 * @constructor
 */
export function RepairRecords(itemObj: RepairRecordsProps) {

    /**
     * 渲染输入框
     */
    const renderTextInput = (textChange?: Function, defaultValue?: string, inputHeight: number = 80,) => {
        if (itemObj.canEdit && (itemObj.repairStatus == RepairStatus.addHasRecordsHasInput || itemObj.repairStatus == RepairStatus.addNoRecords)) {
            return (
                <TextInput placeholder={'请输入'}
                           onChangeText={(text) => {
                               textChange && textChange(text)
                           }}
                           defaultValue={defaultValue}
                           maxLength={100}
                           style={[styles.inputText, {height: inputHeight}]}/>
            )
        } else {
            return (
                <Text style={{fontSize: 14, color: Colors.text.primary, marginTop: 12, marginBottom: 12}}>{defaultValue}</Text>
            )
        }

    }
    /**
     * 维修记录展示
     */
    const renderRepairRecords = () => {
        if (itemObj.repairStatus != RepairStatus.view) {
            return (
                <View style={styles.errorContainer}>
                    <View>
                        <Text style={styles.titleText}>故障现象</Text>
                        {renderTextInput((text: string) => {
                            itemObj.faultPhenomenonTextChange && itemObj.faultPhenomenonTextChange(text);
                        }, itemObj.faultPhenomenon)}
                    </View>
                    <View>
                        <Text style={styles.titleText}>故障原因</Text>
                        {renderTextInput((text: string) => {
                            itemObj.faultCauseTextChange && itemObj.faultCauseTextChange(text);
                        }, itemObj.faultCause)}
                    </View>
                    <View style={styles.repairRecordsContainer}>
                        <Text style={styles.repairRecordsText}>维修记录</Text>
                        <Pressable style={styles.addPressAble} onPress={() => {
                            itemObj.addRecordCallBack && itemObj.addRecordCallBack();
                        }}>
                            <Text style={styles.addText}>添加</Text>
                        </Pressable>
                    </View>
                    {renderRepairRecordsContent()}
                </View>
            )
        } else {
            ///查看
            return renderReviewRepairRecord();
        }

    }

    /**
     * 查看维修记录
     */
    const renderReviewRepairRecord = () => {
        return (
            <View style={{paddingLeft: 15, paddingRight: 15}}>
                {renderRecords('故障现象', itemObj.faultPhenomenon)}
                {renderRecords('故障原因', itemObj.faultCause)}
                <Text style={[styles.repairRecordsText, {marginTop: 12, marginBottom: 10}]}>维修记录</Text>
                {
                    itemObj.records?.map((record, index) => {
                        return renderRecords(record.title, record.content, (index == itemObj.records!.length - 1));
                    })
                }
            </View>
        )
    }

    const renderRecords = (title?: string, value?: string, isLast?: boolean) => {
        return (
            <View key={(title ?? '-') + (value ?? '')}
                  style={{backgroundColor: 'white', paddingTop: 15, paddingBottom: 15}}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={{fontSize: 13, color: Colors.text.light}}>{title}</Text>
                    {/*<Pressable style={{marginLeft: 80}}>*/}
                    {/*    <Text style={styles.underlineText}>查看明细</Text>*/}
                    {/*</Pressable>*/}
                </View>
                <Text style={{fontSize: 13, color: Colors.text.primary, marginTop: 15}}>{(value ?? '-')}</Text>
                {
                    !isLast && <View style={{
                        position: 'absolute',
                        bottom: 0,
                        height: 1,
                        backgroundColor: Colors.gray.primary
                    }}/>
                }
            </View>
        )
    }

    /**
     * 维修记录内容
     */
    const renderRepairRecordsContent = () => {

        if (itemObj.repairStatus == RepairStatus.initial) {
            return (
                <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 12, marginBottom: 10}}>
                    <Image source={require('../../../../../images/aaxiot/plantOperation/repair/repair_edit.png')}/>
                    <Text style={{
                        fontSize: 13,
                        color: Colors.text.primary,
                        marginLeft: 12
                    }}>您还没有实施记录,请点击添加按钮</Text>
                </View>
            )
        }
        const {records, repairRecord} = itemObj;
        return (
            <View>
                {
                    records?.map((record, index) => {
                        return renderRecordEdit(record, index == records!.length - 1);
                    })
                }
                {
                    (itemObj.repairStatus == RepairStatus.addHasRecordsHasInput || itemObj.repairStatus == RepairStatus.addNoRecords) &&
                    <>
                        <View style={{marginTop: 15}}>
                            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                                <Text style={styles.titleText}>维修项目</Text>
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    flex: 1,
                                    justifyContent: 'flex-end'
                                }}>
                                    <Pressable style={{paddingLeft: 5, paddingRight: 5}}
                                               onPress={() => {
                                                   itemObj.saveRecordCallBack && itemObj.saveRecordCallBack()
                                               }}>
                                        <Text style={styles.underlineText}>保存</Text>
                                    </Pressable>
                                    <Pressable style={{paddingLeft: 5, paddingRight: 5}}
                                               onPress={() => {
                                                   itemObj.cancelCallBack && itemObj.cancelCallBack(repairRecord?.id)
                                               }}>
                                        <Text style={styles.underlineText}>取消</Text>
                                    </Pressable>
                                </View>
                            </View>

                            {renderTextInput((text: string) => {
                                itemObj.repairTaskTextChange && itemObj.repairTaskTextChange(text, repairRecord?.id);
                            }, repairRecord?.title, 40)}
                        </View>
                        <View>
                            <Text style={styles.titleText}>维修实施记录</Text>
                            {renderTextInput((text: string) => {
                                itemObj.repairRecordTextChange && itemObj.repairRecordTextChange(text, repairRecord?.id);
                            }, repairRecord?.content, 50)}
                        </View>
                    </>
                }
            </View>
        )
    }

    const renderRecordEdit = (record: RepairRecords, isLast: boolean) => {
        return (
            <View key={record.content} style={{
                paddingTop: 12,
                paddingBottom: 12,
                borderBottomWidth: isLast ? 0 : 1,
                borderBottomColor: isLast ? Colors.white : Colors.gray.primary
            }}>
                <Text style={{fontSize: 13, color: Colors.text.light}}>{record.title}</Text>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', flex: 1, marginTop: 5}}>
                    <Text style={{fontSize: 13, color: Colors.text.primary, flex: 3.5, lineHeight: 18}}
                          numberOfLines={2}>{record.content}</Text>
                    <View style={{flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end'}}>
                        <Pressable style={{paddingLeft: 5, paddingRight: 5}}
                                   onPress={() => {
                                       itemObj.editCallBack && itemObj.editCallBack(record.id);
                                   }}>
                            <Image source={require('../../../../../images/aaxiot/plantOperation/repair/edit.png')}/>
                        </Pressable>
                        <Pressable style={{paddingLeft: 5, paddingRight: 5}}
                                   onPress={() => {
                                       itemObj.deleteCallBack && itemObj.deleteCallBack(record.id);
                                   }}>
                            <Text style={styles.underlineText}>删除</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        )
    }


    return (
        <ExpandHeader {...itemObj} content={renderRepairRecords()}/>
    )
}

const styles = StyleSheet.create({
    errorContainer: {
        paddingLeft: 15,
        paddingRight: 15
    },
    errorText: {
        fontSize: 13,
        color: Colors.text.light
    },

    titleText: {
        fontSize: 13,
        color: Colors.text.sub
    },
    inputText: {
        fontSize: 13,
        color: Colors.text.primary,
        borderWidth: 1,
        borderColor: Colors.border,
        height: 80,
        textAlignVertical: 'top',
        marginTop: 15,
        marginBottom: 15,
        borderRadius: 2,
    },

    repairRecordsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    repairRecordsText: {
        fontSize: 15,
        color: Colors.text.primary,
        fontWeight: 'bold',
    },
    addPressAble: {
        backgroundColor: Colors.theme,
        width: 68,
        height: 28,
        marginLeft: 20,
        borderRadius: 2,
        alignItems: 'center',
        justifyContent: 'center'
    },
    addText: {
        fontSize: 14,
        color: Colors.white,
        fontWeight: 'bold',
    },

    underlineText: {
        textDecorationLine: 'underline',
        fontSize: 13,
        color: Colors.theme,
        fontWeight: 'bold'
    }
})
