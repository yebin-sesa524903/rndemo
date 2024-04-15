
import React from "react";
import { Dimensions } from "react-native";
import { getBaseUri } from "../../middleware/api";


export const TimeFormatYMDHM='YYYY-MM-DD HH:mm';
export const TimeFormatYMDHMS='YYYY-MM-DD HH:mm:ss';
export const TimeFormatYMD='YYYY-MM-DD';
/**
 * 获取屏幕宽度
 * @constructor
 */
export function screenWidth() {
  return Dimensions.get('window').width;
}

/**
 * 是否是工业pad
 */
export function isIndustryPad() {
  return (screenWidth()<600);//&&(screenHeight()==805.3333333333334);
}

/**
 * 获取屏幕高度
 * @constructor
 */
export function screenHeight() {
  return Dimensions.get('window').height;
}

export function screenScale() {
  return Dimensions.get('window').scale;

}
/**
 * 获取图片完整下载链接
 * @param imageName
 */
export function getImageUrl(imageName?: string) {
  if (imageName&&imageName.length>0&&!(imageName.startsWith('https://')||imageName.startsWith('http://'))) {
    return getBaseUri()+'/ceph/se-xsup-static/'+imageName;
    // return 'http://39.98.50.32:31888/ceph/se-ecox-static/' + imageName;
  }
  return imageName;
}

/**
 * 获取图片路径 web端返回的完整链接 截取最后一截  拼接 上面 地址
 * @param url
 */
export function handleImageUrl(url?: string) {
  if (!isEmptyString(url)) {
    let fileName=url!.split('/').pop();
    return getImageUrl(fileName);
  }
  return '';
}


/**
 * 判断是否是空字符串
 * @param str
 */
export function isEmptyString(str?: string) {
  return (str==undefined||str==null||str.length==0||str=='undefined'||str=='null'||str==' ');
}

/**
 * 检查qrCode是否合法
 * @param qrCodeString
 */
export function checkQrCodeIsRight(qrCodeString: string): boolean {
  let qrCodeIsRight=false;
  if (qrCodeString.indexOf('deviceid')!=-1) {
    qrCodeIsRight=true;
  }
  return qrCodeIsRight;
}

/**
 * 字符串去除空格
 * @param str
 */
export function stringRemoveEmptyCharacter(str?: string): string {
  if (isEmptyString(str)) {
    return '';
  }
  return str!.replace(/\s*/g, "");
}

// const colorScheme = Appearance.getColorScheme();
// if (colorScheme === 'dark') {
//   // dark mode
// } else {
//   // light mode
// }
//
// Appearance.addChangeListener((prefer: Appearance.AppearancePreferences) => {
//   if (prefer.colorScheme === 'dark') {
//     // dark mode
//   } else {
//     // light mode
//   }
// });
