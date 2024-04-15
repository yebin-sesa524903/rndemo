import React from "react";
import {
  Alert,
  FlatList,
  InteractionManager,
  View,
  ScrollView
} from 'react-native';
import {connect} from "react-redux";
// @ts-ignore
import Toolbar from "../../../../../components/Toolbar";
import Colors from "../../../../../utils/const/Colors";
import {saveKnowledgeDetailDataInfo} from "../../../../../actions/callin/knowledgeAction";
import {getKnowledgeDataInfo, KnowledgeItemType} from "./KnowledgeHelper";
import {KnowledgeDetailItem} from "../../../../../components/fmcs/callin/knowledgeBase/detail/KnowledgeDetailItem";
import {KnowledgeFileUpload} from "../../../../../components/fmcs/callin/knowledgeBase/detail/KnowledgeFileUpload";
import ViewDetailScreen from "../../../viewDetail/ViewDetailScreen";
import {callInListDestroyClear, getHierarchyList} from "../../../../../actions/callin/callInAction";

function KnowledgeDetail(props: any) {

  const onPop = () => {
    InteractionManager.runAfterInteractions(() => {
      props.navigator.pop();
    });
  }

  React.useEffect(() => {
    props.getHierarchyList(props.user.CustomerId)
  }, [])

  React.useEffect(() => {
    if (Object.keys(props.detail).length > 0) {
      let detail = getKnowledgeDataInfo(props.detail, props.departments);
      props.saveKnowledgeDetailDataInfo(detail);
    }
  }, [props.detail, props.departments]);


  React.useEffect(() => {
    return () => {
      props.saveKnowledgeDetailDataInfo([]);
      props.callInListDestroyClear();
    }
  }, [])

  /**
   * 展开收起点击
   * @param sectionType
   */
  const onPressExpend = (sectionType: KnowledgeItemType) => {
    const dataSource = props.detailDataInfo;
    for (let dataSourceElement of dataSource) {
      if (dataSourceElement.sectionType == sectionType) {
        dataSourceElement.isExpand = !dataSourceElement.isExpand;
        break;
      }
    }
    props.saveKnowledgeDetailDataInfo([...dataSource]);
  }

  /**
   * 查看明细
   */
  const onPressSeeDetail = (info: any) => {
    props.navigator.push({
      id: 'View_Detail_Screen',
      component: ViewDetailScreen,
      passProps: {
        title: info.title,
        remark: info.subTitle,
      }
    })
  }

  const renderKnowledgeItem = (itemObj: any) => {
    if (itemObj.sectionType == KnowledgeItemType.basicMsg) {
      return KnowledgeDetailItem({...itemObj, expandCallBack: onPressExpend, onPressSeeDetail});
    } else if (itemObj.sectionType == KnowledgeItemType.file) {
      return KnowledgeFileUpload({...itemObj});
    }
    return <></>
  }

  return (
    <View style={{flex: 1, backgroundColor: Colors.background.primary}}>
      <Toolbar title={'知识库概览详情'} navIcon="back" onIconClicked={onPop}/>
      <FlatList data={props.detailDataInfo}
                keyExtractor={(item, index) => item.title}
                renderItem={(item) => renderKnowledgeItem(item.item)}/>
    </View>
  )
}


const mapStateToProps = (state: any) => {
  const knowledgeDetail = state.knowledge.knowledgeDetail;
  let callIn = state.callIn.CallInListReducer;
  const user = state.user.toJSON().user;
  return {
    user: user,
    departments: callIn.departments,
    detailDataInfo: knowledgeDetail.detailDataInfo,
  }
}

export default connect(mapStateToProps,
  {
    saveKnowledgeDetailDataInfo,
    getHierarchyList,
    callInListDestroyClear,
  })(KnowledgeDetail);
