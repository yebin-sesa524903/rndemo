import React from "react";
import {
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
  cleaAirBottleDetail,
  loadAirBottleDetail,
  redactChanging,
} from "../../../../../actions/airBottle/airBottleAction";
import {RequestStatus} from "../../../../../middleware/api";
import moment from "moment";
import Scan from "../../../../assets/Scan";
import {
  handleImageUrl, isEmptyString,
  TimeFormatYMD,
  TimeFormatYMDHM,
  TimeFormatYMDHMS
} from "../../../../../utils/const/Consts";
import ImageView from "react-native-image-viewing";

interface RequestInputProps {
  id: number,
  changeStartTime?: number,
  changeEndTime?: string,
  material?: string,
  cylinderNo?: string
  validTime?: string,
  changeRemark?: string,
  shimActUsageQuantity?: number,
  flow?: boolean,
  timeDate?: string,
}

///待更换 详情
function AirBottleReplacingDetail(props: any) {
  /**
   * 请求入参
   */
  const [input, setInput] = React.useState<RequestInputProps>({
    id: props.airBottle.id,
  });

  const [imageViewingVisible, setImageViewingVisible] = React.useState({visible: false, PTType: 1, index: 0});

  const [material, setMaterial] = React.useState(undefined);
  React.useEffect(() => {
    if (material != undefined) {
      input.material = material;
      setInput({...input});
    }
  }, [material]);
  const [cylinderNo, setCylinderNo] = React.useState(undefined);

  React.useEffect(() => {
    if (cylinderNo != undefined) {
      input.cylinderNo = cylinderNo;
      setInput({...input});
    }
  }, [cylinderNo]);
  const [validTime, setValidTime] = React.useState(undefined);
  React.useEffect(() => {
    if (validTime != undefined) {
      input.validTime = validTime;
      setInput({...input});
    }
  }, [validTime]);

  const [shimActUsageQuantity, setShimActUsageQuantity] = React.useState(-1);
  React.useEffect(() => {
    if (shimActUsageQuantity != -1) {
      input.shimActUsageQuantity = shimActUsageQuantity;
      setInput({...input});
    }
  }, [shimActUsageQuantity]);

  const [remark, setRemark] = React.useState(undefined);
  React.useEffect(() => {
    if (remark != undefined) {
      input.changeRemark = remark;
      setInput({...input});
    }
  }, [remark]);

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

  /**
   * 监听input变化
   */
  React.useEffect(() => {
    ///更换中编辑
    if (input.material && input.validTime && input.cylinderNo && input.shimActUsageQuantity != 0) {
      ///编辑更换中 状态
      props.redactChanging(input);
    }
  }, [input.timeDate]);

  /**
   * 监听待前吹详情请求
   */
  React.useEffect(() => {
    if (props.changingRequestStatus == RequestStatus.loading) {
      SndToast.showLoading();
    } else if (props.changingRequestStatus == RequestStatus.success) {
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
    } else if (props.changingRequestStatus == RequestStatus.error) {
      SndToast.dismiss();
    }
  }, [props.changingRequestStatus]);

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
        isExpand: true,
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
              setImageViewingVisible({visible: true, PTType: 1, index: index});
            }
          },
          {
            isRequire: false,
            canEdit: false,
            title: 'PT2照片',
            type: BottleItemType.picture,
            pictures: [],
            onPressPicture: (index: number) => {
              setImageViewingVisible({visible: true, PTType: 2, index: index});
            }
          },
          {
            isRequire: false,
            canEdit: false,
            title: '更换开始',
            subTitle: '',
          },
          {
            isRequire: true,
            canEdit: true,
            title: '物料号',
            subTitle: '',
            placeholder: '请手动输入或扫描钢瓶物料号',
            type: BottleItemType.scan,
            textChangeCallBack: (text: string) => {
              // @ts-ignore
              setMaterial(text);
            },
            onPressScan: () => {
              onPressScan(5)
            }
          },
          {
            isRequire: true,
            canEdit: true,
            title: '钢瓶号',
            subTitle: '',
            placeholder: '请手动输入或扫描钢瓶编号',
            type: BottleItemType.scan,
            textChangeCallBack: (text: string) => {
              // @ts-ignore
              setCylinderNo(text);
            },
            onPressScan: () => {
              onPressScan(6)
            }
          },
          {
            isRequire: true,
            canEdit: true,
            title: '有限日期',
            subTitle: '',
            placeholder: '请手动输入或扫描钢瓶有限日期',
            type: BottleItemType.scan,
            textChangeCallBack: (text: string) => {
              // @ts-ignore
              setValidTime(text);
            },
            onPressScan: () => {
              onPressScan(7)
            }
          },
          {
            isRequire: false,
            canEdit: true,
            title: '垫片使用数量',
            subTitle: '',
            maxLength: 3,
            placeholder: '请输入',
            type: BottleItemType.input,
            textChangeCallBack: (text: string) => {
              setShimActUsageQuantity(Number(text))
            },
          },
          {
            isRequire: true,
            canEdit: true,
            title: '备注',
            subTitle: '',
            placeholder: '请输入',
            type: BottleItemType.tip,
            textChangeCallBack: (text: string) => {
              // @ts-ignore
              setRemark(text);
            }
          },
        ]
      },
    ]
  };

  const [detailDataSource, setDetailDataSource] = React.useState(configInitialData());

  const isCurrentUser = () => {
    const detail = props.detail;
    const userId = props.currentUser?.Id;
    return (detail.changeOperatorId == userId || detail.changeConfirmId == userId);
  }
  /**
   * 根据detail 设置详情数据
   */
  React.useEffect(() => {
    const detail = props.detail;
    ///照片数组
    let changePT1 = [], changePT2 = [];
    if (detail.fileList && detail.fileList.length > 0) {
      for (const file of detail.fileList) {
        if (file.fieldCode.indexOf('CHANGE_PT1') !== -1) {
          changePT1.push({uri: handleImageUrl(file.fileKey), needUpload: false});
        } else if (file.fieldCode.indexOf('CHANGE_PT2') !== -1) {
          changePT2.push({uri: handleImageUrl(file.fileKey), needUpload: false});
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
        ///是当前操作人 只能查看
        let isCurrent = isCurrentUser();

        element.dataObj[5].subTitle = detail.material;
        element.dataObj[6].subTitle = detail.cylinderNo;
        if (!isEmptyString(detail.validTime)) {
          let validTime = moment(detail.validTime).format(TimeFormatYMD);
          if (validTime == 'Invalid date' || validTime == 'invalid date') {
            element.dataObj[7].subTitle = '-';
          } else {
            element.dataObj[7].subTitle = validTime;
          }
        } else {
          element.dataObj[7].subTitle = '';
        }

        element.dataObj[8].subTitle = String(detail.shimActUsageQuantity);
        element.dataObj[9].subTitle = detail.changeRemark;

        element.dataObj[5].isRequire = isCurrent;
        element.dataObj[5].canEdit = isCurrent;
        element.dataObj[6].isRequire = isCurrent;
        element.dataObj[6].canEdit = isCurrent;
        element.dataObj[7].isRequire = isCurrent;
        element.dataObj[7].canEdit = isCurrent;
        element.dataObj[8].isRequire = isCurrent;
        element.dataObj[8].canEdit = isCurrent;
        element.dataObj[9].isRequire = isCurrent;
        element.dataObj[9].canEdit = isCurrent;
      }
    }

    setDetailDataSource([...detailDataSource]);

    ///如果有值 需要赋值,
    if (detail.changeStartTime) {
      input.changeStartTime = detail.changeStartTime;
    }
    if (detail.material) {
      input.material = detail.material;
    }
    if (detail.cylinderNo) {
      input.cylinderNo = detail.cylinderNo;
    }
    if (detail.validTime) {
      input.validTime = detail.validTime;
    }
    if (Number(detail.shimActUsageQuantity) > 0) {
      input.shimActUsageQuantity = detail.shimActUsageQuantity;
    }
    if (detail.changeRemark) {
      input.changeRemark = detail.changeRemark;
    }

    setInput({...input});

  }, [props.detail]);


  const onPressScan = (index: number) => {
    props.navigator.push({
      id: 'scan_from_bottle_list',
      component: Scan,
      passProps: {
        scanText: '',
        scanResult: (result: string) => {
          ///1.更新展示
          for (let element of detailDataSource) {
            if (element.sectionType == BottleSectionType.exchange) {
              element.dataObj[index].subTitle = result;
            }
          }
          setDetailDataSource([...detailDataSource]);
          ///2.更新入参
          if (index == 5) {
            // @ts-ignore
            setMaterial(result);
          } else if (index == 6) {
            // @ts-ignore
            setCylinderNo(result);
          } else if (index == 7) {
            // @ts-ignore
            setValidTime(result);
          }
        }
      }
    });
  }

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
    if (!input.material || input.material.length == 0) {
      SndToast.showTip('请输入钢瓶物料号');
      return;
    }
    if (!input.cylinderNo || input.cylinderNo.length == 0) {
      SndToast.showTip('请输入钢瓶编号');
      return;
    }
    if (!input.validTime || input.validTime.length == 0) {
      SndToast.showTip('请输入钢瓶有限日期');
      return;
    }

    let validTime = moment(input.validTime).format(TimeFormatYMD);
    if (validTime == 'Invalid date') {
      SndToast.showTip('请输入正确的有限日期');
      return;
    }
    input.validTime = validTime;
    if (input.shimActUsageQuantity == null || input.shimActUsageQuantity == 0) {
      SndToast.showTip('请输入垫片使用数量');
      return;
    }
    if (input.shimActUsageQuantity > 100) {
      SndToast.showTip('垫片使用数量最大为100,请重新输入');
      return;
    }
    input.flow = flow;
    input.changeEndTime = flow ? moment().format(TimeFormatYMDHMS) : '';
    input.timeDate = moment().format(TimeFormatYMDHMS);
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
          title: '完成更换',
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

  /**
   * 图片浏览器 大图浏览
   */
  const renderImageViewing = () => {
    let images1 = [], images2 = [];
    let detail = props.detail;
    if (detail.fileList && detail.fileList.length > 0) {
      for (const file of detail.fileList) {
        if (file.fieldCode.indexOf('CHANGE_PT1') !== -1) {
          images1.push({uri: handleImageUrl(file.fileKey)});
        } else if (file.fieldCode.indexOf('CHANGE_PT2') !== -1) {
          images2.push({uri: handleImageUrl(file.fileKey)});
        }
      }
    }

    return (
      <ImageView
        images={imageViewingVisible.PTType == 1 ? images1 : images2}
        keyExtractor={(imageSrc, index) => imageSrc + String(index)}
        imageIndex={imageViewingVisible.index}
        visible={imageViewingVisible.visible}
        onRequestClose={() => setImageViewingVisible({visible: false, PTType: 1, index: 0})}
      />
    )
  }

  return (
    <View style={{flex: 1}}>
      <Toolbar title={'气瓶更换任务详情'} navIcon="back" onIconClicked={onPop}/>
      <View style={{flex: 1, backgroundColor: Colors.background.primary}}>
        <FlatList data={detailDataSource} renderItem={(item) => BottleDetailItem(item.item)}
                  keyExtractor={(item, index) => item.title}/>
        {configBottomAction()}
        {renderImageViewing()}
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
    changingRequestStatus: bottleDetail.changingRequestStatus,
  }
}

export default connect(mapStateToProps, {
  loadAirBottleDetail,
  redactChanging,
  cleaAirBottleDetail,
  airBottleDetailLoadingStatus
})(AirBottleReplacingDetail);
