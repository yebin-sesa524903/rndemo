import React from 'react'
import {
  Image, Pressable,
  TextInput,
  View,
  Text,
} from 'react-native';
import Colors, { isDarkMode } from "../../../../../utils/const/Colors";
import { Icon } from "@ant-design/react-native";

export interface SearchBarProps {
  ///输入框的 引用
  textInputRef?: any;
  ///占位文字
  placeholder?: string;
  ///输入回调
  onSearchTextChange?: Function;
  ///输入框文字
  value?: string;
  ///扫描点击
  onPressScan?: Function;
  ///重置筛选条件
  onPressReset?: Function;
  ///搜索点击
  onPressSearch?: Function;
  ///清除按钮点击
  onPressClear?: Function;
  ///是否隐藏 scan 扫一扫按钮
  isHiddenScan?: boolean;
  ///是否不可点击 true不可编辑  false 可编辑
  isDisables?: boolean;
}


export default function SearchBar(props: SearchBarProps) {
  const [showClear, setShowClear]=React.useState(false);
  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingLeft: 12,
      paddingRight: 12,
      backgroundColor: Colors.seBgContainer,
      alignItems: 'flex-end',
      height: 48,
      flex: 1,
    }}>
      <View style={{
        flexDirection: 'row',
        backgroundColor: Colors.seFill3,
        alignItems: 'center',
        flex: 1,
        height: 38,
        paddingLeft: 15,
        paddingRight: 15,
        borderRadius: 6,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Image source={isDarkMode()? require('../../../../../images/aaxiot/searchBar/search_dark.png'):require('../../../../../images/aaxiot/searchBar/search.png')} style={{ width: 16, height: 16 }} />
          <TextInput ref={props.textInputRef}
            placeholder={props.placeholder}
            //clearButtonMode={'while-editing'}
            onChangeText={(text) => {
              props.onSearchTextChange&&props.onSearchTextChange(text)
            }}
            editable={!props.isDisables}
            keyboardType={'web-search'}
            returnKeyType={'search'}
            onFocus={() => {
              setShowClear(true);
            }}
            //  onEndEditing={() => {
            //      setShowClear(false);
            //      props.onPressSearch && props.onPressSearch();
            //  }}
            onSubmitEditing={() => {
              setShowClear(false);
              props.onPressSearch&&props.onPressSearch();
            }}
            value={props.value}
            placeholderTextColor={Colors.seTextDisabled}
            style={{
              fontSize: 14,
              color: Colors.seTextPrimary,
              borderRadius: 6,
              flex: 1,
            }}
          />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {showClear&&<Pressable style={{ padding: 5 }}
            onPress={() => {
              setShowClear(false);
              props.onPressClear&&props.onPressClear();

            }}>
            <Image source={require('../../../../../images/aaxiot/searchBar/clear.png')} style={{}} />
          </Pressable>}
          {/*<Pressable style={{paddingLeft: 10, paddingRight: 10}}*/}
          {/*           onPress={() => {*/}
          {/*               props.onPressSearch && props.onPressSearch();*/}
          {/*           }}>*/}
          {/*    <Text style={{fontSize: 14, color: Colors.text.primary, fontWeight: 'bold'}}>搜索</Text>*/}
          {/*</Pressable>*/}
          {!props.isHiddenScan&&<View style={{ height: 20, width: 1, backgroundColor: Colors.seBorderBase }} />}
          {
            !props.isHiddenScan&&
            <View style={{ flexDirection: 'row' }}>
              <Pressable style={{ paddingLeft: 10, }}
                onPress={() => {
                  props.onPressScan&&props.onPressScan();
                }}>
                <Image source={isDarkMode()? require('../../../../../images/aaxiot/searchBar/scan_dark.png'):require('../../../../../images/aaxiot/searchBar/scan.png')} style={{ width: 16, height: 16 }} />
              </Pressable>
              {/*<View style={{ height: 20, width: 1, backgroundColor: '#D7DBDF' }} />*/}
              {/*<Pressable style={{ marginLeft: 10 }} onPress={() => {*/}
              {/*  props.onPressReset&&props.onPressReset()*/}
              {/*}}>*/}
              {/*  <Text style={{ fontSize: 14, color: Colors.text.light, fontWeight: 'bold' }}>重置</Text>*/}
              {/*</Pressable>*/}
            </View>
          }
        </View>

      </View>
    </View>
  )
}
