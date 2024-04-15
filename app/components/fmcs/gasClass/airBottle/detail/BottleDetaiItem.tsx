import React from "react";
import {Image, Pressable, StyleSheet, Text, TextInput, View} from "react-native";
import Colors from "../../../../../utils/const/Colors";
import UploadableImage from '../../../../UploadableImage';
import {ExpandHeader, ExpandHeaderProps} from "../../../plantOperation/components/ExpandHeader";
import {isEmptyString} from "../../../../../utils/const/Consts";
import UploadImage, {UploadType} from "../../../uploadImage/UploadImage";

export enum BottleSectionType {
    basicMsg = 10001,
    blowing,
    exchange,
    standby,
}

/**
 * item类型
 */
export enum BottleItemType {
    basic = 20001,///基本类型 左边标题 右边副标题
    select,///右侧 可选择
    scan,///扫码
    picture,///选照片
    tip,///备注,
    input,///只有输入框
}

export interface BottleDetailProps extends ExpandHeaderProps {
    sectionType: BottleSectionType,
    dataObj: DataObjProps[]
}

export interface DataObjProps {
    title: string,
    subTitle?: string,
    placeholder?: string,///占位文字
    pictures?: BottlePictureProps[],///图片数组
    addPictureCallBack?: Function,///添加图片点击
    removePictureCallBack?: Function,///图片删除点击
    onPressPicture?: Function,///图片放大点击
    isRequire?: boolean,///是否必须
    canEdit?: boolean,///是否可编辑
    type?: BottleItemType,///item类型
    actionCallBack?: Function,///点击回调
    textChangeCallBack?: Function,///文字输入回调
    onPressScan?: Function,
    maxLength?: number,
}

export interface BottlePictureProps {
    uri?: string, ///图片地址
    name?: string, ///图片名称
    needUpload?: boolean, ///是否需要上传
    canRemove?: boolean,    ///是否可以删除, 需要上传但是没有上传成功 不可删除
    uploadComplete?: (success: boolean, name?: string) => {}   ///上传结束回调  返回上传是否成功
}

export function BottleDetailItem(itemObj: BottleDetailProps) {
    const renderBucketItem = (bottle: DataObjProps, index: number) => {
        const {
            title,
            subTitle,
            canEdit,
            isRequire,
            placeholder,
            type,
            actionCallBack,
            textChangeCallBack,
            onPressScan,
            maxLength,
        } = bottle;
        if (type == BottleItemType.tip) {
            return configTipItem(bottle, index);
        } else if (type == BottleItemType.picture) {
            return configPictureItem(bottle, index);
        }
        return (
            <Pressable key={title + index}
                       disabled={!canEdit}
                       onPress={() => {
                           actionCallBack && actionCallBack();
                       }}
                       style={{
                           paddingLeft: 15,
                           paddingRight: 15,
                           flexDirection: 'row',
                           alignItems: 'center',
                           justifyContent: 'space-between'
                       }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flex: 1,
                }}>
                    {isRequire && <Text style={{fontSize: 12, color: 'red'}}>*</Text>}
                    <Text style={{
                        width: 100,
                        fontSize: 14,
                        color: canEdit ? Colors.text.primary : Colors.text.light,
                        fontWeight: '500',
                        paddingVertical: 12
                    }}>{title}</Text>
                    {
                        ((type == BottleItemType.scan && canEdit) || type == BottleItemType.input) ?
                            <TextInput placeholder={placeholder}
                                       defaultValue={canEdit ? (subTitle || '') : subTitle}
                                       editable={canEdit}
                                       maxLength={maxLength ?? 50}
                                       multiline={true}
                                       numberOfLines={2}
                                       keyboardType={type == BottleItemType.input ? 'number-pad' : 'default'}
                                       style={{
                                           marginLeft: 15,
                                           flex: 1,
                                           fontSize: 14,
                                           color: Colors.text.primary,
                                           height: 38,
                                       }}
                                       onChangeText={(text) => {
                                           textChangeCallBack && textChangeCallBack(text);
                                       }}/>
                            :
                            <Text style={{
                                fontSize: 14,
                                fontWeight: '500',
                                color: Colors.text.primary,
                                marginLeft: 25,
                                flex: 1,
                                paddingVertical: 13,
                            }}>{subTitle}</Text>
                    }
                </View>
                {canEdit && type != BottleItemType.input &&
                    <Pressable onPress={() => {
                        onPressScan && onPressScan();
                    }}>
                        <Image
                            source={type == BottleItemType.scan ? require('../../../../../images/aaxiot/acidBucket/scan.png') : require('../../../../../images/aaxiot/airBottle/arrow_right.png')}
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
     * @param bottle
     * @param index
     */
    const configTipItem = (bottle: DataObjProps, index: number) => {
        const {title, placeholder, canEdit, subTitle, textChangeCallBack} = bottle;
        return (
            <View key={title + index}
                  style={{padding: 15}}>
                <Text style={{fontSize: 14, color: canEdit ? Colors.text.primary : Colors.text.light}}>{title}</Text>
                {
                    canEdit ?
                        <TextInput style={{
                            borderWidth: canEdit ? 1 : 0,
                            height: 80,
                            marginTop: 20,
                            borderColor: Colors.border,
                            padding: 10,
                            color: Colors.text.primary,
                            textAlignVertical: 'top',
                        }}
                                   defaultValue={subTitle}
                                   multiline={true}
                                   maxLength={300}
                                   onChangeText={(text) => {
                                       textChangeCallBack && textChangeCallBack(text);
                                   }}
                                   placeholder={placeholder}/>
                        :
                        <Text style={{
                            color: Colors.text.primary,
                            fontSize: 14,
                            marginTop: 12,
                            marginBottom: 10,
                        }}>{isEmptyString(subTitle) ? '-' : subTitle}</Text>
                }

            </View>
        )
    }

    /**
     * 选择照片item
     * @param bottle
     * @param index
     */
    const configPictureItem = (bottle: DataObjProps, index: number) => {
        const {title, canEdit, isRequire, pictures, addPictureCallBack, removePictureCallBack, onPressPicture} = bottle;
        return (
            <View key={title + index}
                  style={{padding: 15}}>
                <Pressable style={{flexDirection: 'row', justifyContent: 'space-between'}}
                           disabled={!canEdit}
                           onPress={() => {
                               addPictureCallBack && addPictureCallBack();
                           }}>
                    <View style={{flexDirection: 'row',}}>
                        {isRequire && <Text style={{fontSize: 12, color: 'red'}}>*</Text>}
                        <Text style={{
                            fontSize: 14,
                            color: canEdit ? Colors.text.primary : Colors.text.light
                        }}>{title}</Text>
                    </View>
                    {canEdit && <Image source={require('../../../../../images/aaxiot/airBottle/add_pic.png')}
                                       style={{marginRight: 5}}/>}
                </Pressable>
                {
                    (pictures && pictures.length > 0)
                        ?
                        <View style={{flexDirection: 'row', marginTop: 10}}>
                            {
                                pictures?.map((picture, index) => {
                                    let defaultSource = require('../../../../../images/add/add.png');
                                    return (
                                        <Pressable key={index} style={{}} onPress={() => {
                                            onPressPicture && onPressPicture(index);
                                        }}>
                                            {
                                                picture.needUpload ?
                                                    <UploadImage uploadType={UploadType.gas}
                                                                 uri={picture.uri!}
                                                                 name={picture.name!}
                                                                 style={{
                                                                     marginRight: 15,
                                                                     borderRadius: 5
                                                                  }}
                                                                  loadComplete={(imageResponse: any, success) => {
                                                                     picture.uploadComplete && picture.uploadComplete(success, picture.name);
                                                                  }}/>
                                                    :
                                                    <Image source={{uri: picture.uri}}
                                                           defaultSource={defaultSource}
                                                           style={styles.imageContainer}/>
                                            }
                                            {
                                                canEdit && picture.canRemove &&
                                                <Pressable
                                                    style={{position: 'absolute', right: 5, top: -10, padding: 5}}
                                                    onPress={() => {
                                                        removePictureCallBack && removePictureCallBack(picture);
                                                    }}>
                                                    <Image
                                                        source={require('../../../../../images/aaxiot/searchBar/clear.png')}
                                                        style={{
                                                            backgroundColor: Colors.background.primary,
                                                            width: 14,
                                                            height: 14,
                                                            borderRadius: 7,
                                                        }}/>
                                                </Pressable>
                                            }
                                        </Pressable>
                                    )
                                })
                            }
                        </View>
                        :
                        null
                }
                <View style={{
                    position: 'absolute',
                    left: 20,
                    right: 20,
                    bottom: 0,
                    height: 0.5,
                    backgroundColor: '#eee'
                }}/>
            </View>
        )
    }

    return (
        <ExpandHeader {...itemObj} content={
            <View style={{borderRadius: 5,}}>
                {itemObj.dataObj.map((obj, index: number) => {
                    return renderBucketItem(obj, index);
                })}
            </View>
        }/>
    )
}

const styles = StyleSheet.create({
    titleText: {
        fontSize: 15,
        color: "#333",
        fontWeight: '500',
    },
    imageContainer: {
        width: 80,
        height: 80,
        marginRight: 15,
        borderRadius: 5,
        // backgroundColor: Colors.theme
    }
})
