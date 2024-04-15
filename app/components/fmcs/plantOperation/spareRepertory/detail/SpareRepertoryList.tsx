import {IconFill} from "@ant-design/icons-react-native";
import React from "react";
import {FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from "react-native";
import HeaderSwitch from "../../../gasClass/airBottle/list/HeaderSwitch";
import {InventoryStatus, SpareRepertoryItemType} from "../../defined/ConstDefined";
import Colors from "../../../../../utils/const/Colors";
import {isEmptyString, screenHeight, screenWidth} from "../../../../../utils/const/Consts";
import EmptyView from "../../../../../utils/refreshList/EmptyView";

export interface SpareRepertoryListProps {
    scrollViewRef?: any,
    icon?: any,
    title?: string,
    sectionType?: SpareRepertoryItemType
    isExpand?: boolean,///是否展开 true 展开;  false 收起
    expandCallBack?: Function,
    canEdit?: boolean, ///是否可编辑
    showStart?: boolean,   ///是否展示开始盘点按钮

    waitData: SpareRepertoryDataProps[][],///待盘点集合
    doneData: SpareRepertoryDataProps[][],///已完成集合
    inventoryStatus?: InventoryStatus,   ///盘点状态
    inventoryIndex: number,///当前盘点 index

    onPressStart?: Function,///开始盘点点击
    onSwitchItem?: Function,///切换待盘点/已完成
    onResultTextChange?: Function,  ///盘点结果变化
    onPressSave?: Function,///保存按钮点击
    onPressCancel?: Function,///取消按钮点击
    onPressEdit?: Function,///编辑按钮点击
}

export interface SpareRepertoryDataProps {
    id?: number,
    inventoryId?: number,
    title?: string,
    content?: string,
    repertoryStatus?: SpareRepertoryStatus,///盘点状态
}

export enum SpareRepertoryStatus {
    initial = 34567, ///初始状态  只有保存按钮
    edit,///编辑态 已经有盘点值了,
    editing, ///编辑中状态,  保存/取消按钮
    preview,    ///预览态 没有按钮只能查看
}


export default function SpareRepertoryList(props: SpareRepertoryListProps) {
    const renderSpareRepertory = () => {
        return (
            <View style={{backgroundColor: 'white', borderRadius: 2}}>
                <HeaderSwitch onSwitchItem={(switchItem: any) => {
                    props.onSwitchItem && props.onSwitchItem(switchItem);
                }}
                              selectedIndex={props.inventoryIndex}
                              titles={[
                                  {title: '待盘点', value: 0},
                                  {title: '已完成', value: 1}]}/>
                <View style={{flex: 1, paddingHorizontal: 15}}>
                    {renderSpareList(props.inventoryIndex == 0 ? props.waitData : props.doneData, props.inventoryIndex == 1)}
                </View>
            </View>
        )
    }

    const renderSpareList = (data: SpareRepertoryDataProps[][], isComplete: boolean) => {
        return (
            <FlatList key={isComplete ? "1" : "2"}
                      data={data}
                      keyExtractor={(item, index) => String(item.length ?? '') + String(index)}
                      ListEmptyComponent={
                          <View style={{
                              flex: 1,
                              flexDirection: 'row',
                              paddingTop: screenHeight() * 0.125 - 20,
                              paddingBottom: screenHeight() * 0.125 - 20,
                              alignItems: 'center',
                              justifyContent: 'center'
                          }}>
                              <EmptyView/>
                          </View>}
                // @ts-ignore
                      renderItem={(item) => {
                          return renderSpareListItem(item.item, isComplete)
                      }}/>
        )
    }


    const renderSpareListItem = (item: SpareRepertoryDataProps[], isComplete: boolean) => {
        return item.map((itemObj, index) => {
            return renderItem(itemObj, index, isComplete)
        })
    }

    const renderItem = (item: SpareRepertoryDataProps, index: number, isComplete: boolean) => {
        if (item.id != undefined) {
            if (item.repertoryStatus && (item.repertoryStatus > 0) && index > 4) {
                if (item.repertoryStatus != SpareRepertoryStatus.preview && props.inventoryStatus != InventoryStatus.initial) {
                    return (
                        <View key={index}
                              style={{
                                  flex: 1,
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  height: 49,
                              }}>
                            <View style={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                top: 0,
                                height: 0.5,
                                backgroundColor: '#eee'
                            }}/>
                            <Text style={{fontSize: 13, color: Colors.text.light}}>操作</Text>
                            {renderActions(item, isComplete)}
                        </View>
                    )
                }
            } else {
                return (
                    <View key={index}
                          style={{flexDirection: 'row', flex: 1, alignItems: 'center', height: 49}}>
                        <View style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: 0,
                            height: 0.5,
                            backgroundColor: '#eee'
                        }}/>
                        <Text style={{
                            color: Colors.text.light,
                            fontSize: 14,
                            width: 100,
                        }}>{item.title}</Text>
                        {
                            (props.canEdit && props.inventoryStatus == InventoryStatus.inventorying) && (
                                item.repertoryStatus == SpareRepertoryStatus.editing ||
                                item.repertoryStatus == SpareRepertoryStatus.initial
                            ) ?
                                <TextInput keyboardType={'numeric'}
                                           value={isEmptyString(item.content) ? '' : item.content}
                                           placeholder={'请输入'}
                                           textAlignVertical={"center"}
                                           onChangeText={(text) => {
                                               const newText = text.replace(/[^\d]+/, '');
                                               props.onResultTextChange && props.onResultTextChange(newText, item.id, isComplete);
                                           }}
                                           style={{
                                               flex: 1,
                                               fontSize: 14,
                                               height: 36,
                                               color: Colors.text.primary,
                                               borderRadius: 2,
                                               borderWidth: 1,
                                               borderColor: Colors.border,
                                           }}/>
                                :
                                <Text style={{
                                    fontSize: 14,
                                    color: Colors.text.primary
                                }}>{isEmptyString(item.content) ? '-' : item.content}</Text>
                        }
                    </View>
                )
            }
        }
        return (
            <View key={index}
                  style={{height: 49, flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                <View style={{position: 'absolute', left: 0, right: 0, top: 0, height: 0.5, backgroundColor: '#eee'}}/>
                <Text style={{
                    color: index == 0 ? Colors.text.primary : Colors.text.light,
                    fontSize: 14,
                    fontWeight: '500',
                    width: 100
                }}>{item.title}</Text>
                <Text style={{color: '#333', fontSize: 14, fontWeight: '500'}}>{item.content}</Text>
            </View>
        )
    }

    /**
     * 操作按钮包裹内容
     * @param spareItem
     * @param isComplete
     */
    const renderActions = (spareItem: SpareRepertoryDataProps, isComplete: boolean) => {
        if (spareItem.repertoryStatus == SpareRepertoryStatus.initial) {
            return (
                <View style={styles.buttonContainer}>
                    <Pressable style={styles.cancelPress}
                               onPress={() => {
                                   props.onPressSave && props.onPressSave();
                               }}>
                        <Text style={{fontSize: 14, color: Colors.theme, fontWeight: 'bold'}}>保存</Text>
                    </Pressable>
                </View>
            )
        } else if (spareItem.repertoryStatus == SpareRepertoryStatus.edit) {
            return (
                <View style={styles.buttonContainer}>
                    <Pressable style={styles.cancelPress}
                               onPress={() => {
                                   props.onPressEdit && props.onPressEdit(spareItem.id, isComplete);
                               }}>
                        <Text style={{fontSize: 14, color: Colors.theme, fontWeight: 'bold'}}>编辑</Text>
                    </Pressable>
                </View>
            )
        } else if (spareItem.repertoryStatus == SpareRepertoryStatus.editing) {
            return (
                <View style={styles.buttonContainer}>
                    <Pressable style={styles.cancelPress}
                               onPress={() => {
                                   props.onPressCancel && props.onPressCancel(spareItem.id, isComplete);
                               }}>
                        <Text style={{fontSize: 14, color: Colors.theme, fontWeight: 'bold'}}>取消</Text>
                    </Pressable>
                    <Pressable style={styles.savePress}
                               onPress={() => {
                                   props.onPressSave && props.onPressSave(spareItem.id, isComplete);
                               }}>
                        <Text style={{fontSize: 14, color: Colors.white, fontWeight: 'bold'}}>保存</Text>
                    </Pressable>
                </View>
            )
        } else {
            return <></>
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
                    props.showStart &&
                    <Pressable onPress={() => {
                        props.onPressStart && props.onPressStart()
                    }}
                               style={{
                                   backgroundColor: Colors.background.primary,
                                   height: 28,
                                   width: 68,
                                   alignItems: 'center',
                                   justifyContent: 'center',
                                   borderRadius: 2,
                                   marginRight: 46,
                                   borderWidth: 1,
                                   borderColor: Colors.border,
                               }}>
                        <Text style={{
                            color: Colors.theme,
                            fontSize: 14,
                            fontWeight: 'bold'
                        }}>{props.inventoryStatus == InventoryStatus.initial ? '开始盘点' : '正在盘点'}</Text>
                    </Pressable>
                }

                <Pressable style={{width: 30, height: 30, alignItems: 'center', justifyContent: 'center'}}
                           onPress={() => {
                               props.expandCallBack && props.expandCallBack(props.sectionType);
                           }}>
                    <IconFill name={props.isExpand ? 'up-circle' : 'down-circle'} size={16} color='#10357E'/>
                </Pressable>
            </View>
            {
                props.isExpand && renderSpareRepertory()
            }
        </View>
    )
}

const styles = StyleSheet.create({
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    cancelPress: {
        backgroundColor: '#DDE5FF',
        borderWidth: 1,
        borderColor: '#C9D5FA',
        borderRadius: 2,
        width: 68,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10
    },
    savePress: {
        backgroundColor: Colors.theme,
        borderRadius: 2,
        width: 68,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
})
