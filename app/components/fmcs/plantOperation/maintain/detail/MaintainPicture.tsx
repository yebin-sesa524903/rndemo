import React from "react";
import {
    Image,
    Pressable, StyleSheet,
    Text,
    View
} from "react-native";
import Colors from "../../../../../utils/const/Colors";
import {MaintainDetailItemType} from "../../defined/ConstDefined";
import {ExpandHeader, ExpandHeaderProps} from "../../components/ExpandHeader";
import UploadableImage from "../../../../UploadableImage";


export interface MaintainPictureProps extends ExpandHeaderProps {
    sectionType?: MaintainDetailItemType,///item 类型
    canEdit?: boolean, ///是否可编辑
    images?: MaintainImages[],
    addImageCallBack?: Function,///添加图片点击
    removeImageCallBack?: Function,///图片删除点击
    onPressImage?: Function,///图片放大点击
}


export interface MaintainImages {
    id?: number,
    deviceId?: number,
    uri?: string, ///图片地址 file://user/...
    name?: string, ///图片名称
    needUpload?: boolean ///是否需要上传
    canRemove?: boolean,    ///是否可以删除, 需要上传但是没有上传成功 不可删除
    uploadComplete?: Function   ///上传结束回调  返回上传是否成功
}

/**
 * 保养详情 添加图片
 * @param props
 * @constructor
 */
export function MaintainPicture(props: MaintainPictureProps) {

    const configPictureItem = () => {
        const {canEdit, addImageCallBack, images, onPressImage, removeImageCallBack} = props;
        return (
            <View style={{padding: 15, paddingTop: 0}}>
                <Pressable style={{flexDirection: 'row', justifyContent: 'space-between'}}
                           disabled={!canEdit}
                           onPress={() => {
                               addImageCallBack && addImageCallBack();
                           }}>
                    <View style={{flexDirection: 'row',}}>
                        <Text style={{fontSize: 15, color: Colors.text.primary}}>{`已上传${images?.length}张图片`}</Text>
                    </View>
                    {canEdit && <Image source={require('../../../../../images/aaxiot/airBottle/add_pic.png')}
                                       style={{marginRight: 5}}/>}
                </Pressable>
                {
                    (images && images.length > 0)
                        ?
                        <View style={{flexDirection: 'row', flexWrap:'wrap'}}>
                            {
                                images?.map((image, index) => {
                                    let defaultSource = require('../../../../../images/add/add.png');
                                    return (
                                        <Pressable key={(image.id??'') + (image.name??'')}
                                                   onPress={() => {
                                                       onPressImage && onPressImage(index);
                                                   }}>
                                            {
                                                image.needUpload ?
                                                    <UploadableImage postUri={'ledger/rest/fileUpload'}
                                                                     uri={image.uri}
                                                                     name={image.name}
                                                                     deviceId={image.deviceId}
                                                                     resizeMode="cover"
                                                                     width={80}
                                                                     height={80}
                                                                     style={{
                                                                         marginRight: 15,
                                                                         borderRadius: 5,
                                                                         marginTop: 10,
                                                                     }}
                                                                     loadComplete={(imageResponse: any) => {
                                                                         image.uploadComplete && image.uploadComplete(imageResponse);
                                                                     }}
                                                                     />
                                                    :
                                                    <Image source={{uri: image.uri}}
                                                           defaultSource={defaultSource}
                                                           style={styles.imageContainer}/>
                                            }
                                            {
                                                canEdit && image.canRemove &&
                                                <Pressable
                                                    style={{position: 'absolute', right: 5, top: 0, padding: 5}}
                                                    onPress={() => {
                                                        removeImageCallBack && removeImageCallBack(image);
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
            </View>
        )
    }

    return (
        <ExpandHeader {...props} content={configPictureItem()}/>
    )
}

const styles = StyleSheet.create({
    imageContainer: {
        width: 80,
        height: 80,
        marginRight: 15,
        borderRadius: 5,
        marginTop: 10,
    }
})
