//
//  Controller.swift
//  SmartClothingApp
//
//  Created by Emi Jr Anyakpor on 3/3/24.
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
//      print("hello22")
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
//          HKObjectType.quantityType(forIdentifier: HKQuantityTypeIdentifier.activeEnergyBurned)!,
          HKObjectType.quantityType(forIdentifier: HKQuantityTypeIdentifier.heartRate)!,
          HKObjectType.quantityType(forIdentifier: HKQuantityTypeIdentifier.restingHeartRate)!,
//          HKObjectType.quantityType(forIdentifier: HKQuantityTypeIdentifier.stepCount)!,
          HKObjectType.quantityType(forIdentifier: HKQuantityTypeIdentifier.appleStandTime)!,
          HKObjectType.quantityType(forIdentifier: HKQuantityTypeIdentifier.appleMoveTime)!,
          HKObjectType.quantityType(forIdentifier: HKQuantityTypeIdentifier.appleExerciseTime)!,
          HKObjectType.quantityType(forIdentifier: HKQuantityTypeIdentifier.heartRateVariabilitySDNN)!
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
          let startDate = Calendar.current.date(byAdding: .day, value: -1, to: endDate)! // Last 24 hours

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
              let startDate = Calendar.current.date(byAdding: .day, value: -7, to: endDate)! // Last 7 days

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
              let startDate = Calendar.current.date(byAdding: .day, value: -7, to: endDate)! // Last 7 days

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
             let startDate = Calendar.current.date(byAdding: .day, value: -7, to: endDate)! // Adjust the time range as needed
             
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
                         var isInBed: Bool
                         
                         switch sample.value {
                         case HKCategoryValueSleepAnalysis.inBed.rawValue:
                             sleepValue = "In Bed"
                             isInBed = true
                         case HKCategoryValueSleepAnalysis.awake.rawValue:
                             sleepValue = "Awake"
                             isInBed = false
                         case HKCategoryValueSleepAnalysis.asleep.rawValue:
                             sleepValue = "Core"
                             isInBed = false
                         default:
                             sleepValue = "Unknown"
                             isInBed = false
                         }
                         
                         let startDate = sample.startDate
                         let endDate = sample.endDate
                         
                         // Debug
                         print("[DEBUG] IN BED: \(isInBed ? "YES" : "NO") | VALUE: \(sleepValue)")
                         
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
//  func readSleepData(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
//      // Check if Apple HealthKit is available on this device
//      guard HKHealthStore.isHealthDataAvailable() else {
//          let error = NSError(domain: "UNAVAILABLE", code: 0, userInfo: ["message": "Sleep data is unavailable"])
//          reject("UNAVAILABLE", "Sleep data is unavailable", error)
//          return
//      }
//
//      // Define the type for sleep data
//      guard let sleepData = HKObjectType.categoryType(forIdentifier: .sleepAnalysis) else {
//          let error = NSError(domain: "UNAVAILABLE", code: 0, userInfo: ["message": "Permission denied reading sleep data"])
//          reject("UNAVAILABLE", "Permission denied reading sleep data", error)
//          return
//      }
//
//      // Calculate the start date (one week ago)
//      let calendar = Calendar.current
//      let endDate = Date()
//      guard let startDate = calendar.date(byAdding: .day, value: -7, to: endDate) else {
//          let error = NSError(domain: "INVALID_DATE", code: 0, userInfo: ["message": "Invalid start date"])
//          reject("INVALID_DATE", "Invalid start date", error)
//          return
//      }
//
//      // Create the predicate for querying sleep data samples
//      let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: .strictStartDate)
//
//      // Create the query to fetch sleep data samples
//      let query = HKSampleQuery(sampleType: sleepData, predicate: predicate, limit: HKObjectQueryNoLimit, sortDescriptors: nil) { (query, results, error) in
//          if let error = error {
//              reject("QUERY_ERROR", "Error querying sleep data", error)
//              return
//          }
//
//          guard let samples = results as? [HKCategorySample] else {
//              reject("QUERY_ERROR", "Unexpected type of results", nil)
//              return
//          }
//
//          // Process the samples and extract timestamps and sleep categories
//          var sleepData: [[String: Any]] = []
//          for sample in samples {
//              let timestamp = sample.startDate
//              let sleepCategoryValue = sample.value
//
//              // Convert the sleep category value to a human-readable string
//              var sleepCategory: String
//              switch sleepCategoryValue {
//              case HKCategoryValueSleepAnalysis.inBed.rawValue:
//                  sleepCategory = "In Bed"
//              case HKCategoryValueSleepAnalysis.asleep.rawValue:
//                  sleepCategory = "Asleep"
//              case HKCategoryValueSleepAnalysis.awake.rawValue:
//                  sleepCategory = "Awake"
//              case HKCategoryValueSleepAnalysis.asleepDeep.rawValue:
//                  sleepCategory = "Deep"
//              case HKCategoryValueSleepAnalysis.asleepREM.rawValue:
//                  sleepCategory = "REM"
//              case HKCategoryValueSleepAnalysis.asleepCore.rawValue:
//                  sleepCategory = "Core"
//              default:
//                  sleepCategory = "Unknown"
//              }
//
//              let data: [String: Any] = [
//                  "timestamp": timestamp,
//                  "sleepCategory": sleepCategory
//              ]
//              sleepData.append(data)
//          }
//
//          // Resolve the promise with the sleep data array
//          resolve(sleepData)
//      }
//
//      // Execute the query
//      HKHealthStore().execute(query)
//  }

  
@objc
  static func requireMainQueueSetup() -> Bool {
    return true
  }
}
