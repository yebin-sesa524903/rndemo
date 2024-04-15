import React from "react";
import {Pressable, StyleProp, StyleSheet, Text, View, ViewStyle} from "react-native";
import Colors from "../../../../../utils/const/Colors";

export interface ActionViewProps{
    actions:{
        ///按钮标题
        title:string;
        ///按钮样式
        btnStyle?: StyleProp<ViewStyle> ;
        ///文字颜色
        textColor?:string;
        ///按钮点击回调
        onPressCallBack?: Function;
    }[];
    ///content样式
    style?: StyleProp<ViewStyle>;
}

export default function BottleDetailActionView(props:ActionViewProps) {
    return (
        <View style={[{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            height: 84,
            width: '100%',
            backgroundColor: Colors.background.primary,
        }, props.style]}>
            {
                props.actions.map((action,index)=>{
                    return (
                        <Pressable key={action.title}
                                   onPress={()=>{
                                       action.onPressCallBack && action.onPressCallBack();
                                   }}
                                   style={[styles.pressContent, action.btnStyle]}>
                            <Text style={{fontSize: 15, color: action.textColor}}>{action.title}</Text>
                        </Pressable>
                    )
                })
            }
        </View>
    )
}

const styles = StyleSheet.create({
    pressContent: {
        borderRadius: 5,
        borderColor: '#ddd',
        borderWidth: 1,
        height: 45,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
})
