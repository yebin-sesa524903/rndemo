import React from 'react'
import { Alert, View, } from 'react-native';
// @ts-ignore
import Toolbar from "../../../components/Toolbar";
import { connect } from "react-redux";
import WorkbenchSectionList, {
  ItemDataProps,
  WorkbenchType
} from "../../../components/fmcs/workbench/WorkbenchSectionList";
import AirBottleList from "../gasClass/airBottle/list/AirBottleList";
import AcidBucketList from "../gasClass/acidBucket/list/AcidBucketList";
import InspectionList from "../plantOperation/inspection/list/InspectionList";
import MaintainList from "../plantOperation/maintain/list/MaintainList";
import RepairList from "../plantOperation/repair/list/RepairList";
import AbnormalList from "../plantOperation/abnormal/list/AbnormalList";
import privilegeHelper from "../../../utils/privilegeHelper";
import permissionCode from "../../../utils/permissionCode";
import ConsumablesList from "../plantOperation/consumables/list/ConsumablesList";
import SpareRepertoryList from '../plantOperation/spareRepertory/list/SpareRepertoryList';
import {
  getRecentUseModules,
  loadDepartmentCodes,
  updateUseModule,
  workbenchDestroyClear
} from "../../../actions/workbench/workbenchAction";
import { RequestStatus } from "../../../middleware/api";
import SpareOutStoreHouseList from '../plantOperation/spareOutStoreHouse/list/SpareOutStoreHouseList';
import CallInList from "../callin/callTicket/list/CallInList";
import CallAlarmList from '../callin/callTicket/list/CallAlarmList';
import KnowledgeList from '../callin/knowledgeBase/list/KnowledgeList';
import { isEmptyString } from "../../../utils/const/Consts";
// @ts-ignore
// import { TicketList as ZdgdTicketList, configCookie as ZdgdConfigCookie } from "rn-module-diagnosis-ticket";
import { TicketList as XwycTicketList, configCookie as XwycConfigCookie } from "rn-module-abnormal-ticket";
import { TicketList as PdTicketList } from "rn-module-inventory-ticket";
import DeviceList from '../plantOperation/device/list/DeviceList'

function Workbench(props: any) {

  React.useEffect(() => {
    loadRecentUseModules();
    loadDepartSystemMsg();
  }, []);

  React.useEffect(() => {
    if (props.updateRequestStatus==RequestStatus.success) {
      loadRecentUseModules()
    }
  }, [props.updateRequestStatus])

  /**
   * 获取最近常使用点击
   */
  const loadRecentUseModules=() => {
    let params={
      pageItem: {
        pageSize: 4,
      },
    };
    // props.getRecentUseModules(params)
  }

  /**
   * 获取课室信息
   */
  const loadDepartSystemMsg=() => {
    let user=props.user;
    if (!isEmptyString(user.CustomerId)) {
      let params={ userId: user.Id, customerId: user.CustomerId };
      //props.loadDepartmentCodes(params);
    }
  }

  /**
   * 工作台销毁
   */
  React.useEffect(() => {
    return () => {
      props.workbenchDestroyClear();
    }
  }, [])

  /**
   * item 被点击
   * @param itemObj
   */
  const itemOnPress=(itemObj: ItemDataProps) => {
    if (!itemObj.type) {
      return;
    }
    if (itemObj.type==WorkbenchType.airBottle) {
      props.navigator.push({ id: 'air_bottle_list', component: AirBottleList });
    } else if (itemObj.type==WorkbenchType.acidBucket) {
      props.navigator.push({ id: 'acid_bucket_list', component: AcidBucketList });
    } else if (itemObj.type==WorkbenchType.inspection) {
      props.navigator.push({
        id: 'inspection_list',
        component: InspectionList,
        passProps: {
          departmentCodes: props.departmentCodes,
        }
      });
    } else if (itemObj.type==WorkbenchType.maintain) {
      props.navigator.push({
        id: 'maintain_list',
        component: MaintainList,
        passProps: {
          departmentCodes: props.departmentCodes,
        }
      });
    } else if (itemObj.type==WorkbenchType.repair) {
      props.navigator.push({ id: 'repair_list', component: RepairList });
    } else if (itemObj.type==WorkbenchType.abnormal) {
      props.navigator.push({ id: 'abnormal_list', component: AbnormalList });
    } else if (itemObj.type==WorkbenchType.consumables) {
      props.navigator.push({
        id: 'consumables_list',
        component: ConsumablesList,
        passProps: {
          departmentCodes: props.departmentCodes,
        }
      });
    } else if (itemObj.type==WorkbenchType.sparePartsOutboundStorage) {
      props.navigator.push({
        id: 'abnormal_list',
        component: SpareOutStoreHouseList,
        passProps: {
          departmentCodes: props.departmentCodes,
        }
      });
    } else if (itemObj.type==WorkbenchType.sparePartsCount) {
      props.navigator.push({
        id: 'spareRepertory_list',
        component: SpareRepertoryList,
        passProps: {
          departmentCodes: props.departmentCodes,
        }
      });
    } else if (itemObj.type==WorkbenchType.callInTicket) {
      props.navigator.push({
        id: 'call_In_List',
        component: CallInList,
      })
    } else if (itemObj.type==WorkbenchType.callInWarningTicket) {
      props.navigator.push({
        id: 'call_in_warning_List',
        component: CallAlarmList,
      })
    } else if (itemObj.type==WorkbenchType.knowledge) {
      props.navigator.push({
        id: 'call_in_knowledge_List',
        component: KnowledgeList,
      })
    } else if (itemObj.type==WorkbenchType.zdgdTickets) {
      // props.navigator.push({
      //   id: 'ds_ticket_list',
      //   component: ZdgdTicketList,
      //   passProps: {
      //     showToolBar: true,
      //     navigator: props.navigator,
      //   }
      // })
    } else if (itemObj.type==WorkbenchType.xwycTickets) {
      props.navigator.push({
        id: 'ds_ticket_list',
        component: XwycTicketList,
        passProps: {
          showToolBar: true,
          navigator: props.navigator,
        }
      })
    } else if (itemObj.type==WorkbenchType.pdTickets) {
      props.navigator.push({
        id: 'ds_ticket_list',
        component: PdTicketList,
        passProps: {
          showToolBar: true,
          navigator: props.navigator,
        }
      })
    } else if (itemObj.type==WorkbenchType.assetList) {
      // Alert.alert('温馨提示', '功能正在开发中，请您关注后续更新');
      props.navigator.push({
        id: 'ds_ticket_list',
        component: DeviceList,
        passProps: {
          showToolBar: true,
          navigator: props.navigator,
          onBack: () => props.navigator.pop()
        }
      })
    }
    ///更新最近使用
    // props.updateUseModule({
    //   type: itemObj.type,
    //   name: itemObj.itemName,
    // })
  }

  const workbenchData=React.useMemo(() => {
    if (props.user.PrivilegeCodes) {
      privilegeHelper.setPrivilegeCodes(props.user.PrivilegeCodes);
    }
    let recentlyData=[], allData=[];
    for (let module of props.modules) {
      let iconName=undefined;
      if (module.type==WorkbenchType.airBottle&&privilegeHelper.checkModulePermission(permissionCode.GAS_AIR_BOTTLE)) {
        iconName=require('../../../images/aaxiot/workbranch/bottle.png');
      } else if (module.type==WorkbenchType.acidBucket&&privilegeHelper.checkModulePermission(permissionCode.GAS_ACID_BUCKET)) {
        iconName=require('../../../images/aaxiot/workbranch/suantonggenghuan.png');
      } else if (module.type==WorkbenchType.inspection&&privilegeHelper.checkModulePermission(permissionCode.PLANT_INSPECTION)) {
        iconName=require('../../../images/aaxiot/workbranch/xunjianzx.png');
      } else if (module.type==WorkbenchType.maintain&&privilegeHelper.checkModulePermission(permissionCode.PLANT_MAINTAIN)) {
        iconName=require('../../../images/aaxiot/workbranch/baoyangzhx.png');
      } else if (module.type==WorkbenchType.repair&&privilegeHelper.checkModulePermission(permissionCode.PLANT_REPAIR)) {
        iconName=require('../../../images/aaxiot/workbranch/weixiuzhx.png');
      } else if (module.type==WorkbenchType.abnormal&&privilegeHelper.checkModulePermission(permissionCode.PLANT_ABNORMAL)) {
        iconName=require('../../../images/aaxiot/workbranch/yichangdj.png');
      } else if (module.type==WorkbenchType.consumables&&privilegeHelper.checkModulePermission(permissionCode.PLANT_CONSUMABLES)) {
        iconName=require('../../../images/aaxiot/workbranch/haocaigh.png');
      } else if (module.type==WorkbenchType.sparePartsOutboundStorage&&privilegeHelper.checkModulePermission(permissionCode.PLANT_SPARE_PARTS_OUTBOUND_STORAGE)) {
        iconName=require('../../../images/aaxiot/workbranch/beijianchk.png');
      } else if (module.type==WorkbenchType.sparePartsCount&&privilegeHelper.checkModulePermission(permissionCode.PLANT_SPARE_PARTS_COUNT)) {
        iconName=require('../../../images/aaxiot/workbranch/beijianpd.png');
      } else if (module.type==WorkbenchType.callInTicket) {
        iconName=require('../../../images/aaxiot/workbranch/huawugongdan.png');
      } else if (module.type==WorkbenchType.callInWarningTicket) {
        iconName=require('../../../images/aaxiot/workbranch/baojinggongdan.png');
      } else if (module.type==WorkbenchType.knowledge&&privilegeHelper.checkModulePermission(permissionCode.KNOWLEDGE_LIBRARY)) {
        iconName=require('../../../images/aaxiot/workbranch/zhishiku.png');
      }
      if (iconName!=undefined) {
        recentlyData.push({
          type: module.type,
          iconName: iconName,
          itemName: module.name,
        })
      }
    }

    // if (privilegeHelper.checkModulePermission(permissionCode.GAS_AIR_BOTTLE)) {
    //   allData.push({
    //     type: WorkbenchType.airBottle,
    //     iconName: require('../../../images/aaxiot/workbranch/bottle.png'),
    //     itemName: '气瓶更换',
    //   })
    // }
    // if (privilegeHelper.checkModulePermission(permissionCode.GAS_ACID_BUCKET)) {
    //   allData.push({
    //     type: WorkbenchType.acidBucket,
    //     iconName: require('../../../images/aaxiot/workbranch/suantonggenghuan.png'),
    //     itemName: '酸桶更换',
    //   })
    // }
    // if (privilegeHelper.checkModulePermission(permissionCode.PLANT_INSPECTION)&&props.departmentCodes.length>0) {
    //   allData.push({
    //     type: WorkbenchType.inspection,
    //     iconName: require('../../../images/aaxiot/workbranch/xunjianzx.png'),
    //     itemName: '巡检执行',
    //   })
    // }
    // if (privilegeHelper.checkModulePermission(permissionCode.PLANT_MAINTAIN)&&props.departmentCodes.length>0) {
    //   allData.push({
    //     type: WorkbenchType.maintain,
    //     iconName: require('../../../images/aaxiot/workbranch/baoyangzhx.png'),
    //     itemName: '保养执行',
    //   })
    // }
    // if (privilegeHelper.checkModulePermission(permissionCode.PLANT_REPAIR)) {
    //   allData.push({
    //     type: WorkbenchType.repair,
    //     iconName: require('../../../images/aaxiot/workbranch/weixiuzhx.png'),
    //     itemName: '维修执行',
    //   })
    // }
    // if (privilegeHelper.checkModulePermission(permissionCode.PLANT_ABNORMAL)) {
    //   allData.push({
    //     type: WorkbenchType.abnormal,
    //     iconName: require('../../../images/aaxiot/workbranch/yichangdj.png'),
    //     itemName: '异常点检执行',
    //   })
    // }
    // if (privilegeHelper.checkModulePermission(permissionCode.PLANT_CONSUMABLES)&&props.departmentCodes.length>0) {
    //   allData.push({
    //     type: WorkbenchType.consumables,
    //     iconName: require('../../../images/aaxiot/workbranch/haocaigh.png'),
    //     itemName: '耗材更换执行',
    //   })
    // }

    // if (privilegeHelper.checkModulePermission(permissionCode.PLANT_SPARE_PARTS_OUTBOUND_STORAGE)&&props.departmentCodes.length>0) {
    //   allData.push({
    //     type: WorkbenchType.sparePartsOutboundStorage,
    //     iconName: require('../../../images/aaxiot/workbranch/beijianchk.png'),
    //     itemName: '备件出库',
    //   })
    // }

    // if (privilegeHelper.checkModulePermission(permissionCode.PLANT_SPARE_PARTS_COUNT)&&props.departmentCodes.length>0) {
    //   allData.push({
    //     type: WorkbenchType.sparePartsCount,
    //     iconName: require('../../../images/aaxiot/workbranch/beijianpd.png'),
    //     itemName: '备件盘点',
    //   })
    // }

    // // if (privilegeHelper.checkModulePermission(permissionCode.CALL_IN_TICKETS)) {
    // allData.push({
    //   type: WorkbenchType.callInTicket,
    //   iconName: require('../../../images/aaxiot/workbranch/huawugongdan.png'),
    //   itemName: '话务工单',
    // })
    // // }
    // // if (privilegeHelper.checkModulePermission(permissionCode.CALL_IN_WARNING_TICKETS)) {
    // allData.push({
    //   type: WorkbenchType.callInWarningTicket,
    //   iconName: require('../../../images/aaxiot/workbranch/baojinggongdan.png'),
    //   itemName: 'call in报警工单',
    // })
    // // }
    // if (privilegeHelper.checkModulePermission(permissionCode.KNOWLEDGE_LIBRARY)) {
    //   allData.push({
    //     type: WorkbenchType.knowledge,
    //     iconName: require('../../../images/aaxiot/workbranch/zhishiku.png'),
    //     itemName: '知识库概览',
    //   })
    // }

    allData.push({
      type: WorkbenchType.zdgdTickets,
      iconName: 'moon_icon-repair_wb',//require('../../../images/aaxiot/workbranch/weixiuzhx.png'),
      itemName: '诊断工单',
    })
    allData.push({
      type: WorkbenchType.xwycTickets,
      iconName: 'moon_icon-warning_wb',//require('../../../images/aaxiot/workbranch/yichangdj.png'),
      itemName: '行为异常工单',
    })
    allData.push({
      type: WorkbenchType.pdTickets,
      iconName: 'moon_icon-replacementCheck_wb',//require('../../../images/aaxiot/workbranch/beijianpd.png'),
      itemName: '盘点工单',
    })
    allData.push({
      type: WorkbenchType.assetList,
      iconName: 'moon_icon-device-list',//require('../../../images/aaxiot/workbranch/zhishiku.png'),
      itemName: '资产列表',
    })

    let data=[];
    if (recentlyData.length<4) {
      let tempAllData=[];
      for (let allDatum of allData) {
        let founded=false;
        for (const recentlyDatum of recentlyData) {
          if (recentlyDatum.type==allDatum.type) {
            founded=true;
          }
        }
        if (!founded) {
          tempAllData.push(allDatum);
        }
      }

      let newRecentlyData=[];
      for (let i=0; i<4-recentlyData.length; i++) {
        if (tempAllData.length>4-recentlyData.length) {
          newRecentlyData.push(tempAllData[i]);
        } else {
          newRecentlyData.push(...tempAllData);
          break;
        }
      }
      recentlyData=recentlyData.concat(newRecentlyData);
    }
    if (props.departmentCodes.length>0) {
      // data.push({
      //   title: '经常使用',
      //   data: recentlyData,
      // });
    }
    if (allData.length>0) {
      data.push({
        title: '全部应用',
        data: allData,
      })
    }
    return data;
  }, [props.modules, props.user.PrivilegeCodes]);

  return (
    <View style={{ flex: 1 }}>
      <Toolbar title={'工作台'} />
      <WorkbenchSectionList itemOnPress={itemOnPress} workbenches={workbenchData} />
    </View>
  )
}

const mapStateToProps=(state: any) => {
  const user=state.user.toJSON().user;
  return {
    user: user,
    modules: state.workbench.modules,
    updateRequestStatus: state.workbench.updateRequestStatus,
    departmentCodes: state.workbench.departmentCodes,
  }
}
export default connect(mapStateToProps, {
  getRecentUseModules,
  updateUseModule,
  loadDepartmentCodes,
  workbenchDestroyClear,
})(Workbench);
