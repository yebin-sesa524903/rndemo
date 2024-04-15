import React from "react";
import {
    Pressable, Text,
    View
} from 'react-native';
import {Badge} from "@ant-design/react-native";
import Colors from "../../../utils/const/Colors";

export interface AlarmHeaderProps {
    content: {
        title: string,
        count: number,
        isSelected: boolean,
        onPress?: ()=>void,
    }[]
}
export function AlarmHeader(props: AlarmHeaderProps) {
    return (
        <View style={{ height: 40, backgroundColor: Colors.seBrandNomarl, flexDirection:'row', alignItems:'center', justifyContent:'space-around'}}>
            {props.content.map((item)=>{
                return (
                    <Pressable key={item.title} style={{height: 40, flexDirection: 'row', justifyContent:'center', alignItems:'center' }} onPress={item.onPress}>
                        <View style={{height: 40, justifyContent:'space-around'}}>
                            <Text style={{fontSize: 15, fontWeight:item.isSelected ? 'bold' : 'normal', color: Colors.seTextInverse}}>{item.title}</Text>
                            <View style={{
                                position: 'absolute',
                                bottom:0,
                                left: 0,
                                right: 0,
                                height: 6,
                                justifyContent: 'center',
                                flexDirection: 'row'
                            }}>
                                <View style={{
                                    width: 60,
                                    height: 2,
                                    borderRadius: 2,
                                    marginBottom: 0,
                                    backgroundColor: item.isSelected ? Colors.seTextInverse : 'transparent'
                                }}/>
                            </View>
                        </View>
                        <Badge style={{marginLeft: 18, backgroundColor: Colors.seErrorNormal}} size={"large"} text={item.count} />

                    </Pressable>
                )
            })}
        </View>
    )
}
