import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import Colors from "../../../../../utils/const/Colors";
import EmptyView from "../../../../../utils/refreshList/EmptyView";
import { isEmptyString, screenHeight } from "../../../../../utils/const/Consts";

export interface MaintainReplacementProps {
  relationalCallBack?: Function,  ///关联备件出库回调
  createCallBack?: Function,//创建备件出库回调
  onPressRemove?: Function,///移除按钮点击
  pressTitle?: string,        ///关联按钮文字
  pressTitle2?: string,
  data?: MaintainReplacementData[],
}

export interface MaintainReplacementData {
  id?: number,
  taskId?: number,
  noTitle?: string,   ///出库/领用单号 标题
  userTitle?: string, ///领用人标题
  outboundNo?: string,   ///出库单号
  recipients?: string,///领用人
  data?: MaintainReplacementDataItem[][],///备件数组
}

export interface MaintainReplacementDataItem {
  name?: string,  ///名称
  value?: string,
}

/**
 * 保养详情 备件更换
 * @constructor
 */
export function MaintainReplacement(props: MaintainReplacementProps) {
  const renderReplacementItem=(itemObj: MaintainReplacementData, index: number) => {
    const { noTitle, userTitle, outboundNo, recipients, data }=itemObj
    return (
      <View key={(outboundNo??'')+String(index)}
        style={styles.replacementContainer}>
        {
          !isEmptyString(props.pressTitle)&&<View style={styles.lineView} />
        }

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ paddingTop: 15, paddingBottom: 15, flex: 1 }}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.noText}>{noTitle}</Text>
              <Text style={styles.noValueText}>{outboundNo}</Text>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 10 }}>
              <Text style={styles.noText}>{userTitle}</Text>
              <Text style={[styles.noValueText, { flex: 1 }]}>{recipients}</Text>
            </View>
          </View>
          {
            !isEmptyString(props.pressTitle)&&
            <Pressable style={styles.removeContent}
              onPress={() => {
                props.onPressRemove&&props.onPressRemove(itemObj);
              }}>
              <Text style={styles.removeText}>移除</Text>
            </Pressable>
          }

        </View>
        {
          data?.map((item, index) => {
            return item.map((itemData, index) => {
              return (
                <View key={(itemData.name??'')+index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingTop: 15,
                    paddingBottom: 15,
                  }}>
                  <Text style={{
                    fontSize: 13,
                    color: index==0? Colors.text.primary:Colors.text.light,
                    width: 100
                  }}>{itemData.name}</Text>
                  <Text style={{
                    fontSize: 13,
                    color: Colors.text.primary,
                    marginLeft: 10,
                    flex: 1,
                  }}>{itemData.value}</Text>
                  <View style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    height: 0.5,
                    backgroundColor: '#eee'
                  }} />
                </View>
              )
            })
          })
        }

      </View>
    )
  }

  const renderItem=(itemData: MaintainReplacementProps) => {
    return (
      <View style={styles.container}>
        <View style={{ flexDirection: 'row' }}>
          {!isEmptyString(props.pressTitle)&&<Pressable style={styles.pressContainer}
            onPress={() => {
              itemData.relationalCallBack&&itemData.relationalCallBack()
            }}>
            <Text style={styles.relevancyText}>{props.pressTitle}</Text>
          </Pressable>}
          {!isEmptyString(props.pressTitle2)&&<Pressable style={styles.pressContainer}
            onPress={() => {
              itemData.createCallBack&&itemData.createCallBack()
            }}>
            <Text style={styles.relevancyText}>{props.pressTitle2}</Text>
          </Pressable>}
        </View>
        {
          itemData.data?.map((item, index) => {
            return renderReplacementItem(item, index);
          })
        }

      </View>
    )
  }

  const listData=() => {
    if (isEmptyString(props.pressTitle)) {
      return (props.data&&props.data?.length>0)? [props]:[];
    }
    return [props];
  }

  return (
    <FlatList contentContainerStyle={{ paddingBottom: 15 }}
      data={listData()}
      keyExtractor={(item, index) => (item.pressTitle??'')+index}
      ListEmptyComponent={
        <View style={{
          height: screenHeight()-64-44,
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <EmptyView />
        </View>
      }
      renderItem={(item) => renderItem(item.item)} />
  )

}

const styles=StyleSheet.create({
  container: {
    borderRadius: 5,
    backgroundColor: Colors.white,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 12,
    paddingHorizontal: 15,
  },
  replacementContainer: {
    paddingTop: 2,
  },
  pressContainer: {
    backgroundColor: Colors.theme,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
    width: 122,
    marginLeft: 15,
    marginTop: 15,
    marginBottom: 15
  },
  relevancyText: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: 'bold',
  },
  removeContent: {
    width: 68,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DDE5FF',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#C9D5FA',
  },
  removeText: {
    fontSize: 14,
    color: Colors.theme,
    fontWeight: 'bold',
  },
  lineView: {
    height: 1,
    backgroundColor: Colors.gray.primary,
  },

  noText: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '600',
    width: 100,
  },
  noValueText: {
    fontSize: 14,
    color: Colors.text.primary,
    marginLeft: 10,
  }
});
