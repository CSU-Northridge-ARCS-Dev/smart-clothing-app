//
//  Controller.m
//  SmartClothingApp
//
//  Created by Emi Jr Anyakpor on 3/3/24.
//  Modified by Gerard Gandionco on 4/18/2024.
//

#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(Controller, NSObject)

// Export all our methods in Controller.

RCT_EXTERN_METHOD(requestAuthorization:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(findHealthData:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(readHeartRateData:(NSString *)startDateIso endDateIso:(NSString *)endDateIso resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(readHeartRateVariabilityData:(NSString *)startDateIso endDateIso:(NSString *)endDateIso resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(readRestingHeartRateData:(NSString *)startDateIso endDateIso:(NSString *)endDateIso resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(readSleepData:(NSString *)startDateIso endDateIso:(NSString *)endDateIso resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(readActivityRingsData:(NSString *)startDateIso endDateIso:(NSString *)endDateIso resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

@end
