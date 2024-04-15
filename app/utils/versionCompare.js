/**
 * 版本比较,版本格式错误则返回false
 * @param appVersion a.b.c || a.b.c.d
 * @param newVersion a.b.c || a.b.c.d
 */
export default function versionCompare(appVersion, newVersion) {
  // console.warn('开始比较版本:',appVersion,newVersion);
  if (!appVersion || !newVersion) {
    console.warn('版本格式错误', appVersion, newVersion)
    return false;
  }
  let arrAppVersion = appVersion.split('.');
  let arrSerVersion = newVersion.split('.');
  try {
    arrAppVersion = arrAppVersion.map((item) => {
      return parseInt(item);
    });
    arrSerVersion = arrSerVersion.map((item) => {
      return parseInt(item);
    });
  } catch (e) {
    console.warn('版本格式错误', appVersion, newVersion)
    return false;
  } finally {
  }
  let max = Math.max(arrAppVersion.length, arrSerVersion.length);
  for (let i = 0; i < max; i++) {
    let v1 = arrAppVersion[i];
    let v2 = arrSerVersion[i];
    if (Number.isNaN(v1) || Number.isNaN(v2)) {
      console.warn('版本格式错误', appVersion, newVersion)
      return false;
    }
    if (!v1) v1 = 0;
    if (!v2) v2 = 0;
    if (v2 > v1) return true;
    if (v2 < v1) return false;
  }
  return false;
}
