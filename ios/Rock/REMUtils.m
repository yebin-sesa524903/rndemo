//
//  REMUtils.m
//  HipRock
//
//  Created by SamuelMac on 2018/4/27.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import "REMUtils.h"
#import <UIKit/UIKit.h>

#define ARRAY_SIZE(a) sizeof(a)/sizeof(a[0])

const char* jailbreak_tool_pathes[] = {
  "/Applications/Cydia.app",
  "/Library/MobileSubstrate/MobileSubstrate.dylib",
  "/bin/bash",
  "/usr/sbin/sshd",
  "/etc/apt"
};

@implementation REMUtils

+(BOOL)isOtherJailbroken
{
  if ([[[NSBundle mainBundle] infoDictionary] objectForKey: @"SignerIdentity"] != nil) {
    return YES;
  }
  NSString* bundlePath = [[NSBundle mainBundle] bundlePath];
  
  BOOL fileExists = [[NSFileManager defaultManager] fileExistsAtPath:(@"%@/_CodeSignature", bundlePath)];
  
  if (!fileExists) {
    return YES;
  }
  
  BOOL fileExists2 = [[NSFileManager defaultManager] fileExistsAtPath:(@"%@/CodeResources", bundlePath)];
  
  if (!fileExists2) {
    return YES;
  }
  
  BOOL fileExists3 = [[NSFileManager defaultManager] fileExistsAtPath:(@"%@/ResourceRules.plist", bundlePath)];
  
  if (!fileExists3) {
    return YES;
  }
  return NO;
}

+ (BOOL)isJailBreak
{
  #if TARGET_IPHONE_SIMULATOR
  #else
    for (int i=0; i<ARRAY_SIZE(jailbreak_tool_pathes); i++) {
      if ([[NSFileManager defaultManager] fileExistsAtPath:[NSString stringWithUTF8String:jailbreak_tool_pathes[i]]]) {
        NSLog(@"The device is jail broken!,%@",[NSString stringWithUTF8String:jailbreak_tool_pathes[i]]);
        return YES;
      }
    }
  #endif
  
  if ([REMUtils isOtherJailbroken]) {
    return YES;
  }
  NSLog(@"The device is NOT jail broken!");
  return NO;
}

@end
