import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Colors from "../../../utils/const/Colors";
import { AlarmType } from "../utils";
import { screenWidth, TimeFormatYMD, TimeFormatYMDHM } from "../../../utils/const/Consts";
import DateTimePicker from "react-native-modal-datetime-picker";
import moment from "moment";
import { localStr } from "../../../utils/Localizations/localization";

export interface AlarmFilterProps {
  alarmType: AlarmType,
  onPressReset: Function,
  onPressSure: Function,
  alarmCodes?: any[],
  ///已选中的筛选条件
  filter: {
    startTime?: number,
    endTime?: number,
    type?: number[],
    level?: number[],
  }
}

const AlarmLevel=() => [
  {
    title: localStr('lang_alarm_filter_level_h'),
    level: 3,
    isSelected: false,
  },
  {
    title: localStr("lang_alarm_filter_level_m"),
    level: 2,
    isSelected: false,
  },
  {
    title: localStr('lang_alarm_filter_level_l'),
    level: 1,
    isSelected: false,
  },
]

const AlarmTypeTX=() => [
  {
    title: localStr('lang_alarm_filter_type_tx1'),
    id: 501,
    isSelected: false,
  },
  {
    title: localStr("lang_alarm_filter_type_tx2"),
    id: 502,
    isSelected: false,
  },
  {
    title: localStr('lang_alarm_filter_type_tx3'),
    id: 504,
    isSelected: false,
  },
  {
    title: localStr('lang_alarm_filter_type_tx4'),
    id: 505,
    isSelected: false,
  },
]

enum AlarmTime {
  start,
  end
}

export function AlarmFilter(props: AlarmFilterProps) {
  const configYWAlarmType=() => {
    let codes=[];
    if (props.alarmCodes&&props.alarmCodes.length>0) {
      for (let code of props.alarmCodes) {
        codes.push({
          title: code.type,
          id: code.code,
          isSelected: false,
        })
      }
    }
    return codes;
  }
  const [startTime, setStartTime]=React.useState<Date|undefined>(undefined);
  // @ts-ignore
  const [endTime, setEndTime]=React.useState<Date|undefined>(undefined);
  ///datePicker是否可见
  const [datePickerVisible, setDatePickerVisible]=React.useState(false);
  ///记录哪个时间被点击
  const [timeClick, setTimeClick]=React.useState(AlarmTime.start);
  ///报警级别
  const [alarmLevel, setAlarmLevel]=React.useState(AlarmLevel());
  ///报警类别
  const [alarmType, setAlarmType]=React.useState(props.alarmType===AlarmType.yw? configYWAlarmType():AlarmTypeTX());

  React.useEffect(() => {
    if (props.filter&&Object.keys(props.filter).length>0) {
      ///有filter
      if (props.filter.startTime&&props.filter.endTime) {
        setStartTime(moment(props.filter.startTime*1000).toDate());
        setEndTime(moment(props.filter.endTime*1000).toDate());
      }
      if (props.filter.level&&props.filter.level.length>0) {
        for (let level of alarmLevel) {
          if (props.filter.level.includes(level.level)) {
            level.isSelected=true;
          }
        }
        setAlarmLevel([...alarmLevel]);
      }
      if (props.filter.type&&props.filter.type.length>0) {
        for (let type of alarmType) {
          if (props.filter.type.includes(type.id)) {
            type.isSelected=true;
          }
        }
        setAlarmType([...alarmType]);
      }
    }
  }, [props.filter])

  const configAlarmTimes=() => {
    let startTimeTitle=localStr('lang_alarm_filter_start_time');
    if (startTime) {
      startTimeTitle=moment(startTime).format(TimeFormatYMDHM);
    }
    let endTimeTitle=localStr('lang_alarm_filter_end_time');
    if (endTime) {
      endTimeTitle=moment(endTime).format(TimeFormatYMDHM);
    }
    return (
      <View style={{ paddingTop: 20, paddingLeft: 12, paddingRight: 12 }}>
        <Text style={{ fontSize: 14, color: Colors.seTextSecondary }}>{localStr('lang_alarm_filter_time')}</Text>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
          <Pressable style={styles.alarmTimeContainer}
            onPress={() => {
              setTimeClick(AlarmTime.start);
              setDatePickerVisible(true)
            }}>
            <Text
              style={{ fontSize: 14, color: startTime? Colors.seTextPrimary:Colors.seTextDisabled }}>{startTimeTitle}</Text>
          </Pressable>
          <View
            style={{ backgroundColor: Colors.seTextTitle, height: 1, width: 8, marginLeft: 5, marginRight: 5 }} />
          <Pressable style={styles.alarmTimeContainer}
            onPress={() => {
              setTimeClick(AlarmTime.end);
              setDatePickerVisible(true)
            }}>
            <Text
              style={{ fontSize: 14, color: endTime? Colors.seTextPrimary:Colors.seTextDisabled }}>{endTimeTitle}</Text>
          </Pressable>
        </View>
      </View>
    )
  }

  const renderPickerView=() => {
    let maxTime: Date|undefined=undefined;
    let minTime: Date|undefined=undefined;
    if (timeClick===AlarmTime.start) {
      if (endTime) {
        maxTime=endTime;
      }
    } else {
      if (startTime) {
        minTime=startTime;
      }
    }
    return (
      <DateTimePicker
        is24Hour={true}
        headerTextIOS={localStr('lang_alarm_time_picker_title')}
        cancelTextIOS={localStr('lang_alarm_time_picker_cancel')}
        confirmTextIOS={localStr('lang_alarm_time_picker_ok')}
        mode={'datetime'}
        maximumDate={maxTime}
        minimumDate={minTime}
        date={timeClick===AlarmTime.start? startTime:endTime}
        onDateChange={(date) => {

        }}
        isVisible={datePickerVisible}
        onConfirm={(date) => {
          if (timeClick===AlarmTime.start) {
            setStartTime(date)
          } else {
            setEndTime(date)
          }
          setDatePickerVisible(false);
        }}
        onCancel={() => {
          setDatePickerVisible(false);
        }}
      />
    )
  }
  /**
   * 报警级别
   */
  const renderAlarmLevel=() => {
    let itemWidth1=(screenWidth()*0.8-12*2-8*2)*0.333333;
    return (
      <View style={{ paddingTop: 24, paddingLeft: 12, paddingRight: 12 }}>
        <Text style={{ fontSize: 14, color: Colors.seTextSecondary }}>{localStr('lang_alarm_filter_level')}</Text>
        <View style={{ flex: 1, flexWrap: 'wrap', flexDirection: 'row' }}>
          {
            alarmLevel.map((item, index) => {
              return (
                <Pressable key={item.title}
                  style={{
                    backgroundColor: item.isSelected? Colors.seBrandBg:Colors.seFill3,
                    borderRadius: 5,
                    width: itemWidth1,
                    height: 36,
                    marginLeft: index%3===0? 0:8,
                    marginTop: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => {
                    item.isSelected=!item.isSelected;
                    setAlarmLevel([...alarmLevel]);
                  }}>
                  <Text style={{ fontSize: 14, color: item.isSelected? Colors.seBrandNomarl:Colors.seTextPrimary }}>{item.title}</Text>
                </Pressable>
              )
            })
          }
        </View>
      </View>
    )
  }

  /**
   * 报警类别
   */
  const renderAlarmType=() => {

    let itemWidth=(screenWidth()*0.8-12*2-8)*0.5;
    return (
      <View style={{ paddingTop: 24, paddingLeft: 12, paddingRight: 12 }}>
        <Text style={{ fontSize: 14, color: Colors.seTextSecondary }}>{localStr('lang_alarm_filter_type')}</Text>
        <View style={{ flex: 1, flexWrap: 'wrap', flexDirection: 'row', }}>
          {
            alarmType.map((item, index) => {
              return (
                <Pressable key={item.title}
                  style={{
                    backgroundColor: item.isSelected? Colors.seBrandBg:Colors.seFill3,
                    borderRadius: 5,
                    width: itemWidth,
                    height: 36,
                    marginLeft: index%2===0? 0:8,
                    marginTop: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => {
                    item.isSelected=!item.isSelected;
                    setAlarmType([...alarmType]);
                  }}>
                  <Text style={{ fontSize: 14, color: item.isSelected? Colors.seBrandNomarl:Colors.seTextPrimary, textAlign: 'center' }}>{item.title}</Text>
                </Pressable>
              )
            })
          }
        </View>
      </View>
    )
  }


  /**
   * 重置
   */
  const resetAction=() => {
    setStartTime(undefined);
    setEndTime(undefined);
    alarmLevel.forEach((item) => item.isSelected=false);
    setAlarmLevel([...alarmLevel]);
    alarmType.forEach((item) => item.isSelected=false);
    setAlarmType([...alarmType]);
    props.onPressReset&&props.onPressReset();
  }

  /**
   * 确认按钮点击
   */
  const filterAction=() => {
    if (startTime&&endTime) {
      if (moment(startTime).diff(endTime).valueOf()>0) {
        Alert.alert(
          '',
          localStr('lang_alarm_time_picker_invalid_lip'),
          [
            { text: localStr('lang_alarm_time_picker_ok'), onPress: () => console.log('Cancel Pressed') }
          ]
        )
        return;
      }
    }
    let params={}
    params=Object.assign({}, params, {
      startTime: startTime? moment(startTime).valueOf()*0.001:undefined,
      endTime: endTime? moment(endTime).valueOf()*0.001:undefined,
    })
    let levels=alarmLevel.map((item) => {
      if (item.isSelected) {
        return item.level;
      }
    }).filter((item) => item!=null)
    params=Object.assign({}, params, {
      level: levels.length>0? levels:undefined,
    })

    let types=alarmType.map((item) => {
      if (item.isSelected) {
        return item.id;
      }
    }).filter((item) => item!=null)
    params=Object.assign({}, params, {
      type: types.length>0? types:undefined,
    })
    props.onPressSure&&props.onPressSure(params);
  }

  /**
   * 底部按钮重置/确认
   */
  const renderActionButton=() => {
    return (
      <View style={{ height: 48, flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.seBorderSplit }}>
        <Pressable style={{
          flex: 1,
          backgroundColor: Colors.seBgElevated,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center'
        }}
          onPress={resetAction}>
          <Text style={{ fontSize: 15, color: Colors.seTextPrimary, fontWeight: 'bold' }}>{localStr('lang_alarm_filter_reset')}</Text>
        </Pressable>
        <Pressable style={{
          flex: 1,
          backgroundColor: Colors.seBrandNomarl,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center'
        }}
          onPress={filterAction}>
          <Text style={{ fontSize: 15, color: Colors.seTextInverse, fontWeight: 'bold' }}>{localStr('lang_alarm_time_picker_ok')}</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }}>
        {configAlarmTimes()}
        {renderAlarmLevel()}
        {renderAlarmType()}
      </ScrollView>
      {renderActionButton()}
      {renderPickerView()}
    </View>
  )
}

// @ts-ignore
const styles=global.amStyleProxy(() => StyleSheet.create({
  alarmTimeContainer: {
    borderWidth: 1,
    borderRadius: 4,
    flex: 1,
    borderColor: Colors.seBorderSplit,
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
  }
}));
