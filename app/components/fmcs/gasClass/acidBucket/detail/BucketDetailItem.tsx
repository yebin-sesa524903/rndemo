import React from "react";
import {Image, Pressable, StyleSheet, Text, TextInput, View} from "react-native";
import Colors from "../../../../../utils/const/Colors";
import {isEmptyString} from "../../../../../utils/const/Consts";

export interface BucketDetailProps {
    icon?: any,
    title?: string,
    sectionType?: number,
    dataObj: DataProps[],
    onPressScan?: (type?: BucketItemType) => {},///扫码点击回调
    actionCallBack?: (type?: BucketItemType) => {},  ///点击回调
    textChangeCallBack?: (text: string, type?: BucketItemType) => {},///文字输入回调
}

export interface DataProps {
    title: string,
    subTitle?: string,
    itemType?: 'basic' | 'scan' | 'tip' | undefined,
    type?: BucketItemType,
    placeholder?: string,///占位文字
    isRequire?: boolean,///是否必须
    canEdit?: boolean,///是否可编辑
}

export enum BucketItemType {
    operator,   ///操作人
    confirm, ///确认人,
    serialNo,   ///酸桶批号
    remark,///说明
}


export function BucketDetailItem(itemObj: BucketDetailProps) {

    const renderBucketItem = (bucket: DataProps, index: number) => {
        const {
            title,
            subTitle,
            canEdit,
            isRequire,
            placeholder,
            itemType,
            type,
        } = bucket;
        const {
            textChangeCallBack,
            actionCallBack,
            onPressScan
        } = itemObj;
        if (itemType === 'tip') {
            return configTipItem(bucket, index);
        }
        return (
            <Pressable key={title + index}
                       disabled={!canEdit}
                       onPress={() => {
                           actionCallBack && actionCallBack(type);
                       }}
                       style={{
                           paddingLeft: 15,
                           paddingRight: 15,
                           minHeight: 44,
                           flexDirection: 'row',
                           alignItems: 'center',
                           justifyContent: 'space-between'
                       }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flex: 1,
                    paddingRight: 15,
                    paddingTop: 5,
                    paddingBottom: 5
                }}>
                    {isRequire && <Text style={{fontSize: 12, color: 'red'}}>*</Text>}
                    <Text style={{
                        width: 90,
                        fontSize: 15,
                        color: canEdit ? Colors.text.primary : Colors.text.light,
                        fontWeight: '500',
                    }}>{title}</Text>
                    {(itemType === 'scan' && canEdit)
                        ?
                        <TextInput placeholder={placeholder}
                                   defaultValue={canEdit ? (subTitle || '') : subTitle}
                                   editable={canEdit}
                                   maxLength={50}
                                   style={{marginLeft: 20, flex: 1, fontSize: 14, color: Colors.text.primary}}
                                   onChangeText={(text) => {
                                       textChangeCallBack && textChangeCallBack(text, type);
                                   }}/>
                        :
                        <Text style={{
                            fontSize: 15,
                            flex: 1,
                            fontWeight: '500',
                            color: Colors.text.primary,
                            marginLeft: 25,
                        }}>{isEmptyString(subTitle) ? '-' : subTitle}</Text>
                    }
                </View>
                {canEdit &&
                    <Pressable onPress={() => {
                        if (itemType == 'scan') {
                            onPressScan && onPressScan(type);
                        }
                    }}>
                        <Image
                            source={itemType == 'scan' ? require('../../../../../images/aaxiot/acidBucket/scan.png') : require('../../../../../images/aaxiot/airBottle/arrow_right.png')}
                            style={{marginRight: 8}}/>
                    </Pressable>
                }
                <View style={{
                    position: 'absolute',
                    left: 20,
                    right: 20,
                    bottom: 0,
                    height: 0.5,
                    backgroundColor: '#eee'
                }}/>
            </Pressable>
        )
    }

    /**
     *  备注item
     * @param bucket
     * @param index
     */
    const configTipItem = (bucket: DataProps, index: number) => {
        const {title, placeholder, canEdit, subTitle, type} = bucket;
        let defaultValue = '';
        if (isEmptyString(subTitle)) {
            defaultValue = canEdit ? '' : '-';
        } else {
            defaultValue = subTitle!;
        }
        return (
            <View key={title + index}
                  style={{padding: 15}}>
                <Text style={{fontSize: 15, color: canEdit ? Colors.text.primary : Colors.text.light}}>{title}</Text>
                {
                    canEdit ?
                        <TextInput style={{
                            borderWidth: canEdit ? 1 : 0,
                            marginTop: 20,
                            borderColor: Colors.border,
                            paddingLeft: 10,
                            paddingRight: 10,
                            fontSize: 14,
                            color: Colors.text.primary,
                            textAlignVertical: 'top',
                        }}
                                   defaultValue={defaultValue}
                                   editable={canEdit}
                                   multiline={true}
                                   maxLength={300}
                                   onChangeText={(text) => {
                                       itemObj.textChangeCallBack && itemObj.textChangeCallBack(text, type);
                                   }}
                                   placeholder={placeholder}/>
                        :
                        <Text style={{
                            color: Colors.text.primary,
                            fontSize: 14,
                            flex: 1,
                            marginTop: 12
                        }}>{defaultValue}</Text>
                }

            </View>
        )
    }

    return (
        <View style={{backgroundColor: Colors.background.primary}}>
            <View style={{flexDirection: 'row', height: 44, paddingLeft: 15, alignItems: 'center'}}>
                <Image source={itemObj.icon} style={{width: 15, height: 15, marginRight: 6}}/>
                <Text style={[styles.titleText, {fontWeight: 'bold', fontSize: 16}]}>{itemObj.title}</Text>
            </View>
            <View style={{borderRadius: 5, backgroundColor: 'white', marginLeft: 10, marginRight: 10}}>
                {itemObj.dataObj && itemObj.dataObj.map((obj: DataProps, index: number) => {
                    return renderBucketItem(obj, index);
                })}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    titleText: {
        fontSize: 15,
        color: "#333",
        fontWeight: '500',
    }
})
