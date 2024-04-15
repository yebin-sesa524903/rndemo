import React, { } from "react";
import { Image, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Colors from "../../../../../utils/const/Colors";
import Icon from "../../../../Icon";
// @ts-ignore
import Loading from '../../../../Loading';
import { getImageUrlByKey } from "../../../../../containers/fmcs/plantOperation/utils/Utils";


function RenderFileList(props: any) {
  return (
    <View style={{
      borderRadius: 12,
      backgroundColor: Colors.seBgLayout,
      marginTop: 4,
      marginHorizontal: -1,
      paddingTop: 16,
    }}>
      <Text style={{
        color: Colors.seTextPrimary,
        fontSize: 16,
        fontWeight: '600', paddingLeft: 16,
        marginBottom: 8
      }}>{props.name}</Text>
      {
        props.data.map((file, index) => {
          if (!file.file) return []
          return file.file.map((file) => (
            <Pressable key={file.key} onPress={() => props.onPressFile(file)}>
              <View style={{
                flexDirection: 'row', backgroundColor: Colors.seBgContainer, paddingVertical: 8,
                borderBottomColor: Colors.seBorderSplit, paddingHorizontal: 16,
                borderBottomWidth: 1,
                alignItems: 'center'
              }}>
                <Image resizeMode={'contain'} source={getFileIcon(file.name, file.key)}
                  style={{ width: 48, height: 48 }} />
                <Text style={{
                  fontSize: 16, flex: 1,
                  color: Colors.text.primary,
                  marginLeft: 10
                }}>{file.name}</Text>

              </View>
            </Pressable>
          ))
        })
      }

    </View>
  )

}

const file_ext=[
  require('../../../../../images/document_list/doc.png'),
  require('../../../../../images/document_list/txt.png'),
  require('../../../../../images/document_list/ppt.png'),
  require('../../../../../images/document_list/exc.png'),
  require('../../../../../images/document_list/pdf1.png'),
]

function isImageFile(ext) {
  return ['png', 'jpg', 'jpeg', 'bmp', 'webp'].includes(ext)
}

function getFileIcon(name: string, key) {
  let ext=name.substr(name.lastIndexOf('.')+1);
  if (ext) ext=ext.toLowerCase();
  console.log('name,', name, ext);
  if (isImageFile(ext)) return { uri: getImageUrlByKey(key) }
  switch (ext) {
    case 'doc':
    case 'docx':
      return file_ext[0]//'moon_icon-file-doc';
    case 'pdf':
      return file_ext[4]//'moon_icon-file-pdf';
    case 'xls':
    case 'xlsx':
      return file_ext[3]//'moon_icon-file-xls'
    case 'ppt':
    case 'pptx':
      return file_ext[2]//'moon_icon-file-ppt';
    case 'txt':
      return file_ext[1]//'moon_icon-file-txt';
  }
  return file_ext[1]//'moon_icon-file-txt'
}

function RenderGroup(props: any) {
  if (!props.data||props.data.length===0) return null;
  return (
    <View style={{
      borderRadius: 12,
      backgroundColor: Colors.seBgLayout,
      marginTop: 4,
      marginHorizontal: -1,
      paddingTop: 16,
    }}>
      <Text style={{
        color: Colors.seTextPrimary,
        fontSize: 16,
        fontWeight: '600', paddingLeft: 16,
        marginBottom: 8
      }}>{props.title}</Text>
      {
        props.data.map((item: any, index: number) => {
          let borderWidth=index===props.data.length-1? 0:1;
          return (
            <View key={index} style={{
              flexDirection: 'row', paddingHorizontal: 16,
              justifyContent: 'space-between',
              paddingVertical: 13, paddingBottom: borderWidth? 13:13,
              borderBottomColor: Colors.seBorderSplit,
              backgroundColor: Colors.seBgContainer,
              borderBottomWidth: borderWidth,
              alignItems: 'center'
            }}>
              <Text
                style={{ fontSize: 15, maxWidth: 140, color: Colors.seTextSecondary, marginRight: 10 }}>{item.name}</Text>
              <Text style={{
                fontSize: 15,
                color: Colors.seTextDisabled,
                flex: 1,
                textAlign: 'right'
              }}>{item.value||'--'}</Text>
            </View>
          )
        })
      }
    </View>

  )
}

function RenderHeader(props: any) {
  if (!props.showLogo) return null;
  if (props.logo.loading) {
    return (
      <View style={{ width: '100%', height: 300 }}>
        <Loading />
      </View>
    )
  }
  if (!props.logo.logo) {
    return (
      <View style={{ width: '100%', height: 300 }}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={props.addImage}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Icon type="icon_add" color={Colors.seTextPrimary} size={60} />
            <Text style={{ color: Colors.seTextPrimary }}>{'添加一张资产图片'}</Text>
          </View>

        </TouchableOpacity>
      </View>
    )
  } else {
    return (
      <TouchableOpacity onPress={props.addImage}>
        <Image source={{ uri: getImageUrlByKey(props.logo.logo) }} resizeMode={'contain'}
          style={{ width: '100%', height: 300 }} />
      </TouchableOpacity>

    )
  }
}

export default function (props: any) {
  if (props.isFetching||props.isFetching===null) return <Loading />
  return (
    <View style={{ flex: 1, paddingBottom: 16, backgroundColor: Colors.seBgLayout }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <RenderHeader showLogo={props.logoEdit} logo={props.logo} addImage={props.addImage} />
        {
          props.groups.map(item => {
            if (item.isFiles) {
              return (
                <RenderFileList {...item} onPressFile={props.onPressFile} />
              )
            }
            return (
              <RenderGroup title={item.name} data={item.data} />
            )
          })
        }
      </ScrollView>
    </View>
  )
}
