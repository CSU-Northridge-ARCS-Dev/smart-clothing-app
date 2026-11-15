/**
 * @file healthConnect.unit.test.js
 * The Health Connect service: status, the permission sheet, the granted
 * list, revoke and the raw reads for one day (library mocked).
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
  it('asks for the seven read types and past data access', async () => {
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
      read('ReadHealthDataHistory'),
    ]);
  });

  it('returns only the read permissions the app uses', async () => {
    const { library, service } = load();
    library.requestPermission.mockResolvedValue([
      read('Steps'),
      read('HeartRate'),
      { accessType: 'write', recordType: 'Steps' },
      read('Vo2Max'),
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

  it('uses the phone step counter when nothing else wrote steps', async () => {
    const { library, service } = setup();
    const phone = 'com.android.healthconnect.phone.abc123';
    library.aggregateRecord.mockResolvedValue({
      COUNT_TOTAL: 6206,
      dataOrigins: [phone],
    });
    const day = await service.readDayRecords('2026-11-13');
    expect(library.aggregateRecord).toHaveBeenCalledTimes(1);
    expect(day.steps).toEqual({ total: 6206, dataOrigins: [phone] });
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

  it('is null with read_failed when the step total fails', async () => {
    const { library, service } = setup();
    library.aggregateRecord.mockRejectedValue(new Error('failed'));
    const day = await service.readDayRecords('2026-11-13');
    expect(day.steps).toBeNull();
    expect(day.errors).toEqual({ Steps: 'read_failed' });
  });
});
