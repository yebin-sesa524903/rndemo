import {AbnormalDetailItemType} from "../../defined/ConstDefined";
import {ExpandHeader, ExpandHeaderProps} from "../../components/ExpandHeader";
import React from "react";
import {Pressable, Text, TextInput, View} from "react-native";
import Colors from "../../../../../utils/const/Colors";


export interface AbnormalBasicMsgItemProps extends ExpandHeaderProps {
  sectionType?: AbnormalDetailItemType,
  dataObj?: {
    title?: string,
    content?: string,
  }[],
  remarkTitle?: string,
  remark?: '',
  onPressViewDetail?: Function,
}

export function AbnormalBasicMsgItem(props: AbnormalBasicMsgItemProps) {
  const renderAbnormalListInfo = (item: any, index: number) => {
    return (
      <View key={item.title}
            style={{flexDirection: 'row', height: 45, alignItems: 'center'}}>
        <Text
          style={{fontSize: 14, color: Colors.text.sub, fontWeight: '500', width: 100}}>{item.title}</Text>
        <Text numberOfLines={2} style={{
          fontSize: 14,
          color: Colors.text.primary,
          flex: 1
        }}>{item.content}</Text>
        <View
          style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 0.5, backgroundColor: '#eee'}}/>
      </View>
    )
  }
  const configItems = () => {
    let itemObj = props;
    return (
      <View style={{backgroundColor: 'white', borderRadius: 2, paddingHorizontal: 15}}>
        {
          itemObj.dataObj!.map((item, index: number) => {
            return renderAbnormalListInfo(item, index)
          })
        }

        <View style={{flexDirection: 'row', paddingVertical: 13, alignItems: 'center'}}>
          <Text style={{
            fontSize: 14,
            color: Colors.text.sub,
            width: 100,
          }}>{itemObj.remarkTitle}</Text>
          <Pressable style={{alignItems: 'center', flexDirection: 'row'}}
                     onPress={() => {
                       props.onPressViewDetail && props.onPressViewDetail(itemObj);
                     }}>
            <Text
              style={{fontSize: 13, color: Colors.theme, textDecorationLine: 'underline'}}>查看明细</Text>
          </Pressable>
        </View>
        <View style={{
          alignItems: 'center',
          flexDirection: 'row',
          marginTop: 15,
          marginBottom: 15
        }}>
          <Text style={{fontSize: 14, color: Colors.text.primary, flex: 1}}
                numberOfLines={1}>{itemObj.remark}</Text>
        </View>
      </View>
    )
  }
  return (
    <ExpandHeader {...props}
                  content={
                    configItems()
                  }/>
  )
}
