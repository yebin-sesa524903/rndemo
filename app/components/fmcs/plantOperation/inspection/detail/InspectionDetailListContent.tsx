import React from "react";
import { InspectionDetailItemType } from "../../defined/ConstDefined";
import { ExpandHeaderProps } from "../../components/ExpandHeader";
import { BasicMsgItem, BasicMsgItemProps } from "../../components/BasicMsgItem";
import { InspectionRangeItem, InspectionRangeItemProps } from "./InspectionRangeItem";
import { FlatList, View } from "react-native";
import { InspectionTaskItem } from "./InspectionTaskItem";
import { InspectionSummary } from "./InspectionSummary";

export interface InspectionDetailListContentProps extends ExpandHeaderProps {
  data?: BasicMsgItemProps[]|InspectionRangeItemProps[],
  onPressExpand?: Function,

  onSwitchItem?: Function,///巡检范围 待巡检/已完成切换 点击
  onPressWaitItem?:Function,///待巡检项点击
  onPressDoneItem?: Function,///已完成巡检项点击

  ///巡检总结回调
  onPressTaskResult?: Function, ///巡检结果点击
  remarkTextOnChange?: Function,///说明文字变化
  summaryTextOnChange?: Function,///总结文字变化

}

/**
 * 巡检详情
 * @param props
 * @constructor
 */
export function InspectionDetailListContent(props: InspectionDetailListContentProps) {

  const renderItem=(itemObj: any) => {
    if (itemObj.sectionType==InspectionDetailItemType.basicMsg) {
      return <BasicMsgItem {...itemObj} expandCallBack={props.onPressExpand} />
    } else if (itemObj.sectionType==InspectionDetailItemType.range) {
      return <InspectionRangeItem {...itemObj}
                                  onSwitchItem={props.onSwitchItem}
                                  onPressWaitItem={props.onPressWaitItem}
                                  onPressDoneItem={props.onPressDoneItem}
                                  expandCallBack={props.onPressExpand} />
    } else if (itemObj.sectionType==InspectionDetailItemType.summary) {
      return <InspectionSummary {...itemObj}
        expandCallBack={props.onPressExpand}
        onPressTaskResult={props.onPressTaskResult}
        remarkTextOnChange={props.remarkTextOnChange}
        summaryTextOnChange={props.summaryTextOnChange}
      />
    }
    return (
      <></>
    )
  }


  return (
    <FlatList keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 20 }}
      data={props.data}
      // @ts-ignore
      keyExtractor={(item, index) => item.title}
      renderItem={(item) => renderItem(item.item)} />
  )
}
