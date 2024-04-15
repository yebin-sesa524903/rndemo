// package com.energymost.rocking;
//
// import android.util.Log;
// import android.app.Activity;
// import android.widget.Toast;
// import android.provider.DocumentsContract;
// import android.provider.MediaStore;
// import android.content.ContentUris;
// import android.os.Environment;
// import android.net.Uri;
// import android.database.Cursor;
// import android.content.Context;
// import android.annotation.TargetApi;
// import android.graphics.Bitmap;
// import android.graphics.BitmapFactory;
//
// import com.facebook.react.bridge.*;
// import com.facebook.react.modules.core.DeviceEventManagerModule;
//
//
// import java.util.ArrayList;
// import java.util.HashMap;
// import java.util.List;
// import java.util.Map;
// import java.io.IOException;
// import java.util.Random;
// import java.io.InputStream;
//
// import com.alibaba.sdk.android.oss.*;
// import com.alibaba.sdk.android.oss.common.auth.OSSCredentialProvider;
// import com.alibaba.sdk.android.oss.common.auth.OSSPlainTextAKSKCredentialProvider;
// import com.alibaba.sdk.android.oss.callback.OSSCompletedCallback;
// import com.alibaba.sdk.android.oss.callback.OSSProgressCallback;
// import com.alibaba.sdk.android.oss.common.utils.BinaryUtil;
// import com.alibaba.sdk.android.oss.internal.OSSAsyncTask;
// import com.alibaba.sdk.android.oss.model.*;
//
//
// public class AliyunOSSModule extends ReactContextBaseJavaModule{
//
//     private OSS oss;
//
//     private OSS getOSS(){
//       if(oss != null){
//         return oss;
//       }
//       else {
//         OSSCredentialProvider credentialProvider = new OSSPlainTextAKSKCredentialProvider(AppInfoModule.OSS_APPKEY, AppInfoModule.OSS_APPSECRET);
//
//         ClientConfiguration conf = new ClientConfiguration();
//         conf.setConnectionTimeout(15 * 1000); // 连接超时，默认15秒
//         conf.setSocketTimeout(60 * 1000); // socket超时，默认15秒
//         conf.setMaxConcurrentRequest(10); // 最大并发请求书，默认5个
//         conf.setMaxErrorRetry(2); // 失败后最大重试次数，默认2次
//         // OSSLog.enableLog();
//         oss = new OSSClient(context, AppInfoModule.OSS_URI, credentialProvider, conf);
//         return oss;
//       }
//     }
//
//     private ReactApplicationContext context;
//
//     public AliyunOSSModule(ReactApplicationContext reactContext) {
//         super(reactContext);
//         context = reactContext;
//     }
//
//     @ReactMethod
//     public void delete(String bucket,String name){
//       try{
//         DeleteObjectRequest deleteRequest = new DeleteObjectRequest(bucket, name);
//         DeleteObjectResult deleteResult = getOSS().deleteObject(deleteRequest);
//         if (deleteResult.getStatusCode() == 204) {
//             Log.d("DeleteObject", "Success."+name);
//         }
//       }
//       catch(Exception exc){
//         Log.e("DeleteObject",exc.getMessage());
//       }
//
//     }
//
//
//     @ReactMethod
//     public void upload(String uploadFilePath,final String bucket,final String name,final Callback cb){
//
//         String filePath = Util.getImageAbsolutePath(getReactApplicationContext(),uploadFilePath);
//
//         if(filePath == null){
//           Log.e("AliyunOSS","File not found:"+uploadFilePath);
//           cb.invoke("fail","notfound");
//           return ;
//         }
//
//         byte[] imageData = Util.compressImage(filePath);
//         Log.d("image data size", "imageData:"+imageData.length);
//
//         // 构造上传请求
//         PutObjectRequest put = new PutObjectRequest(bucket, name, imageData);
//
//         // 异步上传时可以设置进度回调
//         put.setProgressCallback(new OSSProgressCallback<PutObjectRequest>() {
//             @Override
//             public void onProgress(PutObjectRequest request, long currentSize, long totalSize) {
//                 // Log.d("PutObject", "currentSize: " + currentSize + " totalSize: " + totalSize);
//                 //cb.invoke("uploading",(int)currentSize,(int)totalSize);
//                 WritableMap args = Arguments.createMap();
//                 args.putInt("currentSize",(int)currentSize);
//                 args.putInt("totalSize",(int)totalSize);
//                 args.putString("name",name);
//                 getEventEmitter().emit("oss_uploading", args);
//             }
//         });
//
//         OSSAsyncTask task = getOSS().asyncPutObject(put, new OSSCompletedCallback<PutObjectRequest, PutObjectResult>() {
//             @Override
//             public void onSuccess(PutObjectRequest request, PutObjectResult result) {
//                 Log.d("PutObject", "UploadSuccess");
//                 //
//                 // Log.d("ETag", result.getETag());
//                 // Log.d("RequestId", result.getRequestId());
//                 cb.invoke("success");
//             }
//
//             @Override
//             public void onFailure(PutObjectRequest request, ClientException clientExcepion, ServiceException serviceException) {
//                 // 请求异常
//                 if (clientExcepion != null) {
//                     // 本地异常如网络异常等
//                     clientExcepion.printStackTrace();
//                 }
//                 if (serviceException != null) {
//                     // 服务异常
//                     Log.e("ErrorCode", serviceException.getErrorCode());
//                     Log.e("RequestId", serviceException.getRequestId());
//                     Log.e("HostId", serviceException.getHostId());
//                     Log.e("RawMessage", serviceException.getRawMessage());
//                 }
//             }
//         });
//     }
//
//     @Override
//     public String getName() {
//         return "AliyunOSS";
//     }
//
//     private DeviceEventManagerModule.RCTDeviceEventEmitter getEventEmitter() {
//       return getReactApplicationContext()
//           .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
//     }
//
//
//
//
// }
