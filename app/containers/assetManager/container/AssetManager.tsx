import React from "react";
import {
  View, ScrollView, TouchableOpacity, Text,
} from "react-native"
// @ts-ignore
import Toolbar from "../../../components/Toolbar";
import { connect } from "react-redux";
import Colors from "../../../utils/const/Colors";
import HeaderSwitch from "../../../components/fmcs/gasClass/airBottle/list/HeaderSwitch";
import { MaintainContainerView } from "../../../components/fmcs/plantOperation/maintain/detail/MaintainContainerView";
import { screenWidth } from "../../../utils/const/Consts";

// @ts-ignore
import { TicketList as PdTicketList } from "rn-module-inventory-ticket/index";
import DeviceList from "../../fmcs/plantOperation/device/list/DeviceList";
import HierarchyList from "../../fmcs/plantOperation/device/list/HierarchyList";
import privilegeHelper from "../../../utils/privilegeHelper";
import { localStr } from "../../../utils/Localizations/localization";
import { loadHierarchyList } from "../../alarmManager/actions";
// @ts-ignore
import Loading from '../../../components/Loading';
import EmptyView from "../../../utils/refreshList/EmptyView";

export function OfflineView(props: any) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: "center", backgroundColor: Colors.seBgLayout }}>
      <TouchableOpacity onPress={props.onRetry}>
        <Text style={{ fontSize: 16, color: Colors.seTextTitle }}>{localStr('lang_offline_view_tip')}</Text>
      </TouchableOpacity>
    </View>
  )
}

function AssetManager(props: any) {
  const scrollContentRef=React.useRef<ScrollView>(null);

  const contentScroll=(index: number) => {
    scrollContentRef.current?.scrollTo(
      {
        x: screenWidth()*index,
        y: 0,
        animated: true,
      }
    )
  }

  const loadList=() => {
    if (!global.isConnected()) return;
    let customerId=props.user.CustomerId;
    props.loadHierarchyList({ customerId: customerId, treeType: "fmhc", type: 1 });
    if (selectedIndex===1) {
      setTimeout(() => {
        contentScroll(selectedIndex);
      }, 2000)
    }
  }

  React.useEffect(() => {
    loadList();
  }, [props.user.CustomerId])


  const [selectedIndex, setSelectIndex]=React.useState(0)
  /**
   * 头部切换点击
   * @param headerObj
   */
  const onHeaderSwitch=(headerObj: { title: string, value: number }) => {
    contentScroll(headerObj.value);
    setSelectIndex(headerObj.value);
  }

  const getConfig=() => {
    let config: any={
      header: [],
      children: []
    }
    let v=0;
    if (props.ledgerPermission) {
      config.header.push({ title: localStr('lang_asset_tab_ledger'), value: v })
      if (global.isConnected()) {
        config.children.push(<HierarchyList navigation={props.navigation} hierarchyListRefresh={() => loadList()} />)
      } else {
        config.children.push(<OfflineView onRetry={loadList} />)
      }

      v++;
    }
    if (props.ticketPermission&&props.hierarchyList.length>0) {
      config.header.push({ title: localStr('lang_asset_tab_inventory'), value: v })
      if (global.isConnected()) {
        config.children.push(<PdTicketList navigation={props.navigation} hierarchyList={props.hierarchyList} />)
      } else {
        config.children.push(<OfflineView onRetry={loadList} />)
      }
      v++;
    }
    return config;
  }

  return (
    <View style={{ flex: 1 }}>
      <Toolbar title={localStr('lang_asset_tab')} color={Colors.seBrandNomarl} borderColor={Colors.seBrandNomarl} />
      <View style={{ height: 46 }}>
        <HeaderSwitch onSwitchItem={onHeaderSwitch}
          backgroundColor={Colors.seBrandNomarl}
          showMoveLine={true}
          scrollEnable={false}
          normalCol={Colors.seTextInverse}
          selectedCol={Colors.seTextInverse}
          titles={getConfig().header} />
      </View>
      {
        <MaintainContainerView scrollViewRef={scrollContentRef}
          children={getConfig().children} />
      }

    </View>
  )
}

const mapStateToProps=(state: any) => {

  let alarm=state.alarmList;
  let user=state.user.toJSON().user;
  return {
    user: user,
    ticketPermission: privilegeHelper.hasAuth(privilegeHelper.CodeMap.AssetTicketRead)||
      privilegeHelper.hasAuth(privilegeHelper.CodeMap.AssetTicketFull)||
      privilegeHelper.hasAuth(privilegeHelper.CodeMap.AssetTicketExecute),
    ledgerPermission: privilegeHelper.hasAuth(privilegeHelper.CodeMap.LedgerFull)||
      privilegeHelper.hasAuth(privilegeHelper.CodeMap.LedgerRead),
    hierarchyList: alarm.hierarchyList,
    hierarchyListLoading: alarm.hierarchyListLoading
  }
}
export default connect(mapStateToProps, {
  loadHierarchyList,
})(AssetManager);
