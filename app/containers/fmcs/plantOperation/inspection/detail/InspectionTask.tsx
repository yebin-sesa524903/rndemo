import React from "react";
import { FlatList, Image, InteractionManager, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
// @ts-ignore
import Toolbar from "../../../../../components/Toolbar";
import { connect } from "react-redux";
import {
  autoCaoBiao, inspectionTaskDestroyClear, loadInspectionTask, saveInspectionTaskInfo, taskUpdateProject,
} from "../../../../../actions/inspection/inspectionAction";
import Colors from "../../../../../utils/const/Colors";
import { ExpandHeader } from "../../../../../components/fmcs/plantOperation/components/ExpandHeader";
import BottleDetailActionView from "../../../../../components/fmcs/gasClass/airBottle/detail/BottleDetailActionView";
import { isEmptyString, screenHeight, TimeFormatYMDHMS } from "../../../../../utils/const/Consts";
// @ts-ignore
import ModalDropdown from "react-native-modal-dropdown";
import { configTaskInfoMessage } from "./InspectionStateHelper";
import moment from "moment";
import { RequestStatus } from "../../../../../middleware/api";
import SndToast from "../../../../../utils/components/SndToast";
import EmptyView from "../../../../../utils/refreshList/EmptyView";

export interface InspectionTaskData {
  icon?: any,
  title?: string,
  isExpand?: boolean,///是否展开 true 展开;  false 收起
  id?: number,
  sceneId?: number,
  deviceId?: number,
  inspectionTaskType?: InspectionTaskType,
  isAutoCB?: boolean, ///是否已自动抄表 ture 已查询抄表; false:还未查询抄表
  data?: TaskData[],
}

export interface TaskData {
  id?: number,
  taskId?: number,
  taskProjectId?: number,
  taskType?: TaskType,
  status?: InspectionTaskStatus,
  executorType?: number,  ///执行方式  2: 刷卡, 1: 直接开始
  contentValue?: string,///判断类型 四种巡检方式 3/4种  带描述选择
  selectedIndex?: number,///type为3的时候 选中index

  itemName?: string,///项目名称
  content?: string, ///巡检内容
  inspectResult?: string,///巡检结果
  range?: string, ///巡检正常范围
  unit?: string,///单位
  tagAbbreviation?: string,
  tagName?: string,
  tagId?: string,
}

export enum TaskType {
  text=2232,///文本
  number,///数字输入
  checkbox,///判断选择
  dropdown, ///下拉选择
}

//巡检任务 类型
export enum InspectionTaskType {
  panDu=2001,///判断类型
  chaoBi///抄表类型
}

///巡检任务状态
export enum InspectionTaskStatus {
  new=101011,    ///新建    ///只有确定按钮
  editInit,///编辑初始态 只有编辑按钮
  editing,    /// 编辑中 有确定/取消按钮
  view///查看
}


/**
 * 巡检项
 * @param props
 * @constructor
 */
function InspectionTask(props: any) {
  const onPopBack=() => {
    InteractionManager.runAfterInteractions(() => {
      props.navigator.pop();
    });
  }

  React.useEffect(() => {
    loadInspectTask();
  }, []);

  /**
   * 获取巡检作业任务
   */
  const loadInspectTask=() => {
    let taskId=props.taskId;
    props.loadInspectionTask(taskId);
  }

  /**
   * 监听巡检作业的请求
   */
  React.useEffect(() => {
    if (props.responseTask&&Object.keys(props.responseTask).length>0) {
      ///接口有返回
      ///通过巡检详情传过来的scenes_id/deviceId,筛选相应的巡检任务task
      let tasks=[];
      for (let task of props.responseTask) {
        if (task.deviceId==props.taskObj.deviceId&&!isEmptyString(props.taskObj.deviceCode)) {
          ///设备相关巡检
          tasks.push(task);
        } else if (task.sceneId==props.taskObj.sceneId&&!isEmptyString(props.taskObj.code)&&(task.deviceId==0||task.deviceId==null)) {
          ///场景相关巡检
          tasks.push(task);
        }
      }
      let showTasks=configTaskInfoMessage(tasks);
      props.saveInspectionTaskInfo(showTasks);
    }
  }, [props.responseTask, props.taskObj]);

  /**
   * 进入到巡检任务执行自动抄表操作
   */
  React.useEffect(() => {
    if (props.taskInfo.length>0) {
      for (let task of props.taskInfo) {
        if (task.inspectionTaskType==InspectionTaskType.chaoBi&&!task.isAutoCB) {
          let arrAbbreviation: any[]=[];
          let tagIdList: any[]=[];
          let deviceId=task.deviceId;
          task.data?.forEach((item: any) => {
            if (item.tagAbbreviation) {
              arrAbbreviation.push(item.tagAbbreviation);
            }
            if (item.tagId) {
              tagIdList.push(item.tagId);
            }
          });
          if (deviceId!=undefined&&(arrAbbreviation.length>0||tagIdList.length>0)) {
            task.isAutoCB=true;///标记已自动抄表
            InteractionManager.runAfterInteractions(() => {
              props.autoCaoBiao({ deviceId: deviceId, abbreviationList: arrAbbreviation, tagIdList: tagIdList })
              props.saveInspectionTaskInfo([...props.taskInfo]);
            });
          }
        }
      }
    }
  }, [props.taskInfo]);

  /**
   * 监听更新巡检作业  请求结果
   */
  React.useEffect(() => {
    if (props.updateProjectRequestStatus==RequestStatus.loading) {
      SndToast.showLoading('正在提交...');
    } else if (props.updateProjectRequestStatus==RequestStatus.success) {
      SndToast.dismiss();
      SndToast.showSuccess('提交成功', () => {
        onPopBack();
        if (props.refreshCallBack) {
          props.refreshCallBack();
        }
      });
    } else if (props.updateProjectRequestStatus==RequestStatus.error) {
      SndToast.dismiss();
    }
  }, [props.updateProjectRequestStatus]);


  /**
   * 监听自动抄表的数组变化
   */
  React.useEffect(() => {
    for (let taskObj of props.taskInfo) {
      for (let datum of taskObj.data) {
        let tagAbbreviation=getTagValueWithAbbreviation(datum.tagAbbreviation, datum.tagId, taskObj.deviceId);
        if (!isEmptyString(tagAbbreviation)) {
          datum.inspectResult=tagAbbreviation;
        }
      }
    }
    props.saveInspectionTaskInfo([...props.taskInfo]);
  }, [props.responseAbbreviation]);

  function getTagValueWithAbbreviation(strAbbrev: string, tagId: string, deviceId: number) {
    if (props.responseAbbreviation&&props.responseAbbreviation.length>0) {
      for (let element of props.responseAbbreviation) {
        // if (deviceId==element.DeviceId) {
        if (tagId&&tagId==element.TagId) {
          return element.Value;
        }
        if (strAbbrev&&strAbbrev===element.Abbreviation) {
          return element.Value;
        }
        // }
        // }
      }
    }
    return null;
  }

  // 监听自动抄表请求状态
  React.useEffect(() => {
    if (props.autoCBRequestStatus==RequestStatus.loading) {
      SndToast.showLoading();
    } else if (props.autoCBRequestStatus==RequestStatus.success) {
      SndToast.dismiss();
      SndToast.showSuccess('抄表完成');
    } else if (props.autoCBRequestStatus==RequestStatus.error) {
      SndToast.dismiss();
    }
  }, [props.autoCBRequestStatus]);


  /**
   * 巡检作业销毁
   */
  React.useEffect(() => {
    return () => {
      ///巡检作业销毁
      props.inspectionTaskDestroyClear();
    }
  }, []);

  const renderTask1=(title?: string, subTitle?: string, canEdit?: boolean, defaultValue?: string, inputCallBack?: Function) => {
    return (
      <View key={title}
        style={{ flex: 1, marginBottom: 16 }}>
        <Text style={{ fontSize: 14, color: Colors.text.light }}>{title+'-'+subTitle}</Text>
        {
          canEdit?
            <TextInput
              style={{
                fontSize: 14,
                flex: 1,
                marginTop: 10,
                padding: 5,
                color: Colors.text.primary,
                borderWidth: 1,
                borderColor: Colors.border,
                borderRadius: 2,
                height: 50,
              }}
              maxLength={1000}
              placeholder={'请输入'}
              defaultValue={defaultValue}
              multiline={true}
              textAlignVertical={'top'}
              onChangeText={(text) => {
                inputCallBack&&inputCallBack(text);
              }}
            />
            :
            <Text style={{
              fontSize: 14,
              color: Colors.text.primary,
              marginTop: 12,
              flex: 1
            }}>{defaultValue}</Text>
        }
      </View>
    )
  }

  const renderTask2=(title?: string, subTitle?: string, canEdit?: boolean, defaultValue?: string, inputCallBack?: Function) => {
    return (
      <View key={title}
        style={styles.taskContent}>
        <Text style={{ fontSize: 14, color: Colors.text.light }}>{title+'-'+subTitle}</Text>
        {
          canEdit?
            <TextInput
              style={{
                fontSize: 13,
                flex: 1,
                padding: 5,
                color: Colors.text.primary,
              }}
              maxLength={10}
              textAlign={'right'}
              keyboardType={'number-pad'}
              placeholder={'请输入数字'}
              defaultValue={defaultValue}
              onChangeText={(text) => {
                inputCallBack&&inputCallBack(text);
              }}
            />
            :
            <Text style={{
              fontSize: 14,
              color: Colors.text.primary,
            }}>{defaultValue}</Text>
        }
      </View>
    )
  }

  const renderTask3=(title?: string, subTitle?: string, canEdit?: boolean, selectedIndex?: number, tValue?: string, fValue?: string, onPressCheckBox?: Function) => {
    return (
      <View key={title}
        style={styles.taskContent}>
        <Text style={{ fontSize: 14, color: Colors.text.light }}>{title+'-'+subTitle}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable disabled={!canEdit}
            onPress={() => {
              onPressCheckBox&&onPressCheckBox(tValue);
            }}
            style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}>
            <Image
              source={selectedIndex==0? require('../../../../../images/aaxiot/checkbox/check_box_selected.png'):require('../../../../../images/aaxiot/checkbox/check_box_normal.png')} />
            <Text style={{ fontSize: 13, color: Colors.text.light, marginLeft: 5 }}>是</Text>
          </Pressable>
          <Pressable disabled={!canEdit}
            onPress={() => {
              onPressCheckBox&&onPressCheckBox(fValue);
            }}
            style={{ flexDirection: 'row', alignItems: 'center', }}>
            <Image
              source={selectedIndex==1? require('../../../../../images/aaxiot/checkbox/check_box_selected.png'):require('../../../../../images/aaxiot/checkbox/check_box_normal.png')} />
            <Text style={{ fontSize: 13, color: Colors.text.light, marginLeft: 5 }}>否</Text>
          </Pressable>
        </View>
      </View>
    )
  }

  const renderTask4=(title?: string, subTitle?: string, result?: string, canEdit?: boolean, dropdownOptions?: string[], onSelectCallBack?: Function) => {
    return (
      <View key={title}
        style={styles.taskContent}>
        <Text style={{ fontSize: 14, color: Colors.text.light }}>{title+'-'+subTitle}</Text>
        {
          canEdit?
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ModalDropdown options={dropdownOptions}
                style={{
                  width: 120,
                }}
                textStyle={{
                  fontSize: 12,
                  color: Colors.text.light,
                  flex: 1,
                  textAlign: 'right',
                  marginRight: 8
                }}
                dropdownTextStyle={{ fontSize: 14, color: Colors.text.primary, height: 44 }}
                dropdownStyle={{
                  // @ts-ignore
                  height: ((dropdownOptions?.length<6)? dropdownOptions?.length:6)*44
                }}
                adjustFrame={(position: any) => {
                  return {
                    top: (position.top??0)-12,
                    left: position.left,
                    right: position.right
                  }
                }}
                onSelect={(index: number, value: string,) => {
                  onSelectCallBack&&onSelectCallBack(value, index);
                }}
                defaultValue={isEmptyString(result)? '请选择':result}
                defaultTextStyle={{ fontSize: 14, color: Colors.text.light }}
                dropdownListProps={{ ListHeaderComponent: <></> }}
              />
              <Image
                source={require('../../../../../images/aaxiot/airBottle/arrow_right.png')}
                style={{ marginRight: 8 }} />
            </View>
            :
            <Text style={{ fontSize: 14, color: Colors.text.primary }}>{result}</Text>
        }
      </View>
    )
  }

  const renderTaskContent=(data?: TaskData[]) => {
    return (
      <View style={{ paddingLeft: 15, paddingRight: 15 }}>
        {
          data?.map((datum: TaskData, index: number) => {
            return renderTaskItem(datum, index);
          })
        }
      </View>
    )
  }

  /**
   * 判断类四种类型
   * @param item
   * @param index
   */
  const renderTaskItem=(item: TaskData, index: number) => {
    let canEdit=(item.status!=InspectionTaskStatus.view&&item.status!=InspectionTaskStatus.editInit);

    let taskContent=null;
    if (item.taskType==TaskType.text) {
      taskContent=renderTask1(item.itemName, item.content, canEdit, item.inspectResult, (text: string) => {
        ///文本输入回调
        item.inspectResult=text;
        props.saveInspectionTaskInfo([...props.taskInfo]);
      });
    } else if (item.taskType==TaskType.number) {
      taskContent=renderTask2(item.itemName, item.content, canEdit, item.inspectResult, (text: string) => {
        ///数字输入回调
        item.inspectResult=text;
        props.saveInspectionTaskInfo([...props.taskInfo]);
      });
    } else if (item.taskType==TaskType.checkbox) {
      let selectedIndex=-1;
      let tValue='', fValue='';
      let contentValues=item.contentValue?.split(',');
      if (contentValues&&contentValues.length>0) {
        tValue=String(contentValues[0]);
        fValue=String(contentValues[1]);
        if (item.inspectResult!=undefined) {
          if (item.inspectResult==contentValues[0]) {
            ///选中的  是
            selectedIndex=0
          } else {
            ///选中的否
            selectedIndex=1
          }
        }
        if (item.selectedIndex!=undefined) {
          selectedIndex=item.selectedIndex;
        }
      }
      taskContent=renderTask3(item.itemName, item.content, canEdit, selectedIndex, tValue, fValue, (value: number) => {
        ///选择按钮点击
        item.inspectResult=String(value);
        props.saveInspectionTaskInfo([...props.taskInfo]);
      });
    } else if (item.taskType==TaskType.dropdown) {
      let dropdownOptions: any[]=[];
      let contentValues=item.contentValue?.split(',');
      if (contentValues&&contentValues.length>0) {
        for (let contentValue of contentValues) {
          dropdownOptions.push(contentValue);
        }
      }
      taskContent=renderTask4(item.itemName, item.content, item.inspectResult, canEdit, dropdownOptions, (value: string, index: number) => {
        ///dropDown点击
        item.inspectResult=value;
        props.saveInspectionTaskInfo([...props.taskInfo]);
      });
    }

    return (
      <View key={index}
        style={{ marginTop: 12 }}>
        {taskContent}
        {(item.taskType!=TaskType.text)&&<View style={{ backgroundColor: Colors.border, height: 1, }} />}
      </View>
    )
  }


  /**
   * 抄表类
   * @param taskItem
   * @param index
   */
  const renderInspectorCB=(taskItem: TaskData, index: number) => {
    let canEdit=taskItem.status!=InspectionTaskStatus.view&&taskItem.status!=InspectionTaskStatus.editInit
    return (
      <View key={index}>
        <View style={{ height: 40, alignItems: 'center', flexDirection: 'row' }}>
          <Text
            style={{ fontSize: 14, fontWeight: 'bold', color: Colors.text.primary, width: 80 }}>巡检项</Text>
          <Text style={{ fontSize: 14, color: Colors.text.primary, marginLeft: 15 }}>{taskItem.itemName}</Text>
          <View style={styles.lineSeparator} />
        </View>
        <View style={{ height: 40, alignItems: 'center', flexDirection: 'row' }}>
          <Text
            style={{ fontSize: 14, color: Colors.text.light, width: 80 }}>抄表点</Text>
          <Text style={{ fontSize: 14, color: Colors.text.primary, marginLeft: 15 }}>{taskItem.tagName??'-'}</Text>
          <View style={styles.lineSeparator} />
        </View>
        <View style={{ height: 40, alignItems: 'center', flexDirection: 'row' }}>
          <Text style={{ fontSize: 14, color: Colors.text.light, width: 80 }}>正常范围</Text>
          <Text style={{ fontSize: 14, color: Colors.text.primary, marginLeft: 15 }}>{taskItem.range}</Text>
          <View style={styles.lineSeparator} />
        </View>
        <View style={{ height: 40, alignItems: 'center', flexDirection: 'row' }}>
          <Text style={{ fontSize: 14, color: Colors.text.light, width: 80 }}>单位</Text>
          <Text style={{ fontSize: 14, color: Colors.text.primary, marginLeft: 15 }}>{taskItem.unit}</Text>
          <View style={styles.lineSeparator} />
        </View>
        <View style={{ height: 40, alignItems: 'center', flexDirection: 'row' }}>
          <Text style={{ fontSize: 14, color: Colors.text.light, width: 80 }}>数值</Text>
          {
            canEdit?
              <TextInput
                style={{ fontSize: 14, flex: 1, marginLeft: 12 }}
                maxLength={10}
                placeholder={'请输入'}
                value={taskItem.inspectResult}
                editable={taskItem.status===InspectionTaskStatus.new||taskItem.status===InspectionTaskStatus.editing}
                keyboardType={'numeric'}
                onChangeText={(text) => {
                  taskItem.inspectResult=text;
                  props.saveInspectionTaskInfo([...props.taskInfo]);
                }}
              />
              :
              <Text style={{
                fontSize: 14,
                color: Colors.text.primary,
                marginLeft: 12,
                flex: 1
              }}>{taskItem.inspectResult??'-'}</Text>
          }

          <View style={styles.lineSeparator} />
        </View>
      </View>
    )
  }

  /**
   * renderItem 渲染
   * @param itemObj
   */
  const renderItem=(itemObj: InspectionTaskData) => {
    return (
      <ExpandHeader {...itemObj}
        expandCallBack={() => {
          itemObj.isExpand=!itemObj.isExpand;
          props.saveInspectionTaskInfo([...props.taskInfo]);
        }}
        topRightContent={
          renderItemTopContent(itemObj)
        }
        content={
          itemContentElement(itemObj)
        } />
    )
  }

  /**
   * 自动抄表需要展示 按钮
   * @param itemObj
   */
  const renderItemTopContent=(itemObj: InspectionTaskData) => {
    if (itemObj.inspectionTaskType==InspectionTaskType.chaoBi) {
      let textBtn='自动抄表';
      let arrAbbreviation: any[]=[];
      let tagIdList: any[]=[];
      itemObj.data?.forEach((item: any) => {
        if (item.tagAbbreviation) {
          arrAbbreviation.push(item.tagAbbreviation);
        }
        if (item.tagId) {
          tagIdList.push(item.tagId);
        }
      });
      if (arrAbbreviation.length==0&&tagIdList.length==0) {
        return <></>;
      }

      return (
        <Pressable onPress={() => {
          ///自动抄表请求
          props.autoCaoBiao({ deviceId: itemObj.deviceId, abbreviationList: arrAbbreviation, tagIdList: tagIdList })
        }}
          style={{
            backgroundColor: '#EFEFEF',
            borderRadius: 2,
            padding: 5,
            marginRight: 20,
          }}>
          <Text style={{
            fontSize: 14,
            fontWeight: 'bold',
            color: Colors.theme,
          }}>{textBtn}</Text>
        </Pressable>
      )
    }
  }

  const itemContentElement=(itemObj: InspectionTaskData) => {
    if (itemObj.inspectionTaskType==InspectionTaskType.chaoBi) {
      return (
        <View style={{ paddingLeft: 15, paddingRight: 15 }}>
          {
            itemObj.data?.map((datum: TaskData, index: number) => {
              return renderInspectorCB(datum, index);
            })
          }
        </View>
      )
    } else {
      return renderTaskContent(itemObj.data);
    }
  }

  /**
   * 确认提交点击
   */
  const commitAction=() => {
    ///1. 检查所有巡检项是否 都已填了巡检结果
    ///如果没有 则谈提示框
    let hasNoInspectTask=false;///是否含有未填写的巡检项
    for (let task of props.taskInfo) {
      for (let datum of task.data) {
        if (isEmptyString(datum.inspectResult)) {
          hasNoInspectTask=true;
          break;
        }
      }
    }
    if (!hasNoInspectTask) {
      ///构建提交巡检参数
      let params=[];
      for (let task of props.taskInfo) {
        for (let datum of task.data) {
          let executorType=1;
          if (props.isCreditCard!=undefined) {
            executorType=props.isCreditCard? 2:1;
          } else {
            if (datum.executorType!=undefined) {
              executorType=datum.executorType;
            }
          }
          params.push({
            id: datum.id,
            taskId: datum.taskId,
            executeTime: moment().format(TimeFormatYMDHMS),
            executeResult: datum.inspectResult,
            executorId: props.currentUser.Id,
            executorName: props.currentUser.Name,
            executorType: executorType,
          })
        }
      }
      ///确认提交更新巡检项
      props.taskUpdateProject(params);
    } else {
      SndToast.showTip('请完成所有的巡检项再提交!');
    }
  }

  const renderBottomActions=() => {
    if (props.taskInfo.length>0) {
      return (
        <BottleDetailActionView actions={[
          {
            title: '取消',
            textColor: Colors.text.primary,
            onPressCallBack: onPopBack,
            btnStyle: { marginRight: 10, marginLeft: 10, flex: 1, backgroundColor: Colors.white }
          },
          {
            title: '确认提交',
            textColor: Colors.white,
            onPressCallBack: commitAction,
            btnStyle: { marginRight: 10, marginLeft: 10, flex: 1, backgroundColor: Colors.theme }
          }
        ]} />
      )
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background.primary }}>
      <Toolbar title={props.title} navIcon="back" onIconClicked={onPopBack} />
      <FlatList data={props.taskInfo}
        ListEmptyComponent={
          <View style={{
            height: screenHeight()-64-40,
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <EmptyView />
          </View>
        }
        keyExtractor={(item, index) => item.title+index}
        renderItem={(item) => renderItem(item.item)} />
      {renderBottomActions()}
    </View>
  )
}

const styles=StyleSheet.create({
  taskContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 54,
  },
  lineSeparator: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 0.5,
    backgroundColor: '#eee'
  },
  cancelPress: {
    backgroundColor: '#DDE5FF',
    borderWidth: 1,
    borderColor: '#C9D5FA',
    borderRadius: 2,
    width: 68,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savePress: {
    backgroundColor: Colors.theme,
    borderRadius: 2,
    width: 68,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10
  },

  buttonContainer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
})

const mapStateToProps=(state: any) => {
  let inspectionDetail=state.inspection.InspectionDetailReducer;
  const user=state.user.toJSON().user;
  return {
    currentUser: user,
    responseTask: inspectionDetail.responseTask,
    taskInfo: inspectionDetail.taskInfo,

    responseAbbreviation: inspectionDetail.responseAbbreviation,
    autoCBRequestStatus: inspectionDetail.autoCBRequestStatus,
    updateProjectRequestStatus: inspectionDetail.updateProjectRequestStatus,
  }
}

export default connect(mapStateToProps, {
  loadInspectionTask,///接口请求作业项
  saveInspectionTaskInfo,///保存巡检作业项
  autoCaoBiao,///自动抄表
  taskUpdateProject,///更新巡检作业项
  inspectionTaskDestroyClear,///销毁
})(InspectionTask)
