package com.energymost.rocking;

import com.facebook.react.ReactActivity;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.github.yamill.orientation.OrientationPackage;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactContext;

import android.content.ComponentName;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager.NameNotFoundException;
import android.net.Uri;
import android.os.Bundle;
import android.os.PowerManager;
import android.provider.Settings;
import android.util.Log;
import android.app.Activity;
import android.content.Intent;
import android.app.Dialog;
import android.view.View;
import java.lang.reflect.Field;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import android.os.Build;
import android.content.Context;
import com.scottyab.rootbeer.RootBeer;
import android.app.AlertDialog;
import android.content.DialogInterface;
// import com.microsoft.codepush.react.CodePush;
// import com.imagepicker.ImagePickerPackage;
//

import com.mehcode.reactnative.splashscreen.SplashScreen;
// import com.lwansbrough.RCTCamera.*;

import android.content.Intent;
import android.content.res.Configuration;

import androidx.annotation.RequiresApi;

import org.json.JSONException;
import org.json.JSONObject;
public class MainActivity extends ReactActivity {

    private static final String ONEPLUS = "oneplus";
    private static final String MOTO = "moto";
    private static final String XIAOMI = "Xiaomi";
    private static final String SJ360 = "360";
    // public MainActivity(){
    //   super();
    //
    //   show();
    // }

    // Dialog mSplashDialog;
    //
    //
    // void show() {
    //     if (mSplashDialog != null && mSplashDialog.isShowing()) {
    //         // Splash screen is open
    //         return;
    //     }
    //
    //     this.runOnUiThread(new Runnable() {
    //         @Override
    //         public void run() {
    //             if (mSplashDialog == null) {
    //                 mSplashDialog = new Dialog(MainActivity.this, R.style.SplashTheme);
    //                 mSplashDialog.setCancelable(false);
    //             }
    //
    //             if (!MainActivity.this.isFinishing()) {
    //                 mSplashDialog.show();
    //             }
    //         }
    //     });
    // }
    //
    // public void hide(){
    //   if (mSplashDialog == null || !mSplashDialog.isShowing()) {
    //       // Not showing splash screen
    //       return;
    //   }
    //
    //   this.runOnUiThread(new Runnable() {
    //       @Override
    //       public void run() {
    //           mSplashDialog.dismiss();
    //       }
    //   });
    // }


    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "Rock";
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
      super.onConfigurationChanged(newConfig);
      Intent intent = new Intent("onConfigurationChanged");
      intent.putExtra("newConfig", newConfig);
      this.sendBroadcast(intent);
    }

    public void checkDeviceRootStatus(Context mContext) {
        RootBeer rootBeer = new RootBeer(mContext);

        boolean isRooted;
        if (Build.BRAND.contains(ONEPLUS) || Build.BRAND.contains(MOTO) ||
          Build.BRAND.contains(XIAOMI) || Build.BRAND.contains(SJ360)) {
            isRooted = rootBeer.isRootedWithoutBusyBoxCheck();
        } else {
            isRooted = rootBeer.isRooted();
        }
        if (isRooted){
          AlertDialog.Builder builder = new AlertDialog.Builder(this);
          builder.setTitle("温馨提醒");
          builder.setMessage("为保障用户安全，本产品不支持在Root设备上运行");
          builder.setCancelable(false);
          builder.setPositiveButton("确定",new DialogInterface.OnClickListener() {
              @Override
              public void onClick(DialogInterface dialog, int which) {
                finish();
              }
          });
          // builder.setNegativeButton("取消",null);
          AlertDialog alertDialog = builder.create();
          alertDialog.show();
        }
    }

    void setSplashView(final Class cls,final View view){
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try{
                        Field field=cls.getDeclaredField("mSplashDialog");
                        field.setAccessible(true);
                        Dialog d=(Dialog)field.get(null);
                        if(d!=null&&d.isShowing()){
                            d.setContentView(view);
                        }
                    }catch (Exception e){
                        e.printStackTrace();
                    }
                }
            });

        }

    @RequiresApi(api = Build.VERSION_CODES.M)
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        View v=getLayoutInflater().inflate(R.layout.splash,null);
        SplashScreen.show(this, getReactInstanceManager());
        setSplashView(SplashScreen.class,v);
        Log.e("os version","--->"+String.format("%s %s",Build.VERSION.SDK_INT,Build.VERSION.BASE_OS));
//        checkDeviceRootStatus(this.getBaseContext());
        Log.e("getAppName",getAppName(this));

    }

  public static String getAppName(Context context) {
    if (context == null) {
      return null;
    }
    try {
      PackageManager packageManager = context.getPackageManager();
      return String.valueOf(packageManager.getApplicationLabel(context.getApplicationInfo()));
    } catch (Throwable e) {
      Log.i("getAppName","getAppName >> e:" + e.toString());
    }
    return null;
  }


  /**
   * 跳转到指定应用的首页
   */
  private void showActivity(String packageName) {
    Intent intent = getPackageManager().getLaunchIntentForPackage(packageName);
    startActivity(intent);
  }

  /**
   * 跳转到指定应用的指定页面
   */
  private void showActivity(String packageName, String activityDir) {
    Intent intent = new Intent();
    intent.setComponent(new ComponentName(packageName, activityDir));
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    startActivity(intent);
  }

  private void goHuaweiSetting() {
    try {
      showActivity("com.huawei.systemmanager",
        "com.huawei.systemmanager.startupmgr.ui.StartupNormalAppListActivity");
    } catch (Exception e) {
      e.printStackTrace();
      try {
        showActivity("com.huawei.systemmanager",
          "com.huawei.systemmanager.optimize.bootstart.BootStartActivity");
      }catch (Exception e2 ){
        e2.printStackTrace();
        try {
          Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
          intent.setData(Uri.parse("package:" + getPackageName()));
          startActivity(intent);
        } catch (Exception e3) {
          e3.printStackTrace();
        }
      }

    }
  }

  @RequiresApi(api = Build.VERSION_CODES.M)
  private boolean isIgnoringBatteryOptimizations() {
    boolean isIgnoring = false;
    PowerManager powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
    if (powerManager != null) {
      isIgnoring = powerManager.isIgnoringBatteryOptimizations(getPackageName());
    }
    return isIgnoring;
  }


  @Override
  public void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    String action = intent.getAction();
    if("localNotification".equals(action)){
      String title = intent.getStringExtra("title");
      String content = intent.getStringExtra("content");
      String id = intent.getStringExtra("id");
      String type = intent.getStringExtra("type");
      WritableMap params = Arguments.createMap();
      params.putString("content", content);
      params.putString("title", title);
      params.putString("InfoKey", id);
      params.putString("PushInfoType", type);
      runOnUiThread(new Runnable() {
        @Override
        public void run() {

        }
      });

    }
  }
}
