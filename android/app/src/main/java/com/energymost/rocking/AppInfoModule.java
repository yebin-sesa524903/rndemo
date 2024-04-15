package com.energymost.rocking;

import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.ApplicationInfo;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.Map;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.Arguments;
import android.util.Log;

public class AppInfoModule extends ReactContextBaseJavaModule {

  static String OSS_URI = "http://oss-cn-hangzhou.aliyuncs.com";
  static String OSS_APPKEY;
  static String OSS_APPSECRET;


  public AppInfoModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }


  @Override
  public String getName() {
    return "REMAppInfo";
  }

  @ReactMethod
  public void getAppInfo(Promise promise) {
 		try {
      ReactApplicationContext context = this.getReactApplicationContext();
 			String pkName = context.getPackageName();
      PackageInfo packageInfo = context.getPackageManager().getPackageInfo(pkName, 0);
 			String versionName = packageInfo.versionName;
      String packageName = packageInfo.packageName;

      ApplicationInfo appInfo = context.getPackageManager().getApplicationInfo(pkName,PackageManager.GET_META_DATA);
      String ossBucket=appInfo.metaData.getString("com.energymost.rocking.oss.bucket");
      String prodUri = appInfo.metaData.getString("com.energymost.rocking.prodUri");
      String upgradeUri = appInfo.metaData.getString("com.energymost.rocking.upgradeUri");
      String taskCenterUri = appInfo.metaData.getString("com.energymost.rocking.taskCenterUri");
      String gaodeKey = appInfo.metaData.getString("com.energymost.rocking.gaodeKey");
      String exchangeUri = appInfo.metaData.getString("com.energymost.rocking.exchangeUri");
      String privacyEntryUri = appInfo.metaData.getString("com.energymost.rocking.privacyEntryUri");
      String privacyMyUri = appInfo.metaData.getString("com.energymost.rocking.privacyMyUri");
      String buglyKey = appInfo.metaData.getString("com.energymost.rocking.buglyKey");
      String host = appInfo.metaData.getString("com.energymost.rocking.host");

      WritableMap map = Arguments.createMap();
      map.putString("packageName",packageName);
      map.putString("versionName",versionName);
      map.putString("ossBucket",ossBucket);
      map.putString("prod",prodUri);
      map.putString("upgradeUri",upgradeUri);
      map.putString("taskCenterUri",taskCenterUri);
      map.putString("gaodeKey",gaodeKey);
      map.putString("exchangeUri",exchangeUri);
      map.putString("privacyEntryUri",privacyEntryUri);
      map.putString("privacyMyUri",privacyMyUri);
      map.putString("buglyKey",buglyKey);
      map.putString("host",host);
 			promise.resolve(map);
 		} catch (Exception e) {
      promise.reject(e);
 		}
 	}
}
