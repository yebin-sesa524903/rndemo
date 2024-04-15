import React from "react";
import {FlatList, StyleSheet, View} from "react-native";
import {BasicMsgItem, BasicMsgItemProps} from "../../components/BasicMsgItem";
import {RepairDetailItemType} from "../../defined/ConstDefined";
import {RepairRecords, RepairRecordsProps} from "./RepairRecords";
import {MaintainPicture} from "../../maintain/detail/MaintainPicture";

export interface RepairBasicProps {
    data?: BasicMsgItemProps[] | RepairRecordsProps[],
    onPressExpand?: Function,    ///展开/收起回调
    isPending?: boolean,///是否是待审批
    ///维修记录相关回调
    faultPhenomenonTextChange?: Function;///故障现象输入回调
    faultCauseTextChange?: Function;///故障原因 输入回调
    addRecordCallBack?: Function;    ///添加记录
    saveRecordCallBack?: Function;///保存记录点击
    cancelCallBack?: Function;  ///取消记录点击
    repairTaskTextChange?: Function;///维修项目文字变化
    repairRecordTextChange?: Function;  ///维修实施记录文字变化
    deleteCallBack?: Function;///删除点击
    editCallBack?: Function;///编辑点击

    ///图片相关
    addImageCallBack?: Function,///添加图片
    removeImageCallBack?: Function,///删除图片
    onPressImage?: Function,///放大图片
    ///底部按钮
    bottomActions?: Function,
}

export function RepairBasic(props: RepairBasicProps) {

    const renderItem = (itemObj: any) => {
        let sectionType = itemObj.sectionType;
        if (sectionType == RepairDetailItemType.basicMsg) {
            ///基本信息
            return BasicMsgItem({
                ...itemObj,
                expandCallBack: props.onPressExpand,
                onPressPicture: (index: number)=>{
                    props.onPressImage && props.onPressImage(index, true);
                }
            });
        } else if (sectionType == RepairDetailItemType.repairRecords) {
            if (!props.isPending) {
                ///维修记录
                return RepairRecords({
                    ...itemObj,
                    expandCallBack: props.onPressExpand,
                    ...props,
                });
            }
        } else if (sectionType == RepairDetailItemType.repairPicture) {
            if (!props.isPending) {
                return MaintainPicture({
                    ...itemObj,
                    expandCallBack: props.onPressExpand,
                    addImageCallBack: props.addImageCallBack,
                    removeImageCallBack: props.removeImageCallBack,
                    onPressImage: props.onPressImage
                });
            }
        }
        return (
            <View>

            </View>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
})

