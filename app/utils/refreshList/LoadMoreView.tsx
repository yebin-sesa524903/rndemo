import React from "react";
import {View, Text, ActivityIndicator, StyleSheet} from "react-native";
import {localStr} from "../Localizations/localization";

export enum RefreshingStatus {
    Idle = 'Idle',               // 初始状态，无刷新的情况
    CanLoadMore = 'CanLoadMore', // 可以加载更多，表示列表还有数据可以继续加载
    Refreshing = 'Refreshing',   // 正在刷新中
    NoMoreData = 'NoMoreData',   // 没有更多数据了
}

export function LoadMoreView(refreshStatus: RefreshingStatus) {
    let footer = null;
    switch (refreshStatus) {
        case RefreshingStatus.Idle:
            // Idle情况下为null，不显示尾部组件
            break;
        case RefreshingStatus.Refreshing:
            footer =
                <View style={styles.loadingView}>
                    <ActivityIndicator size="small"/>
                    <Text style={styles.refreshingText}>{localStr('lang_load_more')}</Text>
                </View>;
            break;
        case RefreshingStatus.CanLoadMore:
            footer =
                <View style={styles.loadingView}>
                    <Text style={styles.footerText}>{localStr('lang_load_more')}</Text>
                </View>;
            break;
        case RefreshingStatus.NoMoreData:
            footer =
                <View style={styles.loadingView}>
                    <Text style={styles.footerText}>{localStr('lang_empty_data')}</Text>
                </View>;
            break;
    }
    return footer;

}

const styles = StyleSheet.create({
    loadingView: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15,
    },
    refreshingText: {
        fontSize: 12,
        color: '#333',
        paddingLeft: 10,
    },
    footerText: {
        fontSize: 12,
        color: '#333'
    }
})
