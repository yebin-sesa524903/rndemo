import React from "react";
import {FlatList, InteractionManager, StyleSheet, View} from "react-native";
import {connect} from "react-redux";
// @ts-ignore
import Toolbar from "../../../../../components/Toolbar";
import BottleDetailActionView from "../../../../../components/fmcs/gasClass/airBottle/detail/BottleDetailActionView";
import Colors from "../../../../../utils/const/Colors";
import {
    RepairAddBasic,
    RepairAddBasicProps
} from "../../../../../components/fmcs/plantOperation/repair/add/RepairAddBasic";
import {
    MaintainPicture,
    MaintainPictureProps
} from "../../../../../components/fmcs/plantOperation/maintain/detail/MaintainPicture";
import {
    fileModuleCode,
    RepairAddRowType,
    RepairDetailItemType
} from "../../../../../components/fmcs/plantOperation/defined/ConstDefined";
import {
    getCodeByEnum, repairAddDestroyClear,
    repairSaveBaseDetail,
    repairSaveDetailInputSave,
    saveRepairAddTaskInfo
} from "../../../../../actions/repair/repairAction";
import {
    configFileAttribute,
    configRepairPictures,
    updateDepartmentCodes,
    updateRowValueWithType,
    updateSystemCodes
} from "./RepairAddHelper";
// @ts-ignore
import ModalDropdown from "react-native-modal-dropdown";
import {isEmptyString, TimeFormatYMD} from "../../../../../utils/const/Consts";
import SndToast from "../../../../../utils/components/SndToast";
import RepairSelectAssets from "./RepairSelectAssets";
import RepairSelectOrder from "./RepairSelectOrder";
import {
    filePreviewVisible,
} from "../../../../../actions/fileList/fileListAction";
import ImagePicker from "../../../../ImagePicker";
import storage from "../../../../../utils/storage";
import ImageView from "react-native-image-viewing";
import {RequestStatus} from "../../../../../middleware/api";
import moment from "moment";

/**
 * 故障报修
 * @param props
 * @constructor
 */
function RepairAddTask(props: any) {
    /**
     * 返回按钮点击
     */
    const onPopBack = () => {
        InteractionManager.runAfterInteractions(() => {
            props.navigator.pop();
        });
    }

    const dropdownRef1 = React.useRef<ModalDropdown>(null);
    const dropdownRef2 = React.useRef<ModalDropdown>(null);
    const dropdownRef3 = React.useRef<ModalDropdown>(null);
    const dropdownRef4 = React.useRef<ModalDropdown>(null);

    /**
     * 给下拉选择框  dropdown 引用赋值, 自定义renderRow 需要手动hide();
     */
    const configDropdownRef = () => {
        let repairInfo = props.addRepairInfo;
        for (let info of repairInfo) {
            if (info.sectionType == RepairDetailItemType.basicMsg) {
                for (let datum of info.data) {
                    if (datum.rowType == RepairAddRowType.department) {
                        datum.dropdownRef = dropdownRef1;
                    } else if (datum.rowType == RepairAddRowType.system) {
                        datum.dropdownRef = dropdownRef2;
                    } else if (datum.rowType == RepairAddRowType.repairType) {
                        datum.dropdownRef = dropdownRef3;
                    } else if (datum.rowType == RepairAddRowType.repairSource) {
                        datum.dropdownRef = dropdownRef4;
                    }
                }
            }
        }
        props.saveRepairAddTaskInfo([...repairInfo]);
    }

    React.useEffect(() => {
        ///获取工单编号
        props.getCodeByEnum({type: 'RW'});
        configDropdownRef();
    }, []);

    /**
     * 监听工单编号获取 刷新列表/更新入参
     */
    React.useEffect(() => {
        if (props.orderCode.length > 0) {
            ///刷新列表
            let infoList = updateRowValueWithType(props.orderCode, RepairAddRowType.orderNo, props.addRepairInfo);
            props.saveRepairAddTaskInfo(infoList);
            ///更新请求input
            let input = props.saveRepairInput;
            input.code = props.orderCode;
            props.repairSaveDetailInputSave({...input});
        }
    }, [props.orderCode]);


    /**
     * 监听课室/系统code值变化 刷新列表/更新入参
     */
    React.useEffect(() => {
        if (props.departmentCodes.length > 0) {
            let departmentCodes = [];
            for (let departmentCode of props.departmentCodes) {
                departmentCodes.push({
                    title: departmentCode.label,
                    id: departmentCode.value,
                });
            }
            let infoList = updateDepartmentCodes(departmentCodes, props.addRepairInfo);
            props.saveRepairAddTaskInfo(infoList);
        }
    }, [props.departmentCodes]);

    React.useEffect(()=>{
        if (props.saveRepairRequestStatus == RequestStatus.loading) {
            SndToast.showLoading();
        } else if (props.saveRepairRequestStatus == RequestStatus.success) {
            SndToast.dismiss();
            onPopBack();
            ///刷新维修列表
            props.refreshCallBack && props.refreshCallBack();
        } else if (props.saveRepairRequestStatus == RequestStatus.error) {
            SndToast.dismiss();
        }
    }, [props.saveRepairRequestStatus]);

    /**
     * 页面销毁
     */
    React.useEffect(() => {
        return () => {
            props.repairAddDestroyClear();
        }
    }, [])

    /**
     * 展开/收起
     * @param sectionType
     */
    const onPressExpand = (sectionType: RepairDetailItemType) => {
        const dataSource = props.addRepairInfo;
        for (let element of dataSource) {
            if (element.sectionType == sectionType) {
                element.isExpand = !element.isExpand;
                break;
            }
        }
        props.saveRepairAddTaskInfo([...dataSource]);
    }
    /**
     * 完成按钮
     */
    const renderComplete = () => {
        return (
            <BottleDetailActionView actions={[
                {
                    title: '提交',
                    textColor: Colors.white,
                    onPressCallBack: onPressComplete,
                    btnStyle: {marginLeft: 12, marginRight: 12, flex: 1, backgroundColor: Colors.theme}
                }
            ]}/>
        )
    }

    /**
     * 完成提交点击
     */
    const onPressComplete = () => {
        let input = props.saveRepairInput;
        if (isEmptyString(input.name)){
            SndToast.showTip('请输入工单名称')
            return;
        }
        if (isEmptyString(input.departmentCode)){
            SndToast.showTip('请选择课室');
            return;
        }
        if (isEmptyString(input.deviceId)){
            SndToast.showTip('请选择设备');
            return;
        }
        if (isEmptyString(input.type)){
            SndToast.showTip('请选择维修类型');
            return;
        }
        if (isEmptyString(input.source)){
            SndToast.showTip('请选择维修需求来源');
            return;
        }
        if (isEmptyString(input.remark)){
            SndToast.showTip('请输入异常描述');
            return;
        }
        input.planDate = moment().format(TimeFormatYMD);
        input.executorIds = [props.currentUser.Id];
        input.copiedIds = [props.currentUser.Id];
        let fileAttribute = configFileAttribute(props.addRepairInfo);
        if (fileAttribute.length > 0) {
            input.fileAttribute = fileAttribute.join(',');
        }
        props.repairSaveBaseDetail(input);
    }

    /**
     * 工单名称文字变化
     * @param text
     */
    const orderNameTextChange = (text: string) => {
        ///更新请求input
        let input = props.saveRepairInput;
        input.name = text;
        props.repairSaveDetailInputSave({...input});
    }

    /**
     * 故障描述文字变化
     * @param text
     */
    const faultDesTextChange = (text: string) => {
        let input = props.saveRepairInput;
        input.remark = text;
        props.repairSaveDetailInputSave({...input});
    }

    /**
     * dropdown 点击回调
     * @param option
     * @param rowType
     */
    const dropdownOnSelect = (option: any, rowType: RepairAddRowType) => {
        let input = props.saveRepairInput;
        let tempList: RepairAddBasicProps[] = [];
        if (rowType == RepairAddRowType.department) {
            dropdownRef1.current?.hide();
            let systemCodes = getSystemCodesFromDepartmentCodes(option.id).systemCodes;
            let infoList = updateSystemCodes(systemCodes, props.addRepairInfo);
            tempList = updateRowValueWithType(option.title, RepairAddRowType.department, infoList);
            ///将系统/设备/关联工单清空
            tempList = updateRowValueWithType('', RepairAddRowType.system, tempList);
            tempList = updateRowValueWithType('', RepairAddRowType.device, tempList);
            tempList = updateRowValueWithType('', RepairAddRowType.relateOrderNo, tempList);
            ///选择的课室id
            input.departmentCode = option.id;
            ///清空系统/设备/关联工单 入参
            input.systemCode = null;
            input.deviceId = null;
            input.deviceName = '';
            input.relateCode = '';
        } else if (rowType == RepairAddRowType.system) {
            dropdownRef2.current?.hide();
            tempList = updateRowValueWithType(option.title, RepairAddRowType.system, props.addRepairInfo);
            ///选择的系统id
            input.systemCode = option.id;
        } else if (rowType == RepairAddRowType.repairType) {
            dropdownRef3.current?.hide();
            tempList = updateRowValueWithType(option.title, RepairAddRowType.repairType, props.addRepairInfo);
            ///维修类型
            input.type = option.id;
        } else if (rowType == RepairAddRowType.repairSource) {
            dropdownRef4.current?.hide();
            tempList = updateRowValueWithType(option.title, RepairAddRowType.repairSource, props.addRepairInfo);
            ///维修来源
            input.source = option.id;
        }
        props.saveRepairAddTaskInfo(tempList);
        props.repairSaveDetailInputSave({...input});
    }

    const getSystemCodesFromDepartmentCodes = (departmentCodeId: number)=>{
        let systemCodes = [], ids = [];
        for (let departmentCode of props.departmentCodes) {
            if (departmentCode.value == departmentCodeId) {
                for (let child of departmentCode.children) {
                    systemCodes.push({
                        title: child.label,
                        id: child.value,
                    });
                    ids.push(child.value);
                }
            }
        }
        return {systemCodes:systemCodes, ids: ids};
    }

    /**
     * 选择设备/工单点击
     */
    const actionCallBack = (rowType: RepairAddRowType) => {
        let input = props.saveRepairInput;
        if (isEmptyString(input.departmentCode)) {
            SndToast.showTip('请先选择课室');
            return;
        }
        if (rowType == RepairAddRowType.device) {
            props.navigator.push({
                id: 'Repair_Select_Assets',
                component: RepairSelectAssets,
                passProps: {
                    parentId: isEmptyString(input.systemCode) ? getSystemCodesFromDepartmentCodes(input.departmentCode).ids : [input.systemCode],
                    customerId: props.currentUser.CustomerId,
                    selectedDeviceId: input.deviceId,
                    selectCallBack: (deviceObj: any) => {
                        ///更新列表
                        let tempList = updateRowValueWithType(deviceObj.deviceName, RepairAddRowType.device, props.addRepairInfo);
                        props.saveRepairAddTaskInfo(tempList);
                        ///更新入参
                        let repairInput = props.saveRepairInput;
                        repairInput.deviceId = deviceObj.deviceId;
                        repairInput.deviceName = deviceObj.deviceName;
                        props.repairSaveDetailInputSave({...repairInput});
                    }
                }
            })
        } else {
            if (isEmptyString(input.deviceId)) {
                SndToast.showTip('请先选择设备');
                return;
            }
            if (isEmptyString(input.source)) {
                SndToast.showTip('请先选择维修需求来源');
                return;
            }
            props.navigator.push({
                id: 'Repair_Select_Order',
                component: RepairSelectOrder,
                passProps: {
                    relateCode: input.relateCode,
                    departmentCode: input.departmentCode,
                    systemCode: input.systemCode,
                    deviceId: input.deviceId,
                    type: input.source,
                    selectCallBack: (orderObj: any) => {
                        ///更新列表
                        let tempList = updateRowValueWithType(orderObj.code, RepairAddRowType.relateOrderNo, props.addRepairInfo);
                        props.saveRepairAddTaskInfo(tempList);
                        ///更新入参
                        let repairInput = props.saveRepairInput;
                        repairInput.relateCode = orderObj.code;
                        props.repairSaveDetailInputSave({...repairInput});
                    }
                }
            })
        }
    }

    /**
     * 添加图片
     */
    const addImageCallBack = () => {
        if (isEmptyString(props.saveRepairInput.deviceId)){
            SndToast.showTip('请先选择设备,再上传图片');
            return;
        }
        let imageCount = 0;
        for (let basicObj of props.addRepairInfo) {
            if (basicObj.sectionType == RepairDetailItemType.repairPicture) {
                imageCount = basicObj.images.length;
            }
        }
        props.navigator.push({
            id: 'imagePicker',
            component: ImagePicker,
            passProps: {
                max: 10 - imageCount,
                dataChanged: (chosenImages: any[]) => {
                    didPickerImage(chosenImages)
                }
            }
        });
    }

    /**
     * 刷新列表上传图片
     * @param images
     */
    const didPickerImage = (images: any[]) => {
        let repairInfo = props.addRepairInfo;
        let tempData = [];
        for (let image of images) {
            tempData.push(
                {
                    uri: image.uri,
                    name: image.filename,
                    needUpload: true,
                    canRemove: false,
                    deviceId: fileModuleCode.repairWorkOrderDeviceImg + props.saveRepairInput.deviceId,
                    uploadComplete: imageUploadComplete,
                }
            )
        }
        for (let basicObj of repairInfo) {
            if (basicObj.sectionType == RepairDetailItemType.repairPicture) {
                basicObj.images.push(...tempData);
            }
        }
        props.saveRepairAddTaskInfo([...repairInfo]);
    }

    /**
     * 图片上传成功
     */
    const imageUploadComplete = (response: any) => {
        ///刷新文件列表
        let repairInfo = configRepairPictures(response, props.addRepairInfo)
        props.saveRepairAddTaskInfo([...repairInfo]);
    }

    /**
     * 删除图片
     */
    const removeImageCallBack = (image: any) => {
        let repairInfo = props.addRepairInfo;
        for (let basicObj of repairInfo) {
            if (basicObj.sectionType == RepairDetailItemType.repairPicture) {
                basicObj.images.splice(basicObj.images.indexOf(image), 1);
            }
        }
        props.saveRepairAddTaskInfo([...repairInfo]);
    }
    /**
     * 放大图片
     */
    const onPressImage = (index: number) => {
        props.filePreviewVisible({visible: true, index: index})
    }

    /**
     * 图片浏览器 大图浏览
     */
    const renderImageViewing = () => {
        let images = [];
        let basicMsg = props.addRepairInfo;
        for (let basicObj of basicMsg) {
            if (basicObj.sectionType == RepairDetailItemType.repairPicture) {
                for (let image of basicObj.images) {
                    images.push({
                        uri: storage.getOssBucket() + `/lego-bff/bff/ledger/rest/downloadFile?id=${image.id}`,
                    });
                }
                break;
            }
        }

        return (
            <ImageView
                images={images}
                imageIndex={props.previewVisible.index}
                visible={props.previewVisible.visible}
                onRequestClose={() => props.filePreviewVisible({visible: false, index: 0})}
            />
        )
    }


    const renderItem = (itemObj: RepairAddBasicProps | MaintainPictureProps) => {
        if (itemObj.sectionType == RepairDetailItemType.basicMsg) {
            return RepairAddBasic({
                ...itemObj,
                expandCallBack: onPressExpand,
                orderNameTextChange: orderNameTextChange,
                faultDesTextChange: faultDesTextChange,
                dropdownOnSelect: dropdownOnSelect,
                actionCallBack: actionCallBack,
            })
        } else if (itemObj.sectionType == RepairDetailItemType.repairPicture) {
            // @ts-ignore
            return MaintainPicture({
                ...itemObj,
                expandCallBack: onPressExpand,
                addImageCallBack: addImageCallBack,
                removeImageCallBack: removeImageCallBack,
                onPressImage: onPressImage,
            });
        }
        return <></>
    }


    return (
        <View style={styles.container}>
            <Toolbar title={'故障报修'} navIcon="back" onIconClicked={onPopBack}/>
            <FlatList data={props.addRepairInfo}
                      keyExtractor={(item) => item.title}
                      renderItem={(item) => renderItem(item.item)}/>
            {renderComplete()}
            {renderImageViewing()}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.primary
    }
})

const mapStateToProps = (state: any) => {
    let repair = state.repair.RepairAddReducer;
    let departmentCodes = state.workbench.departmentCodes;
    let fileList = state.fileList;
    const user = state.user.toJSON().user;
    return {
        currentUser: user,
        departmentCodes: departmentCodes,///课室和系统code
        addRepairInfo: repair.addRepairInfo,    ////故障报修模型数组
        orderCode: repair.orderCode,///工单编号
        saveRepairInput: repair.saveRepairInput,///报修入参
        saveRepairRequestStatus: repair.saveRepairRequestStatus,///提交报修 请求状态
        ///图片相关
        previewVisible: fileList.previewVisible,
    }
}

export default connect(mapStateToProps, {
    saveRepairAddTaskInfo,///保存报修业务模型 负责展示
    getCodeByEnum,  ///获取工单编码
    repairSaveDetailInputSave,///报修提交 入参保存
    repairSaveBaseDetail,   ///故障报修接口保存
    repairAddDestroyClear,
    filePreviewVisible,///文件预览放大
})(RepairAddTask);
