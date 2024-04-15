import React from "react";
import {ScrollView, Text, View} from "react-native";
import Colors from "../../../../../utils/const/Colors";
import {localStr} from "../../../../../utils/Localizations/localization";

const statusList = [
    {
        title: localStr('lang_asset_status_using'),
        id: 1,
        isSelected: false,
    },
    {
        title: localStr('lang_asset_status_repairing'),
        id: 2,
        isSelected: false,
    },
    {
        title: localStr('lang_asset_status_idle'),
        id: 3,
        isSelected: false,
    },
    {
        title: localStr('lang_asset_status_transfer'),
        id: 4,
        isSelected: false,
    },
]

export function Filter() {
    const renderStatusFilter = () => {
        return (
            <View style={{}}>
                <Text style={{marginLeft: 12,fontSize: 14, color: Colors.text.light}}>{localStr('lang_asset_status')}</Text>
                <View style={{flex: 1, flexWrap:'wrap', flexDirection:'row', paddingRight: 12}}>
                    {
                        statusList.map((item, index) => {
                            return (
                                <View style={{
                                    backgroundColor: Colors.background.light,
                                    borderRadius: 5,
                                    width: 80,
                                    height: 28,
                                    marginLeft: 12,
                                    marginTop: 12,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <Text style={{fontSize: 14, color: Colors.text.primary}}>{item.title}</Text>
                                </View>
                            )
                        })
                    }
                </View>
            </View>

        )
    }

    return (
        <View style={{flex: 1}}>
            <ScrollView style={{flex: 1}}>
                {renderStatusFilter()}
            </ScrollView>
        </View>
    )
}
