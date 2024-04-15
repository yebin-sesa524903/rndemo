import { getImageHost } from "../../../../middleware/api";
import storage from "../../../../utils/storage";

/**
 * 数组排序 将相同的 warehouseExitNo 放在一个数组
 * @param sortData
 * @param itemKey
 */
export const sortArray=(sortData: any[], itemKey='warehouseExitNo') => {
  const groupBy=(array: any[], f: Function) => {
    const groups: { [key: string]: any[] }={};
    array.forEach((item) => {
      const group=JSON.stringify(f(item));
      groups[group]=groups[group]||[];
      groups[group].push(item);
    });
    return Object.keys(groups).map((group) => {
      return groups[group];
    });
  };
  return groupBy(sortData, (item: any) => {
    return item[itemKey];
  });
};

/**
 * 小数保留多少位,但是不4舍五入
 * @param num 小数
 * @param decimal 保留多少位
 */
export function decimalNumber(num: number, decimal: number) {
  let tempNumber=num.toString();
  let index=tempNumber.indexOf('.');
  if (index!==-1) {
    tempNumber=tempNumber.substring(0, decimal+index+1)
  } else {
    tempNumber=tempNumber.substring(0)
  }
  return parseFloat(tempNumber).toFixed(decimal)
}


export function getImageUrlByKey(imgKey: string) {
  if (!imgKey) return '';
  let imagePath=imgKey;
  //先判断是否包含了osspath
  if (!imgKey.includes(imageOssPath)) {
    imagePath=imageOssPath+imgKey;
  }
  let ret=`${getImageHost()}${imagePath}`;
  return ret;
}
let imageOssPath='';
export function setImageOssPath(ossPath: string) {
  imageOssPath=ossPath;
}