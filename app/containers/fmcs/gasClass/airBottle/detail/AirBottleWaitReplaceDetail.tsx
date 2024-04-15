import React from "react";
import {
    Alert,
    Animated,
    FlatList,
    Image,
    InteractionManager,
    View
} from 'react-native';
import {connect} from "react-redux";
// @ts-ignore
import Toolbar from "../../../../../components/Toolbar";
import Colors from "../../../../../utils/const/Colors";
import {
    BottleDetailItem,
    BottleItemType, BottlePictureProps,
    BottleSectionType
} from "../../../../../components/fmcs/gasClass/airBottle/detail/BottleDetaiItem";
import BottleDetailActionView from "../../../../../components/fmcs/gasClass/airBottle/detail/BottleDetailActionView";
import SndToast from "../../../../../utils/components/SndToast";
import {
    airBottleDetailLoadingStatus,
    cleaAirBottleDetail,
    loadAirBottleDetail,
    loadUsers,
    redactWaitChange,
} from "../../../../../actions/airBottle/airBottleAction";
import {RequestStatus} from "../../../../../middleware/api";
import moment from "moment";
import SchActionSheet from "../../../../../components/actionsheet/SchActionSheet";
import ImagePicker from "../../../../ImagePicker";
import ImageView from "react-native-image-viewing";
import AirBottleReplacingDetail from "./AirBottleReplacingDetail";
import {getImageUrl, handleImageUrl, TimeFormatYMDHM, TimeFormatYMDHMS} from "../../../../../utils/const/Consts";
import {removeDuplicate} from "../../../../../utils";

interface RequestInputProps {
    id: number,
    changeOperatorId?: number,
    changeOperator?: string,
    changeConfirmId?: number,
    changeConfirm?: string
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

/**
 * 气瓶待更换 详情
 * @param props
 * @constructor
 */
function AirBottleWaitReplaceDetail(props: any) {

    /**
     * 图片浏览 是否可见
     */
    const [imageViewingVisible, setImageViewingVisible] = React.useState({visible: false, PTType: 1, index: 0});

    /**
     * 底部选择操作人/确认人 可见/不可见
     */
    const [visible, setVisible] = React.useState({visible: false, userType: 0});

    /**
     * 请求入参
     */
    const [input, setInput] = React.useState<RequestInputProps>({
        id: props.airBottle.id,
        changeOperatorId: -1,
        changeConfirmId: -1,
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
        if (input.timeDate != undefined && input.changeOperatorId && input.changeConfirmId) {
            props.redactWaitChange(input)
        }
    }, [input.timeDate]);

    /**
     * 监听待前吹详情请求
     */
    React.useEffect(() => {
        if (props.waitChangeRequestStatus == RequestStatus.loading) {
            SndToast.showLoading();
        } else if (props.waitChangeRequestStatus == RequestStatus.success) {
            SndToast.dismiss();
            ///成功
            if (input.flow) {
                ///状态改变
                if (checkBlowTimeIsOut()){
                    onPop();
                    props.refreshCallBack && props.refreshCallBack();
                }else {
                    props.navigator.replace({
                        id: 'air_bottle_replacing',
                        component: AirBottleReplacingDetail,
                        navigator: props.navigator,
                        passProps: {airBottle: props.airBottle, refreshCallBack: props.refreshCallBack}
                    });
                }
            } else {
                ///返回到上一页
                props.loadAirBottleDetail(props.airBottle.id);
            }
        } else if (props.waitChangeRequestStatus == RequestStatus.error) {
            SndToast.dismiss();
        }
    }, [props.waitChangeRequestStatus]);

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
                isExpand: true,
                expandCallBack: (sectionType: BottleSectionType) => {
                    onPressExpend(sectionType);
                },
                dataObj: [
                    {
                        isRequire: true,
                        canEdit: true,
                        title: '换瓶操作人',
                        subTitle: '请选择',
                        actionCallBack: () => {
                            setVisible({visible: true, userType: 0});
                        }
                    },
                    {
                        isRequire: true,
                        canEdit: true,
                        title: '换瓶确认人',
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
                            setImageViewingVisible({visible: true, PTType: 1, index: index});
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
                            setImageViewingVisible({visible: true, PTType: 2, index: index});
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

    const isAllocUser = () => {
        const detail = props.detail;
        return (detail.changeOperatorId != undefined) || (detail.changeConfirmId != undefined);
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
                ///是否分配/ 换瓶操作人/确认人
                let isAlloc = isAllocUser();
                let isCurrent = isCurrentUser();
                if (isAlloc) {
                    element.dataObj[0].isRequire = false;
                    element.dataObj[0].canEdit = false;
                    element.dataObj[0].subTitle = detail.changeOperator;
                    element.dataObj[1].isRequire = false;
                    element.dataObj[1].canEdit = false;
                    element.dataObj[1].subTitle = detail.changeConfirm;
                    // @ts-ignore
                    element.dataObj[2].pictures = changePT1;
                    element.dataObj[2].isRequire = isCurrent && (changePT1.length != 2);
                    element.dataObj[2].canEdit = isCurrent && (changePT1.length != 2);
                    // @ts-ignore
                    element.dataObj[3].pictures = changePT2;
                    element.dataObj[3].isRequire = isCurrent && (changePT2.length != 2);
                    element.dataObj[3].canEdit = isCurrent && (changePT2.length != 2);
                } else {
                    if (founded) {
                        element.dataObj[0].subTitle = user.RealName;
                        element.dataObj[1].subTitle = user.RealName;
                    }
                }
            }
        }

        setDetailDataSource([...detailDataSource]);

        ///如果有值 需要赋值, 开始更换操作
        if (detail.changeOperatorId && detail.changeOperatorId > 0 && detail.changeConfirmId && detail.changeConfirmId > 0) {
            input.changeOperator = detail.changeOperator;
            input.changeOperatorId = detail.changeOperatorId;
            input.changeConfirm = detail.changeConfirm;
            input.changeConfirmId = detail.changeConfirmId;
            let fileList1 = [], fileList2 = [];
            for (const file of detail.fileList) {
                if (file.fieldCode == 'CHANGE_PT1_IMAGE') {
                    fileList1.push(file);
                } else if (file.fieldCode == 'CHANGE_PT2_IMAGE') {
                    fileList2.push(file);
                }
            }
            ///给图片数组赋值
            setPT1FileList(fileList1);
            setPT2FileList(fileList2);
            setInput({...input});
        } else {
            if (founded) {
                input.changeOperator = user.RealName;
                input.changeOperatorId = user.Id;
                input.changeConfirm = user.RealName;
                input.changeConfirmId = user.Id;
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
            if (element.sectionType == BottleSectionType.exchange) {
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
                fieldCode: `CHANGE_PT${PTType}_IMAGE`,
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
                needUpload: true,
                canRemove: false,
                uploadComplete: (success: boolean, name: string) => {
                    updateFileList(success, name, PTType, fileList);
                }
            });
        }
        for (let element of detailDataSource) {
            if (element.sectionType == BottleSectionType.exchange) {
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
            // @ts-ignore
          setUploadFileInfo({PTType: PTType, pictures: fileList});
          changeImageRemoveStatus(PTType, fileList);
        }else {
          changeImageRemoveStatus(PTType, fileList);
        }
    }

  /**
   * 修改图片删除状态
   * @param PTType
   * @param fileList
   */
    const changeImageRemoveStatus = (PTType: number, fileList: any[])=>{
      for (let element of detailDataSource) {
        if (element.sectionType == BottleSectionType.exchange) {
          if (PTType == 1) {
            // @ts-ignore
            let PT1Pictures = element.dataObj[2].pictures;
            for (let pt1Picture of PT1Pictures) {
              for (let fileListElement of fileList) {
                if (fileListElement.fileName == pt1Picture.name) {
                  pt1Picture.canRemove = true;
                }
              }
            }
          } else if (PTType == 2) {
            // @ts-ignore
            let PT2Pictures = element.dataObj[3].pictures;
            for (let pt2Picture of PT2Pictures) {
              for (let fileListElement of fileList) {
                if (fileListElement.fileName == pt2Picture.name) {
                  pt2Picture.canRemove = true;
                }
              }
            }
          }
        }
      }
      setTimeout(() => {
        setDetailDataSource([...detailDataSource]);
      }, 1000)
    }

    /**
     * 图片删除点击
     * @param PTType PT1 / PT2
     * @param picture 删除照片的index
     */
    const onRemovePicture = (PTType: number, picture: BottlePictureProps) => {
        for (let element of detailDataSource) {
            if (element.sectionType == BottleSectionType.exchange) {
                let pictures = [];
                if (PTType == 1) {
                    // @ts-ignore
                    pictures = element.dataObj[2].pictures
                } else if (PTType == 2) {
                    // @ts-ignore
                    pictures = element.dataObj[3].pictures
                }
                pictures.forEach((item: any, index: number, array: any[]) => {
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
     * 弹出提示
     * @param time
     * @param callBack
     */
    const beforeSubmitAlert = (time: string, callBack: () => void) => {
        Alert.alert('', `距离前吹结束已超过${time}分钟, 请重新前吹后再更换气瓶`, [
            {
                text: '取消',
            },
            {
                text: '确定',
                onPress: callBack,
            }
        ])
    }

    /**
     * 编辑气瓶详情 待执行
     * @param flow
     * 判断按钮（判断编辑页面是触发保存按钮还是完成任务按钮）
     * ture -- 保存
     * false -- 完成任务
     */
    const editBottleRequest = (flow: boolean) => {
        if (!input.changeOperator || input.changeOperatorId == -1) {
            SndToast.showTip('请选择换瓶操作人');
            return;
        }
        if (!input.changeConfirm || input.changeConfirmId == -1) {
            SndToast.showTip('请选择换瓶确认人');
            return;
        }

        if (input.changeOperatorId != props.currentUser.Id && input.changeConfirmId != props.currentUser.Id) {
            SndToast.showTip('确认人或操作人必须有一个是当前操作人');
            return;
        }

        if (flow) {
            if (PT1FileList.length == 0) {
                SndToast.showTip('请上传换瓶操作PT1照片');
                return;
            }
            if (PT2FileList.length == 0) {
                SndToast.showTip('请上传换瓶操作PT2照片');
                return;
            }
        }

        if (checkBlowTimeIsOut() && flow) {
            beforeSubmitAlert(props.detail.frontBlowAfterFreeTime, () => {
                updateInput(flow);
            });
            return;
        }
        updateInput(flow);
    }

    /**
     * 判断是否超时
     */
    const checkBlowTimeIsOut = ()=>{
        let blowEndTime = moment(props.detail.blowEndTime).toDate().getTime() * 0.001;
        let freeTime = props.detail.frontBlowAfterFreeTime * 60;
        let nowDateTime = new Date().getTime() * 0.001;
        return (blowEndTime + freeTime < nowDateTime);
    }

    /**
     * 更新请求入参
     * @param flow
     */
    const updateInput = (flow: boolean) => {
        input.flow = flow;
        input.fileList = removeDuplicate([...PT1FileList, ...PT2FileList]);
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
                    title: '开始更换',
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
                    title: '开始更换',
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
        let userId = visible.userType == 0 ? input.changeOperatorId : input.changeConfirmId;
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
            visible.visible && <SchActionSheet title={visible.userType == 0 ? '选择换瓶操作人' : '选择换瓶确认人'}
                                               arrActions={configSheetUsers()} modalVisible={visible.visible}
                                               onCancel={() => {
                                                   setVisible({visible: false, userType: visible.userType});
                                               }}
                                               onSelect={(item: { title: string, type: number }) => {
                                                   setVisible({visible: false, userType: visible.userType});
                                                   let tempInput = input;
                                                   if (visible.userType == 0) {
                                                       ///操作人
                                                       tempInput.changeOperator = item.title;
                                                       tempInput.changeOperatorId = item.type;
                                                   } else {
                                                       ///确认人
                                                       tempInput.changeConfirm = item.title;
                                                       tempInput.changeConfirmId = item.type;
                                                   }
                                                   setInput({...tempInput});

                                                   for (let data of detailDataSource) {
                                                       if (data.sectionType == BottleSectionType.exchange) {
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
        waitChangeRequestStatus: bottleDetail.waitChangeRequestStatus,
    }
}

export default connect(mapStateToProps, {
    loadAirBottleDetail,
    redactWaitChange,
    cleaAirBottleDetail,
    loadUsers,
    airBottleDetailLoadingStatus,
})(AirBottleWaitReplaceDetail);
