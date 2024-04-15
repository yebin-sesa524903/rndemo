import React from "react";
import { ExpandHeader, ExpandHeaderProps } from "../../components/ExpandHeader";
import { Image, KeyboardType, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Colors from "../../../../../utils/const/Colors";
import Button from "../../../../Button";

export interface InspectionTaskItemProps extends ExpandHeaderProps {
  data: InspectionTaskItemData[],
  executeStatus?: string, ///巡检状态
  canEdit?: boolean,  ///是否能编辑 true 各个按钮 都有效(还得根据任务状态) false 不可编辑 只能查看 操作按钮不存在 输入框置灰

  taskExpandCallBack?: Function,///巡检项 展开/收起按钮
  onPressInputNormal?: Function,  ///填写正常点击
  onPressAutoCB?: Function, ///自动抄表点击

  resultsTextDidChange?: Function,    ///巡检结果输入回调
  valueTextChange?: Function, ///巡检项 数值输入回调

  cancelCallBack?: Function,  ///取消按钮点击
  saveCallBack?: Function,    ///保存按钮点击
  editCallBack?: Function,    ///编辑按钮点击
}

/**
 * 保养项目 data
 */
export interface InspectionTaskItemData {
  id?: number,
  sceneId?: number,
  deviceId?: number,
  title?: string, ///巡检项目名称
  isExpand?: boolean,///是否展开
  inspectionTaskType?: InspectionTaskType,
  inspectionTasks?: InspectionTaskItemDataItem[]
}

export interface InspectionTaskItemDataItem {   ///巡检项内容 数组
  id?: number,
  taskId?: number,
  taskProjectId?: number,
  status?: InspectionTaskStatus,
  itemName?: string,///项目名称
  content?: string, ///巡检内容
  results?: string,///巡检结果
  range?: string, ///巡检正常范围
  unit?: string,///单位
  value?: string,///抄表类 数值
  tagAbbreviation?: string,
  tagName?: string,
  tagId?: string,
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

export function InspectionTaskItem(props: InspectionTaskItemProps) {

  /**
   * 判断类
   * @param taskItem
   * @param index
   */
  const renderInspectorDevice=(taskItem: InspectionTaskItemDataItem, index: number) => {
    return (
      <View key={index}>
        <View style={{ paddingTop: 10, paddingBottom: 10, alignItems: 'center', flexDirection: 'row' }}>
          <Text style={{
            fontSize: 14,
            fontWeight: 'bold',
            color: Colors.text.primary,
            width: 80
          }}>项目名称</Text>
          <Text style={{ fontSize: 14, color: Colors.text.primary, marginLeft: 15, flex: 1 }}>{taskItem.itemName}</Text>
          <View style={styles.lineSeparator} />
        </View>
        <View style={{ paddingVertical: 12, alignItems: 'center', flexDirection: 'row' }}>
          <Text style={{ fontSize: 14, color: Colors.text.light, width: 80 }}>巡检内容</Text>
          <Text style={{
            fontSize: 14,
            color: Colors.text.primary,
            marginLeft: 15,
            flex: 1
          }}>{taskItem.content}</Text>
          <View style={styles.lineSeparator} />
        </View>
        <View style={{ height: 40, alignItems: 'center', flexDirection: 'row' }}>
          <Text style={{ fontSize: 14, color: Colors.text.light, width: 80 }}>巡检结果</Text>
          <View style={styles.lineSeparator} />
        </View>
        <View style={{
          alignItems: 'center',
          flexDirection: 'row',
        }}>
          {
            props.canEdit?
              <TextInput
                style={{
                  fontSize: 14,
                  flex: 1, padding: 5,
                  color: Colors.text.primary,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  borderRadius: 2,
                  height: 50,
                }}
                maxLength={1000}
                placeholder={'请输入'}
                defaultValue={taskItem.results}
                multiline={true}
                textAlignVertical={'top'}
                onChangeText={(text) => {
                  props.resultsTextDidChange&&props.resultsTextDidChange(text, taskItem.id, taskItem.taskId, taskItem.taskProjectId);
                }}
              />
              :
              <Text style={{
                fontSize: 14,
                color: Colors.text.primary,
                marginTop: 12,
                flex: 1
              }}>{taskItem.results??'-'}</Text>
          }

        </View>
        {
          renderActionContent(taskItem)
        }
      </View>
    )
  }

  /**
   * 抄表类
   * @param taskItem
   * @param index
   */
  const renderInspectorSheet=(taskItem: InspectionTaskItemDataItem, index: number) => {
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
            props.canEdit?
              <TextInput
                style={{ fontSize: 14, flex: 1, marginLeft: 12 }}
                maxLength={10}
                placeholder={'请输入'}
                defaultValue={taskItem.value}
                editable={taskItem.status===InspectionTaskStatus.new||taskItem.status===InspectionTaskStatus.editing}
                keyboardType={'numeric'}
                onChangeText={(text) => {
                  props.valueTextChange&&props.valueTextChange(text, taskItem.id, taskItem.taskId, taskItem.taskProjectId);
                }}
              />
              :
              <Text style={{
                fontSize: 14,
                color: Colors.text.primary,
                marginLeft: 12,
                flex: 1
              }}>{taskItem.value??'-'}</Text>
          }

          <View style={styles.lineSeparator} />
        </View>
        {
          renderActionContent(taskItem)
        }
      </View>
    )
  }

  const renderActionContent=(taskItems: InspectionTaskItemDataItem) => {
    if (taskItems.status==InspectionTaskStatus.view) {
      return null;
    }
    return (
      <View style={{ height: 50, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 14, color: '#333', width: 80, flex: 1 }}>操作</Text>
        {
          taskItems.status==InspectionTaskStatus.new?
            <Button
              onClick={() => {
                props.saveCallBack&&props.saveCallBack(taskItems.id, taskItems.taskId, taskItems.taskProjectId);
              }}
              text={'确定'}
              textStyle={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}
              style={{
                backgroundColor: '#10357E',
                height: 28,
                width: 68,
                borderRadius: 2,
                marginLeft: 10
              }} />
            :
            (
              taskItems.status==InspectionTaskStatus.editInit?
                <Button
                  onClick={() => {
                    props.editCallBack&&props.editCallBack(taskItems.id, taskItems.taskId, taskItems.taskProjectId);
                  }}
                  text={'编辑'}
                  textStyle={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}
                  style={{
                    backgroundColor: '#10357E',
                    height: 28,
                    width: 68,
                    borderRadius: 2,
                    marginLeft: 10
                  }} />
                :
                <View style={{ flexDirection: 'row' }}>
                  <Button
                    onClick={() => {
                      props.cancelCallBack&&props.cancelCallBack(taskItems.id, taskItems.taskId, taskItems.taskProjectId);
                    }}
                    text={'取消'}
                    textStyle={{ color: '#10357E', fontSize: 14, fontWeight: 'bold' }}
                    style={{
                      backgroundColor: '#DDE5FF',
                      height: 28,
                      width: 68,
                      borderRadius: 2,
                      borderWidth: 1,
                      borderColor: '#C9D5FA'
                    }} />
                  <Button
                    onClick={() => {
                      props.saveCallBack&&props.saveCallBack(taskItems.id, taskItems.taskId, taskItems.taskProjectId);
                    }}
                    text={'确定'}
                    textStyle={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}
                    style={{
                      backgroundColor: '#10357E',
                      height: 28,
                      width: 68,
                      borderRadius: 2,
                      marginLeft: 10
                    }} />
                </View>

            )
        }

        <View style={styles.lineSeparator} />
      </View>
    )
  }
  const renderResultButton=(taskItem: InspectionTaskItemData) => {

    if (!props.canEdit) {
      ///不可编辑/执行中 不能自动填写
      return <></>
    }

    let textBtn=taskItem.inspectionTaskType==InspectionTaskType.panDu? '填写正常':'自动抄表';
    let hasTagAbbrevia=false;
    let arrAbbrevia=[];
    if (taskItem.inspectionTaskType==InspectionTaskType.chaoBi) {
      taskItem.inspectionTasks?.forEach((item: any) => {
        if (item.tagAbbreviation) {
          hasTagAbbrevia=true;
          arrAbbrevia.push(item.tagAbbreviation);
        }
      });

      if (!hasTagAbbrevia) {
        return <></>;
      }
    }

    return (
      <Pressable onPress={() => {
        (taskItem.inspectionTaskType==InspectionTaskType.panDu)
          ?
          (props.onPressInputNormal&&props.onPressInputNormal(taskItem.id, taskItem.sceneId, taskItem.deviceId))
          :
          (props.onPressAutoCB&&props.onPressAutoCB(taskItem))
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
  const renderTaskContent=(item: InspectionTaskItemData[]) => {
    return (
      <View style={{ borderRadius: 5, paddingHorizontal: 15 }}>
        {
          item.map((taskItem) => {
            return (
              <View key={taskItem.id} style={{ marginBottom: 10 }}>
                <View style={styles.expendContainer}>
                  <Text style={{
                    fontSize: 14,
                    color: Colors.text.primary,
                    flex: 1
                  }}>{taskItem.title}</Text>
                  {renderResultButton(taskItem)}
                  <Pressable onPress={() => {
                    props.taskExpandCallBack&&props.taskExpandCallBack(taskItem.id, taskItem.sceneId, taskItem.deviceId);
                  }}
                    style={{
                      paddingLeft: 40,
                      height: '100%',
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                      // backgroundColor: 'red'
                    }}>
                    <Image
                      source={taskItem.isExpand? require('../../../../../images/aaxiot/plantOperation/maintain/arrow_down.png'):require('../../../../../images/aaxiot/plantOperation/maintain/arrow_up.png')} />
                  </Pressable>

                </View>
                {
                  taskItem.isExpand&&taskItem.inspectionTasks?.map((inspectionTask, index) => {
                    if (taskItem.inspectionTaskType==InspectionTaskType.chaoBi) {
                      return renderInspectorSheet(inspectionTask, index);
                    } else {
                      return renderInspectorDevice(inspectionTask, index);
                    }

                  })
                }
              </View>
            )
          })
        }
      </View>
    )
  }

  return (
    <ExpandHeader {...props} content={renderTaskContent(props.data)} />
  )
}

const styles=StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 12,
  },

  inspectionText: {
    fontSize: 14,
    width: 100,
    color: Colors.text.primary,
  },
  inspectionValueText: {
    fontSize: 14,
    marginLeft: 10,
    color: Colors.text.primary,
  },
  inspectionSubText: {
    fontSize: 14,
    width: 100,
    color: Colors.text.light,
  },

  lineView: {
    height: 1,
    backgroundColor: Colors.gray.primary,
  },
  textInput: {
    fontSize: 14,
    color: Colors.text.primary,
    height: 50,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 12,
  },

  expendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#DDE5FF',
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 6,
    paddingBottom: 6,
    borderWidth: 1,
    borderColor: '#C9D5FA',
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
    marginRight: 10
  },
  savePress: {
    backgroundColor: Colors.theme,
    borderRadius: 2,
    width: 68,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    paddingTop: 12,
    // paddingBottom: 12
  },
  lineSeparator: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 0.5,
    backgroundColor: '#eee'
  }
})
