import React from "react";
import {FlatList, InteractionManager, View} from 'react-native';
import {connect} from "react-redux";
// @ts-ignore
import Toolbar from "../../../../../components/Toolbar";
import Colors from "../../../../../utils/const/Colors";
import {
    BottleDetailItem,
    BottleItemType,
    BottlePictureProps,
    BottleSectionType
} from "../../../../../components/fmcs/gasClass/airBottle/detail/BottleDetaiItem";
import BottleDetailActionView from "../../../../../components/fmcs/gasClass/airBottle/detail/BottleDetailActionView";
import SndToast from "../../../../../utils/components/SndToast";
import {
    airBottleDetailLoadingStatus,
    cleaAirBottleDetail,
    loadAirBottleDetail,
    loadUsers,
    redactWaitStandby,
} from "../../../../../actions/airBottle/airBottleAction";
import {RequestStatus} from "../../../../../middleware/api";
import moment from "moment";
import SchActionSheet from "../../../../../components/actionsheet/SchActionSheet";
import ImagePicker from "../../../../ImagePicker";
import ImageView from "react-native-image-viewing";
import AirBottleStandbyingDetail from "./AirBottleStandbyingDetail";
import {
    getImageUrl,
    handleImageUrl,
    isEmptyString,
    TimeFormatYMD,
    TimeFormatYMDHM, TimeFormatYMDHMS
} from "../../../../../utils/const/Consts";
import {removeDuplicate} from "../../../../../utils";

interface RequestInputProps {
    id: number,
    waitOperatorId?: number,
    waitOperator?: string,
    waitConfirmId?: number,
    waitConfirm?: string
    fileList?: FileObjProps[],
    flow?: boolean,
    timeDate?: string,
}

interface FileObjProps {
    fieldCode?: string,
    fileKey?: string,
    fileName?: string,
    fileSize?: string,
    uploadTime?: string,
    uploadBy?: string,
    uploadById?: number,
}

///待更换 详情
function AirBottleWaitStandbyDetail(props: any) {

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
     * 底部选择操作人/确认人 可见/不可见
     */
    const [visible, setVisible] = React.useState({visible: false, userType: 0});

    /**
     * 请求入参
     */
    const [input, setInput] = React.useState<RequestInputProps>({
        id: props.airBottle.id,
        waitOperatorId: -1,
        waitConfirmId: -1,
    });

    /**
     * 图片集合
     */
    const [PT1FileList, setPT1FileList] = React.useState<FileObjProps[]>([]);
    const [PT2FileList, setPT2FileList] = React.useState<FileObjProps[]>([]);
    /**
     * 记录图片删除 信息
     */
    const [removeFileInfo, setRemoveFileInfo] = React.useState({FTType: 0, picture: ''});

    /**
     * 处理 图片上传之后删除动作 及时更新图片数组
     */
    React.useEffect(() => {
        if (removeFileInfo.FTType > 0 && removeFileInfo.picture.length > 0) {
            if (removeFileInfo.FTType == 1) {
                PT1FileList.forEach((item, index, array) => {
                    if (item.fileName == removeFileInfo.picture) {
                        array.splice(index, 1);
                    }
                })
                setPT1FileList([...PT1FileList]);
            } else if (removeFileInfo.FTType == 2) {
                PT2FileList.forEach((item, index, array) => {
                    if (item.fileName == removeFileInfo.picture) {
                        array.splice(index, 1);
                    }
                })
                setPT2FileList([...PT2FileList]);
            }
        }
    }, [removeFileInfo]);

    /**
     * 记录上传成功之后的图片信息
     */
    const [uploadFileInfo, setUploadFileInfo] = React.useState({PTType: 0, pictures: []});

    /**
     * 图片上传成功之后 更新请求入参
     */
    React.useEffect(() => {
        if (uploadFileInfo.PTType > 0 && uploadFileInfo.pictures.length > 0) {
            if (uploadFileInfo.PTType == 1) {
                setPT1FileList([...PT1FileList, ...uploadFileInfo.pictures]);
            } else if (uploadFileInfo.PTType == 2) {
                setPT2FileList([...PT2FileList, ...uploadFileInfo.pictures]);
            }
        }
    }, [uploadFileInfo]);

    /**
     * 获取详情 componentDidLoad
     */
    React.useEffect(() => {
        props.loadAirBottleDetail(props.airBottle.id);
        props.loadUsers()
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
        ///待更换编辑
        if ((input.timeDate != undefined) && input.waitOperatorId && input.waitConfirmId) {
            props.redactWaitStandby(input)
        }
    }, [input.timeDate, input.fileList]);

    /**
     * 监听待前吹详情请求
     */
    React.useEffect(() => {
        if (props.waitStandbyRequestStatus == RequestStatus.loading) {
            SndToast.showLoading();
        } else if (props.waitStandbyRequestStatus == RequestStatus.success) {
            SndToast.dismiss();
            ///成功
            if (input.flow) {
                ///状态改变
                props.navigator.replace({
                    id: 'air_bottle_in_standby',
                    component: AirBottleStandbyingDetail,
                    navigator: props.navigator,
                    passProps: {airBottle: props.airBottle, refreshCallBack: props.refreshCallBack}
                });
            } else {
                ///返回到上一页
                props.loadAirBottleDetail(props.airBottle.id);
            }
        } else if (props.waitStandbyRequestStatus == RequestStatus.error) {
            SndToast.dismiss();
        }
    }, [props.waitStandbyRequestStatus]);

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
                        title: '气柜名称',
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
                        subTitle: ''
                    },
                    {
                        isRequire: false,
                        canEdit: false,
                        title: '换瓶确认人',
                        subTitle: '',
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
                        subTitle: ''
                    },
                    {
                        isRequire: false,
                        canEdit: false,
                        title: '更换结束',
                        subTitle: ''
                    },
                    {
                        isRequire: false,
                        canEdit: false,
                        title: '物料号',
                        subTitle: '',
                    },
                    {
                        isRequire: false,
                        canEdit: false,
                        title: '钢瓶号',
                        subTitle: ''
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
                sectionType: BottleSectionType.standby,
                isExpand: true,
                expandCallBack: (sectionType: BottleSectionType) => {
                    onPressExpend(sectionType);
                },
                dataObj: [
                    {
                        isRequire: true,
                        canEdit: true,
                        title: '待机操作人',
                        subTitle: '请选择',
                        actionCallBack: () => {
                            setVisible({visible: true, userType: 0});
                        }
                    },
                    {
                        isRequire: true,
                        canEdit: true,
                        title: '待机确认人',
                        subTitle: '请选择',
                        actionCallBack: () => {
                            setVisible({visible: true, userType: 1});
                        }
                    },
                    {
                        isRequire: true,
                        canEdit: true,
                        title: 'PT1照片',
                        type: BottleItemType.picture,
                        pictures: [],
                        addPictureCallBack: () => {
                            onShowImagePicker(1)
                        },
                        removePictureCallBack: (picture: BottlePictureProps) => {
                            onRemovePicture(1, picture);
                        },
                        onPressPicture: (index: number) => {
                            setImageViewingVisible({visible: true, sectionType: BottleSectionType.standby, PTType: 1, index: index});
                        }
                    },
                    {
                        isRequire: true,
                        canEdit: true,
                        title: 'PT2照片',
                        type: BottleItemType.picture,
                        pictures: [],
                        addPictureCallBack: () => {
                            onShowImagePicker(2)
                        },
                        removePictureCallBack: (picture: BottlePictureProps) => {
                            onRemovePicture(2, picture);
                        },
                        onPressPicture: (index: number) => {
                            setImageViewingVisible({visible: true, sectionType: BottleSectionType.standby, PTType: 2, index: index});
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
        return (detail.waitOperatorId == userId || detail.waitConfirmId == userId);
    }

    const isAllocUser = () => {
        const detail = props.detail;
        return (detail.waitOperatorId != undefined && detail.waitOperator != undefined) || (detail.waitConfirmId != undefined && detail.waitConfirm != undefined);
    }
    /**
     * 根据detail 设置详情数据
     */
    React.useEffect(() => {
        const detail = props.detail;
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
                element.dataObj[9].subTitle = detail.shimActUsageQuantity;
                element.dataObj[10].subTitle = detail.changeRemark;
            } else if (element.sectionType == BottleSectionType.standby) {
                ///是否分配/ 待机操作人/确认人
                let isAlloc = isAllocUser();
                let isCurrent = isCurrentUser();
                if (isAlloc) {
                    element.dataObj[0].isRequire = false;
                    element.dataObj[0].canEdit = false;
                    element.dataObj[0].subTitle = detail.waitOperator;
                    element.dataObj[1].isRequire = false;
                    element.dataObj[1].canEdit = false;
                    element.dataObj[1].subTitle = detail.waitConfirm;
                    // @ts-ignore
                    element.dataObj[2].pictures = waitPT1;
                    element.dataObj[2].isRequire = isCurrent && (waitPT1.length != 2);
                    element.dataObj[2].canEdit = isCurrent && (waitPT1.length != 2);
                    // @ts-ignore
                    element.dataObj[3].pictures = waitPT2;
                    element.dataObj[3].isRequire = isCurrent && (waitPT2.length != 2);
                    element.dataObj[3].canEdit = isCurrent && (waitPT2.length != 2);
                }else {
                    if (founded) {
                        element.dataObj[0].subTitle = user.RealName;
                        element.dataObj[1].subTitle = user.RealName;
                    }
                }
            }
        }

        setDetailDataSource([...detailDataSource]);

        ///如果有值 需要赋值, 开始更换操作
        if (isAllocUser()) {
            input.waitOperator = detail.waitOperator;
            input.waitOperatorId = detail.waitOperatorId;
            input.waitConfirm = detail.waitConfirm;
            input.waitConfirmId = detail.waitConfirmId;
            let fileList1 = [], fileList2 = [];
            for (const file of detail.fileList) {
                if (file.fieldCode == 'WAIT_PT1_IMAGE') {
                    fileList1.push(file);
                } else if (file.fieldCode == 'WAIT_PT2_IMAGE') {
                    fileList2.push(file);
                }
            }
            ///给图片数组赋值
            setPT1FileList(fileList1);
            setPT2FileList(fileList2);
            ///给请求入参赋值
            setInput({...input});
        }else {
            if (founded){
                input.waitOperator = user.RealName;
                input.waitOperatorId = user.Id;
                input.waitConfirm = user.RealName;
                input.waitConfirmId = user.Id;
                setInput({...input});
            }
        }

    }, [props.detail]);

    /**
     * 选择照片
     * @param PTType
     */
    const onShowImagePicker = (PTType: number) => {
        ///判断图片是否达到上传上限
        let PT1Pictures = [], PT2Pictures = [];
        for (let element of detailDataSource) {
            if (element.sectionType == BottleSectionType.standby) {
                if (PTType == 1) {
                    // @ts-ignore
                    PT1Pictures = element.dataObj[2].pictures;
                    break;
                } else if (PTType == 2) {
                    // @ts-ignore
                    PT2Pictures = element.dataObj[3].pictures;
                    break;
                }
            }
        }
        if (PTType == 1) {
            if (PT1Pictures.length == 2) {
                SndToast.showTip('已达到上传图片上限');
                return;
            }
        } else {
            if (PT2Pictures.length == 2) {
                SndToast.showTip('已达到上传图片上限');
                return;
            }
        }
        props.navigator.push({
            id: 'imagePicker',
            component: ImagePicker,
            passProps: {
                max: 2 - (PTType == 1 ? PT1Pictures.length : PT2Pictures.length),
                dataChanged: (chosenImages: any[]) => {
                    didPickerImage(chosenImages, PTType);
                }
            }
        });
    }

    /**
     * 选择完照片
     * @param images
     * @param PTType
     */
    const didPickerImage = (images: any[], PTType: number) => {
        let uris = [];
        let fileList: any[] = [];

        for (let image of images) {
            fileList.push({
                fieldCode: `WAIT_PT${PTType}_IMAGE`,
                fileName: image.filename,
                fileSize: image.filesize,
                uploadTime: moment().format('YYYY-MM-DD HH:mm:ss'),
                uploadBy: props.currentUser.Name,
                uploadById: props.currentUser.Id,
            })
        }
        for (let image of images) {
            uris.push({
                uri: image.uri,
                name: image.filename,
                canRemove: false,
                needUpload: true,
                uploadComplete: (success: boolean, name: string) => {
                    updateFileList(success, name, PTType, fileList);
                }
            });
        }
        /**
         * 修改列表展示
         */
        for (let element of detailDataSource) {
            if (element.sectionType == BottleSectionType.standby) {
                if (PTType == 1) {
                    // @ts-ignore
                    let PT1Pictures = element.dataObj[2].pictures;
                    // @ts-ignore
                    element.dataObj[2].pictures = [...PT1Pictures, ...uris];
                } else if (PTType == 2) {
                    // @ts-ignore
                    let PT2Pictures = element.dataObj[3].pictures;
                    // @ts-ignore
                    element.dataObj[3].pictures = [...PT2Pictures, ...uris];
                }
            }
        }
        setDetailDataSource([...detailDataSource]);
    }

    /**
     * 图片上传成功之后 更新入参图片  key
     * @param success 是否上传成功
     * @param name 上传成功的图片名称
     * @param PTType
     * @param fileList
     */
    const updateFileList = (success: boolean, name: string, PTType: number, fileList: any[]) => {
        if (success) {
            if (PTType == 1) {
                for (let fileObjProp of fileList) {
                    if (fileObjProp.fileName == name) {
                        fileObjProp.fileKey = name;
                        break;
                    }
                }

            } else if (PTType == 2) {
                for (let fileObjProp of fileList) {
                    if (fileObjProp.fileName == name) {
                        fileObjProp.fileKey = name;
                        break;
                    }
                }
            }
            ///这里在回调里面 获取不到 PT1FileList的值 只能通过hook函数更新
            // @ts-ignore
            setUploadFileInfo({PTType: PTType, pictures: fileList});
          ///修改图片 是否可删除状态
          changeImageRemoveStatus(PTType, fileList);
        }else {
          ///上传失败
          changeImageRemoveStatus(PTType, fileList);
        }
    }

  /**
   * 更改图片删除状态
   * @param PTType
   * @param fileList
   */
    const changeImageRemoveStatus = (PTType: number, fileList: any[])=>{
      for (let element of detailDataSource) {
        if (element.sectionType == BottleSectionType.standby) {
          if (PTType == 1) {
            // @ts-ignore
            let PT1Pictures = element.dataObj[2].pictures;
            if (PT1Pictures && PT1Pictures.length > 0) {
              for (let pt1Picture of PT1Pictures) {
                for (let fileListElement of fileList) {
                  // @ts-ignore
                  if (fileListElement.fileName == pt1Picture.name) {
                    // @ts-ignore
                    pt1Picture.canRemove = true;
                  }
                }
              }
            }
          } else if (PTType == 2) {
            // @ts-ignore
            let PT2Pictures = element.dataObj[3].pictures;
            if (PT2Pictures && PT2Pictures.length > 0) {
              for (let pt2Picture of PT2Pictures) {
                for (let fileListElement of fileList) {
                  // @ts-ignore
                  if (fileListElement.fileName == pt2Picture.name) {
                    // @ts-ignore
                    pt2Picture.canRemove = true;
                  }
                }
              }
            }
          }
        }
      }
      setTimeout(() => {
        setDetailDataSource([...detailDataSource]);
      }, 1000);
    }

    /**
     * 图片删除点击
     * @param PTType PT1 / PT2
     * @param picture 删除照片的index
     */
    const onRemovePicture = (PTType: number, picture: BottlePictureProps) => {
        for (let element of detailDataSource) {
            if (element.sectionType == BottleSectionType.standby) {
                let pictures = [];
                if (PTType == 1) {
                    // @ts-ignore
                    pictures = element.dataObj[2].pictures
                } else if (PTType == 2) {
                    // @ts-ignore
                    pictures = element.dataObj[3].pictures
                }
                pictures.forEach((item, index, array) => {
                    if (item.name == picture.name) {
                        array.splice(index, 1);
                    }
                })
            }
        }
        setDetailDataSource([...detailDataSource]);

        ///TODO: 这里刷新有问题 获取不到fileList的值  或许可以通过hook函数刷新fileList的值
        setRemoveFileInfo({FTType: PTType, picture: picture.name!});
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
        if (!input.waitOperator || input.waitOperatorId == -1) {
            SndToast.showTip('请选择待机操作人');
            return;
        }
        if (!input.waitConfirm || input.waitConfirmId == -1) {
            SndToast.showTip('请选择待机确认人');
            return;
        }
        if (input.waitConfirmId != props.currentUser.Id && input.waitOperatorId != props.currentUser.Id) {
            SndToast.showTip('确认人或操作人必须有一个当前操作人');
            return;
        }
        if (flow) {
            if (PT1FileList.length == 0) {
                SndToast.showTip('请上传Standby操作PT1照片');
                return;
            }
            if (PT2FileList.length == 0) {
                SndToast.showTip('请上Standby操作PT2照片');
                return;
            }
        }
        input.fileList = removeDuplicate([...PT1FileList, ...PT2FileList]);
        input.flow = flow;
        input.timeDate = moment().format(TimeFormatYMDHMS);
        setInput({...input});
    }

    /**
     * 底部按钮更具状态
     */
    const configBottomAction = () => {
        let isAlloc = isAllocUser();
        let isCurrent = isCurrentUser();
        let actions: any[] = [];
        if (isAlloc) {
            ///已分配
            if (isCurrent) {
                actions = [{
                    title: '开始待机',
                    textColor: Colors.white,
                    onPressCallBack: () => {
                        editBottleRequest(true);
                    },
                    btnStyle: {marginLeft: 30, marginRight: 30, flex: 1, backgroundColor: Colors.theme}
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
                    btnStyle: {marginLeft: 30, marginRight: 12, flex: 1},
                    onPressCallBack: () => {
                        editBottleRequest(false);
                    },
                },
                {
                    title: '开始待机',
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
     * actionSheet 用户信息数组
     */
    const configSheetUsers = () => {
        const users = props.users;
        let tempArray = [];
        let userId = visible.userType == 0 ? input.waitOperatorId : input.waitConfirmId;
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
     * action sheet 弹出选择框选择 操作人/确认人
     */
    const renderActionSheet = () => {
        return (
            visible.visible && <SchActionSheet title={visible.userType == 0 ? '选择待机操作人' : '选择待机确认人'}
                                               arrActions={configSheetUsers()} modalVisible={visible.visible}
                                               onCancel={() => {
                                                   setVisible({visible: false, userType: visible.userType});
                                               }}
                                               onSelect={(item: { title: string, type: number }) => {
                                                   setVisible({visible: false, userType: visible.userType});
                                                   let tempInput = input;
                                                   if (visible.userType == 0) {
                                                       ///操作人
                                                       tempInput.waitOperator = item.title;
                                                       tempInput.waitOperatorId = item.type;
                                                   } else {
                                                       ///确认人
                                                       tempInput.waitConfirm = item.title;
                                                       tempInput.waitConfirmId = item.type;
                                                   }
                                                   setInput({...tempInput});

                                                   for (let data of detailDataSource) {
                                                       if (data.sectionType == BottleSectionType.standby) {
                                                           data.dataObj[visible.userType].subTitle = item.title;
                                                       }
                                                   }
                                                   setDetailDataSource([...detailDataSource]);
                                               }}
            />
        )
    }

    /**
     * 图片浏览器 大图浏览
     */
    const renderImageViewing = () => {
        let images1 = [], images2 = [];
        if (imageViewingVisible.sectionType == BottleSectionType.exchange){
            ///更换图片预览
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
        }else if(imageViewingVisible.sectionType == BottleSectionType.standby){
            ///standby图片预览
            for (const fileObjProp of PT1FileList) {
                images1.push({
                    uri: getImageUrl(fileObjProp.fileKey),
                });
            }

            for (const fileObjProp of PT2FileList) {
                images2.push({
                    uri: getImageUrl(fileObjProp.fileKey),
                })
            }
        }


        return (
            <ImageView
                images={imageViewingVisible.PTType == 1 ? images1 : images2}
                keyExtractor={(imageSrc, index) => imageSrc + String(index)}
                imageIndex={imageViewingVisible.index}
                visible={imageViewingVisible.visible}
                onRequestClose={() => setImageViewingVisible({visible: false, sectionType: BottleSectionType.basicMsg, PTType: 1, index: 0})}
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
                {renderActionSheet()}
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
        users: bottleDetail.users,
        loadingStatus: bottleDetail.loadingStatus,
        waitStandbyRequestStatus: bottleDetail.waitStandbyRequestStatus,
    }
}

export default connect(mapStateToProps, {
    loadAirBottleDetail,
    redactWaitStandby,
    cleaAirBottleDetail,
    loadUsers,
    airBottleDetailLoadingStatus,
})(AirBottleWaitStandbyDetail);
