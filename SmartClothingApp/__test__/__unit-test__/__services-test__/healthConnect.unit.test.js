/**
 * @file healthConnect.unit.test.js
 * The Health Connect service: status, the permission sheet, the granted
 * list, revoke and the raw reads for one day, a week of rings, a month of
 * workouts and one workout (library mocked).
 */

const load = (os = 'android') => {
  jest.resetModules();
  jest.doMock('react-native', () => ({ Platform: { OS: os } }));
  const library = require('react-native-health-connect');
  const service = require('../../../src/services/healthConnect');
  return { library, service };
};

const read = (recordType) => ({ accessType: 'read', recordType });

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

describe('getStatus', () => {
  it('is available when the SDK is available, and initializes once', async () => {
    const { library, service } = load();
    expect(await service.getStatus()).toBe('available');
    expect(await service.getStatus()).toBe('available');
    expect(library.initialize).toHaveBeenCalledTimes(1);
  });

  it('is update_needed when the provider needs an update', async () => {
    const { library, service } = load();
    library.getSdkStatus.mockResolvedValue(
      library.SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED
    );
    expect(await service.getStatus()).toBe('update_needed');
    expect(library.initialize).not.toHaveBeenCalled();
  });

  it('is unavailable when the SDK is unavailable', async () => {
    const { library, service } = load();
    library.getSdkStatus.mockResolvedValue(
      library.SdkAvailabilityStatus.SDK_UNAVAILABLE
    );
    expect(await service.getStatus()).toBe('unavailable');
  });

  it('is unavailable when the library throws', async () => {
    const { library, service } = load();
    library.getSdkStatus.mockRejectedValue(new Error('not linked'));
    expect(await service.getStatus()).toBe('unavailable');
  });

  it('is unavailable when initialize fails', async () => {
    const { library, service } = load();
    library.initialize.mockResolvedValue(false);
    expect(await service.getStatus()).toBe('unavailable');
  });

  it('is unavailable on iOS without calling the library', async () => {
    const { library, service } = load('ios');
    expect(await service.getStatus()).toBe('unavailable');
    expect(library.getSdkStatus).not.toHaveBeenCalled();
  });
});

describe('requestPermissions', () => {
  it('asks for the eight read types and past data access', async () => {
    const { library, service } = load();
    await service.requestPermissions();
    expect(library.initialize).toHaveBeenCalledTimes(1);
    expect(library.requestPermission).toHaveBeenCalledWith([
      read('Steps'),
      read('HeartRate'),
      read('RestingHeartRate'),
      read('SleepSession'),
      read('ExerciseSession'),
      read('Distance'),
      read('TotalCaloriesBurned'),
      read('Vo2Max'),
      read('ReadHealthDataHistory'),
    ]);
  });

  it('returns only the read permissions the app uses', async () => {
    const { library, service } = load();
    library.requestPermission.mockResolvedValue([
      read('Steps'),
      read('HeartRate'),
      { accessType: 'write', recordType: 'Steps' },
      read('Weight'),
    ]);
    expect(await service.requestPermissions()).toEqual([
      read('Steps'),
      read('HeartRate'),
    ]);
  });

  it('returns an empty list when nothing was allowed', async () => {
    const { service } = load();
    expect(await service.requestPermissions()).toEqual([]);
  });
});

describe('getGranted', () => {
  it('returns the granted read permissions', async () => {
    const { library, service } = load();
    library.getGrantedPermissions.mockResolvedValue([
      read('SleepSession'),
      read('BackgroundAccessPermission'),
    ]);
    expect(await service.getGranted()).toEqual([read('SleepSession')]);
  });
});

describe('revoke', () => {
  it('revokes and remembers that a restart is needed', async () => {
    const { library, service } = load();
    expect(service.isRevokePending()).toBe(false);
    await service.revoke();
    expect(library.revokeAllPermissions).toHaveBeenCalledTimes(1);
    expect(service.isRevokePending()).toBe(true);
  });

  it('is not pending when the revoke fails', async () => {
    const { library, service } = load();
    library.revokeAllPermissions.mockRejectedValue(new Error('failed'));
    await expect(service.revoke()).rejects.toThrow('failed');
    expect(service.isRevokePending()).toBe(false);
  });
});

describe('openSettings', () => {
  it('opens the Health Connect settings', () => {
    const { library, service } = load();
    service.openSettings();
    expect(library.openHealthConnectSettings).toHaveBeenCalledTimes(1);
  });
});

describe('readDayRecords', () => {
  const ALL = [
    'Steps',
    'HeartRate',
    'RestingHeartRate',
    'SleepSession',
    'ExerciseSession',
    'Distance',
    'TotalCaloriesBurned',
    'Vo2Max',
  ];
  const iso = (y, m, d, h = 0) => new Date(y, m - 1, d, h).toISOString();
  const from = (origin, extra = {}) => ({
    ...extra,
    metadata: { dataOrigin: origin },
  });

  // Granted for every type unless a test says otherwise; readRecords answers
  // per type from the map it is given.
  const setup = (byType = {}, granted = ALL) => {
    const loaded = load();
    loaded.library.getGrantedPermissions.mockResolvedValue(granted.map(read));
    loaded.library.readRecords.mockImplementation(async (type) => ({
      records: byType[type] || [],
    }));
    loaded.library.aggregateRecord.mockResolvedValue({
      COUNT_TOTAL: 8421,
      dataOrigins: ['com.google.android.apps.fitness'],
    });
    return loaded;
  };

  const filterFor = (library, type) =>
    library.readRecords.mock.calls.find(([t]) => t === type)[1]
      .timeRangeFilter;

  it('reads the local day, sleep from noon the day before, resting HR from the day before', async () => {
    const { library, service } = setup();
    const day = await service.readDayRecords('2026-11-13');

    expect(day.start).toBe(iso(2026, 11, 13));
    expect(day.end).toBe(iso(2026, 11, 14));
    expect(filterFor(library, 'HeartRate')).toEqual({
      operator: 'between',
      startTime: iso(2026, 11, 13),
      endTime: iso(2026, 11, 14),
    });
    expect(filterFor(library, 'SleepSession').startTime).toBe(
      iso(2026, 11, 12, 12)
    );
    expect(filterFor(library, 'RestingHeartRate').startTime).toBe(
      iso(2026, 11, 12)
    );
  });

  it('crosses a month boundary', async () => {
    const { service } = setup();
    const day = await service.readDayRecords('2026-10-31');
    expect(day.end).toBe(iso(2026, 11, 1));
  });

  it('takes steps from the Health Connect total', async () => {
    const { library, service } = setup();
    const day = await service.readDayRecords('2026-11-13');
    expect(library.aggregateRecord).toHaveBeenCalledWith({
      recordType: 'Steps',
      timeRangeFilter: {
        operator: 'between',
        startTime: iso(2026, 11, 13),
        endTime: iso(2026, 11, 14),
      },
    });
    expect(day.steps).toEqual({
      total: 8421,
      dataOrigins: ['com.google.android.apps.fitness'],
    });
    expect(library.readRecords).not.toHaveBeenCalledWith(
      'Steps',
      expect.anything()
    );
  });

  it('leaves the phone step counter out when a watch app also wrote steps', async () => {
    const { library, service } = setup();
    const phone = 'com.android.healthconnect.phone.abc123';
    library.aggregateRecord.mockImplementation(async (request) =>
      request.dataOriginFilter
        ? { COUNT_TOTAL: 13459, dataOrigins: ['com.fitbit.FitbitMobile'] }
        : { COUNT_TOTAL: 15230, dataOrigins: [phone, 'com.fitbit.FitbitMobile'] }
    );
    const day = await service.readDayRecords('2026-11-13');
    expect(library.aggregateRecord).toHaveBeenLastCalledWith(
      expect.objectContaining({
        recordType: 'Steps',
        dataOriginFilter: ['com.fitbit.FitbitMobile'],
      })
    );
    expect(day.steps).toEqual({
      total: 13459,
      dataOrigins: ['com.fitbit.FitbitMobile'],
    });
  });

  it('has no step total when only the phone step counter wrote steps', async () => {
    const { library, service } = setup();
    const phone = 'com.android.healthconnect.phone.abc123';
    library.aggregateRecord.mockResolvedValue({
      COUNT_TOTAL: 6206,
      dataOrigins: [phone],
    });
    const day = await service.readDayRecords('2026-11-13');
    expect(library.aggregateRecord).toHaveBeenCalledTimes(1);
    expect(day.steps).toEqual({ total: null, dataOrigins: [] });
  });

  it('has no step total when no app wrote steps', async () => {
    const { library, service } = setup();
    library.aggregateRecord.mockResolvedValue({
      COUNT_TOTAL: 0,
      dataOrigins: [],
    });
    const day = await service.readDayRecords('2026-11-13');
    expect(day.steps).toEqual({ total: null, dataOrigins: [] });
  });

  it('follows every page', async () => {
    const { library, service } = setup();
    library.readRecords.mockImplementation(async (type, options) => {
      if (type !== 'HeartRate') return { records: [] };
      if (!options.pageToken) {
        return { records: [from('a', { n: 1 })], pageToken: 'next' };
      }
      return { records: [from('a', { n: 2 })], pageToken: null };
    });
    const day = await service.readDayRecords('2026-11-13');

    const calls = library.readRecords.mock.calls.filter(
      ([t]) => t === 'HeartRate'
    );
    expect(calls).toHaveLength(2);
    expect(calls[0][1]).not.toHaveProperty('pageToken');
    expect(calls[1][1].pageToken).toBe('next');
    expect(day.heartRate.map((r) => r.n)).toEqual([1, 2]);
  });

  it('keeps only sleep that ends on the date', async () => {
    const { service } = setup({
      SleepSession: [
        from('a', {
          id: 'last night',
          startTime: iso(2026, 11, 12, 23),
          endTime: iso(2026, 11, 13, 7),
        }),
        from('a', {
          id: 'nap the day before',
          startTime: iso(2026, 11, 12, 13),
          endTime: iso(2026, 11, 12, 14),
        }),
      ],
    });
    const day = await service.readDayRecords('2026-11-13');
    expect(day.sleep.map((s) => s.id)).toEqual(['last night']);
  });

  it('splits resting heart rate into the day and the day before', async () => {
    const { service } = setup({
      RestingHeartRate: [
        from('a', { time: iso(2026, 11, 12, 6), beatsPerMinute: 58 }),
        from('a', { time: iso(2026, 11, 13, 6), beatsPerMinute: 56 }),
      ],
    });
    const day = await service.readDayRecords('2026-11-13');
    expect(day.restingHeartRate.today.map((r) => r.beatsPerMinute)).toEqual([
      56,
    ]);
    expect(
      day.restingHeartRate.previous.map((r) => r.beatsPerMinute)
    ).toEqual([58]);
  });

  it('keeps one app when two write the same type', async () => {
    const { service } = setup({
      HeartRate: [
        from('samsung', { n: 1 }),
        from('google', { n: 2 }),
        from('google', { n: 3 }),
      ],
      ExerciseSession: [from('google', { n: 4 })],
    });
    const day = await service.readDayRecords('2026-11-13');
    expect(day.heartRate.map((r) => r.n)).toEqual([2, 3]);
    expect(day.exercise.map((r) => r.n)).toEqual([4]);
  });

  it('returns records unchanged', async () => {
    const record = from('a', {
      startTime: iso(2026, 11, 13, 9),
      endTime: iso(2026, 11, 13, 10),
      exerciseType: 79,
    });
    const { service } = setup({ ExerciseSession: [record] });
    const day = await service.readDayRecords('2026-11-13');
    expect(day.exercise).toEqual([record]);
  });

  it('is null with no_permission for a type that is not granted', async () => {
    const { library, service } = setup(
      {},
      ALL.filter((t) => t !== 'HeartRate' && t !== 'Steps')
    );
    const day = await service.readDayRecords('2026-11-13');
    expect(day.heartRate).toBeNull();
    expect(day.steps).toBeNull();
    expect(day.errors).toEqual({
      HeartRate: 'no_permission',
      Steps: 'no_permission',
    });
    expect(library.readRecords).not.toHaveBeenCalledWith(
      'HeartRate',
      expect.anything()
    );
    expect(library.aggregateRecord).not.toHaveBeenCalled();
    expect(day.sleep).toEqual([]);
  });

  it('is null with read_failed for a read that throws, and the rest still load', async () => {
    const { library, service } = setup();
    library.readRecords.mockImplementation(async (type) => {
      if (type === 'SleepSession') throw new Error('SecurityException');
      return { records: [from('a', { type })] };
    });
    const day = await service.readDayRecords('2026-11-13');
    expect(day.sleep).toBeNull();
    expect(day.errors).toEqual({ SleepSession: 'read_failed' });
    expect(day.heartRate).toHaveLength(1);
    expect(day.distance).toHaveLength(1);
  });

  it('reads VO2 max from 30 days before to the end of the day', async () => {
    const record = from('a', {
      time: iso(2026, 10, 20, 8),
      vo2MillilitersPerMinuteKilogram: 46.5,
    });
    const { library, service } = setup({ Vo2Max: [record] });
    const day = await service.readDayRecords('2026-11-13');
    expect(filterFor(library, 'Vo2Max')).toEqual({
      operator: 'between',
      startTime: iso(2026, 10, 14),
      endTime: iso(2026, 11, 14),
    });
    expect(day.vo2Max).toEqual([record]);
  });

  it('is null with read_failed when the step total fails', async () => {
    const { library, service } = setup();
    library.aggregateRecord.mockRejectedValue(new Error('failed'));
    const day = await service.readDayRecords('2026-11-13');
    expect(day.steps).toBeNull();
    expect(day.errors).toEqual({ Steps: 'read_failed' });
  });
});

describe('the week, month and workout reads', () => {
  const ALL = [
    'Steps',
    'HeartRate',
    'RestingHeartRate',
    'SleepSession',
    'ExerciseSession',
    'Distance',
    'TotalCaloriesBurned',
    'Vo2Max',
  ];
  const iso = (y, m, d, h = 0, min = 0) =>
    new Date(y, m - 1, d, h, min).toISOString();
  const from = (origin, extra = {}) => ({
    ...extra,
    metadata: { dataOrigin: origin, ...(extra.metadata || {}) },
  });
  const between = (startTime, endTime) => ({
    operator: 'between',
    startTime,
    endTime,
  });

  const setup = (byType = {}, granted = ALL) => {
    const loaded = load();
    loaded.library.getGrantedPermissions.mockResolvedValue(granted.map(read));
    loaded.library.readRecords.mockImplementation(async (type) => ({
      records: byType[type] || [],
    }));
    loaded.library.aggregateRecord.mockResolvedValue({
      COUNT_TOTAL: 8421,
      dataOrigins: ['com.fitbit.FitbitMobile'],
    });
    return loaded;
  };

  const filtersFor = (library, type) =>
    library.readRecords.mock.calls
      .filter(([t]) => t === type)
      .map(([, options]) => options.timeRangeFilter);

  describe('readWeekRecords', () => {
    it('reads a step total for each of the 7 days ending at the date', async () => {
      const { library, service } = setup();
      const week = await service.readWeekRecords('2026-11-02');
      expect(week.dates).toEqual([
        '2026-10-27',
        '2026-10-28',
        '2026-10-29',
        '2026-10-30',
        '2026-10-31',
        '2026-11-01',
        '2026-11-02',
      ]);
      expect(library.aggregateRecord).toHaveBeenCalledTimes(7);
      expect(library.aggregateRecord).toHaveBeenCalledWith({
        recordType: 'Steps',
        timeRangeFilter: between(iso(2026, 10, 31), iso(2026, 11, 1)),
      });
      expect(week.steps['2026-10-27']).toBe(8421);
      expect(week.steps['2026-11-02']).toBe(8421);
    });

    it('has no steps for a day only the phone step counter counted', async () => {
      const { library, service } = setup();
      const phone = 'com.android.healthconnect.phone.abc123';
      library.aggregateRecord.mockImplementation(async (request) =>
        request.timeRangeFilter.startTime === iso(2026, 11, 10)
          ? { COUNT_TOTAL: 6206, dataOrigins: [phone] }
          : { COUNT_TOTAL: 8421, dataOrigins: ['com.fitbit.FitbitMobile'] }
      );
      const week = await service.readWeekRecords('2026-11-13');
      expect(week.steps['2026-11-10']).toBeNull();
      expect(week.steps['2026-11-11']).toBe(8421);
    });

    it('reads sleep once from noon before the first day, and no heart rate', async () => {
      const { library, service } = setup();
      await service.readWeekRecords('2026-11-13');
      expect(filtersFor(library, 'SleepSession')).toEqual([
        between(iso(2026, 11, 6, 12), iso(2026, 11, 14)),
      ]);
      expect(library.readRecords).toHaveBeenCalledTimes(1);
    });

    it('files each sleep session under the day it ends on', async () => {
      const night = from('a', {
        startTime: iso(2026, 11, 12, 23),
        endTime: iso(2026, 11, 13, 7),
      });
      const nap = from('a', {
        startTime: iso(2026, 11, 13, 14),
        endTime: iso(2026, 11, 13, 15),
      });
      const earlier = from('a', {
        startTime: iso(2026, 11, 9, 22),
        endTime: iso(2026, 11, 10, 6),
      });
      const { service } = setup({ SleepSession: [earlier, night, nap] });
      const week = await service.readWeekRecords('2026-11-13');
      expect(week.sleep['2026-11-13']).toEqual([night, nap]);
      expect(week.sleep['2026-11-10']).toEqual([earlier]);
      expect(week.sleep['2026-11-11']).toEqual([]);
    });

    it('keeps one source for a night two apps wrote', async () => {
      const times = {
        startTime: iso(2026, 11, 12, 23),
        endTime: iso(2026, 11, 13, 7),
      };
      const nap = {
        startTime: iso(2026, 11, 13, 14),
        endTime: iso(2026, 11, 13, 15),
      };
      const { service } = setup({
        SleepSession: [from('b', times), from('a', times), from('a', nap)],
      });
      const week = await service.readWeekRecords('2026-11-13');
      expect(week.sleep['2026-11-13']).toEqual([from('a', times), from('a', nap)]);
    });

    it('is null with read_failed when sleep cannot be read', async () => {
      const { library, service } = setup();
      library.readRecords.mockRejectedValue(new Error('failed'));
      const week = await service.readWeekRecords('2026-11-13');
      expect(week.sleep).toBeNull();
      expect(week.errors).toEqual({ SleepSession: 'read_failed' });
      expect(week.steps['2026-11-13']).toBe(8421);
    });

    it('has no steps with read_failed when a step total fails', async () => {
      const { library, service } = setup();
      library.aggregateRecord.mockRejectedValue(new Error('failed'));
      const week = await service.readWeekRecords('2026-11-13');
      expect(week.steps['2026-11-13']).toBeNull();
      expect(week.errors).toEqual({ Steps: 'read_failed' });
    });

    it('skips a type the athlete did not allow', async () => {
      const { library, service } = setup({}, ['Steps']);
      const week = await service.readWeekRecords('2026-11-13');
      expect(week.sleep).toBeNull();
      expect(week.errors).toEqual({ SleepSession: 'no_permission' });
      expect(library.readRecords).not.toHaveBeenCalled();
    });
  });

  describe('readMonthSessions', () => {
    it('reads the exercise sessions of the local month', async () => {
      const run = from('a', { startTime: iso(2026, 10, 10, 7) });
      const { library, service } = setup({ ExerciseSession: [run] });
      const month = await service.readMonthSessions('2026-10');
      expect(filtersFor(library, 'ExerciseSession')).toEqual([
        between(iso(2026, 10, 1), iso(2026, 11, 1)),
      ]);
      expect(month).toEqual({ month: '2026-10', exercise: [run], errors: {} });
      expect(library.readRecords).toHaveBeenCalledTimes(1);
    });

    it('crosses a year boundary', async () => {
      const { library, service } = setup();
      await service.readMonthSessions('2026-12');
      expect(filtersFor(library, 'ExerciseSession')).toEqual([
        between(iso(2026, 12, 1), iso(2027, 1, 1)),
      ]);
    });

    it('is null with read_failed when the sessions cannot be read', async () => {
      const { library, service } = setup();
      library.readRecords.mockRejectedValue(new Error('failed'));
      const month = await service.readMonthSessions('2026-10');
      expect(month.exercise).toBeNull();
      expect(month.errors).toEqual({ ExerciseSession: 'read_failed' });
    });
  });

  describe('readWorkoutRecords', () => {
    const session = from('a', {
      startTime: iso(2026, 11, 13, 17),
      endTime: iso(2026, 11, 13, 17, 30),
      metadata: { id: 'run-1' },
    });
    const other = from('a', {
      startTime: iso(2026, 11, 13, 8),
      endTime: iso(2026, 11, 13, 9),
      metadata: { id: 'walk-1' },
    });

    it('finds the session by its id', async () => {
      const { library, service } = setup({ ExerciseSession: [other, session] });
      const workout = await service.readWorkoutRecords('2026-11-13', 'run-1');
      expect(workout.session).toEqual(session);
      expect(workout.errors).toEqual({});
      expect(filtersFor(library, 'ExerciseSession')).toEqual([
        between(iso(2026, 11, 13), iso(2026, 11, 14)),
      ]);
    });

    it('reads heart rate only around the session', async () => {
      const { library, service } = setup({ ExerciseSession: [session] });
      await service.readWorkoutRecords('2026-11-13', 'run-1');
      expect(filtersFor(library, 'HeartRate')).toEqual([
        between(iso(2026, 11, 13, 16, 50), iso(2026, 11, 13, 17, 40)),
      ]);
    });

    it("reads the day's distance and calories, as the day does", async () => {
      const distance = from('a', { distance: { inMeters: 5000 } });
      const calories = from('a', { energy: { inKilocalories: 300 } });
      const { library, service } = setup({
        ExerciseSession: [session],
        Distance: [distance],
        TotalCaloriesBurned: [calories],
      });
      const workout = await service.readWorkoutRecords('2026-11-13', 'run-1');
      const day = between(iso(2026, 11, 13), iso(2026, 11, 14));
      expect(filtersFor(library, 'Distance')).toEqual([day]);
      expect(filtersFor(library, 'TotalCaloriesBurned')).toEqual([day]);
      expect(workout.distance).toEqual([distance]);
      expect(workout.totalCalories).toEqual([calories]);
    });

    it('splits resting heart rate into the day and the day before', async () => {
      const today = from('a', { time: iso(2026, 11, 13, 6), beatsPerMinute: 58 });
      const before = from('a', { time: iso(2026, 11, 12, 6), beatsPerMinute: 60 });
      const { library, service } = setup({
        ExerciseSession: [session],
        RestingHeartRate: [before, today],
      });
      const workout = await service.readWorkoutRecords('2026-11-13', 'run-1');
      expect(filtersFor(library, 'RestingHeartRate')[0].startTime).toBe(
        iso(2026, 11, 12)
      );
      expect(workout.restingHeartRate).toEqual({
        today: [today],
        previous: [before],
      });
    });

    it('has no session and reads nothing more when the id is not there', async () => {
      const { library, service } = setup({ ExerciseSession: [other] });
      const workout = await service.readWorkoutRecords('2026-11-13', 'run-1');
      expect(workout).toEqual({ date: '2026-11-13', session: null, errors: {} });
      expect(library.readRecords).toHaveBeenCalledTimes(1);
    });

    it('is null with read_failed when heart rate cannot be read', async () => {
      const { library, service } = setup();
      library.readRecords.mockImplementation(async (type) => {
        if (type === 'HeartRate') throw new Error('failed');
        return { records: type === 'ExerciseSession' ? [session] : [] };
      });
      const workout = await service.readWorkoutRecords('2026-11-13', 'run-1');
      expect(workout.heartRate).toBeNull();
      expect(workout.errors).toEqual({ HeartRate: 'read_failed' });
      expect(workout.session).toEqual(session);
    });
  });
});
