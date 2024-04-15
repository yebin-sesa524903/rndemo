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
import {BottleDetailItem, BottleSectionType} from "../../../../../components/fmcs/gasClass/airBottle/detail/BottleDetaiItem";
import BottleDetailActionView from "../../../../../components/fmcs/gasClass/airBottle/detail/BottleDetailActionView";
import SndToast from "../../../../../utils/components/SndToast";
import SchActionSheet from "../../../../../components/actionsheet/SchActionSheet";
import {
    airBottleDetailLoadingStatus,
    cleaAirBottleDetail,
    loadAirBottleDetail,
    loadUsers,
    redactWaitBlow
} from "../../../../../actions/airBottle/airBottleAction";
import {RequestStatus} from "../../../../../middleware/api";
import AirBottleBlowingDetail from "./AirBottleBlowingDetail";
import moment from "moment";
import {TimeFormatYMDHM, TimeFormatYMDHMS} from "../../../../../utils/const/Consts";

interface RequestInputProps {
    id?: number,
    blowOperator?: string,
    blowOperatorId?: number,
    blowConfirm?: string,
    blowConfirmId?: number,
    flow?: boolean,
    timeDate? : string,
}

///待前吹 详情
///未分配/已分配/
function AirBottleWaitBlowDetail(props: any) {

    /**
     * 底部选择操作人/确认人 可见/不可见
     */
    const [visible, setVisible] = React.useState({visible: false, userType: 0});
    /**
     * 请求入参
     */
    const [input, setInput] = React.useState<RequestInputProps>({
        id: props.airBottle.id,
        blowOperatorId: -1,
        blowConfirmId: -1
    });

    /**
     * 获取详情
     */
    React.useEffect(() => {
        props.loadAirBottleDetail(props.airBottle.id);
        props.loadUsers();
    }, []);

    /**
     * 监听详情获取 请求状态
     */
    React.useEffect(()=>{
        if (props.loadingStatus == RequestStatus.loading){
            SndToast.showLoading();
        }else if (props.loadingStatus == RequestStatus.success){
            SndToast.dismiss();
            props.airBottleDetailLoadingStatus(RequestStatus.initial);
        }else if(props.loadingStatus == RequestStatus.error){
            SndToast.dismiss();
        }
    }, [props.loadingStatus]);

    /**
     * 页面销毁 清除详情数据
     */
    React.useEffect(()=>{
        return ()=>{
            props.cleaAirBottleDetail();
            props.airBottleDetailLoadingStatus(RequestStatus.initial);
        }
    }, []);

    /**
     * 监听input的情况, 请求带前吹编辑
     */
    React.useEffect(()=>{
        if (input.timeDate && input.blowConfirmId && input.blowOperatorId){
            props.redactWaitBlow(input);
        }
    }, [input.timeDate]);

    /**
     * 监听待前吹详情请求
     */
    React.useEffect(()=>{
        if (props.waitBlowRequestStatus == RequestStatus.loading){
            SndToast.showLoading();
        }else if (props.waitBlowRequestStatus == RequestStatus.success){
            SndToast.dismiss();
            ///成功
            if (input.flow) {
                ///已分配, 进入下个页面
                props.navigator.replace({
                    id: 'air_bottle_blowing',
                    component: AirBottleBlowingDetail,
                    navigator: props.navigator,
                    passProps:  {airBottle: props.airBottle, refreshCallBack:props.refreshCallBack}
                });
            }else{
                ///未分配 刷新列表
                props.loadAirBottleDetail(props.airBottle.id);
            }
        }else {
            SndToast.dismiss();
        }
    }, [props.waitBlowRequestStatus]);

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
                isExpand: true,
                expandCallBack: (sectionType: BottleSectionType) => {
                    onPressExpend(sectionType);
                },
                sectionType: BottleSectionType.blowing,
                dataObj: [
                    {
                        isRequire: true,
                        canEdit: true,
                        title: '前吹操作人',
                        subTitle: '请选择',
                        actionCallBack: () => {
                            setVisible({visible: true, userType: 0});
                        }
                    },
                    {
                        isRequire: true,
                        canEdit: true,
                        title: '前吹确认人',
                        subTitle: '请选择',
                        actionCallBack: () => {
                            setVisible({visible: true, userType: 1});
                        }
                    },
                ]
            }
        ]
    };

    const [detailDataSource, setDetailDataSource] = React.useState(configInitialData());

    /**
     * 根据detail 设置详情数据
     */
    React.useEffect(() => {
        const detail = props.detail;
        let user = props.currentUser;
        let founded = false;
        if (props.users.length > 0){
            for (let userObj of props.users) {
                if (userObj.userId == user.Id){
                    founded = true;
                    break;
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
                let isAlloc = isAllocUser();
                if (isAlloc) {
                    element.dataObj[0].subTitle = detail.blowOperator;
                    element.dataObj[0].isRequire = !isAlloc;
                    element.dataObj[0].canEdit = !isAlloc;
                    element.dataObj[1].subTitle = detail.blowConfirm;
                    element.dataObj[1].isRequire = !isAlloc;
                    element.dataObj[1].canEdit = !isAlloc;
                }else{
                    if (founded){
                        element.dataObj[0].subTitle = user.RealName;
                        element.dataObj[1].subTitle = user.RealName;
                    }
                }

            }
        }
        setDetailDataSource([...detailDataSource]);
        ///如果有值 需要赋值, 开始更换操作
        if (detail.blowOperatorId && detail.blowOperatorId > 0 && detail.blowConfirmId && detail.blowConfirmId > 0){
            input.blowOperator = detail.blowOperator;
            input.blowOperatorId = detail.blowOperatorId;
            input.blowConfirm = detail.blowConfirm;
            input.blowConfirmId = detail.blowConfirmId;
            setInput({...input});
        }else {
            if (founded){
                input.blowOperator = user.RealName;
                input.blowOperatorId = user.Id;
                input.blowConfirm = user.RealName;
                input.blowConfirmId = user.Id;
                setInput({...input});
            }
        }

    }, [props.detail, props.users]);

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
        if (!input.blowOperator || input.blowOperator.length == 0 || input.blowOperatorId == -1) {
            SndToast.showTip('请选择前吹操作人');
            return;
        }
        if (!input.blowConfirm || input.blowConfirm?.length == 0 || input.blowConfirmId == -1) {
            SndToast.showTip('请选择前吹确认人');
            return;
        }
        if (input.blowConfirmId != props.currentUser.Id && input.blowOperatorId != props.currentUser.Id){
            SndToast.showTip('确认人或操作人必须有一个当前操作人');
            return;
        }

        input.flow = flow;
        input.timeDate = moment().format(TimeFormatYMDHMS);
        setInput({...input});
    }


    const isCurrentUser = () => {
        const detail = props.detail;
        const userId = props.currentUser?.Id;
        return (detail.blowOperatorId == userId || detail.blowConfirmId == userId);
    }

    const isAllocUser = ()=>{
        const detail = props.detail;
        return (detail.blowOperatorId != undefined) || (detail.blowConfirmId != undefined);
    }
    /**
     * 底部按钮更具状态
     */
    const configBottomAction = () => {
        if (Object.keys(props.detail).length == 0){
            return null;
        }
        let isAlloc = isAllocUser();
        let isCurrent = isCurrentUser();
        let actions: any[] = [];
        if (isAlloc) {
            ///已分配
            if (isCurrent) {
                actions = [{
                    title: '开始前吹',
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
                    title: '开始前吹',
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
        let userId = visible.userType == 0 ? input.blowOperatorId : input.blowConfirmId;
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
            visible.visible && <SchActionSheet title={visible.userType == 0 ? '选择前吹操作人' : '选择前吹确认人'}
                                               arrActions={configSheetUsers()}
                                               modalVisible={visible.visible}
                                               onCancel={() => {
                                                   setVisible({visible: false, userType: visible.userType});
                                               }}
                                               onSelect={(item: { title: string, type: number }) => {
                                                   setVisible({visible: false, userType: visible.userType});
                                                   let tempInput = input;
                                                   if (visible.userType == 0) {
                                                       ///操作人
                                                       tempInput.blowOperator = item.title;
                                                       tempInput.blowOperatorId = item.type;

                                                   } else {
                                                       ///确认人
                                                       tempInput.blowConfirm = item.title;
                                                       tempInput.blowConfirmId = item.type;
                                                   }
                                                   setInput({...input});

                                                   for (let data of detailDataSource) {
                                                       if (data.sectionType == BottleSectionType.blowing) {
                                                           data.dataObj[visible.userType].subTitle = item.title;
                                                       }
                                                   }
                                                   setDetailDataSource([...detailDataSource]);
                                               }}
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
            </View>
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
        users: bottleDetail.users,
        waitBlowRequestStatus: bottleDetail.waitBlowRequestStatus,
    }
}

export default connect(mapStateToProps,
    {
        loadAirBottleDetail,
        redactWaitBlow,
        loadUsers,
        cleaAirBottleDetail,
        airBottleDetailLoadingStatus,
    })(AirBottleWaitBlowDetail);
