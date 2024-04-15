'use strict';
import {Platform} from 'react-native';
import RNFS, { DocumentDirectoryPath } from 'react-native-fs';
import {getBaseUri, HEADERDEVICEID,JWTTOKENHEADER,TOKENHEADER} from "../middleware/api";
import storage from "./storage";

export function checkFileNameIsImage(fileName){
  if (!fileName) {
    return true;
  }
  var index = fileName.lastIndexOf('.');
  var type = fileName.substring(index+1);
  type=type.toLowerCase();
  var arrImageTypes=['png','jpg','jpeg','gif','bmp'];
  return (arrImageTypes.indexOf(type)!==-1);
}

export function getFileNameFromFilePath(filePath)
{
  if (!filePath) {
    return '';
  }
  var index = filePath.lastIndexOf('/');
  if (index===-1) {
    return filePath;
  }
  var fileName = filePath.substring(index+1);
  return fileName;
}

/**
 * 判断指定的uri是否是本地文件
 * 本地文件已file:/// 或者 assets-library:// （ios系统）后者干脆是绝对路径/开头
 * @param uri
 */
export function isLocalFile(uri) {
  if(uri && (typeof uri ==='string')){
    if(uri.startsWith('file:///')||
      uri.startsWith('assets-library://')|| //ios相册图片格式
      uri.startsWith('ph://')|| //ios相册图片格式
      uri.startsWith('content://')|| //android相册图片格式
      uri.startsWith('/')) {
      return true;
    }
  }
  return false;
}

/**
 * 下载文档，数据
 * @param docs
 * @returns {Promise<void>}
 */
export async function downloadDocs(docs) {
  if(docs&&docs.length>0){
    let len=docs.length;
    for(let i=0;i<len;i++){
      let item=docs[i];
      await downloadFile(item.DocumentName,item.OssKey||item.DocumentId,item.OssKey);
    }
  }
}

async function downloadFile(name,id,ossKey) {
  var index = name.lastIndexOf('.');
  var type = name.substring(index+1);
  var baseUri = getBaseUri();
  let url=null;
  if(ossKey){
    url=`${baseUri}/popapi/api/common/file/download/${ossKey}`;
  }
  else {
    url = `${baseUri}/popapi/api/tickets/docs/${id}.${type}`;
  }

  const saveDocumentPath = Platform.OS === 'ios' ? DocumentDirectoryPath : RNFS.ExternalDirectoryPath;
  var downFilePath=`${saveDocumentPath}/${id}.${type}`;
  var token = await storage.getToken();
  var jwtToken = await storage.getJwtToken();
  var deviceid=await storage.getDeviceId();
  var headers={};
  headers[TOKENHEADER]=token;
  headers[JWTTOKENHEADER]=jwtToken;
  headers[HEADERDEVICEID]=deviceid;
  let result=await RNFS.exists(downFilePath);
  if (result) {
    //表示已经下载，不需要再下载
  }else {
    const ret = RNFS.downloadFile({ fromUrl: url, toFile: downFilePath,  background:false ,headers});
    try{
      await ret.promise;
    }catch (e) {
      console.warn('下载文档出错:',String(e),name,id,ossKey);
    }
  }
}
