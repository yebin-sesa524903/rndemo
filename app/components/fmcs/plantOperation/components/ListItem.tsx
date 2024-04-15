import React from "react";
import {StyleSheet, View, Text, Pressable} from "react-native";
import Colors from "../../../../utils/const/Colors";
import {
    convertInspectionStatus
} from "../../../../containers/fmcs/plantOperation/inspection/detail/InspectionStateHelper";
import {isEmptyString} from "../../../../utils/const/Consts";

export interface ConsumablesItemProps {
    title?: string,
    orderName?: string,
    timeText?: string,
    timeString?: string,
    names?: string,
    id?: string,
    status?: string,
    timeNeedWarp?: boolean,
}

export function ListItem(props: ConsumablesItemProps, onPressItem?: Function) {
    return (
        <Pressable style={styles.container}
                   onPress={()=>{
                       onPressItem && onPressItem(props);
                   }}>
            <View style={{paddingBottom: 12, flexDirection:'row', alignItems:'center', justifyContent: 'space-between'}}>
                <Text style={{fontSize: 14, color: Colors.text.primary, fontWeight:'bold', flex: 1}}>{props.title}</Text>
                {
                    isEmptyString(props.status) ? null :
                        <View style={{
                            width: 53,
                            height: 21,
                            borderRadius: 3,
                            backgroundColor: 'rgba(34,84,183,0.06)',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Text style={{
                                color: Colors.theme,
                                fontSize: 12,
                                fontWeight: 'bold'
                            }}>{props.status}</Text>
                        </View>
                }
            </View>
            <View style={{height: 1, backgroundColor: Colors.border}}/>
            <View style={{flex: 1}}>
                <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingTop: 12, paddingBottom: 12, flex: 1}}>
                    <Text style={{fontSize: 13, color: Colors.text.primary, flex: 1}}>{props.orderName}</Text>
                    {
                        props.timeNeedWarp ?
                            <View style={{flexDirection:'row', flex: 1, justifyContent:'flex-end'}}>
                                <Text style={{fontSize: 13, color: Colors.text.sub}}>{props.timeText}</Text>
                                <View style={{}}>
                                    <Text style={{fontSize: 13, color: Colors.text.primary}}>{props.timeString?.split('~').shift()}</Text>
                                    <Text style={{fontSize: 13, color: Colors.text.primary}}>{props.timeString?.split('~').pop()}</Text>
                                </View>

                            </View>
                            :
                            <View style={{flexDirection:'row', justifyContent:'flex-end',  flex: 1}}>
                                <Text style={{fontSize: 13, color: Colors.text.sub,}}>{props.timeText} <Text style={{fontSize: 13, color: Colors.text.primary}}>{props.timeString}</Text></Text>
                            </View>
                    }
                </View>
                <Text style={{fontSize: 13, color: Colors.text.primary}} numberOfLines={1}>{props.names}</Text>
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginLeft: 10,
        marginRight: 10,
        marginTop: 10,
        borderRadius: 3,
        backgroundColor: Colors.white,
        padding: 12,
    },
})
