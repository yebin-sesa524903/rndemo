import React from "react";
import { FlatList, InteractionManager, View } from 'react-native';
import { connect } from "react-redux";
// @ts-ignore
import Toolbar from "../../../../../components/Toolbar";
import Colors from "../../../../../utils/const/Colors";
import BottleDetailActionView from "../../../../../components/fmcs/gasClass/airBottle/detail/BottleDetailActionView";
import { BucketDetailItem } from "../../../../../components/fmcs/gasClass/acidBucket/detail/BucketDetailItem";
import SndToast from "../../../../../utils/components/SndToast";
import {
  bucketForExecuteEdit,
  clearAcidBucketDetail,
  loadAcidBucketDetail,
  saveForExecuteDetailInfo,
  saveExecuteEditInput
} from "../../../../../actions/acidBucket/acidBucketAction";
import { loadUsers } from "../../../../../actions/airBottle/airBottleAction";
import SchActionSheet from "../../../../../components/actionsheet/SchActionSheet";
import { RequestStatus } from "../../../../../middleware/api";
import AcidBucketDoingDetail from "./AcidBucketDoingDetail";
import { convertRequestDetail } from "./AcidBucketHelper";
import sndToast from "../../../../../utils/components/SndToast";
import moment from "moment";
import { isEmptyString, TimeFormatYMDHMS } from "../../../../../utils/const/Consts";

/**
 * 待执行
 * @constructor
 */
function AcidBucketToDoDetail(props: any) {

  /**
   * 底部选择操作人/确认人 可见/不可见
   */
  const [visible, setVisible] = React.useState({ visible: false, userType: 0 });

  /**
   * component did load
   */
  React.useEffect(() => {
    props.loadAcidBucketDetail(props.bucketObj.id);
    props.loadUsers();
  }, []);

  React.useEffect(() => {
    if (!isEmptyString(props.forExecuteInput.timeDate)) {
      props.bucketForExecuteEdit(props.forExecuteInput);
    }
  }, [props.forExecuteInput.timeDate]);

  /**
   * component will un mount
   */
  React.useEffect(() => {
    return () => {
      props.clearAcidBucketDetail();
    }
  }, []);

  /**
   * 监听接口返回的详情数据 更新待执行详情业务模型数据
   */
  React.useEffect(() => {
    if (Object.keys(props.detail).length > 0 && props.users.length > 0) {
      let requestDetail = props.detail;
      let user = props.currentUser;
      let founded = false;
      if (props.users.length > 0) {
        for (let userObj of props.users) {
          if (userObj.userId == user.Id) {
            founded = true;
            break;
          }
        }
      }

      let details = convertRequestDetail(requestDetail, props.forExecuteDetail, founded ? user : undefined);
      props.saveForExecuteDetailInfo(details);

      ///将编辑执行的入参赋值
      if (requestDetail.operatorId && requestDetail.operatorId > 0 && requestDetail.confirmId && requestDetail.confirmId > 0) {
        let input = props.forExecuteInput;
        input.id = requestDetail.id;
        input.operator = requestDetail.operator;
        input.operatorId = requestDetail.operatorId;
        input.confirm = requestDetail.confirm;
        input.confirmId = requestDetail.confirmId;
        props.saveExecuteEditInput({ ...input })
      } else {
        if (founded) {
          let input = props.forExecuteInput;
          input.operator = user.RealName;
          input.operatorId = user.Id;
          input.confirm = user.RealName;
          input.confirmId = user.Id;
          props.saveExecuteEditInput({ ...input })
        }
      }
    }
  }, [props.detail, props.users]);

  /**
   * 监听 请求状态 修改当前详情的状态
   */
  React.useEffect(() => {
    if (props.forExecuteRequestStatus == RequestStatus.loading) {
      SndToast.showLoading();
    } else if (props.forExecuteRequestStatus == RequestStatus.success) {
      sndToast.dismiss();
      ///请求成功
      if (props.forExecuteInput.flow) {
        ///未分配 刷新列表即可
        props.loadAcidBucketDetail(props.bucketObj.id);
      } else {
        ///已分配 进入下个页面
        props.navigator.replace({
          id: 'acid_bucket_doing_detail',
          component: AcidBucketDoingDetail,
          navigator: props.navigator,
          passProps: { bucketObj: props.bucketObj, refreshCallBack: props.refreshCallBack }
        })
      }
    } else if (props.forExecuteRequestStatus == RequestStatus.error) {
      sndToast.dismiss();
    }

  }, [props.forExecuteRequestStatus]);

  const onPopBack = () => {
    InteractionManager.runAfterInteractions(() => {
      props.navigator.pop();
    });
  };

  /**
   * 编辑气瓶详情 待执行
   * @param flow
   * 判断按钮（判断编辑页面是触发保存按钮还是完成任务按钮）
   * ture -- 保存
   * false -- 完成任务
   */
  const editBucketRequest = (flow: boolean) => {
    let input = props.forExecuteInput;
    if (!input.operator || input.operator.length == 0 || input.operatorId == -1) {
      SndToast.showTip('请选择操作人');
      return;
    }
    if (!input.confirm || input.confirm?.length == 0 || input.confirmId == -1) {
      SndToast.showTip('请选择确认人');
      return;
    }
    if (input.operatorId != props.currentUser.Id && input.confirmId != props.currentUser.Id) {
      SndToast.showTip('确认人或操作人必须有一个是当前操作人');
      return;
    }
    input.flow = flow;
    input.id = props.detail.id;
    input.timeDate = moment().format(TimeFormatYMDHMS);
    props.saveExecuteEditInput({ ...input });

  }

  const isCurrentUser = (currentUserId: number) => {
    const detail = props.detail;
    return (detail.operatorId == currentUserId || detail.confirmId == currentUserId);
  }

  const isAllocUser = () => {
    const detail = props.detail;
    return (detail.operatorId != undefined && detail.operatorId > 0) || (detail.confirmId != undefined && detail.confirmId > 0);
  }

  /**
   * 底部按钮更具状态
   */
  const configBottomAction = () => {
    const detail = props.detail;
    if (Object.keys(detail).length == 0) {
      return null;
    }
    let isAlloc = isAllocUser();
    let isCurrent = isCurrentUser(props.currentUser?.Id);
    let actions: any[] = [];
    if (isAlloc) {
      ///已分配
      if (isCurrent) {
        actions = [{
          title: '开始更换',
          textColor: Colors.white,
          onPressCallBack: () => {
            editBucketRequest(false);
          },
          btnStyle: { marginLeft: 30, marginRight: 30, flex: 1, backgroundColor: Colors.theme }
        }];
      } else {
        actions = [];
      }

    } else {
      ///未分配
      actions = [
        {
          title: '保存',
          textColor: Colors.theme,
          btnStyle: { marginLeft: 30, marginRight: 12, flex: 1 },
          onPressCallBack: () => {
            editBucketRequest(true);
          },
        },
        {
          title: '开始更换',
          textColor: Colors.white,
          onPressCallBack: () => {
            editBucketRequest(false);
          },
          btnStyle: { marginRight: 30, flex: 1, backgroundColor: Colors.theme }
        }];
    }
    return (
      actions.length > 0 && <BottleDetailActionView actions={actions} />
    )
  }

  /**
   * actionSheet 用户信息数组
   */
  const configSheetUsers = () => {
    const users = props.users;
    let tempArray = [];
    let userId = visible.userType == 0 ? props.forExecuteInput.operatorId : props.forExecuteInput.confirmId;
    for (let user of users) {
      tempArray.push({
        title: user.realName,
        type: user.userId,
        select: user.userId == userId,
      })
    }
    return tempArray;
  }

  /**
   * 选择操作人/确认人点击
   */
  const onPressSelectedItem = (type: number) => {
    setVisible({ visible: true, userType: type });
  }
  /**
   * action sheet 弹出选择框选择 操作人/确认人
   */
  const renderActionSheet = () => {
    return (
      visible.visible && <SchActionSheet title={visible.userType == 0 ? '请选择操作人' : '请选择确认人'}
        arrActions={configSheetUsers()}
        modalVisible={visible.visible}
        onCancel={() => {
          setVisible({ visible: false, userType: visible.userType });
        }}
        onSelect={(item: { title: string, type: number }) => {
          setVisible({ visible: false, userType: visible.userType });
          let tempInput = props.forExecuteInput;
          if (visible.userType == 0) {
            ///操作人
            tempInput.operator = item.title;
            tempInput.operatorId = item.type;

          } else {
            ///确认人
            tempInput.confirm = item.title;
            tempInput.confirmId = item.type;
          }
          props.saveExecuteEditInput({ ...tempInput });

          ///刷新页面
          let detailData = props.forExecuteDetail;
          for (let data of detailData) {
            if (data.sectionType == 1) {
              data.dataObj[visible.userType].subTitle = item.title;
            }
          }
          props.saveForExecuteDetailInfo([...detailData]);
        }}
      />
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <Toolbar title={'酸桶更换任务详情'} navIcon="back" onIconClicked={onPopBack} />
      <View style={{ flex: 1, backgroundColor: Colors.background.primary }}>
        <FlatList data={props.forExecuteDetail}
          renderItem={(item) => BucketDetailItem({ ...item.item, actionCallBack: onPressSelectedItem })}
          // @ts-ignore
          keyExtractor={(item, index) => item.title} />
        {configBottomAction()}
        {renderActionSheet()}
      </View>
    </View>
  )
}

const mapStateToProps = (state: any) => {
  const bucketDetail = state.acidBucket.AcidBucketDetailReducer;
  const bottleDetail = state.airBottle.AirBottleDetailReducer;
  const user = state.user.toJSON().user;
  return {
    currentUser: user,
    loading: bucketDetail.loading,
    ///待执行详情接口返回
    detail: bucketDetail.detail,
    ///action sheet 用户列表
    users: bottleDetail.users,
    ///编辑执行入参
    forExecuteInput: bucketDetail.forExecuteInput,
    //待执行详情数据
    forExecuteDetail: bucketDetail.forExecuteDetail,
    ///酸桶编辑 请求状态
    forExecuteRequestStatus: bucketDetail.forExecuteRequestStatus,
  }
}

export default connect(mapStateToProps, {
  loadAcidBucketDetail,
  bucketForExecuteEdit,
  loadUsers,
  clearAcidBucketDetail,
  saveExecuteEditInput,
  saveForExecuteDetailInfo,
})(AcidBucketToDoDetail);
