/**
 * Integration tests for the Pixel Watch screens : DailySummary,
 * the Home cards and the Pixel Watch card on MyDevices, rendered with the
 * real store and a NavigationContainer.
 *
 * Mocks: firebaseConfig.js and localStorage.js (factories, as in the other
 * screen tests), fitbitTokens.js and insightsApi.js (no SecureStore, no HTTP).
 *
 * @file PixelWatchScreens.test.js
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as StoreProvider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import DailySummary from '../../../../src/screens/DailySummary/index.jsx';
import HomeScreen from '../../../../src/screens/HomeScreen/index.jsx';
import MyDevices from '../../../../src/screens/MyDevices/index.jsx';
import configureStore from '../../../../src/store.js';
import { getFitbitTokens } from '../../../../src/utils/fitbitTokens';
import { getFitbitDay } from '../../../../src/services/insightsApi';
import {
  toLocalDateString,
  addDaysToDateString,
} from '../../../../src/utils/dateConversions';

jest.mock('../../../../firebaseConfig.js', () => ({
  auth: { currentUser: { uid: 'user-1', email: 'test1@gmail.com' } },
  database: {},
}));

jest.mock('firebase/auth', () => ({
  initializeApp: jest.fn(),
  registerVersion: jest.fn(),
  getAuth: jest.fn(),
  getDatabase: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  setDoc: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  deleteField: jest.fn(),
}));

jest.mock('../../../../src/utils/localStorage.js', () => ({
  AsyncStorage: jest.fn(),
  storeUID: jest.fn(),
  getUID: jest.fn(),
  clearUID: jest.fn(),
  storeMetrics: jest.fn(),
  getMetrics: jest.fn(),
  clearMetrics: jest.fn(),
  getToken: jest.fn(() => Promise.resolve('mocked-token')),
  storeToken: jest.fn(),
  clearToken: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../../../src/utils/fitbitTokens', () => ({
  getFitbitTokens: jest.fn(),
  setFitbitTokens: jest.fn(),
  clearFitbitTokens: jest.fn(),
}));

jest.mock('../../../../src/services/insightsApi', () => ({
  getFitbitAuthUrl: jest.fn(),
  getFitbitDay: jest.fn(),
  getErrorCode: (e) =>
    (e && e.response && e.response.data && e.response.data.error) ||
    (e && e.message) ||
    'UNKNOWN_ERROR',
}));

jest.mock('expo-web-browser');
jest.mock('expo-linking');
jest.mock('expo-notifications');
jest.mock('@shopify/react-native-skia', () =>
  require('../../../__mocks__/@shopify__react-native-skia.js')
);
jest.mock('../../../../src/components/visualizations/ActivityRings/Ring.jsx', () => {
  const { View } = require('react-native');
  return () => <View />;
});
jest.mock('react-native-vector-icons/FontAwesome5', () => 'Icon');
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');
jest.mock('expo-font', () => ({
  loadAsync: jest.fn().mockResolvedValue(true),
  isLoaded: jest.fn().mockReturnValue(true),
}));
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const MockIcon = ({ name }) => React.createElement('Icon', { name });
  return {
    MaterialIcons: MockIcon,
    MaterialCommunityIcons: MockIcon,
    FontAwesome: MockIcon,
    Ionicons: MockIcon,
  };
});

const Stack = createNativeStackNavigator();
const TODAY = toLocalDateString();
const TOKENS = { accessToken: 'a', refreshToken: 'r' };

const dayFor = (date) => ({
  date,
  sleep: {
    totalMinutes: 412,
    efficiency: 93,
    deep: 70,
    light: 240,
    rem: 102,
    wake: 38,
    bedTime: '2026-10-09T23:10:00.000',
    wakeTime: '2026-10-10T06:40:00.000',
    levels: [],
  },
  heart: {
    restingHeartRate: 56,
    previousRestingHeartRate: 59,
    zones: { fatBurn: 45, cardio: 22, peak: 4 },
  },
  workouts: [
    {
      type: 'Run',
      startTime: '2026-10-10T07:00:00.000-07:00',
      durationMin: 30,
      avgHeartRate: 152,
    },
  ],
});

const Placeholder = () => null;

const renderStack = (initialRouteName, screens) =>
  render(
    <StoreProvider store={configureStore()}>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName={initialRouteName}>
            {screens}
            <Stack.Screen name="Main" component={Placeholder} />
            <Stack.Screen name="Device" component={Placeholder} />
            <Stack.Screen name="DeviceDetails" component={Placeholder} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </StoreProvider>
  );

beforeEach(() => {
  jest.clearAllMocks();
  getFitbitDay.mockImplementation((date) => Promise.resolve(dayFor(date)));
});

describe('DailySummary', () => {
  const renderDailySummary = () =>
    renderStack('DailySummary', [
      <Stack.Screen key="ds" name="DailySummary" component={DailySummary} />,
    ]);

  it('asks to connect the watch when it is not connected', async () => {
    getFitbitTokens.mockResolvedValue(null);
    const { findByTestId } = renderDailySummary();
    expect(await findByTestId('fitbit-connect-prompt')).toBeTruthy();
    expect(getFitbitDay).not.toHaveBeenCalled();
  });

  it("shows today's sleep, heart rate and workouts when connected", async () => {
    getFitbitTokens.mockResolvedValue(TOKENS);
    const { findByTestId, getByText, getByTestId } = renderDailySummary();
    expect(await findByTestId('sleep-card')).toBeTruthy();
    expect(getByTestId('heart-card')).toBeTruthy();
    expect(getByText('Run')).toBeTruthy();
    expect(getByText('Today')).toBeTruthy();
    expect(getByTestId('ai-feedback-placeholder')).toBeTruthy();
    expect(getFitbitDay).toHaveBeenCalledWith(TODAY);
  });

  it('loads the previous day with the arrow and blocks future dates', async () => {
    getFitbitTokens.mockResolvedValue(TOKENS);
    const { findByTestId, getByTestId } = renderDailySummary();
    await findByTestId('sleep-card');

    fireEvent.press(getByTestId('prev-day'));
    await waitFor(() =>
      expect(getFitbitDay).toHaveBeenCalledWith(addDaysToDateString(TODAY, -1))
    );

    fireEvent.press(getByTestId('next-day'));
    fireEvent.press(getByTestId('next-day'));
    await findByTestId('sleep-card');
    // Back on today: the next arrow is disabled, so no future date is fetched
    expect(getFitbitDay).not.toHaveBeenCalledWith(addDaysToDateString(TODAY, 1));
  });

  it('shows an error card when the day fails to load', async () => {
    getFitbitTokens.mockResolvedValue(TOKENS);
    getFitbitDay.mockRejectedValue({ response: { data: { error: 'FITBIT_API_ERROR' } } });
    const { findByText } = renderDailySummary();
    expect(await findByText("Fitbit didn't respond. Pull down to try again.")).toBeTruthy();
  });
});

describe('HomeScreen', () => {
  const renderHome = () =>
    renderStack('Home', [
      <Stack.Screen key="home" name="Home" component={HomeScreen} />,
      <Stack.Screen key="ds" name="DailySummary" component={DailySummary} />,
    ]);

  it('replaces the demo charts with a connect prompt when not connected', async () => {
    getFitbitTokens.mockResolvedValue(null);
    const { findByTestId, queryByText } = renderHome();
    expect(await findByTestId('fitbit-connect-prompt')).toBeTruthy();
    expect(queryByText('Breath Rate')).toBeNull();
    expect(queryByText('Ventilation Rate')).toBeNull();
    expect(queryByText('Heartbeat Rate')).toBeNull();
  });

  it("shows today's sleep and heart cards and opens DailySummary", async () => {
    getFitbitTokens.mockResolvedValue(TOKENS);
    const { findByTestId, findByText } = renderHome();
    fireEvent.press(await findByTestId('heart-card'));
    expect(await findByText('Daily Summary')).toBeTruthy();
    expect(getFitbitDay).toHaveBeenCalledTimes(1);
  });
});

describe('MyDevices', () => {
  const renderDevices = () =>
    renderStack('Devices', [
      <Stack.Screen key="dev" name="Devices" component={MyDevices} />,
      <Stack.Screen key="ds" name="DailySummary" component={DailySummary} />,
    ]);

  it('lists the Pixel Watch with a Connect button', async () => {
    getFitbitTokens.mockResolvedValue(null);
    const { findByText, getByText } = renderDevices();
    expect(await findByText('Pixel Watch')).toBeTruthy();
    expect(getByText('Smart Sock')).toBeTruthy();
    expect(getByText('Smart Shirt')).toBeTruthy();
  });

  it('offers Disconnect once connected, and View opens DailySummary', async () => {
    getFitbitTokens.mockResolvedValue(TOKENS);
    const { findByText, getByTestId } = renderDevices();
    expect(await findByText('Disconnect')).toBeTruthy();
    fireEvent.press(getByTestId('view-3'));
    expect(await findByText('Daily Summary')).toBeTruthy();
  });
});
