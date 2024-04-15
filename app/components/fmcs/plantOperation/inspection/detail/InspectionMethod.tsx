import React from "react";
import {Modal, View, Text, Pressable, Image} from "react-native";
import Colors from "../../../../../utils/const/Colors";

export enum ActionSheetType {
  inspectionMeth,///巡检方式
  NFC, ///NFC刷卡
}

export interface InspectionMethodProps {
  title?: string,
  actionSheetType: ActionSheetType,
  visible: boolean,///是否可见 ture: 展示actionSheet, false 不展示
  onPressItem?: Function, ///点击行回调
  onPressCancel?: Function, ///点击取消回调
}

export function InspectionActionSheet(props: InspectionMethodProps) {
  return (
    <Modal visible={props.visible} animationType={'fade'} transparent={true}>
      {props.actionSheetType == ActionSheetType.inspectionMeth ? InspectionMethod(props) : NFC(props)}
    </Modal>
  )
}

/**
 * 巡检方式
 * @param props
 * @constructor
 */
function InspectionMethod(props: InspectionMethodProps) {

  const renderItem = (imageName: any, title: string, subTitle: string, onPress: ()=>void) => {
    return (
      <Pressable onPress={onPress} style={{
        backgroundColor: '#fafafa',
        borderRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 25,
        paddingVertical: 25,
        marginBottom: 15
      }}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View style={{backgroundColor:'#10357e', padding: 10, borderRadius: 4}}>
            <Image source={imageName} style={{ width: 30, height: 30}}/>
          </View>

          <View style={{justifyContent: 'center', marginLeft: 12}}>
            <Text style={{fontSize: 15, color: Colors.text.primary}}>{title}</Text>
            <Text style={{fontSize: 12, color: Colors.text.light, marginTop: 8}} numberOfLines={2}>{subTitle}</Text>
          </View>
        </View>
        <Image source={require('../../../../../images/aaxiot/airBottle/arrow_right.png')}/>
      </Pressable>
    )
  }

  return (
    <View style={{flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.45)'}}>
      <View style={{width: '100%', borderTopRightRadius: 8, borderTopLeftRadius: 8, backgroundColor: 'white'}}>
        <View style={{paddingHorizontal: 25}}>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20}}>
            <Text style={{fontSize: 15, color: Colors.text.primary}}>{props.title + '方式'}</Text>
          </View>
          {renderItem(require('../../../../../images/aaxiot/plantOperation/inspection/inspect_credit_card.png'),'刷卡开始', '如果您在设备旁,建议刷卡开始', ()=>{
            props.onPressItem && props.onPressItem(0);
          })}
          {renderItem(require('../../../../../images/aaxiot/plantOperation/inspection/inspect_direct.png'),'直接开始', `如果无法刷卡，可直接开始${props.title}，以此方式完成的${props.title}将被记录为异常`, ()=>{
            props.onPressItem && props.onPressItem(1);
          })}
        </View>

        <Pressable onPress={() => {
          props.onPressCancel && props.onPressCancel();
        }}
                   style={{
                     alignItems: 'center',
                     justifyContent: 'center',
                     paddingVertical: 15,
                     marginTop: 10,
                     borderTopWidth: 1,
                     borderTopColor: Colors.gray.primary
                   }}>
          <Text style={{fontSize: 18, color: Colors.theme}}>取消</Text>
        </Pressable>
      </View>
    </View>
  )
}

/**
 * NFC刷卡
 * @param props
 * @constructor
 */
function NFC(props: InspectionMethodProps) {
  return (
    <View style={{flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.45)'}}>
      <View style={{width: '100%', borderTopRightRadius: 8, borderTopLeftRadius: 8, backgroundColor: 'white'}}>
        <View style={{alignItems: 'center', justifyContent: 'center', paddingVertical: 20}}>
          <Image source={require('../../../../../images/aaxiot/plantOperation/inspection/nfc.gif')}
                 style={{width: 250, height: 250}}/>
          <Text style={{fontSize: 15, color: Colors.text.primary, marginTop: 10}}>请将设备靠近NFC标签</Text>
        </View>
        <Pressable onPress={() => {
          props.onPressCancel && props.onPressCancel();
        }}
                   style={{
                     alignItems: 'center',
                     justifyContent: 'center',
                     paddingVertical: 15,
                     marginTop: 10,
                     borderTopWidth: 1,
                     borderTopColor: Colors.gray.primary
                   }}>
          <Text style={{fontSize: 18, color: Colors.theme}}>取消</Text>
        </Pressable>
      </View>
    </View>
  )
}
