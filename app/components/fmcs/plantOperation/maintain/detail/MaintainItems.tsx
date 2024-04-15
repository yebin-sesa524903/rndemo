import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import {MaintainDetailItemType} from "../../defined/ConstDefined";
import Colors from "../../../../../utils/const/Colors";
import {ExpandHeader, ExpandHeaderProps} from "../../components/ExpandHeader";

export interface MaintainItemsProps extends ExpandHeaderProps {
  sectionType?: MaintainDetailItemType,///item 类型
  data?: MaintainItemsData[],
  canEdit?: boolean,
  taskExpandCallBack?: Function,///展开按钮点击
  resultsTextDidChange?: (text: string, id: string) => void,    ///保养结果输入回调
  tipsTextDidChange?: (text: string, id: string) => void, ///保养说明输入回调
  cancelCallBack?: (id: string) => void, ///取消点击
  saveCallBack?: (id: string) => void,    ///保存点击
  editCallBack?: (id: string, result: string, remark?: string) => void,    ///编辑按钮点击
}

/**
 * 保养项目 data
 */
export interface MaintainItemsData {
  projectId?: string,
  title?: string, ///保养项目名称
  isExpand?: boolean,///是否展开
  maintainItems?: MaintainItemsDataItem[]
}

export interface MaintainItemsDataItem {   ///保养内容 数组
  id?: string,
  status?: MaintainItemsStatus,
  maintainItem?: string,///保养项
  maintainContent?: string, ///保养内容
  result?: string,///保养说明
  remark?: string,///保养说明
}

export enum MaintainItemsStatus {
  new = 1111,  ///新建    ///只有保存按钮
  edit,   ///可编辑态 只显示编辑按钮
  editing,///正在编辑态    显示取消/保存按钮
  view///查看 不显示操作
}

/**
 * 保养详情 保养项 item
 * @param props
 * @constructor
 */
export function MaintainItems(props: MaintainItemsProps) {
  /**
   * 保养项 item
   * @param maintainItem
   * @param index
   */
  const renderItem = (maintainItem: MaintainItemsDataItem, index: number) => {
    return (
      <View key={(maintainItem.maintainContent ?? '') + index}>
        {(index > 0) && <View style={styles.lineView}/>}
        <View style={styles.maintainItemContainer}>
          <Text style={styles.maintainText}>保养项</Text>
          <Text style={styles.maintainValueText}>{maintainItem.maintainItem}</Text>
        </View>
        <View style={styles.lineView}/>
        <View style={styles.maintainItemContainer}>
          <Text style={styles.maintainSubText}>保养内容</Text>
          <Text style={styles.maintainValueText}>{maintainItem.maintainContent}</Text>
        </View>
        <View style={styles.lineView}/>
        <View style={styles.inputContainer}>
          <Text style={styles.maintainSubText}>保养结果</Text>
          {
            (props.canEdit && maintainItem.status != MaintainItemsStatus.view && maintainItem.status != MaintainItemsStatus.edit)
              ?
              <TextInput style={styles.textInput}
                         placeholder={'请输入'}
                         multiline={true}
                         maxLength={100}
                         onChangeText={(text) => {
                           props.resultsTextDidChange && props.resultsTextDidChange(text, maintainItem.id!);
                         }}
                         textAlignVertical={'top'}
                         defaultValue={maintainItem.result}/>
              :
              <View style={{borderBottomWidth: 1, borderBottomColor: Colors.border, paddingBottom: 12}}>
                <Text style={styles.textInputNoBorder}>{(maintainItem.result ?? '-')}</Text>
              </View>

          }
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.maintainSubText}>说明</Text>
          {
            (props.canEdit && maintainItem.status != MaintainItemsStatus.view && maintainItem.status != MaintainItemsStatus.edit)
              ?
              <TextInput style={styles.textInput}
                         placeholder={'请输入'}
                         multiline={true}
                         maxLength={100}
                         onChangeText={(text) => {
                           props.tipsTextDidChange && props.tipsTextDidChange(text, maintainItem.id!);
                         }}
                         textAlignVertical={'top'}
                         defaultValue={maintainItem.remark}/>
              :
              <Text style={styles.textInputNoBorder}>{(maintainItem.remark ?? "-")}</Text>
          }
        </View>
        {
          (props.canEdit && maintainItem.status != MaintainItemsStatus.view) &&
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: 50
          }}>
            <Text style={{fontSize: 13, color: Colors.text.light}}>操作</Text>
            {renderActions(maintainItem)}
          </View>
        }
      </View>
    )
  }

  /**
   * 操作按钮包裹内容
   * @param maintainItem
   */
  const renderActions = (maintainItem: MaintainItemsDataItem) => {
    if (maintainItem.status == MaintainItemsStatus.new) {
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
    } else if (maintainItem.status == MaintainItemsStatus.edit) {
      return (
        <View style={styles.buttonContainer}>
          <Pressable style={styles.cancelPress}
                     onPress={() => {
                       props.editCallBack && props.editCallBack(maintainItem.id!, maintainItem.result!, maintainItem.remark);
                     }}>
            <Text style={{fontSize: 14, color: Colors.theme}}>编辑</Text>
          </Pressable>
        </View>
      )
    } else if (maintainItem.status == MaintainItemsStatus.editing) {
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
  const renderMaintainItems = (item: MaintainItemsData, index: number) => {
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
  maintainItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 12,
  },

  inputContainer: {
    paddingTop: 12,
    // paddingBottom: 12
  },

  maintainText: {
    fontSize: 14,
    width: 100,
    color: Colors.text.primary,
  },
  maintainValueText: {
    fontSize: 14,
    marginLeft: 10,
    color: Colors.text.primary,
  },
  maintainSubText: {
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

  textInputNoBorder: {
    fontSize: 14,
    color: Colors.text.primary,
    marginTop: 12,
    marginBottom: 6,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  }

})
