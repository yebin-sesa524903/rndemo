//
//  REMAppInfo.m
//  Rock
//
//  Created by Tan on 4/28/16.
//  Copyright © 2016 Facebook. All rights reserved.
//

#import "REMAppInfo.h"

@implementation REMAppInfo

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(exitApp)
{
    exit(0);
};

RCT_EXPORT_METHOD(clearCookie)
{
  NSHTTPCookieStorage *cookieStorage = [NSHTTPCookieStorage sharedHTTPCookieStorage];
  for (NSHTTPCookie *c in cookieStorage.cookies) {
      [cookieStorage deleteCookie:c];
  }
  [[NSUserDefaults standardUserDefaults] synchronize];
};

RCT_REMAP_METHOD(getAppInfo,
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  NSMutableDictionary *infos = [[NSMutableDictionary alloc] init];

  NSString *version = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleShortVersionString"];
  NSString *ossBucket = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"REMOSSBucket"];
  NSString *taskCenterUri = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"REMTaskCenterUri"];
  NSString *uri = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"URI"];
  NSString *upgradeUri = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"UpgradeUri"];
  NSString *umengAppKey = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"UmengAppKey"];
  NSString *gaodeKey = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"GaodeKey"];
  NSString *gaodeSDKKey = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"GaodeSDKKey"];
  NSString *exchangeUri = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"ExchangeUri"];
  NSString *privacyEntryUri = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"PrivacyEntryUri"];
  NSString *privacyMyUri = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"PrivacyMyUri"];
  NSString *host = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"Host"];
  infos[@"versionName"] = version;
  infos[@"ossBucket"] = ossBucket;
  infos[@"prod"] = uri;
  infos[@"upgradeUri"] = upgradeUri;
  infos[@"gaodeKey"] = gaodeKey;
  infos[@"gaodeSDKKey"] = gaodeSDKKey;
  infos[@"umengAppKey"] = umengAppKey;
  infos[@"taskCenterUri"] = taskCenterUri;
  infos[@"exchangeUri"] = exchangeUri;
  infos[@"privacyEntryUri"] = privacyEntryUri;
  infos[@"privacyMyUri"] = privacyMyUri;
  infos[@"host"] = host;
  resolve(infos);

}

@end
