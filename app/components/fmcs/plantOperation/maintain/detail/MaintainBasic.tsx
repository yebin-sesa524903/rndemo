import React from "react";
import {FlatList, Text, View,} from 'react-native';

import {BasicMsgItem, BasicMsgItemProps} from "../../components/BasicMsgItem";
import {MaintainDetailItemType} from "../../defined/ConstDefined";
import {MaintainItems, MaintainItemsProps} from "./MaintainItems";
import {MaintainSummary, MaintainSummaryProps} from "./MaintainSummary";
import {MaintainPicture} from "./MaintainPicture";
import {MaintainNewItems} from "./MaintainNewItems";

export interface MaintainBasicProps {
    data: BasicMsgItemProps[] | MaintainItemsProps[] | MaintainSummaryProps[],
    onPressExpand?: Function,    ///展开/收起回调
    ///保养项相关 回调
    taskExpandCallBack?: (projectId: string) => void,
    resultsTextDidChange?: (text: string, id: string, contentType?: number) => void,
    remarkTextDidChange?: (text: string, id: string) => void,
    cancelCallBack?: (id: string) => void, ///取消点击
    saveCallBack?: (id: string) => void,    ///保存点击
    editCallBack?: (id: string, result: string, remark?: string) => void,
    ///异常总结 文字输入回调
    exceptTextChange?: (text: string) => void,
    ///设备运行总结 文字输入回调
    deviceTextChange?: (text: string) => void,

    ///图片相关
    addImageCallBack?: Function,///添加图片
    removeImageCallBack?: Function,///删除图片
    onPressImage?: Function,///放大图片
///底部按钮
    bottomActions?: Function,

}

/**
 * 保养任务 详情的 基本执行
 * @param props
 * @constructor
 */
export function MaintainBasic(props: MaintainBasicProps) {

    const renderItem = (item: any) => {
        let sectionType = item.sectionType;
        if (sectionType == MaintainDetailItemType.basicMsg) {
            return BasicMsgItem({...item, expandCallBack: props.onPressExpand});
        } else if (sectionType == MaintainDetailItemType.maintainItems) {
            ///保养项目
          return MaintainNewItems({
              ...item,
            expandCallBack: props.onPressExpand,
            taskExpandCallBack: props.taskExpandCallBack,
            doResultCallBack: props.resultsTextDidChange,
            tipsTextDidChange: props.remarkTextDidChange,
              cancelCallBack: props.cancelCallBack,
              saveCallBack: props.saveCallBack,
              editCallBack: props.editCallBack,
            });

            // return MaintainItems({
            //     ...item,
            //     expandCallBack: props.onPressExpand,
            //     taskExpandCallBack: props.taskExpandCallBack,
            //     resultsTextDidChange: props.resultsTextDidChange,
            //     tipsTextDidChange: props.remarkTextDidChange,
            //     cancelCallBack: props.cancelCallBack,
            //     saveCallBack: props.saveCallBack,
            //     editCallBack: props.editCallBack,
            // });
        } else if (sectionType == MaintainDetailItemType.summaryExcept || sectionType == MaintainDetailItemType.summaryDevice) {
            ///异常总结/设备运行总结
            return MaintainSummary({
                ...item,
                expandCallBack: props.onPressExpand,
                textDidChange: sectionType == MaintainDetailItemType.summaryExcept ? props.exceptTextChange : props.deviceTextChange
            });
        } else if (sectionType == MaintainDetailItemType.maintainPicture) {
            return MaintainPicture({
                ...item,
                expandCallBack: props.onPressExpand,
                addImageCallBack: props.addImageCallBack,
                removeImageCallBack: props.removeImageCallBack,
                onPressImage: props.onPressImage,
            });
        }
        return (
            <></>
        )
    }

    return (
        <View style={{flex: 1}}>
            <FlatList contentContainerStyle={{paddingBottom: 20}}
                      data={props.data}
                // @ts-ignore
                      keyExtractor={(item, index) => item.title}
                      renderItem={(item) => renderItem(item.item)}/>
            {props.bottomActions && props.bottomActions()}
        </View>

    )
}
