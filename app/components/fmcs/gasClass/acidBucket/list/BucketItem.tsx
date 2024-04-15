import React from "react";
import {Pressable, Text, View} from "react-native";
import Colors from "../../../../../utils/const/Colors";
import {isEmptyString, TimeFormatYMDHM} from "../../../../../utils/const/Consts";
import moment from "moment";

export function BucketItem(item: any, onPressItem?: Function) {
    const {deviceName, positionName, statusString, planChangeTime} = item.item;
    return (
        <Pressable onPress={() => {
            onPressItem && onPressItem(item.item);
        }}
                   style={{
                       backgroundColor: 'white',
                       borderRadius: 5,
                       margin: 12,
                       marginBottom: 0,
                       paddingLeft: 15,
                       paddingRight: 15,
                   }}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', height: 44, alignItems: 'center'}}>
                <View style={{flexDirection: 'row', alignItems: 'center', width: '80%'}}>
                    <Text style={{fontSize: 15, color: Colors.text.primary, fontWeight: 'bold'}}
                          numberOfLines={1}>{isEmptyString(deviceName) ? '-' : deviceName}</Text>
                    <Text style={{fontSize: 12, color: Colors.text.light, marginLeft: 8}}
                          numberOfLines={1}>{`(${positionName})`}</Text>
                </View>
                <View style={{
                    backgroundColor: 'rgba(34, 84, 183, 0.06)',
                    borderRadius: 3,
                    paddingLeft: 8,
                    paddingRight: 8,
                    paddingTop: 3,
                    paddingBottom: 3
                }}>
                    <Text style={{fontSize: 12, fontWeight: 'bold', color: Colors.theme}}>{statusString}</Text>
                </View>
            </View>
            <View style={{backgroundColor: Colors.border, height: 0.5,}}/>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 64}}>
                <Text style={{fontSize: 14, color: Colors.text.primary}} numberOfLines={1}>计划更换<Text
                    style={{fontSize: 15, color: 'orange'}}> </Text></Text>
                <Text style={{
                    fontSize: 14,
                    color: Colors.text.primary,
                    fontWeight: 'bold'
                }}>{moment(planChangeTime).format(TimeFormatYMDHM)}</Text>
            </View>
        </Pressable>
    )
}

