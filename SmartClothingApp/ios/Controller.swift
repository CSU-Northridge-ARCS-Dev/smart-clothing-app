//
//  Controller.swift
//  SmartClothingApp
//
//  Created by Emi Jr Anyakpor and Gerard Gandionco on 3/3/24.
//

// Communication layer with Health Kit

import Foundation
import HealthKit

/*
* Swift Decorator to export Class to Objective-c. 
*/
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
    func requestAuthorization(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
      
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
  
    /*
    * Fetch heart rate data given a start date and an end date and format it on return.
    */
    @objc
    func readHeartRateData(
        _ startDateIso: String,
        _ endDateIso: String,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        let healthStore = HKHealthStore()

        guard HKHealthStore.isHealthDataAvailable() else {
            let error = NSError(domain: "YourAppDomain", code: 1, userInfo: [NSLocalizedDescriptionKey: "HealthKit is not available on this device."])
            reject("HEALTH_KIT_NOT_AVAILABLE", "HealthKit is not available on this device.", error)
            return
        }

        guard let quantityType = HKObjectType.quantityType(forIdentifier: .heartRate) else {
            let error = NSError(domain: "YourAppDomain", code: 2, userInfo: [NSLocalizedDescriptionKey: "Heart Rate data is not available."])
            reject("HEART_RATE_DATA_NOT_AVAILABLE", "Heart Rate data is not available.", error)
            return // Guard against nil quantity type
        }

        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
        dateFormatter.timeZone = TimeZone(abbreviation: "UTC")

        guard let startDate = dateFormatter.date(from: startDateIso), let endDate = dateFormatter.date(from: endDateIso) else {
            let error = NSError(domain: "YourAppDomain", code: 3, userInfo: [NSLocalizedDescriptionKey: "Invalid date format. Dates must be in ISO 8601 format."])
            reject("INVALID_DATE_FORMAT", "Invalid date format. Dates must be in ISO 8601 format.", error)
            return
        }

        let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: [])

        let sortDescriptor = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)

        let heartRateQuery = HKSampleQuery(sampleType: quantityType, predicate: predicate, limit: HKObjectQueryNoLimit, sortDescriptors: [sortDescriptor]) { (query, results, error) in
            if let error = error {
                reject("QUERY_FAILED", "Failed to query heart rate data", error as NSError?)
                return
            }

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

        healthStore.execute(heartRateQuery)
    }
  
    /*
    * Fetch heart rate variability data given a start date and an end date and format it on return.
    */
    @objc
    func readHeartRateVariabilityData(
        _ startDateIso: String,
        _ endDateIso: String,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        let healthStore = HKHealthStore()

        guard HKHealthStore.isHealthDataAvailable() else {
            let error = NSError(domain: "YourAppDomain", code: 1, userInfo: [NSLocalizedDescriptionKey: "HealthKit is not available on this device."])
            reject("HEALTH_KIT_NOT_AVAILABLE", "HealthKit is not available on this device.", error)
            return
        }

        guard let quantityType = HKObjectType.quantityType(forIdentifier: .heartRateVariabilitySDNN) else {
            let error = NSError(domain: "YourAppDomain", code: 2, userInfo: [NSLocalizedDescriptionKey: "HRV data is not available."])
            reject("HRV_DATA_NOT_AVAILABLE", "HRV data is not available.", error)
            return
        }

        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
        dateFormatter.timeZone = TimeZone(abbreviation: "UTC")

        guard let startDate = dateFormatter.date(from: startDateIso), let endDate = dateFormatter.date(from: endDateIso) else {
            let error = NSError(domain: "YourAppDomain", code: 3, userInfo: [NSLocalizedDescriptionKey: "Invalid date format. Dates must be in ISO 8601 format."])
            reject("INVALID_DATE_FORMAT", "Invalid date format. Dates must be in ISO 8601 format.", error)
            return
        }

        // Request authorization to access heart rate variability data
        healthStore.requestAuthorization(toShare: nil, read: Set([quantityType])) { success, error in
            if !success {
                reject("AUTHORIZATION_FAILED", "Failed to obtain authorization for heart rate variability data", error as NSError?)
                return
            }

            // Authorization granted, proceed with the heart rate variability query
            let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: [])

            // Sort descriptor for sorting samples by start date
            let sortDescriptor = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)

            // Create a sample query for heart rate variability data
            let hrvQuery = HKSampleQuery(sampleType: quantityType, predicate: predicate, limit: HKObjectQueryNoLimit, sortDescriptors: [sortDescriptor]) { (query, results, error) in
                if let error = error {
                    reject("QUERY_FAILED", "Failed to query heart rate variability data", error as NSError?)
                    return
                }

                var hrvData = [[String: Any]]()

                // Handle the results to extract heart rate variability values and dates
                for sample in results as? [HKQuantitySample] ?? [] {
                    let hrvValue = sample.quantity.doubleValue(for: HKUnit.secondUnit(with: .milli))
                    let sampleDate = sample.startDate
                    let iso8601DateString = dateFormatter.string(from: sampleDate)

                    let dataPoint: [String: Any] = [
                        "heartRateVariability": hrvValue,
                        "date": iso8601DateString
                    ]
                    hrvData.append(dataPoint)
                }

                // Resolve the promise with the extracted data
                resolve(hrvData)
            }

            // Execute the heart rate variability query
            healthStore.execute(hrvQuery)
        }
    }

    /*
    * Fetch resting heart rate data given a start date and an end date and format it on return.
    */
    @objc
    func readRestingHeartRateData(
        _ startDateIso: String,
        _ endDateIso: String,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        let healthStore = HKHealthStore()

        guard HKHealthStore.isHealthDataAvailable() else {
            let error = NSError(domain: "YourAppDomain", code: 1, userInfo: [NSLocalizedDescriptionKey: "HealthKit is not available on this device."])
            reject("HEALTH_KIT_NOT_AVAILABLE", "HealthKit is not available on this device.", error)
            return
        }

        guard let quantityType = HKObjectType.quantityType(forIdentifier: .restingHeartRate) else {
            let error = NSError(domain: "YourAppDomain", code: 2, userInfo: [NSLocalizedDescriptionKey: "Resting Heart Rate data is not available."])
            reject("RESTING_HEART_RATE_DATA_NOT_AVAILABLE", "Resting Heart Rate data is not available.", error)
            return
        }

        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
        dateFormatter.timeZone = TimeZone(abbreviation: "UTC")

        guard let startDate = dateFormatter.date(from: startDateIso), let endDate = dateFormatter.date(from: endDateIso) else {
            let error = NSError(domain: "YourAppDomain", code: 3, userInfo: [NSLocalizedDescriptionKey: "Invalid date format. Dates must be in ISO 8601 format."])
            reject("INVALID_DATE_FORMAT", "Invalid date format. Dates must be in ISO 8601 format.", error)
            return
        }

        // Request authorization to access resting heart rate data
        healthStore.requestAuthorization(toShare: nil, read: Set([quantityType])) { success, error in
            if !success {
                reject("AUTHORIZATION_FAILED", "Failed to obtain authorization for resting heart rate data", error as NSError?)
                return
            }

            // Authorization granted, proceed with the resting heart rate query
            let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: [])

            // Sort descriptor for sorting samples by start date
            let sortDescriptor = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)

            // Create a sample query for resting heart rate data
            let heartRateQuery = HKSampleQuery(sampleType: quantityType, predicate: predicate, limit: HKObjectQueryNoLimit, sortDescriptors: [sortDescriptor]) { (query, results, error) in
                if let error = error {
                    reject("QUERY_FAILED", "Failed to query resting heart rate data", error as NSError?)
                    return
                }

                var heartRateData = [[String: Any]]()

                // Handle the results to extract heart rate values and dates
                for sample in results as? [HKQuantitySample] ?? [] {
                    let restingHeartRateValue = sample.quantity.doubleValue(for: HKUnit(from: "count/min"))
                    let sampleDate = sample.startDate
                    let iso8601DateString = dateFormatter.string(from: sampleDate)

                    let dataPoint: [String: Any] = [
                        "restingHeartRateValue": restingHeartRateValue,
                        "date": iso8601DateString
                    ]
                    heartRateData.append(dataPoint)
                }

                // Resolve the promise with the extracted data
                resolve(heartRateData)
            }

            // Execute the resting heart rate query
            healthStore.execute(heartRateQuery)
        }
    }
  
    /*
    * Fetch sleep data phases given a start date and an end date and format it on return.
    */
    @available(iOS 16.0, *)
    @objc
    func func readSleepData(
        _ startDateIso: String,
        _ endDateIso: String,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        let healthStore = HKHealthStore()
        
        guard HKHealthStore.isHealthDataAvailable() else {
            let error = NSError(domain: "YourAppDomain", code: 1, userInfo: [NSLocalizedDescriptionKey: "HealthKit is not available on this device."])
            reject("HEALTH_KIT_NOT_AVAILABLE", "HealthKit is not available on this device.", error)
            return
        }
        
        guard let categoryType = HKObjectType.categoryType(forIdentifier: .sleepAnalysis) else {
            let error = NSError(domain: "YourAppDomain", code: 2, userInfo: [NSLocalizedDescriptionKey: "Sleep data is not available."])
            reject("SLEEP_DATA_NOT_AVAILABLE", "Sleep data is not available.", error)
            return
        }
        
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
        dateFormatter.timeZone = TimeZone(abbreviation: "UTC")
        
        guard let startDate = dateFormatter.date(from: startDateIso), let endDate = dateFormatter.date(from: endDateIso) else {
            let error = NSError(domain: "YourAppDomain", code: 3, userInfo: [NSLocalizedDescriptionKey: "Invalid date format. Dates must be in ISO 8601 format."])
            reject("INVALID_DATE_FORMAT", "Invalid date format. Dates must be in ISO 8601 format.", error)
            return
        }
        
        // Request authorization to access sleep data
        healthStore.requestAuthorization(toShare: nil, read: Set([categoryType])) { success, error in
            if !success {
                reject("AUTHORIZATION_FAILED", "Failed to obtain authorization for sleep data", error)
                return
            }
            
            // Authorization granted, proceed with the sleep query
            let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: [])
            
            // Sort descriptor for sorting samples by start date
            let sortDescriptor = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)
            
            // Create a sample query for sleep data
            let sleepQuery = HKSampleQuery(sampleType: categoryType, predicate: predicate, limit: HKObjectQueryNoLimit, sortDescriptors: [sortDescriptor]) { (query, results, error) in
                if let error = error {
                    reject("QUERY_FAILED", "Failed to query sleep data", error)
                    return
                }

                var sleepData = [[String: Any]]()

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

                    let iso8601StartDateString = dateFormatter.string(from: sample.startDate)
                    let iso8601EndDateString = dateFormatter.string(from: sample.endDate)

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

            // Execute the query
            healthStore.execute(sleepQuery)
        }
    }

    /*
    * Fetch activity rings data given a start date and an end date and format it on return.
    */
    @available(iOS 16.0, *)
    @objc
    func readActivityRingsData(
        _ startDateIso: String,
        _ endDateIso: String,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        let healthStore = HKHealthStore();

        // Check for health data availability.
        guard HKHealthStore.isHealthDataAvailable() else {
            let error = NSError(domain: "YourAppDomain", code: 1, userInfo: [NSLocalizedDescriptionKey: "HealthKit is not available on this device."])
            reject("HEALTH_KIT_NOT_AVAILABLE", "HealthKit is not available on this device.", error)
            return
        }

        // Ensure we can request the data type.
        guard let activitySummaryType = HKObjectType.activitySummaryType() else {
            let error = NSError(domain: "YourAppDomain", code: 2, userInfo: [NSLocalizedDescriptionKey: "Activity Summary data is not available."])
            reject("ACTIVITY_SUMMARY_DATA_NOT_AVAILABLE", "Activity Summary data is not available.", error)
            return
        }

        let readTypes: Set<HKObjectType> = [activitySummaryType];

        // Date formatter to convert ISO 8601 strings to Date objects
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
        dateFormatter.timeZone = TimeZone(abbreviation: "UTC")

        guard let startDate = dateFormatter.date(from: startDateIso), let endDate = dateFormatter.date(from: endDateIso) else {
            let error = NSError(domain: "YourAppDomain", code: 3, userInfo: [NSLocalizedDescriptionKey: "Invalid date format. Dates must be in ISO 8601 format."])
            reject("INVALID_DATE_FORMAT", "Invalid date format. Dates must be in ISO 8601 format.", error)
            return
        }

        // Request authorization to access activity rings data.
        healthStore.requestAuthorization(toShare: Set(), read: readTypes) { (success, error) in 
            if !success {
                reject("AUTHORIZATION_FAILED", "Failed to obtain authorization for activity rings data", error)
                return
            }

            // Build predicate for the specified date range.
            let calendar = NSCalendar.current
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
                        reject("QUERY_FAILED", "Failed to query activity rings data", error as NSError?)
                    } else {
                        resolve([]);  // No data available.
                    }
                    return
                }

                var ringData: [[String: Any]] = [];

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
                }

                resolve(ringData);
            }
            healthStore.execute(query);
        }
    }
  
    /*
    * Expose the methods to React Native.
    */
    @objc
    static func requireMainQueueSetup() -> Bool {
        return true
    }
}
