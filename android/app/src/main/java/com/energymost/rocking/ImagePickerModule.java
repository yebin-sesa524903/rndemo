// package com.energymost.rocking;
//
// import com.energymost.rocking.R;
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
// import android.graphics.Color;
// import android.graphics.BitmapFactory;
//
// import com.facebook.react.bridge.*;
// import com.facebook.react.modules.core.DeviceEventManagerModule;
//
// import com.facebook.drawee.backends.pipeline.Fresco;
// import com.facebook.imagepipeline.core.ImagePipelineConfig;
//
// import java.util.ArrayList;
// import java.util.HashMap;
// import java.util.List;
// import java.util.Map;
// import java.io.IOException;
// import java.io.File;
// import java.util.Random;
// import java.io.InputStream;
//
//
// import cn.finalteam.galleryfinal.CoreConfig;
// import cn.finalteam.galleryfinal.FunctionConfig;
// import cn.finalteam.galleryfinal.GalleryFinal;
// import cn.finalteam.galleryfinal.PauseOnScrollListener;
// import cn.finalteam.galleryfinal.ThemeConfig;
// import cn.finalteam.galleryfinal.model.PhotoInfo;
// import cn.finalteam.galleryfinal.widget.HorizontalListView;
// import cn.finalteam.galleryfinal.ImageLoader;
//
// public class ImagePickerModule extends ReactContextBaseJavaModule{
//
//     private final int REQUEST_CODE_CAMERA = 1000;
//     private final int REQUEST_CODE_GALLERY = 1001;
//
//     private final String GREEN = "#03b679";
//
//     // private final FunctionConfig functionConfig;
//
//     public ImagePickerModule(ReactApplicationContext reactContext) {
//         super(reactContext);
//
//         ThemeConfig theme = new ThemeConfig.Builder()
//                                     .setTitleBarBgColor(Color.parseColor(GREEN))
//                                     .setTitleBarTextColor(Color.WHITE)
//                                     .setTitleBarIconColor(Color.WHITE)
//                                     .setFabNornalColor(Color.parseColor(GREEN))
//                                     .setFabPressedColor(Color.parseColor(GREEN))
//                                     .setCheckNornalColor(Color.LTGRAY)
//                                     .setCheckSelectedColor(Color.parseColor(GREEN))
//                                     .setIconBack(R.drawable.ic_arrow_back_white_24dp)
//                                     .setIconCamera(R.drawable.ic_photo_camera_white_24dp)
//                                     .build();
//         //配置功能
//         // FunctionConfig functionConfig = new FunctionConfig.Builder()
//         //         .setEnableCamera(true)
//         //         .setEnablePreview(true)
//         //         .setMutiSelectMaxSize(12)
//         //         .build();
//
//         //配置imageloader
//         ImageLoader imageLoader1 = new FrescoImageLoader(reactContext);
//         CoreConfig coreConfig = new CoreConfig.Builder(reactContext, imageLoader1, theme)
//                 // .setFunctionConfig(functionConfig)
//                 .build();
//         GalleryFinal.init(coreConfig);
//
//         initFresco();
//     }
//
//     @ReactMethod
//     public void pickImage(int left,final Promise promise){
//       FunctionConfig functionConfig = new FunctionConfig.Builder()
//               .setEnableCamera(true)
//               .setEnablePreview(true).setMutiSelectMaxSize(left).build();
//
//       GalleryFinal.openGalleryMuti(REQUEST_CODE_GALLERY, functionConfig, new GalleryFinal.OnHanlderResultCallback() {
//           @Override
//           public void onHanlderSuccess(int reqeustCode, List<PhotoInfo> resultList) {
//               if (resultList != null) {
//                 // Log.w("ImagePicker",resultList.toString());
//                 // Log.w("ImagePicker",resultList.get(0).getPhotoPath());
//                 WritableArray array = Arguments.createArray();
//                 for(PhotoInfo info : resultList){
//                   Log.d("pickImage",info.getPhotoPath());
//                   WritableMap map = Arguments.createMap();
//                   map.putString("name",info.getPhotoPath());
//                   map.putString("uri",Util.getImageContentUri(getReactApplicationContext(),
//                     new File(info.getPhotoPath())).toString());
//                   array.pushMap(map);
//                 }
//                 promise.resolve(array);
//               }
//           }
//
//           @Override
//           public void onHanlderFailure(int requestCode, String errorMsg) {
//               // Toast.makeText(reactContext, errorMsg, Toast.LENGTH_SHORT).show();
//           }
//         });
//     }
//
//     @Override
//     public String getName() {
//         return "ImagePicker";
//     }
//
//
//
//     private void initFresco() {
//         ImagePipelineConfig config = ImagePipelineConfig.newBuilder(getReactApplicationContext())
//                 .setBitmapsConfig(Bitmap.Config.ARGB_8888)
//                 .build();
//         Fresco.initialize(getReactApplicationContext(), config);
//     }
//
//     private DeviceEventManagerModule.RCTDeviceEventEmitter getEventEmitter() {
//       return getReactApplicationContext()
//           .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
//     }
//
// }
