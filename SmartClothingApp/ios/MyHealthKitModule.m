//
//  RTCBridgeModule.m
//  SmartClothingApp
//
//  Created by Emi Jr Anyakpor on 9/25/23.
//

#import "MyHealthKitModule.h"
#import <HealthKit/HealthKit.h>

// Declare the HKHealthStore instance here
@interface MyHealthKitModule ()
@property (nonatomic, strong) HKHealthStore *healthStore;
@end
@implementation MyHealthKitModule

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(isHealthDataAvailable:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    if ([HKHealthStore isHealthDataAvailable]) {
        resolve(@(YES));
    } else {
        reject(@"UNAVAILABLE", @"HealthKit data is not available", nil);
    }
}

RCT_EXPORT_METHOD(requestHealthKitAuthorization:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    HKHealthStore *healthStore = [[HKHealthStore alloc] init];
    
    // Define the health data types your app wants to read
    NSSet *readTypes = [NSSet setWithObject:[HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierHeartRate]];
    
    // Request authorization to access the specified health data types
    [healthStore requestAuthorizationToShareTypes:nil
                                          readTypes:readTypes
                                       completion:^(BOOL success, NSError * _Nullable error) {
        if (success) {
            // Authorization was granted, you can now proceed with reading heart rate data.
            NSLog(@"HealthKit authorization granted.");
            resolve(@(YES));
        } else {
            // Authorization was denied or there was an error.
            NSLog(@"HealthKit authorization denied or error: %@", error.localizedDescription);
            reject(@"AUTHORIZATION_FAILED", @"HealthKit authorization denied or error.", error);
        }
    }];
}


RCT_EXPORT_METHOD(readHeartRateData:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    // Check if HealthKit is available on this device
    if (![HKHealthStore isHealthDataAvailable]) {
        NSError *error = [NSError errorWithDomain:@"YourAppDomain" code:1 userInfo:@{NSLocalizedDescriptionKey: @"HealthKit is not available on this device."}];
        reject(@"HEALTH_KIT_NOT_AVAILABLE", @"HealthKit is not available on this device.", error);
        return;
    }
    
    // Create sample type for the heart rate
    HKQuantityType *quantityType = [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierHeartRate];
    
    // Create predicate for the last 24 hours
    NSDate *endDate = [NSDate date];
    NSDate *startDate = [endDate dateByAddingTimeInterval:-24*60*60]; // Subtract 24 hours from the current date
    
    NSPredicate *predicate = [HKQuery predicateForSamplesWithStartDate:startDate endDate:endDate options:HKQueryOptionStrictStartDate];
    
    // Set sorting by date
    NSSortDescriptor *sortDescriptor = [NSSortDescriptor sortDescriptorWithKey:HKSampleSortIdentifierStartDate ascending:NO];
    
    // Create the query
    HKSampleQuery *sampleQuery = [[HKSampleQuery alloc] initWithSampleType:quantityType
                                                               predicate:predicate
                                                                   limit:HKObjectQueryNoLimit
                                                         sortDescriptors:@[sortDescriptor]
                                                          resultsHandler:^(HKSampleQuery * _Nonnull query, NSArray<__kindof HKSample *> * _Nullable results, NSError * _Nullable error) {
        if (error) {
            reject(@"QUERY_FAILED", @"Failed to query heart rate data", error);
        } else {
            NSMutableArray *heartRates = [NSMutableArray array];
            for (HKQuantitySample *sample in results) {
                double heartRateValue = [sample.quantity doubleValueForUnit:[HKUnit unitFromString:@"count/min"]];
                [heartRates addObject:@(heartRateValue)];
            }
            resolve(heartRates);
        }
    }];
    
    // Execute the query in the health store
    HKHealthStore *healthStore = [[HKHealthStore alloc] init];
    [healthStore executeQuery:sampleQuery];
}


@end
