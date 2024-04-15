'use strict'

import {round} from 'lodash/math';

var unitMap = {
  temperature:'℃',
  humidity:'%',
  dust:'mg/m³'
};

export default {
  combineUnit(value,type){
    if(value!==null){
      return value + unitMap[type];
    }
    else {
      return '请填写';
    }
  },
  get(type){
    return unitMap[type];
  },
  toFixed(number, decimal) {
    if (number<0) {
      return -round(Math.abs(number),decimal);
    }
    return round(number,decimal);
  },
  fillZeroAfterPointWithRound(value, num){
     var a, b, c, i;
     value=this.toFixed(value,num);
     a = value.toString();
     b = a.indexOf(".");
     c = a.length;
     if (num == 0) {
         if (b != -1) {
             a = a.substring(0, b);
         }
     } else {//如果没有小数点
         if (b == -1) {
             a = a + ".";
             for (i = 1; i <= num; i++) {
                 a = a + "0";
             }
         } else {//有小数点，超出位数自动截取，否则补0
             a = a.substring(0, b + num + 1);
             for (i = c; i <= b + num; i++) {
                 a = a + "0";
             }
         }
     }
     return a;
 },
}
