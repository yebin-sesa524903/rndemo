import React, { useState } from 'react'
import {
  View,
  Text,
} from 'react-native';
// @ts-ignore
import Toolbar from "../../../components/Toolbar";
import { connect } from "react-redux";
import GasBoard from "./gasBoard/GasBoard";
import WaterBoard from "./waterBoard/WaterBoard";
import privilegeHelper from "../../../utils/privilegeHelper";
import permissionCode from "../../../utils/permissionCode";
import ElectricBoard from './electricityBoard/ElectricBoard';
import MachineBoard from './mechanicalBoard/MachineBoard';
import { loadDepartmentCodes } from "../../../actions/workbench/workbenchAction";
import { isEmptyString } from "../../../utils/const/Consts";
import Colors from "../../../utils/const/Colors";
import FactoryBoard from "./factoryBoard/FactoryBoard";

function WorkBoard(props: any) {

  React.useEffect(() => {
    loadDepartSystemMsg();
  }, []);


  /**
   * 获取课室信息
   */
  const loadDepartSystemMsg=() => {
    let user=props.user;
    if (!isEmptyString(user.CustomerId)) {
      let params={ userId: user.Id, customerId: user.CustomerId };
      props.loadDepartmentCodes(params);
    }
  }
  /**
   * 看板展示
   */
  const renderBoardContent=() => {
    if (privilegeHelper.checkModulePermission(permissionCode.FM_WORK_BOARD)){
      return <FactoryBoard />
    }else if (privilegeHelper.checkModulePermission(permissionCode.MECHANIC_WORK_BOARD)) {
      ///机械课
      return <MachineBoard navigator={props.navigator} departmentCodes={props.departmentCodes} />
    } else if (privilegeHelper.checkModulePermission(permissionCode.ELECTRIC_WORK_BOARD)) {
      ///电课
      return <ElectricBoard navigator={props.navigator} departmentCodes={props.departmentCodes} />
    } else if (privilegeHelper.checkModulePermission(permissionCode.GAS_WORK_BOARD)) {
      ///气化课
      return <GasBoard />
    } else if (privilegeHelper.checkModulePermission(permissionCode.WATER_WORK_BOARD)) {
      ///水课
      return <WaterBoard navigator={props.navigator} departmentCodes={props.departmentCodes} />
    }
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 16, color: Colors.text.sub }}>暂无数据</Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <Toolbar title={'工作看板'} />
      {renderBoardContent()}

    </View>
  )
}

const mapStateToProps=(state: any) => {
  const user=state.user.toJSON().user;
  return {
    user: user,
    departmentCodes: state.workbench.departmentCodes,///课室codes信息
  }
}
export default connect(mapStateToProps, {
  loadDepartmentCodes,
})(WorkBoard);
