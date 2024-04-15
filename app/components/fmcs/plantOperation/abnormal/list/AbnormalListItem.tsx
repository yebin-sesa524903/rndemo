import React from "react";
import { Pressable, StyleSheet, Text, View, Animated} from "react-native";
import Colors from "../../../../../utils/const/Colors";

export interface AbnormalListItemProps {
    abnormalItem: any,
    onPressItem?: Function,///点击回调
}

export function AbnormalListItem(props: AbnormalListItemProps) {
    return (
        <Pressable style={styles.container} onPress={() => {
            console.log(props.abnormalItem.id);
            props.onPressItem && props.onPressItem(props.abnormalItem.id);
        }}>
            <View style={{
                height: 38,
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingHorizontal: 12,
                alignItems: 'center'
            }}>
                <Text style={{ color: Colors.text.primary, fontSize: 14, fontWeight: 'bold' }}>{props.abnormalItem.name}</Text>
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
                    }}>{props.abnormalItem.status}</Text>
                </View>
            </View>
            <View style={{
                marginLeft: 15,
                marginRight: 15,
                height: 1,
                backgroundColor: 'rgba(228, 234, 243, 0.4)'
            }}></View>
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingHorizontal: 12,
                alignItems: 'center',
                marginTop: 15
            }}>
                <Text style={{
                    color: Colors.text.primary,
                    fontSize: 13,
                    fontWeight: '600',
                    flex: 1
                }}>{props.abnormalItem.deviceName}</Text>
                <Text style={{
                    color: Colors.text.sub,
                    fontSize: 13
                }}>计划时间：</Text>
                <Text style={{
                    color: Colors.text.primary,
                    fontSize: 13,
                    fontWeight: 'bold'
                }}>{props.abnormalItem.occurrenceTime}</Text>
            </View>
            <Text style={{
                color: Colors.text.sub,
                fontSize: 13,
                marginTop: 11,
                paddingHorizontal: 12,
                marginBottom: 12
            }}
                numberOfLines={1}>{props.abnormalItem.executorNames.join("、")}</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.white,
        marginTop: 12,
        marginLeft: 15,
        marginRight: 15,
        borderRadius: 3,
        flex: 1,
    }
})
