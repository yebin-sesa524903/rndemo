
import {Image, Pressable, Text, View} from "react-native";
import Colors from "../../../../../utils/const/Colors";
import React from "react";
import NetworkDocumentCard from "../../../../NetworkDocumentCard";
import Immutable from 'immutable';

export interface KnowledgeFileUploadProps {
  icon?: any,
  title?: string,
  files?: {
    id?: number,
    name?: string,
    path?: string,
  }[]
}

export function KnowledgeFileUpload(props: KnowledgeFileUploadProps) {
  const renderFileInfo = (file: { id?: number; name?: string; path?: string })=>{
    return (
      <View style={{backgroundColor: Colors.white}}>
        <NetworkDocumentCard
          item={
            Immutable.fromJS({
                FileName: file.name,
                PictureId: file.path,
              }
            )}
          index={0}
          forceStoped={false}
          onLongPress={() => {
          }}
          imageHeight={20}
          imageWidth={20}/>
      </View>
    )
  }
  return (
    <View style={{borderRadius: 5, backgroundColor: 'white', marginLeft: 10, marginRight: 10, marginTop: 12}}>
      <View style={{
        flexDirection: 'row',
        height: 44,
        paddingLeft: 15,
        paddingRight: 15,
        alignItems: 'center',
      }}>
        <Image source={props.icon} style={{width: 15, height: 15, marginRight: 6}}/>
        <Text style={{fontWeight: 'bold', fontSize: 15, color: Colors.text.primary}}>{props.title}</Text>
      </View>
      {
        props.files?.map((file)=>{
          return renderFileInfo(file);
        })
      }
    </View>
  )
}
