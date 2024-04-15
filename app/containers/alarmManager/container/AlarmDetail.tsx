import React, {useEffect} from "react";
import {
    Alert,
    InteractionManager, Pressable, ScrollView,
    StyleProp,
    View,
    ViewStyle
} from 'react-native';
import {connect} from "react-redux";

// @ts-ignore
import Toolbar from "../../../components/Toolbar";
import Colors from "../../../utils/const/Colors";
import AlarmDetailHeader from "../component/AlarmDetailHeader";
import AlarmDetailStep from "../component/AlarmDetailStep";
import BottleDetailActionView from "../../../components/fmcs/gasClass/airBottle/detail/BottleDetailActionView";
import moment from "moment";
import {TimeFormatYMDHMS} from "../../../utils/const/Consts";
import {destroyAlarmDetail, getAlarmInfo, resolveAlarm} from "../actions";
import AlarmDetailTXHeader from "../component/AlarmDetailTXHeader";
import {RequestStatus} from "../../../middleware/api";
import Toast from "react-native-root-toast";
import DeviceDetail from "../../fmcs/plantOperation/device/detail/DeviceDetail";
import CreateTicket from "../../ticket/CreateTicket";
import Immutable from "immutable";
import TicketDetail from "rn-module-abnormal-ticket/app/TicketDetail";
import {localStr} from "../../../utils/Localizations/localization";
import SndAlert from "../../../utils/components/SndAlert";
import privilegeHelper from "../../../utils/privilegeHelper";


function AlarmDetail(props: any) {
    const onPopBack = () => {
        InteractionManager.runAfterInteractions(() => {
            props.navigation.pop();
        });
    }

    useEffect(() => {
        InteractionManager.runAfterInteractions(() => {
            if (props.alarm.businessStatus === 2) {
                ///已解除
                props.getAlarmInfo({id: props.alarm.id})
            }
        });
    }, []);
    useEffect(() => {
        return () => props.destroyAlarmDetail(undefined)
    }, [])

    useEffect(() => {
        if (props.alarmResolveStatue === RequestStatus.success) {
            Toast.show(localStr('lang_alarm_tip1'), {
                duration: Toast.durations.LONG,
                position: Toast.positions.BOTTOM,
            });
            onPopBack();
            props.refreshCallBack && props.refreshCallBack();
        } else if (props.alarmResolveStatue === RequestStatus.error) {
            Toast.show(localStr('lang_alarm_tip2'), {
                duration: Toast.durations.LONG,
                position: Toast.positions.BOTTOM,
            });
        }
    }, [props.alarmResolveStatue])

    /**
     * 解除报警
     */
    const resolve = () => {
        SndAlert.alert( localStr('lang_alarm_tip3'), '',[
            {
                text: localStr('lang_alarm_time_picker_cancel'),
            },
            {
                text: localStr('lang_alarm_time_picker_resolve'),
                onPress: () => {
                    let params = {
                        reset_type: 1,
                        uniqueid: props.alarm.uniqueId,
                        alarmId: props.alarm.id,
                        device_id: props.alarm.deviceId,
                        parameter_id: props.alarm.parameterId,
                        code: props.alarm.type,
                        reset_time: moment().unix(),
                        reset_value: localStr('lang_alarm_relieve_info'),
                        reset_description: localStr('lang_alarm_relieve_info'),
                        update_user: props.user.Name
                    }
                    props.resolveAlarm(params);
                }
            }
        ])
    }

    /**
     * 创建工单
     */
    const pushToCreateTicket = ()=>{
        if (props.hierarchyList){
            for (const hierarchy of props.hierarchyList) {
                if (hierarchy.id == props.alarm.locationId){
                    props.alarm.locationType = hierarchy.templateId
                    break;
                }
            }
            for (const hierarchy of props.hierarchyList) {
                if (hierarchy.id == props.alarm.hierarchyId){
                    props.alarm.hierarchyType = hierarchy.templateId
                    break;
                }
            }
        }

        props.navigation.push('PageWarpper',{
            id: 'ticket_create',
            component: CreateTicket,
            passProps: {
                customer: Immutable.fromJS({
                    'CustomerId': props.user.Id,
                    'CustomerName': props.user.Name,
                }),
                alarm: props.alarm,
                ticketInfo: null,
                onPostingCallback: (type: any) => {
                    if (type === 'create'){
                        ////创建成功
                        onPopBack();
                        props.refreshCallBack && props.refreshCallBack();
                    }
                },
            }
        });
    }

    const renderActions = () => {
        let actions: { title: string; btnStyle?: StyleProp<ViewStyle>; textColor?: string | undefined; onPressCallBack?: Function | undefined; }[] = [];
        if (props.alarm.businessStatus === 1) {
            ///未解除
            actions = [
                {
                    title: localStr('lang_alarm_action_relieve'),
                    textColor: Colors.seTextPrimary,
                    onPressCallBack: resolve,
                    btnStyle: {flex: 1, backgroundColor: Colors.seBgContainer, borderWidth: 1, borderColor: Colors.seBorderBase}
                }
            ]
        }

        if (props.alarm.hasTicket) {
            ///关联了工单
            actions.push({
                title: localStr('lang_alarm_action_inspect_ticket'),
                textColor: Colors.seTextInverse,
                onPressCallBack: () => {
                    props.navigation.push('PageWarpper',{
                        id: 'service_ticket_detail',
                        component: TicketDetail,
                        passProps: {
                            ticketId: props.alarm.ticketId,
                            ticketChanged: () => {
                            }
                        }
                    })
                },
                btnStyle: {flex: 1, marginLeft: 12, backgroundColor: Colors.seBrandNomarl, borderColor: Colors.seBrandNomarl}
            })
        } else {
            if (props.alarm.locationName && privilegeHelper.hasAuth(privilegeHelper.CodeMap.OMTicketFull)) {
                ///未关联工单
                actions.push({
                    title: localStr('lang_alarm_action_create_ticket'),
                    textColor: Colors.seTextInverse,
                    onPressCallBack: () => pushToCreateTicket(),
                    btnStyle: {flex: 1, marginLeft: 12, backgroundColor: Colors.seBrandNomarl, borderColor: Colors.seBrandNomarl}
                })
            }
        }
        return (
            <BottleDetailActionView
                style={{backgroundColor: Colors.seBgContainer, paddingHorizontal: 15}}
                actions={actions}/>
        )
    }

    const getStepInfoObj = (title: string, time: number, index: number, isLast: boolean) => {
        return {
            title: title,
            time: moment(time * 1000).format(TimeFormatYMDHMS),
            index: index,
            isLast: isLast
        }
    }

    const configStep = () => {
        let stepList = []
        ///未解除
        stepList.push(getStepInfoObj(
            localStr('lang_alarm_info_step'),
            props.alarm.alarmTime,
            0,
            props.alarm.businessStatus != 2 && props.alarm.ticketId === undefined))
        if (props.alarm.ticketId) {
            if (props.alarm.businessStatus === 2 && props.alarmDetail) {
                ///已解除
                if (props.alarmDetail.resetTime < props.alarm.createTime) {
                    ///先解除再创建工单
                    stepList.push(getStepInfoObj(
                        props.alarmDetail.resetType === 1 ? `${props.alarmDetail.updateUser}  ${localStr('lang_alarm_relieve_info3')}` : localStr('lang_alarm_relieve_info2'),
                        props.alarmDetail.resetTime,
                        1,
                        false));
                   stepList.push(getStepInfoObj(
                       props.alarm.createUserName + `  ${localStr('lang_alarm_action_create_ticket')}`,
                        props.alarm.createTime,
                       2,
                       true
                   ))
                } else {
                    ///先创建再解除
                    stepList.push(getStepInfoObj(
                        props.alarm.createUserName + `  ${localStr('lang_alarm_action_create_ticket')}`,
                        props.alarm.createTime,
                        1,
                        false
                    ))
                    stepList.push(getStepInfoObj(
                        props.alarmDetail.resetType === 1 ? `${props.alarmDetail.updateUser}  ${localStr('lang_alarm_relieve_info')}` : localStr('lang_alarm_relieve_info2'),
                        props.alarmDetail.resetTime,
                        2,
                        true));
                }
            } else {
                ///未解除
                stepList.push(getStepInfoObj(
                    props.alarm.createUserName + `  ${localStr('lang_alarm_action_create_ticket')}`,
                    props.alarm.createTime,
                    1,
                    true));
            }
        } else {
            if (props.alarm.businessStatus === 2 && props.alarmDetail) {
                ///已解除
                stepList.push(getStepInfoObj(
                    props.alarmDetail.resetType === 1 ? `${props.alarmDetail.updateUser}  ${localStr('lang_alarm_relieve_info')}` : localStr('lang_alarm_relieve_info2'),
                    props.alarmDetail.resetTime,
                    1,
                    true));
            }
        }

        return stepList;
    }

    const getLocationInfo = (hierarchies:any[], locationId: number) =>{
        let locations: any[] = [];
        let findParent = function (id: number) {
            for (let hierarchy of hierarchies) {
                if (hierarchy.id === id){
                    locations.push(hierarchy.name);
                    if (hierarchy.parentId !== undefined){
                        findParent(hierarchy.parentId);
                    }
                    break
                }
            }
        }
        findParent(locationId);
        return locations.reverse().join('/');
    }

    const gotoDeviceDetail = (device: any) => {
        let founded = false;
        if (props.hierarchyList){
            for (const hierarchy of props.hierarchyList) {
                if (hierarchy.id == device.id){
                    founded = true;
                    break;
                }
            }
        }

        if (founded){
            let locations = getLocationInfo(props.hierarchyList, device.id);
            props.navigation.push('PageWarpper',{
                id: 'device_detail',
                component: DeviceDetail,
                passProps: {
                    id: device.id,
                    name: device.name,
                    displayHierarchy: locations || '-'
                }
            })
        }else {
            SndAlert.alert('', localStr('lang_alarm_alert_info'), [
                {text:localStr('lang_alarm_time_picker_ok')}
            ]);
        }
    }

    return (
        <View style={{flex: 1, backgroundColor: Colors.seBgContainer, paddingBottom: 12}}>
            <Toolbar title={localStr('lang_alarm_detail')}
                     navIcon="back"
                     onIconClicked={onPopBack}
                     color={Colors.seBrandNomarl}
                     borderColor={Colors.seBorderSplit}/>
            <ScrollView style={{flex: 1}}>
                {
                    props.alarm.alarmType === 1
                        ?
                        <AlarmDetailTXHeader {...props.alarm} resetTime={props.alarmDetail?.resetTime} devicePress={gotoDeviceDetail}/>
                        :
                        <AlarmDetailHeader  {...props.alarm} resetTime={props.alarmDetail?.resetTime} devicePress={gotoDeviceDetail}/>}
                {
                    configStep().map((step) => {
                        return <AlarmDetailStep {...step}/>
                    })
                }
            </ScrollView>
            {renderActions()}
        </View>
    )
}

const mapStateToProps = (state: any) => {
    let detail = state.alarmDetail;
    const user = state.user.toJSON().user;
    return {
        user: user,
        loading: detail.loading,
        alarmDetail: detail.alarmInfo,
        alarmResolveStatue: detail.alarmResolveStatue,
    }
}
export default connect(mapStateToProps, {
    getAlarmInfo,
    resolveAlarm,
    destroyAlarmDetail,
})(AlarmDetail);
