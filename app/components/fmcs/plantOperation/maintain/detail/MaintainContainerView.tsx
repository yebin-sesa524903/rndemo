import React from "react";
import {ScrollView, View} from "react-native";
import {screenHeight, screenWidth} from "../../../../../utils/const/Consts";
import Colors from "../../../../../utils/const/Colors";

export interface MaintainContainerViewProps {
    children: React.ReactElement[],
    scrollViewRef: any,
}

/**
 * 保养内容 容器
 * @param props
 * @constructor
 */
export function MaintainContainerView(props: MaintainContainerViewProps) {

    return (
        <ScrollView ref={props.scrollViewRef}
                    horizontal={true}
                    contentContainerStyle={{
                        width: screenWidth() * props.children.length,
                        height:'100%'
                    }}
                    scrollEnabled={false}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    pagingEnabled={true}
                    bounces={false}>
            {
                props.children.map((child, index) => {
                    return (
                        <View key={index}
                              style={{flex: 1, width: screenWidth(), backgroundColor: Colors.seBgContainer}}>
                            {child}
                        </View>
                    )
                })
            }
        </ScrollView>
    )
}
