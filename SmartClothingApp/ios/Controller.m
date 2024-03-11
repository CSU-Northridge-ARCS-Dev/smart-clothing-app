//
//  Controller.m
//  SmartClothingApp
//
//  Created by Emi Jr Anyakpor on 3/3/24.
//

#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(Controller, NSObject)

// Exports our requestAuthorization method in the class 
RCT_EXTERN_METHOD(requestAuthorization:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

// Exports our findHealthData method in the class
RCT_EXTERN_METHOD(findHealthData:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

@end
