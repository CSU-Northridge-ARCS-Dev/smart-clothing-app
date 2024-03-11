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
  func requestAuthorization() async {
    
    // Health data types we want to show in our app
    let allTypes: Set<HKSampleType> = [
      HKObjectType.categoryType(forIdentifier: HKCategoryTypeIdentifier.sleepAnalysis)!,
      
      HKObjectType.quantityType(forIdentifier: HKQuantityTypeIdentifier.activeEnergyBurned)!,
      
      HKObjectType.quantityType(forIdentifier: HKQuantityTypeIdentifier.heartRate)!,
      
      HKObjectType.quantityType(forIdentifier: HKQuantityTypeIdentifier.restingHeartRate)!,
      
      HKObjectType.quantityType(forIdentifier: HKQuantityTypeIdentifier.stepCount)!,
      
      HKObjectType.categoryType(forIdentifier: HKCategoryTypeIdentifier.appleStandHour)!,
      
      HKObjectType.quantityType(forIdentifier: HKQuantityTypeIdentifier.appleMoveTime)!,
      
      HKObjectType.quantityType(forIdentifier: HKQuantityTypeIdentifier.appleExerciseTime)!,
      
      HKObjectType.quantityType(forIdentifier: HKQuantityTypeIdentifier.heartRateVariabilitySDNN)!
    ]
    do {
      // Check that Health Data is avaliable on the device
      if HKHealthStore.isHealthDataAvailable() {
        
        // Asynchronously request authorization to the data
        try await healthStore.requestAuthorization(toShare: allTypes, read: allTypes)
      }
    } catch {
      // Typically, authorization requests only fail if you haven't set the
      // usage and share descriptions in your app's Info.plist, or if
      // Health data isn't available on the current device.
      fatalError("*** An unexpected error occurred while requesting authorization: \(error.localizedDescription) ***")
    }
  }
  
@objc
  static func requireMainQueueSetup() -> Bool {
    return true
  }
}
