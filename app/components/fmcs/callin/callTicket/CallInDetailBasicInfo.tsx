import {ExpandHeader, ExpandHeaderProps} from "../../plantOperation/components/ExpandHeader";
import React from "react";
import {Pressable, Text, View} from "react-native";
import Colors from "../../../../utils/const/Colors";

export interface CallInDetailBasicInfoProps extends ExpandHeaderProps {
  data?: { title: string, subTitle: string }[],
  remarkTitle?: string,
  remark?: string,
  onPressDetail?: Function,
}

export function CallInDetailBasicInfo(props: CallInDetailBasicInfoProps) {
  const renderContent = () => {
    return (
      <View style={{}}>
        {
          props.data?.map((datum) => {
            return (
              <View key={datum.title + (datum.subTitle ?? '-')}
                    style={{
                      padding: 13,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  flex: 1,
                }}>
                  <Text style={{
                    width: 100,
                    fontSize: 13,
                    color: Colors.text.light,
                    fontWeight: '500',
                  }}>{datum.title}</Text>
                  <Text style={{
                    fontSize: 13,
                    color: Colors.text.primary,
                    flex: 1,
                    fontWeight: '500'
                  }}>{datum.subTitle}</Text>
                </View>

                <View style={{
                  position: 'absolute',
                  left: 15,
                  right: 15,
                  bottom: 0,
                  height: 0.5,
                  backgroundColor: Colors.gray.primary
                }}/>
              </View>
            )
          })
        }
        <View style={{flexDirection: 'row', padding: 13, alignItems: 'center'}}>
          <Text style={{
            fontSize: 13,
            color: Colors.text.light,
            fontWeight: '500',
            width: 100,
          }}>{props.remarkTitle}</Text>
          <Pressable style={{alignItems: 'center', flexDirection: 'row'}}
                     onPress={() => {
                       props.onPressDetail && props.onPressDetail(props.remarkTitle, props.remark)
                     }}>
            <Text
              style={{fontSize: 13, color: Colors.theme, textDecorationLine: 'underline'}}>查看明细</Text>
          </Pressable>
        </View>

        <View style={{
          alignItems: 'center',
          flexDirection: 'row',
          marginBottom: 15,
          paddingLeft: 13,
          paddingRight: 13
        }}>
          <Text style={{fontSize: 13, color: Colors.text.primary, flex: 1}}
                numberOfLines={3}>{props.remark}</Text>
        </View>
      </View>
    )
  }
  return (
    <ExpandHeader {...props} content={renderContent()}/>
  )
}
