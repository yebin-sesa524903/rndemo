import React from "react";
import {Image, TextInput, View} from "react-native";
import Colors from "../../../../utils/const/Colors";

export interface SimpleSearchProps {
    placeholder?: string,
    textDidChange?: Function,
}

export function SimpleSearch(props: SimpleSearchProps) {
    return (
        <View style={{
            backgroundColor: Colors.white,
            width:'100%',
            alignItems: 'flex-end',
            height: 48,
            justifyContent: 'center',
        }}>
            <View style={{
                flexDirection: 'row',
                alignItems:'center',
                backgroundColor: '#f3f3f3',
                borderRadius: 4,
                marginLeft: 15,
                marginRight: 15,
                paddingLeft: 12,
                paddingRight: 12,
                height: 38
            }}>
                <Image source={require('../../../../images/aaxiot/searchBar/search.png')}/>
                <TextInput placeholder={props.placeholder}
                           style={{
                               fontSize: 14,
                               flex: 1,
                               color: Colors.text.primary,
                           }}
                           onChangeText={(text) => {
                                props.textDidChange && props.textDidChange(text);
                           }}
                />
            </View>
        </View>
    )
}
