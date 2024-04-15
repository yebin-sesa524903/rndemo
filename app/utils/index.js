'use strict';

import { Dimensions } from 'react-native';

const PASS_REG = /^(?=.*?\d)(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[~`!@#\$%&\^\*\(\)\-=_\+<>\/:;\{\}\[\]\?\.])[a-zA-Z0-9~`!@#\$%&\^\*\(\)\-=_\+<>\/:;\{\}\[\]\?\.]{8,}$/;

export function verifyPass(pass) {
  return PASS_REG.test(pass);
}

export function isPhoneX() {
  var {width,height} = Dimensions.get('window');
  var isPhoneX=(width===812||height===812)||(width===896||height===896);
  return isPhoneX;
}

export function removeDuplicate(arr) {
    const newArr = []
    arr.forEach(item => {
        if (newArr.indexOf(item) === -1) {
            newArr.push(item)
        }
    })
    return newArr // 返回一个新数组
}


let timeout = null
export const debounce = (cb, wait = 500) => {
  if (timeout !== null) clearTimeout(timeout)
  timeout = setTimeout(() => {
    timeout = null
    cb && cb()
  }, wait);
}
