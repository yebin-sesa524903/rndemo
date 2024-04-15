import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ExpandHeader, ExpandHeaderProps } from "../../components/ExpandHeader";

import Colors from "../../../../../utils/const/Colors";
// @ts-ignore
import ModalDropdown from "react-native-modal-dropdown";
import { isEmptyString } from "../../../../../utils/const/Consts";

export interface InspectionSummaryProps extends ExpandHeaderProps {
  status?: string,///巡检状态
  canEdit?: boolean,///是否可编辑  false不可编辑只能查看  true 可编辑可输入文字可选择巡检结果
  result?: string,///巡检结果
  onPressTaskResult?: Function, ///巡检结果点击
  remark?: string,///说明文字
  remarkTextOnChange?: Function,///说明文字变化
  summary?: string,///总结文字
  summaryTextOnChange?: Function,///总结文字变化
}

export function InspectionSummary(props: InspectionSummaryProps) {

  const renderInputContent=(title: string, textOnChange: Function, value?: string,) => {
    return (
      <View style={{}}>
        <Text style={{ fontSize: 13, color: Colors.text.primary }}>{title}</Text>
        {
          props.canEdit?
            <TextInput style={styles.inputText}
              placeholder={'请输入'}
              maxLength={1000}
              defaultValue={value}
              onChangeText={(text) => {
                textOnChange&&textOnChange(text);
              }} />
            :
            <Text style={{ fontSize: 14, color: Colors.text.primary, marginTop: 12, marginBottom: 15 }}>{value??'-'}</Text>
        }
      </View>
    )
  }

  const renderContent=() => {
    return (
      <View style={{ paddingLeft: 15, paddingRight: 15 }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 15
        }}>
          <View style={{ flexDirection: 'row', flex: 1, }}>
            <Text style={{ color: 'red' }}>*</Text>
            <Text style={{ color: Colors.text.primary, fontSize: 14 }}>巡检结果</Text>
          </View>
          <View style={{
            flex: 3,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingRight: 12,
          }}>
            <ModalDropdown style={{ flex: 1 }}
              disabled={!props.canEdit}
              options={['正常', '异常']}
              defaultValue={props.canEdit? (isEmptyString(props.result)? '请选择':props.result):(props.result??'-')}
              defaultTextStyle={{ fontSize: 14, color: Colors.text.light }}
              textStyle={{ fontSize: 14, color: Colors.text.primary }}
              dropdownStyle={{
                flex: 1,
                height: 80,
                width: 100,
              }}
              dropdownTextStyle={{
                fontSize: 14, color: Colors.text.primary
              }}
              adjustFrame={(position: any) => {
                return {
                  top: (position.top??0)-10,
                  left: position.left,
                  right: position.right
                }
              }}
              onSelect={(index: number) => {
                props.onPressTaskResult&&props.onPressTaskResult(index);
              }}
              dropdownListProps={{ ListHeaderComponent: <></> }} />
            {props.canEdit&&<Image source={require('../../../../../images/aaxiot/airBottle/arrow_right.png')} />}
          </View>

        </View>
        <View style={{ backgroundColor: Colors.background.primary, height: 1, marginBottom: 15 }} />
        {renderInputContent(
          '说明',
          (text: string) => {
            props.remarkTextOnChange&&props.remarkTextOnChange(text);
          },
          props.remark)}
        {renderInputContent(
          '总结',
          (text: string) => {
            props.summaryTextOnChange&&props.summaryTextOnChange(text);
          },
          props.summary)}
      </View>
    )
  }
  return <ExpandHeader {...props} content={renderContent()} />
}

const styles=StyleSheet.create({
  inputText: {
    fontSize: 13,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 80,
    textAlignVertical: 'top',
    marginTop: 15,
    marginBottom: 15,
    borderRadius: 2,
  },
})
