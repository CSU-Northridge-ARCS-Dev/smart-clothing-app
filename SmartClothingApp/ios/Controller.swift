//
//  Controller.swift
//  SmartClothingApp
//
//  Created by Emi Jr Anyakpor and Gerard Gandionco on 3/3/24.
//

// Communication layer with Health Kit

import Foundation
import HealthKit

// Swift Decorate to export Class to Objective-c
// Declares Controller Class

@objc(Controller)
class Controller: NSObject {
  
  //  Declares the HealthKit store for our app
  let healthStore = HKHealthStore()
  
  // Checking if the HealthKit is avaliable on the users device
  @objc
  func findHealthData(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    if HKHealthStore.isHealthDataAvailable() {
      print("Health Data is avaliable on this device")
      resolve(true)
    } else {
      print("Health Data is not avaliable on this device")
      reject("UNAVALIABLE", "HealthKit data is not avaliable", nil)
    }
    
  }
  
  // Function Method to request Authorization from Healthkit
  @available(iOS 15.0, *)
  @objc
  func requestAuthorization(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
      
      // Health data types we want to show in our app
      let allTypes: Set<HKSampleType> = [
        HKObjectType.categoryType(forIdentifier: HKCategoryTypeIdentifier.sleepAnalysis)!,
        HKObjectType.quantityType(forIdentifier: HKQuantityTypeIdentifier.heartRate)!,
        HKObjectType.quantityType(forIdentifier: HKQuantityTypeIdentifier.restingHeartRate)!,
        HKObjectType.quantityType(forIdentifier: HKQuantityTypeIdentifier.heartRateVariabilitySDNN)!,

        // Activity rings.
        // Percentage of ring can be calculated as follows: value (energy burned or time) / goal (same quantity).
        HKObjectType.quantityType(forIdentifier: HKQuantityTypeIdentifier.appleMoveTime)!,
        HKObjectType.quantityType(forIdentifier: HKQuantityTypeIdentifier.activeEnergyBurned)!,
        HKObjectType.quantityType(forIdentifier: HKQuantityTypeIdentifier.appleExerciseTime)!,
        HKObjectType.quantityType(forIdentifier: HKQuantityTypeIdentifier.appleStandTime)!,
      ]
      
      // Check if Health Data is available on the device
      if HKHealthStore.isHealthDataAvailable() {
          let healthStore = HKHealthStore()
          
          // Request authorization to the data
          healthStore.requestAuthorization(toShare: nil, read: allTypes) { success, error in
              if success {
                  print("User has granted permission for health data to be read")
                  resolve(true)
              } else {
                  reject("UNAVLIABLE", "Permission denied for health data to be read", error)
              }
          }
      } else {
          reject("UNAVLIABLE", "Health data is not available on this device", nil)
      }
  }
  
  // read heart rate data function
  @objc
  func readHeartRateData(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
          let healthStore = HKHealthStore()

          guard HKHealthStore.isHealthDataAvailable() else {
              let error = NSError(domain: "YourAppDomain", code: 1, userInfo: [NSLocalizedDescriptionKey: "HealthKit is not available on this device."])
              reject("HEALTH_KIT_NOT_AVAILABLE", "HealthKit is not available on this device.", error)
              return
          }

          guard let quantityType = HKObjectType.quantityType(forIdentifier: .heartRate) else {
              return // Guard against nil quantity type
          }

          let endDate = Date()
          let startDate = Calendar.current.date(byAdding: .day, value: -14, to: endDate)! // Last 14 days

          let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: [])

          let sortDescriptor = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)

          let dateFormatter = DateFormatter()
          dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
          dateFormatter.timeZone = TimeZone(abbreviation: "UTC")

          let heartRateQuery = HKSampleQuery(sampleType: quantityType, predicate: predicate, limit: HKObjectQueryNoLimit, sortDescriptors: [sortDescriptor]) { (query, results, error) in
              if let error = error {
                  reject("QUERY_FAILED", "Failed to query heart rate data", error as NSError?)
              } else {
                  var heartRateData = [[String: Any]]()

                  for sample in results as? [HKQuantitySample] ?? [] {
                      let heartRateValue = sample.quantity.doubleValue(for: HKUnit(from: "count/min"))
                      let sampleDate = sample.startDate
                      let iso8601DateString = dateFormatter.string(from: sampleDate)

                      let dataPoint: [String: Any] = [
                          "heartRate": heartRateValue,
                          "date": iso8601DateString
                      ]
                      heartRateData.append(dataPoint)
                  }

                  resolve(heartRateData)
              }
          }

          healthStore.execute(heartRateQuery)
      }
  
  @objc
  func readHeartRateVariabilityData(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
          let healthStore = HKHealthStore()

          guard HKHealthStore.isHealthDataAvailable() else {
              let error = NSError(domain: "YourAppDomain", code: 1, userInfo: [NSLocalizedDescriptionKey: "HealthKit is not available on this device."])
              reject("HEALTH_KIT_NOT_AVAILABLE", "HealthKit is not available on this device.", error)
              return
          }

          guard let quantityType = HKObjectType.quantityType(forIdentifier: .heartRateVariabilitySDNN) else {
              return // Guard against nil quantity type
          }

          // Request authorization to access heart rate variability data
          healthStore.requestAuthorization(toShare: nil, read: Set([quantityType])) { success, error in
              if !success {
                  reject("AUTHORIZATION_FAILED", "Failed to obtain authorization for heart rate variability data", error as NSError?)
                  return
              }

              // Authorization granted, proceed with the heart rate variability query
              let endDate = Date()
              let startDate = Calendar.current.date(byAdding: .day, value: -14, to: endDate)! // Last 28 days

              let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: [])

              // Sort descriptor for sorting samples by start date
              let sortDescriptor = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)

              // Date formatter to convert dates to ISO 8601 format
              let dateFormatter = DateFormatter()
              dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
              dateFormatter.timeZone = TimeZone(abbreviation: "UTC")

              // Create a sample query for heart rate variability data
              let hrvQuery = HKSampleQuery(sampleType: quantityType, predicate: predicate, limit: HKObjectQueryNoLimit, sortDescriptors: [sortDescriptor]) { (query, results, error) in
                  if let error = error {
                      reject("QUERY_FAILED", "Failed to query heart rate variability data", error as NSError?)
                  } else {
                      var hrvData = [[String: Any]]()

                      // Handle the results to extract heart rate variability values and dates
                      for sample in results as? [HKQuantitySample] ?? [] {
                          let hrvValue = sample.quantity.doubleValue(for: HKUnit.secondUnit(with: .milli))
                          let sampleDate = sample.startDate
                          let iso8601DateString = dateFormatter.string(from: sampleDate)

                          let dataPoint: [String: Any] = [
                              "heart_rate_value": hrvValue,
                              "date": iso8601DateString
                          ]
                          hrvData.append(dataPoint)
                      }

                      // Resolve the promise with the extracted data
                      resolve(hrvData)
                  }
              }

              // Execute the heart rate variability query
              healthStore.execute(hrvQuery)
          }
      }
  
  @objc
  func readRestingHeartRateData(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
          let healthStore = HKHealthStore()

          guard HKHealthStore.isHealthDataAvailable() else {
              let error = NSError(domain: "YourAppDomain", code: 1, userInfo: [NSLocalizedDescriptionKey: "HealthKit is not available on this device."])
              reject("HEALTH_KIT_NOT_AVAILABLE", "HealthKit is not available on this device.", error)
              return
          }

          guard let quantityType = HKObjectType.quantityType(forIdentifier: .restingHeartRate) else {
              return // Guard against nil quantity type
          }

          // Request authorization to access resting heart rate data
          healthStore.requestAuthorization(toShare: nil, read: Set([quantityType])) { success, error in
              if !success {
                  reject("AUTHORIZATION_FAILED", "Failed to obtain authorization for resting heart rate data", error as NSError?)
                  return
              }

              // Authorization granted, proceed with the resting heart rate query
              let endDate = Date()
              let startDate = Calendar.current.date(byAdding: .day, value: -14, to: endDate)! // Last 14 days

              let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: [])

              // Sort descriptor for sorting samples by start date
              let sortDescriptor = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)

              // Date formatter to convert dates to ISO 8601 format
              let dateFormatter = DateFormatter()
              dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
              dateFormatter.timeZone = TimeZone(abbreviation: "UTC")

              // Create a sample query for resting heart rate data
              let heartRateQuery = HKSampleQuery(sampleType: quantityType, predicate: predicate, limit: HKObjectQueryNoLimit, sortDescriptors: [sortDescriptor]) { (query, results, error) in
                  if let error = error {
                      reject("QUERY_FAILED", "Failed to query resting heart rate data", error as NSError?)
                  } else {
                      var heartRateData = [[String: Any]]()

                      // Handle the results to extract heart rate values and dates
                      for sample in results as? [HKQuantitySample] ?? [] {
                          let heartRateValue = sample.quantity.doubleValue(for: HKUnit(from: "count/min"))
                          let sampleDate = sample.startDate
                          let iso8601DateString = dateFormatter.string(from: sampleDate)

                          let dataPoint: [String: Any] = [
                              "heartRateValue": heartRateValue,
                              "date": iso8601DateString
                          ]
                          heartRateData.append(dataPoint)
                      }

                      // Resolve the promise with the extracted data
                      resolve(heartRateData)
                  }
              }

              // Execute the resting heart rate query
              healthStore.execute(heartRateQuery)
          }
      }
  
  @available(iOS 16.0, *)
  @objc
  func readSleepData(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
         let healthStore = HKHealthStore()
         
         guard HKHealthStore.isHealthDataAvailable() else {
             let error = NSError(domain: "YourAppDomain", code: 1, userInfo: [NSLocalizedDescriptionKey: "HealthKit is not available on this device."])
             reject("HEALTH_KIT_NOT_AVAILABLE", "HealthKit is not available on this device.", error)
             return
         }
         
         guard let categoryType = HKObjectType.categoryType(forIdentifier: .sleepAnalysis) else {
             // Guard against nil category type
             return
         }
         
         // Request authorization to access sleep data
         healthStore.requestAuthorization(toShare: nil, read: [categoryType]) { success, error in
             if !success {
                 reject("AUTHORIZATION_FAILED", "Failed to obtain authorization for sleep data", error)
                 return
             }
             
             // Authorization granted, proceed with the sleep query
             let endDate = Date()
             let startDate = Calendar.current.date(byAdding: .month, value: -1, to: endDate)! // 28 days past
             
             let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: [])
             
             // Sort descriptor for sorting samples by start date
             let sortDescriptor = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)
             
             // Date formatter to convert dates to ISO 8601 format
             let dateFormatter = DateFormatter()
             dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
             dateFormatter.timeZone = TimeZone(abbreviation: "UTC")
             
             var sleepData = [[String: Any]]()
             
             // Create a sample query for sleep data
             let sleepQuery = HKSampleQuery(sampleType: categoryType, predicate: predicate, limit: HKObjectQueryNoLimit, sortDescriptors: [sortDescriptor]) { (query, results, error) in
                 if let error = error {
                     reject("QUERY_FAILED", "Failed to query sleep data", error)
                 } else {
                     // Handle the results to extract sleep values and dates
                     for sample in results as? [HKCategorySample] ?? [] {
                         var sleepValue: String
                         
                         switch sample.value {
                            case HKCategoryValueSleepAnalysis.inBed.rawValue:
                                sleepValue = "In Bed"
                            case HKCategoryValueSleepAnalysis.awake.rawValue:
                                sleepValue = "Awake"
                            case HKCategoryValueSleepAnalysis.asleepCore.rawValue:
                                sleepValue = "Core"
                            case HKCategoryValueSleepAnalysis.asleepDeep.rawValue:
                                sleepValue = "Deep"
                            case HKCategoryValueSleepAnalysis.asleepREM.rawValue:
                                sleepValue = "REM"
                            case HKCategoryValueSleepAnalysis.asleepUnspecified.rawValue:
                                sleepValue = "Unspecified"
                            default:
                                sleepValue = "Unknown"
                         }
                         
                         let startDate = sample.startDate
                         let endDate = sample.endDate
                         
                         // Debug
                         print("[DEBUG] VALUE: \(sleepValue)")
                         
                         let iso8601StartDateString = dateFormatter.string(from: startDate)
                         let iso8601EndDateString = dateFormatter.string(from: endDate)
                         
                         let dataPoint: [String: Any] = [
                             "sleepValue": sleepValue,
                             "startDate": iso8601StartDateString,
                             "endDate": iso8601EndDateString
                         ]
                         sleepData.append(dataPoint)
                     }
                     
                     // Resolve the promise with the extracted data
                     resolve(sleepData)
                 }
             }
             
             // Execute the query
             healthStore.execute(sleepQuery)
         }
  }

    // TODO refactor.
    @available(iOS 16.0, *)
    @objc
    func readActivityRingsData(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        let healthStore = HKHealthStore();

        // Check for health data availability.
        guard HKHealthStore.isHealthDataAvailable() else {
             let error = NSError(domain: "YourAppDomain", code: 1, userInfo: [NSLocalizedDescriptionKey: "HealthKit is not available on this device."])
             reject("HEALTH_KIT_NOT_AVAILABLE", "HealthKit is not available on this device.", error)
             return
        }

        // Ensure we can request the data type.
        let activitySummaryType = HKObjectType.activitySummaryType();
        let readTypes: Set<HKObjectType> = [activitySummaryType];

        // Request authorization to access activity rings data.
        healthStore.requestAuthorization(toShare: Set(), read: readTypes) { (success, error) in 
            if !success {
                reject("AUTHORIZATION_FAILED", "Failed to obtain authorization for activity rings data", error)
                return
            }

            // Fetch data over the previous 28 days.

            // Build predicate.
            let calendar = NSCalendar.current
            let endDate = Date()
            guard let startDate = calendar.date(byAdding: .month, value: -1, to: endDate) else {
                fatalError("*** Unable to create the start date ***")
            }
            let units: Set<Calendar.Component> = [.day, .month, .year, .era]
            var startDateComponents = calendar.dateComponents(units, from: startDate)
            startDateComponents.calendar = calendar
            var endDateComponents = calendar.dateComponents(units, from: endDate)
            endDateComponents.calendar = calendar
        
            let summariesWithinRange = HKQuery.predicate(forActivitySummariesBetweenStart: startDateComponents, end: endDateComponents)

            // Query for activity ring summary.
            let query = HKActivitySummaryQuery(predicate: summariesWithinRange) { (query, summariesOrNil, errorOrNil) -> Void in
                guard let summaries = summariesOrNil else {
                    if let error = errorOrNil {
                        print("Error fetching activity ring summaries: \(error.localizedDescription)");
                        reject("AUTHORIZATION_FAILED", "Failed to obtain authorization for activity ring data types", error as NSError?);
                    } else {
                        resolve([]);  // No data available.
                    }
                    return
                }

                // Store data values.
                var ringData: [[String: Any]] = [];

                // ISO 8601 datetime format.
                let dateFormatter = DateFormatter();
                dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";
                dateFormatter.timeZone = TimeZone(abbreviation: "UTC");
                
                for summary in summaries {
                    let dateComponents = summary.dateComponents(for: calendar);
                    guard let date = calendar.date(from: dateComponents) else { continue }
                    let dateString = dateFormatter.string(from: date);

                    let energyBurned = summary.activeEnergyBurned.doubleValue(for: HKUnit.kilocalorie())
                    let energyBurnedGoal = summary.activeEnergyBurnedGoal.doubleValue(for: HKUnit.kilocalorie())
                    let exerciseTime = summary.appleExerciseTime.doubleValue(for: HKUnit.minute())
                    let exerciseTimeGoal = summary.appleExerciseTimeGoal.doubleValue(for: HKUnit.minute())
                    let standHours = summary.appleStandHours.doubleValue(for: HKUnit.count())
                    let standHoursGoal = summary.appleStandHoursGoal.doubleValue(for: HKUnit.count())

                    // Organizing data into a dictionary.
                    let dayData: [String: Any] = [
                        "date": dateString,
                        "energyBurned": energyBurned,
                        "energyBurnedGoal": energyBurnedGoal,
                        "exerciseTime": exerciseTime,
                        "exerciseTimeGoal": exerciseTimeGoal,
                        "standHours": standHours,
                        "standHoursGoal": standHoursGoal
                    ]
                    
                    ringData.append(dayData)

                    // DEBUG.
                    print("Current summary: ", dayData);
                }

                resolve(ringData);
            }
            healthStore.execute(query);
        }
    }
  
@objc
  static func requireMainQueueSetup() -> Bool {
    return true
  }
}
