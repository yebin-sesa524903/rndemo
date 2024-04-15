import React from "react";
import { Alert, FlatList, Image, Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { connect } from "react-redux";
// @ts-ignore
import Toolbar from "../../../components/Toolbar";
import Colors from "../../../utils/const/Colors";
import { logout } from "../../../actions/loginAction";
import appInfo from "../../../utils/appInfo";
import { localStr } from "../../../utils/Localizations/localization";
// import { Icon } from "@ant-design/react-native";
import Icon from '../../../components/Icon';
import SndAlert from "../../../utils/components/SndAlert";
import storage from "../../../utils/storage";
import SelectPartner from "../../SelectPartner";
import { clearCacheTicket } from "../../../utils/sqliteHelper";

function Profile(props: any) {

  const [customerName, setCustomerName]=React.useState();

  React.useEffect(() => {
    storage.getCustomerName().then((name) => {
      setCustomerName(name);
    })
  }, [props.user.user.CustomerId]);

  const configInitialData=React.useMemo(() => {
    return [
      {
        title: localStr('lang_profile_account'),
        value: props.user?.user?.Name,
        canEnter: false,
      },
      {
        title: localStr('lang_profile_display_name'),
        value: (props.user?.user?.RealName??'-'),
        canEnter: false,
      },
      {
        title: localStr('lang_profile_my_partner'),
        value: customerName||'-',
        canEnter: (props.user?.customerList&&props.user.customerList.length>1),
        actionCallBack: () => {
          props.navigation.push('PageWarpper', {
            id: 'SelectPartner',
            component: SelectPartner,
            passProps: {
              showBack: true,
              selectedCustomer: props.user.user.CustomerId
            }
          })
        }
      },
      {
        title: localStr('lang_profile_version'),
        value: 'V'+appInfo.get().versionName,
        canEnter: false,
      },
    ]
  }, [props.user, customerName]);

  const renderItem=(item: any,) => {
    let itemObj=item.item;
    return (
      <Pressable onPress={() => {

        itemObj.canEnter&&itemObj.actionCallBack&&itemObj.actionCallBack();
      }}
        style={styles.itemContainer}>
        <Text style={styles.itemText}>{itemObj.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: "center", justifyContent: 'center' }}
        >
          {itemObj.hasNewVersion&&
            <View style={{ backgroundColor: Colors.seRed, width: 8, height: 8, borderRadius: 4, marginRight: 5 }} />}
          <Text numberOfLines={3} lineBreakMode={"tail"}
            style={{ fontSize: 15, color: Colors.seTextSecondary, marginLeft: 8, }}>{itemObj.value}</Text>
          {itemObj.canEnter&&<Icon type={'arrow_right'} color={Colors.seTextSecondary} size={16} />}
        </View>

        <View style={{
          position: 'absolute',
          left: 20,
          right: 20,
          top: 0,
          height: item.index>0? 1:0,
          backgroundColor: Colors.seBorderSplit
        }} />
      </Pressable>
    )
  };

  /**
   * 退出登录
   */
  const onLogoutAction=() => {
    /**
     * 退出登录
     */
    SndAlert.alert(localStr('lang_profile_alert_info'), '', [
      { text: localStr('lang_alarm_time_picker_cancel'), onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
      {
        text: localStr("lang_profile_alert_logout"), onPress: () => {
          clearCacheTicket().then();
          props.logout();
        }
      }
    ], { cancelable: false });
  }

  return (
    <View style={styles.container}>
      <Toolbar title={localStr('lang_profile_my')} color={Colors.seBrandNomarl} borderColor={Colors.seBrandNomarl} />
      <FlatList data={configInitialData}
        keyExtractor={(item, index) => item.title}
        ListHeaderComponent={() => {
          return (
            <View style={{ backgroundColor: Colors.seBgContainer, height: 10 }} />
          )
        }}
        ListFooterComponent={() => {
          return (
            <Pressable style={styles.outContainer} onPress={onLogoutAction}>
              <Text style={styles.outText}>{localStr('lang_profile_logout')}</Text>
            </Pressable>
          )
        }}
        renderItem={renderItem} />
    </View>
  )
}


// @ts-ignore
const styles=global.amStyleProxy(() => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.seBgLayout
  },

  outContainer: {
    backgroundColor: Colors.seBgContainer,
    marginTop: 10,
    flex: 1,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outText: {
    fontSize: 15,
    color: Colors.seTextTitle,
    fontWeight: 'bold'
  },
  itemContainer: {
    flexDirection: 'row',
    paddingLeft: 20,
    paddingRight: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    backgroundColor: Colors.seBgContainer
  },
  itemText: {
    fontSize: 15,
    color: Colors.seTextTitle,
    fontWeight: '800'
  }
}));


const mapStateToProps=(state: any) => {
  let user=state.user.toJSON();
  return {
    user: user,
  }
}
export default connect(mapStateToProps, { logout })(Profile);
