import React from "react";
import {Image, Pressable, StyleSheet, Text, TextInput, View} from "react-native";
import Colors from "../../../../../utils/const/Colors";
import {ExpandHeader} from "../../components/ExpandHeader";
import {MaintainDetailItemType} from "../../defined/ConstDefined";
// @ts-ignore
import ModalDropdown from "react-native-modal-dropdown";
import {isEmptyString} from "../../../../../utils/const/Consts";

export interface MaintainNewItemsProps {
  sectionType?: MaintainDetailItemType,///item 类型
  data?: MaintainNewItemsData[],
  canEdit?: boolean,///是否可编辑
  taskExpandCallBack?: Function,///展开按钮点击

  doResultCallBack?:(text: string | number, id: string, contentType?: number) => void,    ///保养执行结果回调
  tipsTextDidChange?: (text: string, id: string, contentType?: number) => void, ///保养说明输入回调

  cancelCallBack?: (id: string) => void, ///取消点击
  saveCallBack?: (id: string) => void,    ///保存点击
  editCallBack?: (id: string, result: string, remark?: string) => void,    ///编辑按钮点击
}


/**
 * 保养项目 data
 */
export interface MaintainNewItemsData {
  projectId?: string,
  title?: string, ///保养项目名称
  isExpand?: boolean,///是否展开
  maintainItems?: MaintainNewItemsDataItem[]
}

export interface MaintainNewItemsDataItem {   ///保养内容 数组
  id?: string,
  status?: MaintainItemsNewStatus,
  maintainItem?: string,///保养项
  maintainContent?: string, ///保养内容
  maintainType?: number,  ///1,2,3,4
  maintainResult?: string,///保养结果
  contentValue?: string,  ///3,4需要选择的内容
  remark?: string,///保养说明
  selectedIndex?: number,///type为3的时候 选中index
}

export enum MaintainItemsNewStatus {
  new = 1111,  ///新建    ///只有保存按钮
  edit,   ///可编辑态 只显示编辑按钮
  editing,///正在编辑态    显示取消/保存按钮
  view///查看 不显示操作
}


export function MaintainNewItems(props: MaintainNewItemsProps) {
  const renderTask1 = (title?: string, subTitle?: string, canEdit?: boolean, defaultValue?: string, inputCallBack?: Function) => {
    return (
      <View key={title}
            style={{flex: 1, marginBottom: 16}}>
        <Text style={{fontSize: 14, color: Colors.text.light}}>{title + '-' + subTitle}</Text>
        {
          canEdit ?
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
                inputCallBack && inputCallBack(text);
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

  const renderTask2 = (title?: string, subTitle?: string, canEdit?: boolean, defaultValue?: string, inputCallBack?: Function) => {
    return (
      <View key={title}
            style={styles.taskContent}>
        <Text style={{fontSize: 14, color: Colors.text.light}}>{title + '-' + subTitle}</Text>
        {
          canEdit ?
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
                inputCallBack && inputCallBack(text);
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

  const renderTask3 = (title?: string, subTitle?: string, canEdit?: boolean, selectedIndex?: number,  tValue?: number, fValue?: number, onPressCheckBox?: Function) => {
    return (
      <View key={title}
            style={styles.taskContent}>
        <Text style={{fontSize: 14, color: Colors.text.light}}>{title + '-' + subTitle}</Text>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Pressable disabled={!canEdit}
                     onPress={() => {
                       onPressCheckBox && onPressCheckBox(tValue);
                     }}
                     style={{flexDirection: 'row', alignItems: 'center', marginRight: 20}}>
            <Image
              source={selectedIndex == 0 ? require('../../../../../images/aaxiot/checkbox/check_box_selected.png') : require('../../../../../images/aaxiot/checkbox/check_box_normal.png')}/>
            <Text style={{fontSize: 13, color: Colors.text.light, marginLeft: 5}}>是</Text>
          </Pressable>
          <Pressable disabled={!canEdit}
                     onPress={() => {
                       onPressCheckBox && onPressCheckBox(fValue);
                     }}
                     style={{flexDirection: 'row', alignItems: 'center',}}>
            <Image
              source={selectedIndex == 1 ? require('../../../../../images/aaxiot/checkbox/check_box_selected.png') : require('../../../../../images/aaxiot/checkbox/check_box_normal.png')}/>
            <Text style={{fontSize: 13, color: Colors.text.light, marginLeft: 5}}>否</Text>
          </Pressable>
        </View>
      </View>
    )
  }

  const renderTask4 = (title?: string, subTitle?: string, result?: string,  canEdit?: boolean, dropdownOptions?: string[], onSelectCallBack?: Function) => {

    return (
      <View key={title}
            style={styles.taskContent}>
        <Text style={{fontSize: 14, color: Colors.text.light}}>{title + '-' + subTitle}</Text>
        {
          canEdit ?
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <ModalDropdown options={dropdownOptions}
                             style={{
                               width: 120,
                             }}
                             textStyle={{fontSize: 12, color: Colors.text.light, flex: 1, textAlign:'right', marginRight: 8}}
                             dropdownTextStyle={{fontSize: 14, color: Colors.text.primary, height: 44}}
                             dropdownStyle={{
                               // @ts-ignore
                               height: ((dropdownOptions?.length < 6) ? dropdownOptions?.length : 6) * 44
                             }}
                             adjustFrame={(position: any) => {
                               return {
                                 top: (position.top ?? 0) - 12,
                                 left: position.left,
                                 right: position.right
                               }
                             }}
                             onSelect={(index: number, value: string,)=>{
                               onSelectCallBack && onSelectCallBack(value, index);
                             }}
                             defaultValue={isEmptyString(result)? '请选择' : result}
                             defaultTextStyle={{fontSize: 14, color: Colors.text.light}}
                             dropdownListProps={{ListHeaderComponent: <></>}}
              />
              <Image
                source={require('../../../../../images/aaxiot/airBottle/arrow_right.png')}
                style={{marginRight: 8}}/>
            </View>
            :
            <Text style={{fontSize: 14, color: Colors.text.primary}}>{result}</Text>
        }
      </View>
    )
  }

  const renderRemarkContent = (maintainItem: MaintainNewItemsDataItem)=>{
    return (
      <View style={{}}>
        <Text style={styles.maintainSubText}>说明<Text style={{fontSize: 12, color:Colors.text.light}}> (选填)</Text></Text>
        {
          (props.canEdit && maintainItem.status != MaintainItemsNewStatus.view && maintainItem.status != MaintainItemsNewStatus.edit)
            ?
            <TextInput style={styles.textInput}
                       placeholder={'请输入'}
                       multiline={true}
                       maxLength={100}
                       onChangeText={(text) => {
                         props.tipsTextDidChange && props.tipsTextDidChange(text, maintainItem.id!, maintainItem.maintainType!)
                       }}
                       textAlignVertical={'top'}
                       defaultValue={maintainItem.remark}/>
            :
            <Text style={styles.textInputNoBorder}>{(maintainItem.remark ?? "-")}</Text>
        }
      </View>
    )
  }

  const renderItem = (maintainItem: MaintainNewItemsDataItem, index: number)=>{
    let canEdit =  (props.canEdit && maintainItem.status != MaintainItemsNewStatus.view && maintainItem.status != MaintainItemsNewStatus.edit);

    let taskContent = null;
    if (maintainItem.maintainType == 1){
      taskContent = renderTask1(maintainItem.maintainItem, maintainItem.maintainContent, canEdit, maintainItem.maintainResult, (text: string)=>{
        props.doResultCallBack && props.doResultCallBack(text, maintainItem.id!, maintainItem.maintainType!)
      });
    }else if (maintainItem.maintainType == 2){
      taskContent = renderTask2(maintainItem.maintainItem, maintainItem.maintainContent, canEdit, maintainItem.maintainResult, (text: string)=>{
        props.doResultCallBack && props.doResultCallBack(text, maintainItem.id!, maintainItem.maintainType!)
      });
    }else if (maintainItem.maintainType == 3){
      let selectedIndex = -1;
      let tValue = 0, fValue = 0;
      let contentValues = maintainItem.contentValue?.split(',');
      if (contentValues && contentValues.length > 0){
        tValue = Number(contentValues[0]);
        fValue = Number(contentValues[1]);
        if (maintainItem.maintainResult != undefined){
          if (maintainItem.maintainResult == contentValues[0]){
            ///选中的  是
            selectedIndex = 0
          }else {
            ///选中的否
            selectedIndex = 1
          }
        }
        if (maintainItem.selectedIndex != undefined){
          selectedIndex = maintainItem.selectedIndex;
        }
      }
      taskContent = renderTask3(maintainItem.maintainItem, maintainItem.maintainContent, canEdit, selectedIndex, tValue, fValue,(value: number)=>{
        props.doResultCallBack && props.doResultCallBack(value, maintainItem.id!, maintainItem.maintainType!)
      });
    }else if (maintainItem.maintainType == 4){
      let dropdownOptions : any[] = [];
      let contentValues = maintainItem.contentValue?.split(',');
      if (contentValues && contentValues.length > 0){
        for (let contentValue of contentValues) {
          dropdownOptions.push(contentValue);
        }
      }
      taskContent = renderTask4(maintainItem.maintainItem, maintainItem.maintainContent, maintainItem.maintainResult, canEdit, dropdownOptions, (value: string, index: number)=>{
        props.doResultCallBack && props.doResultCallBack(value, maintainItem.id!, maintainItem.maintainType!)
      });
    }

    return (
      <View key={index}
            style={{marginTop: 12}}>
        {index != 0 && <View style={{backgroundColor: Colors.border, height: 1,}}/>}
        {taskContent}
        {index != 0 && <View style={{backgroundColor: Colors.border, height: 1, marginBottom: 12}}/>}
        {renderRemarkContent(maintainItem)}
        {renderActions(maintainItem)}
      </View>
    )
  }

  /**
   * 操作按钮包裹内容
   * @param maintainItem
   */
  const renderActions = (maintainItem: MaintainNewItemsDataItem) => {
    if (maintainItem.status == MaintainItemsNewStatus.new) {
      return (
        <View style={styles.buttonContainer}>
          <Pressable style={styles.cancelPress}
                     onPress={() => {
                       props.saveCallBack && props.saveCallBack(maintainItem.id!);
                     }}>
            <Text style={{fontSize: 14, color: Colors.theme}}>保存</Text>
          </Pressable>
        </View>
      )
    } else if (maintainItem.status == MaintainItemsNewStatus.edit) {
      return (
        <View style={styles.buttonContainer}>
          <Pressable style={styles.cancelPress}
                     onPress={() => {
                       props.editCallBack && props.editCallBack(maintainItem.id!, maintainItem.maintainResult!, maintainItem.remark);
                     }}>
            <Text style={{fontSize: 14, color: Colors.theme}}>编辑</Text>
          </Pressable>
        </View>
      )
    } else if (maintainItem.status == MaintainItemsNewStatus.editing) {
      return (
        <View style={styles.buttonContainer}>
          <Pressable style={styles.cancelPress}
                     onPress={() => {
                       props.cancelCallBack && props.cancelCallBack(maintainItem.id!);
                     }}>
            <Text style={{fontSize: 14, color: Colors.theme}}>取消</Text>
          </Pressable>
          <Pressable style={styles.savePress}
                     onPress={() => {
                       props.saveCallBack && props.saveCallBack(maintainItem.id!);
                     }}>
            <Text style={{fontSize: 14, color: Colors.white}}>保存</Text>
          </Pressable>
        </View>
      )
    } else {
      return <></>
    }

  }

  /**
   * 保养项 集合
   * @param item
   * @param index
   */
  const renderMaintainItems = (item: MaintainNewItemsData, index: number) => {
    return (
      <View key={(item.title ?? '') + index} style={{marginBottom: 10}}>
        <Pressable style={styles.expendContainer}
                   onPress={() => {
                     props.taskExpandCallBack && props.taskExpandCallBack(item.projectId);
                   }}>
          <Text style={{fontSize: 14, color: Colors.text.primary}}>{item.title}</Text>
          <Image
            source={item.isExpand ? require('../../../../../images/aaxiot/plantOperation/maintain/arrow_down.png') : require('../../../../../images/aaxiot/plantOperation/maintain/arrow_up.png')}/>
        </Pressable>
        {
          item.isExpand && item.maintainItems?.map((maintainItem, index) => {
            return renderItem(maintainItem, index);
          })
        }
      </View>
    )
  }

  return (
    <ExpandHeader {...props} content={
      <View style={{paddingLeft: 15, paddingRight: 15}}>
        {props.data && props.data.map((obj, index: number) => {
          return renderMaintainItems(obj, index);
        })}
      </View>
    }/>
  )
}




const styles = StyleSheet.create({

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

  taskContent:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10
  },

  maintainSubText: {
    fontSize: 14,
    width: 100,
    color: Colors.text.light,
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

  textInputNoBorder: {
    fontSize: 14,
    color: Colors.text.primary,
    marginTop: 12,
    marginBottom: 6,
  },

})
