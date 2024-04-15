import CacheableImage from '../components/ImageComponent/CacheableImage'
import NetworkImage from '../components/NetworkImage'
import { Platform,Dimensions } from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import RNFS, { DocumentDirectoryPath } from 'react-native-fs';
import storage from "./storage";
import {getBaseUri, HEADERDEVICEID, JWTTOKENHEADER, TOKENHEADER} from "../middleware/api";
import {
  getDownloadTimeByTicketId, getUnSyncTickets, updateImageUpload,
  updateGPSToAddress, TICKET_LOG_ADD, TICKET_LOG_UPDATE, getUnSyncServiceTickets, updateServiceImageUpload
} from "./sqliteHelper";
import {getAddressByLocation,convertGPSLocationToAMap} from "./locationHelper";
import {downloadDocs} from './fileHelper';
const URL = require('url-parse');
const SHA1 = require("crypto-js/sha1");
//巡检工单缩略图尺寸
const SIZE_CACHE=76;
var {width} = Dimensions.get('window');
const LOG_IMAGE_SIZE = parseInt((width-16*2-10*3)/4.0)-2;
/**
 * 下载工单中的图片和文档
 * @returns {Promise<void>}
 */
export async function downloadImages(imgs,docs) {
	//为了保持和在线图片显示一直（显示缩略图和显示大图），需要先下载小图，在下载大图
	if(imgs&&imgs.length>0){
		for(let i=0;i<imgs.length;i++){
		  if(!imgs[i].isSign){
        //下载缩略图
        let size=SIZE_CACHE;
        if(imgs[i].isLogImage) size=LOG_IMAGE_SIZE;
        let cacheUri=NetworkImage.buildUrl(imgs[i].pid,size,size,'jpg',false);
        //判断是否存在（之前缓存过）
        let path=await CacheableImage.getFilepathFromSource({uri:cacheUri});
        if(!path){
          //没有，那么需要下载
          await downloadImageFile(cacheUri);
        }
      }
			//下载原图
			cacheUri=NetworkImage.buildUrl(imgs[i].pid,SIZE_CACHE,SIZE_CACHE,'jpg',true);
			//判断是否存在（之前缓存过）
			path=await CacheableImage.getFilepathFromSource({uri:cacheUri});
			if(!path){
				//没有，那么需要下载
				await downloadImageFile(cacheUri);
			}
		}
	}

	//开始下载工单文档
	await downloadDocs(docs);
}

export async function getFilePathByPictureId(id){
	//根据id构建对应的网络地址
	let cacheUri=NetworkImage.buildUrl(id,SIZE_CACHE,SIZE_CACHE,'jpg',true);
	//根据网络地址构建本地的缓存地址，判断是否存在（之前缓存过）
	let path=await CacheableImage.getFilepathFromSource({uri:cacheUri});
	return path;
}

export async function getFilePathByUri(uri){
	//根据网络地址构建本地的缓存地址，判断是否存在（之前缓存过）
	let path=await CacheableImage.getFilepathFromSource({uri:uri});
	return path;
}

async function downloadImageFile(uri) {
	const url = new URL(uri, null, true);
	let cacheable = url.pathname;

	var type = url.pathname.replace(/.*\.(.*)/, '$1');
	if (url.href.indexOf('x-oss-process')&&url.pathname===type) {//oss update
		type='jpg';
		if (url.href.indexOf('format')>0) {
			type=url.href.substring(url.href.indexOf('format')+9,url.href.length);
		}
		if (url.href.indexOf('resize')<=0) {
			// console.warn('3333',url.href,cacheable,cacheKey,);
			cacheable+='origin';
		}
	}
	const cacheKey = SHA1(cacheable) + (type.length < url.pathname.length ? '.' + type : '');
	const saveDocumentPath = Platform.OS === 'ios' ? DocumentDirectoryPath : RNFS.ExternalDirectoryPath;
	const dirPath = saveDocumentPath+'/'+url.host;
	const filePath = dirPath+'/'+cacheKey;
	console.warn(dirPath,uri);
	var token = await storage.getToken();
  var jwtToken = await storage.getJwtToken();
	var deviceid=await storage.getDeviceId();
	try {
		//下载文件之前确认下载目录创建了
		await RNFS.mkdir(dirPath, {NSURLIsExcludedFromBackupKey: true});

		//设置下载文件的参数
		var headers={};
		headers[TOKENHEADER]=token;
    headers[JWTTOKENHEADER]=jwtToken;
		headers[HEADERDEVICEID]=deviceid;
		let downloadOptions = {
			fromUrl: uri,
			toFile: filePath,
			headers
		};
		let download = RNFS.downloadFile(downloadOptions);
		let res=await download.promise;
		console.warn(`[下载文件状态${res.statusCode}] 文件:${uri}`)
	}catch (e) {
		console.warn('下载文件出错:',e);
	}
}

const UPLOAD_SUCCESS=1;
const UPLOAD_FAIL=2;

async function gpsToAmap(location) {
	return new Promise((resolve, reject) => {
		convertGPSLocationToAMap(location,loc=>{
			getAddressByLocation(loc,res=>{
				resolve({
					Location:res.address,
					Lat:res.lat,
					Lng:res.lon
				});
			},err=>{
				console.warn('定位转地址出错:',err);
				resolve(null);
			});
		},error=>{
			console.warn('gps转高德地址出错:',error);
			resolve(null);
		});
	})
}

async function syncUploadServiceImages() {
  let arr = await getUnSyncServiceTickets();
  if(arr && arr.length > 0) {
    let result = [];
    for(let i=0;i<arr.length;i++){
      let item=arr[i];
      if(true){//item.operation_type===2){//由于合并了同一个工单操作步骤
        if(!item.new_content) continue;
        let full=JSON.parse(item.new_content);
        if(!full.content) continue;
        let content=full.content;
        for(let key in content) {
          let task = content[key];
          //判断可能存在图片的项目
          if(task.ItemInfo && task.ItemInfo.InspectionInfoList
            && task.ItemInfo.InspectionInfoList.length>0) {
            task.ItemInfo.InspectionInfoList.forEach(log => {
              if(log && log.Images && log.Images.Value) {
                log.Images.Value.forEach((img,index) => {
                  if(img && typeof img === 'object') {
                    //如果img项是对象，说明是本地保存的
                    if(img.PictureId&&img.uri&&!img.loaded){
                      result.push({
                        PictureId:img.PictureId,
                        uri:img.uri,
                        img:img,
                        index:index,
                        imgParent:log.Images.Value,//引用父级，方便移除操作，
                        id:item.id,
                        content:task,
                        full
                      })
                    }
                  }
                });
              }
            });
          }
          //保护定值的判断
          if(task.ItemInfo && task.ItemInfo.LowVoltageConstantValueInfo
            && task.ItemInfo.LowVoltageConstantValueInfo.Images
            && task.ItemInfo.LowVoltageConstantValueInfo.Images.Value){
            let optImages = task.ItemInfo.LowVoltageConstantValueInfo.Images.Value;
            for(let imgKey in optImages) {
              let img = optImages[imgKey];
              if(img && typeof img === 'object') {
                if(img.PictureId&&img.uri&&!img.loaded){
                  result.push({
                    PictureId:img.PictureId,
                    uri:img.uri,
                    img:img,
                    imgKey:imgKey,
                    imgParent:optImages,//引用父级，方便移除操作，
                    id:item.id,
                    content:task,
                    full
                  })
                }
              }
            }
          }
        }
      }
    }
    //收集完成，就开始上传了
    if(result && result.length > 0) {
      for(let i = 0; i < result.length; i++) {
        let item = result[i];
        if(isConnected()) {
          let res=await uploadFile(item.PictureId,item.uri);
          if(res){
            //上传成功，修改为string类型值
            if(item.imgKey) {
              item.imgParent[item.imgKey] = item.PictureId;
            }else {
              item.imgParent[item.index] = item.PictureId;
            }
            // item.uploadStatus=UPLOAD_SUCCESS;
            // item.img.uri=undefined;
          }else{
            //上传失败，
            item.uploadStatus=UPLOAD_FAIL;
            if(item.imgKey) {
              item.imgParent[imgKey] = null;
            }else {
              item.imgParent.splice(item.index);
            }

          }
          //应该是上传一张，更新一次，避免先上传成功的因为断网需要重新上传
          if(item.full){
            await updateServiceImageUpload(item.id,JSON.stringify(item.full));
          }else{
            await updateServiceImageUpload(item.id,JSON.stringify(item.content));
          }
        }
      }
    }
  }
}

//表示图片上传任务是否在进行中，防止本次图片上传还没完成，下一次图片上传任务来临
let isUploading = false;

/**
 *
 * @param doSync 直接进行同步
 * @param doUpdateSyncData 不同步，重新查询一下待同步数据，之后走旧流程
 * @returns {Promise<void>}
 */
export async function syncUploadImages(doSync,doUpdateSyncData) {
  if(isUploading) return;
  isUploading = true;
  //先同步service ticket 里面的图片
  await syncUploadServiceImages();

  //从数据库待同步表里面找出所有需要同步的图片
	let arr=await getUnSyncTickets();
	if(arr&&arr.length>0){
		let result=[];
		let hasGpsToAmap=false;
		let updateTable=[];
		for(let i=0;i<arr.length;i++){
			//判断有没有开始执行状态的，有的话，需要转换gps定位到高德定位和对应的高德地址信息
			let item=arr[i];
			if(item.operation_type===2){
				//状态更新
				let full=JSON.parse(item.new_content);
				if(!full.update) continue;
				let content=full.update;
				let tmp=[];
				content.forEach(mainItem=>{
					mainItem.SubItems.forEach(subItem=>{
						if(subItem.Pictures&&subItem.Pictures.length>0){
							subItem.Pictures.forEach((img,index)=>{
								if(img.PictureId&&img.uri&&!img.loaded){
									tmp.push({
										PictureId:img.PictureId,
										uri:img.uri,
										img:img,
										index:index,
										imgParent:subItem.Pictures,//引用父级，方便移除操作，
										id:item.id,
										content:content,
                    full
									})
								}
							});
						}
					});
				});
				if(tmp.length>0){
					result=result.concat(tmp);
					updateTable.push({id:item.id,content:content})
				}
			}
			else if(item.operation_type===3){
				//更新gps定位信息对应的高德定位
				let content=JSON.parse(item.new_content);
				if(!content.amap&&content.gps){//高德定位信息
					if(isConnected()){
						let amap=await gpsToAmap(content.gps);
						if(amap){
							hasGpsToAmap=true;
							console.warn('获取到定位:',amap);
							content.amap=amap;
							await updateGPSToAddress(item.id,JSON.stringify(content));
						}else{//查询高德失败，不管地址了
						}
					}else{
						//没网，结束掉
            isUploading = false;
						return;
					}
				}
			}else if(item.operation_type===TICKET_LOG_ADD){
				//处理离线定位转换成高德定位
				let logAdd=JSON.parse(item.new_content);
				if(!logAdd.amap&&logAdd.gps){
					if(isConnected()){
						let amap=await gpsToAmap(logAdd.gps);
						if(amap){
							hasGpsToAmap=true;
							logAdd.amap=amap;
							await updateGPSToAddress(item.id,JSON.stringify(logAdd));
						}else{

						}
					}else{
					  isUploading = false;
						return;
					}
				}
				//接着上传离线添加图片
				if(logAdd){
					logAdd.Pictures.forEach((img,index)=>{
						if(img.PictureId&&img.uri&&!img.loaded){
							result.push({
								PictureId:img.PictureId,
								uri:img.uri,
								img:img,
								index:index,
								imgParent:logAdd.Pictures,//引用父级，方便移除操作，
								id:item.id,
								content:logAdd
							})
						}
					});
				}
			}else if(item.operation_type===TICKET_LOG_UPDATE){
				//如果是离线修改日志，可能需要上传图片
				let logUpdate=JSON.parse(item.new_content);
				if(logUpdate){
					logUpdate.Pictures.forEach((img,index)=>{
						if(img.PictureId&&img.uri&&!img.loaded){
							result.push({
								PictureId:img.PictureId,
								uri:img.uri,
								img:img,
								index:index,
								imgParent:logUpdate.Pictures,//引用父级，方便移除操作，
								id:item.id,
								content:logUpdate
							})
						}
					});
				}
			}

		}
		//需要上传的图片已找到，开始上传
		if(result.length>0){
			for(let i=0;i<result.length;i++){
				let item=result[i];
				//上传之前判断网络，如果断网，则停止上传，不做处理
				if(isConnected()){
					let res=await uploadFile(item.PictureId,item.uri);
					if(res){
						//上传成功，则删除uri,表示已经上传成功
						item.uploadStatus=UPLOAD_SUCCESS;
						item.img.uri=undefined;
					}else{
						//上传失败，
						item.uploadStatus=UPLOAD_FAIL;
						item.imgParent.splice(item.index);
					}
					//应该是上传一张，更新一次，避免先上传成功的因为断网需要重新上传
          if(item.full){
            updateImageUpload(item.id,JSON.stringify(item.full));
          }else{
            updateImageUpload(item.id,JSON.stringify(item.content));
          }
				}else
				  isUploading = false;
					return;
			}
			//图片上传完成后，接着走后面的流程
			doUpdateSyncData();
		}else{
			//如果包含了开始执行，增加了gps转高德地址的操作，所以也需要重新走一遍流程
			if(hasGpsToAmap){
				doUpdateSyncData();
			}else{
				doSync();
			}
		}
	}else{//没有了，直接
		doSync();
	}
	isUploading = false;
}

export async function uploadFile(name,path) {
	let token=await storage.getToken();
	let deviceId=await storage.getDeviceId();
	return new Promise((resolve, reject)=>{
		var xhr = new XMLHttpRequest();
		var postUri = `${getBaseUri()}/popapi/api/images/upload/${name}`;
		xhr.open('POST', postUri);
		xhr.setRequestHeader(TOKENHEADER,token);
		xhr.setRequestHeader(HEADERDEVICEID,deviceId);
		xhr.onload = () => {
			console.warn(xhr.status,xhr.responseText,name,path);
			if (xhr.status !== 200) {
				//上传失败
				resolve(false)
				return;
			}
			if (!xhr.responseText) {
				resolve(false)
				return;
			}
			resolve(true)
		};
		var formdata = new FormData();
		formdata.append('filename',{uri:path,name:name,type:'image/jpg',});
		if (xhr.upload) {
			xhr.upload.onprogress = (event) => {
			};
		}
		xhr.send(formdata);
	})
}
