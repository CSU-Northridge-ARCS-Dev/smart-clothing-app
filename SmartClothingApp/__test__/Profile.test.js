import React from 'react';
import { act, render, waitFor } from '@testing-library/react-native';
import ProfileScreen from '../src/screens/Profile/index.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from 'react-native';
import { Text, TextInput, ScrollView } from 'react-native';
import { HelperText } from 'react-native-paper';
import renderer from 'react-test-renderer';
import { Button } from 'react-native-paper';


// Mock dependencies or Redux actions as needed
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

// Mocking startUpdateUserData, fetchUserData, and startUpdateProfile
jest.mock('../src/actions/userActions', () => ({
  startUpdateUserData: jest.fn(),
  fetchUserData: jest.fn(),
  startUpdateProfile: jest.fn(),
}));

// Mocking Alert module
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

describe('ProfileScreen', () => {
  let component;
  let instance;

  beforeEach(() => {
    component = render(<ProfileScreen navigation={{ navigate: jest.fn() }} />);
    instance = component.getByTestId('profile-screen'); // add testID to the root element of ProfileScreen
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test Case 1: Check if ProfileScreen renders correctly
  it('renders correctly', () => {
    expect(instance).toMatchSnapshot();
  });

});
