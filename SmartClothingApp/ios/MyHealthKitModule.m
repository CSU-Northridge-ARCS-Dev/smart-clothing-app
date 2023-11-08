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
  HKWorkoutType *workoutType = [HKObjectType workoutType];
  NSSet *readTypes = [NSSet setWithObjects:
      [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierHeartRate],
      [HKObjectType categoryTypeForIdentifier:HKCategoryTypeIdentifierSleepAnalysis],
      [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierVO2Max],
      [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierActiveEnergyBurned],
      [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierAppleExerciseTime],
      [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierAppleStandTime],
      [HKObjectType activitySummaryType],
      workoutType, // Include this line to request access to workout data
      nil];


    // Request authorization to access the specified health data types
    [healthStore requestAuthorizationToShareTypes:nil
                                          readTypes:readTypes
                                       completion:^(BOOL success, NSError * _Nullable error) {
        if (success) {
            // Authorization was granted, you can now proceed with reading data.
            NSLog(@"readHealthKitAutho: HealthKit authorization granted. With read data");
            resolve(@(YES));
        } else {
            // Authorization was denied or there was an error.
            NSLog(@"HealthKit authorization denied or error: %@", error.localizedDescription);
            reject(@"AUTHORIZATION_FAILED", @"HealthKit authorization denied or error.", error);
        }
    }];
}



RCT_EXPORT_METHOD(readHeartRateData:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  if (![HKHealthStore isHealthDataAvailable]) {
    NSError *error = [NSError errorWithDomain:@"YourAppDomain" code:1 userInfo:@{NSLocalizedDescriptionKey: @"HealthKit is not available on this device."}];
    reject(@"HEALTH_KIT_NOT_AVAILABLE", @"HealthKit is not available on this device.", error);
    return;
  }
  
  // Initialize a HealthStore instance
  HKHealthStore *healthStore = [[HKHealthStore alloc] init];
  
  // Define quantity type for heart rate
  HKQuantityType *quantityType = [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierHeartRate];
  NSDate *endDate = [NSDate date];
  NSDate *startDate = [endDate dateByAddingTimeInterval:-24 * 60 * 60];
  
  NSPredicate *predicate = [HKQuery predicateForSamplesWithStartDate:startDate
                                                endDate:endDate
                                            options:HKQueryOptionNone];

  
  // Sort descriptor for sorting samples by start date
  NSSortDescriptor *sortDescriptor = [NSSortDescriptor sortDescriptorWithKey:HKSampleSortIdentifierStartDate ascending:NO];
  
  // Date formatter to convert dates to ISO 8601 format
  NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
  [dateFormatter setDateFormat:@"yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"];
  [dateFormatter setTimeZone:[NSTimeZone timeZoneWithAbbreviation:@"UTC"]];
  
  // Create an array to store all heart rate data
  NSMutableArray *heartRateData = [NSMutableArray array];

  // Create a sample query for heart rate data
  HKSampleQuery *heartRateQuery = [[HKSampleQuery alloc] initWithSampleType:quantityType
                                                                predicate:predicate
                                                                    limit:HKObjectQueryNoLimit
                                                          sortDescriptors:@[sortDescriptor]
                                                           resultsHandler:^(HKSampleQuery * _Nonnull query, NSArray<__kindof HKSample *> * _Nullable results, NSError * _Nullable error) {
      if (error) {
          reject(@"QUERY_FAILED", @"Failed to query heart rate data", error);
      } else {
        
        
        // Handle the results to extract heart rate values and dates
          for (HKQuantitySample *sample in results) {
              double heartRateValue = [sample.quantity doubleValueForUnit:[HKUnit unitFromString:@"count/min"]];
              NSDate *sampleDate = sample.startDate;
              NSString *iso8601DateString = [dateFormatter stringFromDate:sampleDate];

              NSDictionary *dataPoint = @{
                  @"heartRate": @(heartRateValue),
                  @"date": iso8601DateString
              };
              [heartRateData addObject:dataPoint];
          }

          // Resolve the promise with the extracted data
          resolve(heartRateData);
      }
  }];

  // Execute the heart rate query
  [healthStore executeQuery:heartRateQuery];
  }







RCT_EXPORT_METHOD(readVO2MaxData:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    if (![HKHealthStore isHealthDataAvailable]) {
        NSError *error = [NSError errorWithDomain:@"YourAppDomain" code:1 userInfo:@{NSLocalizedDescriptionKey: @"HealthKit is not available on this device."}];
        reject(@"HEALTH_KIT_NOT_AVAILABLE", @"HealthKit is not available on this device.", error);
        return;
    }

    // Define the quantity type for VO2 Max data
    HKQuantityType *vo2MaxType = [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierVO2Max];

    // Create a date range for the query (adjust as needed)
    NSDate *endDate = [NSDate date];
    NSDate *startDate = [endDate dateByAddingTimeInterval:-24 * 60 * 60]; //seconds

    NSPredicate *predicate = [HKQuery predicateForSamplesWithStartDate:startDate
                                                           endDate:endDate
                                                           options:HKQueryOptionNone];

    NSSortDescriptor *sortDescriptor = [NSSortDescriptor sortDescriptorWithKey:HKSampleSortIdentifierStartDate ascending:NO];

    HKSampleQuery *sampleQuery = [[HKSampleQuery alloc] initWithSampleType:vo2MaxType
                                                             predicate:predicate
                                                                 limit:HKObjectQueryNoLimit
                                                       sortDescriptors:@[sortDescriptor]
                                                        resultsHandler:^(HKSampleQuery * _Nonnull query, NSArray<__kindof HKSample *> * _Nullable results, NSError * _Nullable error) {
        if (error) {
            reject(@"QUERY_FAILED", @"Failed to query VO2 Max data", error);
        } else {
            NSMutableArray *vo2MaxData = [NSMutableArray array];
            for (HKQuantitySample *sample in results) {
                double vo2MaxValue = [sample.quantity doubleValueForUnit:[HKUnit unitFromString:@"ml/kg/min"]];
                NSDate *sampleDate = sample.startDate;
                NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
                [dateFormatter setDateFormat:@"yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"];
                [dateFormatter setTimeZone:[NSTimeZone timeZoneWithAbbreviation:@"UTC"]];
                NSString *iso8601DateString = [dateFormatter stringFromDate:sampleDate];
              
              NSLog(@"Sample sample date: %@", iso8601DateString);
              
                NSDictionary *dataPoint = @{
                    @"vo2MaxValue": @(vo2MaxValue),
                    @"date": iso8601DateString
                };
              
                [vo2MaxData addObject:dataPoint];
            }
            resolve(vo2MaxData);
        }
    }];

    [self.healthStore executeQuery:sampleQuery];
}
// i need to find how to pair apple heealth app to the apple healthkit activity
RCT_EXPORT_METHOD(fillActivityRings:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
    HKHealthStore *healthStore = [HKHealthStore new];

    // Check the authorization status for activity data
    HKAuthorizationStatus activityStatus = [healthStore authorizationStatusForType:[HKObjectType activitySummaryType]];
  // Check the authorization status for heart rate data
//  HKAuthorizationStatus heartRateStatus = [healthStore authorizationStatusForType:[HKQuantityType quantityTypeForIdentifier:HKQuantityTypeIdentifierHeartRate]];
//  if (heartRateStatus != HKAuthorizationStatusSharingAuthorized) {
//      NSLog(@"HealthKit heart rate data authorization denied or not requested.");
//      reject(@"HEALTHKIT_HEART_RATE_AUTH_ERROR", @"HealthKit heart rate data not authorized or denied.", nil);
//  } else {
//      // Authorization was granted, proceed with reading heart rate data
//      NSLog(@"HealthKit heart rate authorization granted.");
//  }

    if (![HKHealthStore isHealthDataAvailable]) {
        NSLog(@"HealthKit data is not available.");
    } else {
        // Authorization was granted, proceed with reading data
        NSLog(@"fillActivityRings: HealthKit authorization granted.");
    }

    if (activityStatus != HKAuthorizationStatusSharingAuthorized) {
        NSLog(@"HealthKit activity data authorization denied or not requested.");
        reject(@"HEALTHKIT_AUTH_ERROR", @"HealthKit activity data not authorized or denied.", nil);
    } else {
        // Authorization was granted, proceed with reading data
        NSLog(@"HealthKit ACTIVITY data authorization granted.");
    }

    // Create an NSCalendar with the desired calendar identifier
    NSCalendar *calendar = [[NSCalendar alloc] initWithCalendarIdentifier:NSCalendarIdentifierGregorian];

    NSDate *now = [NSDate date];
    NSDate *startOfDay = [calendar startOfDayForDate:now];

    // Create NSDateComponents and set the calendar explicitly
    NSDateComponents *components = [calendar components:NSCalendarUnitYear | NSCalendarUnitMonth | NSCalendarUnitDay fromDate:startOfDay];
    components.calendar = calendar;

    NSPredicate *predicate = [HKQuery predicateForActivitySummaryWithDateComponents:components];

    // Create an HKActivitySummaryQuery
    HKActivitySummaryQuery *query = [[HKActivitySummaryQuery alloc] initWithPredicate:predicate resultsHandler:^(HKActivitySummaryQuery *query, NSArray<HKActivitySummary *> *activitySummaries, NSError *error) {
        if (activitySummaries) {
            for (HKActivitySummary *summary in activitySummaries) {
                HKQuantity *moveData = summary.activeEnergyBurned;
                double moveValue = [moveData doubleValueForUnit:[HKUnit kilocalorieUnit]];

                /* Commented out unused data types
                HKQuantity *exerciseData = summary.appleExerciseTime;
                double exerciseValue = [exerciseData doubleValueForUnit:[HKUnit minuteUnit]];

                HKQuantity *standData = summary.appleStandHours;
                double standValue = [standData doubleValueForUnit:[HKUnit countUnit]];
                */

                NSDictionary *result = @{
                    @"Move": @(moveValue),
                    // Commented out unused data types
                    // @"Exercise": @(exerciseValue),
                    // @"Stand": @(standValue)
                };

                // Log the result data
                NSLog(@"Result: %@", result);
                resolve(result);
            }
        } else {
            reject(@"ACTIVITY_RINGS_ERROR", @"Failed to retrieve activity rings data", error);
        }
    }];

    // Set an update handler to monitor updates
    query.updateHandler = ^(HKActivitySummaryQuery *query, NSArray<HKActivitySummary *> *updatedActivitySummaries, NSError *error) {
        // Handle updates to activity summary data here
        if (updatedActivitySummaries) {
            for (HKActivitySummary *summary in updatedActivitySummaries) {
                // Process each updated summary here.
                HKQuantity *moveData = summary.activeEnergyBurned;
                double moveValue = [moveData doubleValueForUnit:[HKUnit kilocalorieUnit]];

                /* Commented out unused data types
                HKQuantity *exerciseData = summary.appleExerciseTime;
                double exerciseValue = [exerciseData doubleValueForUnit:[HKUnit minuteUnit]];

                HKQuantity *standData = summary.appleStandHours;
                double standValue = [standData doubleValueForUnit:[HKUnit countUnit]];
                */

                NSDictionary *result = @{
                    @"Move": @(moveValue),
                    // Commented out unused data types
                    // @"Exercise": @(exerciseValue),
                    // @"Stand": @(standValue)
                };

                // Log the updated result data
                NSLog(@"Updated Result: %@", result);
                // You can add custom logic here to handle updates as needed.
            }
        } else {
            // Handle errors or lack of updates by logging to the console
            NSLog(@"No updates or error in updateHandler: %@", error);
        }
    };

    // Execute the query
    [healthStore executeQuery:query];
}






//RCT_EXPORT_METHOD(readSleepAndHeartRateData:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
//    if (![HKHealthStore isHealthDataAvailable]) {
//        NSError *error = [NSError errorWithDomain:@"YourAppDomain" code:1 userInfo:@{NSLocalizedDescriptionKey: @"HealthKit is not available on this device."}];
//        reject(@"HEALTH_KIT_NOT_AVAILABLE", @"HealthKit is not available on this device.", error);
//        return;
//    }
//
//    // Define quantity types for sleep analysis and heart rate
//    HKQuantityType *sleepQuantityType = [HKObjectType quantityTypeForIdentifier:HKCategoryTypeIdentifierSleepAnalysis];
//    HKQuantityType *heartRateQuantityType = [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierHeartRate];
//
//    // Define the date range (e.g., last week)
//    NSDate *endDate = [NSDate date];
//    NSDate *startDate = [endDate dateByAddingTimeInterval:-7 * 24 * 60 * 60]; // 7 days in seconds
//
//    NSPredicate *predicate = [HKQuery predicateForSamplesWithStartDate:startDate
//                                                           endDate:endDate
//                                                           options:HKQueryOptionNone]; // Adjust options as needed
//
//    // Set up sort descriptors for both queries
//    NSSortDescriptor *sleepSortDescriptor = [NSSortDescriptor sortDescriptorWithKey:HKSampleSortIdentifierStartDate ascending:NO];
//    NSSortDescriptor *heartRateSortDescriptor = [NSSortDescriptor sortDescriptorWithKey:HKSampleSortIdentifierStartDate ascending:NO];
//
//    // Create a group to handle both queries
//    dispatch_group_t group = dispatch_group_create();
//
//    __block NSMutableArray *sleepData = [NSMutableArray array];
//    __block NSMutableArray *heartRateData = [NSMutableArray array];
//
//    // Query sleep analysis data
//    HKSampleQuery *sleepSampleQuery = [[HKSampleQuery alloc] initWithSampleType:sleepQuantityType
//                                                            predicate:predicate
//                                                                limit:HKObjectQueryNoLimit
//                                                      sortDescriptors:@[sleepSortDescriptor]
//                                                       resultsHandler:^(HKSampleQuery * _Nonnull query, NSArray<__kindof HKSample *> * _Nullable results, NSError * _Nullable error) {
//        if (!error) {
//            for (HKSample *sample in results) {
//                if ([sample isKindOfClass:[HKCategorySample class]]) {
//                    HKCategorySample *categorySample = (HKCategorySample *)sample;
//                    NSDate *startTime = categorySample.startDate;
//                    NSDate *endTime = categorySample.endDate;
//                    double durationHours = [endTime timeIntervalSinceDate:startTime] / 3600.0; // Convert to hours
//                    NSDictionary *dataPoint = @{
//                      @"sleepStage": @(categorySample.value),
//                        @"startTime": startTime,
//                        @"endTime": endTime,
//                        @"durationHours": @(durationHours),
//                    };
//                    [sleepData addObject:dataPoint];
//                }
//            }
//        }
//        dispatch_group_leave(group);
//    }];
//
//    // Query heart rate data
//    HKSampleQuery *heartRateSampleQuery = [[HKSampleQuery alloc] initWithSampleType:heartRateQuantityType
//                                                            predicate:predicate
//                                                                limit:HKObjectQueryNoLimit
//                                                      sortDescriptors:@[heartRateSortDescriptor]
//                                                       resultsHandler:^(HKSampleQuery * _Nonnull query, NSArray<__kindof HKSample *> * _Nullable results, NSError * _Nullable error) {
//        if (!error) {
//            for (HKSample *sample in results) {
//                if ([sample isKindOfClass:[HKQuantitySample class]]) {
//                    HKQuantitySample *quantitySample = (HKQuantitySample *)sample;
//                    double heartRateValue = [quantitySample.quantity doubleValueForUnit:[HKUnit unitFromString:@"count/min"]];
//                    NSDate *sampleDate = quantitySample.startDate;
//                    NSDictionary *dataPoint = @{
//                        @"heartRate": @(heartRateValue),
//                        @"date": sampleDate,
//                    };
//                    [heartRateData addObject:dataPoint];
//                }
//            }
//        }
//        dispatch_group_leave(group);
//    }];
//
//    // Execute both queries
//    HKHealthStore *healthStore = [[HKHealthStore alloc] init];
//    dispatch_group_enter(group);
//    dispatch_group_enter(group);
//    [healthStore executeQuery:sleepSampleQuery];
//    [healthStore executeQuery:heartRateSampleQuery];
//
//    // Wait for both queries to complete
//    dispatch_group_notify(group, dispatch_get_main_queue(), ^{
//        // Return the combined data
//        NSDictionary *combinedData = @{
//            @"sleepData": sleepData,
//            @"heartRateData": heartRateData,
//        };
//        resolve(combinedData);
//    });
//}

@end
