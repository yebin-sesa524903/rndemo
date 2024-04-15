import React from "react";
import {Image, Pressable, StyleSheet, Text, TextInput, View} from "react-native";
import {ExpandHeader, ExpandHeaderProps} from "../../plantOperation/components/ExpandHeader";
import Colors from "../../../../utils/const/Colors";
import {CallInOrderStatus} from "../../../../containers/fmcs/callin/callTicket/detail/CallInHelper";
import UploadImage, {UploadType} from "../../uploadImage/UploadImage";

export interface CallInOrderMsgProps extends ExpandHeaderProps {
  orders?: CallInOrderItem[],
  onPressSeeMore?: Function,///查看明细
  contentTextChangeCallBack?: Function, ///课室处理内容 文字变化
  addImageCallBack?: Function,  ///添加图片
  removeImageCallBack?: Function, ///删除图片点击
  previewImageAction?: Function,  ///图片预览点击
}

export interface CallInOrderItem {
  orderId?: string,
  subOrderId?: string,
  canEdit?: boolean,
  department?: string,///课室名
  handel?: string, ///处理人
  status?: CallInOrderStatus,    ///状态 未开始/执行中/已完成
  statusString?: string,///当前状态文字
  contact?: string,///联系人
  tel?: string,   ///联系人电话
  content?: string,   ///工单处理内容
  pictures?: CallInOrderPicture[],    ///图片集合
  files?: [], ///接口返回的图片集合
}


export interface CallInOrderPicture {
  id?: number,
  uri: string, ///图片地址 file://user/...
  name: string, ///图片名称
  file?: string,  ///接口返回的 file格式 "230406/1680749990328_rn_image_picker_lib_temp_b96f9f11-9124-42ca-8b18-c61d5a54a941.jpg"
  subOrderId?: string, ///上传要用到
  needUpload?: boolean ///是否需要上传
  canRemove?: boolean,    ///是否可以删除, 需要上传但是没有上传成功 不可删除
  uploadComplete?: Function   ///上传结束回调  返回上传是否成功
}

export function CallInOrderMsg(props: CallInOrderMsgProps) {

  const renderOrderContent = () => {
    return (
      <View style={{paddingHorizontal: 15}}>
        {
          props.orders?.map((item, index) => {
            return (
              <View key={index}
                    style={{paddingVertical: 10}}>
                {/*课室*/}
                {renderDepartmentHeader(item)}
                {/*处理人*/}
                {renderHandle(item)}
                {/*联系人*/}
                {/*{renderContact(item)}*/}
                {/*  处理内容*/}
                {renderContent(item)}
                {/*  图片信息*/}
                {renderImages(item)}
              </View>
            )
          })
        }
      </View>

    )
  }

  /**
   * 课室信息
   * @param item
   */
  const renderDepartmentHeader = (item: CallInOrderItem) => {
    return (
      <View style={styles.headerContainer}>
        <Text style={{fontSize: 14, color: Colors.text.primary}}>{item.department}</Text>
      </View>
    )
  }

  /**
   * 处理人
   * @param item
   */
  const renderHandle = (item: CallInOrderItem) => {
    return (
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 49}}>
        <View style={{flexDirection: 'row'}}>
          <Text style={{fontSize: 14, color: Colors.text.primary, width: 100}}>处理人</Text>
          <Text style={{fontSize: 14, color: Colors.text.primary}}>{item.handel}</Text>
        </View>
        <View style={{
          backgroundColor: item.canEdit ? '#2254B70F' : '#5257621F',
          borderRadius: 3,
          paddingHorizontal: 9,
          paddingVertical: 3
        }}>
          <Text style={{
            fontSize: 12,
            color: item.canEdit ? Colors.theme : Colors.text.sub
          }}>{item.statusString}</Text>
        </View>
        <View style={styles.lineView}/>
      </View>
    )
  }

  /**
   * 联系人
   * @param item
   */
  const renderContact = (item: CallInOrderItem) => {
    return (
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 49}}>
        <View style={{flexDirection: 'row'}}>
          <Text style={{fontSize: 13, color: Colors.text.light, width: 100}}>联系人</Text>
          <Text style={{fontSize: 14, color: Colors.text.primary}}>{item.contact}</Text>
        </View>
        <Text style={{fontSize: 13, color: Colors.theme, textDecorationLine: 'underline'}}>{item.tel}</Text>
        <View style={styles.lineView}/>
      </View>
    )
  }

  /**
   * 课室处理内容
   * @param item
   */
  const renderContent = (item: CallInOrderItem) => {
    let itemTitle = `${item.department}处理内容`;
    return (
      <View style={{}}>
        {
          item.canEdit ?
            <View style={{paddingVertical: 5}}>
              <View style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 10}}>
                <Text style={{fontSize: 14, color: Colors.red.primary}}>*</Text>
                <Text
                  style={{fontSize: 14, color: Colors.text.primary, width: 100}}>{`${item.department}处理内容`}</Text>
              </View>
              <TextInput onChangeText={(text) => {
                props.contentTextChangeCallBack && props.contentTextChangeCallBack(text);
              }}
                         defaultValue={item.content}
                         style={{
                           fontSize: 14,
                           color: Colors.text.primary,
                           height: 80,
                           textAlignVertical: 'top',
                           borderWidth: 1,
                           borderColor: Colors.border,
                           borderRadius: 2
                         }} placeholder={'请输入'}/>
            </View>
            :
            <View style={{paddingVertical: 5}}>
              <View style={{flexDirection: 'row', paddingVertical: 8}}>
                <Text style={{fontSize: 13, color: Colors.text.light, width: 100}} numberOfLines={1}>{itemTitle}</Text>
                <Pressable style={{alignItems: 'center', flexDirection: 'row'}}
                           onPress={() => {
                             props.onPressSeeMore && props.onPressSeeMore(itemTitle, item.content)
                           }}>
                  <Text
                    style={{fontSize: 13, color: Colors.theme, textDecorationLine: 'underline'}}>查看明细</Text>
                </Pressable>
              </View>
              <Text style={{fontSize: 14, color: Colors.text.primary, flex: 1, marginBottom: 12, marginTop: 12}}
                    numberOfLines={2}>{item.content}</Text>
              <View style={styles.lineView}/>
            </View>
        }
      </View>
    )
  }

  const renderImages = (item: CallInOrderItem) => {
    return (
      <View style={{}}>
        <View style={{flexDirection: 'row', paddingVertical: 12, alignItems: 'center'}}>
          <Image source={require('../../../../images/aaxiot/callin/picture.png')}/>
          <Text style={{
            fontSize: 15,
            color: Colors.text.primary,
            fontWeight: 'bold',
            marginLeft: 5
          }}>{`${item.department}图片`}</Text>
        </View>
        <Pressable style={{flexDirection: 'row', justifyContent: 'space-between'}}
                   disabled={!item.canEdit}
                   onPress={() => {
                     props.addImageCallBack && props.addImageCallBack(item);
                   }}>
          <View style={{flexDirection: 'row',}}>
            <Text style={{
              fontSize: 14,
              color: Colors.text.primary,
              fontWeight: '500',
            }}>{item.canEdit ? `已上传${item.pictures?.length}张图片` : '图片附件'}</Text>
          </View>
          {item.canEdit &&
            <Image source={require('../../../../images/aaxiot/airBottle/add_pic.png')}
                   style={{marginRight: 5}}/>}
        </Pressable>
        {
          (item.canEdit)
            ?
            <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
              {
                item.pictures?.map((image, index) => {
                  let defaultSource = require('../../../../images/aaxiot/callin/image_placeholder.png');
                  return (
                    <Pressable key={(image.file ?? '') + (image.name ?? '')}
                               onPress={() => {
                                 props.previewImageAction && props.previewImageAction(index, item);
                               }}>
                      {
                        image.needUpload ?
                          <UploadImage uploadType={UploadType.callIn}
                                       uri={image.uri}
                                       name={image.name}
                                       subOrderId={image.subOrderId}
                                       style={{
                                         marginRight: 15,
                                         borderRadius: 5,
                                         marginTop: 10,
                                       }}
                                       loadComplete={(imageResponse: any) => {
                                         image.uploadComplete && image.uploadComplete(imageResponse, item);
                                       }}
                          />
                          :
                          <Image source={{uri: image.uri}}
                                 defaultSource={defaultSource}
                                 style={{
                                   width: 80,
                                   height: 80,
                                   marginRight: 15,
                                   borderRadius: 5,
                                   marginTop: 10,
                                 }}/>
                      }
                      {
                        image.canRemove &&
                        <Pressable
                          style={{position: 'absolute', right: 5, top: 0, padding: 5}}
                          onPress={() => {
                            props.removeImageCallBack && props.removeImageCallBack(image, item);
                          }}>
                          <Image
                            source={require('../../../../images/aaxiot/searchBar/clear.png')}
                            style={{
                              backgroundColor: Colors.background.primary,
                              width: 14,
                              height: 14,
                              borderRadius: 7,
                            }}/>
                        </Pressable>
                      }
                    </Pressable>
                  )
                })
              }
            </View>
            :
            <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
              {
                item.pictures?.map((image, index) => {
                  let defaultSource = require('../../../../images/aaxiot/callin/image_placeholder.png');
                  return (
                    <Pressable key={(image.file ?? '') + (image.name ?? '')}
                               onPress={() => {
                                 props.previewImageAction && props.previewImageAction(index, item);
                               }}>
                      <Image source={{uri: image.uri}}
                             defaultSource={defaultSource}
                             style={{
                               width: 80,
                               height: 80,
                               marginRight: 15,
                               borderRadius: 5,
                               marginTop: 10,
                             }}/>
                    </Pressable>
                  )
                })
              }
            </View>
        }
      </View>
    )
  }

  return (
    <ExpandHeader {...props} content={renderOrderContent()}/>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
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
  lineView: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 0.5,
    backgroundColor: Colors.gray.primary
  }
})
