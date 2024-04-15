import React from "react";
import {connect} from "react-redux";
import {FlatList, InteractionManager, Pressable, Text, TextInput, View} from "react-native";
import Toolbar from "../../../../../components/Toolbar.android";
import SearchBar from "../../../../../components/fmcs/gasClass/airBottle/list/SearchBar";
import KnowledgeDetail from "../detail/KnowledgeDetail";
import {
  knowledgeInputSave, knowledgeListDestroyClear,
  knowledgeTypeSave,
  loadKnowledgeList, loadKnowledgeTypeList,
} from "../../../../../actions/callin/knowledgeAction";
import {RefreshList} from "../../../../../utils/refreshList/RefreshList";
import Colors from "../../../../../utils/const/Colors";
import {isEmptyString} from "../../../../../utils/const/Consts";
import {KnowledgeItem} from "../../../../../components/fmcs/callin/knowledgeBase/list/KnowledgeItem";
import KnowledgeSearchResult from "./KnowledgeSearchResult";

function KnowledgeList(props: any) {

  ///获取知识库分类信息
  React.useEffect(() => {
    props.loadKnowledgeTypeList();
  }, []);

  /**
   * 根据接口返回的 知识库分类数据 构建业务模型, 用户刷新列表
   */
  React.useEffect(() => {
    let tempData = [];
    let search_EQ_typeChild = null;
    for (let item of props.knowledgeType) {
      let children = [];
      for (let obj of item.child) {
        children.push({
          id: obj.id,
          title: obj.name,
          isSelected: false,
          parentId: obj.parentId,
        })
      }
      if (children.length > 0) {
        children[0].isSelected = true;
      }
      tempData.push({
        id: item.id,
        title: item.name,
        isSelected: false,
        children: children,
      });
    }
    tempData.unshift(configAllTypeData(props.knowledgeType))

    if (tempData.length > 0) {
      tempData[0].isSelected = true;
      if (tempData[0].children.length > 0) {
        search_EQ_typeChild = tempData[0].children[0].id;
      }
    }
    props.knowledgeTypeSave(tempData);
    ///获取知识库分类子类id 请求列表数据
    if (search_EQ_typeChild) {
      let input = props.input;
      input.search_EQ_typeChildId = search_EQ_typeChild;
      input.page = 1;
      props.knowledgeInputSave({...input});
    }

  }, [props.knowledgeType]);


  /**
   * 构建知识库全部分类数据
   */
  const configAllTypeData = (knowledgeTypes: any[]) => {
    let types = [];
    for (let type of knowledgeTypes) {
      for (let child of type.child) {
        types.push({
          id: child.id,
          title: child.name,
          isSelected: false,
          parentId: -1,
        })
      }
    }
    if (types.length > 0) {
      types[0].isSelected = true;
    }
    return {
      id: -1,
      title: '全部',
      isSelected: false,
      children: types,
    };
  }

  /**
   * 监听list input 变化请求列表数据
   */
  React.useEffect(() => {
    if (props.input.search_EQ_typeChildId) {
      props.loadKnowledgeList(props.input);
    }
  }, [props.input]);

  /**
   * 程序销毁 重置入参
   */
  React.useEffect(() => {
    return () => {
      props.knowledgeListDestroyClear();
    }
  }, []);


  const listData = React.useMemo(() => {
    let resultsArray: string | any[] = [];
    if (props.results) {
      for (let result of props.results) {
        resultsArray.push({
          id: result.id,
          title: result.title,
          specialty: result.specialty,
          keywords: (isEmptyString(result.keywords) ? '-' : result.keywords),
          creator: result.personName,
          separatorLine: true,
          knowledgeInfo: result,
        })
      }
    }
    return resultsArray.length > 0 ? [{data: resultsArray}] : resultsArray;
  }, [props.results]);

  /**
   * 返回按钮点击
   */
  const onPopBack = () => {
    InteractionManager.runAfterInteractions(() => {
      props.navigator.pop();
    });
  }

  /**
   * 下拉刷新
   */
  const pullToRefresh = () => {
    let input = props.input;
    input.page = 1;
    props.knowledgeInputSave({...input});
  }

  /**
   * 上拉加载
   */
  const pullLoadMore = () => {
    let input = props.input;
    input.page = props.page + 1;
    props.knowledgeInputSave({...input});
  }

  /**
   * 行点击 进入详情
   * @param itemObj
   */
  const onPressItem = (itemObj: any) => {
    props.navigator.push({
      id: 'Knowledge_Detail',
      component: KnowledgeDetail,
      passProps: {
        detail: itemObj.knowledgeInfo,
      }
    })
  }

  /**
   * 侧边栏 分类点击
   * @param item
   */
  const onPressKnowledgeTypes = (item: { id: number, title: string, isSelected: boolean, children: any[] }) => {
    ///刷新知识分类 左侧列表
    for (let typesDatum of props.typesData) {
      typesDatum.isSelected = (typesDatum.id == item.id);
    }
    props.knowledgeTypeSave([...props.typesData]);

    ///筛选二级分类选中id
    let typeChildId = null;
    for (let child of item.children) {
      if (child.isSelected) {
        typeChildId = child.id;
        break;
      }
    }

    ///设置分类id刷新列表
    if (typeChildId) {
      let input = props.input;
      input.page = 1;
      input.search_EQ_typeChildId = typeChildId;
      props.knowledgeInputSave({...input});
    }
  }

  /**
   * 左侧分类 筛选列表
   * @param item
   */
  const renderKnowledgeTypeItem = (item: any) => {
    return (
      <Pressable style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingRight: 15,
        backgroundColor: item.isSelected ? Colors.white : Colors.background.primary
      }}
                 onPress={() => {
                   onPressKnowledgeTypes(item);
                 }}>
        <View style={{
          position: 'absolute',
          left: 0,
          height: 36,
          backgroundColor: item.isSelected ? Colors.theme : Colors.transparent,
          width: 2
        }}/>
        <Text numberOfLines={3} style={{fontSize: 13, color: Colors.text.primary, marginLeft: 12}}>{item.title}</Text>
      </Pressable>
    )
  }

  /**
   * 获取二级分类 标题数组
   */
  const getSecondTypesTitle = () => {
    let titles = [];
    for (let info of props.typesData) {
      if (info.isSelected) {
        titles = info.children;
        break;
      }
    }
    return titles;
  }

  /**
   * 知识库二级分类
   */
  const renderKnowledgeSecondType = () => {
    let values = getSecondTypesTitle();
    return (
      <View style={{flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center',}}>
        {
          values.map((item: any) => {
            return (
              <Pressable key={item.title}
                         style={{marginRight: 12, marginTop: 15}}
                         onPress={() => {
                           ///刷新二级分类选中状态
                           for (let typesDatum of props.typesData) {
                             if (typesDatum.id == item.parentId) {
                               for (let child of typesDatum.children) {
                                 child.isSelected = child.id == item.id;
                               }
                               break;
                             }
                           }
                           props.knowledgeTypeSave([...props.typesData]);
                           ///设置分类id刷新列表
                           if (item.id) {
                             let input = props.input;
                             input.page = 1;
                             input.search_EQ_typeChildId = item.id;
                             props.knowledgeInputSave({...input});
                           }
                         }}>
                <Text style={{
                  fontSize: 13,
                  color: item.isSelected ? Colors.theme : Colors.text.sub,
                  fontWeight: item.isSelected ? 'bold' : 'normal',
                }}>{item.title}</Text>
              </Pressable>
            )
          })
        }
      </View>
    )
  }

  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <Toolbar title={'知识库概览'} navIcon="back" onIconClicked={onPopBack}/>
      <View style={{flexDirection: 'row', flex: 1}}>
        <View style={{backgroundColor: Colors.background.primary, flex: 0.25}}>
          <FlatList
            data={props.typesData}
            keyExtractor={(item, index) => item.title}
            renderItem={(item) => renderKnowledgeTypeItem(item.item)}/>
        </View>
        <View style={{flex: 1}}>
          <Pressable onPress={() => {
            props.navigator.push({
              id: 'Knowledge_Search_Result',
              component: KnowledgeSearchResult,
              passProps: {}
            })
          }}>
            <SearchBar placeholder={'输入知识标题/关键字'}
                       isHiddenScan={true}
                       isDisables={true}/>
          </Pressable>
          <RefreshList contentContainerStyle={{paddingHorizontal: 15}}
                       ListHeaderComponent={renderKnowledgeSecondType()}
                       sections={listData}
                       refreshing={props.loading}
                       keyExtractor={(item, index) => item.title}
                       renderItem={(item) => KnowledgeItem(item.item, onPressItem)}
                       pullToRefresh={pullToRefresh}
                       pullLoadMore={pullLoadMore}
                       page={props.page}/>
        </View>
      </View>
    </View>
  )
}

const mapStateToProps = (state: any) => {
  const knowledgeList = state.knowledge.knowledgeList;
  return {
    knowledgeType: knowledgeList.knowledgeType, ///知识库分类信息
    typesData: knowledgeList.typesData, ///知识库业务模型数组

    loading: knowledgeList.loading,
    page: knowledgeList.page,
    input: knowledgeList.listInput,    ///列表请求入参 需要设置: 1.首次进入; 2.切换边栏知识库分类; 3.选择二级分类
    results: knowledgeList.results,
  }
}

export default connect(mapStateToProps, {
  loadKnowledgeTypeList,
  knowledgeTypeSave,
  loadKnowledgeList,
  knowledgeInputSave,
  knowledgeListDestroyClear,
})(KnowledgeList);
