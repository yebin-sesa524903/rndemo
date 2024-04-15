import React from "react";
import {
    Image,
    Pressable,
    StyleSheet, Text,
    View,
} from 'react-native';
import {ConsumablesDetailItemType} from "../../defined/ConstDefined";
import Colors from "../../../../../utils/const/Colors";

export interface SparePartsOutboundProps {
    icon?: any,
    title?: string,
    canEdit?: boolean,
    onPressRelative?: Function,
    sectionType?: ConsumablesDetailItemType,///类型
    data?: SparePartsOutboundData[],
    onPressRemove?: Function,
}


export interface SparePartsOutboundData {
    id?: number,
    taskId?: number,
    noTitle?: string,   ///出库/领用单号 标题
    userTitle?: string, ///领用人标题
    outboundNo?: string,   ///出库单号
    recipients?: string,///领用人
    data?: SparePartsOutboundDataItem[][],///备件数组
}

export interface SparePartsOutboundDataItem {
    name?: string,  ///名称
    value?: string,
}


/**
 * 备件出库单 item
 * @constructor
 */
export function SparePartsOutbound(props: SparePartsOutboundProps) {

    const renderListItem = (itemObj: SparePartsOutboundData, index: number) => {
        const {id, noTitle, userTitle, outboundNo, recipients, data} = itemObj;
        return (
            <View key={(id ?? '') + (outboundNo ?? '') + String(index)}
                  style={styles.replacementContainer}>
                <View style={styles.lineView}/>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                    <View style={{paddingTop: 15, paddingBottom: 15}}>
                        <View style={{flexDirection: 'row',}}>
                            <Text style={styles.noText}>{noTitle}</Text>
                            <Text style={styles.noValueText}>{outboundNo}</Text>
                        </View>
                        <View style={{flexDirection: 'row', marginTop: 10}}>
                            <Text style={styles.noText}>{userTitle}</Text>
                            <Text style={styles.noValueText}>{recipients}</Text>
                        </View>
                    </View>
                    {
                        props.canEdit &&
                        <Pressable style={styles.removeContent}
                                   onPress={() => {
                                       props.onPressRemove && props.onPressRemove(itemObj);
                                   }}>
                            <Text style={styles.removeText}>移除</Text>
                        </Pressable>
                    }
                </View>
                {
                    data?.map((item, index) => {
                        return item.map((itemData, index) => {
                            return (
                                <View key={(itemData.name ?? '') + index}
                                      style={{
                                          flexDirection: 'row',
                                          alignItems: 'center',
                                          paddingTop: 15,
                                          paddingBottom: 15
                                      }}>
                                    <Text style={{
                                        fontSize: 13,
                                        color: index == 0 ? Colors.text.primary : Colors.text.light,
                                        width: 100
                                    }}>{itemData.name}</Text>
                                    <Text style={{
                                        fontSize: 13,
                                        color: Colors.text.primary,
                                        marginLeft: 10
                                    }}>{itemData.value}</Text>
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
                    })
                }

            </View>
        )
    }


    return (
        <View style={{borderRadius: 5, backgroundColor: 'white', marginLeft: 10, marginRight: 10, marginTop: 12, marginBottom: 20}}>
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
                {/*    props.canEdit && <Pressable style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}*/}
                {/*                                onPress={() => {*/}
                {/*                                    props.onPressRelative && props.onPressRelative();*/}
                {/*                                }}>*/}
                {/*        <Image source={require('../../../../../images/aaxiot/consumables/guanlianchukudan.png')}/>*/}
                {/*        <Text style={{*/}
                {/*            fontSize: 14,*/}
                {/*            color: Colors.theme,*/}
                {/*            marginLeft: 6,*/}
                {/*            fontWeight: 'bold',*/}
                {/*        }}>关联备件出库单</Text>*/}
                {/*    </Pressable>*/}
                {/*}*/}
            </View>
            <View style={{borderRadius: 5, paddingLeft: 15, paddingRight: 15}}>
                {props.data && props.data.map((obj, index: number) => {
                    return renderListItem(obj, index)
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
    replacementContainer: {
        paddingTop: 2,
    },
    pressContainer: {
        backgroundColor: Colors.theme,
        borderRadius: 2,
        alignItems: 'center',
        justifyContent: 'center',
        height: 28,
        width: 122,
        marginLeft: 15,
        marginTop: 15,
        marginBottom: 15
    },
    relevancyText: {
        fontSize: 14,
        color: Colors.white,
        fontWeight: 'bold',
    },
    removeContent: {
        width: 68,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#DDE5FF',
        borderRadius: 2,
        borderWidth: 1,
        borderColor: '#C9D5FA',
    },
    removeText: {
        fontSize: 14,
        color: Colors.theme,
        fontWeight: 'bold',
    },
    lineView: {
        height: 1,
        backgroundColor: Colors.gray.primary,
    },

    noText: {
        fontSize: 14,
        color: Colors.text.primary,
        fontWeight: '600',
        width: 100,
    },
    noValueText: {
        fontSize: 14,
        color: Colors.text.primary,
        marginLeft: 10,
    }
})
