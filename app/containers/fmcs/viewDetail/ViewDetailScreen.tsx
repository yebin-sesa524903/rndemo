import React from "react";
import {InteractionManager, ScrollView, View, Text, StyleSheet} from "react-native";
import Colors from "../../../utils/const/Colors";
// @ts-ignore
import Toolbar from "../../../components/Toolbar";
import RenderHtml from 'react-native-render-html';
import {screenWidth} from "../../../utils/const/Consts";
import WebView from "react-native-webview";

export interface ViewDetailScreenProps {
  navigator: any,
  title: string,
  remark: string,
}

const htmlProps = {
  WebView,
  renderersProps: {
    table: {
      animationType: 'animated',
      displayMode:'embedded',
      tableStyleSpecs: {
        outerBorderWidthPx: 1,
        rowsBorderWidthPx: 1,
        columnsBorderWidthPx: 1,
        fitContainerWidth: false,
      },
      webViewProps:{
        scalesPageToFit: false,
      },
    },
  },
  tagsStyles: {
    table: {
      flex: 1
    }
  },

}
/**
 * 查看详情页
 * @param props
 * @constructor
 */
export default function ViewDetailScreen(props: ViewDetailScreenProps) {
  /**
   * 返回按钮点击
   */
  const onPopBack = () => {
    InteractionManager.runAfterInteractions(() => {
      props.navigator.pop();
    });
  }

  const renderHtmlView = (remark: string)=>{
    let content = '<div style="white-space: pre">' + remark + '</div>';
    return <RenderHtml source={{html:content}}
                       contentWidth={screenWidth() - 30}
                       {...htmlProps}
                       renderersProps={{
                         ...htmlProps.renderersProps
                       }}
                       debug={false}
    />
  }

  const renderContent = () => {
    return (
      <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
        {
          (props.remark.indexOf('<p') != -1 || props.remark.indexOf('<div') != -1) ?
            renderHtmlView(props.remark)
            :
            <Text style={{fontSize: 14, color: Colors.text.primary}}>{props.remark}</Text>
        }
      </ScrollView>
    )
  }

  return (
    <View style={{flex: 1, backgroundColor: Colors.background.primary}}>
      <Toolbar title={props.title}
               navIcon="back"
               onIconClicked={onPopBack}
      />
      <View style={{
        flex: 1,
        borderRadius: 3,
        backgroundColor: Colors.white,
        margin: 12,
        paddingHorizontal: 15,
        paddingVertical: 10
      }}>
        {renderContent()}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  p: {fontSize: 13, color: Colors.text.primary}
});
