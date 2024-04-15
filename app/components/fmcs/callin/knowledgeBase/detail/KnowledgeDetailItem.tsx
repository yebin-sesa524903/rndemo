import {Pressable, StyleSheet, Text, View} from "react-native";
import Colors from "../../../../../utils/const/Colors";
import {ExpandHeader} from "../../../plantOperation/components/ExpandHeader";
import React from "react";
// @ts-ignore
import RenderHtml from 'react-native-render-html';
import {screenWidth} from "../../../../../utils/const/Consts";

export interface KnowledgeDetailItemProps {
  data?: { title: string, subTitle: string , showSeeMore?: boolean}[],
  onPressSeeDetail? : Function, ///点击查看明细
}
export function KnowledgeDetailItem(props: KnowledgeDetailItemProps) {
  const renderSeeMoreItem = (seeMore: { title: string, subTitle: string , showSeeMore?: boolean})=>{
    return (
      <View key= {seeMore.title}
            style={{}}>
        <View style={{flexDirection: 'row', padding: 13, alignItems: 'center'}}>
          <Text style={{
            fontSize: 13,
            color: Colors.text.light,
            fontWeight: '500',
            width: 100,
          }}>{seeMore.title}</Text>
          <Pressable style={{alignItems: 'center', flexDirection: 'row'}}
                     onPress={() => {
                       props.onPressSeeDetail && props.onPressSeeDetail(seeMore);
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
          {
            (seeMore.subTitle.indexOf('<p') != -1 || seeMore.subTitle.indexOf('<div') != -1) ?
              <RenderHtml source={{html:seeMore.subTitle}} contentWidth={screenWidth() - 30}/>
              :
              <Text style={{fontSize: 13, color: Colors.text.primary, flex: 1}}
                    numberOfLines={3}>{seeMore.subTitle}</Text>
          }
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
  }

  const renderContent = () => {
    return (
      <View style={{}}>
        {
          props.data?.map((datum) => {
            if (datum.showSeeMore){
              return renderSeeMoreItem(datum);
            }
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
      </View>
    )
  }
  return (
    <ExpandHeader {...props} content={renderContent()}/>
  )
}

const styles = StyleSheet.create({
  p: {fontSize: 13, color: Colors.text.primary}
});
