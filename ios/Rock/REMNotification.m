#import "REMNotification.h"
#import <React/RCTBridge.h>
#import <React/RCTEventDispatcher.h>

#import <UIKit/UIKit.h>
//#import "RCTLog.h"

@implementation REMNotification
{
    NSMapTable *_successCallbacks;
}

RCT_EXPORT_MODULE();

- (NSArray<NSString *> *)supportedEvents {
    return @[@"onNotificationReminder",@"onMessageReminder",@"onNotificationOpened",@"onNotificationRemoved",@"onNotifiConfigInfo"];
}

- (void)setupAndListen:(RCTBridge*)bridge {
    // First set up native bridge
    [self setBridge:bridge];
    // Now set up handler to detect if user takes a screenshot
//    NSOperationQueue *mainQueue = [NSOperationQueue mainQueue];
//    [[NSNotificationCenter defaultCenter] addObserverForName:@"NotificationTaken"
//                                                      object:nil
//                                                       queue:mainQueue
//                                                  usingBlock:^(NSNotification *notification) {
//      NSLog(@"-------NotificationTaken,%@,%@",notification.userInfo,notification.object);
//      [self sendNotificationToNative:notification.object];
//    }];
}

- (void)sendNotificationToNative:(NSDictionary *)dictionary {
  NSLog(@"-------sendNotificationToNative,%@",dictionary);
  
  dispatch_async(dispatch_get_main_queue(), ^{
//      [self sendEventWithName:@"onNotificationReminder" body:dictionary];//warn:Sending `MessageReminder` with no listeners registered.
      [self.bridge.eventDispatcher sendDeviceEventWithName:@"onNotificationReminder" body:dictionary];//succes
//    [self.bridge enqueueJSCall:@"RCTDeviceEventEmitter"
//                        method:@"emit"
//                          args:@[@"onNotificationReminder"]
//                    completion:NULL];
  });
}

- (void)sendMessageToNative:(NSDictionary *)dictionary {
  NSLog(@"-------onMessageReminder,%@",dictionary);
  
  dispatch_async(dispatch_get_main_queue(), ^{
    [self.bridge.eventDispatcher sendDeviceEventWithName:@"onMessageReminder" body:dictionary];
  });
}

- (void)sendNotificationOpenedToNative:(NSDictionary *)dictionary {
  NSLog(@"-------onNotificationOpened,%@",dictionary);
  
  dispatch_async(dispatch_get_main_queue(), ^{
    [self.bridge.eventDispatcher sendDeviceEventWithName:@"onNotificationOpened" body:dictionary];
  });
}

- (void)sendNotificationCloseToNative:(NSDictionary *)dictionary {
   NSLog(@"-------onNotificationRemoved,%@",dictionary);
   
   dispatch_async(dispatch_get_main_queue(), ^{
     [self.bridge.eventDispatcher sendDeviceEventWithName:@"onNotificationRemoved" body:dictionary];
   });
}

- (void)sendNotificationTokenoNative:(NSDictionary *)dictionary {
   NSLog(@"-------onNotifiConfigInfo,%@",dictionary);
   
   dispatch_async(dispatch_get_main_queue(), ^{
     [self.bridge.eventDispatcher sendDeviceEventWithName:@"onNotifiConfigInfo" body:dictionary];
   });
}

@end
