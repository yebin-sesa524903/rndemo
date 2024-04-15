import React, {useEffect} from "react";
import {
    Modal,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import Colors from "../../../utils/const/Colors";
import HeaderSwitch from "../../../components/fmcs/gasClass/airBottle/list/HeaderSwitch";
import {RefreshList} from "../../../utils/refreshList/RefreshList";
import {Icon} from "@ant-design/react-native";
import {YWAlarmItem} from "../component/YWAlarmItem";
import {TXAlarmItem} from "../component/TXAlarmItem";
import {connect} from "react-redux";
import {AlarmType} from "../utils";
import {loadAlarmList, loadAllTickets} from "../actions";
import {AlarmFilter} from "../component/AlarmFilter";
import AlarmDetail from "./AlarmDetail";
import {RequestStatus} from "../../../middleware/api";
import TicketDetail from "rn-module-abnormal-ticket/app/TicketDetail";
import {localStr} from "../../../utils/Localizations/localization";
import privilegeHelper from "../../../utils/privilegeHelper";

export interface AlarmListContainerProps {
    alarmType: AlarmType,
    refreshCallBack: Function,///刷新回调
    navigation: any,
    alarmCodes: [],
}

function AlarmListContainer(props: AlarmListContainerProps | any) {
    let customerId = props.user.getIn(['user', 'CustomerId']);

    useEffect(() => {
        if (customerId){
            alarmInput.customerId = customerId;
            setAlarmInput({...alarmInput});
        }
    }, [customerId]);

    const [alarmInput, setAlarmInput] = React.useState<any>({
        businessStatus: 1,///报警状态(未解除1已解除2)
        businessType: props.alarmType,///业务分类(默认1通讯类报警,业务报警2)
        customerId: customerId,
        sortField: "alarm_time",
        sortType: "desc",
        pageIndex: 1,
        pageSize: 20,
    })

    const [filterVisible, setFilterVisible] = React.useState(false);

    useEffect(() => {
        props.loadAlarmList(alarmInput);
    }, [alarmInput]);

    useEffect(() => {
        if (props.alarm && props.alarm.length > 0 && props.ticketLoadStatus !== RequestStatus.success) {
            let owners = []
            for (const alarmObj of props.alarm) {
                owners.push({
                    ownerType: 2,
                    ownerId: alarmObj.businessKey,
                })
            }
            if (privilegeHelper.hasAuth(privilegeHelper.CodeMap.OMTicketFull)){
                props.loadAllTickets(owners, props.alarmType);
            }
        }
    }, [props.alarm])

    const onHeaderSwitch = (value: {
        title: string,
        value: number
    }) => {
        alarmInput.pageIndex = 1;
        alarmInput.businessStatus = value.value;
        setAlarmInput({...alarmInput});
    }

    /**
     * 下拉刷新
     */
    const pullToRefresh = () => {
        alarmInput.pageIndex = 1;
        setAlarmInput({...alarmInput});
        props.refreshCallBack && props.refreshCallBack()
    }

    /**
     * 上拉加载
     */
    const pullLoadMore = () => {
        alarmInput.pageIndex = props.page + 1;
        setAlarmInput({...alarmInput});
    }

    const onPressReset = () => {

    }

    const onPressSure = (params: {}) => {
        setFilterVisible(false);
        let requestParams = Object.assign({}, alarmInput, params);
        setAlarmInput({...requestParams});
    }

    const configFilter = () => {
        let filter = {};
        if (alarmInput.startTime && alarmInput.endTime) {
            filter = Object.assign({}, filter, {
                startTime: alarmInput.startTime,
                endTime: alarmInput.endTime,
            })
        }
        if (alarmInput.type?.length > 0) {
            filter = Object.assign({}, filter, {
                type: alarmInput.type,
            })
        }
        if (alarmInput.level?.length > 0) {
            filter = Object.assign({}, filter, {
                level: alarmInput.level,
            })
        }
        return filter;
    }

    const renderFilterModal = () => {
        return (
            <Modal transparent={true}
                   visible={filterVisible}
                   onRequestClose={() => setFilterVisible(false)}>
                <View style={{backgroundColor: '#00000066', flex: 1, flexDirection: 'row'}}>
                    <Pressable style={{width: '20%'}} onPress={() => setFilterVisible(false)}/>
                    <SafeAreaView style={{width: '80%', backgroundColor: Colors.seBgElevated}}>
                        <AlarmFilter alarmType={props.alarmType}
                                     onPressReset={onPressReset}
                                     onPressSure={onPressSure}
                                     alarmCodes={props.alarmCodes}
                                     filter={configFilter()}/>
                    </SafeAreaView>
                </View>
            </Modal>
        )
    }

    /**
     * 是否有筛选条件
     */
    const hasFilter = () => {
        if (alarmInput.startTime && alarmInput.endTime) {
            return true
        }
        if (alarmInput.type?.length > 0) {
            return true;
        }
        if (alarmInput.level?.length > 0) {
            return true;
        }
        return false;
    }

    const onPressAlarmItem = (alarm: any) => {
        props.navigation.push('PageWarpper',{
            id: 'alarm_detail',
            component: AlarmDetail,
            passProps: {
                alarm: alarm,
                hierarchyList: props.hierarchyList,
                refreshCallBack: () => pullToRefresh()
            }
        })
    }
    const pushToTicketDetail = (ticketId: string) => {
        props.navigation.push('PageWarpper',{
            id: 'service_ticket_detail',
            component: TicketDetail,
            passProps: {
                ticketId: ticketId,
                ticketChanged: () => {
                }
            }
        })
    }

    return (
        <View style={{flex: 1}}>
            <View style={{backgroundColor: Colors.green.primary,}}>
                <View style={styles.headerContainer}>
                    <HeaderSwitch onSwitchItem={onHeaderSwitch}
                                  backgroundColor={Colors.seBgContainer}
                                  scrollEnable={false}
                                  showMoveLine={false}
                                  normalCol={Colors.seTextTitle}
                                  selectedCol={Colors.seBrandNomarl}
                                  titles={
                                      [
                                          {title: localStr('lang_alarm_list_undone'), value: 1},
                                          {title: localStr('lang_alarm_list_done'), value: 2}
                                      ]
                                  }/>
                    <Pressable style={{flexDirection: 'row', paddingLeft: 6, paddingRight: 6, alignItems: 'center'}}
                               onPress={() => setFilterVisible(true)}>
                        <Text
                            style={{fontSize: 15, color: hasFilter() ? Colors.seBrandNomarl : Colors.seTextPrimary, marginRight: 8}}>{localStr('lang_alarm_filter')}</Text>
                        <Icon name="filter" size={20} color={hasFilter() ? Colors.seBrandNomarl : Colors.seTextPrimary}/>
                    </Pressable>
                    <View style={styles.dividerLine}/>
                </View>
            </View>

            <RefreshList sections={(props.alarm && props.alarm.length > 0) ? [{data: props.alarm}] : []}
                         page={props.page}
                         refreshing={props.loading}
                         pullToRefresh={pullToRefresh}
                         pullLoadMore={pullLoadMore}
                         renderItem={(item) => {
                             if (props.alarmType === AlarmType.yw) {
                                 return YWAlarmItem({
                                     ...item.item,
                                     onPressItem: onPressAlarmItem,
                                     onPressTicket: pushToTicketDetail,
                                 })
                             } else {
                                 return TXAlarmItem({
                                     ...item.item,
                                     onPressItem: onPressAlarmItem,
                                     onPressTicket: pushToTicketDetail,
                                 })
                             }
                         }}/>
            {renderFilterModal()}
        </View>
    )
}


const mapStateToProps = (state: any, ownerProps: any) => {
    let alarm = state.alarmList;
    let loading = false;
    let page = 1;
    let alarmObj = [];
    if (ownerProps.alarmType === AlarmType.yw) {
        loading = alarm.ywAlarm.loading;
        page = alarm.ywAlarm.page;
        alarmObj = alarm.ywAlarm.alarm;
    } else {
        loading = alarm.txAlarm.loading;
        page = alarm.txAlarm.page;
        alarmObj = alarm.txAlarm.alarm;
    }
    return {
        alarm: alarmObj,
        loading: loading,
        page: page,
        ticketLoadStatus: alarm.ticketLoadStatus,
        user: state.user,
    }
}
export default connect(mapStateToProps, {
    loadAlarmList,
    loadAllTickets,
})(AlarmListContainer);


// @ts-ignore
const styles = global.amStyleProxy(() => StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.seBgContainer,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        paddingLeft: 6,
        paddingRight: 6,
        overflow: 'hidden',
        height: 50,
        alignItems: 'center'
    },
    dividerLine: {
        position: 'absolute',
        bottom: 0,
        left: 12,
        right: 12,
        height: 1,
        backgroundColor: Colors.seBorderSplit
    }
}))
