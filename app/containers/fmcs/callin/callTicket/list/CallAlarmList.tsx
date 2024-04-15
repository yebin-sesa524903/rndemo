import React from "react";
import {Alert, InteractionManager, View} from "react-native";
import {connect} from "react-redux";
// @ts-ignore
import Toolbar from "../../../../../components/Toolbar";
import HeaderSwitch from "../../../../../components/fmcs/gasClass/airBottle/list/HeaderSwitch";
import Colors from "../../../../../utils/const/Colors";
import {RefreshList} from "../../../../../utils/refreshList/RefreshList";

import {
  callInListDestroyClear, getHierarchyList,
  loadCallInTickets, orderAccept,
  saveTicketListInput
} from "../../../../../actions/callin/callInAction";
import {AlarmListItem} from "../../../../../components/fmcs/callin/callTicket/AlarmListItem";
import {getActionTitle, getAlarmLevelString} from "../detail/CallInHelper";
import moment from "moment";
import {isEmptyString, TimeFormatYMDHM} from "../../../../../utils/const/Consts";
import {CallInListItemProps} from "../../../../../components/fmcs/callin/callTicket/CallInListItem";
import CallAlarmDetail from "../detail/CallAlarmDetail";
import {RequestStatus} from "../../../../../middleware/api";
import SndToast from "../../../../../utils/components/SndToast";


function CallAlarmList(props: any) {

  /**
   * 返回按钮点击
   */
  const onPopBack = () => {
    InteractionManager.runAfterInteractions(() => {
      props.navigator.pop();
    });
  }

  React.useEffect(() => {
    props.getHierarchyList(props.user.CustomerId)
  }, [])

  React.useEffect(() => {
    loadCallInWarningTickets();
  }, [props.input]);

  const loadCallInWarningTickets = () => {
    let input = props.input;
    input.type = 3;
    props.loadCallInTickets(input);
  }

  const listData = React.useMemo(() => {
    let data = [];
    for (let ticket of props.tickets) {
      data.push({
        ticketStatus: props.input.stateStr, ///工单类型
        status: getActionTitle(props.input.stateStr), ///业务类型
        level: getAlarmLevelString(ticket.level), ///报警级别
        time: isEmptyString(ticket.orderDate) ? '-' : moment(ticket.orderDate).format(TimeFormatYMDHM),   ///报警时间
        name: ticket.mName, ///报警名称
        category: ticket.category,
        threshold: ticket.threshold,
        value: ticket.value,
        orderId: ticket.order_id,
        subOrderId: ticket.subOrderId,
      })
    }
    return data.length > 0 ? [{data: data}] : [];
  }, [props.tickets]);

  /**
   * 监听接单请求状态变化
   */
  React.useEffect(() => {
    if (props.orderAcceptRequestStatus == RequestStatus.loading) {
      SndToast.showLoading();
    } else if (props.orderAcceptRequestStatus == RequestStatus.success) {
      SndToast.dismiss();
      SndToast.showSuccess('接单成功', () => {
        ///刷新列表
        loadCallInWarningTickets();
      });
    } else if (props.orderAcceptRequestStatus == RequestStatus.error) {
      SndToast.dismiss();
    }
  }, [props.orderAcceptRequestStatus])


  React.useEffect(() => {
    return () => {
      props.callInListDestroyClear();
    }
  }, []);


  /**
   * 头部切换点击
   */
  const onSwitchItem = (obj: any) => {
    let input = props.input;
    input.page = 1;
    input.stateStr = obj.value;
    props.saveTicketListInput({...input});
  }

  /**
   * 行點擊
   */
  const itemOnPressCallBack = (ticket: CallInListItemProps) => {
    props.navigator.push({
      id: 'call_alarm_detail',
      component: CallAlarmDetail,
      passProps: {
        orderId: ticket.orderId,
        departments: props.departments,
        refreshListCallBack: () => {
          loadCallInWarningTickets();
        }
      }
    })
  }

  /**
   * 下拉刷新
   */
  const pullToRefresh = () => {
    let input = props.input;
    input.page = 1;
    props.saveTicketListInput({...input});
  }

  /**
   * 上拉加载
   */
  const pullLoadMore = () => {
    let input = props.input;
    input.page = props.page + 1;
    props.saveTicketListInput({...input});
  }

  const acceptActionCallBack = (ticket: CallInListItemProps) => {
    Alert.alert('', '您是否确认接单?', [
      {
        text: '取消',
      },
      {
        text: '确定',
        onPress: () => {
          let params = {orderId: ticket.orderId, subOrderId: ticket.subOrderId};
          props.orderAccept(params);
        }
      }
    ]);
  }

  return (
    <View style={{flex: 1, backgroundColor: Colors.background.primary}}>
      <Toolbar title={'报警工单列表'} navIcon="back" onIconClicked={onPopBack}/>
      <HeaderSwitch onSwitchItem={onSwitchItem}
                    titles={[
                      {title: '待执行', value: 'pending'},
                      {title: '执行中', value: 'processing'},
                      {title: '已完成', value: 'solved'}]}/>
      <RefreshList sections={listData}
                   refreshing={props.loading}
                   page={props.page}
                   pullToRefresh={pullToRefresh}
                   pullLoadMore={pullLoadMore}
                   renderItem={(item) => AlarmListItem({...item.item, itemOnPressCallBack, acceptActionCallBack})}/>
    </View>
  )
}

const mapStateToProps = (state: any) => {
  let callIn = state.callIn.CallInListReducer;
  const user = state.user.toJSON().user;
  return {
    user: user,
    departments: callIn.departments,
    page: callIn.page,
    loading: callIn.loading,
    input: callIn.input,
    tickets: callIn.tickets,
    orderAcceptRequestStatus: callIn.orderAcceptRequestStatus,
  }
}

export default connect(mapStateToProps, {
  loadCallInTickets,
  saveTicketListInput,
  orderAccept,
  getHierarchyList,
  callInListDestroyClear,
})(CallAlarmList)
