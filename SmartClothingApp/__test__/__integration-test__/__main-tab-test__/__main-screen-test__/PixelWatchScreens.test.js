/**
 * Integration tests for the Pixel Watch screens : DailySummary, WorkoutDetail,
 * the Home cards and the Pixel Watch card on MyDevices, plus the steps and
 * sleep activity rings on Home and Insights, rendered with the
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
import { getFitbitTokens } from '../../../../src/utils/fitbitTokens';
import {
  getFitbitDay,
  getFitbitWeek,
  getFitbitWorkout,
  getFitbitMonthWorkouts,
  generateInsight,
} from '../../../../src/services/insightsApi';
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
  getFitbitWeek: jest.fn(),
  getFitbitWorkout: jest.fn(),
  getFitbitMonthWorkouts: jest.fn(),
  generateInsight: jest.fn(),
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
const TOKENS = { accessToken: 'a', refreshToken: 'r' };

const dayFor = (date) => ({
  date,
  steps: 8432,
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
      logId: 745,
      type: 'Run',
      startTime: '2026-10-10T07:00:00.000-07:00',
      durationMin: 30,
      avgHeartRate: 152,
    },
  ],
});

// Today: 8,432 steps and 412 min of sleep. Yesterday: 5,000 steps and no
// sleep log. The oldest day: 0 steps.
const weekFor = (endDate) =>
  lastSevenDates(endDate).map((date, i) => ({
    date,
    steps: i === 6 ? 8432 : i * 1000,
    sleepMinutes: i === 6 ? 412 : i === 5 ? null : 420,
  }));

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
  getFitbitDay.mockImplementation((date) => Promise.resolve(dayFor(date)));
  getFitbitWeek.mockImplementation((date) => Promise.resolve(weekFor(date)));
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
    expect(within(getByTestId('steps-card')).getByText('8,432')).toBeTruthy();
    expect(getByText('Run')).toBeTruthy();
    expect(getByText('Today')).toBeTruthy();
    expect(getByTestId('ai-feedback-section')).toBeTruthy();
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

describe('DailySummary AI feedback', () => {
  const INSIGHT = {
    headline: 'Good sleep set up your run',
    keySignals: ['6h 52m of sleep'],
    focus: ['Easy day tomorrow'],
  };

  const renderDailySummary = () =>
    renderStack('DailySummary', [
      <Stack.Screen key="ds" name="DailySummary" component={DailySummary} />,
    ]);

  beforeEach(() => {
    getFitbitTokens.mockResolvedValue(TOKENS);
    generateInsight.mockResolvedValue({ insight: INSIGHT, usage: {} });
  });

  it('asks for consent first, then shows the feedback', async () => {
    const { findByText, getByText, queryByTestId } = renderDailySummary();
    fireEvent.press(await findByText('Get feedback'));

    expect(await findByText('Share your data with AI?')).toBeTruthy();
    expect(generateInsight).not.toHaveBeenCalled();

    fireEvent.press(getByText('I agree'));
    expect(await findByText('Good sleep set up your run')).toBeTruthy();
    expect(getByText('Easy day tomorrow')).toBeTruthy();
    expect(setAIConsent).toHaveBeenCalledWith(true);
    expect(generateInsight).toHaveBeenCalledWith(TODAY, expect.any(Object));
    expect(setCachedFeedback).toHaveBeenCalledWith(TODAY, INSIGHT);
    expect(queryByTestId('consent-modal')).toBeNull();
  });

  it('does not call the service when consent is declined', async () => {
    const { findByText, getByText, queryByText } = renderDailySummary();
    fireEvent.press(await findByText('Get feedback'));
    fireEvent.press(await findByText('Not now'));
    await waitFor(() => expect(queryByText('Share your data with AI?')).toBeNull());
    expect(getByText('Get feedback')).toBeTruthy();
    expect(generateInsight).not.toHaveBeenCalled();
  });

  it('shows the cached feedback for a day without calling Claude', async () => {
    aiConsent = true;
    feedbackCache[TODAY] = INSIGHT;
    const { findByText, getByTestId } = renderDailySummary();
    expect(await findByText('Good sleep set up your run')).toBeTruthy();

    // Another day has nothing cached, and coming back shows the cache again
    fireEvent.press(getByTestId('prev-day'));
    expect(await findByText('Get feedback')).toBeTruthy();
    fireEvent.press(getByTestId('next-day'));
    expect(await findByText('Good sleep set up your run')).toBeTruthy();
    expect(generateInsight).not.toHaveBeenCalled();
  });

  it('regenerates the feedback on request', async () => {
    aiConsent = true;
    feedbackCache[TODAY] = { headline: 'Old feedback', keySignals: [], focus: [] };
    const { findByText } = renderDailySummary();
    fireEvent.press(await findByText('Regenerate'));
    expect(await findByText('Good sleep set up your run')).toBeTruthy();
    expect(generateInsight).toHaveBeenCalledTimes(1);
  });

  it('explains when the day has no sleep or workouts', async () => {
    aiConsent = true;
    generateInsight.mockResolvedValue({ insight: null, reason: 'NO_DATA' });
    const { findByText } = renderDailySummary();
    fireEvent.press(await findByText('Get feedback'));
    expect(await findByText(/no sleep or workout recorded/)).toBeTruthy();
    expect(setCachedFeedback).not.toHaveBeenCalled();
  });

  it('shows an error and lets the user try again', async () => {
    aiConsent = true;
    generateInsight.mockRejectedValueOnce({
      response: { data: { error: 'COACH_API_ERROR' } },
    });
    const { findByText } = renderDailySummary();
    fireEvent.press(await findByText('Get feedback'));
    expect(
      await findByText("The AI coach didn't respond. Try again in a moment.")
    ).toBeTruthy();

    fireEvent.press(await findByText('Try again'));
    expect(await findByText('Good sleep set up your run')).toBeTruthy();
  });

  it('asks to reconnect the watch when Fitbit needs a new login', async () => {
    aiConsent = true;
    generateInsight.mockRejectedValue({
      response: { data: { error: 'FITBIT_REAUTH_REQUIRED' } },
    });
    const { findByText, findByTestId } = renderDailySummary();
    fireEvent.press(await findByText('Get feedback'));
    expect(await findByTestId('fitbit-connect-prompt')).toBeTruthy();
  });
});

const RUN_DETAIL = {
  logId: 745,
  type: 'Run',
  date: TODAY,
  startTime: '2026-10-10T07:00:00.000-07:00',
  durationMin: 12,
  avgHeartRate: 160,
  calories: 164,
  steps: 1932,
  distanceKm: 1.6,
  paceMinPerKm: 7.5,
  hasGps: true,
  hasRoute: true,
  zones: { fatBurn: 3, cardio: 6, peak: 2 },
  points: [
    { t: 0, lat: 34.24, lon: -118.53, bpm: 110, zone: 'outOfRange' },
    { t: 60, lat: 34.245, lon: -118.53, bpm: 150, zone: 'cardio' },
    { t: 120, lat: 34.25, lon: -118.53, bpm: 180, zone: 'peak' },
  ],
};

const WEIGHTS_DETAIL = {
  ...RUN_DETAIL,
  logId: 746,
  type: 'Weights',
  distanceKm: undefined,
  paceMinPerKm: undefined,
  hasGps: false,
  hasRoute: false,
  points: RUN_DETAIL.points.map((p) => ({ ...p, lat: null, lon: null })),
};

describe('WorkoutDetail', () => {
  const MONTH = TODAY.slice(0, 7);

  beforeEach(() => {
    getFitbitTokens.mockResolvedValue(TOKENS);
    getFitbitWorkout.mockResolvedValue(RUN_DETAIL);
    getFitbitMonthWorkouts.mockResolvedValue([
      { date: TODAY, logId: 745, type: 'Run' },
    ]);
  });

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

  it('opens from a workout row on DailySummary and shows the route map', async () => {
    const { findByTestId, getByTestId } = renderStack(
      'DailySummary',
      [
        <Stack.Screen key="ds" name="DailySummary" component={DailySummary} />,
        <Stack.Screen key="wd" name="WorkoutDetail" component={WorkoutDetail} />,
      ]
    );
    fireEvent.press(await findByTestId('workout-row-745'));

    expect(await findByTestId('route-map')).toBeTruthy();
    expect(getByTestId('route-webview').props.source.html).toContain('34.245');
    expect(within(getByTestId('workout-stats')).getByText('164 cal')).toBeTruthy();
    expect(getByTestId('heart-rate-timeline')).toBeTruthy();
    expect(getByTestId('workout-calendar')).toBeTruthy();
    expect(getFitbitWorkout).toHaveBeenCalledWith(TODAY, 745);
    expect(getFitbitMonthWorkouts).toHaveBeenCalledWith(MONTH);
  });

  it('shows the heart rate chart and no map for a workout without GPS', async () => {
    getFitbitWorkout.mockResolvedValue(WEIGHTS_DETAIL);
    const { findByTestId, queryByTestId, getByTestId } = renderWorkout(746);
    expect(await findByTestId('workout-stats')).toBeTruthy();
    expect(getByTestId('heart-rate-timeline')).toBeTruthy();
    expect(queryByTestId('route-map')).toBeNull();
    expect(queryByTestId('route-reconnect-hint')).toBeNull();
    expect(getByTestId('workout-title').props.children).toContain('Weights');
  });

  it('asks to reconnect when a GPS run comes back without a route', async () => {
    getFitbitWorkout.mockResolvedValue({ ...RUN_DETAIL, hasRoute: false });
    const { findByTestId, queryByTestId } = renderWorkout(745);
    expect(await findByTestId('route-reconnect-hint')).toBeTruthy();
    expect(queryByTestId('route-map')).toBeNull();
  });

  it('asks to reconnect for the route but keeps the stats and heart rate when Fitbit refused the route file', async () => {
    getFitbitWorkout.mockResolvedValue({
      ...RUN_DETAIL,
      points: RUN_DETAIL.points.map((p) => ({ ...p, lat: null, lon: null })),
      hasRoute: false,
      needsReconnect: true,
    });
    const { findByTestId, queryByTestId } = renderWorkout(745);
    expect(await findByTestId('route-reconnect-hint')).toBeTruthy();
    expect(queryByTestId('workout-stats')).toBeTruthy();
    expect(queryByTestId('heart-rate-timeline')).toBeTruthy();
    expect(queryByTestId('route-map')).toBeNull();
  });

  it('loads another month when the calendar changes month', async () => {
    const { findByTestId, UNSAFE_getByType } = renderWorkout(745);
    await findByTestId('workout-calendar');
    await waitFor(() =>
      expect(getFitbitMonthWorkouts).toHaveBeenCalledWith(MONTH)
    );
    UNSAFE_getByType(Calendar).props.onMonthChange({ dateString: '2026-01-01' });
    await waitFor(() =>
      expect(getFitbitMonthWorkouts).toHaveBeenCalledWith('2026-01')
    );
  });

  it('shows an error card when the workout is gone', async () => {
    getFitbitWorkout.mockRejectedValue({
      response: { data: { error: 'WORKOUT_NOT_FOUND' } },
    });
    const { findByText } = renderWorkout(745);
    expect(await findByText('This workout is no longer on Fitbit.')).toBeTruthy();
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

describe('Activity rings on Home', () => {
  const renderHome = () =>
    renderStack('Home', [
      <Stack.Screen key="home" name="Home" component={HomeScreen} />,
      <Stack.Screen key="ds" name="DailySummary" component={DailySummary} />,
      <Stack.Screen key="ins" name="Insights" component={Placeholder} />,
    ]);

  it('draws steps and sleep against their goals for the last 7 days', async () => {
    getFitbitTokens.mockResolvedValue(TOKENS);
    const { findByLabelText, getByTestId } = renderHome();
    expect(
      await findByLabelText(`${TODAY}: 8,432 steps, 6h 52m sleep`)
    ).toBeTruthy();

    for (const date of lastSevenDates(TODAY)) {
      expect(getByTestId(`ring-${date}`)).toBeTruthy();
    }
    const [steps, sleep] = ringProgress(getByTestId, TODAY);
    expect(steps).toBeCloseTo(0.8432);
    expect(sleep).toBeCloseTo(412 / 360);
    expect(ringProgress(getByTestId, YESTERDAY)).toEqual([0.5, 0]);
    expect(ringProgress(getByTestId, lastSevenDates(TODAY)[0])).toEqual([
      0,
      420 / 360,
    ]);
    // One week call, never a /day call per ring
    expect(getFitbitWeek).toHaveBeenCalledTimes(1);
    expect(getFitbitWeek).toHaveBeenCalledWith(TODAY);
  });

  it("opens DailySummary for the tapped day", async () => {
    getFitbitTokens.mockResolvedValue(TOKENS);
    const { findByLabelText, findByText } = renderHome();
    fireEvent.press(await findByLabelText(`${YESTERDAY}: 5,000 steps, -- sleep`));
    expect(await findByText('Daily Summary')).toBeTruthy();
    await waitFor(() => expect(getFitbitDay).toHaveBeenCalledWith(YESTERDAY));
  });

  it('shows empty rings and no values when not connected', async () => {
    getFitbitTokens.mockResolvedValue(null);
    const { findByText, getByTestId } = renderHome();
    expect(
      await findByText('Connect your Pixel Watch to fill your rings.')
    ).toBeTruthy();
    for (const date of lastSevenDates(TODAY)) {
      expect(ringProgress(getByTestId, date)).toEqual([0, 0]);
    }
    expect(getFitbitWeek).not.toHaveBeenCalled();
  });

  it('says so when the week fails to load', async () => {
    getFitbitTokens.mockResolvedValue(TOKENS);
    getFitbitWeek.mockRejectedValue({
      response: { data: { error: 'FITBIT_API_ERROR' } },
    });
    const { findByText, getByTestId } = renderHome();
    expect(await findByText("Couldn't load this week.")).toBeTruthy();
    expect(ringProgress(getByTestId, TODAY)).toEqual([0, 0]);
  });
});

describe('Insights screen', () => {
  const renderInsights = () =>
    renderStack('Home', [
      <Stack.Screen key="home" name="Home" component={HomeScreen} />,
      <Stack.Screen key="ins" name="Insights" component={ViewInsights} />,
      <Stack.Screen key="ds" name="DailySummary" component={DailySummary} />,
    ]);

  const openInsights = async (utils) => {
    fireEvent.press(await utils.findByText('View'));
    return utils.findByTestId('selected-date');
  };

  it("shows today's steps and sleep against the goals", async () => {
    getFitbitTokens.mockResolvedValue(TOKENS);
    const utils = renderInsights();
    await utils.findByLabelText(`${TODAY}: 8,432 steps, 6h 52m sleep`);
    await openInsights(utils);

    const steps = within(await utils.findByTestId('goal-steps'));
    expect(steps.getByText('8,432 / 10,000')).toBeTruthy();
    const sleep = within(utils.getByTestId('goal-sleep'));
    expect(sleep.getByText('6h 52m / 6h 00m')).toBeTruthy();
    expect(utils.queryByText('Update Activity Rings Data')).toBeNull();
    expect(getFitbitWeek).toHaveBeenCalledTimes(1);
  });

  it('switches the big ring and values to the tapped day', async () => {
    getFitbitTokens.mockResolvedValue(TOKENS);
    const utils = renderInsights();
    await utils.findByLabelText(`${TODAY}: 8,432 steps, 6h 52m sleep`);
    await openInsights(utils);

    // The Insights screen has its own row; take the last match
    const rings = await utils.findAllByLabelText(
      `${YESTERDAY}: 5,000 steps, -- sleep`
    );
    fireEvent.press(rings[rings.length - 1]);

    expect(utils.getByTestId('selected-date').props.children).not.toBe('Today');
    expect(
      within(utils.getByTestId('goal-steps')).getByText('5,000 / 10,000')
    ).toBeTruthy();
    expect(
      within(utils.getByTestId('goal-sleep')).getByText('-- / 6h 00m')
    ).toBeTruthy();
  });

  it('asks to connect the watch when it is not connected', async () => {
    getFitbitTokens.mockResolvedValue(null);
    const utils = renderInsights();
    await utils.findByText('Connect your Pixel Watch to fill your rings.');
    await openInsights(utils);
    const prompts = await utils.findAllByTestId('fitbit-connect-prompt');
    expect(prompts.length).toBeGreaterThan(0);
    expect(utils.queryByTestId('goal-steps')).toBeNull();
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
