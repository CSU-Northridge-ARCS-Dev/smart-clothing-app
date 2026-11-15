/**
 * @file healthConnect.unit.test.js
 * The Health Connect service: status, the permission sheet, the granted
 * list and revoke (library mocked).
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
