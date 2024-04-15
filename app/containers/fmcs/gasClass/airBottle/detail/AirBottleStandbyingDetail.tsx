import React from "react";
import {
  Alert,
  FlatList,
  InteractionManager,
  KeyboardAvoidingView,
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
  cleaAirBottleDetail,
  loadAirBottleDetail, loadInStandByBottleState,
  redactStandby, updateInStandByBottleState,
} from "../../../../../actions/airBottle/airBottleAction";
import {RequestStatus} from "../../../../../middleware/api";
import moment from "moment";
import {
  getImageUrl,
  handleImageUrl,
  isEmptyString,
  TimeFormatYMD,
  TimeFormatYMDHM, TimeFormatYMDHMS
} from "../../../../../utils/const/Consts";
import ImageView from "react-native-image-viewing";

interface RequestInputProps {
  id: number,
  waitStartTime?: number,
  waitEndTime?: string,
  waitRemark?: string,
  flow?: boolean,
  timeDate?: string,
}

///in standby  详情
function AirBottleStandbyingDetail(props: any) {

  /**
   * 图片浏览 是否可见
   */
  const [imageViewingVisible, setImageViewingVisible] = React.useState({
    visible: false,
    sectionType: BottleSectionType.basicMsg,
    PTType: 1,
    index: 0
  });

  /**
   * 请求入参
   */
  const [input, setInput] = React.useState<RequestInputProps>({
    id: props.airBottle.id,
  });

  const [waitMark, setWaitMark] = React.useState('');

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

  /**
   * 页面销毁 清除详情数据
   */
  React.useEffect(() => {
    return () => {
      props.cleaAirBottleDetail();
      props.airBottleDetailLoadingStatus(RequestStatus.initial);
    }
  }, []);

  React.useEffect(() => {
    if (props.airBottleStandByState == false) {
      Alert.alert('', '气瓶当前状态不是“待机中”，请确认是否已完成“待机操作”？', [
        {
          text: '取消',
          onPress: () => {
            props.updateInStandByBottleState(-1);
          }
        },
        {
          text: '确定',
          onPress: () => {
            input.timeDate = moment().format(TimeFormatYMDHMS);
            setInput({...input});
          }
        }
      ])
    } else if (props.airBottleStandByState == true) {
      input.timeDate = moment().format(TimeFormatYMDHMS);
      setInput({...input});
    }
  }, [props.airBottleStandByState]);


  /**
   * 监听input变化
   */
  React.useEffect(() => {
    ///更换中编辑
    if (input.timeDate) {
      ///编辑更换中 状态
      props.redactStandby(input);
    }
  }, [input.timeDate]);

  /**
   * 监听待前吹详情请求
   */
  React.useEffect(() => {
    if (props.standbyRequestStatus == RequestStatus.loading) {
      SndToast.showLoading();
    } else if (props.standbyRequestStatus == RequestStatus.success) {
      SndToast.dismiss();
      ///成功
      if (input.flow) {
        ///状态改变
        props.navigator.pop();
      } else {
        props.loadAirBottleDetail(props.airBottle.id);
      }
      ///刷新列表
      props.refreshCallBack && props.refreshCallBack();
    } else if (props.standbyRequestStatus == RequestStatus.error) {
      SndToast.dismiss();
    }
  }, [props.standbyRequestStatus]);

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
        isExpand: false,
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
            canEdit: false,
            title: '前吹结束',
            subTitle: '',
          },
          {
            isRequire: false,
            canEdit: false,
            title: '备注',
            subTitle: '',
            type: BottleItemType.tip,
          },
        ]
      },
      {
        title: '换瓶操作',
        icon: require('../../../../../images/aaxiot/airBottle/change.png'),
        sectionType: BottleSectionType.exchange,
        isExpand: false,
        expandCallBack: (sectionType: BottleSectionType) => {
          onPressExpend(sectionType);
        },
        dataObj: [
          {
            isRequire: false,
            canEdit: false,
            title: '换瓶操作人',
            subTitle: '请选择',

          },
          {
            isRequire: false,
            canEdit: false,
            title: '换瓶确认人',
            subTitle: '请选择',
          },
          {
            isRequire: false,
            canEdit: false,
            title: 'PT1照片',
            type: BottleItemType.picture,
            pictures: [],
            onPressPicture: (index: number) => {
              setImageViewingVisible({visible: true, sectionType: BottleSectionType.exchange, PTType: 1, index: index});
            }
          },
          {
            isRequire: false,
            canEdit: false,
            title: 'PT2照片',
            type: BottleItemType.picture,
            pictures: [],
            onPressPicture: (index: number) => {
              setImageViewingVisible({visible: true, sectionType: BottleSectionType.exchange, PTType: 2, index: index});
            }
          },
          {
            isRequire: false,
            canEdit: false,
            title: '更换开始',
            subTitle: '',
          },
          {
            isRequire: false,
            canEdit: false,
            title: '更换结束',
            subTitle: '',
          },
          {
            isRequire: false,
            canEdit: false,
            title: '物料号',
            subTitle: '',
            type: BottleItemType.scan,
          },
          {
            isRequire: false,
            canEdit: false,
            title: '钢瓶号',
            subTitle: '',
            type: BottleItemType.scan,
          },
          {
            isRequire: false,
            canEdit: false,
            title: '有限日期',
            subTitle: '',
            type: BottleItemType.scan,
          },
          {
            isRequire: false,
            canEdit: false,
            title: '垫片使用数量',
            subTitle: '',
            type: BottleItemType.input,

          },
          {
            isRequire: false,
            canEdit: false,
            title: '备注',
            subTitle: '',
            type: BottleItemType.tip,
          },
        ]
      },
      {
        title: 'Standby操作',
        icon: require('../../../../../images/aaxiot/airBottle/standby.png'),
        isExpand: true,
        expandCallBack: (sectionType: BottleSectionType) => {
          onPressExpend(sectionType);
        },
        sectionType: BottleSectionType.standby,
        dataObj: [
          {
            isRequire: false,
            canEdit: false,
            title: '待机操作人',
            subTitle: '',
          },
          {
            isRequire: false,
            canEdit: false,
            title: '待机确认人',
            subTitle: '',
          },
          {
            isRequire: false,
            canEdit: false,
            title: 'PT1照片',
            type: BottleItemType.picture,
            pictures: [],
            onPressPicture: (index: number) => {
              setImageViewingVisible({visible: true, sectionType: BottleSectionType.standby, PTType: 1, index: index});
            }
          },
          {
            isRequire: false,
            canEdit: false,
            title: 'PT2照片',
            type: BottleItemType.picture,
            pictures: [],
            onPressPicture: (index: number) => {
              setImageViewingVisible({visible: true, sectionType: BottleSectionType.standby, PTType: 2, index: index});
            }
          },
          {
            isRequire: false,
            canEdit: false,
            title: '待机开始',
            subTitle: '',
          },
          {
            isRequire: false,
            canEdit: true,
            title: '备注',
            subTitle: '',
            type: BottleItemType.tip,
            textChangeCallBack: (text: string) => {
              setWaitMark(text);
            },
          },
        ]
      }
    ]
  };

  const [detailDataSource, setDetailDataSource] = React.useState(configInitialData());

  const isCurrentUser = () => {
    const detail = props.detail;
    const userId = props.currentUser?.Id;
    return (detail.waitOperatorId == userId || detail.waitConfirmId == userId);
  }
  /**
   * 根据detail 设置详情数据
   */
  React.useEffect(() => {
    const detail = props.detail;
    ///照片数组
    let changePT1 = [], changePT2 = [], waitPT1 = [], waitPT2 = [];
    if (detail.fileList && detail.fileList.length > 0) {
      for (const file of detail.fileList) {
        if (file.fieldCode.indexOf('CHANGE_PT1') !== -1) {
          changePT1.push({uri: handleImageUrl(file.fileKey), needUpload: false});
        } else if (file.fieldCode.indexOf('CHANGE_PT2') !== -1) {
          changePT2.push({uri: handleImageUrl(file.fileKey), needUpload: false});
        } else if (file.fieldCode.indexOf('WAIT_PT1_IMAGE') !== -1) {
          waitPT1.push({uri: handleImageUrl(file.fileKey), needUpload: false});
        } else if (file.fieldCode.indexOf('WAIT_PT2_IMAGE') !== -1) {
          waitPT2.push({uri: handleImageUrl(file.fileKey), needUpload: false});
        }
      }
    }
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
        element.dataObj[3].subTitle = moment(detail.blowEndTime).format(TimeFormatYMDHM);
        element.dataObj[4].subTitle = detail.blowRemark;
      } else if (element.sectionType == BottleSectionType.exchange) {
        element.dataObj[0].subTitle = detail.changeOperator;
        element.dataObj[1].subTitle = detail.changeConfirm;
        // @ts-ignore
        element.dataObj[2].pictures = changePT1;
        // @ts-ignore
        element.dataObj[3].pictures = changePT2;
        element.dataObj[4].subTitle = moment(detail.changeStartTime).format(TimeFormatYMDHM);
        element.dataObj[5].subTitle = moment(detail.changeEndTime).format(TimeFormatYMDHM);
        element.dataObj[6].subTitle = detail.material;
        element.dataObj[7].subTitle = detail.cylinderNo;
        element.dataObj[8].subTitle = isEmptyString(detail.validTime) ? '-' : moment(detail.validTime).format(TimeFormatYMD);
        element.dataObj[9].subTitle = String(detail.shimActUsageQuantity);
        element.dataObj[10].subTitle = detail.changeRemark;
      } else if (element.sectionType == BottleSectionType.standby) {
        element.dataObj[0].subTitle = detail.waitOperator;
        element.dataObj[1].subTitle = detail.waitConfirm;
        // @ts-ignore
        element.dataObj[2].pictures = waitPT1;
        // @ts-ignore
        element.dataObj[3].pictures = waitPT2;
        element.dataObj[4].subTitle = moment(detail.waitStartTime).format(TimeFormatYMDHM);
        element.dataObj[5].subTitle = detail.waitRemark;
      }
    }

    setDetailDataSource([...detailDataSource]);

    ///如果有值 需要赋值,
    if (detail.waitStartTime) {
      input.waitStartTime = detail.waitStartTime;
    }
    if (detail.waitRemark) {
      input.waitRemark = detail.waitRemark;
      setWaitMark(detail.waitRemark);
    }
    setInput({...input});
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
    if (flow) {
      ///前吹完成时  才检查气瓶状态 是否是已前吹
      props.loadInStandByBottleState(props.detail.positionCode, props.detail.deviceId);
    } else {
      input.timeDate = moment().format(TimeFormatYMDHMS);
    }
    input.flow = flow;
    input.waitRemark = waitMark;
    input.waitEndTime = flow ? moment().format(TimeFormatYMDHMS) : '';
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
          title: '完成待机',
          textColor: Colors.white,
          onPressCallBack: () => {
            editBottleRequest(true);
          },
          btnStyle: {marginRight: 30, flex: 1, backgroundColor: Colors.theme}
        }];
    }
    return (
      (actions.length > 0) && <BottleDetailActionView actions={actions}/>
    )
  }

  /**
   * 图片浏览器 大图浏览
   */
  const renderImageViewing = () => {
    let images1 = [], images2 = [];
    let detail = props.detail;
    if (imageViewingVisible.sectionType == BottleSectionType.exchange) {
      ///更换图片预览
      if (detail.fileList && detail.fileList.length > 0) {
        for (const file of detail.fileList) {
          if (file.fieldCode.indexOf('CHANGE_PT1') !== -1) {
            images1.push({uri: handleImageUrl(file.fileKey)});
          } else if (file.fieldCode.indexOf('CHANGE_PT2') !== -1) {
            images2.push({uri: handleImageUrl(file.fileKey)});
          }
        }
      }
    } else if (imageViewingVisible.sectionType == BottleSectionType.standby) {
      ///standby图片预览
      if (detail.fileList && detail.fileList.length > 0) {
        for (const file of detail.fileList) {
          if (file.fieldCode.indexOf('WAIT_PT1_IMAGE') !== -1) {
            images1.push({uri: handleImageUrl(file.fileKey)});
          } else if (file.fieldCode.indexOf('WAIT_PT2_IMAGE') !== -1) {
            images2.push({uri: handleImageUrl(file.fileKey)});
          }
        }
      }
    }


    return (
      <ImageView
        images={imageViewingVisible.PTType == 1 ? images1 : images2}
        keyExtractor={(imageSrc, index) => imageSrc + String(index)}
        imageIndex={imageViewingVisible.index}
        visible={imageViewingVisible.visible}
        onRequestClose={() => setImageViewingVisible({
          visible: false,
          sectionType: BottleSectionType.basicMsg,
          PTType: 1,
          index: 0
        })}
      />
    )
  }

  return (
    <View style={{flex: 1}}>
      <Toolbar title={'气瓶更换任务详情'} navIcon="back" onIconClicked={onPop}/>
      <KeyboardAvoidingView style={{flex: 1, backgroundColor: Colors.background.primary}} behavior={'height'}>
        <FlatList data={detailDataSource}
                  contentContainerStyle={{paddingBottom: 15}}
                  renderItem={(item) => BottleDetailItem(item.item)}
          // @ts-ignore
                  keyExtractor={(item, index) => item.title + index}/>
      </KeyboardAvoidingView>
      {configBottomAction()}
      {renderImageViewing()}
    </View>
  )
}


const mapStateToProps = (state: any) => {
  const bottleDetail = state.airBottle.AirBottleDetailReducer;
  const user = state.user.toJSON().user;
  return {
    currentUser: user,
    loadingStatus: bottleDetail.loadingStatus,
    detail: bottleDetail.detail,
    standbyRequestStatus: bottleDetail.standbyRequestStatus,
    airBottleStandByState: bottleDetail.airBottleStandByState
  }
}

export default connect(mapStateToProps, {
  loadAirBottleDetail,
  redactStandby,
  cleaAirBottleDetail,
  airBottleDetailLoadingStatus,
  loadInStandByBottleState,
  updateInStandByBottleState,
})(AirBottleStandbyingDetail);
