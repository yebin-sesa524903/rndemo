import React from "react";
import { Toast } from "@ant-design/react-native";
import { View, Text, Image } from "react-native";

const loadingDuration=0.3;

export default {
  /**
   * show loading 需要手动dismiss 否则还一直转圈
   * @param title
   * @param mask
   */
  showLoading(title?: string|undefined, mask?: boolean|undefined) {
    Toast.loading(title??'加载中...', 0, () => {
    }, mask);
  },

  /***
   * show message
   * @param info
   * @param duration
   * @param mask
   * @param onClose
   */
  showInfo(info: string, onClose?: (() => void)|undefined, duration?: number|undefined, mask?: boolean|undefined) {
    let showDuration=duration||loadingDuration;
    Toast.info(info, showDuration, onClose, mask);
  },

  /**
   * show tip 提示信息
   * @param tip
   * @param duration
   * @param mask
   * @param onClose
   */
  showTip(tip?: string|undefined, onClose?: (() => void)|undefined, duration?: number|undefined, mask?: boolean|undefined) {
    let showDuration=duration||loadingDuration;
    Toast.info({
      content:
        <View style={{ alignItems: 'center', justifyContent: 'center', }}>
          <Image source={require('../../images/aaxiot/warning/warning.png')} />
          <Text style={{ color: 'white', fontSize: 14, marginTop: 12 }}>{tip}</Text>
        </View>
    }, showDuration, onClose, mask);
  },

  /**
   * show success
   * @param success
   * @param duration
   * @param mask
   * @param onClose
   */
  showSuccess(success: string, onClose?: (() => void)|undefined, duration?: number|undefined, mask?: boolean|undefined) {
    let showDuration=duration||loadingDuration;
    Toast.success(success, showDuration, onClose, mask);
  },

  /**
   * show error
   * @param error
   * @param duration
   * @param mask
   * @param onClose
   */
  showError(error: string, onClose?: (() => void)|undefined, duration?: number|undefined, mask?: boolean|undefined) {
    let showDuration=duration||loadingDuration;
    Toast.fail(error, showDuration, onClose, mask);
  },

  /**
   * 移除Toast
   */
  dismiss() {
    Toast.removeAll();
  }
}
