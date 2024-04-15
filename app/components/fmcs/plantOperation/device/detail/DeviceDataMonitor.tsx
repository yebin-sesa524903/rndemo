import React from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import Colors from "../../../../../utils/const/Colors";
import { isEmptyString, screenHeight, screenWidth } from "../../../../../utils/const/Consts";
import { ExpandHeader } from "../../components/ExpandHeader";
import EmptyView from "../../../../../utils/refreshList/EmptyView";
// @ts-ignore
import Loading from '../../../../Loading';

export interface DeviceMonitorProps {
  title: string,
  data: MonitorProps[][],
  isFetching: boolean,
  onRefresh: Function,
  onMonitorCallBack?: Function,
}

export interface MonitorProps {
  id: string,
  name: string,
  abbreviation: string,
  unit: string,
  val: string,
  time: string,
}

export function DeviceDataMonitor(props: DeviceMonitorProps) {
  if (props.isFetching||props.isFetching===null) return <Loading />

  const [isExpand, setIsExpand]=React.useState(true);

  const renderItem=(alarm: MonitorProps[]) => {

    return (
      <ExpandHeader {...props}
        isExpand={isExpand}
        expandCallBack={(type: number) => {
          setIsExpand(!isExpand);
        }} content={renderMonitorItem(alarm)} />
    )
  }

  const renderMonitorItem=(alarms: MonitorProps[]) => {
    return (
      <View style={{ flex: 1, }}>
        {
          alarms.map((value, index, array) => {
            let valueText: any=undefined;
            let valueUnit='';
            if (!isEmptyString(value.val)) {
              if (value.val!=='-') {
                valueText=Number(value.val).toFixed(2);
              } else {
                valueText='-';
              }
            }
            if (!isEmptyString(value.unit)) {
              valueUnit=value.unit;
            }
            return (
              <Pressable key={value.id}
                onPress={() => {
                  if (valueText!=undefined) {
                    props.onMonitorCallBack&&props.onMonitorCallBack(value);
                  }
                }}
                style={{
                  flexDirection: 'row',
                  height: 44,
                  paddingLeft: 15,
                  paddingRight: 15,
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text style={{ fontSize: 15, color: Colors.seTextTitle }}>{value.name}</Text>
                <View style={{ flexDirection: 'row' }}>
                  {
                    valueText===undefined? <ActivityIndicator color={Colors.seBrandNomarl} size={'small'} />:
                      <Text style={{ fontSize: 15, color: Colors.seTextPrimary }}>{valueText}</Text>
                  }
                  <Text style={{ fontSize: 15, color: Colors.seTextPrimary }}>{valueUnit}</Text>
                </View>


                {(index!=array.length-1)&&<View style={styles.lineSeparator} />}
              </Pressable>
            )
          })
        }
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList data={props.data}
        contentContainerStyle={{
          paddingBottom: 20,
        }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={() => {
          props.onRefresh&&props.onRefresh();
        }} />}
        // @ts-ignore
        keyExtractor={(item, index) => String(item.id+index)}
        ListEmptyComponent={
          <View style={{
            height: screenHeight()-64-40,
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <EmptyView />
          </View>
        }
        renderItem={(item) => renderItem(item.item)} />
    </View>
  )
}

// @ts-ignore
const styles=global.amStyleProxy(() => StyleSheet.create({
  container: {
    paddingLeft: 10,
    paddingRight: 10,
    width: screenWidth(),
    flex: 1,
    backgroundColor: Colors.seBgLayout,
  },
  lineSeparator: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 0,
    height: 0.5,
    backgroundColor: Colors.seBorderSplit
  }
}))
