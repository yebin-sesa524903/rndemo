import React from "react";
import {connect} from "react-redux";
import {InteractionManager, TextInput, View} from "react-native";
import Toolbar from "../../../../../components/Toolbar.android";
import SearchBar from "../../../../../components/fmcs/gasClass/airBottle/list/SearchBar";
import HeaderSwitch from "../../../../../components/fmcs/gasClass/airBottle/list/HeaderSwitch";
import AcidBucketToDoDetail from "../detail/AcidBucketToDoDetail";
import AcidBucketDoingDetail from "../detail/AcidBucketDoingDetail";
import AcidBucketCompleteDetail from "../detail/AcidBucketCompleteDetail";
import BucketList from "../../../../../components/fmcs/gasClass/acidBucket/list/BucketList";
import {
    acidBucketListDestroyClear,
    loadAcidBucketList,
    saveAcidBucketInput,
    saveSearchResult,
} from "../../../../../actions/acidBucket/acidBucketAction";
import Scan from "../../../../assets/Scan";
import {checkQrCodeIsRight} from "../../../../../utils/const/Consts";
import SndToast from "../../../../../utils/components/SndToast";


export function statusConvertString(status: string) {
    let tempString = '';
    if (status) {
        if (status == 'FORE_EXECUTE') {
            tempString = '待执行';
        } else if (status == 'EXECUTEING') {
            tempString = '执行中';
        } else {
            tempString = '已完成';
        }
    }
    return tempString;
}

function AcidBucketList(props: any) {

    const searchBarRef = React.useRef<TextInput>(null);

    /**
     * 监听list input 变化请求列表数据
     */
    React.useEffect(() => {
        loadList()
    }, [props.input]);

    const loadList = ()=>{
        props.loadAcidBucketList(props.input);
    }

    /**
     * 程序销毁 重置入参
     */
    React.useEffect(() => {
        return () => {
            props.acidBucketListDestroyClear()
        }
    }, []);

    const listData = React.useMemo(() => {
        let resultsArray = [];
        if (props.results) {
            for (let result of props.results) {
                let statusString = statusConvertString(result.status);
                let isAlloc = result.operatorId || result.confirmId;
                resultsArray.push(
                    Object.assign(
                        {},
                        result,
                        {
                            isAlloc: isAlloc,
                            statusString: statusString,
                        }));
            }
        }
        return resultsArray.length > 0 ? [{data: resultsArray}] : resultsArray;
    }, [props.results]);

    /**
     * 返回按钮点击
     */
    const onPopBack = () => {
        InteractionManager.runAfterInteractions(() => {
            props.navigator.pop();
        });
    }

    /**
     * 下拉刷新
     */
    const pullToRefresh = () => {
        let input = props.input;
        input.pageItem.page = 1;
        props.saveAcidBucketInput({...input});
    }

    /**
     * 上拉加载
     */
    const pullLoadMore = () => {
        let input = props.input;
        input.pageItem.page = props.page + 1;
        props.saveAcidBucketInput({...input});
    }

    /**
     * 行点击 进入详情
     * @param itemObj
     */
    const onPressItem = (itemObj: any) => {
        let routeId = '';
        let component;
        if (itemObj.status == 'FORE_EXECUTE') {
            ///待执行
            routeId = 'acid_bucket_todo_detail';
            component = AcidBucketToDoDetail;
        } else if (itemObj.status == 'EXECUTEING') {
            ///执行中
            routeId = 'acid_bucket_doing_detail';
            component = AcidBucketDoingDetail;
        } else {
            ///已完成
            routeId = 'acid_bucket_complete_detail';
            component = AcidBucketCompleteDetail;
        }
        props.navigator.push({
            id: routeId,
            component: component,
            navigator: props.navigator,
            passProps: {
                bucketObj: itemObj,
                refreshCallBack: () => {
                    loadList()
                }
            }
        });
    }

    /**
     * 搜索按钮点击
     */
    const onPressSearch = () => {
        let input = props.input;
        input.deviceName = props.searchText;
        props.saveAcidBucketInput({...input});
    }

    /**
     * 扫描按钮点击
     */
    const onPressScan = () => {
        searchBarRef && searchBarRef.current?.blur();
        props.navigator.push({
            id: 'scan_from_bottle_list',
            component: Scan,
            passProps: {
                scanText: '',
                scanResult: (result: string) => {
                    if (checkQrCodeIsRight(result)){
                        let input = props.input;
                        input.pageItem.page = 1;
                        input.qrCode = result;
                        props.saveAcidBucketInput({...input});
                    }else {
                      InteractionManager.runAfterInteractions(() => {
                        SndToast.showTip('二维码不合法,请重新扫描', undefined, 2);
                      });
                    }
                }
            }
        });
    }
    const onPressClear = () => {
        searchBarRef && searchBarRef.current?.clear();
        props.saveSearchResult('');
        let input = props.input;
        input.pageItem.page = 1;
        input.deviceName = '';
        props.saveAcidBucketInput({...input});
    }

  /**
   * 重置筛选条件
   */
  const onPressReset = ()=>{
    searchBarRef && searchBarRef.current?.clear();
    let input = props.input;
    input.pageItem.page = 1;
    input.qrCode = '';
    input.deviceName = '';
    props.saveAcidBucketInput({...input});
  }

    /**
     * 头部切换按钮
     * @param itemObj
     */
    const itemSwitch = (itemObj: { title: string, value: string }) => {
        let input = props.input;
        input.pageItem.page = 1;
        input.status = itemObj.value;
        props.saveAcidBucketInput({...input});
    }

    return (
        <View style={{flex: 1, backgroundColor: 'white'}}>
            <Toolbar title={'酸桶更换任务列表'} navIcon="back" onIconClicked={onPopBack}/>
            <SearchBar textInputRef={searchBarRef}
                       value={props.searchText}
                       onSearchTextChange={(text: string) => {
                           props.saveSearchResult(text);
                       }}
                       placeholder={'输入化学品单元名称'}
                       onPressClear={onPressClear}
                       onPressReset={onPressReset}
                       onPressSearch={onPressSearch}
                       onPressScan={onPressScan}/>
            <HeaderSwitch onSwitchItem={itemSwitch}
                          titles={[
                              {title: '待执行', value: 'FORE_EXECUTE'},
                              {title: '执行中', value: 'EXECUTEING'},
                              {title: '已完成', value: 'FINISHED'},
                          ]}/>
            <BucketList page={props.page}
                        size={20}
                        loading={props.loading}
                        listData={listData}
                        onPressItem={onPressItem}
                        pullToRefresh={pullToRefresh}
                        pullLoadMore={pullLoadMore}/>
        </View>
    )
}

const mapStateToProps = (state: any) => {
    const bucketList = state.acidBucket.AcidBucketListReducer;
    return {
        loading: bucketList.loading,
        page: bucketList.page,
        results: bucketList.results,
        input: bucketList.listInput,    ///列表请求入参
        scanResult: bucketList.scanResult,  ///扫描结果
        searchText: bucketList.searchText,///输入框结果
    }
}

export default connect(mapStateToProps, {
    loadAcidBucketList,
    saveAcidBucketInput,
    saveSearchResult,
    acidBucketListDestroyClear
})(AcidBucketList)
