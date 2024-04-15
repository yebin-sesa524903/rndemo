import React from "react";
import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
import {IconFill} from "@ant-design/icons-react-native";
import Colors from "../../../../../utils/const/Colors";
import {MaintainDetailItemType} from "../../defined/ConstDefined";
import {ExpandHeader, ExpandHeaderProps} from "../../components/ExpandHeader";
import {isEmptyString} from "../../../../../utils/const/Consts";

export interface MaintainSummaryProps extends ExpandHeaderProps {
    sectionType?: MaintainDetailItemType,///item 类型
    value?: string,///输入框默认值
    canEdit?: boolean, ///是否可编辑
    textDidChange?: Function,///输入框文字变化回调
}

/**
 * 保养详情 总结item 输入框
 * @param props
 * @constructor
 */
export function MaintainSummary(props: MaintainSummaryProps) {
    return (
        <ExpandHeader {...props}
                      content={
                          <View style={{
                              paddingLeft: 15,
                              paddingRight: 15,
                              paddingBottom: 15
                          }}>
                              {
                                  props.canEdit ?
                                      <TextInput style={styles.textInput}
                                                 placeholder={'请输入'}
                                                 value={props.value}
                                                 textAlignVertical={'top'}
                                                 onChangeText={(text) => {
                                                     props.textDidChange && props.textDidChange(text);
                                                 }}
                                                 maxLength={1000}/>
                                      :
                                      <Text style={styles.textInputNoBorder}
                                            numberOfLines={0}>{isEmptyString(props.value) ? '-' : props.value}</Text>
                              }
                          </View>
                      }/>
    )
}

const styles = StyleSheet.create({
    textInput: {
        fontSize: 14,
        color: Colors.text.primary,
        height: 80,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    textInputNoBorder: {
        fontSize: 14,
        color: Colors.text.primary,
    }
})
