import React from 'react'
import {connect} from "react-redux";
import {InteractionManager, TextInput, View} from "react-native";
// @ts-ignore
import Toolbar from "../../../../../components/Toolbar";
import SearchBar from "../../../../../components/fmcs/gasClass/airBottle/list/SearchBar";
import HeaderSwitch from "../../../../../components/fmcs/gasClass/airBottle/list/HeaderSwitch";
import BottleList from '../../../../../components/fmcs/gasClass/airBottle/list/BottleList';
import Scan from "../../../../assets/Scan";
import AirBottleWaitBlowDetail from "../detail/AirBottleWaitBlowDetail";
import AirBottleWaitReplaceDetail from "../detail/AirBottleWaitReplaceDetail";
import AirBottleBlowingDetail from "../detail/AirBottleBlowingDetail";
import AirBottleCompleteDetail from "../detail/AirBottleCompleteDetail";
import {
    airBottleDestroyClear,
    loadAirBottleList,
    saveAirBottleListInput,
    saveSearchResult
} from "../../../../../actions/airBottle/airBottleAction";
import AirBottleReplacingDetail from "../detail/AirBottleReplacingDetail";
import AirBottleWaitStandbyDetail from "../detail/AirBottleWaitStandbyDetail";
import AirBottleStandbyingDetail from "../detail/AirBottleStandbyingDetail";
import {checkQrCodeIsRight} from "../../../../../utils/const/Consts";
import SndToast from "../../../../../utils/components/SndToast";

/**
 * [Enum values:
 * FORE_BLOW("待前吹")
 * FORE_BLOW_IN("前吹中")
 * REPLACEMENT_OPERATION("待更换")
 * REPLACEMENT_OPERATION_IN("更换中")
 * STANDBY("待Standby")
 * STANDBY_IN("Standby中")
 * ACCOMPLISH("已完成")
 * ]
 * @param status
 */
export function convertBottleStatusToString(status: string): string {
    let statusString = '';
    switch (status) {
        case 'FORE_BLOW':
            statusString = '待前吹';
            break;
        case 'FORE_BLOW_IN':
            statusString = '前吹中';
            break;
        case 'REPLACEMENT_OPERATION':
            statusString = '待更换';
            break;
        case 'REPLACEMENT_OPERATION_IN':
            statusString = '更换中';
            break;
        case 'STANDBY':
            statusString = '待Standby';
            break;
        case 'STANDBY_IN':
            statusString = 'Standby中';
            break;
        case 'ACCOMPLISH':
            statusString = '已完成';
            break;
    }
    return statusString
}

function AirBottleList(props: any) {

    const searchBarRef = React.useRef<TextInput>(null);
    /**
     * 监听list input 变化请求列表数据
     */
    React.useEffect(() => {
        props.loadAirBottleList(props.airBottleListInput);
    }, [props.airBottleListInput]);



    React.useEffect(()=>{
        return ()=>{
            props.airBottleDestroyClear();
        }
    }, []);
    /**
     * 列表数据源
     */
    const listData = React.useMemo(() => {
        return (props.results && props.results.length > 0) ? [{data: props.results}] : props.results;
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
     * 搜索按钮点击
     */
    const onPressSearch = () => {
        let input = props.airBottleListInput;
        input.deviceName = props.searchText;
        props.saveAirBottleListInput({...input});
    }

    /**
     * 扫一扫点击
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
                        let input = props.airBottleListInput;
                        input.pageItem.page = 1;
                        input.qrCode = result;
                        props.saveAirBottleListInput({...input});
                    }else {
                      InteractionManager.runAfterInteractions(() => {
                        SndToast.showTip('二维码不合法,请重新扫描', undefined, 2);
                      });
                    }
                }
            }
        });
    }

    /**
     * 清楚输入框
     */
    const onPressClear = () => {
        searchBarRef && searchBarRef.current?.clear();
        props.saveSearchResult('');
    }
  /**
   * 重置筛选条件
   */
  const onPressReset = ()=>{
    searchBarRef && searchBarRef.current?.clear();
    let input = props.airBottleListInput;
    input.pageItem.page = 1;
    input.qrCode = '';
    input.deviceName = '';
    props.saveAirBottleListInput({...input});
  }
    /**
     * 气瓶行点击
     * @param itemObj
     */
    const onPressItem = (itemObj: any) => {
        let routeId = '';
        let component;
        let passProps = {airBottle: itemObj, refreshCallBack: () => props.loadAirBottleList(props.airBottleListInput)};
        switch (itemObj.status) {
            case 'FORE_BLOW':
                routeId = 'air_bottle_wait_blow';
                component = AirBottleWaitBlowDetail;
                break;
            case 'FORE_BLOW_IN':
                routeId = 'air_bottle_blowing';
                component = AirBottleBlowingDetail;
                break;
            case 'REPLACEMENT_OPERATION':
                routeId = 'air_bottle_wait_replace';
                component = AirBottleWaitReplaceDetail;
                break;
            case 'REPLACEMENT_OPERATION_IN':
                routeId = 'air_bottle_replacing';
                component = AirBottleReplacingDetail;
                break;
            case 'STANDBY':
                routeId = 'air_bottle_wait_standby';
                component = AirBottleWaitStandbyDetail;
                break;
            case 'STANDBY_IN':
                routeId = 'air_bottle_in_standby';
                component = AirBottleStandbyingDetail;
                break;
            case 'ACCOMPLISH':
                routeId = 'air_bottle_complete';
                component = AirBottleCompleteDetail;
                break;
        }
        props.navigator.push({
            id: 'air_bottle_detail',
            component: component,
            navigator: props.navigator,
            passProps: passProps
        });
    }

    /**
     * 切换按钮点击
     * @param itemObj
     */
    const onSwitchItem = (itemObj: { title: string, value: string }) => {
        let input = props.airBottleListInput;
        input.pageItem.page = 1;
        input.status = itemObj.value;
        props.saveAirBottleListInput({...input});
    }

    /**
     * 下拉刷新
     */
    const pullToRefresh = () => {
        let input = props.airBottleListInput;
        input.pageItem.page = 1;
        props.saveAirBottleListInput({...input});
    }

    /**
     * 上拉加载
     */
    const pullLoadMore = () => {
        let input = props.airBottleListInput;
        input.pageItem.page = props.page + 1;
        props.saveAirBottleListInput({...input});
    }

    return (
        <View style={{flex: 1, backgroundColor: "white"}}>
            <Toolbar title={'气瓶更换列表'} navIcon="back" onIconClicked={onPopBack}/>
            <SearchBar textInputRef={searchBarRef}
                       placeholder={'输入气柜/气架名称'}
                       value={props.searchText}
                       onSearchTextChange={(text: string) => {
                           props.saveSearchResult(text);
                       }}
                       onPressReset={onPressReset}
                       onPressClear={onPressClear}
                       onPressSearch={onPressSearch}
                       onPressScan={onPressScan}/>
            <HeaderSwitch onSwitchItem={onSwitchItem}
                          titles={[
                              {title: '待前吹', value: 'FORE_BLOW'},
                              {title: '前吹中', value: 'FORE_BLOW_IN'},
                              {title: '待更换', value: 'REPLACEMENT_OPERATION'},
                              {title: '更换中', value: 'REPLACEMENT_OPERATION_IN'},
                              {title: '待Standby', value: 'STANDBY'},
                              {title: 'Standby中', value: 'STANDBY_IN'},
                              {title: '已完成', value: 'ACCOMPLISH'}
                          ]}/>
            <BottleList onPressItem={onPressItem}
                        listData={listData}
                        page={props.page}
                        size={20}
                        pullToRefresh={pullToRefresh}
                        pullLoadMore={pullLoadMore}
                        loading={props.loading}/>
        </View>
    )
}

const mapStateToProps = (state: any) => {
    const bottleList = state.airBottle.AirBottleListReducer;
    return {
        loading: bottleList.loading,
        page: bottleList.page,
        results: bottleList.results,
        airBottleListInput: bottleList.airBottleListInput,
        searchText: bottleList.searchText,
    }
}

export default connect(mapStateToProps, {
    saveAirBottleListInput,
    loadAirBottleList,
    saveSearchResult,
    airBottleDestroyClear,
})(AirBottleList)
