import {ExpandHeader, ExpandHeaderProps} from "../../plantOperation/components/ExpandHeader";
import React from "react";
import {Pressable, StyleSheet, Text, View} from "react-native";
import Colors from "../../../../utils/const/Colors";
import {isEmptyString} from "../../../../utils/const/Consts";

export interface AlarmDetailBasicInfoProps extends ExpandHeaderProps {
  data?: { title: string, subTitle: string , value?: string, category?: string, threshold?: string}[],
  remarkTitle?: string,
  remark?: string,
  onPressDetail?: Function,
}

export function AlarmDetailBasicInfo(props: AlarmDetailBasicInfoProps) {

  const getNameCategory = (name: string, cate: string, value: string, threshold: string)=>{
    let unit = '';
    if (!isEmptyString(name)){
      let categories = name.split(' ');
      for (let category of categories) {
        if (category.indexOf(cate) != -1 || category.indexOf(value) != -1 || category.indexOf(threshold) != -1){
          continue;
        }
        unit = category;
      }
    }
    return unit;
  }
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
                  }}>{datum.title}</Text>
                  {
                    (datum.threshold && datum.value && datum.category) ?
                      <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={styles.warningTime}>
                          {datum.category}
                          <Text style={styles.greenText}> {getNameCategory(datum.subTitle, datum.category, datum.value, datum.threshold)}</Text>
                        </Text>
                        <Text style={styles.warningTime}>
                          当前值
                          <Text style={styles.yellowText}> {datum.value}</Text>
                        </Text>
                        <Text style={styles.warningTime}>
                          设定值
                          <Text style={styles.greenText}> {datum.threshold}</Text>
                        </Text>
                      </View>
                      :
                      <Text style={{
                        fontSize: 13,
                        color: Colors.text.primary,
                        flex: 1,
                        fontWeight:'500'
                      }}>{datum.subTitle}</Text>
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


const styles = StyleSheet.create({
  warningTime: {
    fontSize: 13,
    color: Colors.text.primary,
    fontWeight: 'bold',
    marginRight: 12,
  },
  greenText: {
    fontSize: 15,
    color: Colors.green.sub,
    paddingLeft: 3,
  },
  yellowText: {
    fontSize: 15,
    color: Colors.yellow.sub,
    paddingLeft: 3,
  },
})
