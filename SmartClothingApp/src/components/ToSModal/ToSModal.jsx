import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useDispatch } from "react-redux";

import { Text, Checkbox } from "react-native-paper";
import { AppColor, AppFonts } from "../../constants/themes";

import Icon from "react-native-vector-icons/FontAwesome5";

const ToSModal = (props) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={props.visible}
      onRequestClose={props.toggleModalVisibility}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ScrollView>
            <Text style={styles.modalTextTitle}>
              Smart Textile Clothing Devices App - Terms of Use
            </Text>
            <Text style={styles.modalText}>Effective Date: 10/2/2023</Text>

            <Text style={styles.modalText}>
              Please read these Terms of Use ("Terms") carefully before using
              the Smart Textile Clothing Devices App (the "App"), which is
              designed to work with Hexoskin and Sensoria smart devices and iOS
              and Android Apple Watches, to track body metrics and provide data
              analytics. These Terms constitute a legally binding agreement
              between you ("User," "you," or "your") and CSUN ("Company," "we,"
              "us," or "our"). By downloading, accessing, or using the App, you
              agree to be bound by these Terms. If you do not agree to these
              Terms, you will not be allowed to use the app.
            </Text>

            <Text style={styles.modalTextTitle}>Acceptance of Terms</Text>

            <Text style={styles.modalText}>
              By accessing or using the App, you agree to comply with and be
              bound by these Terms, as well as any additional terms, guidelines,
              and rules referenced herein or otherwise communicated to you
              through the App.
            </Text>

            <Text style={styles.modalTextTitle}>Use of the App</Text>

            <Text style={styles.modalText}>
              2.1 User Age: You must be at least 13 years old to use the App. By
              using the App, you affirm that you meet this age requirement.
            </Text>

            <Text style={styles.modalText}>
              2.2 Device Compatibility: The App is designed to work with
              Hexoskin and Sensoria smart devices and iOS/Android Smart Watches.
              We are not responsible for any incompatibility issues arising from
              the use of third-party devices.
            </Text>

            <Text style={styles.modalText}>
              2.3 User Data: By using the App, you consent to the collection,
              storage, and processing of your personal and health-related data
              as described in our Privacy Policy. You understand that the App
              requires access to certain device features and data to function
              properly.
            </Text>

            <Text style={styles.modalText}>
              2.4 Prohibited Use: You agree not to use the App for any unlawful
              or unauthorized purpose. You shall not engage in any activity that
              disrupts or interferes with the proper functioning of the App or
              its associated services.
            </Text>

            <Text style={styles.modalTextTitle}>
              {" "}
              User Responsibilities: The user is responsible for assuring that
              the data is available to the applicatoin
            </Text>

            <Text style={styles.modalText}>
              3.1 Accuracy of Information: You are solely responsible for the
              accuracy and completeness of the information you provide through
              the App.
            </Text>

            <Text style={styles.modalText}>
              3.2 Healthcare Professional Advice: The data and information
              provided by the App are for informational purposes only and should
              not be considered a substitute for professional medical advice.
              Consult a qualified healthcare professional before making any
              health-related decisions based on the App's data.
            </Text>

            <Text style={styles.modalText}>
              3.3 Assumption of Risk: You understand that using the App involves
              inherent risks. You assume all risks associated with using the App
              and its data.
            </Text>

            <Text style={styles.modalTextTitle}>Intellectual Property</Text>

            <Text style={styles.modalText}>
              4.1 App Ownership: The App, including its design, graphics, text,
              content, and all other components, is owned by the Company or its
              licensors and is protected by copyright and other intellectual
              property laws.
            </Text>

            <Text style={styles.modalText}>
              4.2 License: We grant you a limited, non-exclusive,
              non-transferable, revocable license to use the App for your
              personal, non-commercial purposes. You may not reproduce,
              distribute, modify, create derivative works of, publicly display,
              or perform the App except as expressly permitted by these Terms.
            </Text>

            <Text style={styles.modalTextTitle}>Termination</Text>

            <Text style={styles.modalText}>
              We reserve the right to terminate or suspend your access to the
              App, without notice, for any reason, including, but not limited
              to, violation of these Terms or any applicable law.
            </Text>

            <Text style={styles.modalTextTitle}>Disclaimer of Warranties</Text>

            <Text style={styles.modalText}>
              The App is provided on an "as-is" and "as-available" basis. We do
              not warrant that the App will be error-free, uninterrupted,
              secure, or suitable for your needs. We disclaim all warranties,
              whether express, implied, or statutory, regarding the App.
            </Text>

            <Text style={styles.modalTextTitle}>Limitation of Liability</Text>

            <Text style={styles.modalText}>
              To the maximum extent permitted by law, we shall not be liable for
              any indirect, incidental, special, consequential, or punitive
              damages arising out of or in connection with your use of the App.
            </Text>

            <Text style={styles.modalTextTitle}>Modifications to Terms</Text>

            <Text style={styles.modalText}>
              We reserve the right to modify these Terms at any time without
              prior notice. Any changes will be effective upon posting the
              updated Terms on the App. Your continued use of the App after such
              modifications constitutes your acceptance of the updated Terms.
            </Text>

            <Text style={styles.modalTextTitle}>
              Governing Law and Dispute Resolution
            </Text>

            <Text style={styles.modalText}>
              These Terms shall be governed by and construed in accordance with
              the laws of the State of California, USA. Any disputes arising
              under or in connection with these Terms shall be subject to the
              exclusive jurisdiction of the courts located in the State of
              California, USA.
            </Text>

            <Text style={styles.modalTextTitle}>Contact information</Text>

            <Text style={styles.modalText}>
              If you have any questions about these Terms or the App, you may
              contact us at ARCS.center
            </Text>

            <Text style={styles.modalText}>
              By using the Smart Textile Clothing Devices App, you acknowledge
              that you have read, understood, and agreed to these Terms of Use.
            </Text>

            <Text style={styles.modalText}>Acceptance of Terms</Text>

            <View style={styles.checkbox}>
              <Checkbox
                status={props.isTermsAccepted ? "checked" : "unchecked"}
                onPress={() => {
                  props.setIsTermsAccepted(!props.isTermsAccepted);
                }}
              />

              <Text style={styles.modalText}>{"I Agree"}</Text>
            </View>

            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={props.toggleModalVisibility}
            >
              <Icon name="times-circle" size={30} color="black" />
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  content: {
    backgroundColor: AppColor.background,
    paddingHorizontal: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    transform: [{ translateY: -25 }],
    paddingTop: 25,
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  closeModalButton: {
    right: 0,
    top: 0,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    position: "absolute",
    right: 10,
    top: 16,
    transform: [{ translateY: 0 }],
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "90%",
    maxHeight: "80%",
  },
  modalTextTitle: {
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "bold",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  btnContainer: {
    marginVertical: 10,
    flexDirection: "row",
  },
});
export default ToSModal;
