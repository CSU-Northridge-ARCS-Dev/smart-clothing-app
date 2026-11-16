/**
 * Integration tests for the watch screens : DailySummary, WorkoutDetail,
 * the Home cards and the Health Connect card on MyDevices, plus the steps
 * and sleep activity rings on Home and Insights, rendered with the
 * real store and a NavigationContainer. The watch data comes from the
 * react-native-health-connect mock.
 *
 * Mocks: firebaseConfig.js and localStorage.js (factories, as in the other
 * screen tests), insightsApi.js (no HTTP) and healthStore.js (no Firestore).
 *
 * @file PixelWatchScreens.test.js
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as StoreProvider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import {
  fireEvent,
  render,
  waitFor,
  within,
} from '@testing-library/react-native';
import { Calendar } from 'react-native-calendars';

import DailySummary from '../../../../src/screens/DailySummary/index.jsx';
import WorkoutDetail from '../../../../src/screens/WorkoutDetail/index.jsx';
import HomeScreen from '../../../../src/screens/HomeScreen/index.jsx';
import MyDevices from '../../../../src/screens/MyDevices/index.jsx';
import ViewInsights from '../../../../src/screens/ViewInsights/index.jsx';
import configureStore from '../../../../src/store.js';
import { generateInsightFromDay } from '../../../../src/services/insightsApi';
import { saveDailyStats, saveAIFeedback } from '../../../../src/services/healthStore';
import {
  getCachedFeedback,
  setCachedFeedback,
  getAIConsent,
  setAIConsent,
} from '../../../../src/utils/localStorage.js';
import { lastSevenDates } from '../../../../src/utils/rings';
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
  getCachedFeedback: jest.fn(),
  setCachedFeedback: jest.fn(),
  getAIConsent: jest.fn(),
  setAIConsent: jest.fn(),
  getHealthConnectDisconnected: jest.fn(() => Promise.resolve(false)),
  setHealthConnectDisconnected: jest.fn(() => Promise.resolve()),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../../../src/services/insightsApi', () => ({
  generateInsightFromDay: jest.fn(),
  getErrorCode: (e) =>
    (e && e.response && e.response.data && e.response.data.error) ||
    (e && e.message) ||
    'UNKNOWN_ERROR',
}));

jest.mock('../../../../src/services/healthStore', () => ({
  saveDailyStats: jest.fn(),
  saveAIFeedback: jest.fn(),
}));

jest.mock('expo-notifications');
jest.mock('@shopify/react-native-skia', () =>
  require('../../../__mocks__/@shopify__react-native-skia.js')
);
// Each ring renders as a View carrying its progress, so tests can read it
jest.mock('../../../../src/components/visualizations/ActivityRings/Ring.jsx', () => {
  const { View } = require('react-native');
  return ({ ring }) => <View testID="ring-mock" progress={ring.totalProgress} />;
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
const YESTERDAY = addDaysToDateString(TODAY, -1);

// [steps, sleep] progress drawn in the small ring for a date
const ringProgress = (getByTestId, date) =>
  within(getByTestId(`ring-${date}`))
    .getAllByTestId('ring-mock')
    .map((ring) => ring.props.progress);

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

// In-memory stand-ins for the AI feedback cache and consent in AsyncStorage
let feedbackCache;
let aiConsent;

beforeEach(() => {
  jest.clearAllMocks();
  feedbackCache = {};
  aiConsent = false;
  getCachedFeedback.mockImplementation((date) =>
    Promise.resolve(feedbackCache[date] || null)
  );
  setCachedFeedback.mockImplementation((date, insight) => {
    feedbackCache[date] = insight;
    return Promise.resolve();
  });
  getAIConsent.mockImplementation(() => Promise.resolve(aiConsent));
  setAIConsent.mockImplementation((value) => {
    aiConsent = value;
    return Promise.resolve();
  });
});

describe('Watch screens', () => {
  const { Platform } = require('react-native');
  const healthConnect = require('react-native-health-connect');
  const originalOS = Platform.OS;
  const HOUR = 60 * 60 * 1000;
  const RUN_ID = 'run-1';

  const GRANTED = [
    'Steps',
    'HeartRate',
    'RestingHeartRate',
    'SleepSession',
    'ExerciseSession',
    'Distance',
    'TotalCaloriesBurned',
    'Vo2Max',
  ].map((recordType) => ({ accessType: 'read', recordType }));

  // A night from 23:00 to 06:00 and a 30 minute run at 07:00, placed on
  // whichever day is being read
  const recordsFor = (recordType, dayStart) => {
    const at = (hours) => new Date(dayStart + hours * HOUR).toISOString();
    switch (recordType) {
      case 'SleepSession':
        return [
          {
            startTime: at(-1),
            endTime: at(6),
            stages: [
              { startTime: at(-1), endTime: at(2), stage: 4 },
              { startTime: at(2), endTime: at(4), stage: 5 },
              { startTime: at(4), endTime: at(5.5), stage: 6 },
              { startTime: at(5.5), endTime: at(6), stage: 1 },
            ],
          },
        ];
      case 'RestingHeartRate':
        return [{ time: at(6), beatsPerMinute: 56 }];
      case 'HeartRate':
        return [
          {
            samples: [
              { time: at(7.1), beatsPerMinute: 150 },
              { time: at(7.3), beatsPerMinute: 154 },
            ],
          },
        ];
      case 'ExerciseSession':
        return [
          {
            startTime: at(7),
            endTime: at(7.5),
            exerciseType: 56,
            metadata: { id: RUN_ID },
          },
        ];
      default:
        return [];
    }
  };

  const midnight = (date) => {
    const [y, m, d] = date.split('-').map(Number);
    return new Date(y, m - 1, d).getTime();
  };

  // The records land on the day being read, or always on day when it's given
  const connect = ({ empty = false, day = null } = {}) => {
    healthConnect.getGrantedPermissions.mockResolvedValue(GRANTED);
    healthConnect.aggregateRecord.mockResolvedValue(
      empty ? {} : { COUNT_TOTAL: 8432, dataOrigins: ['com.watch.app'] }
    );
    healthConnect.readRecords.mockImplementation(async (recordType, options) => {
      if (empty) return { records: [] };
      const dayStart = day
        ? midnight(day)
        : new Date(options.timeRangeFilter.endTime).getTime() - 24 * HOUR;
      return { records: recordsFor(recordType, dayStart) };
    });
  };

  const renderHome = () =>
    renderStack('Home', [
      <Stack.Screen key="home" name="Home" component={HomeScreen} />,
      <Stack.Screen key="ins" name="Insights" component={ViewInsights} />,
      <Stack.Screen key="ds" name="DailySummary" component={DailySummary} />,
    ]);

  const renderWorkout = (logId) =>
    renderStack('WorkoutDetail', [
      <Stack.Screen
        key="wd"
        name="WorkoutDetail"
        component={WorkoutDetail}
        initialParams={{ date: TODAY, logId }}
      />,
      <Stack.Screen key="ds" name="DailySummary" component={DailySummary} />,
    ]);

  const renderDailySummary = () =>
    renderStack('DailySummary', [
      <Stack.Screen key="ds" name="DailySummary" component={DailySummary} />,
    ]);

  // The Health Connect service only reads on Android
  beforeEach(() => {
    Platform.OS = 'android';
  });

  afterEach(() => {
    Platform.OS = originalOS;
    healthConnect.getGrantedPermissions.mockResolvedValue([]);
    healthConnect.aggregateRecord.mockResolvedValue({});
    healthConnect.readRecords.mockResolvedValue({ records: [] });
  });

  it('shows the day read from Health Connect', async () => {
    connect();
    const { findByTestId, getByTestId, getByText } = renderDailySummary();
    expect(await findByTestId('sleep-card')).toBeTruthy();
    expect(within(getByTestId('steps-card')).getByText('8,432')).toBeTruthy();
    expect(getByTestId('heart-card')).toBeTruthy();
    expect(getByText('Run')).toBeTruthy();
    expect(getByText('Today')).toBeTruthy();
    expect(getByTestId('ai-feedback-section')).toBeTruthy();
    expect(saveDailyStats).not.toHaveBeenCalled();
  });

  // A day's heart rate is read up to the midnight that ends it
  const heartRateReadEnding = (date) => [
    'HeartRate',
    expect.objectContaining({
      timeRangeFilter: expect.objectContaining({
        endTime: new Date(midnight(date)).toISOString(),
      }),
    }),
  ];

  it('loads the previous day with the arrow and blocks future dates', async () => {
    connect();
    const { findByTestId, getByTestId } = renderDailySummary();
    await findByTestId('sleep-card');

    fireEvent.press(getByTestId('prev-day'));
    await waitFor(() =>
      expect(healthConnect.readRecords).toHaveBeenCalledWith(
        ...heartRateReadEnding(TODAY)
      )
    );

    fireEvent.press(getByTestId('next-day'));
    fireEvent.press(getByTestId('next-day'));
    await findByTestId('sleep-card');
    // Back on today: the next arrow is disabled, so no future date is read
    expect(healthConnect.readRecords).not.toHaveBeenCalledWith(
      ...heartRateReadEnding(addDaysToDateString(TODAY, 2))
    );
  });

  describe('AI feedback', () => {
    const INSIGHT = {
      headline: 'Good sleep set up your run',
      keySignals: ['7h of sleep'],
      focus: ['Easy day tomorrow'],
    };
    const USAGE = { model: 'm', inputTokens: 10, outputTokens: 20 };

    beforeEach(() => {
      aiConsent = true;
      generateInsightFromDay.mockResolvedValue({ insight: INSIGHT, usage: USAGE });
    });

    it('asks for consent first, then sends the Health Connect day', async () => {
      aiConsent = false;
      connect();
      const { findByText, getByText } = renderDailySummary();
      fireEvent.press(await findByText('Get feedback'));

      expect(await findByText('Share your data with AI?')).toBeTruthy();
      expect(generateInsightFromDay).not.toHaveBeenCalled();

      fireEvent.press(getByText('I agree'));
      expect(await findByText('Good sleep set up your run')).toBeTruthy();
      expect(getByText('Easy day tomorrow')).toBeTruthy();
      expect(generateInsightFromDay).toHaveBeenCalledWith(
        TODAY,
        expect.any(Object),
        expect.objectContaining({
          date: TODAY,
          steps: 8432,
          sleep: expect.objectContaining({ totalMinutes: 390 }),
        })
      );
      expect(setCachedFeedback).toHaveBeenCalledWith(TODAY, INSIGHT);
    });

    it('does not call the service when consent is declined', async () => {
      aiConsent = false;
      connect();
      const { findByText, getByText, queryByText } = renderDailySummary();
      fireEvent.press(await findByText('Get feedback'));
      fireEvent.press(await findByText('Not now'));
      await waitFor(() =>
        expect(queryByText('Share your data with AI?')).toBeNull()
      );
      expect(getByText('Get feedback')).toBeTruthy();
      expect(generateInsightFromDay).not.toHaveBeenCalled();
    });

    it('saves the feedback with health_connect as its source', async () => {
      connect();
      const { findByText } = renderDailySummary();
      fireEvent.press(await findByText('Get feedback'));
      await findByText('Good sleep set up your run');
      expect(saveAIFeedback).toHaveBeenCalledWith('user-1', TODAY, INSIGHT, USAGE, {
        dataSource: 'health_connect',
        regenerate: false,
      });
    });

    it('shows the cached feedback without calling the service', async () => {
      feedbackCache[TODAY] = INSIGHT;
      connect();
      const { findByText } = renderDailySummary();
      expect(await findByText('Good sleep set up your run')).toBeTruthy();
      expect(generateInsightFromDay).not.toHaveBeenCalled();
    });

    it('regenerates the feedback on request', async () => {
      feedbackCache[TODAY] = { headline: 'Old feedback', keySignals: [], focus: [] };
      connect();
      const { findByText } = renderDailySummary();
      fireEvent.press(await findByText('Regenerate'));
      expect(await findByText('Good sleep set up your run')).toBeTruthy();
      expect(generateInsightFromDay).toHaveBeenCalledTimes(1);
      expect(saveAIFeedback).toHaveBeenCalledWith('user-1', TODAY, INSIGHT, USAGE, {
        dataSource: 'health_connect',
        regenerate: true,
      });
    });

    it('explains a day with no sleep or workouts without calling the service', async () => {
      connect({ empty: true });
      const { findByText } = renderDailySummary();
      fireEvent.press(await findByText('Get feedback'));
      expect(await findByText(/no sleep or workout recorded/)).toBeTruthy();
      expect(generateInsightFromDay).not.toHaveBeenCalled();
    });

    it('shows an error and lets the user try again', async () => {
      generateInsightFromDay.mockRejectedValueOnce({
        response: { data: { error: 'COACH_API_ERROR' } },
      });
      connect();
      const { findByText } = renderDailySummary();
      fireEvent.press(await findByText('Get feedback'));
      expect(
        await findByText("The AI coach didn't respond. Try again in a moment.")
      ).toBeTruthy();

      fireEvent.press(await findByText('Try again'));
      expect(await findByText('Good sleep set up your run')).toBeTruthy();
    });

    it('says so when the insights service cannot be reached', async () => {
      generateInsightFromDay.mockRejectedValue(new Error('Network Error'));
      connect();
      const { findByText, getByText, queryByTestId } = renderDailySummary();
      fireEvent.press(await findByText('Get feedback'));
      expect(
        await findByText("Can't reach the insights service. Is it running?")
      ).toBeTruthy();
      expect(getByText('Try again')).toBeTruthy();
      expect(queryByTestId('fitbit-connect-prompt')).toBeNull();
    });
  });

  it('opens a workout from its row, with the heart rate chart and no map', async () => {
    connect({ day: TODAY });
    const { findByTestId, getByTestId, queryByTestId } = renderStack(
      'DailySummary',
      [
        <Stack.Screen key="ds" name="DailySummary" component={DailySummary} />,
        <Stack.Screen key="wd" name="WorkoutDetail" component={WorkoutDetail} />,
      ]
    );
    fireEvent.press(await findByTestId(`workout-row-${RUN_ID}`));

    const stats = within(await findByTestId('workout-stats'));
    expect(stats.getByText('30m')).toBeTruthy();
    expect(stats.getByText('152 bpm')).toBeTruthy();
    expect(getByTestId('workout-title').props.children).toContain('Run');
    expect(getByTestId('heart-rate-timeline')).toBeTruthy();
    expect(queryByTestId('route-map')).toBeNull();
  });

  it("marks the month's workout days on the workout calendar", async () => {
    connect({ day: TODAY });
    const { findByTestId, UNSAFE_getByType } = renderWorkout(RUN_ID);
    await findByTestId('workout-calendar');
    await waitFor(() =>
      expect(UNSAFE_getByType(Calendar).props.markedDates[TODAY]).toMatchObject(
        { marked: true, selected: true }
      )
    );
  });

  it('shows an empty calendar for a month with no workouts', async () => {
    connect({ day: TODAY });
    const { findByTestId, UNSAFE_getByType } = renderWorkout(RUN_ID);
    await findByTestId('workout-stats');
    healthConnect.readRecords.mockResolvedValue({ records: [] });
    UNSAFE_getByType(Calendar).props.onMonthChange({ dateString: '2026-01-01' });
    await waitFor(() =>
      expect(healthConnect.readRecords).toHaveBeenCalledWith(
        'ExerciseSession',
        expect.objectContaining({
          timeRangeFilter: expect.objectContaining({
            startTime: new Date(2026, 0, 1).toISOString(),
            endTime: new Date(2026, 1, 1).toISOString(),
          }),
        })
      )
    );
    expect(await findByTestId('workout-calendar')).toBeTruthy();
  });

  it('shows an error card when the workout is no longer in Health Connect', async () => {
    connect({ day: TODAY });
    const { findByText, getByTestId } = renderWorkout('gone');
    expect(await findByText('This workout is no longer available.')).toBeTruthy();
    expect(getByTestId('workout-calendar')).toBeTruthy();
  });

  it('asks to connect on the workout page when nothing is granted', async () => {
    const { findByTestId } = renderWorkout(RUN_ID);
    expect(await findByTestId('fitbit-connect-prompt')).toBeTruthy();
    expect(healthConnect.readRecords).not.toHaveBeenCalled();
  });

  it('fills the rings on Home from Health Connect', async () => {
    connect();
    const { findByLabelText, getByTestId } = renderHome();
    expect(
      await findByLabelText(`${TODAY}: 8,432 steps, 6h 30m sleep`)
    ).toBeTruthy();
    expect(ringProgress(getByTestId, TODAY)).toEqual([8432 / 10000, 390 / 360]);
    expect(ringProgress(getByTestId, YESTERDAY)).toEqual([8432 / 10000, 0]);
    expect(healthConnect.aggregateRecord).toHaveBeenCalledTimes(8);
    expect(healthConnect.readRecords).not.toHaveBeenCalledWith(
      'HeartRate',
      expect.objectContaining({
        timeRangeFilter: expect.objectContaining({
          endTime: new Date(midnight(TODAY)).toISOString(),
        }),
      })
    );
  });

  it('opens DailySummary for the tapped ring', async () => {
    connect();
    const { findByLabelText, findByText } = renderHome();
    fireEvent.press(
      await findByLabelText(`${YESTERDAY}: 8,432 steps, -- sleep`)
    );
    expect(await findByText('Daily Summary')).toBeTruthy();
    await waitFor(() =>
      expect(healthConnect.readRecords).toHaveBeenCalledWith(
        ...heartRateReadEnding(TODAY)
      )
    );
  });

  it('shows empty rings and reads nothing when nothing is granted', async () => {
    const { findByText, getByTestId } = renderHome();
    expect(
      await findByText('Connect your watch to fill your rings.')
    ).toBeTruthy();
    for (const date of lastSevenDates(TODAY)) {
      expect(ringProgress(getByTestId, date)).toEqual([0, 0]);
    }
    expect(healthConnect.aggregateRecord).not.toHaveBeenCalled();
  });

  it('says so when the week fails to load', async () => {
    connect();
    healthConnect.getGrantedPermissions
      .mockResolvedValueOnce(GRANTED)
      .mockRejectedValue(new Error('failed'));
    const { findByText, getByTestId } = renderHome();
    expect(await findByText("Couldn't load this week.")).toBeTruthy();
    expect(ringProgress(getByTestId, TODAY)).toEqual([0, 0]);
  });

  it('leaves the rings empty for days with no watch data', async () => {
    connect({ empty: true });
    const { findByLabelText, getByTestId } = renderHome();
    expect(await findByLabelText(`${TODAY}: -- steps, -- sleep`)).toBeTruthy();
    for (const date of lastSevenDates(TODAY)) {
      expect(ringProgress(getByTestId, date)).toEqual([0, 0]);
    }
  });

  it("shows the day's steps and sleep against the goals on Insights", async () => {
    connect();
    const utils = renderHome();
    await utils.findByLabelText(`${TODAY}: 8,432 steps, 6h 30m sleep`);
    fireEvent.press(utils.getByText('View'));
    const steps = within(await utils.findByTestId('goal-steps'));
    expect(steps.getByText('8,432 / 10,000')).toBeTruthy();
    const sleep = within(utils.getByTestId('goal-sleep'));
    expect(sleep.getByText('6h 30m / 6h 00m')).toBeTruthy();
  });

  it('switches the big ring and values on Insights to the tapped day', async () => {
    connect();
    const utils = renderHome();
    await utils.findByLabelText(`${TODAY}: 8,432 steps, 6h 30m sleep`);
    fireEvent.press(utils.getByText('View'));
    await utils.findByTestId('goal-steps');

    // The Insights screen has its own row; take the last match
    const rings = await utils.findAllByLabelText(
      `${YESTERDAY}: 8,432 steps, -- sleep`
    );
    fireEvent.press(rings[rings.length - 1]);

    expect(utils.getByTestId('selected-date').props.children).not.toBe('Today');
    expect(
      within(utils.getByTestId('goal-sleep')).getByText('-- / 6h 00m')
    ).toBeTruthy();
  });

  it('asks to connect on Insights when nothing is granted', async () => {
    const utils = renderHome();
    await utils.findByText('Connect your watch to fill your rings.');
    fireEvent.press(utils.getByText('View'));
    await utils.findByTestId('selected-date');
    expect(
      await utils.findByText(
        'Connect your watch to fill your steps and sleep rings.'
      )
    ).toBeTruthy();
    expect(utils.queryByTestId('goal-steps')).toBeNull();
  });

  it('asks to connect Health Connect when nothing is granted', async () => {
    const { findByTestId, getByText } = renderDailySummary();
    expect(await findByTestId('fitbit-connect-prompt')).toBeTruthy();
    expect(getByText('Connect your watch')).toBeTruthy();
    expect(healthConnect.readRecords).not.toHaveBeenCalled();
  });

  it('shows empty cards for a day with no records', async () => {
    connect({ empty: true });
    const { findByTestId, getByTestId, getByText } = renderDailySummary();
    expect(await findByTestId('sleep-card')).toBeTruthy();
    expect(getByTestId('steps-card')).toBeTruthy();
    expect(getByTestId('heart-card')).toBeTruthy();
    expect(getByText('No workouts recorded on the watch.')).toBeTruthy();
  });

  it('shows an error card when Health Connect cannot be read', async () => {
    connect();
    healthConnect.getGrantedPermissions
      .mockResolvedValueOnce(GRANTED)
      .mockRejectedValueOnce(new Error('failed'));
    const { findByText } = renderDailySummary();
    expect(
      await findByText("Couldn't read Health Connect. Pull down to try again.")
    ).toBeTruthy();
  });

  it("shows today's sleep and heart cards on Home", async () => {
    connect();
    const { findByTestId, getByTestId } = renderStack('Home', [
      <Stack.Screen key="home" name="Home" component={HomeScreen} />,
      <Stack.Screen key="ds" name="DailySummary" component={DailySummary} />,
    ]);
    expect(await findByTestId('heart-card')).toBeTruthy();
    expect(getByTestId('sleep-card')).toBeTruthy();
  });

  it('opens DailySummary from a card on Home', async () => {
    connect();
    const { findByTestId, findByText } = renderHome();
    fireEvent.press(await findByTestId('heart-card'));
    expect(await findByText('Daily Summary')).toBeTruthy();
  });

  it('replaces the demo charts on Home with a connect prompt when nothing is granted', async () => {
    const { findByTestId, queryByText } = renderHome();
    expect(await findByTestId('fitbit-connect-prompt')).toBeTruthy();
    expect(queryByText('Breath Rate')).toBeNull();
    expect(queryByText('Ventilation Rate')).toBeNull();
    expect(queryByText('Heartbeat Rate')).toBeNull();
  });
});

describe('MyDevices', () => {
  const renderDevices = () =>
    renderStack('Devices', [
      <Stack.Screen key="dev" name="Devices" component={MyDevices} />,
      <Stack.Screen key="ds" name="DailySummary" component={DailySummary} />,
    ]);

  it('lists Health Connect after the demo devices', async () => {
    const { findByText, getByText, queryByText } = renderDevices();
    expect(await findByText('Health Connect')).toBeTruthy();
    expect(getByText('Smart Sock')).toBeTruthy();
    expect(getByText('Smart Shirt')).toBeTruthy();
    expect(queryByText('Pixel Watch')).toBeNull();
  });

  it('shows Health Connect as unavailable off Android', async () => {
    const { findByText } = renderDevices();
    expect(await findByText('Unavailable')).toBeTruthy();
  });

  describe('on Android', () => {
    const { Platform } = require('react-native');
    const originalOS = Platform.OS;
    beforeEach(() => {
      Platform.OS = 'android';
    });
    afterEach(() => {
      Platform.OS = originalOS;
    });

    it('connects Health Connect from its card', async () => {
      const healthConnect = require('react-native-health-connect');
      healthConnect.requestPermission.mockResolvedValueOnce([
        { accessType: 'read', recordType: 'Steps' },
      ]);
      const { findByText, getByTestId, queryByText } = renderDevices();
      expect(await findByText('Health Connect')).toBeTruthy();
      expect(queryByText('Disconnect')).toBeNull();

      await waitFor(() =>
        expect(
          getByTestId('connect-4').props.accessibilityState.disabled
        ).toBe(false)
      );
      fireEvent.press(getByTestId('connect-4'));
      expect(await findByText('Disconnect')).toBeTruthy();
      expect(healthConnect.requestPermission).toHaveBeenCalledTimes(1);
    });

    it('offers Health Connect settings when no data type was allowed', async () => {
      const healthConnect = require('react-native-health-connect');
      const { findByTestId, getByTestId } = renderDevices();
      await waitFor(() =>
        expect(
          getByTestId('connect-4').props.accessibilityState.disabled
        ).toBe(false)
      );
      fireEvent.press(getByTestId('connect-4'));
      expect(await findByTestId('health-connect-message')).toBeTruthy();
      fireEvent.press(getByTestId('health-connect-open-settings'));
      expect(healthConnect.openHealthConnectSettings).toHaveBeenCalledTimes(1);
    });
  });
});
