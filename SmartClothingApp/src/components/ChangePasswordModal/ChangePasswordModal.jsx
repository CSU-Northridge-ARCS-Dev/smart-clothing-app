import React, { useState } from 'react';
import { View, StyleSheet, Modal, KeyboardAvoidingView } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { AppColor } from '../../constants/themes';
import AppToast from '../Dialogs/AppToast';
import { } from '../../actions/userActions';
import { reauthenticate, updateUserPassword } from '../../actions/userActions';
import { useDispatch, useSelector } from "react-redux";

const ChangePasswordModal = (props) => {
    const [isPasswordVisible, setPasswordVisible] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const clearSuccessMessage = () => {
        setSuccessMessage('');
    };

    const handleCancel = () => {
        resetForm();
        setPasswordVisible(false);
        props.closeModal();
    };

    const clearErrorMessage = () => {
        setErrorMessage('');
    };

    const resetForm = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleUpdate = async () => {
        try {
            if (newPassword === '') {
                setErrorMessage('New password cannot be empty.');
                return;
            }

            if (newPassword.length < 6) {
                setErrorMessage('Password length must be at least 6 characters.');
                return;
            }

            if (newPassword === currentPassword) {
                setErrorMessage('New password cannot be the same as the current password.');
                return;
            }

            if (newPassword !== confirmPassword) {
                setErrorMessage('Passwords do not match.');
                return;
            }

            clearErrorMessage();

            const reauthSuccessful = await reauthenticate(currentPassword);

            if (reauthSuccessful) {
                const passwordUpdateSuccessful = await updateUserPassword(newPassword);

                if (passwordUpdateSuccessful) {
                    resetForm();
                    setPasswordVisible(false);
                    setSuccessMessage('Password updated successfully.');
                    setTimeout(() => {
                        setSuccessMessage('');
                        props.closeModal();
                    }, 3000);
                } else {
                    setErrorMessage('Password update failed.');
                }
            } else {
                setErrorMessage('Reauthentication failed.');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            setErrorMessage('An error occurred while changing the password.');
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={props.visible}
            presentationStyle="pageSheet"
            statusBarTranslucent={true}
        >
            <View style={styles.modalBackground}>
                <View style={styles.modalContent}>
                    <KeyboardAvoidingView
                        behavior="padding"
                        style={styles.toastContainer}
                    >
                        <AppToast />
                    </KeyboardAvoidingView>
                    <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={80}>
                        <Text style={styles.title}>Password Change</Text>

                        <View style={styles.inputContainer}>
                            <TextInput
                                label="Current Password"
                                value={currentPassword}
                                mode="outlined"
                                onChangeText={(text) => setCurrentPassword(text)}
                                secureTextEntry={!isPasswordVisible}
                            />
                            <Icon
                                name={isPasswordVisible ? 'unlock-alt' : 'lock'}
                                size={25}
                                color="black"
                                style={styles.icon}
                                onPress={() => setPasswordVisible(!isPasswordVisible)}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <TextInput
                                label="New Password"
                                value={newPassword}
                                mode="outlined"
                                onChangeText={(text) => setNewPassword(text)}
                                secureTextEntry={!isPasswordVisible}
                            />

                        </View>

                        <View style={styles.inputContainer}>
                            <TextInput
                                label="Confirm Password"
                                value={confirmPassword}
                                mode="outlined"
                                onChangeText={(text) => setConfirmPassword(text)}
                                secureTextEntry={!isPasswordVisible}
                            />

                            {errorMessage ? (
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            ) : null}
                            {successMessage ? (
                                <Text style={styles.successText}>{successMessage}</Text>
                            ) : null}
                        </View>

                        <View style={styles.btnContainer}>
                            <Button
                                mode="outlined"
                                onPress={handleCancel}
                                style={styles.button}
                            >
                                Cancel
                            </Button>
                            <Button
                                mode="outlined"
                                onPress={handleUpdate}
                                style={styles.button}
                            >
                                Update
                            </Button>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    title: {
        fontSize: 36,
        marginVertical: 24,
        textAlign: 'center',
        paddingBottom: 10,
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: AppColor.primaryContainer,
        padding: 20,
        borderRadius: 10,
        width: '100%',
        height: '100%',
        alignSelf: 'center',
        elevation: 5,
        justifyContent: 'center',
    },
    btnContainer: {
        marginVertical: 10,
        flexDirection: 'row',
    },
    button: {
        flex: 1,
        marginHorizontal: 10,
        backgroundColor: '#fff',
    },
    toastContainer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        zIndex: 999,
    },
    inputContainer: {
        position: 'relative',
    },
    textInput: {
        marginBottom: 10,
    },
    icon: {
        position: 'absolute',
        right: 10,
        top: 16,
    },
    errorText: {
        color: 'red',
        marginTop: 5,
    },
});

export default ChangePasswordModal;