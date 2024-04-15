import React from "react";
import {SectionList, SectionListProps} from "react-native";
import {LoadMoreView, RefreshingStatus} from "./LoadMoreView";
import EmptyView from "./EmptyView";
///默认page
export const Default_Page_Number = 1;
///默认page size 值
export const Default_Page_Size = 20;


export interface RefreshListProps extends SectionListProps<any>{
    /**
     * 当前页
     */
    page?: number;
    /**
     * 当前页 加载个数
     */
    size?: number;
    /**
     * 下拉刷新
     */
    pullToRefresh?: Function;
    /**
     * 上拉加载更多
     */
    pullLoadMore?:Function;
}


export function RefreshList(props: RefreshListProps) {
    const listRef = React.useRef<SectionList>(null);
    /**
     * 设置默认值
     */
    const initProps : RefreshListProps = {
        page: Default_Page_Number,
        size: Default_Page_Size,
        sections:[],
    } ;

    /**
     * 上拉加载尾部刷新状态
     */
    const [footerState, setFooterState] = React.useState(RefreshingStatus.Idle);
    /**
     * 记录上次刷新时间, 避免频繁刷新操作
     */
    const [lastTimestamp, setLastTimestamp] = React.useState(0);

    /**
     * 合并传入的属性
     */
    const newProps : RefreshListProps = React.useMemo(()=>{
        return Object.assign({}, initProps, props);
    }, [initProps]);

    React.useEffect(()=>{
        if (newProps.page! > 1){
            let dataSourceCount = 0
            for (let argument of newProps.sections) {
                dataSourceCount += argument.data.length;
            }
            let hasNoMore = (dataSourceCount === 0 ||
                dataSourceCount < (newProps.page! * (newProps.size!)));
            if (hasNoMore){
                ///没有更多了
                setFooterState(RefreshingStatus.NoMoreData);
            }else{
                setFooterState(RefreshingStatus.Idle);
            }
        }else {
            setFooterState(RefreshingStatus.Idle);
        }
    },[newProps.sections]);


    return (
        <SectionList
            {...newProps}
            ref={listRef}
            contentContainerStyle={[{ flexGrow: 1 }, props.contentContainerStyle]}
            automaticallyAdjustContentInsets={false}
            keyExtractor={((item, index) => item + index)}
            onRefresh={beginHeaderRefresh}
            onEndReachedThreshold={0.01}
            onEndReached={beginFooterRefresh}
            ListEmptyComponent={<EmptyView/>}
            ListFooterComponent={renderFooterView()}
        />
    );

    /**
     * footer
     */
    function renderFooterView() {
        if (props.pullLoadMore){
            return LoadMoreView(footerState);
        }
        return <></>
    }

    /**
     * 开始下拉加载
     */
    function beginHeaderRefresh() {
        if (shouldStartHeaderRefreshing()) {
            const nowTimestamp = new Date().getTime();
            const subTimestamp = nowTimestamp - lastTimestamp;
            if (subTimestamp < 500) {
                return;
            }
            setLastTimestamp(new Date().getTime());
            setFooterState(RefreshingStatus.Idle);
            if (newProps.pullToRefresh){
                newProps.pullToRefresh();
            }
        }
    }


    /**
     * 当前是否可以进行下拉刷新
     *
     * 如果列表尾部正在执行上拉加载/下拉刷新，返回false
     * 如果列表头部已经在刷新中了，返回false
     */
    function shouldStartHeaderRefreshing(): boolean {
        return !(footerState == RefreshingStatus.Refreshing || newProps.refreshing);
    }

    /**
     * 开始上拉加载更多
     */
    function beginFooterRefresh() {
        if (shouldStartFooterRefreshing()){
            const nowTimestamp = new Date().getTime();
            const subTimestamp = nowTimestamp - lastTimestamp;
            if (subTimestamp < 500) {
                return;
            }
            setLastTimestamp(new Date().getTime());
            setFooterState(RefreshingStatus.Refreshing);
            onFooterRefresh();
        }
    }


    /***
     * 当前是否可以进行上拉加载更多
     * @returns {boolean}
     *
     * 如果底部已经在刷新，返回false
     * 如果底部状态是没有更多数据了，返回false
     * 如果头部在刷新，则返回false
     * 如果列表数据为空，则返回false（初始状态下列表是空的，这时候肯定不需要上拉加载更多，而应该执行下拉刷新）
     */
    function shouldStartFooterRefreshing(): boolean {
        let condition1 = (
            footerState == RefreshingStatus.Refreshing ||
            footerState == RefreshingStatus.NoMoreData ||
            newProps.refreshing);
        let condition2 = false;
        if (newProps.sections.length > 0) {
            let dataSourceCount = 0
            for (let argument of newProps.sections) {
                if (argument.data !== undefined && argument.data.length > 0) {
                    dataSourceCount += argument.data.length;
                }
            }
            condition2 = (dataSourceCount > 0);
        }
        if (condition1){
            return false;
        }else{
            return condition2;
        }
    }

    /**
     * 加载更多
     */
    function onFooterRefresh() {
        let dataSourceCount = 0
        for (let argument of newProps.sections) {
            dataSourceCount += argument.data.length;
        }
        ///数据大于size的一半 才判断是否展示更多
        if (newProps.sections.length > 0) {
            let dataSourceIsEmpty = true;
            for (let section of newProps.sections) {
                if (section.data !== undefined && section.data.length > 0) {
                    dataSourceIsEmpty = false;
                    break;
                }
            }
            if (dataSourceIsEmpty || dataSourceCount < Default_Page_Size * 0.5) {
                setFooterState(RefreshingStatus.Idle);
            } else {
                let hasMore = (dataSourceCount === 0 ||
                    dataSourceCount < newProps.page! * newProps.size!);
                if (hasMore){
                    ///没有更多了
                    setFooterState(RefreshingStatus.NoMoreData);
                }else{
                    ///还有更多
                    if(newProps.pullLoadMore){
                        newProps.pullLoadMore();
                        setFooterState(RefreshingStatus.CanLoadMore);
                    }
                }
            }
        }else{
            setFooterState(RefreshingStatus.Idle);
        }
    }
}
