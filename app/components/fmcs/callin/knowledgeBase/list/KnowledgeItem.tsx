import React from "react";
import {Pressable, Text, View} from "react-native";
import Colors from "../../../../../utils/const/Colors";

export function KnowledgeItem(item: any, onPressItem?: Function) {

  return (
    <Pressable style={{paddingVertical: 10, marginTop: 8}}
               onPress={() => {
                 onPressItem && onPressItem(item)
               }}>
      <Text style={{fontSize: 13, color: Colors.text.primary, fontWeight: 'bold'}} numberOfLines={1}>{item.title}</Text>
      <View style={{flexDirection: 'row', marginTop: 12}}>
        <Text style={{fontSize: 13, color: Colors.text.sub, width: 60}}>专业</Text>
        <Text style={{fontSize: 13, color: Colors.text.primary, fontWeight: 'bold', flex: 1}} numberOfLines={1}>{item.specialty}</Text>
      </View>
      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: item.separatorLine ? 0 : 5}}>
        <View style={{flexDirection: 'row', marginTop: 12, flex: 1}}>
          <Text style={{fontSize: 13, color: Colors.text.sub, width: 60}}>关键字</Text>
          <Text style={{fontSize: 13, color: Colors.text.primary, fontWeight: 'bold', flex: 1}} numberOfLines={1}>{item.keywords}</Text>
        </View>
        <View
          style={{flexDirection: 'row', marginTop: 12, flex: 0.5, alignItems: 'center', justifyContent: 'flex-end'}}>
          <Text style={{fontSize: 13, color: Colors.text.sub, marginRight: 12, width: 60}}>创建人</Text>
          <Text style={{fontSize: 13, color: Colors.text.primary, fontWeight: 'bold', flex: 1}} numberOfLines={1}>{item.creator}</Text>
        </View>
      </View>
      {
        item.separatorLine ?
          <View style={{position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: Colors.border}}/>
          :
          <View style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, backgroundColor: Colors.border}}/>
      }

    </Pressable>
  )
}

