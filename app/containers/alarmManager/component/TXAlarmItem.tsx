import React from "react";

import {
    Image,
    Pressable,
    StyleSheet, Text,
    View
} from 'react-native';

import Colors, {isDarkMode} from "../../../utils/const/Colors";
import {configLevel} from "../utils";
import moment from "moment/moment";
import {TimeFormatYMDHMS} from "../../../utils/const/Consts";
import {localStr} from "../../../utils/Localizations/localization";

export interface TXAlarmItemProps {
    id?: number,
    level: number,
    businessStatus: number,///报警是否解除  1 未解除, 2 已解除
    onPressItem?: Function,
    onPressTicket?: Function,
    alarmTime?: number,///发生时间
    type?: string,
    typeName?: string,///报警类别
    deviceName?: string,///设备名称
    gatewayName?: string,///所属网关
    hasTicket?: boolean,///是否创建了工单
    ticketId?: string,
}

export function TXAlarmItem(itemProps: TXAlarmItemProps) {
    return (
        <Pressable style={styles.container} onPress={() => {
            itemProps.onPressItem && itemProps.onPressItem(itemProps);
        }}>
            <View style={[styles.levelContainer, {backgroundColor: configLevel(itemProps.level, itemProps.businessStatus).color}]}>
                <Text style={{fontSize: 16, fontWeight: 'bold', color: Colors.seTextInverse}}>{configLevel(itemProps.level, itemProps.businessStatus).levelText}</Text>
            </View>
            <View style={{marginLeft: 12, flex: 1}}>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                    <Text style={{fontSize: 16, fontWeight: 'bold', color: Colors.seTextTitle}}>{itemProps.typeName}</Text>
                    {
                        itemProps.hasTicket &&
                        <Pressable style={styles.ticketIconContainer}
                              onPress={() => {
                                  itemProps.onPressTicket && itemProps.onPressTicket(itemProps.ticketId)
                              }}>
                            <Image source={isDarkMode()?require('../../../images/alarm/FileDone.png') : require('../../../images/alarm/FileDone_light.png')} style={{width: 12, height: 12}}/>
                        </Pressable>
                    }
                </View>
                <Text style={styles.textContext}>{`${localStr('lang_alarm_device')}:  ` + ((itemProps.type == '501' ? itemProps.deviceName: itemProps.gatewayName) || '-')}</Text>
                {
                    itemProps.type == '501' && <Text style={styles.textContext}>{`${localStr('lang_alarm_info_gateway')}:  ` + (itemProps.gatewayName || '-')}</Text>
                }
                <Text style={styles.textContext}>{`${localStr('lang_alarm_info_create_time')}:  ` + moment(itemProps.alarmTime! * 1000).format(TimeFormatYMDHMS)}</Text>
            </View>
            <View style={styles.dividerLine}/>
        </Pressable>
    )
}


// @ts-ignore
const styles = global.amStyleProxy(() => StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: Colors.seBgContainer,
        padding: 12,
    },
    levelContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ticketIconContainer: {
        borderWidth: 1,
        borderColor: Colors.seBorderBase,
        backgroundColor: Colors.seFill3,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 12
    },
    textContext: {
        fontSize: 12,
        color: Colors.seTextPrimary,
        marginTop: 8,
    },
    dividerLine: {
        position: 'absolute',
        bottom: 0,
        left: 12,
        right: 12,
        height: 1,
        backgroundColor: Colors.seBorderSplit
    }
}))
