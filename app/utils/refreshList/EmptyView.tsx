import React from "react";
import { Image, Text, View } from "react-native";
import {localStr} from "../Localizations/localization";
import Colors, {isDarkMode} from "../const/Colors";

export interface EmptyViewProps{
    emptyText?: string
}

export default function EmptyView(props:EmptyViewProps) {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center"}}>
            <Image style={{width: 128 * 0.5, height: 80 * 0.5}}
                   resizeMode={'contain'}
                   source={isDarkMode() ? require("../../images/empty_box/empty_box_dark.png") : require("../../images/empty_box/empty_box.png")} />
            <Text style={{
                fontSize: 14,
                color: Colors.seTextDisabled,
                marginTop: 8
            }}>{props.emptyText || localStr('lang_empty_data')}</Text>
        </View>
    );
}
