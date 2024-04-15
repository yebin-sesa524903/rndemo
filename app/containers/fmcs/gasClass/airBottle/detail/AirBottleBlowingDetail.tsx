import React from "react";
import {
  Alert,
  FlatList,
  InteractionManager,
  View
} from 'react-native';
import {connect} from "react-redux";
// @ts-ignore
import Toolbar from "../../../../../components/Toolbar";
import Colors from "../../../../../utils/const/Colors";
import {
  BottleDetailItem,
  BottleItemType,
  BottleSectionType
} from "../../../../../components/fmcs/gasClass/airBottle/detail/BottleDetaiItem";
import BottleDetailActionView from "../../../../../components/fmcs/gasClass/airBottle/detail/BottleDetailActionView";
import SndToast from "../../../../../utils/components/SndToast";
import {
  airBottleDetailLoadingStatus,
  cleaAirBottleDetail, loadAirBottleCurrentState,
  loadAirBottleDetail,
  redactBlowing, updateAirBottleCurrentState,
} from "../../../../../actions/airBottle/airBottleAction";
import {RequestStatus} from "../../../../../middleware/api";
import moment from "moment";
import {TimeFormatYMDHM, TimeFormatYMDHMS} from "../../../../../utils/const/Consts";

interface RequestInputProps {
  id: number,
  blowStartTime?: string,
  blowEndTime?: string,
  blowRemark?: string,
  flow: boolean,
  timeDate?: string,
}

///前吹中 详情
///未分配/已分配/
function AirBottleBlowingDetail(props: any) {
  /**
   * 请求入参
   */
  const [input, setInput] = React.useState<RequestInputProps>({
    id: props.airBottle.id,
    flow: false,
  });

  const [remark, setRemark] = React.useState('');

  /**
   * 获取详情
   */
  React.useEffect(() => {
    props.loadAirBottleDetail(props.airBottle.id);
  }, []);

  /**
   * 监听详情获取 请求状态
   */
  React.useEffect(() => {
    if (props.loadingStatus == RequestStatus.loading) {
      SndToast.showLoading();
    } else if (props.loadingStatus == RequestStatus.success) {
      SndToast.dismiss();
      props.airBottleDetailLoadingStatus(RequestStatus.initial);
    } else if (props.loadingStatus == RequestStatus.error) {
      SndToast.dismiss();
    }
  }, [props.loadingStatus]);

  React.useEffect(()=>{
    if (props.airBottleBlowingState == false) {
      Alert.alert('', '气瓶当前状态不是“已前吹”，请确认是否已完成“前吹操作”？', [
        {
          text:'取消',
          onPress: ()=>{
            props.updateAirBottleCurrentState(-1);
          }
        },
        {
          text:'确定',
          onPress: ()=>{
            input.timeDate = moment().format(TimeFormatYMDHMS);
            setInput({...input});
          }
        }
      ])
    } else if (props.airBottleBlowingState == true) {
      input.timeDate = moment().format(TimeFormatYMDHMS);
      setInput({...input});
    }
  }, [props.airBottleBlowingState]);

  /**
   * 页面销毁 清除详情数据
   */
  React.useEffect(() => {
    return () => {
      props.cleaAirBottleDetail();
    }
  }, []);

  /**
   * 监听input变化
   */
  React.useEffect(() => {
    ///前吹中编辑
    if (input.timeDate) {
      props.redactBlowing(input);
    }
  }, [input.timeDate]);

  /**
   * 监听待前吹详情请求
   */
  React.useEffect(() => {
    if (props.blowingRequestStatus == RequestStatus.loading) {
      SndToast.showLoading();
    } else if (props.blowingRequestStatus == RequestStatus.success) {
      SndToast.dismiss();
      ///成功
      if (input.flow) {
        ///状态改变
        onPop();
      } else {
        props.loadAirBottleDetail(props.airBottle.id);
      }
      ///刷新列表
      props.refreshCallBack && props.refreshCallBack();
    } else if (props.blowingRequestStatus == RequestStatus.error) {
      SndToast.dismiss();
    }
  }, [props.blowingRequestStatus]);

  const onPop = () => {
    InteractionManager.runAfterInteractions(() => {
      props.navigator.pop();
    });
  }

  const configInitialData = () => {
    return [
      {
        title: '基本信息',
        icon: require('../../../../../images/aaxiot/airBottle/basic_msg.png'),
        isExpand: true,
        sectionType: BottleSectionType.basicMsg,
        expandCallBack: (sectionType: BottleSectionType) => {
          onPressExpend(sectionType);
        },
        dataObj: [
          {
            isRequire: false,
            canEdit: false,
            title: '气柜/气架',
            subTitle: '',
          },
          {
            isRequire: false,
            canEdit: false,
            title: '计划时间',
            subTitle: '',
          },
          {
            isRequire: false,
            canEdit: false,
            title: '创建人',
            subTitle: '',
          },
          {
            isRequire: false,
            canEdit: false,
            title: '创建时间',
            subTitle: '',
          },
          {
            isRequire: false,
            canEdit: false,
            title: '任务状态',
            subTitle: '',
          }
        ]
      },
      {
        title: '前吹操作',
        icon: require('../../../../../images/aaxiot/airBottle/blow.png'),
        isExpand: true,
        expandCallBack: (sectionType: BottleSectionType) => {
          onPressExpend(sectionType);
        },
        sectionType: BottleSectionType.blowing,
        dataObj: [
          {
            isRequire: false,
            canEdit: false,
            title: '前吹操作人',
            subTitle: '',
          },
          {
            isRequire: false,
            canEdit: false,
            title: '前吹确认人',
            subTitle: '',
          },
          {
            isRequire: false,
            canEdit: false,
            title: '前吹开始',
            subTitle: '',
          },
          {
            isRequire: false,
            canEdit: true,
            title: '备注',
            subTitle: '',
            placeholder: '请输入',
            type: BottleItemType.tip,
            textChangeCallBack: (text: string) => {
              setRemark(text);
            }
          },
        ]
      }
    ]
  };

  const [detailDataSource, setDetailDataSource] = React.useState(configInitialData());

  const isCurrentUser = () => {
    const detail = props.detail;
    const userId = props.currentUser?.Id;
    return (detail.blowOperatorId == userId || detail.blowConfirmId == userId);
  }
  /**
   * 根据detail 设置详情数据
   */
  React.useEffect(() => {
    const detail = props.detail;
    for (let element of detailDataSource) {
      if (element.sectionType == BottleSectionType.basicMsg) {
        element.dataObj[0].subTitle = detail.deviceName + `(${detail.positionName})`;
        element.dataObj[1].subTitle = moment(detail.planChangeTime).format(TimeFormatYMDHM);
        element.dataObj[2].subTitle = detail.createBy;
        element.dataObj[3].subTitle = moment(detail.createTime).format(TimeFormatYMDHM);
        element.dataObj[4].subTitle = detail.statusDesc;
      } else if (element.sectionType == BottleSectionType.blowing) {
        element.dataObj[0].subTitle = detail.blowOperator;
        element.dataObj[1].subTitle = detail.blowConfirm;
        element.dataObj[2].subTitle = moment(detail.blowStartTime).format(TimeFormatYMDHM);
        element.dataObj[3].subTitle = detail.blowRemark;
        element.dataObj[3].canEdit = isCurrentUser()
      }
    }
    setRemark(detail.blowRemark);
    setDetailDataSource([...detailDataSource]);

  }, [props.detail]);

  /**
   * 展开收起点击
   * @param sectionType
   */
  const onPressExpend = (sectionType: BottleSectionType) => {
    const dataSource = detailDataSource;
    for (let dataSourceElement of dataSource) {
      if (dataSourceElement.sectionType == sectionType) {
        dataSourceElement.isExpand = !dataSourceElement.isExpand;
        break;
      }
    }
    setDetailDataSource([...dataSource]);
  }

  /**
   * 编辑气瓶详情 待执行
   * @param flow
   * 判断按钮（判断编辑页面是触发保存按钮还是完成任务按钮）
   * ture -- 保存
   * false -- 完成任务
   */
  const editBottleRequest = (flow: boolean) => {
    if (flow){
      ///前吹完成时  才检查气瓶状态 是否是已前吹
      props.loadAirBottleCurrentState(props.detail.positionCode, props.detail.deviceId);
    }else {
      input.timeDate = moment().format(TimeFormatYMDHMS);
    }
    input.flow = flow;
    input.blowStartTime = props.detail.blowStartTime;
    input.blowEndTime = flow ? moment().format(TimeFormatYMDHMS) : '';
    input.blowRemark = remark;
    setInput({...input});
  }

  /**
   * 底部按钮更具状态
   */
  const configBottomAction = () => {
    let isCurrent = isCurrentUser();
    let actions: any[] = [];
    if (isCurrent) {
      ///操作人/确认人是自己
      actions = [
        {
          title: '保存',
          textColor: Colors.theme,
          btnStyle: {marginLeft: 30, marginRight: 12, flex: 1},
          onPressCallBack: () => {
            editBottleRequest(false);
          },
        },
        {
          title: '前吹完成',
          textColor: Colors.white,
          onPressCallBack: () => {
            editBottleRequest(true);
          },
          btnStyle: {marginRight: 30, flex: 1, backgroundColor: Colors.theme}
        }];
    }
    return (
      actions.length > 0 && <BottleDetailActionView actions={actions}/>
    )
  }

  return (
    <View style={{flex: 1}}>
      <Toolbar title={'气瓶更换任务详情'} navIcon="back" onIconClicked={onPop}/>
      <View style={{flex: 1, backgroundColor: Colors.background.primary}}>
        <FlatList data={detailDataSource} renderItem={(item) => BottleDetailItem(item.item)}
                  keyExtractor={(item, index) => item.title}/>
        {configBottomAction()}
      </View>
    </View>
  )
}


const mapStateToProps = (state: any) => {
  const bottleDetail = state.airBottle.AirBottleDetailReducer;
  const user = state.user.toJSON().user;
  return {
    currentUser: user,
    detail: bottleDetail.detail,
    loadingStatus: bottleDetail.loadingStatus,
    blowingRequestStatus: bottleDetail.blowingRequestStatus,
    ///前吹完成 状态检查
    airBottleBlowingState: bottleDetail.airBottleBlowingState
  }
}

export default connect(mapStateToProps, {
  loadAirBottleDetail,
  redactBlowing,
  cleaAirBottleDetail,
  airBottleDetailLoadingStatus,
  loadAirBottleCurrentState,
  updateAirBottleCurrentState,
})(AirBottleBlowingDetail);
