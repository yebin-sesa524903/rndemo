import Toolbar from "../../../../../components/Toolbar.android";
import {InteractionManager, TextInput, View} from "react-native";
import SearchBar from "../../../../../components/fmcs/gasClass/airBottle/list/SearchBar";
import {RefreshList} from "../../../../../utils/refreshList/RefreshList";
import React from "react";
import {connect} from "react-redux";
import {
  knowledgeSearchDestroyClear, knowledgeSearchKeywords,
  knowledgeSearchResultInputSave,
  loadKnowledgeSearchResultList,

} from "../../../../../actions/callin/knowledgeAction";
import {KnowledgeItem} from "../../../../../components/fmcs/callin/knowledgeBase/list/KnowledgeItem";
import {isEmptyString} from "../../../../../utils/const/Consts";
import Colors from "../../../../../utils/const/Colors";
import KnowledgeDetail from "../detail/KnowledgeDetail";

function KnowledgeSearchResult(props: any) {

  const searchBarRef = React.useRef<TextInput>(null);
  /**
   * 返回按钮点击
   */
  const onPopBack = () => {
    InteractionManager.runAfterInteractions(() => {
      props.navigator.pop();
    });
  }
  /**
   * 监听list input 变化请求列表数据
   */
  React.useEffect(() => {
    // if (props.input.search_EQ_typeChildId) {
    //   props.loadKnowledgeSearchResultList(props.input);
    // }
    props.loadKnowledgeSearchResultList(props.input);

  }, [props.input]);

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
          separatorLine: false,
          knowledgeInfo: result,
        })
      }
    }
    return resultsArray.length > 0 ? [{data: resultsArray}] : resultsArray;
  }, [props.results]);


  React.useEffect(() => {
    return () => {
      props.knowledgeSearchDestroyClear();
    }
  }, []);

  /**
   * 下拉刷新
   */
  const pullToRefresh = () => {
    let input = props.input;
    input.page = 1;
    props.knowledgeSearchResultInputSave({...input});
  }

  /**
   * 上拉加载
   */
  const pullLoadMore = () => {
    let input = props.input;
    input.page = props.page + 1;
    props.knowledgeSearchResultInputSave({...input});
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
   * 搜索输入框变化
   * @param text
   */
  const onSearchTextChange = (text: string) => {
    props.knowledgeSearchKeywords(text);
  }
  /**
   * 搜索按钮点击
   */
  const onPressSearch = () => {
    let input = props.input;
    input.page = 1;
    input.titleKeywords = props.keywords;
    props.knowledgeSearchResultInputSave({...input});
  }


  const onPressClear = () => {
    clearSearchBar()
    let input = props.input;
    input.titleKeywords = '';
    props.knowledgeSearchResultInputSave({...input});
  }

  const clearSearchBar = () => {
    searchBarRef && searchBarRef.current?.clear();
    props.knowledgeSearchKeywords('');
  }

  return (
    <View style={{flex: 1, backgroundColor: Colors.background.primary}}>
      <Toolbar title={'知识库概览'} navIcon="back" onIconClicked={onPopBack}/>
      <View style={{paddingBottom: 10, backgroundColor: Colors.white}}>
        <SearchBar textInputRef={searchBarRef}
                   value={props.keywords}
                   placeholder={'输入知识标题/关键字'}
                   isHiddenScan={true}
                   isDisables={false}
                   onPressClear={onPressClear}
                   onPressSearch={onPressSearch}
                   onSearchTextChange={onSearchTextChange}
        />
      </View>

      <View style={{flex: 1, paddingHorizontal: 15,backgroundColor: Colors.white, margin:15, borderRadius: 3,}}>
        <RefreshList sections={listData}
                     refreshing={props.loading}
                     keyExtractor={(item, index) => item.title}
                     renderItem={(item) => KnowledgeItem(item.item, onPressItem)}
                     pullToRefresh={pullToRefresh}
                     pullLoadMore={pullLoadMore}
                     showsVerticalScrollIndicator={false}
                     page={props.page}/>
      </View>


    </View>
  )
}

const mapStateToProps = (state: any) => {
  const knowledgeList = state.knowledge.KnowledgeSearchResult;
  return {
    loading: knowledgeList.loading,
    page: knowledgeList.page,
    input: knowledgeList.listInput,
    keywords: knowledgeList.keywords,
    results: knowledgeList.results,
  }
}

export default connect(mapStateToProps, {
  loadKnowledgeSearchResultList,
  knowledgeSearchResultInputSave,
  knowledgeSearchKeywords,
  knowledgeSearchDestroyClear,
})(KnowledgeSearchResult);
