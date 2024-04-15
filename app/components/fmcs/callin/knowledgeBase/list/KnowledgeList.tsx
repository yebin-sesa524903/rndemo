import React from 'react';
import { View, StyleSheet } from "react-native";
import { RefreshList } from "../../../../../utils/refreshList/RefreshList";
import Colors from "../../../../../utils/const/Colors";
import { KnownledgeItem } from "./KnowledgeItem";

export interface KnownledgeListProps {
  ///点击行
  onPressItem?: Function;
  page?: number;
  size?: number;
  loading?: boolean;
  ///下拉刷新
  pullToRefresh?: Function;
  pullLoadMore?: Function;
  ///数据源
  listData: any[];
}

export default function KnownledgeList(props: KnownledgeListProps) {

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background.primary }}>
      <RefreshList page={props.page}
        size={props.size}
        refreshing={props.loading}
        pullToRefresh={props.pullToRefresh}
        pullLoadMore={props.pullLoadMore}
        keyExtractor={(item) => item.title}
        renderItem={(item) => KnownledgeItem(item, props.onPressItem)}
        sections={props.listData} />
    </View>
  )
}
