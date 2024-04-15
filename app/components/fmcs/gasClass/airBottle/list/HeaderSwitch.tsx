import React from 'react';
import {
    FlatList,
    Pressable,
    Text,
    View,
} from 'react-native';
import Colors from "../../../../../utils/const/Colors";

export interface HeaderProps {
    ///切换回调
    onSwitchItem: Function;
    titles: any[];
    selectedIndex?: number;///默认选中
    backgroundColor?: string;   ///背景色
    normalCol?: string;
    selectedCol?: string;
    scrollEnable?: boolean,
    showMoveLine?: boolean,
}

export default function HeaderSwitch(props: HeaderProps) {
    const flatListRef = React.useRef<FlatList>(null);
    const [selectedIndex, setSelectedIndex] = React.useState(0);

    React.useEffect(() => {
        if (props.selectedIndex) {
            setSelectedIndex(props.selectedIndex);
        }
    }, [props.selectedIndex])

    let items = [];
    for (let i = 0; i < props.titles.length; i++) {
        items.push({
            title: props.titles[i].title,
            value: props.titles[i].value,
            isSelected: i === selectedIndex,
        });
    }

    React.useEffect(() => {
        if (selectedIndex && selectedIndex > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToIndex({
                    index: selectedIndex,
                    animated: false,
                    viewPosition: 0.5
                });
            }, 100)
        }
    }, [selectedIndex])

    return (
        <View style={{height: 46, flex: 1, backgroundColor: props.backgroundColor || 'white'}}>
            <FlatList ref={flatListRef}
                      data={items}
                      horizontal={true}
                      keyExtractor={((item, index) => item + index)}
                      showsHorizontalScrollIndicator={false}
                      showsVerticalScrollIndicator={false}
                      scrollEnabled={props.scrollEnable}
                      onScrollToIndexFailed={info => {
                          const wait = new Promise(resolve => setTimeout(resolve, 200));
                          wait.then(() => {
                              flatListRef.current?.scrollToIndex({index: info.index, animated: false});
                          });
                      }}
                      renderItem={
                          (item) => {
                              let itemObj = item.item;
                              return (
                                  <Pressable
                                      onPress={() => {
                                          setSelectedIndex(item.index);
                                          flatListRef.current?.scrollToIndex({
                                              index: item.index,
                                              animated: true,
                                              viewPosition: 0.5
                                          });
                                          /**
                                           * 回调切换点击
                                           */
                                          props.onSwitchItem && props.onSwitchItem(itemObj);
                                      }}
                                      style={{
                                          paddingLeft: 10,
                                          paddingRight: 10,
                                          height: 44,
                                          justifyContent: 'center',
                                          alignItems: 'center',
                                      }}>
                                      <Text style={{
                                          fontSize: 15,
                                          fontWeight: itemObj.isSelected ? 'bold' : 'normal',
                                          color: itemObj.isSelected ? props.selectedCol : props.normalCol,
                                      }}>{itemObj.title}</Text>
                                      {props.showMoveLine && <View style={{
                                          position: 'absolute',
                                          bottom: 0,
                                          left: 0,
                                          right: 0,
                                          height: 5,
                                          justifyContent: 'center',
                                          flexDirection: 'row'
                                      }}>
                                          <View style={{
                                              width: 30,
                                              height: 2,
                                              borderRadius: 2,
                                              marginBottom: 0,
                                              backgroundColor: itemObj.isSelected ? Colors.seTextInverse : 'transparent'
                                          }}/>
                                      </View>}
                                  </Pressable>
                              )
                          }
                      }/>
        </View>

    )
}
