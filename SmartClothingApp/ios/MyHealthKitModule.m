//
//  RTCBridgeModule.m
//  SmartClothingApp
//
//  Created by Emi Jr Anyakpor on 9/25/23.

#import "MyHealthKitModule.h"
#import <HealthKit/HealthKit.h>

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
    
    // Allows our third-party app to read these data types
  NSSet *readTypes = [NSSet setWithObjects:
                      [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierActiveEnergyBurned],
                             [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierHeartRate],
                      [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierRestingHeartRate],
                             [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierStepCount],
                             [HKObjectType categoryTypeForIdentifier:HKCategoryTypeIdentifierSleepAnalysis],
                      [HKObjectType categoryTypeForIdentifier:HKCategoryTypeIdentifierAppleStandHour],
                      [HKObjectType categoryTypeForIdentifier:HKQuantityTypeIdentifierAppleExerciseTime],
                      [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierHeartRateVariabilitySDNN],
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

RCT_EXPORT_METHOD(readRestingHeartRateData:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    if (![HKHealthStore isHealthDataAvailable]) {
        NSError *error = [NSError errorWithDomain:@"YourAppDomain" code:1 userInfo:@{NSLocalizedDescriptionKey: @"HealthKit is not available on this device."}];
        reject(@"HEALTH_KIT_NOT_AVAILABLE", @"HealthKit is not available on this device.", error);
        return;
    }

    // Initialize a HealthStore instance
    HKHealthStore *healthStore = [[HKHealthStore alloc] init];

//  / Define quantity type for resting heart rate
  HKQuantityType *quantityType = [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierRestingHeartRate];

    // Request authorization to access resting heart rate data
    [healthStore requestAuthorizationToShareTypes:nil
                                         readTypes:[NSSet setWithObject:quantityType]
                                        completion:^(BOOL success, NSError * _Nullable error) {
        if (!success) {
            reject(@"AUTHORIZATION_FAILED", @"Failed to obtain authorization for heart rate data", error);
            return;
        }

        // Authorization granted, proceed with the heart rate query
        NSDate *endDate = [NSDate date];
        NSDate *startDate = [endDate dateByAddingTimeInterval:-7 * 24 * 60 * 60];  // Change the time range to the last 7 days

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
                        @"heartRateValue": @(heartRateValue),
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
    }];
}

RCT_EXPORT_METHOD(readHeartRateVariabilityData:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    if (![HKHealthStore isHealthDataAvailable]) {
        NSError *error = [NSError errorWithDomain:@"YourAppDomain" code:1 userInfo:@{NSLocalizedDescriptionKey: @"HealthKit is not available on this device."}];
        reject(@"HEALTH_KIT_NOT_AVAILABLE", @"HealthKit is not available on this device.", error);
        return;
    }

    // Initialize a HealthStore instance
    HKHealthStore *healthStore = [[HKHealthStore alloc] init];

    // Define quantity type for heart rate variability
    HKQuantityType *quantityType = [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierHeartRateVariabilitySDNN];

    // Request authorization to access heart rate variability data
    [healthStore requestAuthorizationToShareTypes:nil
                                         readTypes:[NSSet setWithObject:quantityType]
                                        completion:^(BOOL success, NSError * _Nullable error) {
        if (!success) {
            reject(@"AUTHORIZATION_FAILED", @"Failed to obtain authorization for heart rate variability data", error);
            return;
        }

        // Authorization granted, proceed with the heart rate variability query
        NSDate *endDate = [NSDate date];
        NSDate *startDate = [endDate dateByAddingTimeInterval:-7 * 24 * 60 * 60];  // Change the time range to the last 7 days

        NSPredicate *predicate = [HKQuery predicateForSamplesWithStartDate:startDate
                                                                 endDate:endDate
                                                                 options:HKQueryOptionNone];

        // Sort descriptor for sorting samples by start date
        NSSortDescriptor *sortDescriptor = [NSSortDescriptor sortDescriptorWithKey:HKSampleSortIdentifierStartDate ascending:NO];

        // Date formatter to convert dates to ISO 8601 format
        NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
        [dateFormatter setDateFormat:@"yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"];
        [dateFormatter setTimeZone:[NSTimeZone timeZoneWithAbbreviation:@"UTC"]];

        // Create an array to store all heart rate variability data
        NSMutableArray *hrvData = [NSMutableArray array];

        // Create a sample query for heart rate variability data
        HKSampleQuery *hrvQuery = [[HKSampleQuery alloc] initWithSampleType:quantityType
                                                                  predicate:predicate
                                                                      limit:HKObjectQueryNoLimit
                                                            sortDescriptors:@[sortDescriptor]
                                                             resultsHandler:^(HKSampleQuery * _Nonnull query, NSArray<__kindof HKSample *> * _Nullable results, NSError * _Nullable error) {
            if (error) {
                reject(@"QUERY_FAILED", @"Failed to query heart rate variability data", error);
            } else {
                // Handle the results to extract heart rate variability values and dates
                for (HKQuantitySample *sample in results) {
                    double hrvValue = [sample.quantity doubleValueForUnit:[HKUnit unitFromString:@"ms"]];
                    NSDate *sampleDate = sample.startDate;
                    NSString *iso8601DateString = [dateFormatter stringFromDate:sampleDate];

                    NSDictionary *dataPoint = @{
                        @"hrvValue": @(hrvValue),
                        @"date": iso8601DateString
                    };
                    [hrvData addObject:dataPoint];
                }

                // Resolve the promise with the extracted data
                resolve(hrvData);
            }
        }];

        // Execute the heart rate variability query
        [healthStore executeQuery:hrvQuery];
    }];
}



//move data for the move ring
RCT_EXPORT_METHOD(readActiveEnergyData:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  if (![HKHealthStore isHealthDataAvailable]) {
    NSError *error = [NSError errorWithDomain:@"YourAppDomain" code:1 userInfo:@{NSLocalizedDescriptionKey: @"HealthKit is not available on this device."}];
    reject(@"HEALTH_KIT_NOT_AVAILABLE", @"HealthKit is not available on this device.", error);
    return;
  }
  
  // Initialize a HealthStore instance
  HKHealthStore *healthStore = [[HKHealthStore alloc] init];
  
  // Define quantity type for active energy burned
  HKQuantityType *quantityType = [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierActiveEnergyBurned];
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
  
  // Create an array to store all active energy data
  NSMutableArray *activeEnergyData = [NSMutableArray array];

  // Create a sample query for active energy data
  HKSampleQuery *activeEnergyQuery = [[HKSampleQuery alloc] initWithSampleType:quantityType
                                                                    predicate:predicate
                                                                        limit:HKObjectQueryNoLimit
                                                              sortDescriptors:@[sortDescriptor]
                                                               resultsHandler:^(HKSampleQuery * _Nonnull query, NSArray<__kindof HKSample *> * _Nullable results, NSError * _Nullable error) {
      if (error) {
          reject(@"QUERY_FAILED", @"Failed to query active energy data", error);
      } else {
        // Handle the results to extract active energy values and dates
          for (HKQuantitySample *sample in results) {
              double activeEnergyValue = [sample.quantity doubleValueForUnit:[HKUnit kilocalorieUnit]];
              NSDate *sampleDate = sample.startDate;
              NSString *iso8601DateString = [dateFormatter stringFromDate:sampleDate];

              NSDictionary *dataPoint = @{
                  @"activeEnergy": @(activeEnergyValue),
                  @"date": iso8601DateString
              };
              [activeEnergyData addObject:dataPoint];
          }

          // Resolve the promise with the extracted data
          resolve(activeEnergyData);
      }
  }];

  // Execute the active energy query
  [healthStore executeQuery:activeEnergyQuery];
}

// returns all the neccessary sleep data we need for our app
RCT_EXPORT_METHOD(readSleepData:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    if (![HKHealthStore isHealthDataAvailable]) {
        NSError *error = [NSError errorWithDomain:@"YourAppDomain" code:1 userInfo:@{NSLocalizedDescriptionKey: @"HealthKit is not available on this device."}];
        reject(@"HEALTH_KIT_NOT_AVAILABLE", @"HealthKit is not available on this device.", error);
        return;
    }

    // Initialize a HealthStore instance
    HKHealthStore *healthStore = [[HKHealthStore alloc] init];

    // Define category type for sleep analysis
    HKCategoryType *categoryType = [HKObjectType categoryTypeForIdentifier:HKCategoryTypeIdentifierSleepAnalysis];

    // Request authorization to access sleep data
    [healthStore requestAuthorizationToShareTypes:nil
                                         readTypes:[NSSet setWithObject:categoryType]
                                        completion:^(BOOL success, NSError * _Nullable error) {
        if (!success) {
            reject(@"AUTHORIZATION_FAILED", @"Failed to obtain authorization for sleep data", error);
            return;
        }

        // Authorization granted, proceed with the sleep query
        NSDate *endDate = [NSDate date];
        NSDate *startDate = [endDate dateByAddingTimeInterval:-7 * 24 * 60 * 60]; // Adjust the time range as needed

        NSPredicate *predicate = [HKQuery predicateForSamplesWithStartDate:startDate
                                                                   endDate:endDate
                                                                   options:HKQueryOptionNone];

        // Sort descriptor for sorting samples by start date
        NSSortDescriptor *sortDescriptor = [NSSortDescriptor sortDescriptorWithKey:HKSampleSortIdentifierStartDate ascending:NO];

        // Date formatter to convert dates to ISO 8601 format
        NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
        [dateFormatter setDateFormat:@"yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"];
        [dateFormatter setTimeZone:[NSTimeZone timeZoneWithAbbreviation:@"UTC"]];

        
      NSMutableArray *sleepData = [NSMutableArray array];

      // Create a sample query for sleep data
      HKSampleQuery *sleepQuery = [[HKSampleQuery alloc] initWithSampleType:categoryType
                                                                  predicate:predicate
                                                                      limit:HKObjectQueryNoLimit
                                                            sortDescriptors:@[sortDescriptor]
                                                             resultsHandler:^(HKSampleQuery * _Nonnull query, NSArray<__kindof HKSample *> * _Nullable results, NSError * _Nullable error) {
          if (error) {
              reject(@"QUERY_FAILED", @"Failed to query sleep data", error);
          } else {
              // Handle the results to extract sleep values and dates
              HKCategorySample *previousSample = nil;
              for (HKCategorySample *sample in results) {
                  NSString *sleepValue = (sample.value == HKCategoryValueSleepAnalysisInBed) ? @"In Bed" : @"Asleep";
                  NSDate *startDate = sample.startDate;
                  NSDate *endDate = sample.endDate;

                  // If the previous sample is an "In Bed" entry, use its end date as the start date for the current entry
                  if (previousSample && previousSample.value == HKCategoryValueSleepAnalysisInBed) {
                      startDate = previousSample.endDate;
                  }

                  NSString *iso8601StartDateString = [dateFormatter stringFromDate:startDate];
                  NSString *iso8601EndDateString = [dateFormatter stringFromDate:endDate];

                  NSDictionary *dataPoint = @{
                      @"sleepValue": sleepValue,
                      @"startDate": iso8601StartDateString,
                      @"endDate": iso8601EndDateString
                  };
                  [sleepData addObject:dataPoint];

                  // Save the current sample as the previous one for the next iteration
                  previousSample = sample;
              }

              // Resolve the promise with the extracted data
              resolve(sleepData);
          }
      }];


        // Execute the sleep query
        [healthStore executeQuery:sleepQuery];
    }];
}

//// needs a real apple watch device for this function to be tested
//RCT_EXPORT_METHOD(fillActivityRings:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
//{
//    HKHealthStore *healthStore = [HKHealthStore new];
//
//  // Check the authorization status for heart rate data
////  HKAuthorizationStatus heartRateStatus = [healthStore authorizationStatusForType:[HKQuantityType quantityTypeForIdentifier:HKQuantityTypeIdentifierHeartRate]];
////  if (heartRateStatus != HKAuthorizationStatusSharingAuthorized) {
////      NSLog(@"HealthKit heart rate data authorization denied or not requested.");
////      reject(@"HEALTHKIT_HEART_RATE_AUTH_ERROR", @"HealthKit heart rate data not authorized or denied.", nil);
////  } else {
////      // Authorization was granted, proceed with reading heart rate data
////      NSLog(@"HealthKit heart rate authorization granted.");
////  }
//
//    if (![HKHealthStore isHealthDataAvailable]) {
//        NSLog(@"HealthKit data is not available.");
//    } else {
//        // Authorization was granted, proceed with reading data
//        NSLog(@"fillActivityRings: HealthKit authorization granted.");
//    }
//    // no way to determine wheter health information is read i.e. move because that violates Apple privacy concerns
//
//  // Create an NSCalendar with the desired calendar identifier
//  NSCalendar *calendar = [[NSCalendar alloc] initWithCalendarIdentifier:NSCalendarIdentifierGregorian];
//
//  // Get the current date
//  NSDate *now = [NSDate date];
//
//  // Calculate the start of the last 24 hours
//  NSDate *startOfLast24Hours = [now dateByAddingTimeInterval:-24 * 60 * 60];
//
//  // Create NSDateComponents for the last 24 hours
//  NSDateComponents *last24HoursComponents = [calendar components:NSCalendarUnitYear | NSCalendarUnitMonth | NSCalendarUnitDay fromDate:startOfLast24Hours];
//  last24HoursComponents.calendar = calendar;
//
//  // Create a predicate for the last 24 hours
//  NSPredicate *predicate = [HKQuery predicateForActivitySummaryWithDateComponents:last24HoursComponents];
//
//
//    // Create an HKActivitySummaryQuery
//    HKActivitySummaryQuery *query = [[HKActivitySummaryQuery alloc] initWithPredicate:predicate resultsHandler:^(HKActivitySummaryQuery *query, NSArray<HKActivitySummary *> *activitySummaries, NSError *error) {
//
//        if (activitySummaries) {
//          NSLog(@"Activity Summaries: %@", activitySummaries);
//
//            for (HKActivitySummary *summary in activitySummaries) {
//
//              HKQuantity *moveData = summary.activeEnergyBurned;
//
//              double moveValue = [moveData doubleValueForUnit:[HKUnit kilocalorieUnit]];
//
//                /* Commented out unused data types
//                HKQuantity *exerciseData = summary.appleExerciseTime;
//                double exerciseValue = [exerciseData doubleValueForUnit:[HKUnit minuteUnit]];
//
//                HKQuantity *standData = summary.appleStandHours;
//                double standValue = [standData doubleValueForUnit:[HKUnit countUnit]];
//                */
//
//                NSDictionary *result = @{
//                    @"Move": @(moveValue),
//                    // Commented out unused data types
//                    // @"Exercise": @(exerciseValue),
//                    // @"Stand": @(standValue)
//                };
//
//                // Log the result data
//                NSLog(@"Result: %@", result);
//                resolve(result);
//            }
//        } else {
//
//            reject(@"ACTIVITY_RINGS_ERROR", @"Failed to retrieve activity rings data", error);
//          // Log the error details to the console
//          NSLog(@"Error domain: %@", [error domain]);
//          NSLog(@"Error code: %ld", (long)[error code]);
//          NSLog(@"Error description: %@", [error localizedDescription]);
//          NSLog(@"Error reason: %@", [error localizedFailureReason]);
//          NSLog(@"Error suggestion: %@", [error localizedRecoverySuggestion]);
//        }
//    }];
//
//
////    // Set an update handler to monitor updates
////    query.updateHandler = ^(HKActivitySummaryQuery *query, NSArray<HKActivitySummary *> *updatedActivitySummaries, NSError *error) {
////        // Handle updates to activity summary data here
////        if (updatedActivitySummaries) {
////            for (HKActivitySummary *summary in updatedActivitySummaries) {
////                // Process each updated summary here.
////                HKQuantity *moveData = summary.activeEnergyBurned;
////                double moveValue = [moveData doubleValueForUnit:[HKUnit kilocalorieUnit]];
////
////                /* Commented out unused data types
////                HKQuantity *exerciseData = summary.appleExerciseTime;
////                double exerciseValue = [exerciseData doubleValueForUnit:[HKUnit minuteUnit]];
////
////                HKQuantity *standData = summary.appleStandHours;
////                double standValue = [standData doubleValueForUnit:[HKUnit countUnit]];
////                */
////
////                NSDictionary *result = @{
////                    @"Move": @(moveValue),
////                    // Commented out unused data types
////                    // @"Exercise": @(exerciseValue),
////                    // @"Stand": @(standValue)
////                };
////
////                // Log the updated result data
////                NSLog(@"Updated Result: %@", result);
////                // You can add custom logic here to handle updates as needed.
////            }
////        } else {
////            // Handle errors or lack of updates by logging to the console
////            NSLog(@"No updates or error in updateHandler: %@", error);
////        }
////    };
//
//    // Execute the query
//    [healthStore executeQuery:query];
//}


@end
