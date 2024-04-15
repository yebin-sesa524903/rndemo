import React from 'react';
import {Image, Pressable, Text, View} from "react-native";
import Colors from "../../../../utils/const/Colors";
import {ExpandHeader, ExpandHeaderProps} from "./ExpandHeader";

export interface BasicMsgItemProps extends ExpandHeaderProps {
    sectionType?: number,
    data?: {
        title?: string,
        subTitle?: string,
    }[],
    pictures?: string[],///图片展示
    onPressPicture?: Function,

}

export function BasicMsgItem(itemObj: BasicMsgItemProps) {

    const renderBasicItem = (data: { title?: string, subTitle?: string }) => {
        return (
            <View key={data.title + (data.subTitle ?? '-')}
                  style={{
                      padding: 13,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                  }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    flex: 1,
                }}>
                    <Text style={{
                        width: 100,
                        fontSize: 13,
                        color: Colors.text.light,
                        fontWeight: '500',
                    }}>{data.title}</Text>
                    <Text style={{
                        fontSize: 13,
                        color: Colors.text.primary,
                        marginLeft: 25,
                        flex: 1,
                    }}>{data.subTitle}</Text>
                </View>

                <View style={{
                    position: 'absolute',
                    left: 15,
                    right: 15,
                    bottom: 0,
                    height: 0.5,
                    backgroundColor: Colors.gray.primary
                }}/>
            </View>
        )
    }

    /**
     * 图片展示
     */
    const renderPicture = () => {
        return (itemObj.pictures && itemObj.pictures.length > 0) &&
            <View style={{flexDirection: 'row', flexWrap: 'wrap', paddingLeft: 13, paddingRight: 13, marginBottom: 12}}>
                {
                    itemObj.pictures.map((picture, index) => {
                        return (
                            <Pressable key={index}
                                       onPress={() => {
                                           itemObj.onPressPicture && itemObj.onPressPicture(index);
                                       }}>
                                <Image source={{uri: picture}}
                                       style={{
                                           width: 80,
                                           height: 80,
                                           marginRight: 15,
                                           borderRadius: 5,
                                           marginTop: 10,
                                       }}/>
                            </Pressable>
                        )
                    })
                }
            </View>
    }

    return (
        <ExpandHeader {...itemObj} content={
            <View style={{borderRadius: 5}}>
                {itemObj.data && itemObj.data.map((obj, index: number) => {
                    return renderBasicItem(obj);
                })}
                {renderPicture()}
            </View>
        }/>
    )
}
