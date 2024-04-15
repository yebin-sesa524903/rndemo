package com.energymost.rocking;

import android.app.Application;
import android.util.Log;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager.NameNotFoundException;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.ApplicationInfo;

import com.facebook.react.ReactApplication;
import community.revteltech.nfc.NfcManagerPackage;
import com.swmansion.gesturehandler.RNGestureHandlerPackage;
import com.reactnativecommunity.webview.RNCWebViewPackage;
//import com.reactnativecommunity.art.ARTPackage;
import com.reactnativecommunity.viewpager.RNCViewPagerPackage;
import com.reactnativecommunity.netinfo.NetInfoPackage;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import com.rssignaturecapture.RSSignatureCapturePackage;
import fr.bamlab.rnimageresizer.ImageResizerPackage;
import cl.json.RNSharePackage;
import com.beefe.picker.PickerViewPackage;
import com.brentvatne.react.ReactVideoPackage;
import fr.greweb.reactnativeviewshot.RNViewShotPackage;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import com.localz.PinchPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.kishanjvaghela.cardview.RNCardViewPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.horcrux.svg.SvgPackage;
import org.reactnative.camera.RNCameraPackage;
import com.babisoft.ReactNativeLocalization.ReactNativeLocalizationPackage;
import com.reactnativecommunity.cameraroll.CameraRollPackage;
import com.devialab.detectNewPhoto.RCTDetectNewPhotoPackage;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
//import com.joshblour.reactnativepermissions.ReactNativePermissionsPackage;
import com.zoontek.rnpermissions.RNPermissionsPackage;
import com.github.yamill.orientation.OrientationPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.mehcode.reactnative.splashscreen.SplashScreenPackage;
import com.reactcommunity.rndatetimepicker.RNDateTimePickerPackage;
import com.reactlibrary.securekeystore.RNSecureKeyStorePackage;

import java.util.Arrays;
import java.util.List;

import com.imagepicker.ImagePickerPackage;
import com.fileopener.FileOpenerPackage;
import com.rnfs.RNFSPackage;
import com.facebook.react.bridge.ReactApplicationContext;
import android.content.Context;
import org.json.JSONObject;
import java.util.ArrayList;
import org.json.JSONException;
import org.pgsqlite.SQLitePluginPackage;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import android.graphics.Color;
import com.gyf.cactus.Cactus;

import com.facebook.soloader.SoLoader;
//import androidx.multidex.MultiDexApplication;


public class MainApplication extends Application implements ReactApplication {

    private static final String TAG = "Rock";

  // debug 时，初始化 SDK 使用测试项目数据接收 URL 、使用 DEBUG_AND_TRACK 模式；
  // release 时，初始化 SDK 使用正式项目数据接收 URL 、使用 DEBUG_OFF 模式。
    private boolean isDebugMode;

    @Override
    public void onCreate() {
        super.onCreate();
        SoLoader.init(this,false);

    }

  /**
   * @param context App 的 Context
   * @return debug return true,release return false
   * 用于判断是 debug 包，还是 relase 包
   */
  public static boolean isDebugMode(Context context) {
      try {
          ApplicationInfo info = context.getApplicationInfo();
          return (info.flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;
      } catch (Exception e) {
          e.printStackTrace();
          return false;
      }
  }

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {

   @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    // @Override
    // protected String getJSBundleFile() {
    //   return UpdateContext.getBundleUrl(MainApplication.this);
    // }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
          new NfcManagerPackage(),
            new RNGestureHandlerPackage(),
          new RNSecureKeyStorePackage(),
          new RNCWebViewPackage(),
          new RNDateTimePickerPackage(),
          //new ARTPackage(),
          new CameraRollPackage(),
          new RNCViewPagerPackage(),
          new NetInfoPackage(),
          new AsyncStoragePackage(),
          new RSSignatureCapturePackage(),
          new ImageResizerPackage(),
          new RNSharePackage(),
          new PickerViewPackage(),
          new SQLitePluginPackage(),
          new ReactVideoPackage(),
          new RNViewShotPackage(),
          new PickerPackage(),
          new PinchPackage(),
          new LinearGradientPackage(),
          new RNCardViewPackage(),
          new RNFetchBlobPackage(),
          new SvgPackage(),
          new RNCameraPackage(),
          new ReactNativeLocalizationPackage(),
          new AppInfoPackage(),
          new ImagePickerPackage(),
          //new ReactNativePermissionsPackage(),
          new RNPermissionsPackage(),
          new FileOpenerPackage(),
          new RNFSPackage(),
          new OrientationPackage(),
          new RCTDetectNewPhotoPackage(),
          new SplashScreenPackage(),
          new RNDeviceInfo()
      );
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
      return mReactNativeHost;
  }
}
