//
//  MyHealthKitModule.m
//  SmartClothingApp
//
//  Created by Emi Jr Anyakpor on 9/20/23.
#import "MyHealthKitModule.h"
#import <HealthKit/HealthKit.h>

@implementation MyHealthKitModule

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(isHealthDataAvailable:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    if ([HKHealthStore isHealthDataAvailable]) {
        resolve(@(YES));
    } else {
        reject(@"UNAVAILABLE", @"HealthKit data is not available", nil);
    }
}

@end

