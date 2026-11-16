/**
 * @file deviceActions.unit.test.js
 * The Health Connect and watch data thunks in deviceActions.js : check,
 * connect, disconnect, loading a day, week, month and workout, and the
 * auto-save.
 */
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import {
  startAutoSaveDays,
  startCheckHealthConnect,
  startConnectHealthConnect,
  startDisconnectHealthConnect,
  startCheckWatch,
  startLoadDay,
  startLoadWeek,
  startLoadMonth,
  startLoadWorkout,
  selectWatchStatus,
} from '../../../src/actions/deviceActions';
import {
  WATCH_DAY_LOADING,
  WATCH_DAY_LOADED,
  WATCH_DAY_ERROR,
  WATCH_CLEAR_DAYS,
  WATCH_WEEK_LOADING,
  WATCH_WEEK_LOADED,
  WATCH_WEEK_ERROR,
  WATCH_WORKOUT_LOADING,
  WATCH_WORKOUT_LOADED,
  WATCH_WORKOUT_ERROR,
  WATCH_MONTH_LOADING,
  WATCH_MONTH_LOADED,
  WATCH_MONTH_ERROR,
  HEALTH_CONNECT_SET_STATUS,
} from '../../../src/actions/types';
import { saveDailyStats } from '../../../src/services/healthStore';
import {
  getLastSavedDate,
  setLastSavedDate,
  getHealthConnectDisconnected,
  setHealthConnectDisconnected,
} from '../../../src/utils/localStorage';
import * as healthConnect from '../../../src/services/healthConnect';
import {
  buildDay,
  buildWeek,
  buildMonthWorkouts,
  buildWorkoutDetail,
  isEmptyDay,
  watchDevice,
} from '../../../src/utils/healthConnectDay';
import { auth } from '../../../firebaseConfig.js';

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

jest.mock('../../../firebaseConfig.js', () => ({
  auth: { currentUser: { uid: 'user-1' } },
  database: {},
}));

jest.mock('../../../src/services/healthStore', () => ({
  saveDailyStats: jest.fn(),
}));

jest.mock('../../../src/utils/localStorage', () => ({
  getLastSavedDate: jest.fn(),
  setLastSavedDate: jest.fn(),
  getHealthConnectDisconnected: jest.fn(),
  setHealthConnectDisconnected: jest.fn(),
}));

jest.mock('../../../src/services/healthConnect', () => ({
  getStatus: jest.fn(),
  requestPermissions: jest.fn(),
  getGranted: jest.fn(),
  revoke: jest.fn(),
  isRevokePending: jest.fn(),
  readDayRecords: jest.fn(),
  readWeekRecords: jest.fn(),
  readMonthSessions: jest.fn(),
  readWorkoutRecords: jest.fn(),
}));

jest.mock('../../../src/utils/healthConnectDay', () => ({
  buildDay: jest.fn(),
  buildWeek: jest.fn(),
  buildMonthWorkouts: jest.fn(),
  buildWorkoutDetail: jest.fn(),
  isEmptyDay: jest.fn(),
  watchDevice: jest.fn(),
}));

const mockStore = configureMockStore([thunk]);
beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

describe('Health Connect', () => {
  const STEPS = { accessType: 'read', recordType: 'Steps' };
  const SLEEP = { accessType: 'read', recordType: 'SleepSession' };

  const status = (value, permissions = [], error = null) => ({
    type: HEALTH_CONNECT_SET_STATUS,
    status: value,
    permissions,
    error,
  });

  beforeEach(() => {
    healthConnect.getStatus.mockResolvedValue('available');
    healthConnect.isRevokePending.mockReturnValue(false);
    healthConnect.getGranted.mockResolvedValue([]);
    healthConnect.requestPermissions.mockResolvedValue([]);
    healthConnect.revoke.mockResolvedValue();
    getHealthConnectDisconnected.mockResolvedValue(false);
    setHealthConnectDisconnected.mockResolvedValue();
  });

  describe('startCheckHealthConnect', () => {
    it('is connected when a read permission is granted', async () => {
      healthConnect.getGranted.mockResolvedValue([STEPS, SLEEP]);
      const store = mockStore({});
      expect(await store.dispatch(startCheckHealthConnect())).toBe(true);
      expect(store.getActions()).toEqual([status('connected', [STEPS, SLEEP])]);
      expect(getHealthConnectDisconnected).toHaveBeenCalledWith('user-1');
    });

    it('is not connected when nothing is granted', async () => {
      const store = mockStore({});
      expect(await store.dispatch(startCheckHealthConnect())).toBe(false);
      expect(store.getActions()).toEqual([status('not_connected')]);
    });

    it('is not connected after Disconnect, whatever Health Connect reports', async () => {
      getHealthConnectDisconnected.mockResolvedValue(true);
      healthConnect.getGranted.mockResolvedValue([STEPS]);
      const store = mockStore({});
      expect(await store.dispatch(startCheckHealthConnect())).toBe(false);
      expect(store.getActions()).toEqual([status('not_connected')]);
      expect(healthConnect.getGranted).not.toHaveBeenCalled();
    });

    it.each(['unavailable', 'update_needed'])(
      'passes on %s without reading permissions',
      async (value) => {
        healthConnect.getStatus.mockResolvedValue(value);
        const store = mockStore({});
        expect(await store.dispatch(startCheckHealthConnect())).toBe(false);
        expect(store.getActions()).toEqual([status(value)]);
        expect(healthConnect.getGranted).not.toHaveBeenCalled();
      }
    );

    it('is an error when the granted list cannot be read', async () => {
      healthConnect.getGranted.mockRejectedValue(new Error('failed'));
      const store = mockStore({});
      expect(await store.dispatch(startCheckHealthConnect())).toBe(false);
      expect(store.getActions()).toEqual([status('error', [], 'check_failed')]);
    });
  });

  describe('startConnectHealthConnect', () => {
    it('connects and clears the disconnected flag when types are allowed', async () => {
      healthConnect.requestPermissions.mockResolvedValue([STEPS]);
      const store = mockStore({});
      expect(await store.dispatch(startConnectHealthConnect())).toBe(true);
      expect(store.getActions()).toEqual([
        status('connecting'),
        { type: WATCH_CLEAR_DAYS },
        status('connected', [STEPS]),
      ]);
      expect(setHealthConnectDisconnected).toHaveBeenCalledWith('user-1', false);
    });

    it('is not connected when nothing is allowed, and keeps the flag', async () => {
      const store = mockStore({});
      expect(await store.dispatch(startConnectHealthConnect())).toBe(false);
      expect(store.getActions()).toEqual([
        status('connecting'),
        status('not_connected', [], 'no_permissions'),
      ]);
      expect(setHealthConnectDisconnected).not.toHaveBeenCalled();
    });

    it('asks for a restart while a revoke is pending', async () => {
      healthConnect.isRevokePending.mockReturnValue(true);
      const store = mockStore({});
      expect(await store.dispatch(startConnectHealthConnect())).toBe(false);
      expect(store.getActions()).toEqual([
        status('not_connected', [], 'restart_needed'),
      ]);
      expect(healthConnect.requestPermissions).not.toHaveBeenCalled();
    });

    it('does not open the sheet when Health Connect is unavailable', async () => {
      healthConnect.getStatus.mockResolvedValue('unavailable');
      const store = mockStore({});
      expect(await store.dispatch(startConnectHealthConnect())).toBe(false);
      expect(store.getActions()).toEqual([status('unavailable')]);
      expect(healthConnect.requestPermissions).not.toHaveBeenCalled();
    });

    it('is an error when the request fails', async () => {
      healthConnect.requestPermissions.mockRejectedValue(new Error('failed'));
      const store = mockStore({});
      expect(await store.dispatch(startConnectHealthConnect())).toBe(false);
      expect(store.getActions()).toEqual([
        status('connecting'),
        status('error', [], 'connect_failed'),
      ]);
    });
  });

  describe('startDisconnectHealthConnect', () => {
    it('sets the flag, revokes and is not connected', async () => {
      const store = mockStore({});
      await store.dispatch(startDisconnectHealthConnect());
      expect(setHealthConnectDisconnected).toHaveBeenCalledWith('user-1', true);
      expect(healthConnect.revoke).toHaveBeenCalledTimes(1);
      expect(store.getActions()).toEqual([
        { type: WATCH_CLEAR_DAYS },
        status('not_connected'),
      ]);
    });

    it('is still not connected when the revoke fails', async () => {
      healthConnect.revoke.mockRejectedValue(new Error('failed'));
      const store = mockStore({});
      await store.dispatch(startDisconnectHealthConnect());
      expect(setHealthConnectDisconnected).toHaveBeenCalledWith('user-1', true);
      expect(store.getActions()).toEqual([
        { type: WATCH_CLEAR_DAYS },
        status('not_connected'),
      ]);
    });
  });
});

describe('The watch', () => {
  const DATE = '2026-10-10';
  const DOB = '2000-01-01';
  const RAW = { date: DATE, steps: { total: 8432 }, errors: {} };
  const DAY = { date: DATE, steps: 8432, sleep: null, heart: {}, workouts: [] };

  const watchStore = ({
    status = 'connected',
    days = {},
    weeks = {},
    workouts = {},
    months = {},
  } = {}) =>
    mockStore({
      device: {
        watch: { days, weeks, workouts, months },
        healthConnect: { status, permissions: [], error: null },
      },
      user: { userMetricsData: { dob: DOB } },
    });

  beforeEach(() => {
    healthConnect.readDayRecords.mockResolvedValue(RAW);
    buildDay.mockReturnValue(DAY);
    isEmptyDay.mockReturnValue(false);
    watchDevice.mockReturnValue('Pixel Watch 3');
    saveDailyStats.mockResolvedValue('saved');
  });

  describe('startLoadDay', () => {
    it('reads the day from Health Connect and builds it with the date of birth', async () => {
      const store = watchStore();
      await store.dispatch(startLoadDay(DATE));
      expect(healthConnect.readDayRecords).toHaveBeenCalledWith(DATE);
      expect(buildDay).toHaveBeenCalledWith(DATE, RAW, { dob: DOB });
      expect(store.getActions()).toEqual([
        { type: WATCH_DAY_LOADING, date: DATE },
        { type: WATCH_DAY_LOADED, date: DATE, day: DAY },
      ]);
    });

    it('skips a day that is already loaded unless forced', async () => {
      const store = watchStore({
        days: { [DATE]: { loading: false, error: null, data: DAY } },
      });
      await store.dispatch(startLoadDay(DATE));
      expect(healthConnect.readDayRecords).not.toHaveBeenCalled();
      await store.dispatch(startLoadDay(DATE, { force: true }));
      expect(healthConnect.readDayRecords).toHaveBeenCalledTimes(1);
    });

    it('skips a day that is still loading', async () => {
      const store = watchStore({
        days: { [DATE]: { loading: true, error: null, data: null } },
      });
      await store.dispatch(startLoadDay(DATE));
      expect(healthConnect.readDayRecords).not.toHaveBeenCalled();
    });

    it('reads nothing when Health Connect is not connected', async () => {
      const store = watchStore({ status: 'not_connected' });
      await store.dispatch(startLoadDay(DATE));
      expect(healthConnect.readDayRecords).not.toHaveBeenCalled();
      expect(store.getActions()).toEqual([]);
    });

    it('records an error for the day when the read fails', async () => {
      healthConnect.readDayRecords.mockRejectedValue(new Error('failed'));
      const store = watchStore();
      await store.dispatch(startLoadDay(DATE));
      expect(store.getActions()).toEqual([
        { type: WATCH_DAY_LOADING, date: DATE },
        {
          type: WATCH_DAY_ERROR,
          date: DATE,
          error: 'HEALTH_CONNECT_READ_FAILED',
        },
      ]);
    });

    it('saves a finished day with the Health Connect source and the watch model', async () => {
      const store = watchStore();
      await store.dispatch(startLoadDay(DATE));
      expect(watchDevice).toHaveBeenCalledWith(RAW);
      expect(saveDailyStats).toHaveBeenCalledWith('user-1', DAY, {
        source: 'health_connect',
        device: 'Pixel Watch 3',
        timezone: expect.any(String),
      });
    });

    it('never saves today', async () => {
      jest.useFakeTimers({ now: new Date(2026, 9, 10, 9, 0) });
      const store = watchStore();
      await store.dispatch(startLoadDay(DATE));
      jest.useRealTimers();
      expect(store.getActions()).toHaveLength(2);
      expect(saveDailyStats).not.toHaveBeenCalled();
    });

    it('does not save a day with no data', async () => {
      isEmptyDay.mockReturnValue(true);
      const store = watchStore();
      await store.dispatch(startLoadDay(DATE));
      expect(saveDailyStats).not.toHaveBeenCalled();
    });

    it('does not save a day when a record type could not be read', async () => {
      healthConnect.readDayRecords.mockResolvedValue({
        ...RAW,
        errors: { HeartRate: 'read_failed' },
      });
      const store = watchStore();
      await store.dispatch(startLoadDay(DATE));
      expect(store.getActions()).toHaveLength(2);
      expect(saveDailyStats).not.toHaveBeenCalled();
    });

    it('still shows the day when the write fails', async () => {
      saveDailyStats.mockRejectedValue(new Error('offline'));
      const store = watchStore();
      await store.dispatch(startLoadDay(DATE));
      expect(store.getActions()).toEqual([
        { type: WATCH_DAY_LOADING, date: DATE },
        { type: WATCH_DAY_LOADED, date: DATE, day: DAY },
      ]);
    });
  });

  describe('startAutoSaveDays', () => {
    const readDates = () =>
      healthConnect.readDayRecords.mock.calls.map(([date]) => date);
    const writtenDates = () =>
      saveDailyStats.mock.calls.map(([, day]) => day.date);
    const markedDates = () =>
      setLastSavedDate.mock.calls.map(([, date]) => date);

    beforeEach(() => {
      // Today is 2026-11-15
      jest.useFakeTimers({ now: new Date(2026, 10, 15, 9, 0) });
      healthConnect.getStatus.mockResolvedValue('available');
      healthConnect.getGranted.mockResolvedValue([
        { accessType: 'read', recordType: 'Steps' },
      ]);
      getHealthConnectDisconnected.mockResolvedValue(false);
      healthConnect.readDayRecords.mockImplementation(async (date) => ({
        date,
        errors: {},
      }));
      buildDay.mockImplementation((date) => ({ ...DAY, date }));
      isEmptyDay.mockImplementation((day) => day.empty === true);
      getLastSavedDate.mockResolvedValue('2026-11-12');
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('saves each finished day since the last saved date, oldest first', async () => {
      const store = watchStore();
      await store.dispatch(startAutoSaveDays());
      expect(readDates()).toEqual(['2026-11-13', '2026-11-14']);
      expect(saveDailyStats).toHaveBeenCalledWith(
        'user-1',
        { ...DAY, date: '2026-11-13' },
        {
          source: 'health_connect',
          device: 'Pixel Watch 3',
          timezone: expect.any(String),
        }
      );
      expect(markedDates()).toEqual(['2026-11-13', '2026-11-14']);
    });

    it('does not put the saved days in the store', async () => {
      const store = watchStore();
      await store.dispatch(startAutoSaveDays());
      const types = store.getActions().map((action) => action.type);
      expect(types).not.toContain(WATCH_DAY_LOADED);
    });

    it('goes back 30 days when nothing was saved before', async () => {
      getLastSavedDate.mockResolvedValue(null);
      await watchStore().dispatch(startAutoSaveDays());
      expect(readDates()).toHaveLength(30);
      expect(readDates()[0]).toBe('2026-10-16');
      expect(readDates()[29]).toBe('2026-11-14');
    });

    it('goes back 30 days at most', async () => {
      getLastSavedDate.mockResolvedValue('2026-08-01');
      await watchStore().dispatch(startAutoSaveDays());
      expect(readDates()[0]).toBe('2026-10-16');
    });

    it('reads nothing when Health Connect is not connected', async () => {
      healthConnect.getGranted.mockResolvedValue([]);
      await watchStore().dispatch(startAutoSaveDays());
      expect(healthConnect.readDayRecords).not.toHaveBeenCalled();
      expect(saveDailyStats).not.toHaveBeenCalled();
    });

    it('reads nothing when nobody is signed in', async () => {
      auth.currentUser = null;
      await watchStore().dispatch(startAutoSaveDays());
      auth.currentUser = { uid: 'user-1' };
      expect(healthConnect.readDayRecords).not.toHaveBeenCalled();
    });

    it('moves past a day already saved from Fitbit', async () => {
      saveDailyStats
        .mockResolvedValueOnce('skipped')
        .mockResolvedValue('saved');
      await watchStore().dispatch(startAutoSaveDays());
      expect(markedDates()).toEqual(['2026-11-13', '2026-11-14']);
    });

    it('passes over an old day with no data without writing it', async () => {
      getLastSavedDate.mockResolvedValue('2026-11-09');
      buildDay.mockImplementation((date) => ({
        ...DAY,
        date,
        empty: date === '2026-11-10',
      }));
      await watchStore().dispatch(startAutoSaveDays());
      expect(writtenDates()).toEqual([
        '2026-11-11',
        '2026-11-12',
        '2026-11-13',
        '2026-11-14',
      ]);
      expect(markedDates()[0]).toBe('2026-11-10');
    });

    it('stops at a day with no data from the last 3 days', async () => {
      getLastSavedDate.mockResolvedValue('2026-11-10');
      buildDay.mockImplementation((date) => ({
        ...DAY,
        date,
        empty: date === '2026-11-12',
      }));
      await watchStore().dispatch(startAutoSaveDays());
      expect(writtenDates()).toEqual(['2026-11-11']);
      expect(markedDates()).toEqual(['2026-11-11']);
    });

    it('stops without moving the last saved date when a write fails', async () => {
      saveDailyStats.mockRejectedValueOnce(new Error('offline'));
      await watchStore().dispatch(startAutoSaveDays());
      expect(readDates()).toEqual(['2026-11-13']);
      expect(setLastSavedDate).not.toHaveBeenCalled();
    });

    it('stops when a record type could not be read', async () => {
      healthConnect.readDayRecords.mockResolvedValue({
        errors: { SleepSession: 'read_failed' },
      });
      await watchStore().dispatch(startAutoSaveDays());
      expect(saveDailyStats).not.toHaveBeenCalled();
      expect(setLastSavedDate).not.toHaveBeenCalled();
    });

    it('stops quietly when the read throws, and can run again', async () => {
      healthConnect.readDayRecords.mockRejectedValueOnce(new Error('failed'));
      const store = watchStore();
      await store.dispatch(startAutoSaveDays());
      expect(saveDailyStats).not.toHaveBeenCalled();
      await store.dispatch(startAutoSaveDays());
      expect(writtenDates()).toEqual(['2026-11-13', '2026-11-14']);
    });

    it('writes nothing when yesterday is already saved', async () => {
      getLastSavedDate.mockResolvedValue('2026-11-14');
      await watchStore().dispatch(startAutoSaveDays());
      expect(healthConnect.readDayRecords).not.toHaveBeenCalled();
      expect(saveDailyStats).not.toHaveBeenCalled();
    });

    it('runs once when started twice at the same time', async () => {
      const store = watchStore();
      await Promise.all([
        store.dispatch(startAutoSaveDays()),
        store.dispatch(startAutoSaveDays()),
      ]);
      expect(readDates()).toEqual(['2026-11-13', '2026-11-14']);
    });
  });

  describe('startLoadWeek', () => {
    const RAW_WEEK = { endDate: DATE, dates: [DATE], errors: {} };
    const WEEK = [{ date: DATE, steps: 8432, sleepMinutes: 412 }];

    beforeEach(() => {
      healthConnect.readWeekRecords.mockResolvedValue(RAW_WEEK);
      buildWeek.mockReturnValue(WEEK);
    });

    it('reads the week from Health Connect and builds it', async () => {
      const store = watchStore();
      await store.dispatch(startLoadWeek(DATE));
      expect(healthConnect.readWeekRecords).toHaveBeenCalledWith(DATE);
      expect(buildWeek).toHaveBeenCalledWith(RAW_WEEK);
      expect(store.getActions()).toEqual([
        { type: WATCH_WEEK_LOADING, endDate: DATE },
        { type: WATCH_WEEK_LOADED, endDate: DATE, week: WEEK },
      ]);
    });

    it('skips a week that is already loaded unless forced', async () => {
      const store = watchStore({
        weeks: { [DATE]: { loading: false, error: null, data: WEEK } },
      });
      await store.dispatch(startLoadWeek(DATE));
      expect(healthConnect.readWeekRecords).not.toHaveBeenCalled();
      await store.dispatch(startLoadWeek(DATE, { force: true }));
      expect(healthConnect.readWeekRecords).toHaveBeenCalledTimes(1);
    });

    it('reads nothing when Health Connect is not connected', async () => {
      const store = watchStore({ status: 'not_connected' });
      await store.dispatch(startLoadWeek(DATE));
      expect(healthConnect.readWeekRecords).not.toHaveBeenCalled();
      expect(store.getActions()).toEqual([]);
    });

    it('records an error when a record type could not be read', async () => {
      healthConnect.readWeekRecords.mockResolvedValue({
        ...RAW_WEEK,
        errors: { SleepSession: 'read_failed' },
      });
      const store = watchStore();
      await store.dispatch(startLoadWeek(DATE));
      expect(store.getActions()).toEqual([
        { type: WATCH_WEEK_LOADING, endDate: DATE },
        {
          type: WATCH_WEEK_ERROR,
          endDate: DATE,
          error: 'HEALTH_CONNECT_READ_FAILED',
        },
      ]);
      expect(buildWeek).not.toHaveBeenCalled();
    });

    it('still loads when a record type is not allowed', async () => {
      healthConnect.readWeekRecords.mockResolvedValue({
        ...RAW_WEEK,
        errors: { SleepSession: 'no_permission' },
      });
      const store = watchStore();
      await store.dispatch(startLoadWeek(DATE));
      expect(store.getActions()[1].type).toBe(WATCH_WEEK_LOADED);
    });

    it('records an error when the read throws', async () => {
      healthConnect.readWeekRecords.mockRejectedValue(new Error('failed'));
      const store = watchStore();
      await store.dispatch(startLoadWeek(DATE));
      expect(store.getActions()[1]).toEqual({
        type: WATCH_WEEK_ERROR,
        endDate: DATE,
        error: 'HEALTH_CONNECT_READ_FAILED',
      });
    });
  });

  describe('startLoadMonth', () => {
    const MONTH = '2026-10';
    const SESSIONS = [{ metadata: { id: 'run-1' } }];
    const WORKOUTS = [{ date: DATE, logId: 'run-1', type: 'Run' }];

    beforeEach(() => {
      healthConnect.readMonthSessions.mockResolvedValue({
        month: MONTH,
        exercise: SESSIONS,
        errors: {},
      });
      buildMonthWorkouts.mockReturnValue(WORKOUTS);
    });

    it("reads the month's workouts from Health Connect", async () => {
      const store = watchStore();
      await store.dispatch(startLoadMonth(MONTH));
      expect(healthConnect.readMonthSessions).toHaveBeenCalledWith(MONTH);
      expect(buildMonthWorkouts).toHaveBeenCalledWith(MONTH, SESSIONS);
      expect(store.getActions()).toEqual([
        { type: WATCH_MONTH_LOADING, month: MONTH },
        { type: WATCH_MONTH_LOADED, month: MONTH, workouts: WORKOUTS },
      ]);
    });

    it('skips a month that is already loaded unless forced', async () => {
      const store = watchStore({
        months: { [MONTH]: { loading: false, error: null, data: WORKOUTS } },
      });
      await store.dispatch(startLoadMonth(MONTH));
      expect(healthConnect.readMonthSessions).not.toHaveBeenCalled();
      await store.dispatch(startLoadMonth(MONTH, { force: true }));
      expect(healthConnect.readMonthSessions).toHaveBeenCalledTimes(1);
    });

    it('records an error when the read fails', async () => {
      healthConnect.readMonthSessions.mockResolvedValue({
        month: MONTH,
        exercise: null,
        errors: { ExerciseSession: 'read_failed' },
      });
      const store = watchStore();
      await store.dispatch(startLoadMonth(MONTH));
      expect(store.getActions()[1]).toEqual({
        type: WATCH_MONTH_ERROR,
        month: MONTH,
        error: 'HEALTH_CONNECT_READ_FAILED',
      });
    });
  });

  describe('startLoadWorkout', () => {
    const ID = 'run-1';
    const RAW_WORKOUT = {
      date: DATE,
      session: { metadata: { id: ID } },
      errors: {},
    };
    const WORKOUT = { logId: ID, type: 'Run', points: [], hasRoute: false };

    beforeEach(() => {
      healthConnect.readWorkoutRecords.mockResolvedValue(RAW_WORKOUT);
      buildWorkoutDetail.mockReturnValue(WORKOUT);
    });

    it('reads the workout from Health Connect and builds it with the date of birth', async () => {
      const store = watchStore();
      await store.dispatch(startLoadWorkout(DATE, ID));
      expect(healthConnect.readWorkoutRecords).toHaveBeenCalledWith(DATE, ID);
      expect(buildWorkoutDetail).toHaveBeenCalledWith(DATE, RAW_WORKOUT, {
        dob: DOB,
      });
      expect(store.getActions()).toEqual([
        { type: WATCH_WORKOUT_LOADING, logId: ID },
        { type: WATCH_WORKOUT_LOADED, logId: ID, workout: WORKOUT },
      ]);
    });

    it('skips a workout that is already loaded unless forced', async () => {
      const store = watchStore({
        workouts: { [ID]: { loading: false, error: null, data: WORKOUT } },
      });
      await store.dispatch(startLoadWorkout(DATE, ID));
      expect(healthConnect.readWorkoutRecords).not.toHaveBeenCalled();
      await store.dispatch(startLoadWorkout(DATE, ID, { force: true }));
      expect(healthConnect.readWorkoutRecords).toHaveBeenCalledTimes(1);
    });

    it('says the workout is gone when Health Connect no longer has it', async () => {
      healthConnect.readWorkoutRecords.mockResolvedValue({
        date: DATE,
        session: null,
        errors: {},
      });
      const store = watchStore();
      await store.dispatch(startLoadWorkout(DATE, ID));
      expect(store.getActions()).toEqual([
        { type: WATCH_WORKOUT_LOADING, logId: ID },
        { type: WATCH_WORKOUT_ERROR, logId: ID, error: 'WORKOUT_NOT_FOUND' },
      ]);
      expect(buildWorkoutDetail).not.toHaveBeenCalled();
    });

    it('records a read error when a record type could not be read', async () => {
      healthConnect.readWorkoutRecords.mockResolvedValue({
        ...RAW_WORKOUT,
        errors: { HeartRate: 'read_failed' },
      });
      const store = watchStore();
      await store.dispatch(startLoadWorkout(DATE, ID));
      expect(store.getActions()[1]).toEqual({
        type: WATCH_WORKOUT_ERROR,
        logId: ID,
        error: 'HEALTH_CONNECT_READ_FAILED',
      });
    });
  });

  describe('startCheckWatch', () => {
    it('checks Health Connect', async () => {
      healthConnect.getStatus.mockResolvedValue('available');
      healthConnect.getGranted.mockResolvedValue([
        { accessType: 'read', recordType: 'Steps' },
      ]);
      getHealthConnectDisconnected.mockResolvedValue(false);
      const store = watchStore({ status: 'unknown' });
      expect(await store.dispatch(startCheckWatch())).toBe(true);
    });
  });

  describe('selectWatchStatus', () => {
    const state = {
      device: {
        healthConnect: { status: 'connected' },
      },
    };

    it('is the Health Connect status', () => {
      expect(selectWatchStatus(state)).toBe('connected');
    });
  });
});
