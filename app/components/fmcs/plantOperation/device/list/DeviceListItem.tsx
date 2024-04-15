import React from "react";
import {Image, Pressable, StyleSheet, Text, View} from "react-native";
import Colors, {isDarkMode} from "../../../../../utils/const/Colors";
import {getImageHost} from "../../../../../middleware/api";
import storage from "../../../../../utils/storage";
import {localStr} from "../../../../../utils/Localizations/localization";

export interface DeviceListItemProps {
    id?: number,///出库id
    deviceCode: string,
    deviceName: string,
    hierarchy: string,//设备层级
    //总称类型型号
    deviceClass: string,
    deviceType: string,
    deviceSpecification: string,
    status: string,
}

export function getStatusInfo(status: number) {
    let ret = {
        label: '',
        textColor: '',
        borderColor: '',
        bgColor: '',
    };
    switch (status) {
        case -1:
            ret.label = localStr('lang_asset_status_stop');
            ret.textColor = Colors.seTextTitle;
            ret.borderColor = Colors.seBorderBase;
            ret.bgColor = Colors.seFill3;
            break;
        case 0:
            ret.label = localStr('lang_asset_status_using');
            ret.textColor = Colors.seSuccessNormal;
            ret.borderColor = Colors.seSuccessBorder
            ret.bgColor = Colors.seSuccessBg;
            break;
        case 2:
            ret.label = localStr('lang_asset_status_idle');
            ret.textColor = Colors.seTextTitle;
            ret.borderColor = Colors.seBorderBase;
            ret.bgColor = Colors.seFill3;
            break;
        case 3:
            ret.label = localStr('lang_asset_status_transfer');
            ret.textColor = Colors.seInfoNormal;
            ret.borderColor = Colors.seInfoBorder;
            ret.bgColor = Colors.seInfoBg;
            break;
        case 4:
            ret.label = localStr('lang_asset_status_repairing');
            ret.textColor = Colors.seWarningNormal;
            ret.borderColor = Colors.seWarningBorder;
            ret.bgColor = Colors.seWarningBg;
            break;
        case 5:
            ret.label = localStr('lang_asset_status_offline');
            ret.textColor = Colors.seTextTitle;
            ret.borderColor = Colors.seBorderBase;
            ret.bgColor = Colors.seFill3;
            break;
        default:
            return null;
    }
    return ret;
}

//这里就是一个业务组件
export function DeviceImage(props: any) {
    let imageId = props.imageId
    if(imageId) {
        let url = getImageHost() + imageId//`/lego-bff/bff/ledger/rest/downloadFile?id=${imageId}`
        return (
            <Image source={{uri: url,headers:{Cookie:storage.getOssToken()}}} resizeMode={'cover'}
                   style={{width:60,height:60}}/>
        )
    }
    return (
        <Image source={isDarkMode() ? require('../../../../../images/document_list/placeholder_dark.png') : require('../../../../../images/document_list/placeholder.png')} resizeMode={'cover'}
               style={{width:60,height:60}}/>


    )
}

/**
 * 关联工具领用 item
 * @param itemObj
 * @param onPress
 * @constructor
 */
export function DeviceListItem(itemObj: DeviceListItemProps | any, onPress?: Function,) {
    const statusInfo = getStatusInfo(itemObj.deviceStatus);
    return (
        <Pressable style={styles.container}
                   onPress={() => {
                       onPress && onPress(itemObj);
                   }}>
            <View style={{flexDirection:'row',}}>
                <View style={{borderRadius:2,padding:2,borderWidth:1,height:64,justifyContent:'center',borderColor:Colors.seBorderSplit}}>
                    {/*<Image source={require('../../../../../images/document_list/img.png')} style={{width:60,height:60,tintColor:Colors.theme}}/>*/}
                    <DeviceImage imageId={itemObj.logo} deviceCode={itemObj.deviceCode}/>
                </View>
                <View style={{flex:1,marginLeft:12}}>
                    <View style={{flexDirection:'row',alignItems:'center'}}>
                        <Text numberOfLines={1} style={[styles.mainText,{flex:1,fontSize:16, fontWeight: 'bold'}]}>{`${itemObj.deviceName}`}</Text>
                        {
                            !statusInfo ? null :
                                <View style={{backgroundColor:statusInfo.bgColor,borderRadius:4,borderWidth:1,
                                    borderColor:statusInfo.borderColor,height: 22, alignItems:'center', justifyContent:'center', paddingLeft: 8, paddingRight: 8}}>
                                    <Text style={{fontSize:12,color:statusInfo.textColor}}>{`${statusInfo.label}`}</Text>
                                </View>
                        }
                    </View>
                    <Text numberOfLines={1} style={[styles.lightText,{marginBottom:10,marginTop:6}]}>{`${localStr('lang_asset_code')}:${itemObj.deviceCode}`}</Text>
                    <Text numberOfLines={1} style={styles.lightText}>{`${localStr('lang_asset_location')}：${itemObj.locations || '--'}`}</Text>
                </View>
            </View>
            <View style={{backgroundColor: Colors.seBorderSplit, height: 1, position:'absolute', left: 12, right: 12, bottom: 0}}/>
        </Pressable>
    )
}

// @ts-ignore
const styles = global.amStyleProxy(()=>StyleSheet.create({
    container: {
        backgroundColor: Colors.seBgContainer,
        padding:16,
        marginTop:8,
        marginLeft: 8,
        marginRight: 8,
    },
    pressContainer: {
        marginTop: 5,
        paddingLeft: 15,
        paddingRight: 15
    },
    numberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    toolNameContainer:{
        flex: 1,
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },

    userContainer: {
        flex: 1,
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },

    mainText: {
        fontSize: 12,
        color: Colors.seTextTitle,
    },
    lightText: {
        fontSize: 12,
        color: Colors.seTextPrimary
    },
    userLeftContainer: {
        flexDirection: 'row',
    },
    dateContainer: {
        flexDirection: 'row',
        flex: 0.5,
        justifyContent:'flex-end',
    },
}))
