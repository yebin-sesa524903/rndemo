import React from 'react'
import { Dimensions, FlatList, Image, Pressable, Text, View } from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import Colors from "../../../utils/const/Colors";
import Icon from "../../Icon";

const screenWidth=Dimensions.get('window').width;

export interface WorkbenchProps {
  workbenches: { title: string, data: ItemDataProps[] }[]
  itemOnPress: Function;
}

export enum WorkbenchType {
  airBottle='QPGH',///气瓶
  acidBucket='STGH',///酸桶
  inspection='XJZX',///巡检
  maintain='BYZX',///保养
  repair='WXZX',///维修
  abnormal='YCDJ',///异常点检
  consumables='HCGH',///耗材更换
  sparePartsOutboundStorage='BJCHRK', ///备件出/入库
  sparePartsCount='BJPD',///备件盘点
  callInTicket='HWGD',///话务工单
  callInWarningTicket='CIBJGD',///call in 报警工单
  knowledge='ZSKGL',    ///知识库概览
  zdgdTickets='ZDGD',    ///诊断工单
  assetList='ZCLB',    /// 资产列表
  xwycTickets='XWYC',//行为异常工单
  pdTickets='PDGD', //盘点工单
}

export interface ItemDataProps {
  iconName: any,
  itemName: string,
  type: WorkbenchType,
}

function WorkbenchSectionList(props: WorkbenchProps) {

  const renderItem=(item: any) => {
    const { title, data }=item.item;
    const screenMargin=15;
    const itemWith=(screenWidth-screenMargin*2)*0.25;
    return (
      <View style={{
        flex: 1,
        marginLeft: screenMargin,
        marginRight: screenMargin,
        marginTop: screenMargin,
        borderRadius: 6,
        overflow: 'hidden'
      }}>
        <LinearGradient start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flexDirection: 'row', alignItems: 'center', height: 40 }}
          colors={[Colors.workbench_lg_start, Colors.workbench_lg_start]}>
          <Text style={{
            fontSize: 15,
            color: Colors.text.primary,
            fontWeight: 'bold',
            marginLeft: 15,
            marginTop: 6,
            marginBottom: 6,
          }}>{title}</Text>
        </LinearGradient>
        <View style={{ flex: 1, flexWrap: 'wrap', backgroundColor: 'white', flexDirection: 'row', paddingBottom: 16, paddingTop: 5 }}>
          {
            data.map((itemObj: any, index: number) => {
              return (
                <Pressable key={index}
                  onPress={() => {
                    props.itemOnPress&&props.itemOnPress(itemObj)
                  }}
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: itemWith,
                    // height: 90,
                    marginTop: 13
                  }}>
                  <Icon font={'icomoon'} type={itemObj.iconName} color={Colors.theme} size={36}/>
                  <Text style={{ fontSize: 12, color: Colors.text.primary, marginTop: 5 }}>{itemObj.itemName}</Text>
                </Pressable>
              )
            })
          }
        </View>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background.primary }}>
      <FlatList data={props.workbenches} renderItem={renderItem} keyExtractor={(item, index) => item.title} />
    </View>
  )
}

export default WorkbenchSectionList;
