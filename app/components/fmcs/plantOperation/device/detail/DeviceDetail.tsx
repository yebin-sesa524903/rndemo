import React, { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Colors from "../../../../../utils/const/Colors";
import Icon from "../../../../Icon";
import { getBaseUri, getImageHost, HEADERDEVICEID, JWTTOKENHEADER, TOKENHEADER } from "../../../../../middleware/api";
import storage from "../../../../../utils/storage";
// @ts-ignore
import Loading from '../../../../Loading';
import { localStr } from "../../../../../utils/Localizations/localization";
import { getStatusInfo } from "../list/DeviceListItem";
import { getImageUrlByKey } from "../../../../../containers/fmcs/plantOperation/utils/Utils";


function RenderFileList(props: any) {
  if (!props.documents||props.documents.length===0) return null;
  return (
    <View style={{
      borderRadius: 12,
      backgroundColor: Colors.theme, margin: 16,
    }}>

      <View style={{
        borderRadius: 12,
        backgroundColor: Colors.background.white,
        marginTop: 4,
        marginHorizontal: -1,
        padding: 16
      }}>
        <Text style={{
          color: Colors.text.primary,
          fontSize: 16,
          fontWeight: '600',
          marginBottom: 8
        }}>{localStr('lang_asset_file')}</Text>
        {
          props.documents.map((item: any, index: number) => {
            let borderWidth=index===props.documents.length-1? 0:1;
            return (
              <Pressable key={index} onPress={() => props.onPressFile(item)}>
                <View style={{
                  flexDirection: 'row',
                  paddingVertical: 13, paddingBottom: borderWidth? 13:0,
                  borderBottomColor: Colors.background.light,
                  borderBottomWidth: borderWidth,
                  alignItems: 'center'
                }}>
                  {/*<Icon font={'icomoon'} type={getFileIcon(item.fileName)} color={Colors.theme} size={36}/>*/}
                  <Image resizeMode={'contain'} source={getFileIcon(item.fileName)}
                    style={{ width: 30, height: 30 }} />
                  <View style={{ marginLeft: 16, flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        color: Colors.text.primary,
                        marginRight: 10
                      }}>{item.fileName}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{
                        fontSize: 12,
                        color: Colors.text.light,
                      }}>{`${item.formatTime}`}</Text>
                      <View style={{
                        width: 4,
                        height: 4,
                        marginHorizontal: 6,
                        borderRadius: 2,
                        backgroundColor: Colors.text.light
                      }} />
                      <Text style={{
                        fontSize: 12,
                        color: Colors.text.light,
                      }}>{`${item.displaySize}`}</Text>
                    </View>

                  </View>

                </View>
              </Pressable>
            )
          })
        }
      </View>
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

function getFileIcon(name: string) {
  let ext=name.substr(name.lastIndexOf('.')+1);
  if (ext) ext=ext.toLowerCase();
  console.log('name,', name, ext);
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
      backgroundColor: Colors.seBrandNomarl, margin: 16, marginBottom: 0,
    }}>
      <View style={{
        borderRadius: 12,
        backgroundColor: Colors.seBgContainer,
        marginTop: 4,
        marginHorizontal: -1,
        padding: 16
      }}>
        <Text style={{
          color: Colors.seTextPrimary,
          fontSize: 16,
          fontWeight: '600',
          marginBottom: 8
        }}>{props.title}</Text>
        {
          props.data.map((item: any, index: number) => {
            let borderWidth=index===props.data.length-1? 0:1;
            return (
              <View key={index} style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 13, paddingBottom: borderWidth? 13:0,
                borderBottomColor: Colors.seBorderSplit,
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
    </View>

  )
}

function RenderHeader(props: any) {
  const statusInfo=getStatusInfo(props.deviceStatus);
  return (
    <View style={{ backgroundColor: Colors.seBgColor, padding: 16, marginTop: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.seBrandNomarl, marginRight: 4, marginTop: 4 }}></View>
        <Text style={{ fontSize: 12, color: Colors.seTextPrimary }}>{`${localStr('lang_asset_location')}：${props.displayHierarchy}`}</Text>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 20 }}>
        <View style={{
          width: 150, height: 100, borderWidth: 1, alignItems: 'center', justifyContent: 'center',
          borderColor: Colors.seBorderSplit, marginRight: 20, borderRadius: 4
        }}>
          {props.logo?
            <Image source={{ uri: props.logo }} resizeMode={'contain'}
              style={{ width: 150, height: 100 }} />:
            <Image source={require('../../../../../images/document_list/placeholder.png')} resizeMode={'cover'}
              style={{ width: 150, height: 100 }} />
          }
        </View>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: Colors.seTextPrimary, fontSize: 12, marginBottom: 3 }}>{localStr('lang_asset_name')}</Text>
            <Text numberOfLines={1} style={{ color: Colors.seTextSecondary, fontSize: 14 }}>{props.name}</Text>
            <Text style={{ color: Colors.seTextPrimary, fontSize: 12, marginTop: 20, marginBottom: 3 }}>{localStr('lang_asset_code')}</Text>
            <Text numberOfLines={1} style={{ color: Colors.seTextSecondary, fontSize: 14 }}>{props.code}</Text>
          </View>
          <View>
            {
              !statusInfo? null:
                <View style={{
                  backgroundColor: statusInfo.bgColor, borderRadius: 4, borderWidth: 1,
                  borderColor: statusInfo.borderColor, height: 22, alignItems: 'center', justifyContent: 'center', paddingLeft: 8, paddingRight: 8
                }}>
                  <Text style={{ fontSize: 12, color: statusInfo.textColor }}>{`${statusInfo.label}`}</Text>
                </View>
            }
          </View>


        </View>
      </View>

    </View>
  )
}

export default function (props: any) {
  if (props.isFetching||props.isFetching===null) return <Loading />

  const getDeviceLogo=() => {
    let logo=null;//
    try {
      logo=getImageUrlByKey(props.data.logo);
      return logo;
    } catch (e) {
      return logo;
    }
  }

  return (
    <View style={{ flex: 1, paddingBottom: 16 }}>
      <ScrollView>
        <RenderHeader onPressImage={props.onPressImage} name={props.data?.name} code={props.data?.code}
          displayHierarchy={props.displayHierarchy} images={props.images}
          deviceStatus={props.deviceStatus}
          logo={getDeviceLogo()} displayName={props.data?.displayName} />
        <RenderGroup title={localStr('lang_asset_basic_info')} data={props.deviceInfo} />
        <RenderGroup title={localStr('lang_asset_parameters')} data={props.params} />
        <RenderFileList documents={props.documents} onPressFile={props.onPressFile} />
      </ScrollView>
    </View>
  )
}
