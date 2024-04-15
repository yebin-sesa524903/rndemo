import React from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    View
} from "react-native";
import Colors from "../../../utils/const/Colors";
import {configLevel, formatAlarmTime} from "../utils";
import {Icon} from "@ant-design/react-native";
import moment from "moment";
import {localStr} from "../../../utils/Localizations/localization";

export default function AlarmDetailHeader(props: any) {
    let devices: any[] = []
    if (props.hierarchyId && props.hierarchyName){
        devices = [{id: props.hierarchyId, name: props.hierarchyName}];
    }
    if (props.hierarchies) {
        devices.push(...props?.hierarchies);
    }
    let duration: any = '-';
    if (props.businessStatus === 2 && props.resetTime){
        ///已解除
        duration = formatAlarmTime(props.alarmTime, props.resetTime);
    }else if(props.businessStatus === 1) {
        duration = formatAlarmTime(props.alarmTime);
    }

    return (
        <View style={styles.container}>
            <View style={{flexDirection: 'row'}}>
                <View
                    style={[styles.levelContainer, {backgroundColor: configLevel(props.level, props.businessStatus).color}]}>
                    <Text
                        style={{fontSize: 16, fontWeight: 'bold', color: Colors.seTextInverse}}>{configLevel(props.level, props.businessStatus).levelText}</Text>
                </View>
                <View style={{marginLeft: 12}}>
                    <Text style={{fontSize: 14, color: Colors.seTextPrimary}}>{props.typeName}</Text>
                    <Text style={{fontSize: 16, color: Colors.seTextTitle, marginTop: 6, fontWeight: 'bold'}}>{props.name + ': ' + props.actualValue + props.enUnit}</Text>
                </View>
            </View>
            <View style={styles.bottomViewContainer}>
                <View style={styles.rowView}>
                    <Text style={styles.titleText}>{localStr('lang_alarm_info_device')}</Text>
                    <View style={{flex: 1, marginLeft: 12, alignItems:'flex-end'}}>
                        {
                           devices.length > 0 ?
                               devices.map((item, index) => {
                                return (
                                    <Pressable key={item.id + index}
                                               onPress={()=>{
                                                   props.devicePress && props.devicePress(item)
                                               }}
                                               style={{
                                                   backgroundColor: Colors.seFill3,
                                                   paddingLeft: 8,
                                                   paddingRight: 8,
                                                   paddingTop: 4,
                                                   paddingBottom: 4,
                                                   borderRadius: 4,
                                                   flexDirection: 'row',
                                                   alignItems: 'center',
                                                   marginTop: index > 0 ? 8 : 0
                                               }}>
                                        <Text
                                            style={{fontSize: 14, color: Colors.seTextPrimary, marginRight: 6}}>{item.name}</Text>
                                        <Icon name={'right-square'} size={14} color={Colors.seTextPrimary}/>
                                    </Pressable>
                                )
                                })
                               :
                               <Text style={{fontSize: 14, color: Colors.seTextPrimary}}>-</Text>
                        }
                    </View>
                </View>
                <View style={styles.dividerLine}/>
                <View style={styles.rowView}>
                    <Text style={styles.titleText}>{localStr('lang_alarm_info_set_value')}</Text>
                    <Text style={styles.valueText}>{props.thresholdValue}</Text>
                </View>
                <View style={styles.dividerLine}/>
                <View style={styles.rowView}>
                    <Text style={styles.titleText}>{localStr('lang_alarm_info_duration')}</Text>
                    <Text style={styles.valueText}>{duration}</Text>
                </View>
                <View style={styles.dividerLine}/>
                <View style={styles.rowView}>
                    <Text style={styles.titleText}>{localStr('lang_alarm_info_location')}</Text>
                    <Text style={styles.valueText}>{props?.locationName || '-' }</Text>
                </View>
            </View>
        </View>
    )
}


// @ts-ignore
const styles = global.amStyleProxy(() => StyleSheet.create({
    container: {
        margin: 16,
        padding: 16,
        borderRadius: 12,
        backgroundColor: Colors.seBgLayout
    },
    levelContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomViewContainer: {
        backgroundColor: Colors.seBgContainer,
        borderRadius: 4,
        paddingLeft: 16,
        paddingRight: 12,
        marginTop: 20
    },
    titleText: {
        fontSize: 14,
        color: Colors.seTextTitle,
    },
    valueText: {
        fontSize: 14,
        color: Colors.seTextPrimary,
    },
    rowView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 12,
        paddingBottom: 12,
    },
    dividerLine: {
        height: 1,
        backgroundColor: Colors.seBorderSplit,
    }
}))
