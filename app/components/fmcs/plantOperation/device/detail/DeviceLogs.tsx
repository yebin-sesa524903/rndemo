import React, { useEffect } from "react";
import { FlatList, Image, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Colors from "../../../../../utils/const/Colors";
import Icon from "../../../../Icon";
// @ts-ignore
import Loading from '../../../../Loading';
import { getImageUrlByKey } from "../../../../../containers/fmcs/plantOperation/utils/Utils";
import { localStr } from "../../../../../utils/Localizations/localization";
import EmptyView from "../../../../../utils/refreshList/EmptyView";
import { screenHeight, screenWidth } from "../../../../../utils/const/Consts";
import { TicketRow } from 'rn-module-abnormal-ticket'
import { TicketRow as InventoryRow } from 'rn-module-inventory-ticket'


function Tabs(props: any) {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 54, marginTop: 10,
      borderTopRightRadius: 8,
      borderTopLeftRadius: 8,
      overflow: 'hidden',
      backgroundColor: Colors.seBgContainer
    }}>
      <View style={{ flexDirection: 'row' }}>
        <Pressable onPress={() => {
          console.log('----->')
        }}
          style={{ paddingLeft: 12, paddingRight: 12 }}>
          <Text style={{
            fontSize: 14,
            fontWeight: props.tabIndex===0? 'bold':'normal',
            color: props.tabIndex===0? Colors.seBrandNomarl:Colors.seTextPrimary
          }}>{`${localStr('未完成')}`}</Text>
        </Pressable>
        <Pressable onPress={() => {
          console.log('------<')
        }}
          style={{ paddingLeft: 12, paddingRight: 12 }}>
          <Text style={{
            fontSize: 14,
            fontWeight: props.tabIndex===1? 'bold':'normal',
            color: props.tabIndex===1? Colors.seBrandNomarl:Colors.seTextPrimary
          }}>{`${localStr('已完成')}`}</Text>
        </Pressable>
      </View>
      <View style={{ position: 'absolute', left: 12, right: 12, bottom: 0, backgroundColor: Colors.seBorderSplit, height: 1 }} />
    </View>
  )
}

export default function (props: any) {
  if (props.isFetching||props.isFetching===null) return <Loading />
  return (
    <View style={{
      flex: 1, paddingBottom: 16, backgroundColor: Colors.seBgLayout,
    }}>
      <FlatList showsHorizontalScrollIndicator={true}
        contentContainerStyle={{
          width: 'auto', backgroundColor: props.isInventory? Colors.seBgContainer:Colors.seBgLayout,
          paddingHorizontal: 12, marginTop: props.isInventory? 8:0,
        }}
        refreshing={props.isFetching||false}
        onRefresh={props.onRefresh}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item, index) => `${item.id}`}
        data={props.data}
        ListEmptyComponent={
          <View style={{ width: screenWidth(), height: screenHeight()-84, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.seBgLayout, }}>
            <EmptyView />
          </View>
        }
        renderItem={({ item, index }) => {
          item.locationInfo=props.loc;
          let CMP=props.isInventory? InventoryRow:TicketRow;
          return (
            <CMP rowData={item} onInventoryItemClick={props.click}
              onRowClick={props.click}
            />
          )
        }}
      />
    </View>
  )
}
