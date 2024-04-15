//
//  RNScreenshotDetector.h
//
//  Created by Graham Carling on 1/11/17.
//

#import <React/RCTEventEmitter.h>
#import <React/RCTBridgeModule.h>

@interface REMNotification : RCTEventEmitter <RCTBridgeModule>

- (void)setupAndListen:(RCTBridge*)bridge;

- (void)sendNotificationToNative:(NSDictionary *)dictionary;
- (void)sendMessageToNative:(NSDictionary *)dictionary;
- (void)sendNotificationOpenedToNative:(NSDictionary *)dictionary;
- (void)sendNotificationCloseToNative:(NSDictionary *)dictionary;
- (void)sendNotificationTokenoNative:(NSDictionary *)dictionary;

@end
