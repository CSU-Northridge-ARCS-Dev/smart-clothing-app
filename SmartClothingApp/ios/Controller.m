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

// Exports our readHeartRateData method in the class
RCT_EXTERN_METHOD(readHeartRateData:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

// Exports our readHeartRateVariabilityData method in the class
RCT_EXTERN_METHOD(readHeartRateVariabilityData:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

// Exports our  method in the class
RCT_EXTERN_METHOD(readRestingHeartRateData:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

// Exports our sleepData method in the class
RCT_EXTERN_METHOD(readSleepData:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

// Exports our activity rings method
RCT_EXTERN_METHOD(readActivityRingsData:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

@end
