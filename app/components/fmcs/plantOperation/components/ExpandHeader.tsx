import React from "react";
import {Image, Pressable, Text, View} from "react-native";
import Colors from "../../../../utils/const/Colors";
import {IconFill} from "@ant-design/icons-react-native";

export interface ExpandHeaderProps {
  icon?: any,
  title?: string,
  subTitle?: string,
  isExpand?: boolean,///是否展开 true 展开;  false 收起
  expandCallBack?: Function,
  sectionType?: number,
  topRightContent?: React.ReactElement,///头部右侧按钮
  content?: React.ReactElement,   ///底部要展示的内容
}

/**
 * 展开收起 公用头部
 * @param props
 * @constructor
 */
export function ExpandHeader(props: ExpandHeaderProps) {
  return (
    <View style={{borderRadius: 5, backgroundColor: Colors.seBgContainer, marginLeft: 10, marginRight: 10, marginTop: 12}}>
      <View style={{
        flexDirection: 'row',
        height: 44,
        paddingLeft: 15,
        paddingRight: 15,
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          {props.icon && <Image source={props.icon} style={{width: 15, height: 15, marginRight: 6}}/>}
          <Text style={{fontWeight: 'bold', fontSize: 15, color: Colors.seTextPrimary}}>{props.title}</Text>
          {
            props.subTitle && <Text style={{
              marginLeft: 15,
              color: Colors.seBrandNomarl,
              fontSize: 12,
              backgroundColor: Colors.seBgLayout,
              paddingHorizontal: 5,
              paddingVertical: 3
            }}>{props.subTitle}</Text>
          }
        </View>
        <View style={{flexDirection:'row', alignItems:'center'}}>
          {props.topRightContent}
          <Pressable style={{width: 30, height: 30, alignItems: 'center', justifyContent: 'center'}}
                     onPress={() => {
                       props.expandCallBack && props.expandCallBack(props.sectionType);
                     }}>
            <IconFill name={props.isExpand ? 'up-circle' : 'down-circle'} size={16} color={Colors.seBrandNomarl}/>
          </Pressable>
        </View>

      </View>
      {
        props.isExpand && props.content
      }
    </View>
  )
}


