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
          HKObjectType.quantityType(forIdentifier: HKQuantityTypeIdentifier.activeEnergyBurned)!,
          HKObjectType.quantityType(forIdentifier: HKQuantityTypeIdentifier.heartRate)!,
          HKObjectType.quantityType(forIdentifier: HKQuantityTypeIdentifier.restingHeartRate)!,
          HKObjectType.quantityType(forIdentifier: HKQuantityTypeIdentifier.stepCount)!,
//          HKObjectType.quantityType(forIdentifier: HKQuantityTypeIdentifier.appleStandTime)!,
//          HKObjectType.quantityType(forIdentifier: HKQuantityTypeIdentifier.appleMoveTime)!,
//          HKObjectType.quantityType(forIdentifier: HKQuantityTypeIdentifier.appleExerciseTime)!,
          HKObjectType.quantityType(forIdentifier: HKQuantityTypeIdentifier.heartRateVariabilitySDNN)!
      ]
      
      // Check if Health Data is available on the device
      if HKHealthStore.isHealthDataAvailable() {
          let healthStore = HKHealthStore()
          
          // Request authorization to the data
          healthStore.requestAuthorization(toShare: allTypes, read: allTypes) { success, error in
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

  
@objc
  static func requireMainQueueSetup() -> Bool {
    return true
  }
}
